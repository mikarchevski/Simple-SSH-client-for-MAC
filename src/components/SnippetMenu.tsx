import { Package } from 'lucide-react';
import { useStore } from '../store';

export function SnippetMenu({ onNewSnippet }: { onNewSnippet: () => void }) {
  const { setSnippetMenuOpen } = useStore();

  const handleNewPackage = () => {
    // Логика создания пакета сниппетов
    setSnippetMenuOpen(false);
  };

  return (
    <div className="absolute left-0 top-12 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[200px] z-50">
      <button
        onClick={handleNewPackage}
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
      >
        <Package size={14} className="text-gray-400" />
        <span>New snippet package</span>
      </button>
    </div>
  );
}