const { User } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
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

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).send({
        message: 'Los campos nombre, email y contraseña son obligatorios.'
      });
    }
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send({
        message: 'Ya existe un usuario con este correo electrónico.'
      });
    }
    
    // Crear el usuario
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      active: true
    });
    
    // Retornar el usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user.toJSON();
    
    res.status(201).send({
      message: 'Usuario creado exitosamente!',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al crear el usuario.'
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
    
    const { email } = req.body;
    
    // Si se está actualizando el email, verificar que no exista otro usuario con ese email
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).send({
          message: 'Ya existe un usuario con este correo electrónico.'
        });
      }
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