"use client";

import { Email, EmailCategory } from '@/lib/types';
import { format } from 'date-fns';
import { Check, Mail, Clock, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ActionItemsProps {
  emails: Email[];
  onEmailClick: (email: Email) => void;
  onToggleComplete: (emailId: string) => void;
}

export default function ActionItems({ emails, onEmailClick, onToggleComplete }: ActionItemsProps) {
  // Filter emails that are categorized as "To-Do"
  const todoEmails = useMemo(() => {
    return emails.filter(email => email.category === EmailCategory.TODO);
  }, [emails]);

  const completedCount = todoEmails.filter(email => email.is_read).length;
  const totalCount = todoEmails.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Sort: Pending first, then by date
  const sortedEmails = useMemo(() => {
    return [...todoEmails].sort((a, b) => {
      // First sort by read status (pending first)
      if (a.is_read !== b.is_read) {
        return a.is_read ? 1 : -1;
      }
      // Then sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [todoEmails]);

  const isOverdue = (dateString: string) => {
    try {
      return new Date(dateString) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className="action-items-container">
      <div className="progress-header">
        <div className="progress-info">
          <h2>Task Progress</h2>
          <span className="percentage">{progressPercentage}%</span>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="action-list">
        {sortedEmails.length === 0 ? (
          <div className="empty-state">
            <p>No action items found.</p>
          </div>
        ) : (
          sortedEmails.map(email => {
            const isCompleted = email.is_read; // Assuming is_read tracks completion for now based on previous code
            const overdue = !isCompleted && isOverdue(email.date);

            return (
              <div
                key={email.id}
                className={`action-item ${isCompleted ? 'completed' : ''}`}
                onClick={() => onEmailClick(email)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(email.id);
                  }}
                  className={`checkbox-btn ${isCompleted ? 'checked' : ''}`}
                  aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                >
                  {isCompleted && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="item-content">
                  <div className="item-main">
                    <span className="item-subject">{email.subject}</span>
                    {overdue && (
                      <span className="overdue-badge" title="Overdue">
                        <AlertCircle size={12} />
                      </span>
                    )}
                  </div>
                  <div className="item-meta">
                    <span className="meta-text">{email.sender}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .action-items-container {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          padding: 2rem;
        }

        .progress-header {
          margin-bottom: 2.5rem;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.75rem;
        }

        .progress-info h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .percentage {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .progress-bar-bg {
          width: 100%;
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--accent-primary); /* Blue theme */
          border-radius: 4px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .action-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .action-item:hover {
          opacity: 0.8;
        }

        .checkbox-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid var(--border-default);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          color: white;
          transition: all 0.2s ease;
        }

        .checkbox-btn:hover {
          border-color: var(--accent-primary);
        }

        .checkbox-btn.checked {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .item-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .item-main {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .item-subject {
          font-size: 1.125rem;
          color: var(--text-primary);
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .completed .item-subject {
          color: var(--text-muted);
        }

        .item-meta {
          display: flex;
          align-items: center;
        }

        .meta-text {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .overdue-badge {
          color: var(--error);
          display: flex;
          align-items: center;
        }

        .empty-state {
          text-align: center;
          color: var(--text-muted);
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}
