import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const SOURCES = [
  {
    id: 'all',
    label: 'All Sources',
    logo: null,
    activeClass: 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/30',
  },
  {
    id: 'The Hindu',
    label: 'The Hindu',
    logo: '/logos/the-hindu.png',
    activeClass: 'bg-blue-900/60 text-white border-blue-500 shadow-md shadow-blue-950/30',
  },
  {
    id: 'Times of India',
    label: 'Times of India',
    logo: '/logos/times-of-india.png',
    activeClass: 'bg-red-900/60 text-white border-red-500 shadow-md shadow-red-950/30',
  },
  {
    id: 'Dainik Jagran',
    label: 'Dainik Jagran',
    logo: '/logos/dainik-jagran.png',
    activeClass: 'bg-amber-900/60 text-white border-amber-500 shadow-md shadow-amber-950/30',
  },
];

export default function SourceFilter({
  selectedSource,
  onSelectSource,
  sourceCounts,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="bg-[#0d0e12] border-b border-gray-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {SOURCES.map((src) => {
            const isActive = selectedSource === src.id;
            const count = src.id === 'all'
              ? sourceCounts.all || 0
              : sourceCounts[src.id] || 0;

            return (
              <button
                key={src.id}
                onClick={() => onSelectSource(src.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? src.activeClass
                    : 'bg-gray-900/90 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                }`}
              >
                {src.logo && (
                  <img
                    src={src.logo}
                    alt={src.label}
                    className="h-5 w-auto object-contain rounded bg-white p-0.5"
                    style={{ maxWidth: '60px' }}
                  />
                )}
                {!src.logo && (
                  <span className="font-semibold">{src.label}</span>
                )}
                {src.logo && (
                  <span className="text-xs text-gray-400">({count})</span>
                )}
                {!src.logo && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories & keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent focus:outline-none text-gray-200 cursor-pointer text-sm"
          >
            <option value="latest" className="bg-gray-900 text-white">Newest first</option>
            <option value="articles" className="bg-gray-900 text-white">Most coverage</option>
            <option value="intensity" className="bg-gray-900 text-white">Most talked about</option>
          </select>
        </div>

      </div>
    </div>
  );
}
