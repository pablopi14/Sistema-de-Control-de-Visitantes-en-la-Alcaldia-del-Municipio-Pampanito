
# Dark Attendance Hub

Sistema de gestión de asistencias con interfaz oscura desarrollado con React y Node.js.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- **Frontend**: Aplicación React con interfaz oscura
- **Backend**: API REST desarrollada con Express, Sequelize y MySQL

## Requisitos previos

- Node.js (v14+)
- MySQL (v5.7+)

## Configuración del Backend

1. Crea una base de datos MySQL:

```sql
CREATE DATABASE dark_attendance_hub;
```

2. Configura las variables de entorno:

Edita el archivo `backend/.env` con los datos de conexión a tu base de datos:

```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=dark_attendance_hub
DB_PORT=3306

JWT_SECRET=cambia_esto_por_una_clave_secreta_segura
```

3. Instala las dependencias del backend:

```bash
cd backend
npm install
```

4. Inicia el servidor:

```bash
npm run dev
```

El servidor se ejecutará en http://localhost:3000.

## Configuración del Frontend

1. Instala las dependencias del frontend:

```bash
npm install
```

2. Inicia la aplicación:

```bash
npm run dev
```

La aplicación se ejecutará en http://localhost:5173.

## Usuario por defecto

El sistema crea automáticamente un usuario administrador:

- Email: admin@example.com
- Contraseña: password

## Funcionalidades

- Inicio de sesión
- Cambio de contraseña
- Gestión de asistencias (crear, ver, editar, eliminar)
- Gestión de usuarios (administradores)
- Reportes de asistencia por rango de fecha
