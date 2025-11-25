# Email Productivity Agent - Frontend

Next.js React application for the Email Productivity Agent system.

## Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
Create a `.env.local` file in the app directory with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Run Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

- **Email Inbox Management**: Browse, search, and view emails with category badges
- **AI-Powered Categorization**: Automatic email classification (Urgent, Action Required, Informational, Newsletter, Spam)
- **Action Item Extraction**: Extract tasks and deadlines from emails
- **Reply Generation**: AI-generated email replies with customizable tone
- **Chat Interface**: Conversational queries about your inbox
- **Prompt Management**: Customize AI behavior through editable prompts
- **JSON Upload**: Upload custom email datasets via the Upload button

## Project Structure

```
app/
├── app/
│   ├── globals.css         # Dark theme styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application
├── components/
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── EmailList.tsx       # Email list with search
│   ├── EmailViewer.tsx     # Email content viewer
│   ├── ChatInterface.tsx   # Chat with AI agent
│   ├── ActionItems.tsx     # Task management
│   ├── DraftComposer.tsx   # Reply editor
│   └── PromptEditor.tsx    # Prompt customization
└── lib/
    ├── types.ts            # TypeScript definitions
    └── api.ts              # Backend API client
```

## Usage

### Uploading Custom Emails
1. Click the "Upload" button in the sidebar
2. Select a JSON file with email data
3. Emails will be loaded and automatically categorized

### Extracting Action Items
1. Select an email
2. Click "Extract Actions" button
3. View extracted tasks in the Action Items section

### Generating Replies
1. Select an email
2. Click "Reply" button
3. Edit the AI-generated draft
4. Choose different tones or regenerate

### Chat Queries
1. Navigate to Chat section
2. Ask questions like:
   - "Show me urgent emails"
   - "What action items are due this week?"
   - "Summarize today's emails"

### Customizing Prompts
1. Navigate to Settings
2. Select a prompt type
3. Edit the template
4. Save changes

## Color Theme

The app uses a dark theme with:
- Primary Background: `#0a0e27`
- Secondary Background: `#1e293b`
- Accent Blue: `#3b82f6`
- Accent Cyan: `#06b6d4`

Category colors:
- Urgent: Red `#ef4444`
- Action Required: Amber `#f59e0b`
- Informational: Blue `#3b82f6`
- Newsletter: Purple `#8b5cf6`
- Spam: Gray `#6b7280`
