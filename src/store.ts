import { create } from 'zustand';

export interface Host {
  id: string;
  address: string;
  label: string;
  port: number;
  username: string;
  password: string;
  tags: string[];
  groupId?: string;
  os: 'ubuntu' | 'debian' | 'generic';
  createdAt: number;
}

export interface Group {
  id: string;
  name: string;
  count: number;
}

export interface KnownHost {
  id: string;
  address: string;
  fingerprint: string;
  addedAt: number;
}

export interface LogEntry {
  id: string;
  date: string;
  time: string;
  user: string;
  userInitial: string;
  hostId: string;
  hostLabel: string;
  hostTags: string[];
  hostOs: 'ubuntu' | 'generic';
  saved: boolean;
  ip: string;
  localHost: string;
}
export interface PortForwardingRule {
  id: string;
  type: ForwardingType;
  label: string;
  localPort?: number;
  remoteHost?: string;
  remotePort?: number;
  bindAddress?: string;
  createdAt: number;
}
export interface Key {
  id: string;
  label: string;
  type: 'RSA' | 'ECDSA' | 'ECDSA-SK' | 'ED25519' | 'unknown';
  keySize?: number;
  privateKey?: string;
  publicKey?: string;
  certificate?: string;
  createdAt: number;
}
export interface Snippet {
  id: string;
  label: string;
  script: string;
  actionDescription?: string;
  package?: string;
  targets: string[]; // host IDs
  createdAt: number;
}

export interface Tab {
  id: string;
  type: 'vaults' | 'sftp' | 'serial' | 'new-tab' | 'connection';
  label: string;
  hostId?: string;
  connectionStatus?: 'connecting' | 'connected' | 'failed';
  connectionLog?: string[];
}

export interface ShellHistoryEntry {
  id: string;
  command: string;
  hostId?: string;
  executedAt: number;
}
export type KeyPanelMode = 'new' | 'touch-id' | 'fido2' | 'certificate';
export type Page = 'hosts' | 'keychain' | 'port-forwarding' | 'snippets' | 'known-hosts' | 'logs';
export type TopTab = 'vaults' | 'sftp' | 'serial';
export type SortOrder = 'az' | 'za' | 'newest' | 'oldest';
export type ViewMode = 'grid' | 'list';

interface AppState {
  // Данные
  hosts: Host[];
  groups: Group[];
  knownHosts: KnownHost[];
  logs: LogEntry[];
  keys: Key[]; // <-- Тип добавлен сюда
  newTabOpen: boolean;

  tabs: [
    { id: 'tab-vaults', type: 'vaults', label: 'Vaults' },
    { id: 'tab-sftp', type: 'sftp', label: 'SFTP' },
    ],
    activeTabId: 'tab-vaults',
  
  // UI Состояния
  activePage: Page;
  activeTopTab: TopTab;
  selectedHostId: string | null;
  selectedGroupId: string | null;
  isPanelOpen: boolean;
  panelMode: 'new' | 'details';
  searchQuery: string;
  contextMenu: { x: number; y: number; hostId: string } | null;
  panelMenuOpen: boolean;
  pendingDeleteHostId: string | null;
  
  knownHostsSort: SortOrder;
  knownHostsView: ViewMode;
  showInviteBanner: boolean;
  
  selectedTags: string[];
  tagFilterOpen: boolean;
  newHostMenuOpen: boolean;

  // Keychain UI Состояния
  selectedKeyId: string | null;
  keyPanelOpen: boolean;
  keyPanelMode: KeyPanelMode;
  keyMenuOpen: boolean;

