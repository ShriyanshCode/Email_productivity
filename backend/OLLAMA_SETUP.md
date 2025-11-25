# LLM Backend Update - Ollama Support

## Changes Made

### 1. Updated Dependencies (`requirements.txt`)
Added LangChain and Ollama support:
```
langchain-ollama==0.2.0
langchain-core==0.3.28
```

### 2. Environment Configuration (`.env.example`)
Added new configuration flag:
```bash
# Set to 1 to use Ollama (local), 0 to use Google Gemini API
USE_OLLAMA=1

# Ollama Configuration
OLLAMA_MODEL=llama3.2:latest
OLLAMA_BASE_URL=http://localhost:11434
```

### 3. LLM Service (`services/llm_service.py`)
- Added conditional imports based on `USE_OLLAMA` flag
- Modified `__init__` to initialize either Ollama or Gemini client
- Updated `_generate_content` to route requests to the appropriate model
- All other methods (categorize, extract actions, generate reply, etc.) remain unchanged

## How to Use

### Setup with Ollama (Recommended)

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Create `.env` file:**
```bash
USE_OLLAMA=1
OLLAMA_MODEL=llama3.2:latest
OLLAMA_BASE_URL=http://localhost:11434
```

3. **Make sure Ollama is running:**
```bash
ollama run llama3.2:latest
```

4. **Start the backend:**
```bash
uvicorn main:app --reload
```

### Switch to Gemini API

Simply change in `.env`:
```bash
USE_OLLAMA=0
GEMINI_API_KEY=your_actual_api_key_here
```

## Benefits

✅ **No API costs** - Use local Ollama model (llama3.2)  
✅ **Privacy** - All data stays local  
✅ **Fast** - No network latency  
✅ **Flexible** - Easy switch between local and cloud  
✅ **Same API** - Frontend unchanged, works with both

## Installation Command

```bash
pip install langchain-ollama==0.2.0 langchain-core==0.3.28
```

Or install all dependencies:
```bash
pip install -r requirements.txt
```
