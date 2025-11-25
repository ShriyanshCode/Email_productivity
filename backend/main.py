from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import json
from pathlib import Path
from dotenv import load_dotenv
import os

from models.schemas import (
    Email, EmailCategory, ActionItem, ChatMessage, ChatRequest, ChatResponse,
    PromptConfig, PromptUpdate, CategorizeRequest, ExtractActionsRequest,
    GenerateReplyRequest, SummarizeRequest
)
from services.llm_service import get_llm_service
from services.prompt_service import (
    load_prompts, save_prompts, update_prompt, reset_prompts, DEFAULT_PROMPTS
)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Email Productivity Agent API",
    description="AI-powered email management system with customizable prompts",
    version="1.0.0"
)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data storage
MOCK_EMAILS_FILE = Path(__file__).parent / "data" / "mock_emails.json"
emails_db: List[Email] = []
action_items_db: List[ActionItem] = []


def load_mock_emails():
    """Load mock emails from JSON file."""
    global emails_db
    try:
        with open(MOCK_EMAILS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            emails_db = [Email(**email) for email in data]
    except Exception as e:
        print(f"Error loading mock emails: {e}")
        emails_db = []


# Load emails on startup
@app.on_event("startup")
async def startup_event():
    load_mock_emails()
    print(f"Loaded {len(emails_db)} mock emails")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Email Productivity Agent API",
        "emails_loaded": len(emails_db)
    }


# Email endpoints
@app.get("/api/emails", response_model=List[Email])
async def get_emails(category: str = None, limit: int = 100):
    """Get all emails, optionally filtered by category."""
    if category:
        filtered = [e for e in emails_db if e.category and e.category.value == category]
        return filtered[:limit]
    return emails_db[:limit]


@app.get("/api/emails/{email_id}", response_model=Email)
async def get_email(email_id: str):
    """Get a specific email by ID."""
    email = next((e for e in emails_db if e.id == email_id), None)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email


@app.post("/api/emails/upload")
async def upload_emails(file: UploadFile = File(...)):
    """Upload a JSON file containing emails."""
    global emails_db
    
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="File must be a JSON file")
    
    try:
        content = await file.read()
        data = json.loads(content.decode('utf-8'))
        
        # Validate and load emails
        new_emails = [Email(**email) for email in data]
        emails_db = new_emails
        
        # Optionally save to mock_emails.json
        with open(MOCK_EMAILS_FILE, 'w', encoding='utf-8') as f:
            json.dump([email.dict() for email in emails_db], f, indent=2, ensure_ascii=False)
        
        return {
            "success": True,
            "message": f"Successfully uploaded {len(new_emails)} emails",
            "count": len(new_emails)
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")


# LLM-powered endpoints
@app.post("/api/categorize")
async def categorize_email(request: CategorizeRequest):
    """Categorize an email using LLM."""
    llm = get_llm_service()
    category = llm.categorize_email(request.email)
    
    # Update email in database
    for email in emails_db:
        if email.id == request.email.id:
            email.category = EmailCategory(category)
            break
    
    return {"email_id": request.email.id, "category": category}


@app.post("/api/categorize-all")
async def categorize_all_emails():
    """Categorize all emails in the database."""
    llm = get_llm_service()
    results = []
    
    for email in emails_db:
        category = llm.categorize_email(email)
        email.category = EmailCategory(category)
        results.append({"email_id": email.id, "category": category})
    
    return {
        "success": True,
        "message": f"Categorized {len(results)} emails",
        "results": results
    }


@app.post("/api/extract-actions", response_model=List[ActionItem])
async def extract_actions(request: ExtractActionsRequest):
    """Extract action items from an email."""
    llm = get_llm_service()
    action_items = llm.extract_action_items(request.email)
    
    # Store action items
    global action_items_db
    action_items_db.extend(action_items)
    
    # Update email with action items
    for email in emails_db:
        if email.id == request.email.id:
            email.action_items = action_items
            break
    
    return action_items


@app.get("/api/action-items", response_model=List[ActionItem])
async def get_action_items(completed: bool = None):
    """Get all action items, optionally filtered by completion status."""
    if completed is not None:
        return [item for item in action_items_db if item.completed == completed]
    return action_items_db


@app.post("/api/action-items/{item_id}/complete")
async def complete_action_item(item_id: str):
    """Mark an action item as complete."""
    item = next((i for i in action_items_db if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    item.completed = True
    return {"success": True, "item_id": item_id}


@app.post("/api/generate-reply")
async def generate_reply(request: GenerateReplyRequest):
    """Generate a reply to an email."""
    llm = get_llm_service()
    reply = llm.generate_reply(request.email, request.tone, request.context)
    
    # Update email with suggested reply
    for email in emails_db:
        if email.id == request.email.id:
            email.suggested_reply = reply["reply_text"]
            break
    
    return reply


@app.post("/api/summarize")
async def summarize_emails(request: SummarizeRequest):
    """Summarize a list of emails."""
    llm = get_llm_service()
    summary = llm.summarize_emails(request.emails, request.focus or "general overview")
    return {"summary": summary}


@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """Chat with the email agent."""
    llm = get_llm_service()
    
    # Use provided email context or all emails
    email_context = request.email_context if request.email_context else emails_db
    
    response = llm.chat_with_agent(
        request.message,
        request.conversation_history,
        email_context
    )
    
    return ChatResponse(**response)


# Prompt management endpoints
@app.get("/api/prompts", response_model=PromptConfig)
async def get_prompts():
    """Get all current prompts."""
    prompts = load_prompts()
    return PromptConfig(**prompts)


@app.post("/api/prompts/update")
async def update_prompt_endpoint(request: PromptUpdate):
    """Update a specific prompt."""
    success = update_prompt(request.prompt_type, request.prompt_text)
    if success:
        return {"success": True, "message": f"Updated {request.prompt_type} prompt"}
    raise HTTPException(status_code=500, detail="Failed to update prompt")


@app.post("/api/prompts/reset")
async def reset_prompts_endpoint():
    """Reset all prompts to defaults."""
    success = reset_prompts()
    if success:
        return {"success": True, "message": "All prompts reset to defaults"}
    raise HTTPException(status_code=500, detail="Failed to reset prompts")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
