# Email Productivity Agent - Backend

Python FastAPI backend for the Email Productivity Agent system.

## Setup

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Configure Environment**
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit `.env` and configure your LLM:

**Option A: Use Ollama (Local, Recommended)**
```bash
USE_OLLAMA=1
OLLAMA_MODEL=llama3.2:latest
OLLAMA_BASE_URL=http://localhost:11434
```

Make sure Ollama is running locally with llama3.2:
```bash
ollama run llama3.2:latest
```

**Option B: Use Google Gemini API**
```bash
USE_OLLAMA=0
GEMINI_API_KEY=your_actual_api_key_here
```

3. **Run the Server**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Endpoints

- `GET /api/emails` - Get all emails
- `POST /api/emails/upload` - Upload custom email JSON
- `POST /api/categorize-all` - Categorize all emails
- `POST /api/extract-actions` - Extract action items
- `POST /api/generate-reply` - Generate email reply
- `POST /api/chat` - Chat with email agent
- `GET /api/prompts` - Get current prompts
- `POST /api/prompts/update` - Update a prompt

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
├── models/
│   └── schemas.py         # Pydantic models
├── services/
│   ├── llm_service.py     # Google Gemini integration
│   └── prompt_service.py  # Prompt management
└── data/
    ├── mock_emails.json   # Sample emails
    └── prompts.json       # Custom prompts (auto-generated)
```
