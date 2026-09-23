import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Clock, Layers, AlertCircle, ExternalLink, Zap } from 'lucide-react';

function getSourceStyle(sources) {
  const hasCross = sources && sources.length > 1;
  if (hasCross) return { bar: 'bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-rose-900/80 border-purple-500/60 shadow-lg shadow-purple-950/40', text: 'text-purple-100', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
  const src = sources?.[0] || '';
  if (src === 'The Hindu') return { bar: 'bg-gradient-to-r from-slate-900 to-blue-950 border-blue-600/50 shadow-md shadow-blue-950/30', text: 'text-blue-100', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  if (src === 'Times of India') return { bar: 'bg-gradient-to-r from-rose-950 to-red-900 border-rose-500/50 shadow-md shadow-rose-950/30', text: 'text-rose-100', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
  if (src === 'Dainik Jagran') return { bar: 'bg-gradient-to-r from-amber-950 to-orange-900 border-amber-500/50 shadow-md shadow-amber-950/30', text: 'text-amber-100', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  return { bar: 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700', text: 'text-gray-100', badge: 'bg-gray-700 text-gray-300 border-gray-600' };
}

const LOGO_MAP = {
  'The Hindu': '/logos/the-hindu.png',
  'Times of India': '/logos/times-of-india.png',
  'Dainik Jagran': '/logos/dainik-jagran.png',
};

export default function TimelineView({ clusters, selectedClusterId, onSelectCluster }) {
  const { minTs, maxTs, hourTicks } = useMemo(() => {
    if (!clusters || clusters.length === 0) {
      const now = Date.now();
      return { minTs: now - 6 * 3600000, maxTs: now, hourTicks: [] };
    }

    let min = Infinity, max = -Infinity;
    clusters.forEach((c) => {
      const s = c.startTimestamp || new Date(c.startTime).getTime();
      const e = c.endTimestamp || new Date(c.endTime).getTime();
      if (s < min) min = s;
      if (e > max) max = e;
    });

    const pad = (max - min) * 0.05;
    const paddedMin = min - pad;
    const paddedMax = max + pad;

    const ticks = [];
    const startH = new Date(paddedMin);
    startH.setMinutes(0, 0, 0);
    let cur = startH.getTime();
    while (cur <= paddedMax) {
      if (cur >= paddedMin) {
        ticks.push({
          ts: cur,
          label: format(new Date(cur), 'h:mm a'),
          dateLabel: format(new Date(cur), 'MMM d'),
          left: ((cur - paddedMin) / (paddedMax - paddedMin)) * 100,
        });
      }
      cur += 2 * 3600000;
    }

    return { minTs: paddedMin, maxTs: paddedMax, hourTicks: ticks };
  }, [clusters]);

  if (!clusters || clusters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <AlertCircle className="w-12 h-12 mb-4 text-gray-600" />
        <p className="text-lg font-semibold text-gray-300">No stories found</p>
        <p className="text-sm mt-1 text-gray-500">Try changing the source filter or click "Refresh News".</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-x-auto bg-[#0d0e12]">
      <div className="min-w-[860px] max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-900 inline-block border border-blue-500/40" /> The Hindu</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-600 inline-block border border-rose-400/40" /> Times of India</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block border border-amber-400/40" /> Dainik Jagran</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-500 inline-block border border-purple-400/40" /> Multi-source</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">{clusters.length} active topics</p>
        </div>

        <div className="bg-gray-900/90 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">

          <div className="relative h-12 bg-gray-950/80 border-b border-gray-800">
            {hourTicks.map((tick, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-gray-800 flex flex-col justify-center pl-2"
                style={{ left: `${tick.left}%` }}
              >
                <span className="text-[11px] font-semibold text-gray-300 leading-none">{tick.label}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{tick.dateLabel}</span>
              </div>
            ))}
          </div>

          <div className="p-4 space-y-2.5"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: `${hourTicks.length > 1 ? (100 / (hourTicks.length - 1)).toFixed(1) : 100}% 100%`,
            }}
          >
            {clusters.map((cluster) => {
              const start = cluster.startTimestamp || new Date(cluster.startTime).getTime();
              const end = cluster.endTimestamp || new Date(cluster.endTime).getTime();

              const leftPct = Math.max(0, Math.min(95, ((start - minTs) / (maxTs - minTs)) * 100));
              const widthPct = Math.max(5, Math.min(100 - leftPct, ((end - minTs) / (maxTs - minTs)) * 100 - leftPct));

              const isSelected = selectedClusterId === cluster.id;
              const style = getSourceStyle(cluster.sources);
              const isCross = cluster.isCrossSource || (cluster.sources && cluster.sources.length > 1);

              return (
                <div key={cluster.id} className="relative h-12 flex items-center group">
                  <button
                    onClick={() => onSelectCluster(cluster)}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    className={`absolute h-10 rounded-xl border px-3 flex items-center justify-between gap-2 text-left transition-all duration-150 cursor-pointer overflow-hidden ${style.bar} ${style.text} ${
                      isSelected
                        ? 'ring-2 ring-rose-500 scale-y-105 z-20 shadow-xl'
                        : 'hover:opacity-95 hover:shadow-lg hover:scale-y-[1.03] z-10'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex -space-x-1 shrink-0">
                        {(cluster.sources || []).slice(0, 2).map((src, idx) => (
                          <img
                            key={idx}
                            src={LOGO_MAP[src] || '/logos/the-hindu.png'}
                            alt={src}
                            className="w-5 h-5 rounded object-cover ring-1 ring-black/40 bg-white p-0.5"
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold truncate leading-tight text-white">
                        {cluster.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCross && (
                        <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-purple-300 border border-purple-500/40">
                          <Zap className="w-2.5 h-2.5" /> Multi
                        </span>
                      )}
                      <span className="text-[11px] font-bold bg-black/40 text-gray-200 border border-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {cluster.articleCount}
                      </span>
                    </div>

                    <div className="absolute -top-8 left-2 hidden group-hover:flex bg-black/90 text-gray-200 border border-gray-700 text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-30 gap-1.5 items-center pointer-events-none">
                      <Clock className="w-3 h-3 opacity-70" />
                      {format(new Date(start), 'h:mm a')} → {format(new Date(end), 'h:mm a')}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
