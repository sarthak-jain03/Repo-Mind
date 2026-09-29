import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChatMessage = sequelize.define('ChatMessage', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  repoId: { type: DataTypes.BIGINT, allowNull: false, field: 'repo_id', references: { model: 'repositories', key: 'id' } },
  userId: { type: DataTypes.BIGINT, allowNull: false, field: 'user_id', references: { model: 'users', key: 'id' } },
  role: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  sources: { type: DataTypes.TEXT, allowNull: true },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'chat_messages',
  timestamps: false,
});

export default ChatMessage;
