import api from './api';

export const repoService = {
  
  async getRepositories() {
    const response = await api.get('/api/github/repos');
    return response.data;
  },

  
  async indexRepository(repoId) {
    const response = await api.post(`/api/github/repos/${repoId}/index`);
    return response.data;
  },

  
  async getIndexingStatus(repoId) {
    const response = await api.get(`/api/github/repos/${repoId}/index/status`);
    return response.data;
  },

  
  async getRepositoryTree(repoId) {
    const response = await api.get(`/api/github/repos/${repoId}/tree`);
    return response.data;
  },
};
