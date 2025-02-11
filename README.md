# Technical Assesment - RAG Application

A basic Retrieval-Augmented Generation (RAG) application using **TypeScript, Express, MongoDB, and Pinecone**.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/)

### Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/your-repo/rag-app-typescript.git
cd rag-app-typescript
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
PINECONE_API_KEY=your_pinecone_api_key
OPENAI_API_KEY=your_openai_api_key
BRAVE_SEARCH_API_KEY=your_brave_search_api_key
```

## Running the Application

### Development Mode

Runs the server with **nodemon** (auto-restarts on changes):

```sh
npm run dev
```

### Start Server

Runs the server normally with `ts-node`:

```sh
npm start
```

### Build & Run

Compile TypeScript to JavaScript and run:

```sh
npm run build
node dist/server.js
```

## Project Details

### APIs
**Ingest Document API**
This API processes files (.pdf, .txt, .docx) by generating a content hash and checking if the document already exists in our vector database. This prevents duplicate ingestion. The content is then split into chunks using **RecursiveTextSplitter** from **LangChain**. Each chunk is converted into embeddings via **OpenAI**, and both the embeddings and metadata are stored in **Pinecone**. The metadata includes a reference document ID from our database, making updates and deletions more efficient.

**Reingest Document API**
This API allows reprocessing of a document using its ID. When a document is updated or modified, the previous chunks in vectorDB are removed, and the new version is ingested, ensuring the latest content is always available.

**Query API**
This API takes a user query and retrieves the most relevant information from the vectorDB using Retrieval-Augmented Generation (RAG) powered by LangChain. Additionally, it integrates the Brave Search API to fetch relevant data from the internet, enhancing the quality of responses.

### Error Handling

It uses a structured approach to error handling with custom error classes and a centralized middleware to manage errors consistently.

Custom Error Classes that extend the BaseError class to standardize error messages, status codes, and response formats.

Error Handling Middleware
We use an Express middleware, errorHandler, to catch and process all errors in a unified format.

The error middleware logs error details, including the request path and method, using the logger utility.
Checks if the error is an instance of BaseError and responds with the appropriate status code and structured JSON response.
If the error is not explicitly handled, it defaults to a 500 Internal Server Error response.

### Logging and Query Tracking
The application uses Winston for logging system events and errors, along with a dedicated query logging service to store query-related logs in the database.

**Application Logging with Winston**

Logging is implemented using Winston, providing structured and configurable logging for debugging and monitoring.

Uses a custom log format that includes timestamps and metadata for better readability.
Categorizes logs based on workflow type for better organization.
Log Categories

**Knowledge Base Logs (logKnowledgeBase)** – Tracks retrieval from the internal knowledge base.

**Model Response Logs (logModelResponse)** – Logs model-generated responses.

**External Search Logs (logExternalSearch)** – Captures API queries to external search sources.

**Error Logs (logError)** – Stores application errors.

**Debug & Info Logs (logDebug, logInfo, logVerbose)** – Helps track internal operations at different verbosity levels.

**Query Logging in Database**

A dedicated QueryLogger service stores structured logs in a database for debugging and optimizing query workflows.

Logs queries based on their source (knowledge base, model, or external search).
Stores metadata, including retrieved chunks, search results, and error messages for analysis.
Provides filtering options to retrieve logs efficiently for debugging and pipeline improvement.

**Logged Query Types**

**Knowledge Base Queries:** Logs retrieved chunks and their similarity scores.

**Model Queries:** Tracks model name, response text, and token usage.

**Search API Queries:** Stores external search results, including URLs and snippets.

## API Endpoints

### Document Endpoints

/api/document - GET - Get all documents
/api/document/ingest - POST - Ingest a new document
/api/document/reingest/:documentId - POST - Reingest an existing document

### Query Endpoints

/api/query - POST - Query the RAG application

### Root Endpoint

```http
GET /
```

**Response:**

```json
{
  "message": "Welcome to basic RAG App. Contact at hamza.io@hotmail.com for support."
}
```

## 📦 Dependencies

- **Express** - Web framework
- **Mongoose** - MongoDB ORM
- **Pinecone** - Vector database
- **LangChain** - AI-driven workflows
- **OpenAI** - AI embeddings
- **Brave Search API** - Web search API

## ✨ Author

Developed by **Ameer Hamza**. For support, contact [**hamza.io@hotmail.com**](mailto:hamza.io@hotmail.com).

## 📜 License

This project is licensed under the ISC License.

## 📚 References

- [LangChain](https://langchain.js.org/)
- [Pinecone](https://www.pinecone.io/)
- [OpenAI](https://platform.openai.com/docs/guides/retrieval-augmented-generation)
- [Brave Search API](https://docs.search.brave.com/)