  // Actions (Hosts & General)
  setActivePage: (page: Page) => void;
  setActiveTopTab: (tab: TopTab) => void;
  setSelectedHost: (id: string | null) => void;
  setSelectedGroup: (id: string | null) => void;
  openNewHostPanel: () => void;
  openHostDetails: (id: string) => void;
  closePanel: () => void;
  addHost: (host: Host) => void;
  updateHost: (id: string, updates: Partial<Host>) => void;
  duplicateHost: (id: string) => void;
  removeHost: (id: string) => void;
  setSearchQuery: (query: string) => void;
  openContextMenu: (x: number, y: number, hostId: string) => void;
  closeContextMenu: () => void;
  togglePanelMenu: () => void;
  closePanelMenu: () => void;
  openDeleteModal: (id: string) => void;
  closeDeleteModal: () => void;
  setKnownHostsSort: (sort: SortOrder) => void;
  setKnownHostsView: (view: ViewMode) => void;
  setShowInviteBanner: (show: boolean) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setTagFilterOpen: (open: boolean) => void;
  setNewHostMenuOpen: (open: boolean) => void;

  // Actions (Keys)
  setSelectedKey: (id: string | null) => void;
  setKeyPanelOpen: (open: boolean) => void;
  setKeyPanelMode: (mode: KeyPanelMode) => void;
  addKey: (key: Key) => void;
  updateKey: (id: string, updates: Partial<Key>) => void;
  removeKey: (id: string) => void;
  setKeyMenuOpen: (open: boolean) => void;

  setSelectedRule: (id: string | null) => void;
  setForwardingPanelOpen: (open: boolean) => void;
  setForwardingType: (type: ForwardingType) => void;
  addForwardingRule: (rule: PortForwardingRule) => void;
  removeForwardingRule: (id: string) => void;
  setForwardingMenuOpen: (open: boolean) => void;
  forwardingRules: PortForwardingRule[];
  selectedRuleId: string | null;
  forwardingPanelOpen: boolean;
  forwardingType: ForwardingType;
  forwardingMenuOpen: boolean;

    snippets: Snippet[];
    shellHistory: ShellHistoryEntry[];
    selectedSnippetId: string | null;
    snippetPanelOpen: boolean;
    snippetMenuOpen: boolean;
    showShellHistory: boolean;
    newTabOpen: false,
    setSelectedSnippet: (id: string | null) => void;
    setSnippetPanelOpen: (open: boolean) => void;
    addSnippet: (snippet: Snippet) => void;
    updateSnippet: (id: string, updates: Partial<Snippet>) => void;
    removeSnippet: (id: string) => void;
    setSnippetMenuOpen: (open: boolean) => void;
    setShowShellHistory: (show: boolean) => void;
    setNewTabOpen: (open: boolean) => void;
    tabs: Tab[];
    activeTabId: string;
}



const initialHosts: Host[] = [
  { id: 'h1', address: '192.168.1.200', label: 'k8s-master', port: 22, username: 'k8suser', password: 'secret123', tags: ['ssh', 'k8suser', 'VM', 'k8s'], groupId: 'g1', os: 'ubuntu', createdAt: Date.now() - 100000 },
  { id: 'h2', address: '192.168.1.201', label: 'k8s-worker2', port: 22, username: 'k8suser', password: 'secret123', tags: ['ssh', 'k8suser', 'VM', 'k8s'], groupId: 'g1', os: 'generic', createdAt: Date.now() - 90000 },
  { id: 'h3', address: '192.168.1.202', label: 'k8s-worker1', port: 22, username: 'k8suser', password: 'secret123', tags: ['ssh', 'k8suser', 'VM', 'k8s'], groupId: 'g1', os: 'generic', createdAt: Date.now() - 80000 },
  { id: 'h4', address: '192.168.1.131', label: 'kuber-host-server', port: 22, username: 'benx', password: 'pass456', tags: ['ssh', 'benx'], os: 'ubuntu', createdAt: Date.now() - 70000 },
  { id: 'h5', address: '192.168.1.132', label: 'VM MySolial', port: 22, username: 'benx', password: 'pass456', tags: ['ssh', 'benx', 'VM'], os: 'generic', createdAt: Date.now() - 60000 },
];

const initialGroups: Group[] = [{ id: 'g1', name: 'Kuber', count: 4 }];

