import React from 'react';

interface FormattedMessageProps {
    content: string;
}

export default function FormattedMessage({ content }: FormattedMessageProps) {
    // Remove unnecessary ** markdown and format properly
    const formatMessage = (text: string): React.ReactNode[] => {
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        let listItems: string[] = [];
        let inList = false;

        lines.forEach((line, index) => {
            // Remove ** markdown
            line = line.replace(/\*\*/g, '');

            // Check if it's a list item
            const listMatch = line.match(/^[\d]+\.\s+(.+)$/);

            if (listMatch) {
                if (!inList) {
                    inList = true;
                    listItems = [];
                }
                listItems.push(listMatch[1]);
            } else {
                // If we were in a list, render it
                if (inList && listItems.length > 0) {
                    elements.push(
                        <ol key={`list-${index}`} className="formatted-list">
                            {listItems.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ol>
                    );
                    listItems = [];
                    inList = false;
                }

                // Render regular line
                if (line.trim()) {
                    elements.push(
                        <p key={`p-${index}`} className="formatted-paragraph">
                            {line}
                        </p>
                    );
                }
            }
        });

        // Handle remaining list items
        if (inList && listItems.length > 0) {
            elements.push(
                <ol key="list-final" className="formatted-list">
                    {listItems.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ol>
            );
        }

        return elements;
    };

    return (
        <div className="formatted-message">
            {formatMessage(content)}

            <style jsx>{`
        .formatted-message {
          line-height: 1.7;
        }

        .formatted-paragraph {
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .formatted-paragraph:last-child {
          margin-bottom: 0;
        }

        .formatted-list {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
          list-style-position: outside;
        }

        .formatted-list li {
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
          color: var(--text-primary);
        }

        .formatted-list li:last-child {
          margin-bottom: 0;
        }

        .formatted-list li::marker {
          color: var(--accent-primary);
          font-weight: 600;
        }
      `}</style>
        </div>
    );
}
