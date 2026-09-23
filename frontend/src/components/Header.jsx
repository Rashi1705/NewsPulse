import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, LayoutDashboard, User, LogOut, ChevronRight } from 'lucide-react';

const LOGO_MAP = {
  'The Hindu': '/logos/the-hindu.png',
  'Times of India': '/logos/times-of-india.png',
  'Dainik Jagran': '/logos/dainik-jagran.png',
};

export default function Header({
  isIngesting,
  onTriggerIngest,
  onBackToLanding,
  user,
  onLogout,
  onOpenAuth,
  clusters = [],
  onSelectCluster,
}) {
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);

  const tickerStories = clusters.length > 0
    ? clusters.slice(0, 8)
    : [
        { label: 'Supreme Court issues landmark directives on national electoral reform & transparency', sources: ['The Hindu'] },
        { label: 'RBI monetary policy committee reviews inflation trajectory & retail lending benchmarks', sources: ['Times of India'] },
        { label: 'Sensex surges 300 points as tech and banking equities lead domestic recovery', sources: ['Dainik Jagran'] },
      ];

  useEffect(() => {
    if (tickerStories.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTickerIdx((prev) => (prev + 1) % tickerStories.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [tickerStories.length]);

  const activeStory = tickerStories[currentTickerIdx] || tickerStories[0];
  const primarySource = activeStory?.sources?.[0] || 'The Hindu';
  const logoSrc = LOGO_MAP[primarySource] || '/logos/the-hindu.png';

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800/80 bg-[#0d0e12]/95 backdrop-blur-md shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-3.5 cursor-pointer shrink-0" onClick={onBackToLanding} title="Back to Overview">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 shadow-md shadow-rose-950/40 text-white">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
              News<span className="text-rose-500">Pulse</span>
            </h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mt-1 leading-none">
              INDEPENDENT. ACCURATE. FAST.
            </p>
          </div>
        </div>

        <div
          onClick={() => onSelectCluster && onSelectCluster(activeStory)}
          className="hidden md:flex items-center gap-3 max-w-xl lg:max-w-2xl flex-1 bg-gray-900/90 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-full px-4 py-1.5 cursor-pointer transition-all duration-300 group shadow-inner overflow-hidden"
          title="Click to view story details"
        >
          <div className="flex items-center gap-1.5 shrink-0 bg-rose-950 border border-rose-800/70 text-rose-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            LIVE
          </div>

          <img
            src={logoSrc}
            alt={primarySource}
            className="h-4 w-auto object-contain rounded bg-white p-0.5 shrink-0"
            style={{ maxWidth: '45px' }}
          />

          <div className="flex-1 min-w-0 overflow-hidden">
            <p
              key={currentTickerIdx}
              className="text-xs text-gray-200 group-hover:text-white font-medium truncate animate-in fade-in slide-in-from-bottom-1 duration-300 leading-tight"
            >
              {activeStory?.label}
            </p>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-rose-400 transition-colors shrink-0" />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors border border-gray-800 hover:border-gray-700"
            title="Return to Landing Page Overview"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-xs">
              <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-200 max-w-[100px] truncate hidden lg:inline">
                {user.name}
              </span>
              <button
                onClick={onLogout}
                title="Sign out"
                className="text-gray-400 hover:text-rose-400 transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors border border-gray-700"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={onTriggerIngest}
            disabled={isIngesting}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
              isIngesting
                ? 'bg-rose-950/60 text-rose-400 cursor-not-allowed border border-rose-800'
                : 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-950/40 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
            <span>{isIngesting ? 'Fetching...' : 'Refresh News'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
