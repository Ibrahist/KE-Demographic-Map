'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Download,
  Image as ImageIcon,
  Key,
  ChevronRight,
  Globe,
  Sun,
  Moon,
  Layers,
} from 'lucide-react';
import { HierarchyBreadcrumb } from '@/types/map';

interface TopNavProps {
  breadcrumbs: HierarchyBreadcrumb[];
  onNavigateBreadcrumb: (index: number) => void;
  onSearchSelect: (item: { code: string | number; name: string; level: string; countyCode?: number; parentName?: string }) => void;
  searchIndex: Array<{ code: string | number; name: string; level: string; countyCode?: number; parentName?: string }>;
  onExportCsv: () => void;
  onExportPng: () => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  breadcrumbs,
  onNavigateBreadcrumb,
  onSearchSelect,
  searchIndex,
  onExportCsv,
  onExportPng,
  onOpenApiKeyModal,
  hasApiKey,
  theme,
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredResults = searchQuery.trim()
    ? searchIndex
        .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
        .slice(0, 10)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 flex items-center justify-between gap-4 z-30 select-none">
      {/* Brand & Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 via-red-600 to-black flex items-center justify-center shadow-md shadow-emerald-950">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              KENYA DEMOGRAPHIC MAP
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                2019/2022
              </span>
            </h1>
          </div>
        </div>

        {/* Breadcrumb Navigator */}
        <nav className="flex items-center gap-1 text-xs text-slate-400 overflow-x-auto py-1">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                <button
                  onClick={() => onNavigateBreadcrumb(idx)}
                  className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                    isLast
                      ? 'font-semibold text-emerald-400 bg-emerald-500/10 cursor-default'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center Search Autocomplete */}
      <div ref={searchRef} className="relative flex-1 max-w-xs md:max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search County, Sub-County, or Ward..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {showResults && filteredResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl py-1.5 z-50 max-h-72 overflow-y-auto">
            {filteredResults.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSearchSelect(item);
                  setShowResults(false);
                  setSearchQuery('');
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-medium text-white">{item.name}</span>
                  {item.parentName && (
                    <span className="text-[11px] text-slate-400 ml-1.5">({item.parentName})</span>
                  )}
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                  {item.level}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExportCsv}
          title="Download active view data as CSV"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">CSV</span>
        </button>

        <button
          onClick={onExportPng}
          title="Export map view as PNG image"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">PNG</span>
        </button>

        <button
          onClick={onOpenApiKeyModal}
          title="Configure Google Maps API Key"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
            hasApiKey
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 animate-pulse'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{hasApiKey ? 'API Key' : 'Set Key'}</span>
        </button>

        <button
          onClick={onToggleTheme}
          title="Toggle Light/Dark Theme"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>
      </div>
    </header>
  );
};
