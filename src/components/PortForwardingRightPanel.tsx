import { ArrowRight, ChevronDown } from 'lucide-react';
import { useStore, ForwardingType } from '../store';

export function PortForwardingRightPanel() {
  const { forwardingPanelOpen, forwardingType, setForwardingType, setForwardingPanelOpen } = useStore();

  if (!forwardingPanelOpen) return null;

  const typeInfo = {
    local: {
      title: 'Local forwarding lets you access a remote server\'s listening port as though it were local.',
      icon: 'local',
    },
    remote: {
      title: 'Remote forwarding opens a port on the remote machine and forwards connections to the local (current) host.',
      icon: 'remote',
    },
    dynamic: {
      title: 'Dynamic port forwarding turns Termius into a SOCKS proxy server. SOCKS proxy server is a protocol to request any connection via a remote host.',
      icon: 'dynamic',
    },
  };

  const info = typeInfo[forwardingType];

  return (
    <div className="w-96 bg-[#1e1e2e] border-l border-[#2a2a3a] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-[#2a2a3a] flex items-center justify-between px-4 flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">New Port Forwarding</h2>
          <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <span>Personal vault</span>
            <ChevronDown size={12} />
          </button>
        </div>
        <button onClick={() => setForwardingPanelOpen(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-200">Select the port forwarding type:</h3>

        {/* Переключатель */}
        <div className="flex bg-[#252535] rounded-lg p-1 border border-[#3a3a4a]">
          <TypeButton active={forwardingType === 'local'} onClick={() => setForwardingType('local')} label="Local" />
          <TypeButton active={forwardingType === 'remote'} onClick={() => setForwardingType('remote')} label="Remote" />
          <TypeButton active={forwardingType === 'dynamic'} onClick={() => setForwardingType('dynamic')} label="Dynamic" />
        </div>

        {/* Иллюстрация */}
        <div className="bg-[#252535] rounded-lg p-6 border border-[#3a3a4a]">
          <ForwardingIllustration type={forwardingType} />
        </div>

        {/* Описание */}
        <p className="text-sm text-gray-300 leading-relaxed">
          {info.title}
        </p>

        {/* Кнопки */}
        <div className="space-y-2 pt-2">
          <button className="w-full bg-[#007AFF] hover:bg-[#0062cc] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            Continue
          </button>
          <button 
            onClick={() => setForwardingPanelOpen(false)}
            className="w-full bg-[#2a2a3a] hover:bg-[#333] text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Skip wizard
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${
        active ? 'bg-[#007AFF] text-white' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function ForwardingIllustration({ type }: { type: ForwardingType }) {
  // Упрощенные SVG-иллюстрации для каждого типа
  if (type === 'local') {
    return (
      <div className="flex items-center justify-center space-x-4 h-32">
        {/* Локальный компьютер */}
        <div className="w-12 h-12 rounded-lg bg-gray-600/30 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
            <path d="M4 4h16v12H4z" />
            <path d="M8 20h8" />
            <path d="M12 16v4" />
          </svg>
        </div>
        {/* Стрелка */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        {/* Файрвол */}
        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        {/* Стрелка */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        {/* Сервер */}
        <div className="w-12 h-12 rounded-lg bg-gray-600/30 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
            <rect x="2" y="2" width="20" height="8" rx="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" />
            <circle cx="6" cy="6" r="1" fill="currentColor" />
            <circle cx="6" cy="18" r="1" fill="currentColor" />
          </svg>
        </div>
      </div>
    );
  }

  if (type === 'remote') {
    return (
      <div className="flex items-center justify-center space-x-4 h-32">
        {/* Сервер */}
        <div className="w-12 h-12 rounded-lg bg-gray-600/30 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
            <rect x="2" y="2" width="20" height="8" rx="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" />
            <circle cx="6" cy="6" r="1" fill="currentColor" />
            <circle cx="6" cy="18" r="1" fill="currentColor" />
          </svg>
        </div>
        {/* Стрелка */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {/* Файрвол */}
        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" />
          </svg>
        </div>
        {/* Стрелка */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {/* Локальный компьютер */}
        <div className="w-12 h-12 rounded-lg bg-gray-600/30 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
            <path d="M4 4h16v12H4z" />
            <path d="M8 20h8" />
            <path d="M12 16v4" />
          </svg>
        </div>
      </div>
    );
  }

  // Dynamic
  return (
    <div className="flex items-center justify-center space-x-4 h-32">
      {/* Локальный компьютер */}
      <div className="w-12 h-12 rounded-lg bg-gray-600/30 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
          <path d="M4 4h16v12H4z" />
          <path d="M8 20h8" />
          <path d="M12 16v4" />
        </svg>
      </div>
      {/* Стрелка */}
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
      {/* Файрвол */}
      <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
          <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" />
        </svg>
      </div>
      {/* Облака */}
      <div className="flex flex-col space-y-2">
        <div className="w-10 h-8 rounded-lg bg-gray-600/30 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </svg>
        </div>
        <div className="w-10 h-8 rounded-lg bg-gray-600/30 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </svg>
        </div>
      </div>
    </div>
  );
}