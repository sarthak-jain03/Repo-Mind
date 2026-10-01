import { Router } from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth.js';
import { generateToken } from '../config/jwt.js';
import { User } from '../models/index.js';

const router = Router();

router.get('/oauth2/authorization/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
  const redirectUri = `${backendUrl}/login/oauth2/code/github`;
  const scope = 'read:user repo';

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  res.redirect(githubAuthUrl);
});

router.get('/login/oauth2/code/github', async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    return res.redirect(`${frontendUrl}/auth/callback?error=no_code`);
  }

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.redirect(`${frontendUrl}/auth/callback?error=no_token`);
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const ghUser = userResponse.data;
    const githubId = ghUser.id;
    const username = ghUser.login;


    let user = await User.findOne({ where: { githubId } });

    if (user) {
      await user.update({
        username,
        name: ghUser.name || null,
        email: ghUser.email || null,
        avatarUrl: ghUser.avatar_url || null,
        accessToken,
        lastLoginAt: new Date(),
      });
    } else {
      user = await User.create({
        githubId,
        username,
        name: ghUser.name || null,
        email: ghUser.email || null,
        avatarUrl: ghUser.avatar_url || null,
        accessToken,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
    }

    const jwt = generateToken(githubId, username, accessToken);
    res.redirect(`${frontendUrl}/auth/callback?token=${jwt}`);
  } catch (error) {
    console.error('OAuth callback error:', error.message);
    res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
  }
});

router.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    githubId: user.githubId,
    username: user.username,
    name: user.name || '',
    email: user.email || '',
    avatarUrl: user.avatarUrl || '',
  });
});

router.get('/api/auth/validate', authMiddleware, (req, res) => {
  res.json({ valid: true });
});

export default router;
