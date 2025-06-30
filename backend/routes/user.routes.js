const express = require('express');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Todas las rutas de usuarios requieren autenticación
router.use(verifyToken);

// Rutas para administradores
router.get('/', [isAdmin], userController.getAllUsers);
router.post('/', [isAdmin], userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', [isAdmin], userController.updateUser);
router.delete('/:id', [isAdmin], userController.deleteUser);

module.exports = router;
