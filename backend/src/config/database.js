import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connectie succesvol');
    return true;
  } catch (error) {
    console.error('❌ Database connectie mislukt:', error);
    return false;
  }
};

/**
 * Sync all models with database
 */
export const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Database modellen gesynchroniseerd');
  } catch (error) {
    console.error('❌ Database sync mislukt:', error);
    throw error;
  }
};

export default sequelize;
