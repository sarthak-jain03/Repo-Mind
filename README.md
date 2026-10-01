<p align="center">
  <h1 align="center">RepoMind</h1>
  <p align="center">
    <strong>Chat with your GitHub repositories using AI-powered code understanding</strong>
  </p>
</p>

---

RepoMind is a **RAG-powered (Retrieval-Augmented Generation) developer assistant** that connects to your GitHub account, indexes your repositories, and lets you ask natural-language questions about your codebase. Get accurate, source-referenced answers grounded in your actual code.

**Live Link: https://repomind-rho.vercel.app**

![RepoMind Landing Page](assests/homepage.png)

## Features

-  **GitHub OAuth2 Authentication** — Secure login with your GitHub account
-  **Repository Sync** — Automatically fetches and displays all your repositories
-  **Smart Indexing** — Chunks and embeds code files with real-time progress tracking
-  **AI Chat Interface** — Ask natural-language questions about your codebase
-  **Source References** — Every answer includes exact file paths and line numbers
-  **File Explorer** — Browse repository structure in a collapsible tree view
-  **Markdown Rendering** — AI responses with syntax-highlighted code blocks
-  **Copy to Clipboard** — One-click copy for AI responses
-  **Mobile Responsive** — Fully functional on mobile devices

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Core runtime |
| **Express.js** | Application framework |
| **Passport.js / JWT** | Custom OAuth2 flow + JWT authentication |
| **Sequelize** | ORM and data access |
| **PostgreSQL** | Primary database |
| **pgvector** | Vector similarity search for embeddings |
| **Fireworks.ai** | LLM (qwen3p8-max) and embeddings (nomic-embed-text-v1.5) |
| **Docker** | Containerized PostgreSQL with pgvector |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool and dev server |
| **React Router v7** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | HTTP client with interceptors |
| **Lucide React** | Icon library |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                 │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────┐    │
│  │ Landing  │  │  Dashboard   │  │   Chat   │  │   Auth    │    │
│  │  Page    │  │    Page      │  │   Page   │  │ Callback  │    │
│  └──────────┘  └──────────────┘  └──────────┘  └───────────┘    │
│                    Axios + JWT Token                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
┌────────────────────────────┴────────────────────────────────────┐
│                    Backend (Node.js + Express)                  │
│                                                                 │
│  ┌─────────────────────── Routes ───────────────────────────┐   │
│  │     auth.js      │     github.js     │      chat.js      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                   │
│  ┌─────────────────────── Services ─────────────────────────┐   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐   │   │
│  │  │ githubService│  │indexingService│  │  chatService  │  │   │
│  │  │  (API calls) │  │ (async index) │  │ (orchestrate) │  │   │
│  │  └──────────────┘  └──────┬───────┘  └───────┬───────┘   │   │
│  │                           │                   │          │   │
│  │  ┌──────────────┐  ┌─────┴──────┐  ┌────────┴───────┐    │   │
│  │  │ codeChunker  │  │ embedding  │  │   ragService   │    │   │
│  │  │ (split code) │  │  Service   │  │(retrieve+gen)  │    │   │
│  │  └──────────────┘  └────────────┘  └────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────── Security Layer ──────────────────────────┐   │
│  │      Custom OAuth2 Callback → JWT generation → auth.js   │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────┴────────┐          ┌────────┴────────┐
     │   PostgreSQL    │          │  Fireworks.ai   │
     │   + pgvector    │          │   (LLM + Embed) │
     │                 │          │                 │
     │ • users         │          │ • Chat API      │
     │ • repositories  │          │ • Embeddings API│
     │ • code_chunks   │          │                 │
     │ • chat_messages │          │                 │
     └─────────────────┘          └─────────────────┘
```

### RAG Pipeline Flow

```
User Question
      │
      ▼
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│  Generate   │────▶│  pgvector    │────▶│  Top-8 Code    │
│  Embedding  │     │  Similarity  │     │  Chunks        │
│  (query)    │     │  Search      │     │  Retrieved     │
└─────────────┘     └──────────────┘     └───────┬────────┘
                                                  │
                                                  ▼
                                         ┌────────────────┐
                                         │  Build Context │
                                         │  + System      │
                                         │  Prompt        │
                                         └───────┬────────┘
                                                  │
                                                  ▼
                                         ┌────────────────┐
                                         │  LLM Chat      │
                                         │  Completion    │
                                         │  (Fireworks)   │
                                         └───────┬────────┘
                                                  │
                                                  ▼
                                         ┌────────────────┐
                                         │  Response +    │
                                         │  Source Refs   │
                                         └────────────────┘
