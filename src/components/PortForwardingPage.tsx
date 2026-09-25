import { Plus, ChevronDown, Search, Grid3X3, List, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore, ForwardingType } from '../store';
import { PortForwardingRightPanel } from './PortForwardingRightPanel';
// import { PortForwardingMenu } from './PortForwardingMenu';

export function PortForwardingPage() {
  const { 
    forwardingRules, selectedRuleId, setSelectedRule,
    forwardingPanelOpen, forwardingType, setForwardingType,
    forwardingMenuOpen, setForwardingMenuOpen
  } = useStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setForwardingMenuOpen(false);
      }
    };
    if (forwardingMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [forwardingMenuOpen, setForwardingMenuOpen]);

  const handleNewForwarding = (type: ForwardingType) => {
    setForwardingType(type);
    setForwardingMenuOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Toolbar */}
      <header className="h-14 bg-[#1e1e2e] border-b border-[#2a2a3a] flex items-center px-4 space-x-3 flex-shrink-0">
        {/* Split-button: New forwarding + стрелка */}
{/* Split-button: New forwarding + стрелка */}
<div className="relative" ref={menuRef}>
  <div className="flex rounded-md overflow-hidden border border-[#3a3a4a]">
    <button 
      onClick={() => handleNewForwarding('local')}
      className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-3 py-1.5 text-sm font-medium flex items-center transition-colors border-r border-[#3a3a4a]"
    >
      <Plus size={16} className="mr-1.5" />
      New forwarding
    </button>
    <button 
      onClick={() => setForwardingMenuOpen(!forwardingMenuOpen)}
      className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-2 py-1.5 text-sm font-medium flex items-center transition-colors"
    >
      <ChevronDown size={14} />
    </button>
  </div>

  {/* Меню с fixed позиционированием */}
  {forwardingMenuOpen && (
    <div 
      className="fixed bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[200px] z-[100]"
      style={{
        left: menuRef.current?.getBoundingClientRect().left || 0,
        top: (menuRef.current?.getBoundingClientRect().bottom || 0) + 4,
      }}
    >
      <button
        onClick={() => handleNewForwarding('local')}
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
      >
        <span className="w-5 h-5 rounded bg-gray-500/30 flex items-center justify-center text-xs font-semibold text-gray-300">L</span>
        <span>Local Forwarding</span>
      </button>
      <button
        onClick={() => handleNewForwarding('remote')}
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
      >
        <span className="w-5 h-5 rounded bg-gray-500/30 flex items-center justify-center text-xs font-semibold text-gray-300">R</span>
        <span>Remote Forwarding</span>
      </button>
      <button
        onClick={() => handleNewForwarding('dynamic')}
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
      >
        <span className="w-5 h-5 rounded bg-gray-500/30 flex items-center justify-center text-xs font-semibold text-gray-300">D</span>
        <span>Dynamic Forwarding</span>
      </button>
    </div>
  )}
</div>

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
          {forwardingRules.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Port Forwarding</h2>
              <div className="space-y-2">
                {forwardingRules.map(rule => (
                  <RuleCard 
                    key={rule.id}
                    rule={rule}
                    isSelected={selectedRuleId === rule.id}
                    onClick={() => {
                      setSelectedRule(rule.id);
                      setForwardingType(rule.type);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <PortForwardingRightPanel />
      </div>

      {/* {forwardingMenuOpen && <PortForwardingMenu onSelect={handleNewForwarding} />} */}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#2a2a3a] flex items-center justify-center mx-auto">
          <ArrowRight size={32} className="text-gray-300" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">Set up port forwarding</h2>
          <p className="text-sm text-gray-400 max-w-[350px]">
            Save port forwarding to access databases, web apps, and other services.
          </p>
        </div>
      </div>
    </div>
  );
}

function RuleCard({ rule, isSelected, onClick }: { rule: any; isSelected: boolean; onClick: () => void }) {
  const typeLetter = rule.type === 'local' ? 'L' : rule.type === 'remote' ? 'R' : 'D';
  const typeLabel = rule.type === 'local' ? 'Local Rule' : rule.type === 'remote' ? 'Remote Rule' : 'Dynamic Rule';

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
        <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center text-gray-200 font-semibold">
          {typeLetter}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-100 truncate">
            {rule.label || typeLabel}
          </h3>
          {rule.localPort && (
            <p className="text-xs text-gray-500 mt-0.5">
              {rule.localPort} → {rule.remoteHost}:{rule.remotePort}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}