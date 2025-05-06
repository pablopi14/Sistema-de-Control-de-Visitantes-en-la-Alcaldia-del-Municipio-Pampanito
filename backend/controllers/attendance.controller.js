
const { Attendance } = require('../models');
const { Op } = require('sequelize');

exports.createAttendance = async (req, res) => {
  try {
    const { 
      nombres, 
      apellidos, 
      edad, 
      cedula, 
      telefono, 
      correo, 
      motivo_visita, 
      hora_entrada,
      hora_salida
    } = req.body;
    
    // Crear registro de asistencia
    const attendance = await Attendance.create({
      nombres,
      apellidos,
      edad: edad || null,
      cedula,
      telefono: telefono || null,
      correo: correo || null,
      motivo_visita: motivo_visita || null,
      hora_entrada: hora_entrada || null,
      hora_salida: hora_salida || null
    });
    
    res.status(201).send({
      message: 'Asistencia registrada exitosamente!',
      attendance
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al registrar la asistencia.'
    });
  }
};

exports.getAllAttendances = async (req, res) => {
  try {
    const { nombres, apellidos, cedula } = req.query;
    let whereClause = {};
    
    // Filtrar por nombres
    if (nombres) {
      whereClause.nombres = {
        [Op.like]: `%${nombres}%`
      };
    }
    
    // Filtrar por apellidos
    if (apellidos) {
      whereClause.apellidos = {
        [Op.like]: `%${apellidos}%`
      };
    }
    
    // Filtrar por cédula
    if (cedula) {
      whereClause.cedula = {
        [Op.like]: `%${cedula}%`
      };
    }
    
    const attendances = await Attendance.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).send(attendances);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener las asistencias.'
    });
  }
};

exports.getAttendancesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, nombres, apellidos, cedula } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).send({
        message: 'Se requieren fechas de inicio y fin.'
      });
    }
    
    console.log("Fechas recibidas del frontend:", { startDate, endDate });
    
    // Usar directamente las fechas ISO que vienen del frontend
    const start = new Date(startDate);
    const end = new Date(endDate);

    
    let whereClause = {
      createdAt: {
        [Op.between]: [start, end]
      }
    };
    
    // Filtrar por nombres si se proporciona
    if (nombres) {
      whereClause.nombres = {
        [Op.like]: `%${nombres}%`
      };
    }
    
    // Filtrar por apellidos si se proporciona
    if (apellidos) {
      whereClause.apellidos = {
        [Op.like]: `%${apellidos}%`
      };
    }
    
    // Filtrar por cédula si se proporciona
    if (cedula) {
      whereClause.cedula = {
        [Op.like]: `%${cedula}%`
      };
    }
    
    console.log("Where clause:", whereClause);
    
    const attendances = await Attendance.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    console.log("Asistencias encontradas:", attendances.length);
    
    res.status(200).send(attendances);
  } catch (error) {
    console.error("Error en getAttendancesByDateRange:", error);
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener las asistencias por rango de fechas.'
    });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombres, 
      apellidos, 
      edad, 
      cedula,
      telefono, 
      correo,
      motivo_visita,
      hora_entrada,
      hora_salida
    } = req.body;
    
    const attendance = await Attendance.findByPk(id);
    
    if (!attendance) {
      return res.status(404).send({
        message: 'Registro de asistencia no encontrado.'
      });
    }
    
    // Actualizar asistencia
    await attendance.update({
      nombres: nombres || attendance.nombres,
      apellidos: apellidos || attendance.apellidos,
      edad: edad !== undefined ? edad : attendance.edad,
      cedula: cedula || attendance.cedula,
      telefono: telefono !== undefined ? telefono : attendance.telefono,
      correo: correo !== undefined ? correo : attendance.correo,
      motivo_visita: motivo_visita !== undefined ? motivo_visita : attendance.motivo_visita,
      hora_entrada: hora_entrada !== undefined ? hora_entrada : attendance.hora_entrada,
      hora_salida: hora_salida !== undefined ? hora_salida : attendance.hora_salida
    });
    
    res.status(200).send({
      message: 'Asistencia actualizada exitosamente!',
      attendance
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al actualizar la asistencia.'
    });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findByPk(id);
    
    if (!attendance) {
      return res.status(404).send({
        message: 'Registro de asistencia no encontrado.'
      });
    }
    
    // Eliminar asistencia
    await attendance.destroy();
    
    res.status(200).send({
      message: 'Asistencia eliminada exitosamente!'
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al eliminar la asistencia.'
    });
  }
};
