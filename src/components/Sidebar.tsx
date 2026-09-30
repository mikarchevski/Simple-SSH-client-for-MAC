import { LayoutGrid, Key, ArrowRightLeft, Code2, Fingerprint, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore, type Page } from '../store';

export function Sidebar() {
  const { activePage, setActivePage } = useStore();
  const [isCompact, setIsCompact] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<Page | null>(null);

  useEffect(() => {
    const checkWidth = () => {
      setIsCompact(window.innerWidth < 800);
    };

    // Проверяем при загрузке
    checkWidth();

    // Слушаем изменение размера окна
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const items: { page: Page; icon: React.ReactNode; label: string }[] = [
    { page: 'hosts', icon: <LayoutGrid size={20} />, label: 'Hosts' },
    { page: 'keychain', icon: <Key size={20} />, label: 'Keychain' },
    { page: 'port-forwarding', icon: <ArrowRightLeft size={20} />, label: 'Port Forwarding' },
    { page: 'snippets', icon: <Code2 size={20} />, label: 'Snippets' },
    { page: 'known-hosts', icon: <Fingerprint size={20} />, label: 'Known Hosts' },
    { page: 'logs', icon: <Clock size={20} />, label: 'Logs' },
  ];

  return (
    <aside className={`${isCompact ? 'w-16' : 'w-48'} bg-[#16161e] border-r border-[#2a2a3a] flex flex-col py-4 flex-shrink-0 transition-all duration-300`}>
      <div className="space-y-1 px-2">
        {items.map(item => (
          <div key={item.page} className="relative">
            <button
              onClick={() => setActivePage(item.page)}
              onMouseEnter={() => setHoveredItem(item.page)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full flex items-center ${isCompact ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                activePage === item.page 
                  ? 'text-blue-400 bg-blue-500/10' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a3a]'
              }`}
            >
              {item.icon}
              {!isCompact && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
            
            {/* Tooltip для компактного режима */}
            {isCompact && hoveredItem === item.page && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-[#252535] border border-[#3a3a4a] rounded-md shadow-xl whitespace-nowrap z-50">
                <span className="text-sm text-gray-200 font-medium">{item.label}</span>
                {/* Стрелочка tooltip */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-[#252535] border-l border-t border-[#3a3a4a] rotate-45" />
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}