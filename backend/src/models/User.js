import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  githubId: { type: DataTypes.BIGINT, allowNull: false, unique: true, field: 'github_id' },
  username: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  avatarUrl: { type: DataTypes.STRING, allowNull: true, field: 'avatar_url' },
  accessToken: { type: DataTypes.STRING(500), allowNull: true, field: 'access_token' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  lastLoginAt: { type: DataTypes.DATE, allowNull: true, field: 'last_login_at' },
}, {
  tableName: 'users',
  timestamps: false,
});

export default User;
