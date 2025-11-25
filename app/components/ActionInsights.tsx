"use client";

"use client";

import { useState } from 'react';
import { ActionItem } from '../lib/types';
import { Sparkles, X, Minimize2, Maximize2, Plus, Check } from 'lucide-react';
import { format } from 'date-fns';

interface ActionInsightsProps {
  actionItems: ActionItem[];
  onClose: () => void;
  onAddToActionItems: (selectedItems: ActionItem[]) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function ActionInsights({
  actionItems,
  onClose,
  onAddToActionItems,
  isMinimized = false,
  onToggleMinimize
}: ActionInsightsProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [crossedOutItems, setCrossedOutItems] = useState<Set<string>>(new Set());
  const [isMaximized, setIsMaximized] = useState(false);

  const handleToggleSelect = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
      // Remove from crossed out if it was crossed out
      const newCrossedOut = new Set(crossedOutItems);
      newCrossedOut.delete(itemId);
      setCrossedOutItems(newCrossedOut);
    }
    setSelectedItems(newSelected);
  };

  const handleToggleCrossOut = (itemId: string) => {
    const newCrossedOut = new Set(crossedOutItems);
    if (newCrossedOut.has(itemId)) {
      newCrossedOut.delete(itemId);
    } else {
      newCrossedOut.add(itemId);
      // Remove from selected if it was selected
      const newSelected = new Set(selectedItems);
      newSelected.delete(itemId);
      setSelectedItems(newSelected);
    }
    setCrossedOutItems(newCrossedOut);
  };

  const handleAddSelected = () => {
    const itemsToAdd = actionItems.filter(item => selectedItems.has(item.id));
    onAddToActionItems(itemsToAdd);
    setSelectedItems(new Set());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    // If we're maximizing, ensure we're not minimized
    if (!isMaximized && isMinimized && onToggleMinimize) {
      onToggleMinimize();
    }
  };

  return (
    <div className={`action-insights-panel ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}>
      <div className="panel-header">
        <div className="header-left">
          <Sparkles size={18} className="header-icon" />
          <h3 className="panel-title">AI Extracted Action Items</h3>
          {selectedItems.size > 0 && !isMinimized && (
            <span className="selected-count">{selectedItems.size} selected</span>
          )}
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
          <button onClick={onClose} className="icon-btn" title="Close">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="panel-content">
          <div className="insights-list">
            {actionItems.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const isCrossedOut = crossedOutItems.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`insight-item ${isSelected ? 'selected' : ''} ${isCrossedOut ? 'crossed-out' : ''}`}
                >
                  <button
                    onClick={() => handleToggleCrossOut(item.id)}
                    className="cross-out-btn"
                    title={isCrossedOut ? "Undo cross out" : "Cross out (don't want)"}
                  >
                    <X size={16} />
                  </button>

                  <div className="item-content">
                    <p className="item-description">{item.description}</p>
                    <div className="item-meta">
                      {item.deadline && (
                        <span className="item-deadline">Due: {formatDate(item.deadline)}</span>
                      )}
                      <span className={`priority-badge priority-${item.priority.toLowerCase()}`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSelect(item.id)}
                    className={`select-btn ${isSelected ? 'selected' : ''}`}
                    disabled={isCrossedOut}
                    title={isSelected ? "Deselect" : "Select to add"}
                  >
                    {isSelected ? <Check size={18} /> : <Plus size={18} />}
                  </button>
                </div>
              );
            })}
          </div>

          {selectedItems.size > 0 && (
            <div className="panel-footer">
              <button onClick={handleAddSelected} className="add-btn">
                <Plus size={16} />
                Add {selectedItems.size} to Action Items
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .action-insights-panel {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          height: 50vh;
          max-height: 80vh;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
        }

        .action-insights-panel.minimized {
          height: 48px;
          overflow: hidden;
        }

        .action-insights-panel.maximized {
          height: 100%;
          max-height: 100%;
          border-top: none;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: rgba(59, 130, 246, 0.05);
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
          flex-shrink: 0;
          height: 48px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 0;
        }

        .header-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
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

        .selected-count {
          padding: 0.25rem 0.5rem;
          background: var(--accent-primary);
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
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

        .panel-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .insights-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          transition: all var(--transition-base);
        }

        .insight-item:hover {
          border-color: var(--border-hover);
          box-shadow: var(--shadow-sm);
        }

        .insight-item.selected {
          background: rgba(59, 130, 246, 0.1);
          border-color: var(--accent-primary);
        }

        .insight-item.crossed-out {
          opacity: 0.5;
          background: var(--bg-tertiary);
        }

        .insight-item.crossed-out .item-description {
          text-decoration: line-through;
        }

        .cross-out-btn {
          background: transparent;
          border: 1px solid var(--border-default);
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.375rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--transition-base);
        }

        .cross-out-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--error);
          color: var(--error);
        }

        .insight-item.crossed-out .cross-out-btn {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--error);
          color: var(--error);
        }

        .item-content {
          flex: 1;
          min-width: 0;
        }

        .item-description {
          color: var(--text-primary);
          font-size: 0.9375rem;
          line-height: 1.5;
          margin: 0 0 0.5rem 0;
        }

        .item-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .item-deadline {
          color: var(--text-muted);
          font-size: 0.8125rem;
        }

        .priority-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .priority-high {
          background: rgba(239, 68, 68, 0.2);
          color: var(--category-urgent);
        }

        .priority-medium {
          background: rgba(245, 158, 11, 0.2);
          color: var(--category-action);
        }

        .priority-low {
          background: rgba(59, 130, 246, 0.2);
          color: var(--category-informational);
        }

        .select-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--transition-base);
        }

        .select-btn:hover:not(:disabled) {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }

        .select-btn.selected {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }

        .select-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .panel-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-default);
          background: var(--bg-primary);
          flex-shrink: 0;
        }

        .add-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--accent-glow);
        }

        .add-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
