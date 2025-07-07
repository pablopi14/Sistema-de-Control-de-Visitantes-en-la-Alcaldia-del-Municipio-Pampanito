
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const { User } = require('../models');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(403).send({
      message: 'No se proporcionó un token!'
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'No autorizado!'
      });
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).send({
        message: "Usuario no encontrado."
      });
    }
    
    if (user.role === 'admin') {
      next();
      return;
    }
    
    res.status(403).send({
      message: 'Requiere rol de administrador!'
    });
  } catch (error) {
    res.status(500).send({
      message: 'Error al verificar rol de usuario!'
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
