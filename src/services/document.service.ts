import { IndexList, Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import "dotenv/config";

interface DocumentChunk {
    pageContent: string;
}

interface EmbeddingVector {
    id: string;
    values: number[];
    metadata: {
        content: string;
        document_id: string;
    };
}

interface ProcessedDocument {
    splittedDocuments: DocumentChunk[];
    embeddedChunks: number[][];
}

/**
 * This service handles the processing and uploading of documents to Pinecone.
 * It ensures that the index exists, processes the document, creates embeddings, and upserts them into Pinecone.
 * It also handles the updating of existing documents.
 */
class PineconeDocumentService {
    private readonly pinecone: Pinecone;
    private readonly indexName: string;
    private readonly embeddings: OpenAIEmbeddings;
    private readonly textSplitter: RecursiveCharacterTextSplitter;

    constructor() {
        const apiKey = process.env.PINECONE_API_KEY;
        if (!apiKey) {
            throw new Error('Pinecone API key is not configured');
        }

        this.pinecone = new Pinecone({
            apiKey,
            maxRetries: 5,
        });
        
        this.indexName = "strategyn-knowledge-base";
        this.embeddings = new OpenAIEmbeddings();
        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 300,
            separators: ["\n\n", "\n", " ", ""],
            chunkOverlap: 40,
        });
    }

    public async processAndUploadDocument(
        content: string,
        documentId: string
    ): Promise<void> {
        try {
            await this.ensureIndexExists();
            
            const { splittedDocuments, embeddedChunks } = await this.processDocument(content);
            const embeddings = this.createEmbeddingVectors(splittedDocuments, embeddedChunks, documentId);
            
            await this.pinecone.Index(this.indexName).upsert(embeddings);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to process and upload document: ${errorMessage}`);
        }
    }

    public async updateDocument(documentId: string, newContent: string): Promise<void> {
        try {
            const index = this.pinecone.Index(this.indexName);
            const existingVectors = await index.listPaginated({ prefix: documentId });

            if (existingVectors.vectors) {
                await Promise.all(
                    existingVectors.vectors.map(vector => 
                        vector.id && index.deleteOne(vector.id)
                    )
                );
            }

            await this.processAndUploadDocument(newContent, documentId);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to update document: ${errorMessage}`);
        }
    }

    private async processDocument(content: string): Promise<ProcessedDocument> {
        const splittedDocuments = await this.textSplitter.createDocuments([content]);
        const sanitizedDocuments = splittedDocuments.map(doc => ({
            pageContent: doc.pageContent.replace(/\n/g, '')
        }));

        const embeddedChunks = await this.embeddings.embedDocuments(
            sanitizedDocuments.map(doc => doc.pageContent)
        );

        return { splittedDocuments: sanitizedDocuments, embeddedChunks };
    }


    private createEmbeddingVectors(
        documents: DocumentChunk[],
        embeddings: number[][],
        documentId: string
    ): EmbeddingVector[] {
        return documents.map((doc, index) => ({
            id: `${documentId}-${index}`,
            values: embeddings[index],
            metadata: {
                content: doc.pageContent,
                document_id: documentId
            }
        }));
    }

    private async ensureIndexExists(): Promise<void> {
        const exists = await this.checkIndexExists();
        
        if (!exists) {
            await this.pinecone.createIndex({
                name: this.indexName,
                dimension: 1536,
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            });
        }
    }

    private async checkIndexExists(): Promise<boolean> {
        try {
            const existingIndexes: IndexList = await this.pinecone.listIndexes();
            return existingIndexes.indexes?.some(index => index.name === this.indexName) ?? false;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to check index existence: ${errorMessage}`);
        }
    }
}

export const pineconeService = new PineconeDocumentService();