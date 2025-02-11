export interface SearchResult {
    title: string;
    url: string;
    description: string;
}

export interface SearchResponse {
    web: {
        results: SearchResult[];
    };
}

export interface VectorQueryResult {
    matches: Array<{
        id: string;
        score?: number;
        metadata?: {
            content?: string;
            source?: string;
            [key: string]: any;
        };
    }>;
}

export interface QueryOptions {
    useVectorStore?: boolean;
    useInternet?: boolean;
    useLLM?: boolean;
    minScore?: number;
    topK?: number;
}