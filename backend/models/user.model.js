const { DataTypes } = require("sequelize")
const bcrypt = require("bcryptjs")
const { sequelize } = require("../config/database")

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cedula: {
      type: DataTypes.STRING,
      unique: true,
    },
    fecha_nacimiento: {
      type: DataTypes.STRING,
    },
    lugar_nacimiento: {
      type: DataTypes.STRING,
    },
    nacionalidad: {
      type: DataTypes.STRING,
    },
    estado_civil: {
      type: DataTypes.ENUM("soltero", "casado", "divorciado", "viudo"),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
    },
    cargo_laboral: {
      type: DataTypes.STRING,
    },
    departamento: {
      type: DataTypes.STRING,
    },
    horario: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    security_answer_1: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "¿Cuál es el nombre de tu primera mascota?",
    },
    security_answer_2: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "¿Segundo nombre de tu padre?",
    },
    security_answer_3: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "¿Cuál es tu color favorito?",
    },
  },
  {
    timestamps: true,
  },
)

// Hook para hashear la contraseña antes de crear un usuario
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10)
  if (user.security_answer_1) {
    user.security_answer_1 = await bcrypt.hash(user.security_answer_1.toLowerCase().trim(), 10)
  }
  if (user.security_answer_2) {
    user.security_answer_2 = await bcrypt.hash(user.security_answer_2.toLowerCase().trim(), 10)
  }
  if (user.security_answer_3) {
    user.security_answer_3 = await bcrypt.hash(user.security_answer_3.toLowerCase().trim(), 10)
  }
})

// Hook para hashear la contraseña al actualizarla
User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10)
  }
  if (user.changed("security_answer_1") && user.security_answer_1) {
    user.security_answer_1 = await bcrypt.hash(user.security_answer_1.toLowerCase().trim(), 10)
  }
  if (user.changed("security_answer_2") && user.security_answer_2) {
    user.security_answer_2 = await bcrypt.hash(user.security_answer_2.toLowerCase().trim(), 10)
  }
  if (user.changed("security_answer_3") && user.security_answer_3) {
    user.security_answer_3 = await bcrypt.hash(user.security_answer_3.toLowerCase().trim(), 10)
  }
})

// Método para verificar si la contraseña es correcta
User.prototype.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// Alias para compatibilidad con el controlador existente
User.prototype.validPassword = async function (password) {
  return await this.verifyPassword(password)
}

User.prototype.verifySecurityAnswers = async function (answer1, answer2, answer3) {
  const isAnswer1Valid = this.security_answer_1
    ? await bcrypt.compare(answer1.toLowerCase().trim(), this.security_answer_1)
    : false
  const isAnswer2Valid = this.security_answer_2
    ? await bcrypt.compare(answer2.toLowerCase().trim(), this.security_answer_2)
    : false
  const isAnswer3Valid = this.security_answer_3
    ? await bcrypt.compare(answer3.toLowerCase().trim(), this.security_answer_3)
    : false

  return isAnswer1Valid && isAnswer2Valid && isAnswer3Valid
}

module.exports = User
