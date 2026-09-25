import { Search, Plus, Monitor, Grid3X3, List, Tag, ChevronDown, Usb, Folder, Cloud, Globe, Shield, Download } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HostGrid } from './components/HostGrid';
import { RightPanel } from './components/RightPanel';
import { ContextMenu } from './components/ContextMenu';
import { DeleteModal } from './components/DeleteModal';
import { KnownHostsPage } from './components/KnownHostsPage';
import { LogsPage } from './components/LogsPage';
import { SerialPage } from './components/SerialPage';
import { SftpPage } from './components/SftpPage';
import { KeychainPage } from './components/KeychainPage';
import { PortForwardingPage } from './components/PortForwardingPage';
import { SnippetsPage } from './components/SnippetsPage';
import { NewTabOverlay } from './components/NewTabOverlay';
import { ConnectionPage } from './components/ConnectionPage';
import { useStore } from './store';

function App() {
  const { 
    searchQuery, setSearchQuery, openNewHostPanel, activePage, activeTopTab, setActiveTopTab,
    selectedTags, tagFilterOpen, setTagFilterOpen, newHostMenuOpen, setNewHostMenuOpen,
    newTabOpen, setNewTabOpen, tabs, activeTabId, setActiveTab
  } = useStore();

  const newHostMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setNewTabOpen(true);
      }
      if (e.key === 'Escape') {
        setNewTabOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setNewTabOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newHostMenuRef.current && !newHostMenuRef.current.contains(event.target as Node)) {
        setNewHostMenuOpen(false);
      }
    };
    if (newHostMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [newHostMenuOpen, setNewHostMenuOpen]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="flex h-screen bg-[#1e1e2e] text-gray-300 font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Верхние вкладки (Vaults, SFTP, Serial) + вкладки подключений */}
        <div className="h-10 bg-[#16161e] border-b border-[#2a2a3a] flex items-center px-2 space-x-1 flex-shrink-0 overflow-x-auto">
          <TopTabButton 
            active={activeTopTab === 'vaults' && activeTab?.type === 'vaults'} 
            onClick={() => { setActiveTopTab('vaults'); setActiveTab('tab-vaults'); }}
            icon={<Folder size={14} />}
            label="Vaults"
          />
          <TopTabButton 
            active={activeTopTab === 'sftp' && activeTab?.type === 'sftp'} 
            onClick={() => { setActiveTopTab('sftp'); setActiveTab('tab-sftp'); }}
            icon={<Folder size={14} />}
            label="SFTP"
          />
          <TopTabButton 
            active={activeTopTab === 'serial' && activeTab?.type === 'serial'} 
            onClick={() => { setActiveTopTab('serial'); setActiveTab('tab-serial'); }}
            icon={<Usb size={14} />}
            label="Serial"
          />
          
          {/* Вкладки подключений */}
          {tabs.filter(t => t.type === 'connection').map(tab => (
            <ConnectionTabButton
              key={tab.id}
              tab={tab}
              isActive={activeTabId === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
          
          <button 
            onClick={() => setNewTabOpen(true)}
            className="ml-2 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Страница подключения */}
        {activeTab?.type === 'connection' && activeTab.hostId && (
          <ConnectionPage tabId={activeTab.id} />
        )}

        {/* Обычные страницы */}
        {activeTopTab === 'vaults' && activePage === 'hosts' && activeTab?.type !== 'connection' && (
          <>
            <header className="h-14 bg-[#1e1e2e] border-b border-[#2a2a3a] flex items-center px-4 space-x-4 flex-shrink-0 relative">
              <div className="flex-1 relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#2a2a3a] text-gray-200 rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500/50 transition-all placeholder-gray-500"
                  placeholder="Find a host or ssh user@hostname..."
                />
              </div>
              
              <div className="relative" ref={newHostMenuRef}>
                <div className="flex rounded-md overflow-hidden border border-[#3a3a4a]">
                  <button 
                    onClick={openNewHostPanel}
                    className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-3 py-1.5 text-sm font-medium flex items-center transition-colors border-r border-[#3a3a4a]"
                  >
                    <Plus size={16} className="mr-1.5" />
                    New host
                  </button>
                  <button 
                    onClick={() => setNewHostMenuOpen(!newHostMenuOpen)}
                    className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-2 py-1.5 text-sm font-medium flex items-center transition-colors"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {newHostMenuOpen && (
                  <div 
                    className="fixed bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[220px] z-[100]"
                    style={{
                      left: newHostMenuRef.current?.getBoundingClientRect().left || 0,
                      top: (newHostMenuRef.current?.getBoundingClientRect().bottom || 0) + 4,
                    }}
                  >
                    <button onClick={() => setNewHostMenuOpen(false)} className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200">
                      <Folder size={14} /><span>New Group</span>
                    </button>
                    <button onClick={() => setNewHostMenuOpen(false)} className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200">
                      <Download size={14} /><span>Import</span>
                    </button>
                    <div className="my-1 border-t border-[#3a3a4a]" />
                    <button onClick={() => setNewHostMenuOpen(false)} className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200">
                      <Cloud size={14} /><span>AWS Integration</span>
                    </button>
                    <button onClick={() => setNewHostMenuOpen(false)} className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200">
                      <Globe size={14} /><span>DigitalOcean Integration</span>
                    </button>
                    <button onClick={() => setNewHostMenuOpen(false)} className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200">
                      <Shield size={14} /><span>Azure Integration</span>
                    </button>
                  </div>
                )}
              </div>

              <button className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors border border-[#3a3a4a]">
                <Monitor size={16} className="mr-1.5" />Serial
              </button>

              <div className="flex-1" />

              <div className="flex items-center space-x-2">
                <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                  <Grid3X3 size={16} />
                </button>
                <button 
                  onClick={() => setTagFilterOpen(!tagFilterOpen)}
                  className={`p-1.5 transition-colors ${selectedTags.length > 0 ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                >
                  <Tag size={16} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                  <List size={16} />
                </button>
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold">
                  M
                </div>
                <button className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 p-1.5 rounded-md transition-colors border border-[#3a3a4a]">
                  <Plus size={14} />
                </button>
              </div>
            </header>
            <HostGrid />
          </>
        )}

        {activeTopTab === 'vaults' && activePage === 'known-hosts' && activeTab?.type !== 'connection' && <KnownHostsPage />}
        {activeTopTab === 'vaults' && activePage === 'logs' && activeTab?.type !== 'connection' && <LogsPage />}
        {activeTopTab === 'vaults' && activePage === 'port-forwarding' && activeTab?.type !== 'connection' && <PortForwardingPage />}
        {activeTopTab === 'vaults' && activePage === 'keychain' && activeTab?.type !== 'connection' && <KeychainPage />}
        {activeTopTab === 'vaults' && activePage === 'snippets' && activeTab?.type !== 'connection' && <SnippetsPage />}
        {activeTopTab === 'serial' && activeTab?.type !== 'connection' && <SerialPage />}
        {activeTopTab === 'sftp' && activeTab?.type !== 'connection' && <SftpPage />}

        {activeTopTab === 'vaults' && !['hosts', 'known-hosts', 'logs', 'port-forwarding', 'keychain', 'snippets'].includes(activePage) && activeTab?.type !== 'connection' && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Раздел "{activePage}" в разработке</p>
          </div>
        )}
      </main>

      <RightPanel />
      <ContextMenu />
      <DeleteModal />
      <NewTabOverlay />
    </div>
  );
}

function TopTabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors flex-shrink-0 ${
        active 
          ? 'bg-[#2a2a3a] text-gray-200' 
          : 'text-gray-400 hover:text-gray-200 hover:bg-[#252535]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ConnectionTabButton({ tab, isActive, onClick }: { tab: any; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors flex-shrink-0 ${
        isActive 
          ? 'bg-[#2a2a3a] text-gray-200' 
          : 'text-gray-400 hover:text-gray-200 hover:bg-[#252535]'
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${
        tab.connectionStatus === 'connected' ? 'bg-green-400' :
        tab.connectionStatus === 'failed' ? 'bg-red-400' :
        'bg-blue-400 animate-pulse'
      }`} />
      <span>{tab.label}</span>
    </button>
  );
}

export default App;