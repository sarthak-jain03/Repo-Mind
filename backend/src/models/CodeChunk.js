import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CodeChunk = sequelize.define('CodeChunk', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  repoId: { type: DataTypes.BIGINT, allowNull: false, field: 'repo_id', references: { model: 'repositories', key: 'id' } },
  filePath: { type: DataTypes.STRING, allowNull: false, field: 'file_path' },
  content: { type: DataTypes.TEXT, allowNull: false },
  language: { type: DataTypes.STRING, allowNull: true },
  startLine: { type: DataTypes.INTEGER, allowNull: true, field: 'start_line' },
  endLine: { type: DataTypes.INTEGER, allowNull: true, field: 'end_line' },
  chunkIndex: { type: DataTypes.INTEGER, allowNull: true, field: 'chunk_index' },
  metadata: { type: DataTypes.TEXT, allowNull: true },
  embedding: { type: DataTypes.TEXT, allowNull: true },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'code_chunks',
  timestamps: false,
});

export default CodeChunk;
