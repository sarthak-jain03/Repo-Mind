import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';
import * as embeddingService from './embeddingService.js';

export async function similaritySearch(repoId, query, topK) {
  const queryEmbedding = await embeddingService.generateEmbedding(query);
  if (!queryEmbedding) {
    console.error('Failed to generate query embedding');
    return [];
  }

  const vectorString = embeddingService.vectorToString(queryEmbedding);

  return await sequelize.query(
    `SELECT * FROM code_chunks
     WHERE repo_id = :repoId
     AND embedding IS NOT NULL
     ORDER BY embedding <=> cast(:queryVector as vector)
     LIMIT :topK`,
    {
      replacements: { repoId, queryVector: vectorString, topK },
      type: QueryTypes.SELECT,
    }
  );
}

export async function deleteChunksForRepo(repoId) {
  await sequelize.query(
    'DELETE FROM code_chunks WHERE repo_id = :repoId',
    { replacements: { repoId }, type: QueryTypes.DELETE }
  );
}

export async function countChunksForRepo(repoId) {
  const [result] = await sequelize.query(
    'SELECT COUNT(*) as count FROM code_chunks WHERE repo_id = :repoId',
    { replacements: { repoId }, type: QueryTypes.SELECT }
  );
  return parseInt(result.count, 10);
}
