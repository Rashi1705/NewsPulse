import React from 'react';
import { ArrowRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'all',
    title: 'Top Headlines',
    match: () => true,
    tag: 'Featured',
  },
  {
    id: 'national',
    title: 'National',
    match: (c) => {
      const text = `${c.label || ''} ${(c.keywords || []).join(' ')} ${(c.sampleArticles || []).map(a => a.title).join(' ')}`.toLowerCase();
      return /india|delhi|mumbai|state|centre|bjp|congress|court|police|cabinet|bharat|minister/i.test(text);
    },
    tag: 'India',
  },
  {
    id: 'politics',
    title: 'Politics',
    match: (c) => {
      const text = `${c.label || ''} ${(c.keywords || []).join(' ')} ${(c.sampleArticles || []).map(a => a.title).join(' ')}`.toLowerCase();
      return /election|poll|vote|party|parliament|leader|modi|rahul|assembly|mp|mla|government/i.test(text);
    },
    tag: 'Policy',
  },
  {
    id: 'business',
    title: 'Business & Economy',
    match: (c) => {
      const text = `${c.label || ''} ${(c.keywords || []).join(' ')} ${(c.sampleArticles || []).map(a => a.title).join(' ')}`.toLowerCase();
      return /business|market|sensex|nifty|economy|bank|rbi|rupee|stock|trade|inflation|gdp/i.test(text);
    },
    tag: 'Finance',
  },
  {
    id: 'world',
    title: 'World Affairs',
    match: (c) => {
      const text = `${c.label || ''} ${(c.keywords || []).join(' ')} ${(c.sampleArticles || []).map(a => a.title).join(' ')}`.toLowerCase();
      return /world|global|us|usa|china|russia|ukraine|israel|iran|un|gaza|international/i.test(text);
    },
    tag: 'Global',
  },
  {
    id: 'cross_source',
    title: 'Featured Stories',
    match: (c) => c.isCrossSource || (c.articleCount && c.articleCount > 1),
    tag: 'Cross-Source',
  }
];

export default function TopSections({ clusters = [], selectedSection = 'all', onSelectSection }) {
  const sectionCounts = SECTIONS.reduce((acc, sec) => {
    if (sec.id === 'all') {
      acc[sec.id] = clusters.length;
    } else {
      acc[sec.id] = clusters.filter(sec.match).length;
    }
    return acc;
  }, {});

  const displaySections = SECTIONS.filter(s => s.id === 'all' || sectionCounts[s.id] > 0).slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-6 pt-6 pb-2 w-full text-white">
      <div className="flex items-end justify-between mb-4 border-b border-gray-800 pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-500 block mb-1">
            EXPLORE
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Top Sections
          </h2>
        </div>

        <button
          onClick={() => onSelectSection('all')}
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-400 hover:text-rose-400 transition-colors"
        >
          <span>View all news</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-gray-500 group-hover:text-rose-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displaySections.map((sec) => {
          const count = sectionCounts[sec.id] || 0;
          const isSelected = selectedSection === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => onSelectSection(isSelected ? 'all' : sec.id)}
              className={`group relative text-left p-5 rounded-2xl border transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/30'
                  : 'bg-gray-900/90 border-gray-800 hover:border-gray-700 hover:bg-gray-900'
              }`}
            >
              <div
                className={`absolute -top-6 -right-6 w-24 h-24 rounded-full border-[6px] transition-colors pointer-events-none ${
                  isSelected ? 'border-rose-500/40' : 'border-gray-800/80 group-hover:border-rose-900/40'
                }`}
              />

              <div className="relative z-10 flex flex-col justify-between h-20">
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-white group-hover:text-rose-400 transition-colors leading-snug">
                    {sec.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400 font-medium">
                    {count} {count === 1 ? 'story' : 'stories'}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-950 border border-rose-800/60 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
