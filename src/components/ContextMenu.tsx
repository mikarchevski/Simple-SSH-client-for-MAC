import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import {
  Zap, Plug, LayoutGrid, Pencil, Users, ArrowRight,
  Copy, FileText, Link2, Trash2, Folder
} from 'lucide-react';

export function ContextMenu() {
  const { 
    contextMenu, 
    closeContextMenu, 
    hosts, 
    groups,
    openDeleteModal, 
    duplicateHost,
    duplicateGroup,
    openDeleteGroupModal,
    setEditingGroupId,
    openNewHostPanel
  } = useStore();

  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const isOpen = contextMenu !== null;
  const isGroup = !!contextMenu?.groupId;
  const isHost = !!contextMenu?.hostId;

  const selectedHostId = contextMenu?.hostId || null;
  const selectedHost = selectedHostId ? hosts.find(h => h.id === selectedHostId) : undefined;

  const selectedGroupId = contextMenu?.groupId || null;
  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : undefined;

  // Умное позиционирование (работает и для хостов, и для групп)
  useEffect(() => {
    if (!contextMenu) return;

    const menuWidth = isGroup ? 200 : 260; // Группа чуть уже
    const menuHeight = isGroup ? 180 : 420;
    const padding = 8;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let x = contextMenu.x + padding;
    if (x + menuWidth > viewportWidth - padding) {
      x = contextMenu.x - menuWidth - padding;
    }
    if (x < padding) x = padding;
    if (x + menuWidth > viewportWidth - padding) {
      x = viewportWidth - menuWidth - padding;
    }

    const spaceBelow = viewportHeight - contextMenu.y;
    const spaceAbove = contextMenu.y;
    
    let y: number;
    let availableHeight: number;

    if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
      y = contextMenu.y + padding;
      availableHeight = Math.min(spaceBelow - padding, menuHeight);
    } else {
      y = contextMenu.y - availableHeight; 
      availableHeight = Math.min(spaceAbove - padding, menuHeight);
      y = contextMenu.y - availableHeight;
    }

    if (y < padding) {
      y = padding;
      availableHeight = Math.min(viewportHeight - padding * 2, menuHeight);
    }
    
    if (y + availableHeight > viewportHeight - padding) {
      availableHeight = viewportHeight - y - padding;
    }

    menuRef.current?.style.setProperty('--menu-max-height', `${availableHeight}px`);
    setPosition({ x, y });
  }, [contextMenu, isGroup]);

  // Закрытие по клику вне меню
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeContextMenu]);

  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeContextMenu]);

  // Если меню закрыто или нет ни хоста, ни группы — не рендерим ничего
  if (!isOpen || (!isHost && !isGroup)) return null;

  // --- МЕНЮ ДЛЯ ГРУППЫ ---
  if (isGroup && selectedGroup) {
    return (
      <div
        ref={menuRef}
        className="fixed z-[9999] bg-[#252535] border border-[#3a3a4a] rounded-xl shadow-2xl py-1.5 min-w-[200px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <button
          onClick={() => {
            if (selectedGroupId) {
              setEditingGroupId(selectedGroupId);
              openNewHostPanel();
              closeContextMenu();
            }
          }}
          className="w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-[#3a3a4a] transition-colors flex items-center space-x-3"
        >
          <Pencil size={16} /> <span>Edit group Details</span>
        </button>
        
        <button
          onClick={() => {
            if (selectedGroupId) {
              duplicateGroup(selectedGroupId);
              closeContextMenu();
            }
          }}
          className="w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-[#3a3a4a] transition-colors flex items-center space-x-3"
        >
          <Copy size={16} /> <span>Duplicate</span>
        </button>
        
        <div className="my-1 border-t border-[#3a3a4a]" />
        
        <button
          onClick={() => {
            if (selectedGroupId) {
              openDeleteGroupModal(selectedGroupId);
              closeContextMenu();
            }
          }}
          className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center space-x-3"
        >
          <Trash2 size={16} /> <span>Delete</span>
        </button>
      </div>
    );
  }

  // --- МЕНЮ ДЛЯ ХОСТА ---
  if (isHost && selectedHost) {
    const menuItems = [
      { icon: <Zap size={16} />, label: 'Quick Connect', action: () => { useStore.getState().addConnectionTab(selectedHostId!); closeContextMenu(); } },
      { icon: <Plug size={16} />, label: 'Connect', hasSubmenu: true, action: () => { useStore.getState().addConnectionTab(selectedHostId!); closeContextMenu(); } },
      { icon: <LayoutGrid size={16} />, label: 'Add to Workspace', hasSubmenu: true, action: () => closeContextMenu() },
      { divider: true },
      { icon: <Pencil size={16} />, label: 'Edit Host Details', shortcut: 'E', action: () => { useStore.getState().openHostDetails(selectedHostId!); closeContextMenu(); } },
      { icon: <Users size={16} />, label: 'Collaborate', action: () => closeContextMenu() },
      { icon: <ArrowRight size={16} />, label: 'Move to', hasSubmenu: true, action: () => closeContextMenu() },
      { icon: <Copy size={16} />, label: 'Copy to', hasSubmenu: true, action: () => closeContextMenu() },
      { icon: <FileText size={16} />, label: 'Duplicate', action: () => { duplicateHost(selectedHostId!); closeContextMenu(); } },
      { icon: <Link2 size={16} />, label: 'Copy Link', action: () => closeContextMenu() },
      { divider: true },
      { icon: <Trash2 size={16} />, label: 'Remove', danger: true, action: () => { openDeleteModal(selectedHostId!); closeContextMenu(); } },
    ];

    return (
      <div
        ref={menuRef}
        className="fixed z-[9999] bg-[#252535] border border-[#3a3a4a] rounded-xl shadow-2xl py-1.5 min-w-[240px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          maxHeight: 'var(--menu-max-height, 420px)',
          overflowY: 'auto',
        }}
      >
        <style>{`
          .context-menu-scroll::-webkit-scrollbar { width: 6px; }
          .context-menu-scroll::-webkit-scrollbar-track { background: transparent; }
          .context-menu-scroll::-webkit-scrollbar-thumb { background: #3a3a4a; border-radius: 3px; }
          .context-menu-scroll::-webkit-scrollbar-thumb:hover { background: #4a4a5a; }
        `}</style>

        <div className="context-menu-scroll">
          {menuItems.map((item, idx) => {
            if ('divider' in item && item.divider) {
              return <div key={idx} className="my-1 border-t border-[#3a3a4a]" />;
            }

            const menuItem = item as {
              icon: React.ReactNode;
              label: string;
              shortcut?: string;
              hasSubmenu?: boolean;
              danger?: boolean;
              action: () => void;
            };

            return (
              <button
                key={idx}
                onClick={menuItem.action}
                className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between transition-colors ${
                  menuItem.danger
                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    : 'text-gray-200 hover:bg-[#3a3a4a]'
                }`}
              >
                <span className="flex items-center space-x-3">
                  {menuItem.icon}
                  <span>{menuItem.label}</span>
                </span>
                <span className="flex items-center space-x-2">
                  {menuItem.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-xs bg-[#1e1e2e] rounded border border-[#3a3a4a] text-gray-400">
                      {menuItem.shortcut}
                    </kbd>
                  )}
                  {menuItem.hasSubmenu && <ArrowRight size={14} className="text-gray-500" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}