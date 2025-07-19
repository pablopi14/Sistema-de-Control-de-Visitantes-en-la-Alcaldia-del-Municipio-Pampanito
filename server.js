
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar la configuración de la base de datos
const { sequelize, createDatabaseIfNotExists } = require('./config/database');

// Importar función para inicializar la base de datos
const initDatabase = require('./config/init-db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/attendances', require('./routes/attendance.routes'));
app.use('/api/reports', require('./routes/reports.routes'));

// Ruta básica
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API del sistema de asistencias' });
});
// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
async function startServer() {
  try {
    // Crear la base de datos si no existe
    await createDatabaseIfNotExists();

    // Sincronizar la base de datos
    await sequelize.sync({ force: false });
    console.log('Base de datos sincronizada correctamente');
    
    // Inicializar la base de datos con datos básicos
    await initDatabase();

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}.`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

// Ejecutar la función para iniciar el servidor
startServer();
