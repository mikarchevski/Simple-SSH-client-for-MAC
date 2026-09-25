import { 
  Zap, Plug, LayoutGrid, Pencil, Users, ArrowRight, Copy, 
  FileText, Link2, Trash2 
} from 'lucide-react';
import { useStore } from '../store';

export function ContextMenu() {
  const { contextMenu, closeContextMenu, openHostDetails, duplicateHost, openDeleteModal } = useStore();

  if (!contextMenu) return null;

  const handleAction = (action: () => void) => {
    action();
    closeContextMenu();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
      <div 
        className="fixed z-50 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[220px]"
        style={{ left: contextMenu.x, top: contextMenu.y }}
      >
        <MenuItem icon={<Zap size={14} />} label="Quick Connect" shortcut="↵" onClick={() => handleAction(() => {})} />
        <MenuItem icon={<Plug size={14} />} label="Connect" hasArrow onClick={() => handleAction(() => {})} />
        <MenuItem icon={<LayoutGrid size={14} />} label="Add to Workspace" hasArrow onClick={() => handleAction(() => {})} />
        <MenuItem icon={<Pencil size={14} />} label="Edit Host Details" shortcut="E" onClick={() => handleAction(() => openHostDetails(contextMenu.hostId))} />
        <MenuItem icon={<Users size={14} />} label="Collaborate" onClick={() => handleAction(() => {})} />
        <MenuItem icon={<ArrowRight size={14} />} label="Move to" hasArrow onClick={() => handleAction(() => {})} />
        <MenuItem icon={<Copy size={14} />} label="Copy to" hasArrow onClick={() => handleAction(() => {})} />
        <MenuItem icon={<FileText size={14} />} label="Duplicate" onClick={() => handleAction(() => duplicateHost(contextMenu.hostId))} />
        <MenuItem icon={<Link2 size={14} />} label="Copy Link" hasInfo onClick={() => handleAction(() => {})} />
        <div className="my-1 border-t border-[#3a3a4a]" />
        <MenuItem 
          icon={<Trash2 size={14} />} 
          label="Remove" 
          danger 
          onClick={() => handleAction(() => openDeleteModal(contextMenu.hostId))} 
        />
      </div>
    </>
  );
}

function MenuItem({ icon, label, shortcut, hasArrow, hasInfo, danger, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full px-3 py-1.5 text-sm flex items-center justify-between hover:bg-[#3a3a4a] transition-colors ${
        danger ? 'text-red-400 hover:text-red-300' : 'text-gray-200'
      }`}
    >
      <span className="flex items-center space-x-2.5">
        <span className={danger ? 'text-red-400' : 'text-gray-400'}>{icon}</span>
        <span>{label}</span>
      </span>
      {shortcut && <span className="text-xs text-gray-500 bg-[#1e1e2e] px-1.5 py-0.5 rounded">{shortcut}</span>}
      {hasArrow && <span className="text-gray-500">›</span>}
      {hasInfo && <span className="text-gray-500 text-xs">ⓘ</span>}
    </button>
  );
}