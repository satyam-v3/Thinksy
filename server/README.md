<h1 align="center">⚙️ Thinksy Backend</h1>

<div align="center">

**AI-Powered RAG Engine for Thinksy**

Backend service responsible for authentication, PDF ingestion, semantic retrieval, vector search, streaming AI responses, and learning artifact generation.

<p align="center">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express" alt="Express" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB Atlas" />
</p>

</div>

---

## 🧠 Overview

The Thinksy Backend powers the complete Retrieval-Augmented Generation (RAG) workflow. It orchestrates the flow of data between the user, the database, and the AI models.

**It handles:**
* User Authentication (JWT)
* PDF Upload & Processing
* Cloudinary Storage
* Semantic Chunking
* Hugging Face Embeddings
* MongoDB Atlas Vector Search
* Gemini 2.5 Flash Generation
* Streaming Responses (SSE)
* Flashcard & Quiz Generation

---

## 🏗 Backend Architecture

```text
Client Request
      │
      ▼
Express API
      │
      ├── Authentication Layer
      │
      ├── PDF Processing Pipeline
      │
      ├── Vector Search Engine
      │
      ├── Learning Tools
      │
      └── AI Generation Layer
      │
      ▼
MongoDB Atlas
      │
      ▼
Gemini 2.5 Flash
```

---

## 🔄 PDF Ingestion Pipeline

When a user uploads a PDF, the backend executes a highly optimized ingestion pipeline to prepare the text for semantic search.

```text
PDF Upload
    │
    ▼
Multer Memory Buffer
    │
    ▼
Cloudinary Upload
    │
    ▼
PDF Text Extraction
    │
    ▼
Semantic Chunking
    │
    ▼
Hugging Face Embeddings
    │
    ▼
MongoDB Atlas Storage
```

### Key Features

* Paragraph-aware chunking
* Sliding-window overlap
* Batch embedding generation
* User-isolated storage
* Cloud-native architecture

---

## 🔎 Retrieval Pipeline

When a user asks a question, the system retrieves the most relevant knowledge before asking the AI to answer.

```text
User Query
    │
    ▼
Query Embedding
    │
    ▼
MongoDB Atlas Vector Search
    │
    ▼
Top-K Relevant Chunks
    │
    ▼
Prompt Construction
    │
    ▼
Gemini 2.5 Flash
    │
    ▼
Streaming Response
```

### Retrieval Characteristics

* Dense vector retrieval
* Cosine similarity search
* User-level isolation
* Active document filtering
* Citation-aware context building

---

## 🔐 Authentication

Authentication is implemented statelessly using JSON Web Tokens (JWT).

### Protected Resources
* PDF Uploads
* Chat & Query Endpoints
* Learning Tools Generation
* User Document Retrieval
* Vector Search Operations

### Authentication Flow
```text
Register / Login
    │
    ▼
Hash Password (bcryptjs)
    │
    ▼
Store/Verify User (MongoDB)
    │
    ▼
Generate JWT
    │
    ▼
Authorized Requests
```

---

## 🗄 Database Design

### User Collection

```js
{
  _id,
  name,
  email,
  password,
  createdAt
}
```

### Chunk Collection

```js
{
  _id,
  userId,
  source,
  text,
  embedding,
  createdAt
}
```

### Why MongoDB Atlas?

* Native Vector Search
* Single Database Architecture
* User Metadata Storage
* Production Scalability
* Reduced Operational Complexity

---

## 🌊 Streaming Architecture

Thinksy uses Server-Sent Events (SSE) for token streaming.

```text
Gemini
   │
   ▼
Backend Stream
   │
   ▼
SSE Connection
   │
   ▼
Frontend Renderer
```

Benefits:

* Lower latency
* Better user experience
* Real-time answer generation
* Reduced perceived response time

---

## 🛠 Environment Variables

Create:

```env
server/.env
```

```env
PORT=4000

NODE_ENV=development

MONGODB_URI=

JWT_SECRET=

OPENROUTER_API_KEY=

CHAT_MODEL=google/gemini-2.5-flash

HF_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🚀 Running Locally

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Type Checking

```bash
npm run typecheck
```

### Production Build

```bash
npm run build
npm start
```

---

## 🔌 API Reference

Base URL:

```text
/api/v1
```

### Authentication

| Method | Endpoint       | Description   |
| ------ | -------------- | ------------- |
| POST   | /auth/register | Register User |
| POST   | /auth/login    | Login User    |

### PDF Processing

| Method | Endpoint    | Description    |
| ------ | ----------- | -------------- |
| POST   | /pdf/upload | Upload PDF     |
| GET    | /pdf/list   | List User PDFs |

### Chat

| Method | Endpoint     | Description          |
| ------ | ------------ | -------------------- |
| POST   | /chat/query  | Standard Completion  |
| POST   | /chat/stream | Streaming Completion |

### Learning Tools

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | /flashcards/generate | Generate Flashcards |
| POST   | /quiz/generate       | Generate Quiz       |

---

## 📂 Server Structure

```text
server
│
├── src
│   ├── config
│   ├── controllers
│   ├── jobs
│   ├── lib
│   │   ├── ai
│   │   └── vectorstore
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── types
│   └── utils
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗺 Future Improvements

* Hybrid Search (BM25 + Dense Retrieval)
* Redis + BullMQ Processing Queues
* OCR Support for Scanned PDFs
* Multi-Modal Document Understanding
* Maximum Marginal Relevance (MMR)
* Background Learning Artifact Generation

---

## 👨‍💻 Maintainer

**Satyam Kumar**

* GitHub: https://github.com/satyam-v3
* Project: https://github.com/satyam-v3/Thinksy

---

### 🧠 Built for reliable, explainable, and source-grounded AI learning experiences.