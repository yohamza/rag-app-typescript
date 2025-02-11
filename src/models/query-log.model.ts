import mongoose, { Schema } from 'mongoose';
import { LogEntry } from '../types/logs.types';

// This schema defines the structure of our query logs in the database.
const logEntrySchema = new Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['knowledge_base', 'model_only', 'external_search']
  },
  queryText: { 
    type: String, 
    required: true 
  },
  success: { 
    type: Boolean, 
    required: true 
  },
  errorMessage: { 
    type: String 
  },
  
  // Knowledge base specific fields
  retrievedChunks: [{
    content: String,
    similarity: Number,
    metadata: Schema.Types.Mixed
  }],
  
  // Model specific fields
  modelName: String,
  promptTokens: Number,
  completionTokens: Number,
  
  // Search API specific fields
  searchQuery: String,
  searchResults: [{
    url: String,
    title: String,
    snippet: String
  }]
}, { timestamps: true });

// Create model for our log entries
const LogModel = mongoose.model<LogEntry>('QueryLog', logEntrySchema);

export default LogModel;