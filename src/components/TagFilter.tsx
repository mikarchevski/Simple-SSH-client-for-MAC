import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Search, X, Pencil, Trash2, Tag } from 'lucide-react';

export function TagFilter() {
  const { selectedTags, setSelectedTags, tagFilterOpen, setTagFilterOpen, hosts, updateHost } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null); // ✅ Общий контейнер для кнопки и меню
  const inputRef = useRef<HTMLInputElement>(null);

  const allTags = Array.from(new Set(hosts.flatMap(h => h.tags || [])));
  
  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (editingTag && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTag]);

  // ✅ Закрытие по клику вне контейнера
  useEffect(() => {
    if (!tagFilterOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTagFilterOpen(false);
        setSearchQuery('');
        setEditingTag(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tagFilterOpen, setTagFilterOpen]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const startEditing = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTag(tag);
    setEditValue(tag);
  };

  const saveEdit = (oldTag: string, e?: React.MouseEvent | React.FocusEvent) => {
    e?.stopPropagation();
    if (!editValue.trim() || editValue === oldTag) {
      setEditingTag(null);
      return;
    }

    const updatedHosts = hosts.map(host => ({
      ...host,
      tags: host.tags.map(t => t === oldTag ? editValue.trim() : t)
    }));

    updatedHosts.forEach(host => {
      updateHost(host.id, { tags: host.tags });
    });

    if (selectedTags.includes(oldTag)) {
      setSelectedTags(selectedTags.map(t => t === oldTag ? editValue.trim() : t));
    }

    setEditingTag(null);
  };

  const deleteTag = (tagToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedHosts = hosts.map(host => ({
      ...host,
      tags: host.tags.filter(t => t !== tagToDelete)
    }));

    updatedHosts.forEach(host => {
      updateHost(host.id, { tags: host.tags });
    });

    if (selectedTags.includes(tagToDelete)) {
      setSelectedTags(selectedTags.filter(t => t !== tagToDelete));
    }
  };

  return (
    <div 
      ref={containerRef} // ✅ Общий контейнер
      className="relative"
    >
      {/* Кнопка тега */}
      <button 
        onClick={() => {
          // ✅ Если меню открыто - закрываем, иначе открываем
          setTagFilterOpen(!tagFilterOpen);
          if (tagFilterOpen) {
            setSearchQuery('');
            setEditingTag(null);
          }
        }}
        className={`p-1.5 transition-colors ${selectedTags.length > 0 ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
      >
        <Tag size={16} />
      </button>

      {/* Выпадающее меню */}
      {tagFilterOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-2 w-[180px] z-50">
          {/* Поиск */}
          <div className="px-2 mb-2">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#1e1e2e] text-gray-200 rounded px-7 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a] placeholder-gray-500"
                autoFocus
              />
            </div>
          </div>

          {/* Список тегов */}
          <div className="max-h-[250px] overflow-y-auto">
            {filteredTags.map(tag => (
              <div
                key={tag}
                className="group relative flex items-center justify-between px-2 py-1.5 hover:bg-[#3a3a4a] transition-colors"
              >
                {editingTag === tag ? (
                  <div className="flex-1 flex items-center min-w-0">
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(tag);
                        if (e.key === 'Escape') setEditingTag(null);
                      }}
                      onBlur={(e) => saveEdit(tag, e)}
                      className="w-full min-w-0 bg-[#1e1e2e] text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => toggleTag(tag)}
                      className="flex-1 min-w-0 flex items-center space-x-2 text-left"
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedTags.includes(tag) ? 'border-blue-400 bg-blue-400' : 'border-gray-500'
                      }`}>
                        {selectedTags.includes(tag) && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className={`text-xs truncate ${
                        selectedTags.includes(tag) ? 'text-blue-400' : 'text-gray-200'
                      }`}>
                        {tag}
                      </span>
                    </button>
                    
                    <div className="hidden group-hover:flex items-center space-x-0.5 ml-1 flex-shrink-0">
                      <button
                        onClick={(e) => startEditing(tag, e)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors rounded"
                        title="Edit"
                      >
                        <Pencil size={10} />
                      </button>
                      <button
                        onClick={(e) => deleteTag(tag, e)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors rounded"
                        title="Delete"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {filteredTags.length === 0 && (
              <div className="px-2 py-3 text-center text-gray-500 text-xs">
                No tags found
              </div>
            )}
          </div>

          {selectedTags.length > 0 && (
            <div className="mt-1 pt-1 border-t border-[#3a3a4a] px-2">
              <button
                onClick={() => setSelectedTags([])}
                className="w-full text-[10px] text-gray-400 hover:text-gray-200 flex items-center justify-center space-x-1 py-1"
              >
                <X size={10} />
                <span>Clear all</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}