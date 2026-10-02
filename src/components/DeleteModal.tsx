import { useStore } from '../store';

export function DeleteModal() {
  const { 
    pendingDeleteHostId, 
    pendingDeleteGroupId,
    closeDeleteModal, 
    closeDeleteGroupModal,
    removeHost, 
    removeGroup,
    hosts,
    groups,
    setEditingGroupId,
    closePanel
  } = useStore();

  // Определяем, что удаляем
  const isDeletingHost = pendingDeleteHostId !== null;
  const isDeletingGroup = pendingDeleteGroupId !== null;

  if (!isDeletingHost && !isDeletingGroup) return null;

  const host = isDeletingHost ? hosts.find(h => h.id === pendingDeleteHostId) : null;
  const group = isDeletingGroup ? groups.find(g => g.id === pendingDeleteGroupId) : null;

  const handleConfirm = () => {
    if (isDeletingHost && pendingDeleteHostId) {
      removeHost(pendingDeleteHostId);
      closeDeleteModal();
    } else if (isDeletingGroup && pendingDeleteGroupId) {
      removeGroup(pendingDeleteGroupId);
      setEditingGroupId(null);
      closePanel();
      closeDeleteGroupModal();
    }
  };

  const title = isDeletingHost ? 'Delete Host' : 'Delete Group';
  const name = isDeletingHost ? host?.label : group?.name;
  const message = isDeletingHost 
    ? `Are you sure you want to delete "${name}"? This action cannot be undone.`
    : `Are you sure you want to delete group "${name}"? Hosts in this group will not be deleted, but will become ungrouped.`;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center">
      <div className="bg-[#1e1e2e] border border-[#2a2a3a] rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        
        <div className="flex space-x-3">
          <button
            onClick={() => {
              if (isDeletingHost) closeDeleteModal();
              else closeDeleteGroupModal();
            }}
            className="flex-1 bg-[#2a2a3a] hover:bg-[#3a3a4a] text-gray-200 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}