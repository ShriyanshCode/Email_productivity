"use client";

import { Email, EmailCategory } from '@/lib/types';
import { format } from 'date-fns';
import { Reply, Archive, Trash2, Sparkles } from 'lucide-react';

interface EmailViewerProps {
  email: Email | null;
  onReply?: (email: Email) => void;
  onExtractActions?: (email: Email) => void;
}

export default function EmailViewer({ email, onReply, onExtractActions }: EmailViewerProps) {
  if (!email) {
    return (
      <div className="email-viewer-empty">
        {/*<Sparkles size={48} className="empty-icon" />*/}
        {/*<p>Select an email to view</p>*/}
        <style jsx>{`
          .email-viewer-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--text-muted);
            gap: 1rem;
          }
          .empty-icon {
            opacity: 0.5;
          }
        `}</style>
      </div>
    );
  }

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

  const formatFullDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="email-viewer">
      <div className="email-header">
        <div className="email-meta">
          <h2 className="email-subject">{email.subject}</h2>
          {email.category && (
            <span className={getCategoryBadgeClass(email.category)}>
              {email.category}
            </span>
          )}
        </div>

        <div className="email-info">
          <div className="email-from">
            <span className="label">From:</span>
            <span className="value">{email.sender} &lt;{email.sender_email}&gt;</span>
          </div>
          <div className="email-to">
            <span className="label">To:</span>
            <span className="value">{email.recipient}</span>
          </div>
          <div className="email-date-full">
            <span className="label">Date:</span>
            <span className="value">{formatFullDate(email.date)}</span>
          </div>
        </div>

        <div className="email-actions">
          {onReply && (
            <button onClick={() => onReply(email)} className="btn btn-primary">
              <Reply size={16} />
              Reply
            </button>
          )}
          {onExtractActions && (
            <button onClick={() => onExtractActions(email)} className="btn btn-secondary">
              <Sparkles size={16} />
              Extract Actions
            </button>
          )}
          <button className="btn btn-secondary">
            <Archive size={16} />
            Archive
          </button>
          <button className="btn btn-secondary">
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="email-body">
        <div className="email-content">
          {email.body.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      <style jsx>{`
        .email-viewer {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          overflow-y: auto;
        }

        .email-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-default);
          background: var(--bg-secondary);
        }

        .email-meta {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .email-subject {
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--text-primary);
          flex: 1;
          min-width: 200px;
          line-height: 1.3;
        }

        .email-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          font-size: 0.875rem;
        }

        .email-from, .email-to, .email-date-full {
          display: flex;
          gap: 0.75rem;
        }

        .label {
          color: var(--text-muted);
          font-weight: 500;
          min-width: 45px;
          flex-shrink: 0;
        }

        .value {
          color: var(--text-primary);
          word-break: break-word;
        }

        .email-actions {
          display: flex;
          gap: 0.625rem;
          flex-wrap: wrap;
        }

        .email-body {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .email-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
