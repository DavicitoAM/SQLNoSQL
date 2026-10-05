CREATE DATABASE IF NOT EXISTS biblioteca_comparativa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE biblioteca_comparativa;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS detalle_prestamo;
DROP TABLE IF EXISTS prestamo;
DROP TABLE IF EXISTS ejemplar;
DROP TABLE IF EXISTS libro_autor;
DROP TABLE IF EXISTS libro;
DROP TABLE IF EXISTS autor;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS editorial;
DROP TABLE IF EXISTS usuario;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuario (
  id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20) NULL,
  fecha_registro DATE NOT NULL,
  estado ENUM('ACTIVO', 'SUSPENDIDO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO'
) ENGINE=InnoDB;

CREATE TABLE editorial (
  id_editorial INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  pais VARCHAR(80) NULL,
  CONSTRAINT uq_editorial_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE categoria (
  id_categoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  descripcion VARCHAR(250) NULL,
  CONSTRAINT uq_categoria_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE autor (
  id_autor INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  nacionalidad VARCHAR(80) NULL
) ENGINE=InnoDB;

CREATE TABLE libro (
  id_libro INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  isbn VARCHAR(20) NOT NULL UNIQUE,
  titulo VARCHAR(200) NOT NULL,
  anio_publicacion SMALLINT UNSIGNED NOT NULL,
  idioma VARCHAR(50) NOT NULL DEFAULT 'Español',
  descripcion TEXT NULL,
  id_editorial INT UNSIGNED NOT NULL,
  id_categoria INT UNSIGNED NOT NULL,
  CONSTRAINT fk_libro_editorial
    FOREIGN KEY (id_editorial) REFERENCES editorial(id_editorial)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_libro_categoria
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_libro_anio CHECK (anio_publicacion BETWEEN 1000 AND 2100)
) ENGINE=InnoDB;

CREATE TABLE libro_autor (
  id_libro INT UNSIGNED NOT NULL,
  id_autor INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_libro, id_autor),
  CONSTRAINT fk_libro_autor_libro
    FOREIGN KEY (id_libro) REFERENCES libro(id_libro)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_libro_autor_autor
    FOREIGN KEY (id_autor) REFERENCES autor(id_autor)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE ejemplar (
  id_ejemplar INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo_inventario VARCHAR(30) NOT NULL UNIQUE,
  id_libro INT UNSIGNED NOT NULL,
  ubicacion VARCHAR(100) NOT NULL,
  estado ENUM('DISPONIBLE', 'PRESTADO', 'MANTENIMIENTO', 'PERDIDO') NOT NULL DEFAULT 'DISPONIBLE',
  CONSTRAINT fk_ejemplar_libro
    FOREIGN KEY (id_libro) REFERENCES libro(id_libro)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE prestamo (
  id_prestamo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  fecha_prestamo DATE NOT NULL,
  estado ENUM('ACTIVO', 'FINALIZADO', 'VENCIDO') NOT NULL DEFAULT 'ACTIVO',
  CONSTRAINT fk_prestamo_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE detalle_prestamo (
  id_detalle INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_prestamo INT UNSIGNED NOT NULL,
  id_ejemplar INT UNSIGNED NOT NULL,
  fecha_limite DATE NOT NULL,
  fecha_devolucion DATE NULL,
  estado ENUM('PRESTADO', 'DEVUELTO', 'VENCIDO') NOT NULL DEFAULT 'PRESTADO',
  CONSTRAINT fk_detalle_prestamo
    FOREIGN KEY (id_prestamo) REFERENCES prestamo(id_prestamo)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detalle_ejemplar
    FOREIGN KEY (id_ejemplar) REFERENCES ejemplar(id_ejemplar)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT uq_detalle_prestamo_ejemplar UNIQUE (id_prestamo, id_ejemplar)
) ENGINE=InnoDB;

CREATE INDEX idx_libro_titulo ON libro(titulo);
CREATE INDEX idx_ejemplar_estado ON ejemplar(estado);
CREATE INDEX idx_prestamo_usuario ON prestamo(id_usuario);
CREATE INDEX idx_detalle_estado ON detalle_prestamo(estado);
