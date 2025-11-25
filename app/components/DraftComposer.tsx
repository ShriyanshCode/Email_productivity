"use client";

import { useState, useEffect } from 'react';
import { Email } from '@/lib/types';
import { RefreshCw, Copy, Send, Loader2, X, Minimize2, Maximize2 } from 'lucide-react';

interface DraftComposerProps {
  email: Email;
  initialDraft?: string;
  onRegenerate: (tone: string) => void;
  onClose: () => void;
  onSaveDraft?: (draft: any) => void;
  isLoading?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  draftId?: string;
}

export default function DraftComposer({
  email,
  initialDraft = '',
  onRegenerate,
  onClose,
  onSaveDraft,
  isLoading = false,
  isMinimized = false,
  onToggleMinimize,
  draftId
}: DraftComposerProps) {
  // State for draft fields
  const [to, setTo] = useState(email.sender_email);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(`Re: ${email.subject}`);
  const [draft, setDraft] = useState(initialDraft);

  // UI State
  const [tone, setTone] = useState('professional');
  const [copied, setCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  // Load saved draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`draft_${email.id}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setTo(parsed.to || email.sender_email);
        setCc(parsed.cc || '');
        setBcc(parsed.bcc || '');
        setSubject(parsed.subject || `Re: ${email.subject}`);
        // Only override draft text if we're not currently loading a new one
        // and if the saved draft has content
        if (!isLoading && parsed.draft) {
          setDraft(parsed.draft);
        }
      } catch (e) {
        console.error('Failed to parse saved draft', e);
      }
    }
  }, [email.id]);

  // Update draft text when initialDraft changes (e.g. from AI generation)
  useEffect(() => {
    if (initialDraft && !isLoading) {
      setDraft(initialDraft);
    }
  }, [initialDraft, isLoading]);

  // Save to localStorage whenever fields change
  useEffect(() => {
    const draftData = {
      to,
      cc,
      bcc,
      subject,
      draft
    };
    localStorage.setItem(`draft_${email.id}`, JSON.stringify(draftData));
  }, [to, cc, bcc, subject, draft, email.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSend = () => {
    alert(`Email sent to ${to}! (This is a simulation)`);
    // Clear saved draft on send
    localStorage.removeItem(`draft_${email.id}`);
    onClose();
  };

  const handleClose = () => {
    if (onSaveDraft) {
      onSaveDraft({
        draftId,
        originalEmailId: email.id,
        originalEmailSnapshot: email,
        to,
        cc,
        bcc,
        subject,
        body: draft,
        timestamp: Date.now()
      });
    }
    onClose();
  };

  const handleRegenerate = () => {
    onRegenerate(tone);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (!isMaximized && isMinimized && onToggleMinimize) {
      onToggleMinimize();
    }
  };

  return (
    <div className={`draft-composer-panel ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}>
      <div className="panel-header">
        <div className="header-left">
          <h3 className="panel-title">
            {isMinimized ? subject : 'Compose Reply'}
          </h3>
        </div>
        <div className="header-actions">
          <button
            onClick={toggleMaximize}
            className="icon-btn"
            title={isMaximized ? "Restore size" : "Maximize"}
            disabled={isMinimized}
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          {onToggleMinimize && (
            <button onClick={onToggleMinimize} className="icon-btn" title={isMinimized ? "Restore" : "Minimize"}>
              <span className="minimize-icon">_</span>
            </button>
          )}
          <button onClick={handleClose} className="icon-btn" title="Close">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="composer-fields">
            <div className="field-row">
              <label>To:</label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="field-input"
              />
              <div className="cc-bcc-toggles">
                {!showCc && <button onClick={() => setShowCc(true)} className="text-btn">Cc</button>}
                {!showBcc && <button onClick={() => setShowBcc(true)} className="text-btn">Bcc</button>}
              </div>
            </div>

            {showCc && (
              <div className="field-row">
                <label>Cc:</label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="field-input"
                  placeholder="Cc recipients"
                />
              </div>
            )}

            {showBcc && (
              <div className="field-row">
                <label>Bcc:</label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="field-input"
                  placeholder="Bcc recipients"
                />
              </div>
            )}

            <div className="field-row">
              <label>Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="field-input"
              />
            </div>
          </div>

          <div className="draft-controls">
            <div className="tone-selector">
              <label>Tone:</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="tone-select"
                disabled={isLoading}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
                <option value="brief">Brief</option>
              </select>
            </div>

            <button
              onClick={handleRegenerate}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Regenerate
                </>
              )}
            </button>
          </div>

          <div className="draft-body">
            {isLoading ? (
              <div className="loading-state">
                <Loader2 size={32} className="spin" />
                <p>Generating reply...</p>
              </div>
            ) : (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="draft-textarea"
                placeholder="Type your reply here..."
              />
            )}
          </div>

          <div className="draft-footer">
            <div className="draft-actions">
              <button onClick={handleSend} className="btn btn-primary" disabled={isLoading}>
                <Send size={16} />
                Send
              </button>
              <button onClick={handleCopy} className="btn btn-secondary" disabled={isLoading}>
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .draft-composer-panel {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          height: 60vh;
          max-height: 85vh;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
        }

        .draft-composer-panel.minimized {
          height: 48px;
          overflow: hidden;
        }

        .draft-composer-panel.maximized {
          height: 100%;
          max-height: 100%;
          border-top: none;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
          height: 48px;
        }

        .header-left {
          flex: 1;
          min-width: 0;
        }

        .panel-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-actions {
          display: flex;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.375rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
        }

        .icon-btn:hover:not(:disabled) {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .icon-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .minimize-icon {
          font-weight: bold;
          transform: translateY(-4px);
        }

        .composer-fields {
          padding: 1rem 1.5rem;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .field-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .field-row label {
          width: 60px;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .field-input {
          flex: 1;
          padding: 0.5rem;
          background: transparent;
          border: 1px solid var(--border-default);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 0.9375rem;
          transition: border-color 0.2s;
        }

        .field-input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .cc-bcc-toggles {
          display: flex;
          gap: 0.5rem;
        }

        .text-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.8125rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .text-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .draft-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.5rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .tone-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tone-selector label {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tone-select {
          padding: 0.375rem 0.75rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .draft-body {
          flex: 1;
          padding: 1rem 1.5rem;
          overflow-y: auto;
          background: var(--bg-primary);
          position: relative;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          gap: 1rem;
        }

        .draft-textarea {
          width: 100%;
          height: 100%;
          padding: 0;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.9375rem;
          line-height: 1.6;
          resize: none;
          font-family: inherit;
        }

        .draft-textarea:focus {
          outline: none;
        }

        .draft-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-default);
          background: var(--bg-primary);
          flex-shrink: 0;
        }

        .draft-actions {
          display: flex;
          gap: 0.75rem;
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
      `}</style>
    </div>
  );
}

