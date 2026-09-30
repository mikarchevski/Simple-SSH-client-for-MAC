import { Key, CreditCard } from 'lucide-react';
import { useStore } from '../store';



export function KeyMenu() {
  const { setKeyMenuOpen, setKeyPanelMode } = useStore();

  const handleAction = (action: () => void) => {
    action();
    setKeyMenuOpen(false);
  };

  return (
    <div className="absolute left-0 top-12 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[180px] z-50">
      <button
        onClick={() => handleAction(() => setKeyPanelMode('new'))}
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
      >
        <Key size={14} />
        <span>Generate key</span>
      </button>
      <button
        onClick={() => handleAction(() => {
          // Создаем новую identity
          const newKey = {
            id: `k${Date.now()}`,
            label: '',
            type: 'unknown' as const,
            createdAt: Date.now(),
          };
          useStore.getState().addKey(newKey);
          useStore.getState().setSelectedKey(newKey.id);
          setKeyPanelMode('new');
        })}
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
      >
        <CreditCard size={14} />
        <span>New Identity</span>
      </button>
    </div>
  );
}