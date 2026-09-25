import { X, Server } from 'lucide-react';
import { useStore } from '../store';

export function DeleteModal() {
  const { pendingDeleteHostId, hosts, closeDeleteModal, removeHost } = useStore();
  const host = hosts.find(h => h.id === pendingDeleteHostId);

  if (!host) return null;

  const handleRemove = () => {
    removeHost(host.id);
    closeDeleteModal();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={closeDeleteModal}>
        <div 
          className="bg-[#1e1e2e] border border-[#3a3a4a] rounded-xl shadow-2xl w-[480px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a]">
            <h2 className="text-xl font-semibold text-gray-100">Remove a host</h2>
            <button onClick={closeDeleteModal} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-8">
            <p className="text-gray-300 mb-4">You are going to remove this host:</p>
            
            <div className="bg-[#252535] border border-[#3a3a4a] rounded-lg p-4 flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Server size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-100">{host.label}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{host.tags.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex justify-end border-t border-[#2a2a3a]">
            <button 
              onClick={handleRemove}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  );
}