import { Plus, ChevronDown, Search, Grid3X3, List, Clock, Code2, Package } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { SnippetRightPanel } from './SnippetRightPanel';
import { SnippetMenu } from './SnippetMenu';

export function SnippetsPage() {
  const { 
    snippets, shellHistory, selectedSnippetId, setSelectedSnippet,
    snippetPanelOpen, setSnippetPanelOpen,
    snippetMenuOpen, setSnippetMenuOpen,
    showShellHistory, setShowShellHistory
  } = useStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSnippetMenuOpen(false);
      }
    };
    if (snippetMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [snippetMenuOpen, setSnippetMenuOpen]);

  const handleNewSnippet = () => {
    const newSnippet = {
      id: `s${Date.now()}`,
      label: '',
      script: '',
      targets: [],
      createdAt: Date.now(),
    };
    useStore.getState().addSnippet(newSnippet);
    useStore.getState().setSelectedSnippet(newSnippet.id);
    setSnippetPanelOpen(true);
    setSnippetMenuOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Toolbar */}
      <header className="h-14 bg-[#1e1e2e] border-b border-[#2a2a3a] flex items-center px-4 space-x-3 flex-shrink-0">
        {/* Split-button: New snippet + стрелка */}
            {/* Split-button: New snippet + стрелка */}
<div className="relative" ref={menuRef}>
  <div className="flex rounded-md overflow-hidden border border-[#3a3a4a]">
    <button 
      onClick={handleNewSnippet}
      className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-3 py-1.5 text-sm font-medium flex items-center transition-colors border-r border-[#3a3a4a]"
    >
      <Plus size={16} className="mr-1.5" />
      New snippet
    </button>
    <button 
      onClick={() => setSnippetMenuOpen(!snippetMenuOpen)}
      className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-2 py-1.5 text-sm font-medium flex items-center transition-colors"
    >
      <ChevronDown size={14} />
    </button>
  </div>

  {snippetMenuOpen && (
    <div 
      className="fixed bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[200px] z-[100]"
      style={{
        left: menuRef.current?.getBoundingClientRect().left || 0,
        top: (menuRef.current?.getBoundingClientRect().bottom || 0) + 4,
      }}
    >
      <button
        onClick={() => {
          // Логика создания пакета сниппетов
          setSnippetMenuOpen(false);
        }}
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
      >
        <Package size={14} className="text-gray-400" />
        <span>New snippet package</span>
      </button>
    </div>
  )}
</div>

        <button
          onClick={() => setShowShellHistory(!showShellHistory)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${
            showShellHistory ? 'bg-[#3a3a4a] text-white' : 'text-gray-300 hover:bg-[#2a2a3a]'
          }`}
        >
          <Clock size={16} className="mr-1.5" />
          Shell History
        </button>

        <div className="flex-1" />

        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <Search size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <Grid3X3 size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <List size={16} />
          </button>
        </div>
      </header>

      {/* Контент */}
      <div className="flex-1 flex">
        <div className="flex-1 p-6">
          {showShellHistory ? (
            <ShellHistoryView />
          ) : snippets.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Snippets</h2>
              <div className="space-y-2">
                {snippets.map(snippet => (
                  <SnippetCard 
                    key={snippet.id}
                    snippet={snippet}
                    isSelected={selectedSnippetId === snippet.id}
                    onClick={() => {
                      setSelectedSnippet(snippet.id);
                      setSnippetPanelOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <SnippetRightPanel />
      </div>

      {snippetMenuOpen && <SnippetMenu onNewSnippet={handleNewSnippet} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#2a2a3a] flex items-center justify-center mx-auto">
          <Code2 size={32} className="text-gray-300" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">Create snippet</h2>
          <p className="text-sm text-gray-400 max-w-[350px]">
            Save your most used commands as snippets to reuse them in one click.
          </p>
        </div>
      </div>
    </div>
  );
}

function SnippetCard({ snippet, isSelected, onClick }: { snippet: any; isSelected: boolean; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-[#252535] border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-500/5' 
          : 'border-[#333] hover:border-[#4a4a5a] hover:bg-[#2a2a3a]'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
          <Code2 size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-100 truncate">
            {snippet.label || 'Set a Label or Script...'}
          </h3>
          {snippet.script && (
            <p className="text-xs text-gray-500 mt-0.5 truncate font-mono">
              {snippet.script.substring(0, 50)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ShellHistoryView() {
  const { shellHistory } = useStore();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Shell History</h2>
      <div className="space-y-1">
        {shellHistory.map(entry => (
          <div 
            key={entry.id}
            className="bg-[#252535] border border-[#333] rounded-lg p-3 hover:border-[#4a4a5a] hover:bg-[#2a2a3a] cursor-pointer transition-all"
          >
            <code className="text-sm text-gray-200 font-mono block truncate">
              {entry.command}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}