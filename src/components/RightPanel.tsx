import { MoreVertical, ArrowRight, Folder, Tag, HardDrive, User, Lock, Users, ChevronDown, Plus, Eye, EyeOff, Zap, Code2, Server, ArrowRightLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';

export function RightPanel() {
  const { isPanelOpen, panelMode, selectedHostId, hosts, closePanel, addHost, updateHost, panelMenuOpen, togglePanelMenu, closePanelMenu, duplicateHost, openDeleteModal, openHostDetails } = useStore();
  const selectedHost = hosts.find(h => h.id === selectedHostId);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне
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

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={closePanel} />
      <div className="fixed right-0 top-0 h-full w-96 bg-[#1e1e2e] border-l border-[#2a2a3a] z-50 shadow-2xl flex flex-col">
        <PanelHeader mode={panelMode} onClose={closePanel} />
        
        {/* Выпадающее меню троеточия */}
        {panelMenuOpen && panelMode === 'details' && (
          <div 
            ref={menuRef}
            className="absolute right-4 top-14 bg-[#252535] border border-[#3a3a4a] rounded-lg shadow-2xl py-1.5 min-w-[180px] z-50"
          >
            <PanelMenuItem label="Connect" onClick={() => { closePanelMenu(); }} />
            <PanelMenuItem label="Add Telnet" onClick={() => { closePanelMenu(); }} />
            <PanelMenuItem label="Duplicate" onClick={() => { duplicateHost(selectedHostId!); closePanelMenu(); }} />
            <div className="my-1 border-t border-[#3a3a4a]" />
            <PanelMenuItem label="Remove" danger onClick={() => openDeleteModal(selectedHostId!)} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {panelMode === 'new' ? (
            <NewHostForm onSave={(host) => { addHost(host); closePanel(); }} />
          ) : selectedHost ? (
            <HostDetailsForm host={selectedHost} onSave={(updates) => updateHost(selectedHost.id, updates)} />
          ) : null}
        </div>

                <div className="p-4 border-t border-[#2a3a4a]">
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
        </div>
      </div>
    </>
  );
}

function PanelHeader({ mode, onClose }: { mode: 'new' | 'details'; onClose: () => void }) {
  const { panelMenuOpen, togglePanelMenu } = useStore();
  return (
    <div className="h-14 border-b border-[#2a2a3a] flex items-center justify-between px-4 flex-shrink-0 relative">
      <div>
        <h2 className="text-lg font-semibold text-gray-100">{mode === 'new' ? 'New Host' : 'Host Details'}</h2>
        <p className="text-xs text-gray-500">Personal vault</p>
      </div>
      <div className="flex items-center space-x-2">
        {mode === 'details' && (
          <button onClick={togglePanelMenu} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <MoreVertical size={18} />
          </button>
        )}
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white transition-colors">
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
      className={`w-full px-3 py-1.5 text-sm text-left hover:bg-[#3a3a4a] transition-colors ${
        danger ? 'text-red-400 hover:text-red-300' : 'text-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

// Остальные компоненты формы (NewHostForm, HostDetailsForm, FormSection, FormButton, CredentialsSection, AdvancedOptions) 
// оставляем как в предыдущем ответе — они не меняются
// Просто скопируй их из предыдущего RightPanel.tsx сюда

function NewHostForm({ onSave }: { onSave: (host: any) => void }) {
  const [form, setForm] = useState({
    address: '',
    label: '',
    port: 22,
    username: '',
    password: '',
    tags: [] as string[],
  });

  const handleSubmit = () => {
    if (!form.address) return;
    
    // 1. Создаем новый хост
    const newHost = {
      id: `h${Date.now()}`,
      ...form,
      os: 'generic' as const,
      createdAt: Date.now(),
    };
    
    // 2. Сохраняем его в store
    onSave(newHost);
    
    // 3. СРАЗУ открываем вкладку подключения к этому новому хосту!
    useStore.getState().addConnectionTab(newHost.id);
  };

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
        <FormButton icon={<Folder size={14} />} label="Parent Group" />
        <FormButton icon={<Tag size={14} />} label="Tags" />
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
      
      {/* Кнопка, которая теперь сохраняет И подключается */}
      <div className="pt-4">
        <button 
          onClick={handleSubmit}
          disabled={!form.address}
          className="w-full bg-[#007AFF] hover:bg-[#0062cc] disabled:bg-[#3a3a4a] disabled:cursor-not-allowed text-white py-2.5 rounded-md text-sm font-medium transition-colors"
        >
          Connect
        </button>
      </div>
    </>
  );
}

function HostDetailsForm({ host, onSave }: { host: any; onSave: (updates: any) => void }) {
  const [form, setForm] = useState({ address: host.address, label: host.label, port: host.port, username: host.username, password: host.password, tags: host.tags });
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
          className="w-full bg-[#1e1e2e] text-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#3a3a4a] mb-3" />
        <FormButton icon={<Folder size={14} />} label="Kuber" />
        <div className="flex flex-wrap gap-2 mb-3">
          {form.tags.map((tag: string) => (
            <span key={tag} className="px-2 py-1 bg-[#3a3a4a] text-xs text-gray-300 rounded flex items-center space-x-1">
              <Tag size={10} /><span>{tag}</span>
              <button className="hover:text-white">×</button>
            </span>
          ))}
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