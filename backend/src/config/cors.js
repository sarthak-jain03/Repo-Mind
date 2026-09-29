import cors from 'cors';

export function createCorsMiddleware() {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  return cors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
    credentials: true,
    maxAge: 3600,
  });
}
