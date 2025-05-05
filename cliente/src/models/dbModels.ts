
/**
 * Este archivo define los modelos de base de datos que se utilizarán en el backend.
 * En una aplicación real, estos modelos estarían definidos en el servidor usando Sequelize.
 * 
 * Para el sistema de asistencias, necesitamos dos tablas principales:
 * 
 * 1. Users: Almacena información de los usuarios del sistema
 * 2. Attendances: Registra las asistencias de los usuarios
 * 
 * A continuación se muestra una representación de cómo se definirían estos modelos en Sequelize:
 */

/*
// Modelo de Usuario (en el backend)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  // Opciones del modelo
  timestamps: true
});

// Modelo de Asistencia (en el backend)
const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('presente', 'ausente', 'tardanza'),
    allowNull: false,
    defaultValue: 'presente'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recordedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  // Opciones del modelo
  timestamps: true
});

// Establecer las relaciones
User.hasMany(Attendance, { foreignKey: 'userId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Attendance, { foreignKey: 'recordedBy', as: 'RecordedAttendances' });
Attendance.belongsTo(User, { foreignKey: 'recordedBy', as: 'Recorder' });
*/

// En el frontend, usamos interfaces TypeScript para representar estos modelos:

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Solo en el backend, no se envía al frontend
  role: 'admin' | 'user';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: number;
  userId: number;
  user?: User; // Relación, se incluye al hacer joins
  date: string; // YYYY-MM-DD
  status: 'presente' | 'ausente' | 'tardanza';
  notes?: string;
  recordedBy: number;
  recorder?: User; // Relación, se incluye al hacer joins
  createdAt: string;
  updatedAt: string;
}

/**
 * Script para inicializar la base de datos en el backend (ejemplo):
 * 
 * async function initDatabase() {
 *   try {
 *     // Sincronizar modelos con la base de datos
 *     await sequelize.sync({ force: true });
 *     
 *     // Crear usuario admin por defecto
 *     await User.create({
 *       name: 'Admin',
 *       email: 'admin@ejemplo.com',
 *       password: await bcrypt.hash('password', 10),
 *       role: 'admin'
 *     });
 *     
 *     console.log('Base de datos inicializada correctamente');
 *   } catch (error) {
 *     console.error('Error al inicializar la base de datos:', error);
 *   }
 * }
 * 
 * initDatabase();
 */
