import { Folder, Download, Cloud, Globe, Shield } from 'lucide-react';
import { useStore } from '../store';

export function NewHostMenu() {
  const { 
    setNewHostMenuOpen, 
    createGroup, 
    openNewHostPanel 
  } = useStore();

  const handleNewGroup = () => {
    // 1. Создаем группу (в сторе автоматически сгенерируется ID и установится editingGroupId)
    createGroup();
    
    // 2. Открываем правую панель (она увидит editingGroupId и покажет форму группы)
    openNewHostPanel();
    
    // 3. Закрываем выпадающее меню
    setNewHostMenuOpen(false);
  };

  const handleAction = (action: () => void) => {
    action();
    setNewHostMenuOpen(false);
  };

  return (
    <div className="absolute left-0 top-full mt-1 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[220px] z-50">
      <MenuItem 
        icon={<Folder size={14} />} 
        label="New Group" 
        onClick={handleNewGroup} 
      />
      <MenuItem icon={<Download size={14} />} label="Import" onClick={() => handleAction(() => {})} />
      <div className="my-1 border-t border-[#3a3a4a]" />
      <MenuItem icon={<Cloud size={14} />} label="AWS Integration" onClick={() => handleAction(() => {})} />
      <MenuItem icon={<Globe size={14} />} label="DigitalOcean Integration" onClick={() => handleAction(() => {})} />
      <MenuItem icon={<Shield size={14} />} label="Azure Integration" onClick={() => handleAction(() => {})} />
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}