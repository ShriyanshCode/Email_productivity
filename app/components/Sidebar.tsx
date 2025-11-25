"use client";

import { Inbox, CheckSquare, FileText, MessageSquare, Settings, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewType } from '@/lib/types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  actionItemCount?: number;
  onUploadClick: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ activeView, onViewChange, actionItemCount = 0, onUploadClick, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const menuItems = [
    { id: 'inbox' as ViewType, icon: Inbox, label: 'Inbox' },
    { id: 'action-items' as ViewType, icon: CheckSquare, label: 'Action Items', count: actionItemCount },
    { id: 'drafts' as ViewType, icon: FileText, label: 'Drafts' },
    { id: 'chat' as ViewType, icon: MessageSquare, label: 'Chat' },
    { id: 'settings' as ViewType, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h1 className="sidebar-title">Email Agent</h1>}
        {onToggleCollapse && (
          <button onClick={onToggleCollapse} className="collapse-btn" title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="nav-item-text">{item.label}</span>}
              {!isCollapsed && item.count !== undefined && item.count > 0 && (
                <span className="action-badge">{item.count}</span>
              )}
              {isCollapsed && item.count !== undefined && item.count > 0 && (
                <span className="action-badge-dot"></span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onUploadClick} className="upload-btn" title={isCollapsed ? "Upload Email JSON" : undefined}>
          <Upload size={18} />
          {!isCollapsed && <span>Upload</span>}
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: clamp(200px, 15vw, 240px);
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.3s ease;
        }

        .sidebar.collapsed {
          width: 60px;
        }

        .sidebar-header {
          padding: 1.5rem 1rem;
          border-bottom: 1px solid var(--border-default);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          min-height: 72px;
        }

        .sidebar.collapsed .sidebar-header {
          padding: 1.5rem 0.5rem;
          justify-content: center;
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
        }

        .collapse-btn {
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all var(--transition-base);
          flex-shrink: 0;
        }

        .collapse-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.5rem;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          margin-bottom: 0.25rem;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: var(--text-secondary);
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
          width: 100%;
          text-align: left;
          position: relative;
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 0.75rem 0.5rem;
        }

        .nav-item svg {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          transition: transform var(--transition-base);
        }

        .nav-item:hover {
          background: var(--nav-hover-bg);
          color: var(--text-primary);
        }

        .nav-item:hover svg {
          transform: scale(1.1);
        }

        .nav-item.active {
          background: var(--nav-active-bg);
          color: var(--accent-primary);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--accent-primary);
          border-radius: 0 2px 2px 0;
        }

        .nav-item-text {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .action-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 0.375rem;
          background: var(--accent-primary);
          color: white;
          border-radius: 10px;
          font-size: 0.6875rem;
          font-weight: 600;
          box-shadow: 0 0 8px var(--accent-glow);
        }

        .action-badge-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--accent-primary);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--accent-glow);
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-default);
        }

        .sidebar.collapsed .sidebar-footer {
          padding: 1rem 0.5rem;
        }

        .upload-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .upload-btn svg {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          transition: transform var(--transition-base);
        }

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--accent-glow);
        }

        .upload-btn:hover svg {
          transform: scale(1.1);
        }

        .upload-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
