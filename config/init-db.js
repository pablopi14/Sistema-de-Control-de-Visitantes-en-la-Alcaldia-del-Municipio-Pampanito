const bcrypt = require("bcryptjs");
const { User } = require("../models");

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
        cedula: "V-00000000",
        fecha_nacimiento: "1990-01-01",
        lugar_nacimiento: "Ciudad Capital",
        nacionalidad: "Venezolano",
        estado_civil: "soltero",
        telefono: "0414-0000000",
        cargo_laboral: "Administrador del sistema",
        departamento: "TI",
        horario: "Lunes a Viernes, 8:00am - 5:00pm",
        email: "admin@example.com",
        password: "123456", // Se hasheará automáticamente con el hook beforeCreate
        role: "admin"
      });
      console.log("Usuario administrador creado con éxito.");
    }

    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
}

module.exports = initDatabase;
