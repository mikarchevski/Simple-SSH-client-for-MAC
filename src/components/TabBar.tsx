import { Folder, Usb, Plus, X, Server, RefreshCw } from 'lucide-react';
import { useStore } from '../store';

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, addConnectionTab } = useStore();

  const handleAddTab = () => {
    const newTab = {
      id: `tab-new-${Date.now()}`,
      type: 'new-tab' as const,
      label: 'New Tab',
    };
    useStore.getState().tabs = [...useStore.getState().tabs, newTab];
    useStore.getState().activeTabId = newTab.id;
  };

  return (
    <div className="h-10 bg-[#16161e] border-b border-[#2a2a3a] flex items-center px-2 space-x-1 flex-shrink-0 overflow-x-auto">
      {tabs.map(tab => (
        <TabButton 
          key={tab.id}
          tab={tab}
          isActive={activeTabId === tab.id}
          onClick={() => setActiveTab(tab.id)}
          onClose={() => closeTab(tab.id)}
        />
      ))}
      
      <button 
        onClick={handleAddTab}
        className="ml-2 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function TabButton({ tab, isActive, onClick, onClose }: { 
  tab: any; 
  isActive: boolean; 
  onClick: () => void;
  onClose: () => void;
}) {
  const getIcon = () => {
    if (tab.type === 'vaults' || tab.type === 'sftp') return <Folder size={14} />;
    if (tab.type === 'serial') return <Usb size={14} />;
    if (tab.type === 'new-tab') return <Plus size={14} />;
    if (tab.type === 'connection') {
      if (tab.connectionStatus === 'connected') return <Server size={14} className="text-green-400" />;
      if (tab.connectionStatus === 'failed') return <X size={14} className="text-red-400" />;
      return <RefreshCw size={14} className="text-blue-400 animate-spin" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (tab.type !== 'connection') return '';
    if (tab.connectionStatus === 'connected') return 'bg-green-500/10 text-green-400 border-green-500/30';
    if (tab.connectionStatus === 'failed') return 'bg-red-500/10 text-red-400 border-red-500/30';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors flex-shrink-0 ${
        isActive 
          ? 'bg-[#2a2a3a] text-gray-200' 
          : 'text-gray-400 hover:text-gray-200 hover:bg-[#252535]'
      } ${getStatusColor()}`}
    >
      {getIcon()}
      <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
      {tab.type !== 'vaults' && tab.type !== 'sftp' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-500 hover:text-gray-200 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}