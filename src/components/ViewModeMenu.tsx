import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Grid3X3, List, Check } from 'lucide-react';

export function ViewModeMenu() {
  const { viewMode, setViewMode } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white transition-colors"
      >
        {viewMode === 'grid' ? <Grid3X3 size={18} /> : <List size={18} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[140px] z-50">
          <button
            onClick={() => { setViewMode('grid'); setIsOpen(false); }}
            className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between transition-colors hover:bg-[#3a3a4a] ${
              viewMode === 'grid' ? 'text-gray-200' : 'text-gray-400'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Grid3X3 size={14} />
              <span>Grid</span>
            </span>
            {viewMode === 'grid' && <Check size={14} className="text-blue-400" />}
          </button>
          <button
            onClick={() => { setViewMode('list'); setIsOpen(false); }}
            className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between transition-colors hover:bg-[#3a3a4a] ${
              viewMode === 'list' ? 'text-gray-200' : 'text-gray-400'
            }`}
          >
            <span className="flex items-center space-x-2">
              <List size={14} />
              <span>List</span>
            </span>
            {viewMode === 'list' && <Check size={14} className="text-blue-400" />}
          </button>
        </div>
      )}
    </div>
  );
}