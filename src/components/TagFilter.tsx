import { Search, Check, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';

export function TagFilter() {
  const { hosts, selectedTags, toggleTag, clearTags, tagFilterOpen, setTagFilterOpen } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setTagFilterOpen(false);
      }
    };
    if (tagFilterOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tagFilterOpen, setTagFilterOpen]);

  // Собираем все уникальные теги
  const allTags = Array.from(new Set(hosts.flatMap(h => h.tags))).sort();
  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!tagFilterOpen) return null;

  return (
    <div ref={menuRef} className="absolute right-20 top-12 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl p-3 min-w-[200px] z-50">
      {/* Поиск тегов */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1e1e2e] text-gray-200 rounded-md pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a] placeholder-gray-500"
          placeholder="Search tags"
        />
      </div>

      {/* Список тегов */}
      <div className="space-y-1 max-h-[200px] overflow-y-auto">
        {filteredTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className="w-full px-2 py-1.5 text-sm text-left hover:bg-[#3a3a4a] rounded transition-colors flex items-center space-x-2"
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selectedTags.includes(tag) ? 'bg-blue-500 border-blue-500' : 'border-gray-500'
            }`}>
              {selectedTags.includes(tag) && <Check size={10} className="text-white" />}
            </div>
            <span className="text-gray-200">{tag}</span>
          </button>
        ))}
      </div>

      {/* Кнопка очистки */}
      {selectedTags.length > 0 && (
        <button
          onClick={clearTags}
          className="w-full mt-2 pt-2 border-t border-[#3a3a4a] text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          Clear selection
        </button>
      )}
    </div>
  );
}