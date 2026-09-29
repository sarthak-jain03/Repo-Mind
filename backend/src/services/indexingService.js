import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';
import { Repository } from '../models/index.js';
import * as githubService from './githubService.js';
import * as codeChunker from './codeChunker.js';
import * as embeddingService from './embeddingService.js';

const progressMap = new Map();

export function indexRepository(repo, user) {
  _doIndex(repo, user).catch(error => {
    console.error(`Indexing failed for ${repo.fullName}:`, error.message);
  });
}

async function _doIndex(repo, user) {
  const repoId = repo.id;
  const accessToken = user.accessToken;

  try {
    await Repository.update({ indexStatus: 'INDEXING' }, { where: { id: repoId } });

    await sequelize.query(
      'DELETE FROM code_chunks WHERE repo_id = :repoId',
      { replacements: { repoId }, type: QueryTypes.DELETE }
    );

    const branch = repo.defaultBranch || 'main';
    const files = await githubService.getRepositoryTree(accessToken, repo.owner, repo.name, branch);

    const indexableFiles = files.filter(f => {
      if (!codeChunker.shouldIndex(f.path)) return false;
      const size = parseInt(f.size || '0', 10);
      return size > 0 && size < 500_000;
    });

    const totalFiles = indexableFiles.length;
    await Repository.update({ totalFiles }, { where: { id: repoId } });
    progressMap.set(repoId, { totalFiles, indexedFiles: 0, message: 'Starting indexing...' });

    let indexedCount = 0;

    for (const file of indexableFiles) {
      const filePath = file.path;

      try {
        const content = await githubService.getFileContent(accessToken, repo.owner, repo.name, filePath);

        if (!content || content.trim() === '') {
          indexedCount++;
          continue;
        }

        const chunks = codeChunker.chunkFile(filePath, content);

        for (const chunk of chunks) {
          const embeddingText = `File: ${chunk.filePath} | Language: ${chunk.language} | Lines ${chunk.startLine}-${chunk.endLine}\n\n${chunk.content}`;
          const embedding = await embeddingService.generateEmbedding(embeddingText);
          const vectorString = embeddingService.vectorToString(embedding);

          await sequelize.query(
            `INSERT INTO code_chunks (repo_id, file_path, content, language, start_line, end_line, chunk_index, embedding, created_at)
             VALUES (:repoId, :filePath, :content, :language, :startLine, :endLine, :chunkIndex, :embedding::vector, NOW())`,
            {
              replacements: {
                repoId,
                filePath: chunk.filePath,
                content: chunk.content,
                language: chunk.language,
                startLine: chunk.startLine,
                endLine: chunk.endLine,
                chunkIndex: chunk.chunkIndex,
                embedding: vectorString,
              },
              type: QueryTypes.INSERT,
            }
          );
        }

        indexedCount++;
        progressMap.set(repoId, { totalFiles, indexedFiles: indexedCount, message: `Indexing: ${filePath}` });

        if (indexedCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await Repository.update({ indexedFiles: indexedCount }, { where: { id: repoId } });
        }
      } catch (error) {
        console.warn(`Failed to index file ${filePath}: ${error.message}`);
        indexedCount++;
      }
    }

    await Repository.update(
      { indexStatus: 'INDEXED', indexedFiles: indexedCount, lastIndexedAt: new Date() },
      { where: { id: repoId } }
    );

    progressMap.set(repoId, { totalFiles, indexedFiles: indexedCount, message: 'Indexing complete!' });

    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM code_chunks WHERE repo_id = :repoId',
      { replacements: { repoId }, type: QueryTypes.SELECT }
    );
    console.log(`Indexed ${repo.fullName} — ${indexedCount} files, ${countResult.count} chunks`);
  } catch (error) {
    console.error(`Failed to index ${repo.fullName}: ${error.message}`);
    await Repository.update({ indexStatus: 'FAILED' }, { where: { id: repoId } });
    progressMap.set(repoId, { totalFiles: 0, indexedFiles: 0, message: 'Indexing failed: ' + error.message });
  }
}

export function getProgress(repoId) {
  const progress = progressMap.get(Number(repoId)) || { totalFiles: 0, indexedFiles: 0, message: 'Not started' };
  return {
    ...progress,
    progressPercent: progress.totalFiles === 0 ? 0 : Math.floor((progress.indexedFiles * 100) / progress.totalFiles),
  };
}
