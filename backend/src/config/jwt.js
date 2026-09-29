import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION_MS = parseInt(process.env.JWT_EXPIRATION_MS || '86400000', 10);

export function generateToken(githubId, username, accessToken) {
  return jwt.sign(
    { sub: String(githubId), username, accessToken },
    JWT_SECRET,
    { expiresIn: Math.floor(JWT_EXPIRATION_MS / 1000) }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getGithubIdFromToken(token) {
  const decoded = verifyToken(token);
  return decoded ? parseInt(decoded.sub, 10) : null;
}

export function getUsernameFromToken(token) {
  const decoded = verifyToken(token);
  return decoded ? decoded.username : null;
}

export function getAccessTokenFromToken(token) {
  const decoded = verifyToken(token);
  return decoded ? decoded.accessToken : null;
}

export function validateToken(token) {
  return verifyToken(token) !== null;
}
