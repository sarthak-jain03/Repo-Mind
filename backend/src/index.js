import 'dotenv/config';
import express from 'express';
import { createCorsMiddleware } from './config/cors.js';
import { initDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import githubRoutes from './routes/github.js';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(createCorsMiddleware());
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'RepoMind Backend' });
});

app.use(errorHandler);

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`RepoMind Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
