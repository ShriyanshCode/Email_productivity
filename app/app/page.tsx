"use client";

import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import EmailList from '../components/EmailList';
import EmailViewer from '../components/EmailViewer';
import ChatInterface from '../components/ChatInterface';
import ActionItems from '../components/ActionItems';
import DraftComposer from '../components/DraftComposer';
import ActionInsights from '../components/ActionInsights';
import PromptEditor from '../components/PromptEditor';
import { Email, ActionItem, ChatMessage, ViewType, PromptConfig } from '../lib/types';
import * as api from '../lib/api';
import { Loader2, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [prompts, setPrompts] = useState<PromptConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showDraftComposer, setShowDraftComposer] = useState(false);
  const [draftEmail, setDraftEmail] = useState<Email | null>(null);
  const [draftText, setDraftText] = useState('');
  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [isDraftMinimized, setIsDraftMinimized] = useState(false);

  const [showActionInsights, setShowActionInsights] = useState(false);
  const [insightsActionItems, setInsightsActionItems] = useState<ActionItem[]>([]);
  const [isInsightsMinimized, setIsInsightsMinimized] = useState(false);

  const [drafts, setDrafts] = useState<Email[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    loadEmails();
    loadPrompts();
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    try {
      const savedDrafts = localStorage.getItem('all_drafts');
      if (savedDrafts) {
        setDrafts(JSON.parse(savedDrafts));
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
    }
  };

  const loadEmails = async () => {
    try {
      setIsLoadingEmails(true);
      const fetchedEmails = await api.fetchEmails();
      setEmails(fetchedEmails);

      // Auto-categorize if not already categorized
      const uncategorized = fetchedEmails.filter(e => !e.category);
      if (uncategorized.length > 0) {
        categorizeAllEmails();
      }
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const loadPrompts = async () => {
    try {
      const fetchedPrompts = await api.fetchPrompts();
      setPrompts(fetchedPrompts);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    }
  };

  const categorizeAllEmails = async () => {
    try {
      setIsCategorizing(true);
      const result = await api.categorizeAllEmails();
      // Reload emails to get updated categories
      const updatedEmails = await api.fetchEmails();
      setEmails(updatedEmails);
    } catch (error) {
      console.error('Failed to categorize emails:', error);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleEmailSelect = (email: Email) => {
    if (activeView === 'drafts') {
      handleOpenDraft(email);
      return;
    }
    setSelectedEmail(email);
    // Only switch to inbox if we are in a view that doesn't support split view (like settings)
    // Action items and Drafts now support split view
    if (activeView === 'settings') {
      setActiveView('inbox');
    }
  };

  const handleOpenDraft = (draft: any) => {
    let originalEmail = emails.find(e => e.id === draft.originalEmailId);

    // Try to use snapshot if original email not found in current list
    if (!originalEmail && draft.originalEmailSnapshot) {
      originalEmail = draft.originalEmailSnapshot;
    }

    if (!originalEmail) {
      console.warn('Original email not found for draft, creating fallback');
      // Fallback: Construct a fake email from draft data so editing can continue
      originalEmail = {
        id: draft.originalEmailId || `fallback-${Date.now()}`,
        sender: 'Unknown Sender',
        sender_email: draft.recipient || draft.to || '', // The person we are replying to
        recipient: 'Me',
        subject: draft.subject ? draft.subject.replace(/^Re: /, '') : '(No Subject)',
        body: 'Original email content not available.',
        date: new Date().toISOString(),
        preview: 'Original content missing',
        is_read: true,
        has_attachments: false,
        category: 'Draft' as any,
      };
    }

    // Restore draft state to localStorage so DraftComposer picks it up
    const draftData = {
      to: draft.to || draft.recipient, // Handle legacy drafts
      cc: draft.cc || '',
      bcc: draft.bcc || '',
      subject: draft.subject,
      draft: draft.body
    };
    localStorage.setItem(`draft_${originalEmail.id}`, JSON.stringify(draftData));

    setDraftEmail(originalEmail);
    setDraftText(draft.body);
    setDraftId(draft.id); // Track the draft ID
    setShowDraftComposer(true);
    setIsDraftMinimized(false);
    setSelectedEmail(originalEmail);
  };

  const handleExtractActions = async (email: Email) => {
    try {
      const extracted = await api.extractActionItems(email);

      // Show in ActionInsights panel instead of adding directly
      setInsightsActionItems(extracted);
      setShowActionInsights(true);
      setIsInsightsMinimized(false);

      // Update email with action items
      setEmails(prev => prev.map(e =>
        e.id === email.id ? { ...e, action_items: extracted } : e
      ));

      if (selectedEmail?.id === email.id) {
        setSelectedEmail({ ...email, action_items: extracted });
      }
    } catch (error) {
      console.error('Failed to extract actions:', error);
    }
  };

  const handleAddSelectedActions = (selectedItems: ActionItem[]) => {
    setActionItems(prev => [...prev, ...selectedItems]);
    setShowActionInsights(false);
  };

  const handleReply = async (email: Email) => {
    setDraftEmail(email);
    setDraftText(''); // Clear previous draft
    setDraftId(undefined); // Clear draft ID for new reply
    setShowDraftComposer(true);
    setIsDraftMinimized(false);
    setIsDraftLoading(true);

    try {
      const reply = await api.generateReply(email);
      setDraftText(reply.reply_text);
    } catch (error) {
      console.error('Failed to generate reply:', error);
      setDraftText('Failed to generate reply. Please try again.');
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleRegenerateDraft = async (tone: string) => {
    if (!draftEmail) return;

    setIsDraftLoading(true);
    setDraftText(''); // Clear current draft while regenerating

    try {
      const reply = await api.generateReply(draftEmail, tone);
      setDraftText(reply.reply_text);
    } catch (error) {
      console.error('Failed to regenerate reply:', error);
      setDraftText('Failed to generate reply. Please try again.');
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleSaveDraft = (draftData: any) => {
    const newDraft: any = {
      id: draftData.draftId || `draft-${Date.now()}`,
      originalEmailId: draftData.originalEmailId,
      originalEmailSnapshot: draftData.originalEmailSnapshot,
      to: draftData.to,
      cc: draftData.cc,
      bcc: draftData.bcc,
      subject: draftData.subject || '(No Subject)',
      sender: `To: ${draftData.to}`,
      sender_email: 'me@example.com',
      recipient: draftData.to,
      body: draftData.body || '',
      preview: (draftData.body || '').substring(0, 100),
      date: new Date().toISOString(),
      is_read: true,
      has_attachments: false,
      category: 'Draft',
    };

    let updatedDrafts;
    if (draftData.draftId) {
      // Update existing draft
      updatedDrafts = drafts.filter(d => d.id !== draftData.draftId);
    } else {
      // New draft: remove any existing draft for this email to avoid duplicates (optional policy)
      updatedDrafts = drafts.filter((d: any) => d.originalEmailId !== draftData.originalEmailId);
    }

    updatedDrafts = [newDraft, ...updatedDrafts];

    setDrafts(updatedDrafts);
    localStorage.setItem('all_drafts', JSON.stringify(updatedDrafts));
  };

  const handleDeleteDraft = (email: Email) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      const updatedDrafts = drafts.filter(d => d.id !== email.id);
      setDrafts(updatedDrafts);
      localStorage.setItem('all_drafts', JSON.stringify(updatedDrafts));

      // If deleted draft was selected, deselect it
      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
        setShowDraftComposer(false);
      }
    }
  };

  const handleChatMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const response = await api.chatWithAgent(message, chatMessages, emails);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        referenced_emails: response.referenced_emails,
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to chat:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleToggleActionComplete = async (emailId: string) => {
    try {
      // Toggle the is_read status for the email
      setEmails(prev => prev.map(email =>
        email.id === emailId ? { ...email, is_read: !email.is_read } : email
      ));
    } catch (error) {
      console.error('Failed to toggle action item:', error);
    }
  };

  const handlePromptSave = async (promptType: string, promptText: string) => {
    try {
      await api.updatePrompt(promptType, promptText);
      await loadPrompts();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      throw error;
    }
  };

  const handlePromptReset = async () => {
    try {
      await api.resetPrompts();
      await loadPrompts();
    } catch (error) {
      console.error('Failed to reset prompts:', error);
      throw error;
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoadingEmails(true);
      const result = await api.uploadEmailsFile(file);
      alert(`Successfully uploaded ${result.count} emails!`);
      await loadEmails();
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please check the format and try again.');
    } finally {
      setIsLoadingEmails(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderMainContent = () => {


    if (activeView === 'action-items') {
      return (
        <>
          <div className="email-list-panel">
            <ActionItems
              emails={emails}
              onToggleComplete={handleToggleActionComplete}
              onEmailClick={(email) => handleEmailSelect(email)}
            />
          </div>
          <div className="email-viewer-panel">
            <div className="email-viewer-container">
              {selectedEmail ? (
                <EmailViewer
                  email={selectedEmail}
                  onReply={handleReply}
                  onExtractActions={handleExtractActions}
                />
              ) : (
                <div className="empty-viewer-placeholder">
                  {/* Select an action item to view details */}
                </div>
              )}
            </div>

            {showDraftComposer && draftEmail && (
              <DraftComposer
                email={draftEmail}
                initialDraft={draftText}
                onRegenerate={handleRegenerateDraft}
                onClose={() => setShowDraftComposer(false)}
                isLoading={isDraftLoading}
                isMinimized={isDraftMinimized}
                onToggleMinimize={() => setIsDraftMinimized(!isDraftMinimized)}
                onSaveDraft={handleSaveDraft}
                draftId={draftId}
              />
            )}

            {showActionInsights && insightsActionItems.length > 0 && (
              <ActionInsights
                actionItems={insightsActionItems}
                onClose={() => setShowActionInsights(false)}
                onAddToActionItems={handleAddSelectedActions}
                isMinimized={isInsightsMinimized}
                onToggleMinimize={() => setIsInsightsMinimized(!isInsightsMinimized)}
              />
            )}
          </div>
        </>
      );
    }

    if (activeView === 'settings' && prompts) {
      return (
        <div className="full-width-view">
          <PromptEditor
            prompts={prompts}
            onSave={handlePromptSave}
            onReset={handlePromptReset}
          />
        </div>
      );
    }

    if (activeView === 'drafts') {
      return (
        <>
          <div className="email-list-panel">
            <div className="panel-header">
              <h2>Drafts</h2>
            </div>
            <EmailList
              emails={drafts}
              selectedEmailId={selectedEmail?.id}
              onEmailSelect={handleEmailSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onDelete={handleDeleteDraft}
            />
          </div>
          <div className="email-viewer-panel">
            <div className="email-viewer-container">
              {selectedEmail && (
                <EmailViewer
                  email={selectedEmail}
                  onReply={handleReply}
                  onExtractActions={handleExtractActions}
                />
              )}
            </div>

            {showDraftComposer && draftEmail && (
              <DraftComposer
                email={draftEmail}
                initialDraft={draftText}
                onRegenerate={handleRegenerateDraft}
                onClose={() => setShowDraftComposer(false)}
                isLoading={isDraftLoading}
                isMinimized={isDraftMinimized}
                onToggleMinimize={() => setIsDraftMinimized(!isDraftMinimized)}
                onSaveDraft={handleSaveDraft}
                draftId={draftId}
              />
            )}

            {showActionInsights && insightsActionItems.length > 0 && (
              <ActionInsights
                actionItems={insightsActionItems}
                onClose={() => setShowActionInsights(false)}
                onAddToActionItems={handleAddSelectedActions}
                isMinimized={isInsightsMinimized}
                onToggleMinimize={() => setIsInsightsMinimized(!isInsightsMinimized)}
              />
            )}
          </div>
        </>
      );
    }

    // Default: inbox view with email list and viewer
    return (
      <>
        <div className="email-list-panel">
          <div className="panel-header">
            <h2>Inbox</h2>
            {isCategorizing && (
              <div className="categorizing-indicator">
                <Loader2 size={16} className="spin" />
                <span>Categorizing emails...</span>
              </div>
            )}
          </div>
          <EmailList
            emails={emails}
            selectedEmailId={selectedEmail?.id}
            onEmailSelect={handleEmailSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
        <div className="email-viewer-panel">
          <div className="email-viewer-container">
            <EmailViewer
              email={selectedEmail}
              onReply={handleReply}
              onExtractActions={handleExtractActions}
            />
          </div>

          {showDraftComposer && draftEmail && (
            <DraftComposer
              email={draftEmail}
              initialDraft={draftText}
              onRegenerate={handleRegenerateDraft}
              onClose={() => setShowDraftComposer(false)}
              isLoading={isDraftLoading}
              isMinimized={isDraftMinimized}
              onToggleMinimize={() => setIsDraftMinimized(!isDraftMinimized)}
              onSaveDraft={handleSaveDraft}
              draftId={draftId}
            />
          )}

          {showActionInsights && insightsActionItems.length > 0 && (
            <ActionInsights
              actionItems={insightsActionItems}
              onClose={() => setShowActionInsights(false)}
              onAddToActionItems={handleAddSelectedActions}
              isMinimized={isInsightsMinimized}
              onToggleMinimize={() => setIsInsightsMinimized(!isInsightsMinimized)}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="app-container">
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => {
          if (view === 'chat') {
            setIsChatOpen(true);
          } else {
            setActiveView(view);
          }
        }}
        actionItemCount={emails.filter(e => e.category === 'To-Do' && !e.is_read).length}
        onUploadClick={handleUploadClick}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className="main-content">
        {isLoadingEmails ? (
          <div className="loading-state">
            <Loader2 size={48} className="spin" />
            <p>Loading emails...</p>
          </div>
        ) : (
          renderMainContent()
        )}
      </main>

      {isChatOpen && (
        <div className="chat-overlay">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleChatMessage}
            isLoading={isChatLoading}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}



      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <style jsx>{`
        .app-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          display: flex;
          overflow: hidden;
          min-width: 0;
        }

        .full-width-view {
          flex: 1;
          display: flex;
          min-width: 0;
          overflow: hidden;
        }

        .chat-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .loading-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: var(--text-muted);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .email-list-panel {
          width: clamp(320px, 30vw, 400px);
          border-right: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .panel-header {
          padding: 1.25rem 1rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
        }

        .panel-header h2 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .categorizing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--accent-primary);
          font-size: 0.8125rem;
          margin-top: 0.5rem;
        }

        .email-viewer-panel {
          flex: 1 1 0%; /* Explicitly set flex-basis to 0% to take remaining space */
          min-width: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .email-viewer-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .empty-viewer-placeholder {
          position: relative;
          left: 300%; /* adjust 10 20% depending on layout */
          opacity: 0.6;
          font-size: 1.2rem;
        }
        .full-width-view {
          flex: 1;
          display: flex;
          min-width: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
