import api from './api';

export const chatService = {
  
  async sendMessage(repoId, message) {
    const response = await api.post('/api/chat', {
      repoId,
      message,
    });
    return response.data;
  },

  
  async getChatHistory(repoId) {
    const response = await api.get(`/api/chat/history/${repoId}`);
    return response.data;
  },
};
