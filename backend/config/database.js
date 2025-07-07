
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

// Función para crear la base de datos si no existe
async function createDatabaseIfNotExists() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('Verificando si existe la base de datos...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Base de datos "${process.env.DB_NAME}" verificada o creada correctamente`);
    
    await connection.end();
  } catch (error) {
    console.error('Error al crear la base de datos:', error);
    process.exit(1);
  }
}

// Crear una instancia de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Exportamos la función y la conexión
module.exports = {
  sequelize,
  createDatabaseIfNotExists
};
