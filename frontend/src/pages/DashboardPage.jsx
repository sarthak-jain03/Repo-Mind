import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Database, Loader2 } from 'lucide-react';
import RepoCard from '../components/RepoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import IndexingProgress from '../components/IndexingProgress';
import { repoService } from '../services/repoService';

export default function DashboardPage() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [indexingRepo, setIndexingRepo] = useState(null);
  const [indexingStatus, setIndexingStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRepos();
  }, []);

  useEffect(() => {
    let interval;
    if (indexingRepo) {
      interval = setInterval(async () => {
        try {
          const status = await repoService.getIndexingStatus(indexingRepo.id);
          setIndexingStatus(status);

          if (status.status === 'INDEXED' || status.status === 'FAILED') {
            setIndexingRepo(null);
            clearInterval(interval);
            loadRepos();
          }
        } catch (err) {
          console.error('Failed to poll indexing status:', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [indexingRepo]);

  const loadRepos = async () => {
    try {
      const data = await repoService.getRepositories();
      setRepos(data);
    } catch (err) {
      console.error('Failed to load repos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRepos();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleIndex = async (repo) => {
    try {
      await repoService.indexRepository(repo.id);
      setIndexingRepo(repo);
      setIndexingStatus({ progressPercent: 0, message: 'Starting indexing...' });

      setRepos(prev =>
        prev.map(r => r.id === repo.id ? { ...r, indexStatus: 'INDEXING' } : r)
      );
    } catch (err) {
      console.error('Failed to start indexing:', err);
      alert('Failed to start indexing. Please try again.');
    }
  };

  const handleChat = (repo) => {
    navigate(`/chat/${repo.id}`, { state: { repo } });
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (a.indexStatus === 'INDEXED' && b.indexStatus !== 'INDEXED') return -1;
    if (a.indexStatus !== 'INDEXED' && b.indexStatus === 'INDEXED') return 1;
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24 flex items-center justify-center">
        <LoadingSpinner message="Loading repositories..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-white mb-2">Repositories</h1>
          <p className="text-sm text-zinc-400">Select a repository to index and analyze.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-md text-sm transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {indexingRepo && indexingStatus && (
          <div className="mb-8">
            <IndexingProgress status={indexingStatus} />
          </div>
        )}

        <div className="flex flex-wrap gap-4 sm:gap-6 mb-8 text-sm border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2 text-zinc-400 shrink-0">
            <Database size={14} />
            <span>{repos.length} total</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span>{repos.filter(r => r.indexStatus === 'INDEXED').length} indexed</span>
          </div>
          {indexingRepo && (
            <div className="flex items-center gap-2 text-zinc-400 min-w-0">
              <Loader2 size={14} className="animate-spin shrink-0" />
              <span className="truncate">Indexing {indexingRepo.name}...</span>
            </div>
          )}
        </div>

        {filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                onIndex={handleIndex}
                onChat={handleChat}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-zinc-900 border-dashed rounded-lg">
            <p className="text-zinc-500 text-sm">
              {searchQuery ? 'No repositories match your search.' : 'No repositories found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
