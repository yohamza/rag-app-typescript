// Interfaces to define our log entry structures
export interface BaseLogEntry {
    queryText: string;
    success: boolean;
    errorMessage?: string;
  }
  
export interface KnowledgeBaseLogEntry extends BaseLogEntry {
    type: 'knowledge_base';
    retrievedChunks: {
      content: string;
      similarity: number;
      metadata?: Record<string, any>;
    }[];
  }
  
export interface ModelLogEntry extends BaseLogEntry {
    type: 'model_only';
    modelName: string;
    responseText: string;
  }
  
export interface SearchAPILogEntry extends BaseLogEntry {
    type: 'external_search';
    searchResults: {
      url: string;
      title: string;
      description: string;
    }[];
  }
  
// Union type for all possible log entry types
export type LogEntry = KnowledgeBaseLogEntry | ModelLogEntry | SearchAPILogEntry;
  