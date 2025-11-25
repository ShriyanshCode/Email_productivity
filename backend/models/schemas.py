from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


class EmailCategory(str, Enum):
    IMPORTANT = "Important"
    TODO = "To-Do"
    INFORMATIONAL = "Informational"
    NEWSLETTER = "Newsletter"
    SPAM = "Spam"
    UNREAD = "Unread"


class Priority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class Email(BaseModel):
    id: str
    sender: str
    sender_email: str
    recipient: str
    subject: str
    body: str
    date: str
    preview: str
    category: Optional[EmailCategory] = None
    is_read: bool = False
    has_attachments: bool = False
    action_items: Optional[List['ActionItem']] = None
    suggested_reply: Optional[str] = None


class ActionItem(BaseModel):
    id: str
    email_id: str
    description: str
    deadline: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    completed: bool = False
    source_email_subject: Optional[str] = None


class DraftReply(BaseModel):
    email_id: str
    reply_text: str
    tone: str = "professional"
    confidence_score: Optional[float] = None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: Optional[str] = None
    referenced_emails: Optional[List[str]] = None


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []
    email_context: Optional[List[Email]] = None


class ChatResponse(BaseModel):
    message: str
    referenced_emails: Optional[List[str]] = None
    suggested_actions: Optional[List[str]] = None


class PromptConfig(BaseModel):
    categorization: str
    action_extraction: str
    reply_generation: str
    summarization: str
    chat_system: str


class PromptUpdate(BaseModel):
    prompt_type: Literal["categorization", "action_extraction", "reply_generation", "summarization", "chat_system"]
    prompt_text: str


class CategorizeRequest(BaseModel):
    email: Email


class ExtractActionsRequest(BaseModel):
    email: Email


class GenerateReplyRequest(BaseModel):
    email: Email
    tone: str = "professional"
    context: Optional[str] = None


class SummarizeRequest(BaseModel):
    emails: List[Email]
    focus: Optional[str] = None