const initialKnownHosts: KnownHost[] = [
  { id: 'kh1', address: '192.168.1.200', fingerprint: 'SHA256:abc123', addedAt: Date.now() - 100000 },
  { id: 'kh2', address: '192.168.1.202', fingerprint: 'SHA256:def456', addedAt: Date.now() - 90000 },
  { id: 'kh3', address: '192.168.1.201', fingerprint: 'SHA256:ghi789', addedAt: Date.now() - 80000 },
  { id: 'kh4', address: '192.168.1.131', fingerprint: 'SHA256:jkl012', addedAt: Date.now() - 70000 },
];

const initialLogs: LogEntry[] = [
  { id: 'l1', date: 'Sep 22, 2026', time: '11:33 - 14:19 (+1d)', user: 'mgddgzp97n@privaterelay.applei...', userInitial: 'M', hostId: 'h1', hostLabel: 'k8s-master', hostTags: ['ssh', 'k8suser', 'VM', 'k8s'], hostOs: 'generic', saved: false, ip: '91.122.200.80', localHost: 'MacBook-Air-Misha.local' },
  { id: 'l2', date: 'Sep 22, 2026', time: '11:26 - 14:19 (+1d)', user: 'mgddgzp97n@privaterelay.applei...', userInitial: 'M', hostId: 'h2', hostLabel: 'k8s-worker2', hostTags: ['ssh', 'k8suser', 'VM', 'k8s'], hostOs: 'generic', saved: false, ip: '91.122.200.80', localHost: 'MacBook-Air-Misha.local' },
  { id: 'l3', date: 'Sep 22, 2026', time: '11:25 - 14:19 (+1d)', user: 'mgddgzp97n@privaterelay.applei...', userInitial: 'M', hostId: 'h3', hostLabel: 'k8s-worker1', hostTags: ['ssh', 'k8suser', 'VM', 'k8s'], hostOs: 'generic', saved: false, ip: '91.122.200.80', localHost: 'MacBook-Air-Misha.local' },
  { id: 'l4', date: 'Sep 22, 2026', time: '11:23 - 11:23', user: 'mgddgzp97n@privaterelay.applei...', userInitial: 'M', hostId: 'h4', hostLabel: 'kuber-host-server', hostTags: ['ssh', 'benx'], hostOs: 'ubuntu', saved: false, ip: '91.122.200.80', localHost: 'MacBook-Air-Misha.local' },
];
export type ForwardingType = 'local' | 'remote' | 'dynamic';



