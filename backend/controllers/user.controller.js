
const { User } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener los usuarios.'
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).send({
        message: 'Usuario no encontrado.'
      });
    }
    
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener el usuario.'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).send({
        message: 'Usuario no encontrado.'
      });
    }
    
    await user.update(req.body);
    
    res.status(200).send({
      message: 'Usuario actualizado exitosamente!'
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al actualizar el usuario.'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).send({
        message: 'Usuario no encontrado.'
      });
    }
    
    // En lugar de eliminar físicamente, marcamos como inactivo
    await user.update({ active: false });
    
    res.status(200).send({
      message: 'Usuario desactivado exitosamente!'
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al desactivar el usuario.'
    });
  }
};
