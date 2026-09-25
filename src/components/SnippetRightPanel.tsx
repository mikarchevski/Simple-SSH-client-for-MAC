import { MoreVertical, ArrowRight, Sparkles, Users, Server, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store';

export function SnippetRightPanel() {
  const { snippetPanelOpen, selectedSnippetId, snippets, updateSnippet, setSnippetPanelOpen } = useStore();
  const selectedSnippet = snippets.find(s => s.id === selectedSnippetId);
  const [showAiHint, setShowAiHint] = useState(true);

  if (!snippetPanelOpen) return null;

  return (
    <div className="w-96 bg-[#1e1e2e] border-l border-[#2a2a3a] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-[#2a2a3a] flex items-center justify-between px-4 flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">New Snippet</h2>
          <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <span>Personal vault</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <MoreVertical size={18} />
          </button>
          <button onClick={() => setSnippetPanelOpen(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* AI Hint */}
        {showAiHint && (
          <div className="bg-[#252535] border border-[#3a3a4a] rounded-lg p-4">
            <div className="flex items-start space-x-2 mb-3">
              <Sparkles size={16} className="text-purple-400 mt-0.5" />
              <h3 className="text-sm font-semibold text-gray-200">Termius can write the code for you!</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Just write the desired action in the Action Description field, press ✨ icon and Termius will generate the matching script
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Please note that action descriptions may be monitored when the ✨ icon is clicked.
            </p>
            <button 
              onClick={() => setShowAiHint(false)}
              className="w-full bg-[#2a2a3a] hover:bg-[#333] text-gray-300 py-1.5 rounded text-sm transition-colors"
            >
              Ok, got it
            </button>
          </div>
        )}

        {/* Action Description */}
        <div className="relative">
          <label className="text-xs text-blue-400 mb-1 block">Action description</label>
          <div className="relative">
            <input
              type="text"
              value={selectedSnippet?.actionDescription || ''}
              onChange={(e) => selectedSnippet && updateSnippet(selectedSnippet.id, { actionDescription: e.target.value })}
              className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
              placeholder="Example: check network load"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors">
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        {/* Package */}
        <input
          type="text"
          value={selectedSnippet?.package || ''}
          onChange={(e) => selectedSnippet && updateSnippet(selectedSnippet.id, { package: e.target.value })}
          className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
          placeholder="Add a Package"
        />

        {/* Script */}
        <textarea
          value={selectedSnippet?.script || ''}
          onChange={(e) => selectedSnippet && updateSnippet(selectedSnippet.id, { script: e.target.value })}
          className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 h-32 resize-none font-mono"
          placeholder="Script *"
        />

        {/* Share */}
        <button className="w-full bg-[#252535] border border-[#333] rounded-lg p-4 text-gray-400 hover:text-gray-200 hover:border-[#444] transition-colors flex items-center justify-center space-x-2">
          <Users size={16} />
          <span className="text-sm">Share this snippet</span>
        </button>

        {/* Targets */}
        <div>
          <h3 className="text-sm font-semibold text-gray-200 mb-2">Targets for execution</h3>
          <p className="text-xs text-gray-500 mb-3">
            Automate work with snippets. Add target hosts and automatically run the snippet on them in one click!
          </p>
          
          <div className="space-y-2">
            {selectedSnippet?.targets.map((hostId, idx) => (
              <div key={idx} className="bg-[#252535] border border-[#3a3a4a] rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Server size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-200">IP or Hostname</p>
                    <p className="text-xs text-gray-500">SSH</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-200">
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <button className="w-full text-blue-400 hover:text-blue-300 text-sm py-2 transition-colors flex items-center justify-center space-x-1">
              <Plus size={14} />
              <span>Add targets</span>
            </button>
          </div>
        </div>

        {/* Run button */}
        <button className="w-full bg-[#007AFF] hover:bg-[#0062cc] disabled:bg-[#3a3a4a] disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          Run
        </button>
      </div>
    </div>
  );
}