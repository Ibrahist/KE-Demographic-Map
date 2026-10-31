'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Download,
  FileDown,
  Key,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { HierarchyBreadcrumb } from '@/types/map';

interface TopNavProps {
  breadcrumbs: HierarchyBreadcrumb[];
  onNavigateBreadcrumb: (index: number) => void;
  onSearchSelect: (item: { code: string | number; name: string; level: string; countyCode?: number; parentName?: string }) => void;
  searchIndex: Array<{ code: string | number; name: string; level: string; countyCode?: number; parentName?: string }>;
  onExportCsv: () => void;
  onOpenAreaExportModal: () => void;
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
  onOpenAreaExportModal,
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
    <header className="header z-30 sticky top-0 h-16 px-4 md:px-6 flex items-center justify-between gap-4 select-none shadow-sm transition-colors">
      {/* Brand & Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-md shadow-red-500/15 bg-neutral-100 dark:bg-neutral-800 p-0.5 border border-neutral-200 dark:border-[#3e3e3e]">
            <img
              src="/kenya.png"
              alt="Kenya App Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>KENYA</span>
              <span className="text-[#ef4444]">DEMOGRAPHIC MAP</span>
            </h1>
          </div>
        </div>

        {/* Breadcrumb Navigator */}
        <nav className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 overflow-x-auto py-1">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600 shrink-0" />}
                <button
                  onClick={() => onNavigateBreadcrumb(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isLast
                      ? 'text-[#ef4444] bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 cursor-default'
                      : 'text-neutral-700 dark:text-neutral-300 hover:text-[#ef4444] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search County, Sub-County, or Ward..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#1e2939] border border-neutral-200 dark:border-[#3e3e3e] text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-[#ef4444] focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
          />
        </div>

        {showResults && filteredResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0f172a] border border-neutral-200 dark:border-[#3e3e3e] rounded-xl shadow-2xl py-1.5 z-50 max-h-72 overflow-y-auto">
            {filteredResults.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSearchSelect(item);
                  setShowResults(false);
                  setSearchQuery('');
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-red-50 dark:hover:bg-neutral-800/80 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-100">{item.name}</span>
                  {item.parentName && (
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 ml-1.5">
                      ({item.parentName})
                    </span>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                  {item.level}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Styled Action Controls (PNG and openGIS removed per request) */}
      <div className="flex items-center gap-2">
        {/* Export Area Button (County, Sub-County, Ward, Village -> CSV, PDF, GeoJSON) */}
        <button
          onClick={onOpenAreaExportModal}
          title="Export individual area data as CSV, PDF, or GeoJSON (County, Sub-County, Ward, Village)"
          className="btn btn-sm btn-primary flex items-center gap-1.5 shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Export Area</span>
        </button>

        <button
          onClick={onExportCsv}
          title="Download active view data as CSV"
          className="btn btn-sm btn-outline-primary"
        >
          <Download className="w-3.5 h-3.5 text-[#ef4444]" />
          <span className="hidden sm:inline">CSV</span>
        </button>

        <button
          onClick={onOpenApiKeyModal}
          title="Configure Google Maps API Key"
          className={`btn btn-sm ${
            hasApiKey
              ? 'btn-outline-primary'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 animate-pulse'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">{hasApiKey ? 'API Key' : 'Set Key'}</span>
        </button>

        <button
          onClick={onToggleTheme}
          title="Toggle Light/Dark Theme"
          className="btn btn-sm btn-outline-primary !px-2.5"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-600" />
          )}
        </button>
      </div>
    </header>
  );
};