export const useStore = create<AppState>((set, get) => ({
  // Начальные данные
  hosts: initialHosts,
  groups: initialGroups,
  knownHosts: initialKnownHosts,
  logs: initialLogs,
  keys: [], // <-- ИСПРАВЛЕНО: перенесено сюда из interface

  forwardingRules: [],
  selectedRuleId: null,
  forwardingPanelOpen: false,
  forwardingType: 'local',
  forwardingMenuOpen: false,
  
  // Начальные UI состояния
  activePage: 'hosts',
  activeTopTab: 'vaults',
  selectedHostId: null,
  selectedGroupId: null,
  isPanelOpen: false,
  panelMode: 'new',
  searchQuery: '',
  contextMenu: null,
  panelMenuOpen: false,
  pendingDeleteHostId: null,
  knownHostsSort: 'newest',
  knownHostsView: 'grid',
  showInviteBanner: true,
  selectedTags: [],
  tagFilterOpen: false,
  newHostMenuOpen: false,
  
  // Начальные Keychain состояния
  selectedKeyId: null, // <-- ИСПРАВЛЕНО
  keyPanelOpen: false, // <-- ИСПРАВЛЕНО
  keyPanelMode: 'new', // <-- ИСПРАВЛЕНО
  keyMenuOpen: false,  // <-- ИСПРАВЛЕНО

  

  // Реализация Actions (Hosts & General)
  setActivePage: (page) => set({ activePage: page, isPanelOpen: false, selectedHostId: null, selectedGroupId: null, contextMenu: null }),
  setActiveTopTab: (tab) => set({ activeTopTab: tab }),
  setSelectedHost: (id) => set({ selectedHostId: id }),
  setSelectedGroup: (id) => set({ selectedGroupId: id }),
  setNewTabOpen: (open) => set({ newTabOpen: open }),
  
  openNewHostPanel: () => set({ isPanelOpen: true, panelMode: 'new', selectedHostId: null, panelMenuOpen: false }),
  openHostDetails: (id) => set({ isPanelOpen: true, panelMode: 'details', selectedHostId: id, panelMenuOpen: false }),
  closePanel: () => set({ isPanelOpen: false, selectedHostId: null, panelMenuOpen: false }),
  
  addHost: (host) => set((state) => ({ hosts: [...state.hosts, host] })),
  updateHost: (id, updates) => set((state) => ({
    hosts: state.hosts.map(h => h.id === id ? { ...h, ...updates } : h)
  })),
  duplicateHost: (id) => set((state) => {
    const host = state.hosts.find(h => h.id === id);
    if (!host) return state;
    const newHost: Host = { ...host, id: `h${Date.now()}`, label: `${host.label} copy`, createdAt: Date.now() };
    return { hosts: [...state.hosts, newHost] };
  }),
  removeHost: (id) => set((state) => ({
    hosts: state.hosts.filter(h => h.id !== id),
    selectedHostId: state.selectedHostId === id ? null : state.selectedHostId,
    isPanelOpen: state.selectedHostId === id ? false : state.isPanelOpen,
  })),
  
  

  setSearchQuery: (query) => set({ searchQuery: query }),
  openContextMenu: (x, y, hostId) => set({ contextMenu: { x, y, hostId } }),
  closeContextMenu: () => set({ contextMenu: null }),
  togglePanelMenu: () => set((state) => ({ panelMenuOpen: !state.panelMenuOpen })),
  closePanelMenu: () => set({ panelMenuOpen: false }),
  openDeleteModal: (id) => set({ pendingDeleteHostId: id, panelMenuOpen: false, contextMenu: null }),
  closeDeleteModal: () => set({ pendingDeleteHostId: null }),
  setKnownHostsSort: (sort) => set({ knownHostsSort: sort }),
  setKnownHostsView: (view) => set({ knownHostsView: view }),
  setShowInviteBanner: (show) => set({ showInviteBanner: show }),
  
  toggleTag: (tag) => set((state) => {
    const newTags = state.selectedTags.includes(tag)
      ? state.selectedTags.filter(t => t !== tag)
      : [...state.selectedTags, tag];
    return { selectedTags: newTags };
  }),
  clearTags: () => set({ selectedTags: [] }),
  setTagFilterOpen: (open) => set({ tagFilterOpen: open }),
  setNewHostMenuOpen: (open) => set({ newHostMenuOpen: open }),

  // Реализация Actions (Keys)
  setSelectedKey: (id) => set({ selectedKeyId: id }),
  setKeyPanelOpen: (open) => set({ keyPanelOpen: open }),
  setKeyPanelMode: (mode) => set({ keyPanelMode: mode, keyPanelOpen: true }),
  addKey: (key) => set((state) => ({ keys: [...state.keys, key] })),
  updateKey: (id, updates) => set((state) => ({
    keys: state.keys.map(k => k.id === id ? { ...k, ...updates } : k)
  })),
  removeKey: (id) => set((state) => ({
    keys: state.keys.filter(k => k.id !== id),
    selectedKeyId: state.selectedKeyId === id ? null : state.selectedKeyId,
    keyPanelOpen: state.selectedKeyId === id ? false : state.keyPanelOpen,
  })),
  setKeyMenuOpen: (open) => set({ keyMenuOpen: open }),
  setSelectedRule: (id) => set({ selectedRuleId: id }),
  setForwardingPanelOpen: (open) => set({ forwardingPanelOpen: open }),
  setForwardingType: (type) => set({ forwardingType: type, forwardingPanelOpen: true }),
  addForwardingRule: (rule) => set((state) => ({ forwardingRules: [...state.forwardingRules, rule] })),
  removeForwardingRule: (id) => set((state) => ({
  forwardingRules: state.forwardingRules.filter(r => r.id !== id),
  selectedRuleId: state.selectedRuleId === id ? null : state.selectedRuleId,
  forwardingPanelOpen: state.selectedRuleId === id ? false : state.forwardingPanelOpen,

  setSelectedSnippet: (id) => set({ selectedSnippetId: id }),
  setSnippetPanelOpen: (open) => set({ snippetPanelOpen: open }),
  addSnippet: (snippet) => set((state) => ({ snippets: [...state.snippets, snippet] })),
  updateSnippet: (id, updates) => set((state) => ({
    snippets: state.snippets.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  removeSnippet: (id) => set((state) => ({
    snippets: state.snippets.filter(s => s.id !== id),
    selectedSnippetId: state.selectedSnippetId === id ? null : state.selectedSnippetId,
    snippetPanelOpen: state.selectedSnippetId === id ? false : state.snippetPanelOpen,
  })),
  setSnippetMenuOpen: (open) => set({ snippetMenuOpen: open }),
  setShowShellHistory: (show) => set({ showShellHistory: show }),

  addConnectionTab: (hostId) => {
  const host = get().hosts.find(h => h.id === hostId);
  if (!host) return;
  
  const newTab: Tab = {
    id: `tab-${Date.now()}`,
    type: 'connection',
    label: host.label,
    hostId,
    connectionStatus: 'connecting',
    connectionLog: [],
  };
  
  set((state) => ({
    tabs: [...state.tabs, newTab],
    activeTabId: newTab.id,
  }));
},

setActiveTab: (tabId) => set({ activeTabId: tabId }),

closeTab: (tabId) => set((state) => {
  const newTabs = state.tabs.filter(t => t.id !== tabId);
  const newActiveTabId = state.activeTabId === tabId 
    ? (newTabs.length > 0 ? newTabs[newTabs.length - 1].id : 'tab-vaults')
    : state.activeTabId;
  return { tabs: newTabs, activeTabId: newActiveTabId };
}),

updateConnectionStatus: (tabId, status) => set((state) => ({
  tabs: state.tabs.map(t => t.id === tabId ? { ...t, connectionStatus: status } : t)
})),

addConnectionLog: (tabId, log) => set((state) => ({
  tabs: state.tabs.map(t => t.id === tabId ? { ...t, connectionLog: [...(t.connectionLog || []), log] } : t)
})),
})),


snippets: [],
shellHistory: [
  { id: 'sh1', command: 'clear', executedAt: Date.now() - 100000 },
  { id: 'sh2', command: 'ip a', executedAt: Date.now() - 90000 },
  { id: 'sh3', command: 'sudo apt-get update && sudo apt-get upgrade -y', executedAt: Date.now() - 80000 },
  { id: 'sh4', command: 'sudo apt-get install -y kubelet kubeadm kubectl', executedAt: Date.now() - 70000 },
  { id: 'sh5', command: 'sudo apt-get update', executedAt: Date.now() - 60000 },
  { id: 'sh6', command: 'sudo apt-get install -y apt-transport-https ca-certificates curl', executedAt: Date.now() - 50000 },
  { id: 'sh7', command: 'sudo sysctl --system', executedAt: Date.now() - 40000 },
  { id: 'sh8', command: 'net.ipv4.ip_forward = 1', executedAt: Date.now() - 30000 },
  { id: 'sh9', command: 'net.bridge.bridge-nf-call-ip6tables = 1', executedAt: Date.now() - 20000 },
  { id: 'sh10', command: 'sudo modprobe br_netfilter', executedAt: Date.now() - 10000 },
  { id: 'sh11', command: 'sudo modprobe overlay', executedAt: Date.now() - 5000 },
],
selectedSnippetId: null,
snippetPanelOpen: false,
snippetMenuOpen: false,
showShellHistory: false,
setForwardingMenuOpen: (open) => set({ forwardingMenuOpen: open }),


}));