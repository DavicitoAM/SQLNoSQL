import type { RowDataPacket } from 'mysql2';
import { mysqlPool } from '../config/mysql.js';
import { getMongoDb } from '../config/mongodb.js';
import type { OperationId } from '../data/operations.js';

interface CompareParams {
  title?: string;
  category?: string;
  user?: string;
}

interface EngineResult {
  query: string;
  entities: string[];
  rows: unknown[];
  metrics: Record<string, number | string>;
}

export interface ComparisonResult {
  operation: OperationId;
  mysql: EngineResult;
  mongodb: EngineResult;
  reading: string;
}

const bookSelect = `
SELECT
  l.id_libro,
  l.isbn,
  l.titulo,
  l.anio_publicacion,
  l.idioma,
  e.nombre AS editorial,
  c.nombre AS categoria,
  GROUP_CONCAT(CONCAT(a.nombre, ' ', a.apellido) ORDER BY a.id_autor SEPARATOR ', ') AS autores,
  COUNT(DISTINCT ej.id_ejemplar) AS total_ejemplares,
  SUM(CASE WHEN ej.estado = 'DISPONIBLE' THEN 1 ELSE 0 END) AS disponibles
FROM libro l
JOIN editorial e ON e.id_editorial = l.id_editorial
JOIN categoria c ON c.id_categoria = l.id_categoria
LEFT JOIN libro_autor la ON la.id_libro = l.id_libro
LEFT JOIN autor a ON a.id_autor = la.id_autor
LEFT JOIN ejemplar ej ON ej.id_libro = l.id_libro`;

const bookGroup = `
GROUP BY l.id_libro, l.isbn, l.titulo, l.anio_publicacion, l.idioma, e.nombre, c.nombre`;

async function mysqlAllBooks(): Promise<EngineResult> {
  const sql = `${bookSelect}${bookGroup}\nORDER BY l.titulo;`;
  const [rows] = await mysqlPool.query<RowDataPacket[]>(sql);
  return {
    query: sql.trim(),
    entities: ['libro', 'editorial', 'categoria', 'libro_autor', 'autor', 'ejemplar'],
    rows,
    metrics: { tables: 6, joins: 5, resultRows: rows.length }
  };
}

async function mongoAllBooks(): Promise<EngineResult> {
  const db = await getMongoDb();
  const rows = await db.collection('libros').find({}, {
    projection: { _id: 0 }
  }).sort({ titulo: 1 }).toArray();

  return {
    query: `db.libros.find({}, { _id: 0 }).sort({ titulo: 1 })`,
    entities: ['libros'],
    rows,
    metrics: { collections: 1, joins: 0, resultDocuments: rows.length }
  };
}

async function mysqlBookByTitle(title: string): Promise<EngineResult> {
  const sql = `${bookSelect}\nWHERE l.titulo LIKE ?${bookGroup}\nORDER BY l.titulo;`;
  const [rows] = await mysqlPool.query<RowDataPacket[]>(sql, [`%${title}%`]);
  return {
    query: sql.replace('?', `'${`%${title}%`.replaceAll("'", "''")}'`).trim(),
    entities: ['libro', 'editorial', 'categoria', 'libro_autor', 'autor', 'ejemplar'],
    rows,
    metrics: { tables: 6, joins: 5, resultRows: rows.length }
  };
}

async function mongoBookByTitle(title: string): Promise<EngineResult> {
  const db = await getMongoDb();
  const regex = new RegExp(title, 'i');
  const rows = await db.collection('libros').find({ titulo: regex }, { projection: { _id: 0 } }).sort({ titulo: 1 }).toArray();
  return {
    query: `db.libros.find({ titulo: /${escapeRegexDisplay(title)}/i }, { _id: 0 }).sort({ titulo: 1 })`,
    entities: ['libros'],
    rows,
    metrics: { collections: 1, joins: 0, resultDocuments: rows.length }
  };
}

async function mysqlBooksByCategory(category: string): Promise<EngineResult> {
  const sql = `${bookSelect}\nWHERE c.nombre LIKE ?${bookGroup}\nORDER BY l.titulo;`;
  const [rows] = await mysqlPool.query<RowDataPacket[]>(sql, [`%${category}%`]);
  return {
    query: sql.replace('?', `'${`%${category}%`.replaceAll("'", "''")}'`).trim(),
    entities: ['libro', 'editorial', 'categoria', 'libro_autor', 'autor', 'ejemplar'],
    rows,
    metrics: { tables: 6, joins: 5, resultRows: rows.length }
  };
}

async function mongoBooksByCategory(category: string): Promise<EngineResult> {
  const db = await getMongoDb();
  const regex = new RegExp(category, 'i');
  const rows = await db.collection('libros').find(
    { 'categoria.nombre': regex },
    { projection: { _id: 0 } }
  ).sort({ titulo: 1 }).toArray();

  return {
    query: `db.libros.find({ "categoria.nombre": /${escapeRegexDisplay(category)}/i }, { _id: 0 }).sort({ titulo: 1 })`,
    entities: ['libros'],
    rows,
    metrics: { collections: 1, joins: 0, resultDocuments: rows.length }
  };
}

async function mysqlAvailableCopies(): Promise<EngineResult> {
  const sql = `
SELECT
  ej.id_ejemplar,
  ej.codigo_inventario,
  l.titulo,
  ej.ubicacion,
  ej.estado
FROM ejemplar ej
JOIN libro l ON l.id_libro = ej.id_libro
WHERE ej.estado = 'DISPONIBLE'
ORDER BY l.titulo, ej.codigo_inventario;`;
  const [rows] = await mysqlPool.query<RowDataPacket[]>(sql);
  return {
    query: sql.trim(),
    entities: ['ejemplar', 'libro'],
    rows,
    metrics: { tables: 2, joins: 1, resultRows: rows.length }
  };
}

