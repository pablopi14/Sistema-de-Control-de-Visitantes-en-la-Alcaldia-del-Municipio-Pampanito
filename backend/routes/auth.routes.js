
const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Rutas públicas
router.post('/signin', authController.signin);
router.post('/signup', authController.signup);

// Rutas privadas
router.post('/change-password', [verifyToken], authController.changePassword);

module.exports = router;
