import { Database, GitFork, Star, Clock, CheckCircle2, ChevronRight, Play } from 'lucide-react';

export default function RepoCard({ repo, onIndex, onChat }) {
  const isIndexed = repo.indexStatus === 'INDEXED';
  const isIndexing = repo.indexStatus === 'INDEXING';

  return (
    <div className="group bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-lg p-5 transition-colors flex flex-col h-full">
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="font-medium text-zinc-100 text-base truncate flex-1" title={repo.fullName}>
          {repo.name}
        </h3>
        {isIndexed && (
          <div className="flex items-center gap-1 text-[10px] uppercase font-medium tracking-wider text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50 shrink-0">
            <CheckCircle2 size={10} />
            Ready
          </div>
        )}
      </div>
      
      <p className="text-sm text-zinc-400 mb-6 line-clamp-2 flex-grow min-h-[40px]">
        {repo.description || 'No description provided.'}
      </p>

      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-600" />
            {repo.language}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Star size={12} />
          {repo.starCount}
        </div>
        <div className="flex items-center gap-1">
          <GitFork size={12} />
          {repo.forkCount}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-zinc-800/50">
        {isIndexed ? (
          <button
            onClick={() => onChat(repo)}
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-medium py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
          >
            Chat with Codebase
            <ChevronRight size={14} />
          </button>
        ) : isIndexing ? (
          <button
            disabled
            className="w-full bg-zinc-800 text-zinc-500 font-medium py-2 rounded-md text-sm flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Clock size={14} className="animate-pulse" />
            Indexing...
          </button>
        ) : (
          <button
            onClick={() => onIndex(repo)}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Play size={12} className="fill-current" />
            Index Repository
          </button>
        )}
      </div>
    </div>
  );
}
