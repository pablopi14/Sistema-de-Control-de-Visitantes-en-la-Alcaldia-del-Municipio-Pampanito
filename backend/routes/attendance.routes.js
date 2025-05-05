
const express = require('express');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const attendanceController = require('../controllers/attendance.controller');

const router = express.Router();

// Todas las rutas de asistencias requieren autenticación
router.use(verifyToken);

// Rutas
router.post('/', attendanceController.createAttendance);
router.get('/', attendanceController.getAllAttendances);
router.get('/range', attendanceController.getAttendancesByDateRange);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', [isAdmin], attendanceController.deleteAttendance);

module.exports = router;
