
/**
 * Este archivo define los modelos de base de datos que se utilizarán en el backend.
 * En una aplicación real, estos modelos estarían definidos en el servidor usando Sequelize.
 * 
 * Para el sistema de asistencias, necesitamos dos tablas principales:
 * 
 * 1. Users: Almacena información de los usuarios del sistema
 * 2. Attendances: Registra las asistencias de los visitantes
 */

export interface User {
  id: number;
  name: string;
  cedula?: string;
  fecha_nacimiento?: string; // formato ISO YYYY-MM-DD
  lugar_nacimiento?: string;
  nacionalidad?: string;
  estado_civil?: string;
  telefono?: string;
  cargo_laboral?: string;
  departamento?: string;
  horario?: string;
  email: string;
  password?: string; // Solo en el backend, no se envía al frontend
  role: 'admin' | 'user';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: number;
  nombres: string;
  apellidos: string;
  edad?: number;
  cedula: string;
  telefono?: string;
  correo?: string;
  motivo_visita?: string;
  hora_entrada?: string;
  hora_salida?: string;
  createdAt: string;
  updatedAt: string;
}
