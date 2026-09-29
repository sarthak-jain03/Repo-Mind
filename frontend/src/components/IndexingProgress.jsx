import { Loader2 } from 'lucide-react';

export default function IndexingProgress({ status }) {
  if (!status) return null;

  const { progressPercent = 0, message = 'Processing...', totalFiles = 0, indexedFiles = 0 } = status;
  
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3 gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200 min-w-0">
          <Loader2 size={14} className="animate-spin text-zinc-400 shrink-0" />
          <span className="truncate">{message}</span>
        </div>
        <span className="text-xs font-medium text-zinc-400 shrink-0">
          {Math.round(progressPercent)}%
        </span>
      </div>

      <div className="w-full bg-zinc-950 rounded-full h-1.5 mb-2 overflow-hidden">
        <div 
          className="bg-zinc-200 h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {totalFiles > 0 && (
        <div className="flex justify-between text-[11px] text-zinc-500">
          <span>{indexedFiles} indexed</span>
          <span>{totalFiles} total files</span>
        </div>
      )}
    </div>
  );
}
