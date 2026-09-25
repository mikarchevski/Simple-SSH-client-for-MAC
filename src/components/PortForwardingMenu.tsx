import { useStore, ForwardingType } from '../store';

export function PortForwardingMenu({ onSelect }: { onSelect: (type: ForwardingType) => void }) {
  const { setForwardingMenuOpen } = useStore();

  const handleSelect = (type: ForwardingType) => {
    onSelect(type);
    setForwardingMenuOpen(false);
  };

  return (
    <div className="absolute left-0 top-12 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[200px] z-50">
      <MenuItem label="Local Forwarding" letter="L" onClick={() => handleSelect('local')} />
      <MenuItem label="Remote Forwarding" letter="R" onClick={() => handleSelect('remote')} />
      <MenuItem label="Dynamic Forwarding" letter="D" onClick={() => handleSelect('dynamic')} />
    </div>
  );
}

function MenuItem({ label, letter, onClick }: { label: string; letter: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors flex items-center space-x-2 text-gray-200"
    >
      <span className="w-5 h-5 rounded bg-gray-500/30 flex items-center justify-center text-xs font-semibold text-gray-300">
        {letter}
      </span>
      <span>{label}</span>
    </button>
  );
}