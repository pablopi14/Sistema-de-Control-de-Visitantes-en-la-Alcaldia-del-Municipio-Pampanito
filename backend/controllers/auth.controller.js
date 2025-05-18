
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/auth.config');
const { User } = require('../models');

exports.signup = async (req, res) => {
  try {
    // Crear el usuario
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'user',
      active: true
    });

    res.status(200).send({
      message: '¡Usuario registrado exitosamente!'
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al registrar el usuario.'
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email
    const user = await User.findOne({
      where: {
        email: email
      }
    });

    if (!user) {
      return res.status(404).send({
        message: 'Usuario no encontrado.'
      });
    }

    // Verificar contraseña
    const passwordIsValid = await user.verifyPassword(password);

    if (!passwordIsValid) {
      return res.status(401).send({
        message: '¡Contraseña inválida!'
      });
    }

    // Verificar si está activo
    if (user.active === false) {
      return res.status(403).send({
        message: 'Cuenta desactivada. Contacte al administrador.'
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id },
      config.secret,
      { expiresIn: config.expiresIn }
    );

    // Responder con datos del usuario y token
    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error durante el inicio de sesión.'
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Buscar usuario por ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({
        message: 'Usuario no encontrado.'
      });
    }

    // Verificar contraseña actual
    const passwordIsValid = await user.verifyPassword(currentPassword);

    if (!passwordIsValid) {
      return res.status(401).send({
        message: '¡Contraseña actual inválida!'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.status(200).send({
      message: '¡Contraseña actualizada exitosamente!'
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al cambiar la contraseña.'
    });
  }
};
