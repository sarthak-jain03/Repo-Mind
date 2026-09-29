import { verifyToken } from '../config/jwt.js';
import { User } from '../models/index.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const githubId = parseInt(decoded.sub, 10);
    const user = await User.findOne({ where: { githubId } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded) {
      try {
        const githubId = parseInt(decoded.sub, 10);
        const user = await User.findOne({ where: { githubId } });
        if (user) {
          req.user = user;
          req.token = token;
        }
      } catch {}
    }
  }

  next();
}
