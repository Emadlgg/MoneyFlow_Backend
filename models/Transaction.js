const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tipo: { type: DataTypes.ENUM('ingreso', 'gasto'), allowNull: false },
  categoria: { type: DataTypes.STRING }
});

module.exports = Transaction;