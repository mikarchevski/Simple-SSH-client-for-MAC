import { Server, Copy, ArrowRight, RotateCcw, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Terminal } from './Terminal';

export function ConnectionPage({ tabId }: { tabId: string }) {
  const { tabs, updateConnectionStatus, addConnectionLog, openHostDetails, closeTab } = useStore();
  const tab = tabs.find(t => t.id === tabId);
  const host = tab?.hostId ? useStore.getState().hosts.find(h => h.id === tab.hostId) : null;
  const hasConnected = useRef(false);
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    if (!tab || !host || hasConnected.current) return;
    hasConnected.current = true;

    const connect = async () => {
      addConnectionLog(tabId, ` Starting a new connection to: "${host.address}" port "${host.port}"`);
      
      try {
        const sessionId = await invoke('ssh_connect', {
          creds: {
            session_id: tabId,
            host: host.address,
            port: host.port,
            username: host.username,
            password: host.password,
          },
        });

        addConnectionLog(tabId, `✅ Connected successfully to ${host.address}`);
        updateConnectionStatus(tabId, 'connected');
        
        // Показываем терминал после успешного подключения
        setTimeout(() => setShowTerminal(true), 500);
      } catch (error) {
        addConnectionLog(tabId, `❌ Connection failed: ${error}`);
        updateConnectionStatus(tabId, 'failed');
      }
    };

    connect();

    // Слушаем данные от сервера (для логов до подключения терминала)
    const unlistenData = listen<[string, string]>('ssh-data', (event) => {
      const [eventId, data] = event.payload;
      if (eventId === tabId) {
        addConnectionLog(tabId, data);
      }
    });

    // Слушаем закрытие соединения
    const unlistenClosed = listen<string>('ssh-closed', (event) => {
      if (event.payload === tabId) {
        addConnectionLog(tabId, '🔴 Connection closed by remote host');
        updateConnectionStatus(tabId, 'failed');
        setShowTerminal(false);
      }
    });

    return () => {
      unlistenData.then(fn => fn());
      unlistenClosed.then(fn => fn());
    };
  }, [tabId, host]);

  if (!tab || !host) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">Host not found</div>;
  }

  const isConnecting = tab.connectionStatus === 'connecting';
  const isFailed = tab.connectionStatus === 'failed';
  const isConnected = tab.connectionStatus === 'connected';

  return (
    <div className="flex-1 flex flex-col">
      {/* Если терминал показан — занимаем весь экран */}
      {showTerminal && isConnected ? (
                <div className="flex-1 w-full h-full min-h-screen bg-[#1e1e2e] p-2">
            <Terminal sessionId={tabId} />
        </div>
        ) : (
        /* Иначе показываем процесс подключения */
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-2xl space-y-6">
            {/* Заголовок */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Server size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-100">{host.label}</h2>
                  <p className="text-sm text-gray-500">SSH {host.address}:{host.port}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const logs = tab.connectionLog?.join('\n') || '';
                  navigator.clipboard.writeText(logs);
                }}
                className="bg-[#2a2a3a] hover:bg-[#333] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <Copy size={14} />
                <span>Copy logs</span>
              </button>
            </div>

            {/* Прогресс-бар */}
            <div className="relative h-1 bg-[#3a3a4a] rounded-full">
              {isConnecting && (
                <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              )}
              {isFailed && (
                <div className="absolute left-0 top-0 h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
              )}
              {isConnected && (
                <div className="absolute left-0 top-0 h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
              )}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <Server size={12} className="text-white" />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#3a3a4a] flex items-center justify-center">
                <ArrowRight size={12} className="text-gray-400" />
              </div>
            </div>

            {/* Статус подключения */}
            {isConnecting && (
              <div className="text-center">
                <p className="text-lg text-blue-400">Connecting...</p>
              </div>
            )}

            {isFailed && (
              <div className="text-center">
                <p className="text-lg text-red-400 font-semibold">Connection failed with connection log:</p>
              </div>
            )}

            {isConnected && (
              <div className="text-center">
                <p className="text-lg text-green-400 font-semibold">Connected successfully!</p>
              </div>
            )}

            {/* Лог подключения */}
            <div className="bg-[#252535] border border-[#3a3a4a] rounded-lg p-6 space-y-3 max-h-96 overflow-y-auto">
              {tab.connectionLog?.map((log, idx) => (
                <div key={idx} className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                  {log}
                </div>
              ))}
              
              {isFailed && (
                <div className="pt-3 border-t border-[#3a3a4a]">
                  <p className="text-sm text-gray-400">
                    See the <button className="text-blue-400 hover:text-blue-300 underline">Documentation</button> to learn more about common connection issues.
                  </p>
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-between pt-4">
              <div className="flex space-x-3">
                <button 
                  onClick={() => closeTab(tabId)}
                  className="bg-[#2a2a3a] hover:bg-[#333] text-gray-200 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    if (host) {
                      openHostDetails(host.id);
                    }
                  }}
                  className="bg-[#2a2a3a] hover:bg-[#333] text-gray-200 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Pencil size={14} />
                  <span>Edit host</span>
                </button>
              </div>
              
              {isFailed && (
                <button 
                  onClick={() => {
                    updateConnectionStatus(tabId, 'connecting');
                    useStore.getState().tabs = useStore.getState().tabs.map(t => 
                      t.id === tabId ? { ...t, connectionLog: [] } : t
                    );
                    hasConnected.current = false;
                    setShowTerminal(false);
                  }}
                  className="bg-[#007AFF] hover:bg-[#0062cc] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <RotateCcw size={14} />
                  <span>Start over</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}