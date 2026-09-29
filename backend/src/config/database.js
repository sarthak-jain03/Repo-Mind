import { Sequelize } from 'sequelize';

function buildConnectionUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const rawUrl = process.env.SPRING_DATASOURCE_URL || '';
  const username = process.env.SPRING_DATASOURCE_USERNAME;
  const password = process.env.SPRING_DATASOURCE_PASSWORD;

  let cleanUrl = rawUrl.replace(/^jdbc:postgresql:\/\//, '');
  cleanUrl = cleanUrl.replace(/[&?]channel_binding=[^&]*/g, '');

  return `postgres://${username}:${password}@${cleanUrl}`;
}

const databaseUrl = buildConnectionUrl();

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('neon.tech')
      ? { require: true, rejectUnauthorized: false }
      : false,
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await sequelize.sync();
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    throw error;
  }
}

export default sequelize;
