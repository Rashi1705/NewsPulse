import React from 'react';
import { X, ExternalLink, Clock, Tag } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const LOGO_MAP = {
  'The Hindu': '/logos/the-hindu.png',
  'Times of India': '/logos/times-of-india.png',
  'Dainik Jagran': '/logos/dainik-jagran.png',
};

const SOURCE_COLORS = {
  'The Hindu': 'bg-blue-950/60 text-blue-300 border-blue-800/60',
  'Times of India': 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  'Dainik Jagran': 'bg-amber-950/60 text-amber-300 border-amber-800/60',
};

export default function ClusterDrawer({ cluster, clusterDetails, loading, onClose }) {
  if (!cluster) return null;

  const data = clusterDetails || cluster;
  const articles = data.articles || data.sampleArticles || [];

  const startTime = data.startTime ? new Date(data.startTime) : null;
  const endTime = data.endTime ? new Date(data.endTime) : null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0f1015] border-l border-gray-800 shadow-2xl flex flex-col text-white animate-in slide-in-from-right duration-300">

        <div className="px-6 pt-6 pb-4 border-b border-gray-800 bg-[#0d0e12]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                {(data.sources || []).map((src, idx) => (
                  <img
                    key={idx}
                    src={LOGO_MAP[src] || '/logos/the-hindu.png'}
                    alt={src}
                    className="h-6 w-auto object-contain rounded bg-white p-0.5"
                    style={{ maxWidth: '70px' }}
                  />
                ))}
                {data.isCrossSource && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-purple-950/80 text-purple-300 rounded-full border border-purple-800/60">
                    Covered by multiple sources
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-white leading-snug">
                {data.label}
              </h2>

              {startTime && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>
                    {format(startTime, 'MMM d, h:mm a')}
                    {endTime && endTime > startTime && ` → ${format(endTime, 'h:mm a')}`}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-300 font-medium">{data.articleCount} article{data.articleCount !== 1 ? 's' : ''}</span>
                </div>
              )}

              {data.keywords && data.keywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <Tag className="w-3 h-3 text-gray-500" />
                  {data.keywords.slice(0, 5).map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-900 text-gray-300 text-[11px] rounded-full border border-gray-800">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#0f1015]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {articles.length} article{articles.length !== 1 ? 's' : ''} — chronological coverage
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mr-3" />
              Loading articles...
            </div>
          ) : articles.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No articles available for this topic.</div>
          ) : (
            articles.map((art, idx) => {
              const pubDate = art.publishedAt ? new Date(art.publishedAt) : null;
              const srcName = art.source || '';
              const logoSrc = LOGO_MAP[srcName] || null;
              const colorClass = SOURCE_COLORS[srcName] || 'bg-gray-800 text-gray-300 border-gray-700';

              return (
                <div
                  key={idx}
                  className="bg-gray-900/90 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all p-4 space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {logoSrc && (
                        <img src={logoSrc} alt={srcName} className="h-4 w-auto object-contain rounded bg-white p-0.5" style={{ maxWidth: '55px' }} />
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorClass}`}>
                        {srcName}
                      </span>
                    </div>
                    {pubDate && (
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(pubDate, { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white leading-snug">
                    {art.title}
                  </h3>

                  {art.summary && (
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                      {art.summary}
                    </p>
                  )}

                  {art.url && (
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors mt-1"
                    >
                      Read full story
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </>
  );
}
