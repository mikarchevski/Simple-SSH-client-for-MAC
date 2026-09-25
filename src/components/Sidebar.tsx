import { LayoutGrid, Key, ArrowRightLeft, Code2, ShieldCheck, FileText, Fingerprint, Clock } from 'lucide-react';
import { useStore, Page } from '../store';

export function Sidebar() {
  const { activePage, setActivePage } = useStore();

  const items: { page: Page; icon: React.ReactNode; label: string }[] = [
    { page: 'hosts', icon: <LayoutGrid size={20} />, label: 'Hosts' },
    { page: 'keychain', icon: <Key size={20} />, label: 'Keychain' },
    { page: 'port-forwarding', icon: <ArrowRightLeft size={20} />, label: 'Port Forwarding' },
    { page: 'snippets', icon: <Code2 size={20} />, label: 'Snippets' },
    { page: 'known-hosts', icon: <Fingerprint size={20} />, label: 'Known Hosts' },
    { page: 'logs', icon: <Clock size={20} />, label: 'Logs' },
  ];

  return (
    <aside className="w-48 bg-[#16161e] border-r border-[#2a2a3a] flex flex-col py-4 flex-shrink-0">
      <div className="space-y-1 px-2">
        {items.map(item => (
          <button
            key={item.page}
            onClick={() => setActivePage(item.page)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              activePage === item.page 
                ? 'text-blue-400 bg-blue-500/10' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a3a]'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}