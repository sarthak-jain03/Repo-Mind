import { ChatMessage, Repository } from '../models/index.js';
import * as ragService from './ragService.js';

export async function chat(repoId, message, user) {
  const repo = await Repository.findByPk(repoId);
  if (!repo) throw new Error('Repository not found');

  if (String(repo.userId) !== String(user.id)) {
    throw new Error('Repository does not belong to user');
  }

  if (repo.indexStatus !== 'INDEXED') {
    return {
      message: "This repository hasn't been indexed yet. Please index it first before asking questions.",
      role: 'ASSISTANT',
      sources: [],
      timestamp: new Date().toISOString(),
    };
  }

  await ChatMessage.create({
    repoId: repo.id,
    userId: user.id,
    role: 'USER',
    content: message,
    createdAt: new Date(),
  });

  const result = await ragService.query(repoId, message);

  const sourcesStr = result.sources
    .map(s => `${s.filePath}:${s.startLine}-${s.endLine}`)
    .join(',');

  await ChatMessage.create({
    repoId: repo.id,
    userId: user.id,
    role: 'ASSISTANT',
    content: result.response,
    sources: sourcesStr || null,
    createdAt: new Date(),
  });

  return {
    message: result.response,
    role: 'ASSISTANT',
    sources: result.sources,
    timestamp: new Date().toISOString(),
  };
}

export async function getChatHistory(repoId, user) {
  const messages = await ChatMessage.findAll({
    where: { repoId, userId: user.id },
    order: [['createdAt', 'ASC']],
  });

  return messages.map(msg => {
    const sources = [];
    if (msg.sources && msg.sources.trim() !== '') {
      for (const src of msg.sources.split(',')) {
        const parts = src.split(':');
        if (parts.length >= 2) {
          const lines = parts[1].split('-');
          sources.push({
            filePath: parts[0],
            startLine: parseInt(lines[0], 10),
            endLine: lines.length > 1 ? parseInt(lines[1], 10) : parseInt(lines[0], 10),
          });
        }
      }
    }

    return {
      message: msg.content,
      role: msg.role,
      sources,
      timestamp: msg.createdAt,
    };
  });
}
