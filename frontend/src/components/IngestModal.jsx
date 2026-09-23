import React from 'react';
import { CheckCircle2, AlertTriangle, Loader2, X, ArrowRight } from 'lucide-react';

export default function IngestModal({ jobStatus, onClose }) {
  if (!jobStatus) return null;

  const isRunning = jobStatus.status === 'running' || jobStatus.status === 'queued';
  const isCompleted = jobStatus.status === 'completed';
  const isFailed = jobStatus.status === 'failed';

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">

      {/* Top bar */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isCompleted ? 'bg-emerald-50 border-emerald-100' :
        isFailed ? 'bg-rose-50 border-rose-100' :
        'bg-blue-50 border-blue-100'
      }`}>
        <div className="flex items-center gap-2">
          {isRunning && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {isFailed && <AlertTriangle className="w-4 h-4 text-rose-500" />}
          <span className="text-sm font-semibold text-gray-800">
            {isRunning ? 'Fetching latest news…' : isCompleted ? 'News updated!' : 'Something went wrong'}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Progress stats */}
        {isCompleted && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{jobStatus.articlesFound || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Stories scanned</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-emerald-700">{jobStatus.articlesNew || 0}</p>
              <p className="text-xs text-emerald-600 mt-0.5">New articles added</p>
            </div>
          </div>
        )}

        {/* Recent logs — shown as simple plain-English messages */}
        {isRunning && jobStatus.logs && jobStatus.logs.length > 0 && (
          <div className="space-y-1.5">
            {jobStatus.logs.slice(-3).map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-blue-400" />
                <span>{typeof log === 'string' ? log : log.message}</span>
              </div>
            ))}
          </div>
        )}

        {isFailed && jobStatus.error && (
          <p className="text-xs text-rose-600 bg-rose-50 rounded-lg p-2 border border-rose-100">
            {jobStatus.error.slice(0, 120)}
          </p>
        )}

        {isCompleted && jobStatus.clustersCount > 0 && (
          <p className="text-xs text-gray-500 text-center">
            {jobStatus.clustersCount} topic groups updated in {jobStatus.durationSeconds || 0}s
          </p>
        )}
      </div>

    </div>
  );
}
