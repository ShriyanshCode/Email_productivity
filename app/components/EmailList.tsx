"use client";

import { Email, EmailCategory } from '@/lib/types';
import { format } from 'date-fns';
import { Paperclip, Trash2 } from 'lucide-react';

interface EmailListProps {
  emails: Email[];
  selectedEmailId?: string;
  onEmailSelect: (email: Email) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onDelete?: (email: Email) => void;
}

export default function EmailList({
  emails,
  selectedEmailId,
  onEmailSelect,
  searchQuery = '',
  onSearchChange,
  onDelete
}: EmailListProps) {

  const getCategoryBadgeClass = (category?: EmailCategory) => {
    if (!category) return 'badge';

    const categoryMap: Record<string, string> = {
      [EmailCategory.IMPORTANT]: 'badge-urgent',
      [EmailCategory.TODO]: 'badge-action',
      [EmailCategory.INFORMATIONAL]: 'badge-informational',
      [EmailCategory.NEWSLETTER]: 'badge-newsletter',
      [EmailCategory.SPAM]: 'badge-spam',
    };

    return `badge ${categoryMap[category] || 'badge'}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return format(date, 'h:mm a');
      } else if (diffInHours < 168) {
        return format(date, 'EEE');
      } else {
        return format(date, 'MMM d');
      }
    } catch {
      return dateString;
    }
  };

  const filteredEmails = searchQuery
    ? emails.filter(email =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : emails;

  return (
    <div className="email-list-container">
      {onSearchChange && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      <div className="email-list">
        {filteredEmails.length === 0 ? (
          <div className="empty-state">
            <p>No emails found</p>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => onEmailSelect(email)}
              className={`email-item ${selectedEmailId === email.id ? 'selected' : ''} ${!email.is_read ? 'unread' : ''}`}
            >
              <div className="email-item-header">
                <span className="email-sender">{email.sender}</span>
                <div className="header-right">
                  <span className="email-date">{formatDate(email.date)}</span>
                  {onDelete && (
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(email);
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="email-subject-row">
                <span className="email-subject">{email.subject}</span>
                {email.has_attachments && (
                  <Paperclip size={14} className="attachment-icon" />
                )}
              </div>

              <p className="email-preview">{email.preview}</p>

              <div className="email-item-footer">
                {email.category && (
                  <span className={getCategoryBadgeClass(email.category)}>
                    {email.category}
                  </span>
                )}
                {!email.is_read && <span className="unread-dot"></span>}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .email-list-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-primary);
        }

        .search-bar {
          padding: 1rem;
          border-bottom: 1px solid var(--border-default);
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.9375rem;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .email-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
        }

        .email-item {
          padding: 0.875rem;
          background: var(--email-item-bg);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .email-item:hover {
          background: var(--email-item-hover);
          border-color: var(--border-hover);
          transform: translateX(2px);
        }

        .email-item.selected {
          background: var(--email-item-selected);
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-md);
        }

        .email-item.unread {
          border-left: 3px solid var(--email-unread-indicator);
        }

        .email-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .email-sender {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .email-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .delete-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .email-item:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .email-subject-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .email-subject {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .attachment-icon {
          color: var(--text-muted);
          flex-shrink: 0;
          width: 14px;
          height: 14px;
        }

        .email-preview {
          color: var(--text-secondary);
          font-size: 0.8125rem;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          margin-bottom: 0.625rem;
        }

        .email-item-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .unread-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-primary);
          border-radius: 50%;
          margin-left: auto;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
