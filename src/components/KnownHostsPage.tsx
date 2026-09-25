import { Search, Grid3X3, List, Fingerprint, Upload, Calendar, Check, ArrowUpDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore, SortOrder, ViewMode } from '../store';

export function KnownHostsPage() {
  const { knownHosts, knownHostsSort, knownHostsView, setKnownHostsSort, setKnownHostsView } = useStore();
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setSortMenuOpen(false);
      if (viewRef.current && !viewRef.current.contains(event.target as Node)) setViewMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Сортировка
  const sortedHosts = [...knownHosts].sort((a, b) => {
    if (knownHostsSort === 'az') return a.address.localeCompare(b.address);
    if (knownHostsSort === 'za') return b.address.localeCompare(a.address);
    if (knownHostsSort === 'newest') return b.addedAt - a.addedAt;
    if (knownHostsSort === 'oldest') return a.addedAt - b.addedAt;
    return 0;
  });

  const sortOptions: { value: SortOrder; label: string; icon: React.ReactNode }[] = [
    { value: 'az', label: 'A-z', icon: <span className="text-xs bg-[#3a3a4a] px-1.5 py-0.5 rounded text-gray-400">Az</span> },
    { value: 'za', label: 'Z-a', icon: <span className="text-xs bg-[#3a3a4a] px-1.5 py-0.5 rounded text-gray-400">Za</span> },
    { value: 'newest', label: 'Newest to oldest', icon: <Calendar size={14} className="text-gray-400" /> },
    { value: 'oldest', label: 'Oldest to newest', icon: <Calendar size={14} className="text-gray-400" /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="h-14 bg-[#1e1e2e] border-b border-[#2a2a3a] flex items-center px-4 space-x-4 flex-shrink-0">
        <button className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors border border-[#3a3a4a]">
          <Upload size={14} className="mr-1.5" />
          Import
        </button>
        <div className="flex-1" />
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <Search size={16} />
          </button>
          
          {/* Переключатель вида */}
          <div className="relative" ref={viewRef}>
            <button 
              onClick={() => setViewMenuOpen(!viewMenuOpen)}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              {knownHostsView === 'grid' ? <Grid3X3 size={16} /> : <List size={16} />}
            </button>
            {viewMenuOpen && (
              <div className="absolute right-0 top-8 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[140px] z-50">
                <ViewMenuItem 
                  icon={<Grid3X3 size={14} />} 
                  label="Grid" 
                  active={knownHostsView === 'grid'}
                  onClick={() => { setKnownHostsView('grid'); setViewMenuOpen(false); }}
                />
                <ViewMenuItem 
                  icon={<List size={14} />} 
                  label="List" 
                  active={knownHostsView === 'list'}
                  onClick={() => { setKnownHostsView('list'); setViewMenuOpen(false); }}
                />
              </div>
            )}
          </div>

          {/* Меню сортировки */}
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <Calendar size={16} />
            </button>
            {sortMenuOpen && (
              <div className="absolute right-0 top-8 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[180px] z-50">
                {sortOptions.map(opt => (
                  <SortMenuItem 
                    key={opt.value}
                    icon={opt.icon}
                    label={opt.label}
                    active={knownHostsSort === opt.value}
                    onClick={() => { setKnownHostsSort(opt.value); setSortMenuOpen(false); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Known Hosts</h2>
        
        {knownHostsView === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedHosts.map((host, idx) => (
              <div 
                key={host.id} 
                className={`bg-[#252535] border rounded-lg p-4 hover:border-[#4a4a5a] hover:bg-[#2a2a3a] cursor-pointer transition-all ${
                  idx === 0 ? 'border-blue-500' : 'border-[#333]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Fingerprint size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-100 truncate">{host.address}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedHosts.map((host, idx) => (
              <div 
                key={host.id}
                className={`bg-[#252535] border rounded-lg p-3 hover:border-[#4a4a5a] hover:bg-[#2a2a3a] cursor-pointer transition-all flex items-center space-x-3 ${
                  idx === 0 ? 'border-blue-500' : 'border-[#333]'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Fingerprint size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-100">{host.address}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ViewMenuItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center justify-between text-gray-200"
    >
      <span className="flex items-center space-x-2">{icon}<span>{label}</span></span>
      {active && <Check size={14} className="text-blue-400" />}
    </button>
  );
}

function SortMenuItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center justify-between text-gray-200"
    >
      <span className="flex items-center space-x-2">{icon}<span>{label}</span></span>
      {active && <Check size={14} className="text-blue-400" />}
    </button>
  );
}