const express = require('express');
const reportsController = require('../controllers/reports.controller');

const router = express.Router();

// Rutas de reportes
router.get('/data', reportsController.getReportData);
router.post('/pdf', reportsController.generatePDF);
router.get('/summary', reportsController.getAttendanceSummary);

module.exports = router;