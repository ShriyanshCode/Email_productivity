"use client";

import { useState, useEffect } from 'react';
import { PromptConfig } from '@/lib/types';
import { Save, RotateCcw, Loader2 } from 'lucide-react';

interface PromptEditorProps {
    prompts: PromptConfig;
    onSave: (promptType: string, promptText: string) => Promise<void>;
    onReset: () => Promise<void>;
}

export default function PromptEditor({ prompts, onSave, onReset }: PromptEditorProps) {
    const [activeTab, setActiveTab] = useState<keyof PromptConfig>('categorization');
    const [editedPrompts, setEditedPrompts] = useState<PromptConfig>(prompts);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        setEditedPrompts(prompts);
    }, [prompts]);

    const tabs: { id: keyof PromptConfig; label: string; description: string }[] = [
        { id: 'categorization', label: 'Categorization', description: 'Classify emails into categories' },
        { id: 'action_extraction', label: 'Action Extraction', description: 'Extract tasks and deadlines' },
        { id: 'reply_generation', label: 'Reply Generation', description: 'Generate email replies' },
        { id: 'summarization', label: 'Summarization', description: 'Summarize email content' },
        { id: 'chat_system', label: 'Chat System', description: 'Conversational agent behavior' },
    ];

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            await onSave(activeTab, editedPrompts[activeTab]);
            setSaveMessage('Saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('Are you sure you want to reset all prompts to defaults?')) {
            return;
        }
        setIsResetting(true);
        try {
            await onReset();
            setSaveMessage('Reset to defaults!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Failed to reset');
        } finally {
            setIsResetting(false);
        }
    };

    const handlePromptChange = (value: string) => {
        setEditedPrompts({
            ...editedPrompts,
            [activeTab]: value,
        });
    };

    const hasChanges = editedPrompts[activeTab] !== prompts[activeTab];

    return (
        <div className="prompt-editor-container">
            <div className="prompt-editor-header">
                <div>
                    <h2>Prompt Management</h2>
                    <p className="subtitle">Customize how the AI agent processes your emails</p>
                </div>
                <button
                    onClick={handleReset}
                    className="btn btn-secondary"
                    disabled={isResetting}
                >
                    {isResetting ? (
                        <>
                            <Loader2 size={16} className="spin" />
                            Resetting...
                        </>
                    ) : (
                        <>
                            <RotateCcw size={16} />
                            Reset All
                        </>
                    )}
                </button>
            </div>

            <div className="prompt-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`prompt-tab ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <span className="tab-label">{tab.label}</span>
                        <span className="tab-description">{tab.description}</span>
                    </button>
                ))}
            </div>

            <div className="prompt-editor-content">
                <div className="editor-header">
                    <h3>{tabs.find(t => t.id === activeTab)?.label} Prompt</h3>
                    {hasChanges && <span className="unsaved-indicator">Unsaved changes</span>}
                </div>

                <textarea
                    value={editedPrompts[activeTab]}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    className="prompt-textarea"
                    placeholder="Enter your prompt template..."
                />

                <div className="editor-footer">
                    <div className="editor-actions">
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                            disabled={isSaving || !hasChanges}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className="spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Prompt
                                </>
                            )}
                        </button>
                        {saveMessage && (
                            <span className={`save-message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
                                {saveMessage}
                            </span>
                        )}
                    </div>

                    <div className="prompt-help">
                        <p className="help-title">Available Variables:</p>
                        <div className="help-vars">
                            <code>{'{subject}'}</code>
                            <code>{'{sender}'}</code>
                            <code>{'{body}'}</code>
                            <code>{'{tone}'}</code>
                            <code>{'{context}'}</code>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .prompt-editor-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .prompt-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
        }

        .prompt-editor-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .subtitle {
          color: var(--text-muted);
          font-size: 0.9375rem;
        }

        .prompt-tabs {
          display: flex;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
          overflow-x: auto;
        }

        .prompt-tab {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 0.75rem 1rem;
          background: transparent;
          border: 1px solid var(--border-default);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 150px;
        }

        .prompt-tab:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-hover);
        }

        .prompt-tab.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .tab-label {
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .prompt-tab.active .tab-label {
          color: white;
        }

        .tab-description {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .prompt-tab.active .tab-description {
          color: rgba(255, 255, 255, 0.8);
        }

        .prompt-editor-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          overflow-y: auto;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .editor-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .unsaved-indicator {
          color: var(--category-action);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .prompt-textarea {
          flex: 1;
          min-height: 300px;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.9375rem;
          line-height: 1.6;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          resize: vertical;
        }

        .prompt-textarea:focus {
          outline: none;
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .editor-footer {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .editor-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .save-message {
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .save-message.success {
          color: var(--action-complete);
        }

        .save-message.error {
          color: var(--category-urgent);
        }

        .prompt-help {
          padding: 1rem;
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
        }

        .help-title {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .help-vars {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .help-vars code {
          padding: 0.25rem 0.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 4px;
          color: var(--accent-primary);
          font-size: 0.8125rem;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
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
