import { MoreVertical, ArrowRight, Key, Usb, Fingerprint } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store';

export function KeyRightPanel() {
  const { keyPanelOpen, keyPanelMode, selectedKeyId, keys, setKeyPanelOpen, updateKey } = useStore();
  const selectedKey = keys.find(k => k.id === selectedKeyId);

  if (!keyPanelOpen) return null;

  return (
    <div className="w-96 bg-[#1e1e2e] border-l border-[#2a2a3a] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-[#2a2a3a] flex items-center justify-between px-4 flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            {keyPanelMode === 'new' ? 'New Key' : 
             keyPanelMode === 'touch-id' ? 'Generate Biometric Key' :
             keyPanelMode === 'fido2' ? 'Generate FIDO2 Key' : 'Certificate'}
          </h2>
          <p className="text-xs text-gray-500">Personal vault</p>
        </div>
        <div className="flex items-center space-x-2">
          {keyPanelMode === 'new' && (
            <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
              <MoreVertical size={18} />
            </button>
          )}
          <button onClick={() => setKeyPanelOpen(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {keyPanelMode === 'new' && <NewKeyForm />}
        {keyPanelMode === 'touch-id' && <TouchIDForm />}
        {keyPanelMode === 'fido2' && <FIDO2Form />}
        {keyPanelMode === 'certificate' && <CertificateForm />}
      </div>
    </div>
  );
}

function NewKeyForm() {
  const { selectedKeyId, updateKey, keys } = useStore();
  const key = keys.find(k => k.id === selectedKeyId);
  const [label, setLabel] = useState(key?.label || '');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [certificate, setCertificate] = useState('');

  const handleSave = () => {
    if (selectedKeyId) {
      updateKey(selectedKeyId, { label, privateKey, publicKey, certificate });
    }
  };

  return (
    <>
      <div className="space-y-3">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleSave}
          className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
          placeholder="Label"
        />
        <textarea
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          onBlur={handleSave}
          className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 h-24 resize-none"
          placeholder="Private key *"
        />
        <textarea
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          onBlur={handleSave}
          className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 h-24 resize-none"
          placeholder="Public key"
        />
        <textarea
          value={certificate}
          onChange={(e) => setCertificate(e.target.value)}
          onBlur={handleSave}
          className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 h-24 resize-none"
          placeholder="Certificate"
        />
      </div>

      {/* Drag and drop зона */}
      <div className="border-2 border-dashed border-[#3a3a4a] rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
        <div className="flex flex-col items-center space-y-2">
          <div className="relative">
            <Key size={24} className="text-gray-400" />
            <Plus size={12} className="absolute -top-1 -right-1 text-blue-400 bg-[#1e1e2e] rounded-full" />
          </div>
          <p className="text-xs text-gray-400">Drag and drop a private key file to import</p>
        </div>
      </div>

      <button className="w-full bg-[#007AFF] hover:bg-[#0062cc] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
        Import from key file
      </button>
    </>
  );
}

function TouchIDForm() {
  const { selectedKeyId, updateKey } = useStore();
  const [label, setLabel] = useState('Touch ID');

  const handleGenerate = () => {
    if (selectedKeyId) {
      updateKey(selectedKeyId, { label, type: 'ECDSA', keySize: 256 });
    }
  };

  return (
    <>
      {/* Изображение клавиатуры */}
      <div className="bg-[#252535] rounded-lg overflow-hidden border border-[#3a3a4a]">
        <div className="h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <div className="grid grid-cols-5 gap-1 p-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-[#1e1e2e] rounded flex items-center justify-center text-[8px] text-gray-400">
                {['F8', 'F9', 'F10', 'F11', 'F12', '*', '(', ')', '-', '+'][i % 10]}
              </div>
            ))}
            <div className="w-6 h-6 bg-blue-500/30 rounded flex items-center justify-center">
              <Fingerprint size={12} className="text-blue-400" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400">
            Biometric Key based on Secure Enclave Process built-in into your mac. This key is not possible to copy or steal.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-blue-400 mb-1 block">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Type</label>
          <p className="text-sm text-gray-300">ECDSA</p>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Key Size</label>
          <p className="text-sm text-gray-300">256</p>
        </div>
      </div>

      <button 
        onClick={handleGenerate}
        className="w-full bg-[#007AFF] hover:bg-[#0062cc] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        Generate
      </button>
    </>
  );
}

function FIDO2Form() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#2a2a3a] flex items-center justify-center mx-auto">
          <Usb size={32} className="text-gray-300" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">Insert FIDO2 device</h2>
          <p className="text-sm text-gray-400">
            Connect your FIDO2 device to show here.
          </p>
        </div>
      </div>
    </div>
  );
}

function CertificateForm() {
  return (
    <div className="space-y-3">
      <input
        type="text"
        className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
        placeholder="Label"
      />
      <textarea
        className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 h-32 resize-none"
        placeholder="Certificate content"
      />
      <button className="w-full bg-[#007AFF] hover:bg-[#0062cc] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
        Import Certificate
      </button>
    </div>
  );
}

function Plus({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}