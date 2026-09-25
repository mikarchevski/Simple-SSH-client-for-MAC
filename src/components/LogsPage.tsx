import { Bookmark, ArrowUpDown, Server } from 'lucide-react';
import { useStore } from '../store';

export function LogsPage() {
  const { logs } = useStore();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Заголовки колонок */}
        <div className="grid grid-cols-[180px_1fr_1fr_80px] gap-4 px-4 py-2 border-b border-[#2a2a3a] text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-300">
            <span>Date</span>
            <ArrowUpDown size={12} />
          </div>
          <div>User</div>
          <div>Host</div>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-300">
            <span>Saved</span>
            <Bookmark size={12} />
          </div>
        </div>

        {/* Строки логов */}
        <div className="mt-2 space-y-1">
          {logs.map(log => (
            <div 
              key={log.id}
              className="grid grid-cols-[180px_1fr_1fr_80px] gap-4 px-4 py-3 bg-[#252535] border border-[#333] rounded-lg hover:border-[#4a4a5a] hover:bg-[#2a2a3a] cursor-pointer transition-all items-center"
            >
              {/* Date */}
              <div>
                <div className="text-sm text-gray-200">{log.date}</div>
                <div className="text-xs text-gray-500">{log.time}</div>
              </div>

              {/* User */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {log.userInitial}
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-gray-200 truncate">{log.user}</div>
                  <div className="text-xs text-gray-500 truncate">{log.ip} · {log.localHost}</div>
                </div>
              </div>

              {/* Host */}
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  log.hostOs === 'ubuntu' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  <Server size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-gray-200 font-semibold truncate">{log.hostLabel}</div>
                  <div className="text-xs text-gray-500 truncate">{log.hostTags.join(', ')}</div>
                </div>
              </div>

              {/* Saved */}
              <div className="flex justify-center">
                <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors">
                  <Bookmark size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}