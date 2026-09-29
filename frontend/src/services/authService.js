import api, { API_BASE_URL } from './api';

export const authService = {
  
  loginWithGitHub() {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/github`;
  },

  
  saveToken(token) {
    localStorage.setItem('repomind_token', token);
  },

  
  getToken() {
    return localStorage.getItem('repomind_token');
  },

  
  logout() {
    localStorage.removeItem('repomind_token');
    window.location.href = '/';
  },

  
  isAuthenticated() {
    return !!localStorage.getItem('repomind_token');
  },

  
  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  
  async validateToken() {
    try {
      const response = await api.get('/api/auth/validate');
      return response.data.valid;
    } catch {
      return false;
    }
  },
};
