USE biblioteca_comparativa;

INSERT INTO editorial (id_editorial, nombre, pais) VALUES
  (1, 'Debolsillo', 'España'),
  (2, 'Salamandra', 'España'),
  (3, 'Planeta', 'México'),
  (4, 'Alianza Editorial', 'España')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), pais = VALUES(pais);

INSERT INTO categoria (id_categoria, nombre, descripcion) VALUES
  (1, 'Novela', 'Narrativa de ficción de extensión amplia.'),
  (2, 'Fantasía', 'Historias con elementos fantásticos o mundos imaginarios.'),
  (3, 'Ciencia ficción', 'Narrativa basada en escenarios científicos o tecnológicos.'),
  (4, 'Literatura infantil', 'Obras dirigidas principalmente a lectores infantiles.'),
  (5, 'Historia', 'Obras de temática histórica y divulgación.')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

INSERT INTO autor (id_autor, nombre, apellido, nacionalidad) VALUES
  (1, 'George', 'Orwell', 'Británica'),
  (2, 'Antoine', 'de Saint-Exupéry', 'Francesa'),
  (3, 'Gabriel', 'García Márquez', 'Colombiana'),
  (4, 'Mary', 'Shelley', 'Británica'),
  (5, 'Neil', 'Gaiman', 'Británica'),
  (6, 'Terry', 'Pratchett', 'Británica')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), apellido = VALUES(apellido), nacionalidad = VALUES(nacionalidad);

INSERT INTO usuario (id_usuario, nombre, apellido, correo, telefono, fecha_registro, estado) VALUES
  (1, 'Ana', 'Torres', 'ana.torres@biblioteca.test', '4431001001', '2026-08-15', 'ACTIVO'),
  (2, 'Luis', 'Mendoza', 'luis.mendoza@biblioteca.test', '4431001002', '2026-08-18', 'ACTIVO'),
  (3, 'Nayeli', 'García', 'naye.garcia@biblioteca.test', '4431001003', '2026-09-01', 'ACTIVO'),
  (4, 'David', 'Aguilar', 'david.aguilar@biblioteca.test', '4431001004', '2026-09-01', 'ACTIVO')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), apellido = VALUES(apellido), telefono = VALUES(telefono), estado = VALUES(estado);

INSERT INTO libro (id_libro, isbn, titulo, anio_publicacion, idioma, descripcion, id_editorial, id_categoria) VALUES
  (1, '9788499890944', '1984', 1949, 'Español', 'Novela distópica sobre vigilancia, poder y control social.', 1, 3),
  (2, '9788498381498', 'El principito', 1943, 'Español', 'Relato poético sobre amistad, pérdida y sentido de la vida.', 2, 4),
  (3, '9780307474728', 'Cien años de soledad', 1967, 'Español', 'Saga de la familia Buendía en el pueblo de Macondo.', 1, 1),
  (4, '9788491050238', 'Frankenstein', 1818, 'Español', 'Novela gótica sobre creación, responsabilidad y humanidad.', 4, 1),
  (5, '9780060853983', 'Buenos presagios', 1990, 'Español', 'Comedia fantástica sobre el fin del mundo.', 3, 2)
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo), anio_publicacion = VALUES(anio_publicacion), idioma = VALUES(idioma), descripcion = VALUES(descripcion), id_editorial = VALUES(id_editorial), id_categoria = VALUES(id_categoria);

INSERT INTO libro_autor (id_libro, id_autor) VALUES
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (5, 5),
  (5, 6)
ON DUPLICATE KEY UPDATE id_autor = VALUES(id_autor);

INSERT INTO ejemplar (id_ejemplar, codigo_inventario, id_libro, ubicacion, estado) VALUES
  (1, 'EJ-0001', 1, 'Sala A · Estante 01', 'DISPONIBLE'),
  (2, 'EJ-0002', 1, 'Sala A · Estante 01', 'PRESTADO'),
  (3, 'EJ-0003', 2, 'Sala Infantil · Estante 04', 'DISPONIBLE'),
  (4, 'EJ-0004', 2, 'Sala Infantil · Estante 04', 'MANTENIMIENTO'),
  (5, 'EJ-0005', 3, 'Sala B · Estante 08', 'DISPONIBLE'),
  (6, 'EJ-0006', 3, 'Sala B · Estante 08', 'PRESTADO'),
  (7, 'EJ-0007', 4, 'Sala A · Estante 03', 'DISPONIBLE'),
  (8, 'EJ-0008', 5, 'Sala Fantasía · Estante 02', 'DISPONIBLE')
ON DUPLICATE KEY UPDATE id_libro = VALUES(id_libro), ubicacion = VALUES(ubicacion), estado = VALUES(estado);

INSERT INTO prestamo (id_prestamo, id_usuario, fecha_prestamo, estado) VALUES
  (1, 4, '2026-09-28', 'ACTIVO'),
  (2, 3, '2026-09-20', 'FINALIZADO')
ON DUPLICATE KEY UPDATE id_usuario = VALUES(id_usuario), fecha_prestamo = VALUES(fecha_prestamo), estado = VALUES(estado);

INSERT INTO detalle_prestamo (id_detalle, id_prestamo, id_ejemplar, fecha_limite, fecha_devolucion, estado) VALUES
  (1, 1, 2, '2026-10-12', NULL, 'PRESTADO'),
  (2, 1, 6, '2026-10-12', NULL, 'PRESTADO'),
  (3, 2, 3, '2026-10-04', '2026-09-30', 'DEVUELTO')
ON DUPLICATE KEY UPDATE fecha_limite = VALUES(fecha_limite), fecha_devolucion = VALUES(fecha_devolucion), estado = VALUES(estado);
