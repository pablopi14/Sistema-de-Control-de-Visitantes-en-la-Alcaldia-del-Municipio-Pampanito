
const { Attendance, User } = require('../models');
const { Op } = require('sequelize');

exports.createAttendance = async (req, res) => {
  try {
    const { userId, date, status, notes } = req.body;
    
    // Verificar si el usuario existe
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).send({
        message: 'Usuario no encontrado.'
      });
    }
    
    // Crear registro de asistencia
    const attendance = await Attendance.create({
      userId,
      date: date || new Date(),
      status: status || 'presente',
      notes: notes || '',
      recordedBy: req.userId  // ID del usuario que registra la asistencia (del token)
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
    const { date, userId, status } = req.query;
    let whereClause = {};
    
    // Filtrar por fecha
    if (date) {
      whereClause.date = date;
    }
    
    // Filtrar por usuario
    if (userId) {
      whereClause.userId = userId;
    }
    
    // Filtrar por estado
    if (status) {
      whereClause.status = status;
    }
    
    const attendances = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'recorder',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date', 'DESC']]
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
    const { startDate, endDate, userId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).send({
        message: 'Se requieren fechas de inicio y fin.'
      });
    }
    
    let whereClause = {
      date: {
        [Op.between]: [startDate, endDate]
      }
    };
    
    // Filtrar por usuario si se proporciona
    if (userId) {
      whereClause.userId = userId;
    }
    
    const attendances = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'recorder',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date', 'ASC']]
    });
    
    res.status(200).send(attendances);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener las asistencias por rango de fechas.'
    });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const attendance = await Attendance.findByPk(id);
    
    if (!attendance) {
      return res.status(404).send({
        message: 'Registro de asistencia no encontrado.'
      });
    }
    
    // Actualizar asistencia
    await attendance.update({
      status: status || attendance.status,
      notes: notes || attendance.notes,
      // No permitimos cambiar la fecha ni el usuario
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
