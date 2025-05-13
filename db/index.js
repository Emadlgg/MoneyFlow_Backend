// db/index.js
const { Sequelize, DataTypes } = require('sequelize');

// 1. Configuración centralizada de Sequelize
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'moneyflow',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  logging: process.env.NODE_ENV === 'development',
  define: {
    timestamps: true,
    paranoid: true,
    underscored: true
  }
});

// 2. Carga de modelos
const models = {
  User: require('../models/User.model')(sequelize, DataTypes),
  Transaction: require('../models/Transaction.model')(sequelize, DataTypes)
};

// 3. Definición de relaciones (si existen)
Object.values(models).forEach(model => {
  if (model.associate) model.associate(models);
});

// 4. Inicialización de la base de datos
const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL: Authentication successful');

    await sequelize.sync({
      force: process.env.DB_FORCE_SYNC === 'true',
      alter: process.env.DB_ALTER_SYNC === 'true'
    });
    console.log('✅ PostgreSQL: Models synchronized');
  } catch (error) {
    console.error('❌ PostgreSQL: Initialization failed', error);
    process.exit(1);
  }
};

module.exports = {
  ...models,
  sequelize,
  initializeDB,
  Op: Sequelize.Op
};
