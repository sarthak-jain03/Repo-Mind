import User from './User.js';
import Repository from './Repository.js';
import CodeChunk from './CodeChunk.js';
import ChatMessage from './ChatMessage.js';

User.hasMany(Repository, { foreignKey: 'userId', as: 'repositories' });
Repository.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Repository.hasMany(CodeChunk, { foreignKey: 'repoId', as: 'codeChunks' });
CodeChunk.belongsTo(Repository, { foreignKey: 'repoId', as: 'repository' });

Repository.hasMany(ChatMessage, { foreignKey: 'repoId', as: 'chatMessages' });
ChatMessage.belongsTo(Repository, { foreignKey: 'repoId', as: 'repository' });

User.hasMany(ChatMessage, { foreignKey: 'userId', as: 'chatMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Repository, CodeChunk, ChatMessage };
