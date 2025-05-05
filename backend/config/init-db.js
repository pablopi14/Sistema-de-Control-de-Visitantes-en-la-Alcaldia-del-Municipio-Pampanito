
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Esta función inicializa la base de datos con datos básicos
async function initDatabase() {
  try {
    // Verificar si ya existe un usuario admin
    const adminExists = await User.findOne({
      where: {
        email: "admin@example.com"
      }
    });

    // Si no existe, crear un usuario admin por defecto
    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: "admin@example.com",
        password: "123456", // Se hasheará automáticamente con el hook beforeCreate
        role: "admin"
      });
      console.log("Usuario administrador creado con éxito.");
    }
    
    // Puedes agregar más usuarios semilla aquí si es necesario
    
    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
}

module.exports = initDatabase;
