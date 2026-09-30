import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { invoke } from '@tauri-apps/api/core';
import { Cpu, HardDrive, MemoryStick, Wifi, Clock, RefreshCw, ArrowDown, ArrowUp } from 'lucide-react';

interface HostMetricsWidgetProps {
  hostId: string;
  sessionId: string; // Добавляем sessionId для вызова Tauri
}

export function HostMetricsWidget({ hostId, sessionId }: HostMetricsWidgetProps) {
  const { hostMetrics, setHostMetrics } = useStore();
  const metrics = hostMetrics[hostId];
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collectMetrics = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // Вызываем нашу новую Rust-команду
      const data = await invoke<any>('get_host_metrics', { sessionId });
      
      setHostMetrics(hostId, {
        cpuUsage: data.cpu,
        memoryUsage: data.mem_pct,
        memoryUsed: data.mem_str,
        diskUsage: data.disk_pct,
        diskUsed: data.disk_str,
        networkDown: data.net_str.split(' / ')[0] || 'N/A',
        networkUp: data.net_str.split(' / ')[1] || 'N/A',
        uptime: data.uptime,
        lastUpdate: Date.now()
      });
    } catch (err) {
      console.error('Failed to collect metrics:', err);
      setError('Metrics unavailable');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    collectMetrics();
    // Обновляем каждые 10 секунд (5 секунд может быть слишком часто для SSH)
    const interval = setInterval(collectMetrics, 10000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (error) {
    return (
      <div className="flex items-center justify-center space-x-2 text-gray-500 py-2 text-xs">
        <span>{error}</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center space-x-2 text-gray-500 py-2">
        <RefreshCw size={14} className="animate-spin" />
        <span className="text-xs">Loading metrics...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#252535] border-t border-[#2a3a4a] text-xs">
      {/* CPU */}
      <div className="flex items-center space-x-2 min-w-[100px]">
        <Cpu size={14} className="text-blue-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-gray-400 truncate">CPU</span>
            <span className="text-gray-200 font-medium">{metrics.cpuUsage.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${metrics.cpuUsage > 80 ? 'bg-red-500' : metrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(metrics.cpuUsage, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Memory */}
      <div className="flex items-center space-x-2 min-w-[110px]">
        <MemoryStick size={14} className="text-green-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-gray-400 truncate">RAM</span>
            <span className="text-gray-200 font-medium">{metrics.memoryUsage.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${metrics.memoryUsage > 80 ? 'bg-red-500' : metrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(metrics.memoryUsage, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Disk */}
      <div className="flex items-center space-x-2 min-w-[110px]">
        <HardDrive size={14} className="text-purple-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-gray-400 truncate">Disk</span>
            <span className="text-gray-200 font-medium">{metrics.diskUsage.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${metrics.diskUsage > 80 ? 'bg-red-500' : metrics.diskUsage > 60 ? 'bg-yellow-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(metrics.diskUsage, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Network */}
      <div className="flex items-center space-x-2 min-w-[120px]">
        <Wifi size={14} className="text-gray-400 flex-shrink-0" />
        <div className="flex flex-col leading-tight">
          <div className="flex items-center space-x-1 text-green-400">
            <ArrowDown size={10} />
            <span>{metrics.networkDown}</span>
          </div>
          <div className="flex items-center space-x-1 text-blue-400">
            <ArrowUp size={10} />
            <span>{metrics.networkUp}</span>
          </div>
        </div>
      </div>

      {/* Uptime */}
      <div className="flex items-center space-x-2 min-w-[90px]">
        <Clock size={14} className="text-gray-400 flex-shrink-0" />
        <span className="text-gray-300 truncate">{metrics.uptime}</span>
      </div>

      {/* Refresh Button */}
      <button onClick={collectMetrics} disabled={isRefreshing} className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 ml-2 flex-shrink-0">
        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}