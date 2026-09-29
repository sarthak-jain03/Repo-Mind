import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Repository = sequelize.define('Repository', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT, allowNull: false, field: 'user_id', references: { model: 'users', key: 'id' } },
  githubRepoId: { type: DataTypes.BIGINT, allowNull: false, field: 'github_repo_id' },
  name: { type: DataTypes.STRING, allowNull: false },
  owner: { type: DataTypes.STRING, allowNull: false },
  fullName: { type: DataTypes.STRING, allowNull: false, field: 'full_name' },
  description: { type: DataTypes.TEXT, allowNull: true },
  language: { type: DataTypes.STRING, allowNull: true },
  defaultBranch: { type: DataTypes.STRING, allowNull: true, field: 'default_branch' },
  starCount: { type: DataTypes.INTEGER, allowNull: true, field: 'star_count' },
  forkCount: { type: DataTypes.INTEGER, allowNull: true, field: 'fork_count' },
  isPrivate: { type: DataTypes.BOOLEAN, allowNull: true, field: 'is_private' },
  indexStatus: { type: DataTypes.STRING, allowNull: false, defaultValue: 'NOT_INDEXED', field: 'index_status' },
  totalFiles: { type: DataTypes.INTEGER, allowNull: true, field: 'total_files' },
  indexedFiles: { type: DataTypes.INTEGER, allowNull: true, field: 'indexed_files' },
  lastIndexedAt: { type: DataTypes.DATE, allowNull: true, field: 'last_indexed_at' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'repositories',
  timestamps: false,
});

export default Repository;
