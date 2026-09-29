import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { Repository } from '../models/index.js';
import * as githubService from '../services/githubService.js';
import * as indexingService from '../services/indexingService.js';

const router = Router();

router.get('/repos', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const sync = req.query.sync === 'true';

    const allLocalRepos = await Repository.findAll({ where: { userId: user.id } });

    if (!sync && allLocalRepos.length > 0) {
      return res.json(allLocalRepos.map(mapToDto));
    }

    const githubRepos = await githubService.getUserRepositories(user.accessToken);

    const localRepoMap = new Map();
    const reposToDelete = [];

    for (const r of allLocalRepos) {
      if (localRepoMap.has(Number(r.githubRepoId))) {
        reposToDelete.push(r);
      } else {
        localRepoMap.set(Number(r.githubRepoId), r);
      }
    }

    for (const dup of reposToDelete) {
      await dup.destroy();
    }

    const savedRepos = [];

    for (const ghRepo of githubRepos) {
      const githubRepoId = ghRepo.id;
      let repo = localRepoMap.get(githubRepoId);

      const repoData = {
        name: ghRepo.name,
        owner: ghRepo.owner.login,
        fullName: ghRepo.full_name,
        description: ghRepo.description || null,
        language: ghRepo.language || null,
        defaultBranch: ghRepo.default_branch || null,
        starCount: ghRepo.stargazers_count || 0,
        forkCount: ghRepo.forks_count || 0,
        isPrivate: ghRepo.private || false,
      };

      if (repo) {
        await repo.update(repoData);
      } else {
        repo = await Repository.create({
          userId: user.id,
          githubRepoId,
          ...repoData,
          indexStatus: 'NOT_INDEXED',
          createdAt: new Date(),
        });
      }

      savedRepos.push(repo);
    }

    res.json(savedRepos.map(mapToDto));
  } catch (error) {
    console.error('Error fetching repos:', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

router.post('/repos/:repoId/index', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const repoId = parseInt(req.params.repoId, 10);

    const repo = await Repository.findByPk(repoId);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    if (String(repo.userId) !== String(user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (repo.indexStatus === 'INDEXING') {
      return res.status(400).json({ error: 'Repository is already being indexed' });
    }

    indexingService.indexRepository(repo, user);
    res.json({ message: `Indexing started for ${repo.fullName}`, repoId });
  } catch (error) {
    console.error('Error starting indexing:', error.message);
    res.status(500).json({ error: 'Failed to start indexing' });
  }
});

router.get('/repos/:repoId/index/status', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const repoId = parseInt(req.params.repoId, 10);

    const repo = await Repository.findByPk(repoId);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    if (String(repo.userId) !== String(user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const progress = indexingService.getProgress(repoId);

    res.json({
      repoId,
      status: repo.indexStatus,
      totalFiles: repo.totalFiles,
      indexedFiles: repo.indexedFiles,
      progressPercent: progress.progressPercent,
      message: progress.message,
    });
  } catch (error) {
    console.error('Error getting indexing status:', error.message);
    res.status(500).json({ error: 'Failed to get indexing status' });
  }
});

router.get('/repos/:repoId/tree', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const repoId = parseInt(req.params.repoId, 10);

    const repo = await Repository.findByPk(repoId);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    if (String(repo.userId) !== String(user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const branch = repo.defaultBranch || 'main';
    const tree = await githubService.getRepositoryTree(user.accessToken, repo.owner, repo.name, branch);
    res.json(tree);
  } catch (error) {
    console.error('Error getting repo tree:', error.message);
    res.status(500).json({ error: 'Failed to get repository tree' });
  }
});

function mapToDto(repo) {
  return {
    id: repo.id,
    githubRepoId: repo.githubRepoId,
    name: repo.name,
    owner: repo.owner,
    fullName: repo.fullName,
    description: repo.description,
    language: repo.language,
    defaultBranch: repo.defaultBranch,
    starCount: repo.starCount,
    forkCount: repo.forkCount,
    isPrivate: repo.isPrivate,
    indexStatus: repo.indexStatus,
    totalFiles: repo.totalFiles,
    indexedFiles: repo.indexedFiles,
  };
}

export default router;
