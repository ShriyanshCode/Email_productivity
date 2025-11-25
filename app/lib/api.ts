import { Email, ActionItem, ChatMessage, ChatResponse, PromptConfig, DraftReply } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
}

// Email endpoints
export async function fetchEmails(category?: string): Promise<Email[]> {
    const url = category ? `/api/emails?category=${category}` : '/api/emails';
    return apiCall<Email[]>(url);
}

export async function fetchEmail(emailId: string): Promise<Email> {
    return apiCall<Email>(`/api/emails/${emailId}`);
}

export async function uploadEmailsFile(file: File): Promise<{ success: boolean; message: string; count: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/emails/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
    }

    return response.json();
}

// LLM-powered endpoints
export async function categorizeEmail(email: Email): Promise<{ email_id: string; category: string }> {
    return apiCall('/api/categorize', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function categorizeAllEmails(): Promise<{ success: boolean; message: string; results: any[] }> {
    return apiCall('/api/categorize-all', {
        method: 'POST',
    });
}

export async function extractActionItems(email: Email): Promise<ActionItem[]> {
    return apiCall<ActionItem[]>('/api/extract-actions', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function fetchActionItems(completed?: boolean): Promise<ActionItem[]> {
    const url = completed !== undefined ? `/api/action-items?completed=${completed}` : '/api/action-items';
    return apiCall<ActionItem[]>(url);
}

export async function completeActionItem(itemId: string): Promise<{ success: boolean; item_id: string }> {
    return apiCall(`/api/action-items/${itemId}/complete`, {
        method: 'POST',
    });
}

export async function generateReply(
    email: Email,
    tone: string = 'professional',
    context?: string
): Promise<DraftReply & { confidence_score: number }> {
    return apiCall('/api/generate-reply', {
        method: 'POST',
        body: JSON.stringify({ email, tone, context }),
    });
}

export async function summarizeEmails(emails: Email[], focus?: string): Promise<{ summary: string }> {
    return apiCall('/api/summarize', {
        method: 'POST',
        body: JSON.stringify({ emails, focus }),
    });
}

export async function chatWithAgent(
    message: string,
    conversationHistory: ChatMessage[],
    emailContext?: Email[]
): Promise<ChatResponse> {
    return apiCall<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
            message,
            conversation_history: conversationHistory,
            email_context: emailContext,
        }),
    });
}

// Prompt management endpoints
export async function fetchPrompts(): Promise<PromptConfig> {
    return apiCall<PromptConfig>('/api/prompts');
}

export async function updatePrompt(
    promptType: string,
    promptText: string
): Promise<{ success: boolean; message: string }> {
    return apiCall('/api/prompts/update', {
        method: 'POST',
        body: JSON.stringify({ prompt_type: promptType, prompt_text: promptText }),
    });
}

export async function resetPrompts(): Promise<{ success: boolean; message: string }> {
    return apiCall('/api/prompts/reset', {
        method: 'POST',
    });
}
