const { Sequelize, DataTypes } = require('sequelize');

// 1. Configuración centralizada de Sequelize
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,  // Puerto explícito
  database: process.env.DB_NAME || 'moneyflow',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  logging: process.env.NODE_ENV === 'development', // Logs sólo en desarrollo
  define: {  // Configuración global de modelos
    timestamps: true,
    paranoid: true,  // Soft deletes
    underscored: true  // snake_case en BD
  }
});

// 2. Carga dinámica de modelos (patrón factory)
const models = {
  User: require('../models/User.model')(sequelize, DataTypes),
  Transaction: require('../models/Transaction.model')(sequelize, DataTypes)
};

// 3. Definición de relaciones
Object.values(models).forEach(model => {
  if (model.associate) model.associate(models);  // Si el modelo tiene relaciones
});

// 4. Inicialización con manejo robusto de errores
const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL: Authentication successful');

    await sequelize.sync({ 
      force: process.env.DB_FORCE_SYNC === 'true',  // Peligroso en producción
      alter: process.env.DB_ALTER_SYNC === 'true'   // Actualiza esquemas
    });
    console.log('✅ PostgreSQL: Models synchronized');

  } catch (error) {
    console.error('❌ PostgreSQL: Initialization failed', error);
    process.exit(1);  // Falla crítica
  }
};

// 5. Exportación consolidada
module.exports = {
  ...models,
  sequelize,
  initializeDB,
  Op: Sequelize.Op  // Operadores útiles para queries
};