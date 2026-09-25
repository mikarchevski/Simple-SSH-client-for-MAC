import { Key, FileText, Fingerprint, Usb, Search, Grid3X3, List, Plus, ChevronDown, CreditCard } from 'lucide-react';import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { KeyRightPanel } from './KeyRightPanel';
// import { KeyMenu } from './KeyMenu';

export function KeychainPage() {
  const { 
    keys, selectedKeyId, setSelectedKey, 
    keyPanelMode, setKeyPanelMode,
    keyMenuOpen, setKeyMenuOpen
  } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setKeyMenuOpen(false);
      }
    };
    if (keyMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [keyMenuOpen, setKeyMenuOpen]);

  const filteredKeys = keys.filter(k => 
    k.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewKey = () => {
    const newKey = {
      id: `k${Date.now()}`,
      label: '',
      type: 'unknown' as const,
      createdAt: Date.now(),
    };
    // Добавляем ключ и сразу открываем панель
    useStore.getState().addKey(newKey);
    useStore.getState().setSelectedKey(newKey.id);
    useStore.getState().setKeyPanelMode('new');
  };

  const handleTouchID = () => {
    setKeyPanelMode('touch-id');
  };

  const handleFIDO2 = () => {
    setKeyPanelMode('fido2');
  };

  const handleCertificate = () => {
    setKeyPanelMode('certificate');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Toolbar */}
      <header className="h-14 bg-[#1e1e2e] border-b border-[#2a2a3a] flex items-center px-4 space-x-3 flex-shrink-0">
        {/* Split-button: New key + стрелка */}
<div className="relative">
  <div className="flex rounded-md overflow-hidden border border-[#3a3a4a]">
    <button 
      onClick={handleNewKey}
      className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-3 py-1.5 text-sm font-medium flex items-center transition-colors border-r border-[#3a3a4a]"
    >
      <Plus size={16} className="mr-1.5" />
      New key
    </button>
    <button 
      onClick={() => setKeyMenuOpen(!keyMenuOpen)}
      className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-2 py-1.5 text-sm font-medium flex items-center transition-colors"
    >
      <ChevronDown size={14} />
    </button>
  </div>

  {/* Меню рендерится здесь */}
  {keyMenuOpen && (
    <div className="absolute left-0 top-full mt-1 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[180px] z-50">
      <button
        onClick={() => { setKeyMenuOpen(false); }}
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
      >
        <Key size={14} />
        <span>Generate key</span>
      </button>
      <button
        onClick={() => {
          const newKey = {
            id: `k${Date.now()}`,
            label: '',
            type: 'unknown' as const,
            createdAt: Date.now(),
          };
          useStore.getState().addKey(newKey);
          useStore.getState().setSelectedKey(newKey.id);
          setKeyPanelMode('new');
          setKeyMenuOpen(false);
        }}
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
      >
        <CreditCard size={14} />
        <span>New Identity</span>
      </button>
    </div>
  )}
</div>

        <button 
          onClick={handleCertificate}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${
            keyPanelMode === 'certificate' ? 'bg-[#3a3a4a] text-white' : 'text-gray-300 hover:bg-[#2a2a3a]'
          }`}
        >
          <FileText size={16} className="mr-1.5" />Certificate
        </button>

        <button 
          onClick={handleTouchID}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${
            keyPanelMode === 'touch-id' ? 'bg-[#3a3a4a] text-white' : 'text-gray-300 hover:bg-[#2a2a3a]'
          }`}
        >
          <Fingerprint size={16} className="mr-1.5" />Touch ID
        </button>

        <button 
          onClick={handleFIDO2}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${
            keyPanelMode === 'fido2' ? 'bg-[#3a3a4a] text-white' : 'text-gray-300 hover:bg-[#2a2a3a]'
          }`}
        >
          <Usb size={16} className="mr-1.5" />FIDO2
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
        {/* Список ключей */}
        <div className="flex-1 p-6">
          {keys.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Keys</h2>
              <div className="space-y-2">
                {filteredKeys.map(key => (
                  <KeyCard 
                    key={key.id} 
                    keyData={key}
                    isSelected={selectedKeyId === key.id}
                    onClick={() => {
                      setSelectedKey(key.id);
                      setKeyPanelMode('new');
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Правая панель */}
        <KeyRightPanel />
      </div>

      {/* Меню New key */}
      {/* {keyMenuOpen && <KeyMenu />} */}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#2a2a3a] flex items-center justify-center mx-auto">
          <Key size={32} className="text-gray-300" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">Add credentials</h2>
          <p className="text-sm text-gray-400 max-w-[300px]">
            Store your credentials to quick and securely access your servers.
          </p>
        </div>
      </div>
    </div>
  );
}

function KeyCard({ keyData, isSelected, onClick }: { keyData: any; isSelected: boolean; onClick: () => void }) {
  const icon = keyData.type === 'ECDSA-SK' ? <Usb size={20} /> : <Key size={20} />;
  
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
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-100 truncate">
            {keyData.label || 'Add a label...'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Type {keyData.type}
          </p>
        </div>
      </div>
    </div>
  );
}