
const express = require('express');
const attendanceController = require('../controllers/attendance.controller');

const router = express.Router();

// Rutas
router.post('/', attendanceController.createAttendance);
router.get('/', attendanceController.getAllAttendances);
router.get('/range', attendanceController.getAttendancesByDateRange);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