async function mongoAvailableCopies(): Promise<EngineResult> {
  const db = await getMongoDb();
  const pipeline = [
    { $unwind: '$ejemplares' },
    { $match: { 'ejemplares.estado': 'DISPONIBLE' } },
    {
      $project: {
        _id: 0,
        idEjemplar: '$ejemplares.idEjemplar',
        codigoInventario: '$ejemplares.codigoInventario',
        titulo: '$titulo',
        ubicacion: '$ejemplares.ubicacion',
        estado: '$ejemplares.estado'
      }
    },
    { $sort: { titulo: 1 as const, codigoInventario: 1 as const } }
  ];
  const rows = await db.collection('libros').aggregate(pipeline).toArray();
  return {
    query: `db.libros.aggregate([\n  { $unwind: "$ejemplares" },\n  { $match: { "ejemplares.estado": "DISPONIBLE" } },\n  { $project: { _id: 0, idEjemplar: "$ejemplares.idEjemplar", codigoInventario: "$ejemplares.codigoInventario", titulo: "$titulo", ubicacion: "$ejemplares.ubicacion", estado: "$ejemplares.estado" } },\n  { $sort: { titulo: 1, codigoInventario: 1 } }\n])`,
    entities: ['libros'],
    rows,
    metrics: { collections: 1, joins: 0, pipelineStages: 4, resultDocuments: rows.length }
  };
}

async function mysqlUserLoans(user: string): Promise<EngineResult> {
  const sql = `
SELECT
  u.id_usuario,
  CONCAT(u.nombre, ' ', u.apellido) AS usuario,
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
WHERE u.nombre LIKE ? OR u.apellido LIKE ?
ORDER BY p.fecha_prestamo DESC, dp.id_detalle;`;
  const value = `%${user}%`;
  const [rows] = await mysqlPool.query<RowDataPacket[]>(sql, [value, value]);
  return {
    query: sql.replaceAll('?', `'${value.replaceAll("'", "''")}'`).trim(),
    entities: ['usuario', 'prestamo', 'detalle_prestamo', 'ejemplar', 'libro'],
    rows,
    metrics: { tables: 5, joins: 4, resultRows: rows.length }
  };
}

async function mongoUserLoans(user: string): Promise<EngineResult> {
  const db = await getMongoDb();
  const regex = new RegExp(user, 'i');
  const rows = await db.collection('prestamos').find({
    $or: [
      { 'usuario.nombre': regex },
      { 'usuario.apellido': regex }
    ]
  }, { projection: { _id: 0 } }).sort({ fechaPrestamo: -1 }).toArray();

  return {
    query: `db.prestamos.find({ $or: [ { "usuario.nombre": /${escapeRegexDisplay(user)}/i }, { "usuario.apellido": /${escapeRegexDisplay(user)}/i } ] }, { _id: 0 }).sort({ fechaPrestamo: -1 })`,
    entities: ['prestamos'],
    rows,
    metrics: { collections: 1, joins: 0, resultDocuments: rows.length }
  };
}

function escapeRegexDisplay(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replaceAll('/', '\\/');
}

export async function compareOperation(operation: OperationId, params: CompareParams): Promise<ComparisonResult> {
  switch (operation) {
    case 'allBooks':
      return {
        operation,
        mysql: await mysqlAllBooks(),
        mongodb: await mongoAllBooks(),
        reading: 'MySQL reconstruye la ficha bibliográfica mediante varias relaciones; MongoDB recupera un documento que ya contiene editorial, categoría, autores y ejemplares embebidos.'
      };
    case 'bookByTitle': {
      const title = params.title?.trim();
      if (!title) throw new Error('Escribe un título para realizar la comparación.');
      return {
        operation,
        mysql: await mysqlBookByTitle(title),
        mongodb: await mongoBookByTitle(title),
        reading: 'El filtro es sencillo en ambos motores; la diferencia aparece al recuperar las relaciones que completan la ficha del libro.'
      };
    }
    case 'booksByCategory': {
      const category = params.category?.trim();
      if (!category) throw new Error('Escribe una categoría para realizar la comparación.');
      return {
        operation,
        mysql: await mysqlBooksByCategory(category),
        mongodb: await mongoBooksByCategory(category),
        reading: 'En MySQL la categoría se encuentra en otra tabla y requiere JOIN; en MongoDB se filtra un campo dentro del objeto categoria embebido.'
      };
    }
    case 'availableCopies':
      return {
        operation,
        mysql: await mysqlAvailableCopies(),
        mongodb: await mongoAvailableCopies(),
        reading: 'MongoDB usa un pipeline para recorrer el arreglo de ejemplares; MySQL combina ejemplar con libro y filtra las filas disponibles.'
      };
    case 'userLoans': {
      const user = params.user?.trim();
      if (!user) throw new Error('Escribe el nombre o apellido de un usuario.');
      return {
        operation,
        mysql: await mysqlUserLoans(user),
        mongodb: await mongoUserLoans(user),
        reading: 'El historial requiere recorrer cinco tablas en el modelo relacional. En el modelo documental el préstamo y sus detalles están agrupados en un documento.'
      };
    }
    default:
      throw new Error('Operación de comparación no reconocida.');
  }
}
