import { Server, Folder, Pencil, ChevronRight, Users, X, Tag, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { TagFilter } from './TagFilter'; //test

export function HostGrid() {
  const { 
    hosts, groups, searchQuery, openNewHostPanel, openHostDetails, 
    selectedHostId, setSelectedHost, openContextMenu, selectedGroupId, setSelectedGroup,
    showInviteBanner, setShowInviteBanner, selectedTags,
    tagFilterOpen, setTagFilterOpen, newHostMenuOpen, setNewHostMenuOpen
  } = useStore();

  const filteredHosts = hosts.filter(h => {
    const matchesSearch = 
      h.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroupId ? h.groupId === selectedGroupId : true;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => h.tags.includes(tag));
    return matchesSearch && matchesGroup && matchesTags;
  });

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="flex-1 overflow-y-auto p-6 relative">
      
      {/* Баннер Invite members (если нужен, можно вернуть, сейчас закомментирован для чистоты) */}
      {showInviteBanner && !selectedGroupId && (
        <div className="mb-6 bg-[#252535] border border-[#3a3a4a] rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users size={20} className="text-gray-400" />
            <div>
              <span className="text-sm font-semibold text-gray-200">Invite members.</span>
              <span className="text-sm text-gray-400 ml-1">Manage and use data together with your team.</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-[#3a3a4a] hover:bg-[#4a4a5a] text-gray-200 px-3 py-1 rounded-md text-sm font-medium transition-colors">
              Invite
            </button>
            <button 
              onClick={() => setShowInviteBanner(false)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Хлебные крошки */}
      {selectedGroup && (
        <div className="mb-4 flex items-center space-x-2 text-sm">
          <button 
            onClick={() => setSelectedGroup(null)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            All hosts
          </button>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-gray-400">{selectedGroup.name}</span>
        </div>
      )}

      {/* Группы */}
      {!selectedGroupId && (
        <section className="mb-8">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {groups.map(group => (
              <div 
                key={group.id} 
                onClick={() => setSelectedGroup(group.id)}
                className="bg-[#252535] border border-[#333] rounded-lg p-4 flex items-center space-x-3 hover:border-[#444] hover:bg-[#2a2a3a] cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Folder size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-100">{group.name}</h3>
                  <p className="text-xs text-gray-500">{group.count} Hosts</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Хосты */}
      <section>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Hosts</h2>
        <div className={`grid gap-3 ${selectedGroupId ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
          
          {!selectedGroupId && (
            <div 
              onClick={openNewHostPanel}
              className="bg-[#252535] border-2 border-dashed border-blue-500/30 rounded-lg p-4 hover:border-blue-500/60 hover:bg-[#2a2a3a] cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Server size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400">Enter IP or Hostname...</h3>
                  <p className="text-xs text-gray-500 mt-0.5">ssh</p>
                </div>
              </div>
            </div>
          )}

          {filteredHosts.map(host => (
            <HostCard 
              key={host.id} 
              host={host} 
              onClick={() => setSelectedHost(host.id)} 
              onContextMenu={(e) => openContextMenu(e.clientX, e.clientY, host.id)}
            />
          ))}
        </div>

        {filteredHosts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Server size={48} className="mx-auto mb-3 opacity-20" />
            <p>No hosts found</p>
          </div>
        )}
      </section>

      {/* Фильтр по тегам */}
      <TagFilter />
    </div>
  );
}
// В обработчике ПКМ на карточке хоста
const handleContextMenu = (e: React.MouseEvent, hostId: string) => {
  e.preventDefault();
  e.stopPropagation();
  
  useStore.getState().openContextMenu(hostId);
  
  // Отправляем координаты через кастомное событие
  window.dispatchEvent(
    new CustomEvent('contextmenu-open', { detail: { x: e.clientX, y: e.clientY } })
  );
};
function HostCard({ host, onClick, onContextMenu }: any) {
  const selectedHostId = useStore((state) => state.selectedHostId);
  const isSelected = selectedHostId === host.id;
  
  const osColor = host.os === 'ubuntu' 
    ? 'text-orange-400 bg-orange-500/10' 
    : 'text-blue-400 bg-blue-500/10';

  const handleDoubleClick = () => {
    useStore.getState().addConnectionTab(host.id);
  };

  return (
    <div 
    data-host-id={host.id}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}  // <-- ДОБАВЛЕНО
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e); }}
      className={`bg-[#252535] border rounded-lg p-4 cursor-pointer transition-all duration-200 group relative ${
        isSelected 
          ? 'border-blue-500 bg-blue-500/5' 
          : 'border-[#333] hover:border-[#4a4a5a] hover:bg-[#2a2a3a]'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${osColor}`}>
          <Server size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-100 truncate">{host.label}</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{host.tags.join(', ')}</p>
        </div>
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            useStore.getState().openHostDetails(host.id);
          }}
          className="p-1 text-gray-400 hover:text-white bg-[#1e1e2e] rounded"
        >
          <Pencil size={12} />
        </button>
      </div>
    </div>
  );
}