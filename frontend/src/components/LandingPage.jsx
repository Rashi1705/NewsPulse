import React from 'react';
import { Newspaper, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Layers, Clock, ExternalLink, Globe2, Play, Eye } from 'lucide-react';

export default function LandingPage({ onEnterPortal, onOpenAuth, user }) {
  return (
    <div className="min-h-screen bg-[#0d0e12] text-gray-100 flex flex-col selection:bg-rose-500 selection:text-white relative overflow-x-hidden font-sans">
      
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[600px] right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <svg className="absolute top-10 left-0 w-full h-[750px] pointer-events-none opacity-25" viewBox="0 0 1440 800" fill="none">
        <path d="M-100 400C300 200 600 700 900 350C1200 0 1500 450 1600 500" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="6 6" />
        <path d="M-50 600C250 800 650 100 1050 400C1350 600 1550 200 1650 300" stroke="#fb7185" strokeWidth="1.2" />
        <ellipse cx="450" cy="420" rx="350" ry="280" stroke="#e11d48" strokeWidth="1" transform="rotate(-25 450 420)" />
      </svg>

      <header className="sticky top-0 z-40 border-b border-gray-800/80 bg-[#0d0e12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 shadow-lg shadow-rose-900/30 text-white">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                News<span className="text-rose-500">Pulse</span>
              </h1>
              <p className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase mt-1 leading-none">
                INDEPENDENT. ACCURATE. FAST.
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-12 lg:gap-16 text-sm text-gray-300 font-medium">
            <a href="#overview" className="hover:text-white transition-colors py-1 tracking-wide">Overview</a>
            <a href="#features" className="hover:text-white transition-colors py-1 tracking-wide">Features</a>
            <a href="#publishers" className="hover:text-white transition-colors py-1 tracking-wide">Publishers</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={onEnterPortal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-900/40"
              >
                <span>Enter Newsroom</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onEnterPortal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-600/30 active:scale-95"
                >
                  <span>Access Live Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      <section id="overview" className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Scraped, clustered, and timed — automatically
          </h2>

          <p className="text-lg sm:text-xl text-gray-300 italic font-serif">
            Transforming how stories are found, shaped, and shared.
          </p>

          <p className="text-base text-gray-400 leading-relaxed">
            NewsPulse helps newsrooms surface the moments that matter — quickly, consistently, and at scale across India's leading news publications.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onEnterPortal}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95"
            >
              <span>Explore Live Newsroom</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAuth}
              className="px-6 py-3.5 rounded-full bg-gray-900/80 hover:bg-gray-800 border border-gray-700 text-gray-200 font-semibold text-sm transition-all"
            >
              Journalist Sign In
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-800/80 max-w-sm">
            <div>
              <span className="block text-2xl font-bold text-white">3+ Outlets</span>
              <span className="text-xs text-gray-400">The Hindu, TOI & Jagran</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-rose-500">24/7 Active</span>
              <span className="text-xs text-gray-400">Live Ingestion & Clustering</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative pt-4 pb-8">
          
          <div className="absolute -bottom-6 -right-2 sm:-right-4 w-[85%] z-0 rounded-2xl bg-white/95 p-3 shadow-2xl border border-gray-300/40 transform rotate-2 opacity-85 hover:opacity-100 transition-all duration-300">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-200 text-[10px] text-gray-700 font-semibold">
              <span>Financial & Market Stream</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Live Multi-Source</span>
            </div>
            <img
              src="/logos/market-news-preview.png"
              alt="Market stream background"
              className="w-full h-auto object-cover rounded-lg mt-1"
            />
          </div>

          <div className="relative z-10 rounded-3xl bg-gray-900/95 border border-gray-700/80 p-3 sm:p-4 shadow-2xl backdrop-blur-xl group transition-all duration-300 hover:border-rose-500/50">
            
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/90" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/90" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/90" />
                </div>
                <span className="font-semibold text-gray-300 text-[11px] ml-2">Media Curation & Automated Shortform Studio</span>
              </div>
              <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full">
                LIVE DEMO
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-black">
              <img
                src="/logos/media-curation-preview.png"
                alt="NewsPulse Media Curation Interface"
                className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
              
              <div
                onClick={onEnterPortal}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 text-white font-semibold text-xs shadow-xl">
                  <Eye className="w-4 h-4" /> Open Live Newsroom Portal
                </span>
              </div>
            </div>

            <div className="mt-3 px-2 flex items-center justify-between text-xs text-gray-400">
              <span>Automated editorial timeline & cross-channel content</span>
              <span className="text-rose-400 font-medium">Bipartisan stock trading coverage</span>
            </div>

          </div>
        </div>

      </section>

      <section id="features" className="relative z-10 border-t border-gray-800/80 bg-gray-950/60 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 order-2 lg:order-1 relative group">
            <div className="p-3 sm:p-4 rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl transition-all duration-300 group-hover:border-rose-500/40">
              
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800 mb-2">
                <span className="text-xs font-bold text-gray-300">Financial & Real-Time Pulse Feed</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Aggregated in One Place
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-800 bg-white">
                <img
                  src="/logos/market-news-preview.png"
                  alt="Market and Breaking News Feed"
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>

              <div className="mt-2.5 px-2 flex items-center justify-between text-[11px] text-gray-400">
                <span>The Hindu Business • Economic Times • Livemint</span>
                <span className="text-gray-500 font-medium">1 hour ago</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              Real-Time Feed Aggregation
            </div>

            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Smarter news.<br />Right when you need it.
            </h3>

            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              NewsPulse cuts through the noise as stories unfold, continuously identifying what's relevant in real time.
            </p>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              By automating how content is curated and prepared for distribution, it ensures audiences see the most important moments — at the moment they matter the most.
            </p>

            <div className="pt-2">
              <button
                onClick={onEnterPortal}
                className="inline-flex items-center gap-2 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors"
              >
                <span>View Live Feed in Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      <section id="preview" className="relative z-10 py-20 lg:py-28 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500 block mb-2">
            Editorial Workflow
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Modern Newsrooms & Journalists
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="p-8 rounded-3xl bg-gray-900/70 border border-gray-800 hover:border-gray-700 transition-all space-y-5">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Where automation meets newsroom context
            </h4>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Curation in news environments depends on relevance, timing and consistency.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              NewsPulse interprets live and archived content in context, applying newsroom-defined criteria to determine how stories are prepared and presented for distribution.
            </p>
            <p className="text-xs font-semibold text-gray-300">
              Fetching, analysis and summarization helps support the process, while editors retain oversight and control.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gray-900/70 border border-gray-800 hover:border-gray-700 transition-all space-y-5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Publishing with control and consistency
            </h4>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              By aligning automation with editorial standards and audience relevance, NewsPulse helps newsrooms publish decisively — even as stories evolve in real time.
            </p>
            <div className="pt-2 border-t border-gray-800 space-y-1">
              <p className="text-sm text-gray-300 font-medium">
                Less time managing workflows.
              </p>
              <p className="text-sm text-rose-400 font-semibold">
                More time focusing on journalism.
              </p>
            </div>
          </div>

        </div>
      </section>

      <section id="publishers" className="relative z-10 border-t border-gray-800/80 bg-gray-950/80 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500 block mb-2">
            Coverage Network
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8">
            Ingesting from India's Premier News Institutions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            
            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col items-center text-center hover:border-gray-700 transition-colors">
              <img src="/logos/the-hindu.png" alt="The Hindu" className="h-10 w-auto object-contain mb-3 bg-white p-1 rounded-lg shadow-sm" />
              <h5 className="font-bold text-white text-sm">The Hindu</h5>
              <p className="text-xs text-gray-400 mt-1">National & In-depth Editorial</p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col items-center text-center hover:border-gray-700 transition-colors">
              <img src="/logos/times-of-india.png" alt="The Times of India" className="h-10 w-auto object-contain mb-3 bg-white p-1 rounded-lg shadow-sm" />
              <h5 className="font-bold text-white text-sm">The Times of India</h5>
              <p className="text-xs text-gray-400 mt-1">Breaking & Metro Headlines</p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col items-center text-center hover:border-gray-700 transition-colors">
              <img src="/logos/dainik-jagran.png" alt="Dainik Jagran" className="h-10 w-auto object-contain mb-3 bg-white p-1 rounded-lg shadow-sm" />
              <h5 className="font-bold text-white text-sm">Dainik Jagran</h5>
              <p className="text-xs text-gray-400 mt-1">Hindi & Grassroots Reporting</p>
            </div>

          </div>

          <div className="mt-12">
            <button
              onClick={onEnterPortal}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Launch Live Newsroom Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-900 bg-[#090a0c] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} NewsPulse. Real-time newsroom intelligence.</p>
          <p className="tracking-widest uppercase text-[10px] text-gray-400 font-semibold">
            INDEPENDENT. ACCURATE. FAST.
          </p>
        </div>
      </footer>

    </div>
  );
}
