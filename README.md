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
git clone https://github.com/your-repo/assignment-strategyn.git
cd assignment-strategyn
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
