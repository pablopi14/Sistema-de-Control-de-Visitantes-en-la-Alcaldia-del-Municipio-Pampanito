CREATE DATABASE alcaldia_asistencia;

-- Tabla Visitantes
CREATE TABLE Visitantes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(50),
    apellidos VARCHAR(50),
    edad INT,
    cedula VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    correo VARCHAR(50),
    motivo_visita TEXT,
    hora_entrada TIME,
    hora_salida TIME
);

-- Tabla Personal - Los que usan el sistema.
CREATE TABLE Personal (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(50),
    apellidos VARCHAR(50),
    edad INT,
    cedula VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    correo VARCHAR(50),
    rol ENUM('admin', 'recepcionista')
);