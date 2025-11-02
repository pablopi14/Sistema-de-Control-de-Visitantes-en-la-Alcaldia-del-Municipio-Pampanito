
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombres: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  correo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  motivo_visita: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  departamento: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  hora_entrada: {
    type: DataTypes.TIME,
    allowNull: true
  },
  hora_salida: {
    type: DataTypes.TIME,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Attendance;
