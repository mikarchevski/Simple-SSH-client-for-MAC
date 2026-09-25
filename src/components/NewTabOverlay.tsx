import { Search, X, Server } from 'lucide-react';
import { useStore } from '../store';

export function NewTabOverlay() {
  const { newTabOpen, setNewTabOpen, hosts, groups } = useStore();

  if (!newTabOpen) return null;

  const recentConnections = hosts.slice(0, 4); // Последние 4 хоста

  const getGroupName = (host: any) => {
    if (!host.groupId) return 'Personal';
    const group = groups.find(g => g.id === host.groupId);
    return group ? `Personal / ${group.name}` : 'Personal';
  };

  const handleSelectHost = (hostId: string) => {
    // Здесь будет логика открытия терминала
    console.log('Opening host:', hostId);
    setNewTabOpen(false);
  };

  return (
    <>
      {/* Затемнение фона */}
      <div 
        className="fixed inset-0 bg-black/60 z-[200]"
        onClick={() => setNewTabOpen(false)}
      />

      {/* Оверлей */}
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24">
        <div className="w-full max-w-3xl bg-[#1e1e2e] border border-[#3a3a4a] rounded-xl shadow-2xl overflow-hidden">
          
          {/* Поиск */}
          <div className="p-4 border-b border-[#2a2a3a]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                autoFocus
                className="w-full bg-[#252535] text-gray-200 rounded-lg pl-10 pr-16 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#3a3a4a] placeholder-gray-500"
                placeholder="Search hosts or tabs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-500">
                <span className="bg-[#3a3a4a] px-1.5 py-0.5 rounded">⌘</span>
                <span className="bg-[#3a3a4a] px-1.5 py-0.5 rounded">K</span>
              </div>
            </div>
          </div>

          {/* Recent connections */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-200">Recent connections</h2>
              <div className="flex items-center space-x-2">
                <button className="bg-[#2a2a3a] hover:bg-[#333] text-gray-400 px-3 py-1 rounded text-xs transition-colors">
                  Create a workspace
                </button>
                <button className="bg-[#2a2a3a] hover:bg-[#333] text-gray-400 px-3 py-1 rounded text-xs transition-colors">
                  Restore
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {recentConnections.map((host, idx) => (
                <button
                  key={host.id}
                  onClick={() => handleSelectHost(host.id)}
                  className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-[#2a2a3a] transition-colors ${
                    idx % 2 === 1 ? 'bg-[#252535]/50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${
                      host.os === 'ubuntu' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      <Server size={14} />
                    </div>
                    <span className="text-sm text-gray-200">{host.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{getGroupName(host)}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}