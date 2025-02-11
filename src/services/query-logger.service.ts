import { KnowledgeBaseLogEntry, ModelLogEntry, SearchAPILogEntry, LogEntry } from '../types/logs.types';
import LogModel from '../models/query-log.model';

/**
 * This service provides methods to save query logs to the database along with its metadata.
 * Its helpful for debugging and tracking the queries and to decide on how to improve the RAG pipeline.
 */
class QueryLogger {

    private static instance: QueryLogger;
    
    private constructor() {}
    
    public static getInstance(): QueryLogger {
      if (!QueryLogger.instance) {
        QueryLogger.instance = new QueryLogger();
      }
      return QueryLogger.instance;
    }
    
    public async logKnowledgeBaseQuery(
      queryText: string,
      chunks: KnowledgeBaseLogEntry['retrievedChunks'],
      success: boolean = true,
      error?: string
    ): Promise<void> {
      
      const logEntry: KnowledgeBaseLogEntry = {
        type: 'knowledge_base',
        queryText,
        retrievedChunks: chunks,
        success,
        errorMessage: error
      };
      
      await new LogModel(logEntry).save();
    }
    
    public async logModelQuery(
      queryText: string,
      modelName: string,
      responseText: string,
      success: boolean = true,
      error?: string
    ): Promise<void> {
      
      const logEntry: ModelLogEntry = {
        type: 'model_only',
        queryText,
        modelName,
        success,
        responseText,
        errorMessage: error
      };
      
      await new LogModel(logEntry).save();
    }
    
    public async logSearchQuery(
      queryText: string,
      searchResults: SearchAPILogEntry['searchResults'],
      success: boolean = true,
      error?: string
    ): Promise<void> {
      
      const logEntry: SearchAPILogEntry = {
        type: 'external_search',
        queryText,
        searchResults,
        success,
        errorMessage: error
      };
      
      await new LogModel(logEntry).save();
    }
    
    public async getLogs(filter: Record<string, any> = {}): Promise<LogEntry[]> {
      return LogModel.find(filter).sort({ timestamp: -1 }).exec();
    }
  }
  
  export default QueryLogger;