```

## Screenshots

### Landing Page & Login
![Landing Page](assests/homepage.png)
![Login Screen](assests/loginscreen.png)

### Dashboard
![Dashboard — Repository List](assests/repos.png)

### Indexing Progress
![Indexing a Repository](assests/indexing.png)
![Indexed](assests/indexed.png)

### Chat Interface
![Chat with Codebase](assests/chatscreen.png)
![User Query](assests/userquery.png)

### Output Highlights
![Output 1](assests/output1.png)
![Output 2](assests/output2.png)
![Output 3](assests/output3.png)


## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Docker** (for local PostgreSQL with pgvector)
- **GitHub OAuth App** (for authentication)
- **Fireworks.ai API Key** (for LLM and embeddings)


### 1. Clone the Repository

```bash
git clone https://github.com/sarthak-jain03/RepoMind.git
cd RepoMind
```

### 2. Set Up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set:
   - **Application name**: `RepoMind`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:8080/login/oauth2/code/github`
4. Note down the **Client ID** and **Client Secret**

### 3. Get Fireworks.ai API Key

1. Sign up at [fireworks.ai](https://fireworks.ai)
2. Navigate to API Keys and create a new key

### 4. Start the Database

```bash
cd backend
docker-compose up -d
```

This starts a PostgreSQL 16 instance with the pgvector extension enabled.


### 5. Configure Backend

Create or update `backend/.env`:

```env
# Database configuration
DATABASE_URL=postgres://repomind:repomind123@localhost:5432/repomind

# GitHub OAuth2
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT Authentication
JWT_SECRET=your_jwt_secret_at_least_64_characters_long
JWT_EXPIRATION_MS=86400000

# Fireworks AI
FIREWORKS_API_KEY=your_fireworks_api_key

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
```

### 6. Run the Backend

```bash
cd backend
npm install
npm run dev
```

The backend starts on `http://localhost:8080`.

### 7. Configure Frontend

Create or update `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 8. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

### 9. Use the App

1. Open `http://localhost:5173`
2. Click **Continue with GitHub** to authenticate
3. Select a repository from your dashboard
4. Click **Index Repository** and wait for indexing to complete
5. Click **Chat with Codebase** and start asking questions!

## Project Structure

```
RepoMind/
├── backend/
│   ├── .env                     # Environment configuration
│   ├── package.json             # NPM dependencies
│   ├── schema.sql               # PostgreSQL pgvector init script
│   ├── src/
│   │   ├── index.js             # Main Express server entry point
│   │   ├── config/              # Database, CORS, and JWT configurations
│   │   ├── middleware/          # Express middleware (Auth, Error handling)
│   │   ├── models/              # Sequelize models (User, Repository, CodeChunk, ChatMessage)
│   │   ├── routes/              # API Endpoints (Auth, GitHub, Chat)
│   │   └── services/            # Core business logic:
│   │       ├── githubService.js # GitHub REST API integration
│   │       ├── indexingService.js # Async repo indexing pipeline
│   │       ├── codeChunker.js   # Code splitting with overlap
│   │       ├── embeddingService.js # Fireworks.ai API calls (with retry logic)
│   │       ├── vectorStoreService.js # pgvector search abstraction
│   │       ├── ragService.js    # RAG pipeline (retrieve + generate)
│   │       └── chatService.js   # Chat orchestration + persistence
│   └── docker-compose.yml       # PostgreSQL + pgvector container
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Root + routing + ProtectedRoute
    │   ├── components/          # UI Components
    │   ├── pages/               # Dashboard, Chat, Landing Page
    │   └── services/            # Axios API clients
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/oauth2/authorization/github` | Initiate GitHub OAuth2 login |
| `GET` | `/login/oauth2/code/github` | OAuth callback |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `GET` | `/api/auth/validate` | Validate JWT token |

### Repositories
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/github/repos` | List user's GitHub repositories |
| `POST` | `/api/github/repos/:id/index` | Start indexing a repository |
| `GET` | `/api/github/repos/:id/index/status` | Get indexing progress |
| `GET` | `/api/github/repos/:id/tree` | Get repository file tree |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message (body: `{ repoId, message }`) |
| `GET` | `/api/chat/history/:repoId` | Get chat history for a repository |


## How It Works

1. **Authenticate** — User logs in via GitHub OAuth2. Backend performs manual code exchange and generates a JWT containing the GitHub access token.

2. **Sync Repositories** — Backend fetches the user's repos from GitHub API and stores them in the database using Sequelize.

3. **Index Repository** — When triggered:
   - Fetches the file tree using GitHub's Git Trees API
   - Filters for code files (skips binaries, `node_modules`, etc.)
   - Fetches each file's content and splits it into overlapping chunks (~1500 chars)
   - Generates 768-dimensional embeddings via Fireworks.ai (nomic-embed-text-v1.5)
   - Stores chunks + embeddings in PostgreSQL with pgvector using raw SQL

4. **Chat with Code** — When the user asks a question:
   - Generates an embedding of the question
   - Performs cosine similarity search against stored code chunks (top-8)
   - Builds a context prompt with the retrieved code snippets
   - Sends to Fireworks.ai LLM (qwen3p8-max) with strict grounding rules
   - Returns the answer with source file references

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author
- Sarthak Jain
- Email: sarthakjain4452@gmail.com
