USE biblioteca_comparativa;

-- 1. Libros con editorial, categoría y autores.
SELECT
  l.id_libro,
  l.titulo,
  l.isbn,
  e.nombre AS editorial,
  c.nombre AS categoria,
  GROUP_CONCAT(CONCAT(a.nombre, ' ', a.apellido) ORDER BY a.id_autor SEPARATOR ', ') AS autores
FROM libro l
JOIN editorial e ON e.id_editorial = l.id_editorial
JOIN categoria c ON c.id_categoria = l.id_categoria
LEFT JOIN libro_autor la ON la.id_libro = l.id_libro
LEFT JOIN autor a ON a.id_autor = la.id_autor
GROUP BY l.id_libro, l.titulo, l.isbn, e.nombre, c.nombre
ORDER BY l.titulo;

-- 2. Ejemplares disponibles.
SELECT
  ej.codigo_inventario,
  l.titulo,
  ej.ubicacion,
  ej.estado
FROM ejemplar ej
JOIN libro l ON l.id_libro = ej.id_libro
WHERE ej.estado = 'DISPONIBLE'
ORDER BY l.titulo;

-- 3. Préstamos de un usuario.
SELECT
  u.nombre,
  u.apellido,
  p.id_prestamo,
  p.fecha_prestamo,
  p.estado AS estado_prestamo,
  l.titulo,
  ej.codigo_inventario,
  dp.fecha_limite,
  dp.fecha_devolucion,
  dp.estado AS estado_detalle
FROM usuario u
JOIN prestamo p ON p.id_usuario = u.id_usuario
JOIN detalle_prestamo dp ON dp.id_prestamo = p.id_prestamo
JOIN ejemplar ej ON ej.id_ejemplar = dp.id_ejemplar
JOIN libro l ON l.id_libro = ej.id_libro
WHERE u.nombre LIKE '%David%' OR u.apellido LIKE '%David%'
ORDER BY p.fecha_prestamo DESC;
