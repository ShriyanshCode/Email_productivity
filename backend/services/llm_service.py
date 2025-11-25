import os
import json
from typing import List, Dict, Optional, Any
from models.schemas import Email, ActionItem, ChatMessage, Priority
from services.prompt_service import format_prompt
import re

# Check which LLM to use
USE_OLLAMA = os.getenv("USE_OLLAMA", "1") == "1"

if USE_OLLAMA:
    from langchain_ollama import OllamaLLM
    from langchain_core.prompts import ChatPromptTemplate
else:
    from google import genai
    from google.genai import types


class LLMService:
    """Service for interacting with LLM (Ollama or Google Gemini API)."""
    
    def __init__(self):
        """Initialize the LLM client based on USE_OLLAMA flag."""
        self.use_ollama = USE_OLLAMA
        
        if self.use_ollama:
            # Initialize Ollama
            model_name = os.getenv("OLLAMA_MODEL", "llama3.2:latest")
            base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            
            try:
                self.ollama_model = OllamaLLM(
                    model=model_name,
                    base_url=base_url
                )
                print(f"✓ Using Ollama model: {model_name}")
                self.client = None
            except Exception as e:
                print(f"WARNING: Failed to initialize Ollama: {e}")
                self.ollama_model = None
        else:
            # Initialize Gemini
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                print("WARNING: GEMINI_API_KEY not set. LLM features will not work.")
                self.client = None
            else:
                self.client = genai.Client(api_key=api_key)
                print("✓ Using Google Gemini API")
            
            self.model_name = "gemini-2.0-flash-exp"
            self.ollama_model = None
    
    def _generate_content(self, prompt: str, temperature: float = 0.7) -> str:
        """Generate content using either Ollama or Gemini API."""
        if self.use_ollama:
            # Use Ollama
            if not self.ollama_model:
                return "Error: Ollama not configured"
            
            try:
                response = self.ollama_model.invoke(prompt)
                return response
            except Exception as e:
                print(f"Error generating content with Ollama: {e}")
                return f"Error: {str(e)}"
        else:
            # Use Gemini
            if not self.client:
                return "Error: API key not configured"
            
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=temperature,
                        max_output_tokens=2048,
                    )
                )
                return response.text
            except Exception as e:
                print(f"Error generating content with Gemini: {e}")
                return f"Error: {str(e)}"
    
    def categorize_email(self, email: Email) -> str:
        """Categorize an email into predefined categories."""
        prompt = format_prompt(
            "categorization",
            subject=email.subject,
            sender=email.sender,
            body=email.body[:1000]  # Limit body length
        )
        
        response = self._generate_content(prompt, temperature=0.3)
        
        # Extract category from response
        response = response.strip()
        valid_categories = ["Important", "To-Do", "Informational", "Newsletter", "Spam"]
        
        for category in valid_categories:
            if category.lower() in response.lower():
                return category
        
        return "Informational"  # Default fallback
    
    def extract_action_items(self, email: Email) -> List[ActionItem]:
        """Extract action items from an email."""
        prompt = format_prompt(
            "action_extraction",
            subject=email.subject,
            sender=email.sender,
            body=email.body
        )
        
        response = self._generate_content(prompt, temperature=0.4)
        
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                action_data = json.loads(json_match.group())
            else:
                action_data = json.loads(response)
            
            action_items = []
            for idx, item in enumerate(action_data):
                action_item = ActionItem(
                    id=f"{email.id}_action_{idx}",
                    email_id=email.id,
                    description=item.get("description", ""),
                    deadline=item.get("deadline"),
                    priority=Priority(item.get("priority", "Medium")),
                    completed=False,
                    source_email_subject=email.subject
                )
                action_items.append(action_item)
            
            return action_items
        except Exception as e:
            print(f"Error parsing action items: {e}")
            return []
    
    def generate_reply(self, email: Email, tone: str = "professional", context: str = "") -> Dict[str, Any]:
        """Generate a reply to an email."""
        prompt = format_prompt(
            "reply_generation",
            subject=email.subject,
            sender=email.sender,
            body=email.body,
            tone=tone,
            context=context or "No additional context"
        )
        
        response = self._generate_content(prompt, temperature=0.7)
        
        # Calculate a simple confidence score based on response length and coherence
        confidence = min(0.95, 0.6 + (len(response.split()) / 200))
        
        return {
            "reply_text": response.strip(),
            "tone": tone,
            "confidence_score": round(confidence, 2)
        }
    
    def summarize_emails(self, emails: List[Email], focus: str = "general overview") -> str:
        """Summarize a list of emails."""
        # Format emails for the prompt
        email_summaries = []
        for email in emails[:10]:  # Limit to 10 emails to avoid token limits
            email_summaries.append(
                f"From: {email.sender}\nSubject: {email.subject}\nDate: {email.date}\nPreview: {email.preview}"
            )
        
        emails_text = "\n\n".join(email_summaries)
        
        prompt = format_prompt(
            "summarization",
            emails=emails_text,
            focus=focus
        )
        
        response = self._generate_content(prompt, temperature=0.5)
        return response.strip()
    
    def chat_with_agent(
        self,
        user_message: str,
        conversation_history: List[ChatMessage],
        email_context: Optional[List[Email]] = None
    ) -> Dict[str, Any]:
        """Handle conversational queries about emails."""
        # Format conversation history
        history_text = "\n".join([
            f"{msg.role.capitalize()}: {msg.content}"
            for msg in conversation_history[-5:]  # Last 5 messages for context
        ])
        
        # Format email context
        if email_context:
            email_summaries = []
            for email in email_context[:15]:  # Limit context
                email_summaries.append(
                    f"ID: {email.id}\nFrom: {email.sender}\nSubject: {email.subject}\n"
                    f"Category: {email.category or 'Uncategorized'}\nPreview: {email.preview}"
                )
            email_text = "\n\n".join(email_summaries)
        else:
            email_text = "No emails in context"
        
        prompt = format_prompt(
            "chat_system",
            conversation_history=history_text or "No previous conversation",
            email_context=email_text,
            user_message=user_message
        )
        
        response = self._generate_content(prompt, temperature=0.7)
        
        # Try to extract referenced email IDs from response
        referenced_emails = []
        if email_context:
            for email in email_context:
                if email.id in response or email.subject.lower() in response.lower():
                    referenced_emails.append(email.id)
        
        return {
            "message": response.strip(),
            "referenced_emails": referenced_emails[:5],  # Limit to 5 references
            "suggested_actions": []  # Could be enhanced to extract action suggestions
        }


# Singleton instance
_llm_service = None

def get_llm_service() -> LLMService:
    """Get or create the LLM service instance."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
