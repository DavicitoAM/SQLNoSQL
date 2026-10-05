export const relationalModel = [
  {
    table: 'usuario',
    purpose: 'Lectores registrados',
    columns: [
      ['id_usuario', 'INT UNSIGNED', 'PK'], ['nombre', 'VARCHAR(100)', ''], ['apellido', 'VARCHAR(100)', ''],
      ['correo', 'VARCHAR(150)', 'UNIQUE'], ['telefono', 'VARCHAR(20)', ''], ['fecha_registro', 'DATE', ''], ['estado', 'ENUM', '']
    ]
  },
  {
    table: 'editorial', purpose: 'Editoriales del catálogo',
    columns: [['id_editorial', 'INT UNSIGNED', 'PK'], ['nombre', 'VARCHAR(120)', 'UNIQUE'], ['pais', 'VARCHAR(80)', '']]
  },
  {
    table: 'categoria', purpose: 'Clasificación principal del libro',
    columns: [['id_categoria', 'INT UNSIGNED', 'PK'], ['nombre', 'VARCHAR(80)', 'UNIQUE'], ['descripcion', 'VARCHAR(250)', '']]
  },
  {
    table: 'autor', purpose: 'Autores de las obras',
    columns: [['id_autor', 'INT UNSIGNED', 'PK'], ['nombre', 'VARCHAR(100)', ''], ['apellido', 'VARCHAR(100)', ''], ['nacionalidad', 'VARCHAR(80)', '']]
  },
  {
    table: 'libro', purpose: 'Información bibliográfica de una obra',
    columns: [
      ['id_libro', 'INT UNSIGNED', 'PK'], ['isbn', 'VARCHAR(20)', 'UNIQUE'], ['titulo', 'VARCHAR(200)', ''],
      ['anio_publicacion', 'SMALLINT', ''], ['idioma', 'VARCHAR(50)', ''], ['descripcion', 'TEXT', ''],
      ['id_editorial', 'INT UNSIGNED', 'FK → editorial'], ['id_categoria', 'INT UNSIGNED', 'FK → categoria']
    ]
  },
  {
    table: 'libro_autor', purpose: 'Resuelve la relación N:M Libro–Autor',
    columns: [['id_libro', 'INT UNSIGNED', 'PK/FK → libro'], ['id_autor', 'INT UNSIGNED', 'PK/FK → autor']]
  },
  {
    table: 'ejemplar', purpose: 'Copias físicas de cada libro',
    columns: [['id_ejemplar', 'INT UNSIGNED', 'PK'], ['codigo_inventario', 'VARCHAR(30)', 'UNIQUE'], ['id_libro', 'INT UNSIGNED', 'FK → libro'], ['ubicacion', 'VARCHAR(100)', ''], ['estado', 'ENUM', '']]
  },
  {
    table: 'prestamo', purpose: 'Cabecera de una operación de préstamo',
    columns: [['id_prestamo', 'INT UNSIGNED', 'PK'], ['id_usuario', 'INT UNSIGNED', 'FK → usuario'], ['fecha_prestamo', 'DATE', ''], ['estado', 'ENUM', '']]
  },
  {
    table: 'detalle_prestamo', purpose: 'Ejemplares incluidos en un préstamo',
    columns: [['id_detalle', 'INT UNSIGNED', 'PK'], ['id_prestamo', 'INT UNSIGNED', 'FK → prestamo'], ['id_ejemplar', 'INT UNSIGNED', 'FK → ejemplar'], ['fecha_limite', 'DATE', ''], ['fecha_devolucion', 'DATE', 'NULL'], ['estado', 'ENUM', '']]
  }
];

export const relations = [
  ['editorial', '1:N', 'libro'],
  ['categoria', '1:N', 'libro'],
  ['libro', 'N:M', 'autor', 'mediante libro_autor'],
  ['libro', '1:N', 'ejemplar'],
  ['usuario', '1:N', 'prestamo'],
  ['prestamo', '1:N', 'detalle_prestamo'],
  ['ejemplar', '1:N', 'detalle_prestamo', 'históricamente']
];

export const documentModel = [
  {
    collection: 'libros',
    embeds: ['editorial {}', 'categoria {}', 'autores []', 'ejemplares []'],
    description: 'Agrega la información que en MySQL se distribuye entre libro, editorial, categoria, libro_autor, autor y ejemplar.'
  },
  {
    collection: 'usuarios',
    embeds: [],
    description: 'Mantiene el lector como documento independiente porque tiene vida propia y puede participar en muchos préstamos.'
  },
  {
    collection: 'prestamos',
    embeds: ['usuario {} (snapshot)', 'detalles []', 'detalles.libro {}'],
    description: 'Agrupa la operación y sus detalles para consultar el préstamo completo como una unidad documental.'
  }
];
