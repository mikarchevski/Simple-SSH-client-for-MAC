import { MoreVertical, ArrowRight, Folder, Tag, HardDrive, User, Lock, Users, ChevronDown, Plus, Eye, EyeOff, Zap, Code2, Server, ArrowRightLeft, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore, Group } from '../store';

export function RightPanel() {
  const { 
    isPanelOpen, panelMode, selectedHostId, hosts, closePanel, addHost, updateHost, 
    panelMenuOpen, togglePanelMenu, closePanelMenu, duplicateHost, openDeleteModal,
    editingGroupId, groups, updateGroup, removeGroup, setEditingGroupId
  } = useStore();

  const editingGroup = groups.find(g => g.id === editingGroupId);
  const selectedHost = hosts.find(h => h.id === selectedHostId);
  const menuRef = useRef<HTMLDivElement>(null);

  const [newHostForm, setNewHostForm] = useState({
    address: '',
    label: '',
    port: 22,
    username: '',
    password: '',
    tags: [] as string[],
    groupId: undefined as string | undefined,
  });
  
  const isGroupMode = editingGroupId !== null;

  useEffect(() => {
    if (panelMode === 'new') {
      setNewHostForm({
        address: '',
        label: '',
        port: 22,
        username: '',
        password: '',
        tags: [],
        groupId: undefined,
      });
    }
  }, [panelMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closePanelMenu();
      }
    };
    if (panelMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelMenuOpen, closePanelMenu]);

  if (!isPanelOpen) return null;

  const isNewHostFormValid = newHostForm.address.trim() !== '' && newHostForm.label.trim() !== '';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => {
        useStore.getState().cancelGroupEditing();
      }} />
      <div className="fixed right-0 top-0 h-full w-96 bg-[#1e1e2e] border-l border-[#2a2a3a] z-50 shadow-2xl flex flex-col">
        <PanelHeader 
          mode={isGroupMode ? 'edit-group' : panelMode} 
          onClose={() => {
            if (isGroupMode) {
              setEditingGroupId(null);
            } else {
              closePanel();
            }
          }} 
        />
        
        {panelMenuOpen && panelMode === 'details' && (
          <div 
            ref={menuRef}
            className="absolute right-4 top-14 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[180px] z-50"
          >
            <PanelMenuItem label="Connect" onClick={() => { 
              if (selectedHostId) useStore.getState().addConnectionTab(selectedHostId);
              closePanelMenu(); 
              closePanel();
            }} />
            <PanelMenuItem label="Add Telnet" onClick={closePanelMenu} />
            <PanelMenuItem label="Duplicate" onClick={() => { duplicateHost(selectedHostId!); closePanelMenu(); }} />
            <div className="my-1 border-t border-[#3a3a4a]" />
            <PanelMenuItem label="Remove" danger onClick={() => openDeleteModal(selectedHostId!)} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isGroupMode && editingGroup ? (
            <GroupForm 
              group={editingGroup} 
              onSave={(updates) => updateGroup(editingGroup.id, updates)}
              onDelete={() => {
                removeGroup(editingGroup.id);
                setEditingGroupId(null);
                closePanel();
              }}
            />
          ) : panelMode === 'new' ? (
            <NewHostForm form={newHostForm} setForm={setNewHostForm} />
          ) : selectedHost ? (
            <HostDetailsForm host={selectedHost} onSave={(updates) => updateHost(selectedHost.id, updates)} />
          ) : null}
        </div>

        {/* Нижняя панель с кнопками */}
        <div className="p-4 border-t border-[#2a3a4a] space-y-2">
          {isGroupMode ? (
            <>
              {/* Кнопка удаления группы */}
              <button 
                onClick={() => {
                  if (editingGroup) {
                    useStore.getState().openDeleteGroupModal(editingGroup.id);
                  }
                }}
        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-4"
              >
                <Trash2 size={14}className="mr-2" />
                Delete Group
              </button>
              
              {/* Кнопка Done */}
              <button 
                onClick={() => {
                  setEditingGroupId(null);
                  closePanel();
                }}
                className="w-full bg-[#007AFF] hover:bg-[#0062cc] text-white py-2.5 rounded-md text-sm font-medium transition-colors"
              >
                Done
              </button>
            </>
          ) : panelMode === 'details' ? (
            <>
              {/* Кнопка удаления хоста */}
              <button 
                onClick={() => {
                  if (selectedHostId) {
                    openDeleteModal(selectedHostId);
                  }
                }}
        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 size={14} className="mr-2" />
                Delete Host
              </button>
              
              {/* Кнопка Connect */}
              <button 
                onClick={() => {
                  if (selectedHostId) {
                    useStore.getState().addConnectionTab(selectedHostId);
                    closePanel();
                  }
                }}
                className="w-full bg-[#007AFF] hover:bg-[#0062cc] text-white py-2.5 rounded-md text-sm font-medium transition-colors"
              >
                Connect
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                if (panelMode === 'new') {
                  const newHost = {
                    id: `h${Date.now()}`,
                    ...newHostForm,
                    os: 'generic' as const,
                    createdAt: Date.now(),
                  };
                  addHost(newHost);
                  useStore.getState().addConnectionTab(newHost.id);
                  closePanel();
                } else if (selectedHostId) {
                  useStore.getState().addConnectionTab(selectedHostId);
                  closePanel();
                }
              }}
              disabled={panelMode === 'new' && !isNewHostFormValid}
              className="w-full bg-[#007AFF] hover:bg-[#0062cc] disabled:bg-[#3a3a4a] disabled:cursor-not-allowed text-white py-2.5 rounded-md text-sm font-medium transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// --- КОМПОНЕНТЫ ФОРМЫ ---

function TagInput({ tags = [], onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="bg-[#1e1e2e] border border-[#3a3a4a] rounded-md p-2 flex flex-wrap gap-2 items-center">
      {tags.map(tag => (
        <span key={tag} className="px-2 py-1 bg-[#3a3a4a] text-xs text-gray-300 rounded flex items-center space-x-1">
          <Tag size={10} />
          <span>{tag}</span>
          <button onClick={() => removeTag(tag)} className="hover:text-white ml-1">×</button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tag..."
        className="flex-1 min-w-[100px] bg-transparent text-gray-200 text-sm focus:outline-none placeholder-gray-500"
      />
    </div>
  );
}

function GroupSelector({ groupId, groups, onChange }: { groupId?: string; groups: any[]; onChange: (groupId: string | undefined) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addGroup = useStore((state) => state.addGroup);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedGroup = groups.find(g => g.id === groupId);

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroupId = `g${Date.now()}`;
      const newGroup = { id: newGroupId, name: newGroupName.trim(), count: 1 };
      addGroup(newGroup);
      onChange(newGroupId);
      setNewGroupName('');
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1e1e2e] text-gray-400 rounded-md px-3 py-2 text-sm border border-[#3a3a4a] hover:border-[#4a4a5a] transition-colors flex items-center justify-between"
      >
        <span className="flex items-center space-x-2">
          <Folder size={14} />
          <span>{selectedGroup?.name || 'No group'}</span>
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 z-50 min-w-[200px]">
          <button onClick={() => { onChange(undefined); setIsOpen(false); }} className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors text-gray-400">
            No group
          </button>
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => { onChange(group.id); setIsOpen(false); }}
              className={`w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors ${groupId === group.id ? 'text-blue-400' : 'text-gray-200'}`}
            >
              {group.name}
            </button>
          ))}
          <div className="my-1 border-t border-[#3a3a4a]" />
          {isCreating ? (
            <div className="px-3 py-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateGroup(); if (e.key === 'Escape') setIsCreating(false); }}
                placeholder="Group name..."
                className="w-full bg-[#1e1e2e] text-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a]"
                autoFocus
              />
              <div className="flex space-x-2 mt-2">
                <button onClick={handleCreateGroup} className="flex-1 bg-[#007AFF] hover:bg-[#0062cc] text-white px-2 py-1 rounded text-xs">Create</button>
                <button onClick={() => setIsCreating(false)} className="flex-1 bg-[#3a3a4a] hover:bg-[#4a4a5a] text-gray-300 px-2 py-1 rounded text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsCreating(true)} className="w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors text-blue-400 flex items-center space-x-2">
              <Plus size={12} /><span>Create new group</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function HostDetailsForm({ host, onSave }: { host: any; onSave: (updates: any) => void }) {
  const [form, setForm] = useState({ 
    address: host.address, 
    label: host.label, 
    port: host.port, 
    username: host.username, 
    password: host.password, 
    tags: host.tags || [], 
    groupId: host.groupId
  });

  const groups = useStore((state) => state.groups);

  useEffect(() => {
    const timer = setTimeout(() => { onSave(form); }, 500);
    return () => clearTimeout(timer);
  }, [form, onSave]);

  return (
    <>
      <FormSection title="Address">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0">
            <Server size={18} />
          </div>
          <input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
            className="flex-1 bg-[#1e1e2e] text-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a]" />
        </div>
      </FormSection>
      <FormSection title="General">
        <input type="text" value={form.label} onChange={(e) => setForm({...form, label: e.target.value})}
          className="w-full bg-[#1e1e2e] text-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a] mb-3" placeholder="Label" />
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Group</label>
          <GroupSelector groupId={form.groupId} groups={groups} onChange={(newGroupId) => setForm({...form, groupId: newGroupId})} />
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-500 mb-1 block">Tags</label>
          <TagInput tags={form.tags} onChange={(newTags) => setForm({...form, tags: newTags})} />
        </div>
        <FormButton icon={<HardDrive size={14} />} label="Backspace" rightLabel="Default" />
      </FormSection>
      <button className="w-full bg-[#252535] border border-[#333] rounded-lg p-4 text-blue-400 hover:bg-[#2a2a3a] transition-colors flex items-center justify-center space-x-2">
        <Users size={16} /><span className="text-sm">Share this host</span>
      </button>
      <FormSection title="SSH">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <span>on</span>
          <input type="number" value={form.port} onChange={(e) => setForm({...form, port: parseInt(e.target.value) || 22})}
            className="w-16 bg-[#1e1e2e] text-gray-200 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a]" />
          <span>port</span>
        </div>
      </FormSection>
      <CredentialsSection form={form} setForm={setForm} showMergeHint />
      <AdvancedOptions />
    </>
  );
}

function NewHostForm({ form, setForm }: { form: any; setForm: any }) {
  const groups = useStore((state) => state.groups);

  return (
    <>
      <FormSection title="Address">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
            <Server size={18} />
          </div>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({...form, address: e.target.value})}
            className="flex-1 bg-[#1e1e2e] text-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a] placeholder-gray-500"
            placeholder="IP or Hostname"
          />
        </div>
      </FormSection>
      
      <FormSection title="General">
        <input
          type="text"
          value={form.label}
          onChange={(e) => setForm({...form, label: e.target.value})}
          className="w-full bg-[#1e1e2e] text-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a] placeholder-gray-500 mb-3"
          placeholder="Label"
        />
        
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Group</label>
          <GroupSelector 
            groupId={form.groupId} 
            groups={groups} 
            onChange={(newGroupId) => setForm({...form, groupId: newGroupId})} 
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tags</label>
          <TagInput 
            tags={form.tags} 
            onChange={(newTags) => setForm({...form, tags: newTags})} 
          />
        </div>
      </FormSection>

      <FormSection title="SSH">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <span>on</span>
          <input
            type="number"
            value={form.port}
            onChange={(e) => setForm({...form, port: parseInt(e.target.value) || 22})}
            className="w-16 bg-[#1e1e2e] text-gray-200 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a]"
          />
          <span>port</span>
        </div>
      </FormSection>
      
      <CredentialsSection form={form} setForm={setForm} />
      <AdvancedOptions />
    </>
  );
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

function PanelHeader({ mode, onClose }: { mode: 'new' | 'details' | 'edit-group'; onClose: () => void }) {
  const { panelMenuOpen, togglePanelMenu } = useStore();
  
  const getTitle = () => {
    switch (mode) {
      case 'new': return 'New Host';
      case 'details': return 'Host Details';
      case 'edit-group': return 'New Group';
      default: return 'New Host';
    }
  };

  return (
    <div className="h-14 border-b border-[#2a2a3a] flex items-center justify-between px-4 flex-shrink-0 relative">
      <div>
        <h2 className="text-lg font-semibold text-gray-100">{getTitle()}</h2>
        <p className="text-xs text-gray-500">Personal vault</p>
      </div>
      <div className="flex items-center space-x-2">
        {mode === 'details' && (
          <button onClick={togglePanelMenu} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <MoreVertical size={18} />
          </button>
        )}
        <button onClick={() => useStore.getState().cancelGroupEditing()} className="p-1.5 text-gray-400 hover:text-white transition-colors">
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function PanelMenuItem({ label, danger, onClick }: { label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors ${danger ? 'text-red-400 hover:text-red-300' : 'text-gray-200'}`}
    >
      {label}
    </button>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#252535] rounded-lg p-4 border border-[#333] space-y-3">
      <label className="text-sm font-semibold text-gray-200 block">{title}</label>
      {children}
    </div>
  );
}

function FormButton({ icon, label, rightLabel }: { icon: React.ReactNode; label: string; rightLabel?: string }) {
  return (
    <button className="w-full bg-[#1e1e2e] text-gray-400 rounded-md px-3 py-2 text-sm border border-[#3a3a4a] hover:border-[#4a4a5a] transition-colors flex items-center justify-between">
      <span className="flex items-center space-x-2">{icon}<span>{label}</span></span>
      {rightLabel && <span className="text-xs text-gray-500">{rightLabel}</span>}
    </button>
  );
}

function CredentialsSection({ form, setForm, showMergeHint = false }: any) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <FormSection title="Credentials">
      {showMergeHint && (
        <div className="bg-[#1e1e2e] rounded-md p-3 mb-3 border border-[#3a3a4a]">
          <p className="text-xs text-gray-400 mb-1"><span className="text-blue-400">4 hosts</span> reuse credentials. Merge them for easy updates.</p>
          <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1">
            <Plus size={12} /><span>Create an identity</span>
          </button>
        </div>
      )}
      <div className="relative">
        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}
          className="w-full bg-[#1e1e2e] text-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a] placeholder-gray-500" placeholder="Username" />
      </div>
      <div className="relative">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
          className="w-full bg-[#1e1e2e] text-gray-200 rounded-md pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a] placeholder-gray-500" placeholder="Password" />
        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      <button className="w-full text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center space-x-1 py-2">
        <Plus size={12} /><span>SSH ID, Key, Certificate, FIDO2</span>
      </button>
    </FormSection>
  );
}

function AdvancedOptions() {
  const [showMore, setShowMore] = useState(false);
  return (
    <>
      <button onClick={() => setShowMore(!showMore)} className="w-full text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center space-x-1 py-2">
        <span>Show more</span><ChevronDown size={12} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
      </button>
      {showMore && (
        <div className="space-y-3">
          <FormButton icon={<Lock size={14} />} label="Agent Forwarding" rightLabel="Disabled" />
          <FormButton icon={<Code2 size={14} />} label="Startup snippet" />
          <FormButton icon={<Server size={14} />} label="Host Chaining" />
          <FormButton icon={<ArrowRightLeft size={14} />} label="Proxy" />
          <FormButton icon={<Tag size={14} />} label="Environment Variable" />
          <FormButton icon={<Code2 size={14} />} label="UTF-8" />
          <FormButton icon={<Zap size={14} />} label="Mosh" rightLabel="Disabled" />
          <div className="bg-[#252535] border border-[#333] rounded-lg p-3 flex items-center space-x-3">
            <div className="w-12 h-8 rounded bg-gradient-to-r from-gray-700 via-blue-500 to-purple-500" />
            <span className="text-sm text-blue-400">Aura</span>
          </div>
        </div>
      )}
      <button className="w-full bg-[#252535] border border-[#333] rounded-lg p-4 text-gray-400 hover:text-gray-200 hover:border-[#444] transition-colors flex items-center justify-center space-x-2">
        <Plus size={16} /><span className="text-sm">Add Telnet</span>
      </button>
    </>
  );
}

function GroupForm({ 
  group, 
  onSave, 
  onDelete 
}: { 
  group: Group; 
  onSave: (updates: Partial<Group>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState({
    name: group.name,
  });

  const hosts = useStore((state) => state.hosts);
  const groupHosts = hosts.filter(h => h.groupId === group.id);

  useEffect(() => {
    const timer = setTimeout(() => { 
      if (form.name.trim()) {
        onSave({ name: form.name.trim() });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.name, onSave]);

  return (
    <>
      <FormSection title="General">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
            <Folder size={18} />
          </div>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 bg-[#1e1e2e] text-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a]"
            placeholder="Set a group name..."
            autoFocus
          />
          
        </div>
<FormButton icon={<Folder size={14} />} label="Parent Group" />
        <div className="text-xs text-gray-500">
          {groupHosts.length} {groupHosts.length === 1 ? 'host' : 'hosts'} in group
        </div>
      </FormSection>
    </>
  );
}