'use client';

import React, { useState } from 'react';
import { Key, ExternalLink, X, Check } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
}) => {
  const [inputVal, setInputVal] = useState(currentKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(inputVal.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0f172a] border border-neutral-200 dark:border-[#3e3e3e] shadow-2xl p-6 text-neutral-900 dark:text-neutral-100 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#ef4444]">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Google Maps JavaScript API Key</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Set or update your Google Maps client API key</p>
          </div>
        </div>

        <div className="bg-neutral-50 dark:bg-[#1e2939] rounded-2xl p-4 border border-neutral-200 dark:border-[#3e3e3e] mb-6 text-xs text-neutral-600 dark:text-neutral-300 space-y-2">
          <p className="leading-relaxed">
            To render interactive Google Maps tiles with vector layers, a Google Cloud project with the{' '}
            <strong className="text-[#ef4444]">Maps JavaScript API</strong> enabled is required.
          </p>
          <a
            href="https://console.cloud.google.com/google/maps-apis/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#ef4444] hover:text-[#d63c3c] font-semibold underline pt-1"
          >
            Get a free API Key on Google Cloud Console <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
              API Key (stored securely in local browser storage)
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1e2939] border border-neutral-300 dark:border-[#3e3e3e] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:border-[#ef4444] focus:ring-2 focus:ring-red-500/20 font-mono transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-outline-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                'Save Key'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
