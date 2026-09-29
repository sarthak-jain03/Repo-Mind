import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as chatService from '../services/chatService.js';

const router = Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { repoId, message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    if (!repoId) {
      return res.status(400).json({ error: 'Repository ID is required' });
    }

    const response = await chatService.chat(repoId, message, req.user);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error.message);
    if (error.message === 'Repository not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Repository does not belong to user') return res.status(403).json({ error: error.message });
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

router.get('/history/:repoId', authMiddleware, async (req, res) => {
  try {
    const repoId = parseInt(req.params.repoId, 10);
    const history = await chatService.getChatHistory(repoId, req.user);
    res.json(history);
  } catch (error) {
    console.error('Chat history error:', error.message);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

export default router;
