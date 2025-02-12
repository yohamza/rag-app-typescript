import axios, { AxiosError } from 'axios';
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from '@pinecone-database/pinecone';
import { getAICompletion } from '../utils/ai-completion';
import {
    SearchResult,
    SearchResponse,
    VectorQueryResult,
    QueryOptions
} from '../types/query.types';
import QueryLogger from './query-logger.service';
import logger from '../utils/logger';
import { NotFoundError } from '../types/errors.types';

enum ContextSource {
    VECTOR_DB = "vectorDB",
    LLM = "llm",
    INTERNET_SEARCH = "internetSearch",
    NONE = 'none'
}

/**
 * This service handles the query execution and logging. It decides the workflow of the query.
 * It also handles the formatting of the results and the error handling and prepares the results for the LLM.
 */
export class QueryService {
    private readonly pinecone: Pinecone;
    private readonly embeddings: OpenAIEmbeddings;
    private readonly indexName: string;
    private readonly defaultOptions: QueryOptions = {
        useVectorStore: true,
        useInternet: true,
        useLLM: true,
        minScore: 0.85,
        topK: 10
    };
    private readonly logger = QueryLogger.getInstance();
    private contextSource: ContextSource;

    constructor() {
        const apiKey = process.env.PINECONE_API_KEY;
        const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;

        if (!apiKey) {
            throw new Error('Pinecone API key is not configured');
        }
        if (!braveApiKey) {
            throw new Error('Brave Search API key is not configured');
        }

        this.contextSource = ContextSource.NONE;
        this.pinecone = new Pinecone({ apiKey });
        this.embeddings = new OpenAIEmbeddings({ model: "text-embedding-ada-002" });
        this.indexName = "strategyn-knowledge-base";
    }

    public async performQuery(
        query: string,
        options: Partial<QueryOptions> = {}
    ): Promise<{contextText: string, contextSource: ContextSource}> {
        const mergedOptions = { ...this.defaultOptions, ...options };

        try {
            // Execute enabled queries in parallel
            logger.logInfo("Performing query on vector store to retrieve context", { query });
            let contextText: string = await this.queryVectorStore(query, mergedOptions);

            if (!contextText) {
                logger.logInfo("No relevant chunks found. Checking if OpenAI can answer directly...");

            const openAIResponse = await getAICompletion(
                `Can you answer this question without any external information? Respond with only 'yes' or 'no': ${query}`
            );
            const canAnswerDirectly = openAIResponse.choices[0].message.content?.trim().toLowerCase() === 'yes';

            if (canAnswerDirectly) {
                this.contextSource = ContextSource.LLM;
                logger.logInfo("LLM can answer directly. Asking LLM...");
                contextText = await this.queryLLM(query);
            } else {
                this.contextSource = ContextSource.INTERNET_SEARCH;
                logger.logInfo("Query requires external search. Searching the web...");
                contextText = await this.queryInternet(query);
            }
            }

            if (this.contextSource === ContextSource.NONE || contextText === '') {
                throw new NotFoundError("No relevant context found. We couldn't find an answer for your question in the knowledge base, AI model, or external sources.");
            }

            return { contextText, contextSource: this.contextSource };
        } catch (error) {
            this.handleQueryError(error);
            return { contextText: '', contextSource: ContextSource.NONE };
        }
    }

    private async queryVectorStore(
        query: string,
        options: QueryOptions
    ): Promise<string> {
        try {
            const embeddedQuery = await this.embeddings.embedQuery(query);
            const index = this.pinecone.Index(this.indexName);

            const response: VectorQueryResult = await index.query({
                vector: embeddedQuery,
                topK: options.topK || 10,
                includeMetadata: true,
            });

            const formattedResults = this.formatVectorResults(response, options.minScore || 0.85);

            await this.logger.logKnowledgeBaseQuery(
                query,
                [
                  {
                    content: formattedResults,
                    similarity: options.minScore || 0.85,
                    metadata: { source: ContextSource.VECTOR_DB, chunks: response.matches.map(match => match.metadata) }
                  }
                ]
              );
            this.contextSource = ContextSource.VECTOR_DB;

            logger.logKnowledgeBase("Got context from vector store.", { query, context: formattedResults });

            return formattedResults;
        } catch (error) {
            this.handleQueryError(error, 'Vector store query failed');
            return '';
        }
    }

    private async queryInternet(query: string): Promise<string> {
        try {
            const searchResults = await this.fetchSearchResults(query);
            if (!searchResults?.length) {
                return '';
            }

            await this.logger.logSearchQuery(
                query,
                searchResults
              );

            logger.logExternalSearch("Got search results. Formatting for response...", { query, results: searchResults });

            const formattedResults = this.formatSearchResults(searchResults);
            
            return `External Search Results:\n${formattedResults}`;
        } catch (error) {
            this.handleQueryError(error, 'Internet query failed');
            return '';
        }
    }

    private async queryLLM(query: string): Promise<string> {
        try {
            const response = await getAICompletion(query);

            const responseText = response.choices[0].message.content || '';

            await this.logger.logModelQuery(
                query,
                "gpt-4-turbo-preview",
                responseText
              );

            logger.logModelResponse("Got response from LLM.", { query, response: responseText });

            return responseText;
        } catch (error) {
            this.handleQueryError(error, 'LLM query failed');
            return '';
        }
    }

    private async fetchSearchResults(query: string): Promise<SearchResult[]> {
        try {
            const response = await axios.get<SearchResponse>(
                'https://api.search.brave.com/res/v1/web/search',
                {
                    headers: {
                        'Accept': '*/*',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY,
                        'Cache-Control': 'no-cache',
                    },
                    params: { q: query }
                }
            );

            //Taking the first 5 results for shorter context window
            const searchResults = response.data.web.results.slice(0, 5).map(result => ({
                url: result.url,
                title: result.title,
                description: result.description
            }));

            return searchResults;
        } catch (error) {
            this.handleQueryError(error, 'Brave Search API request failed');
            return [];
        }
    }

    private formatVectorResults(
        results: VectorQueryResult,
        minScore: number = 0.85
    ): string {
        return results.matches
            .filter(match => (match.score || 0) > minScore)
            .map(match => match.metadata?.content?.trim() || '')
            .filter(content => content)
            .join('---\n');
    }

    private formatSearchResults(results: SearchResult[]): string {
        return results
            .map(result => 
                `Title: ${result.title}\nURL: ${result.url}\nSummary: ${result.description}`
            )
            .join('\n\n');
    }

    private handleQueryError(error: unknown, context: string = 'Query error'): void {
        if (error instanceof AxiosError) {
            logger.logError(`${context}: ${error.message}`, {
                status: error.response?.status,
                data: error.response?.data
            });
        } else if (error instanceof Error) {
            logger.logError(`${context}: ${error.message}`);
        } else {
            logger.logError(`${context}: Unknown error occurred`);
        }
    }
}

export const queryService = new QueryService();