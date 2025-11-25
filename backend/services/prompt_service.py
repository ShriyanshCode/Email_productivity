import json
import os
from pathlib import Path
from typing import Dict

# Default prompts for the email agent
DEFAULT_PROMPTS = {
    "categorization": """Categorize emails into: Important, Newsletter, Spam, To-Do.
To-Do emails must include a direct request requiring user action.

Email to categorize:
Subject: {subject}
From: {sender}
Body: {body}

Respond with ONLY the category name (e.g., "Important", "To-Do", "Newsletter", or "Spam").""",

    "action_extraction": """Extract tasks from the email. Respond in JSON:
{{ "task": "...", "deadline": "..." }}.

Email content:
Subject: {subject}
From: {sender}
Body: {body}

Extract action items in the following JSON format:
[
  {{
    "description": "Clear description of the action item",
    "deadline": "YYYY-MM-DD or null if no deadline mentioned",
    "priority": "High" | "Medium" | "Low"
  }}
]

If there are no action items, return an empty array [].
Respond with ONLY valid JSON.""",

    "reply_generation": """If an email is a meeting request, draft a polite reply asking for an agenda.

Original Email:
Subject: {subject}
From: {sender}
Body: {body}

Tone: {tone}
Additional Context: {context}

Generate a {tone} reply that:
1. Acknowledges the email content
2. If it's a meeting request, politely asks for an agenda
3. Is concise and professional
4. Includes appropriate greeting and closing

Respond with ONLY the reply text (no subject line).""",

    "summarization": """You are an email summarization assistant. Create a concise summary of the provided emails.

Emails to summarize:
{emails}

Focus: {focus}

Provide a brief summary that:
1. Highlights key themes and topics
2. Mentions urgent or important items
3. Groups similar emails together
4. Is easy to scan quickly

Keep the summary under 200 words.""",

    "chat_system": """You are an intelligent email assistant helping users manage their inbox. You have access to the user's emails and can:
1. Answer questions about specific emails
2. Summarize email content
3. Find emails matching certain criteria
4. Extract information from emails
5. Suggest actions or replies

Be conversational, helpful, and concise. When referencing specific emails, mention the sender and subject.
Always provide actionable insights when possible.

Current conversation context:
{conversation_history}

Available emails:
{email_context}

User query: {user_message}

Provide a helpful, conversational response."""
}

PROMPTS_FILE = Path(__file__).parent.parent / "data" / "prompts.json"


def load_prompts() -> Dict[str, str]:
    """Load prompts from file or return defaults if file doesn't exist."""
    if PROMPTS_FILE.exists():
        try:
            with open(PROMPTS_FILE, 'r', encoding='utf-8') as f:
                prompts = json.load(f)
                # Ensure all required prompts exist
                for key in DEFAULT_PROMPTS:
                    if key not in prompts:
                        prompts[key] = DEFAULT_PROMPTS[key]
                return prompts
        except Exception as e:
            print(f"Error loading prompts: {e}. Using defaults.")
            return DEFAULT_PROMPTS.copy()
    return DEFAULT_PROMPTS.copy()


def save_prompts(prompts: Dict[str, str]) -> bool:
    """Save prompts to file."""
    try:
        PROMPTS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(PROMPTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(prompts, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving prompts: {e}")
        return False


def get_prompt(prompt_type: str) -> str:
    """Get a specific prompt by type."""
    prompts = load_prompts()
    return prompts.get(prompt_type, DEFAULT_PROMPTS.get(prompt_type, ""))


def update_prompt(prompt_type: str, prompt_text: str) -> bool:
    """Update a specific prompt."""
    prompts = load_prompts()
    prompts[prompt_type] = prompt_text
    return save_prompts(prompts)


def reset_prompts() -> bool:
    """Reset all prompts to defaults."""
    return save_prompts(DEFAULT_PROMPTS.copy())


def format_prompt(prompt_type: str, **kwargs) -> str:
    """Get and format a prompt with provided variables."""
    prompt = get_prompt(prompt_type)
    try:
        return prompt.format(**kwargs)
    except KeyError as e:
        print(f"Missing variable in prompt: {e}")
        return prompt
