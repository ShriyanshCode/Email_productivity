export enum EmailCategory {
    IMPORTANT = "Important",
    TODO = "To-Do",
    INFORMATIONAL = "Informational",
    NEWSLETTER = "Newsletter",
    SPAM = "Spam",
    UNREAD = "Unread"
}

export enum Priority {
    HIGH = "High",
    MEDIUM = "Medium",
    LOW = "Low"
}

export interface Email {
    id: string;
    sender: string;
    sender_email: string;
    recipient: string;
    subject: string;
    body: string;
    date: string;
    preview: string;
    category?: EmailCategory;
    is_read: boolean;
    has_attachments: boolean;
    action_items?: ActionItem[];
    suggested_reply?: string;
}

export interface ActionItem {
    id: string;
    email_id: string;
    description: string;
    deadline?: string;
    priority: Priority;
    completed: boolean;
    source_email_subject?: string;
}

export interface DraftReply {
    email_id: string;
    reply_text: string;
    tone: string;
    confidence_score?: number;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
    referenced_emails?: string[];
}

export interface ChatResponse {
    message: string;
    referenced_emails?: string[];
    suggested_actions?: string[];
}

export interface PromptConfig {
    categorization: string;
    action_extraction: string;
    reply_generation: string;
    summarization: string;
    chat_system: string;
}

export type ViewType = "inbox" | "action-items" | "drafts" | "chat" | "settings";
