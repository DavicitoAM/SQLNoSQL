import type { RowDataPacket } from 'mysql2';
import { mysqlPool } from '../config/mysql.js';
import { getMongoDb } from '../config/mongodb.js';

interface LibroRow extends RowDataPacket {
  id_libro: number;
  isbn: string;
  titulo: string;
  anio_publicacion: number;
  idioma: string;
  descripcion: string | null;
  id_editorial: number;
  editorial: string;
  pais_editorial: string | null;
  id_categoria: number;
  categoria: string;
}

export async function buildBookDocument(idLibro: number) {
  const [bookRows] = await mysqlPool.query<LibroRow[]>(`
    SELECT l.*, e.nombre AS editorial, e.pais AS pais_editorial, c.nombre AS categoria
    FROM libro l
    JOIN editorial e ON e.id_editorial = l.id_editorial
    JOIN categoria c ON c.id_categoria = l.id_categoria
    WHERE l.id_libro = ?
  `, [idLibro]);

  const book = bookRows[0];
  if (!book) return null;

  const [authors] = await mysqlPool.query<RowDataPacket[]>(`
    SELECT a.id_autor, a.nombre, a.apellido, a.nacionalidad
    FROM autor a
    JOIN libro_autor la ON la.id_autor = a.id_autor
    WHERE la.id_libro = ?
    ORDER BY a.id_autor
  `, [idLibro]);

  const [copies] = await mysqlPool.query<RowDataPacket[]>(`
    SELECT id_ejemplar, codigo_inventario, ubicacion, estado
    FROM ejemplar
    WHERE id_libro = ?
    ORDER BY id_ejemplar
  `, [idLibro]);

  return {
    relationalId: book.id_libro,
    isbn: book.isbn,
    titulo: book.titulo,
    anioPublicacion: book.anio_publicacion,
    idioma: book.idioma,
    descripcion: book.descripcion,
    editorial: {
      idEditorial: book.id_editorial,
      nombre: book.editorial,
      pais: book.pais_editorial
    },
    categoria: {
      idCategoria: book.id_categoria,
      nombre: book.categoria
    },
    autores: authors.map((a) => ({
      idAutor: a.id_autor,
      nombre: a.nombre,
      apellido: a.apellido,
      nacionalidad: a.nacionalidad
    })),
    ejemplares: copies.map((copy) => ({
      idEjemplar: copy.id_ejemplar,
      codigoInventario: copy.codigo_inventario,
      ubicacion: copy.ubicacion,
      estado: copy.estado
    }))
  };
}

export async function syncSingleBook(idLibro: number): Promise<void> {
  const doc = await buildBookDocument(idLibro);
  const db = await getMongoDb();
  if (!doc) {
    await db.collection('libros').deleteOne({ relationalId: idLibro });
    return;
  }
  await db.collection('libros').replaceOne({ relationalId: idLibro }, doc, { upsert: true });
}

export async function syncMongoFromMysql() {
  const db = await getMongoDb();

  const [bookIds] = await mysqlPool.query<RowDataPacket[]>('SELECT id_libro FROM libro ORDER BY id_libro');
  const bookDocs = [];
  for (const row of bookIds) {
    const doc = await buildBookDocument(row.id_libro);
    if (doc) bookDocs.push(doc);
  }

  const [users] = await mysqlPool.query<RowDataPacket[]>(`
    SELECT id_usuario, nombre, apellido, correo, telefono, fecha_registro, estado
    FROM usuario
    ORDER BY id_usuario
  `);
  const userDocs = users.map((u) => ({
    relationalId: u.id_usuario,
    nombre: u.nombre,
    apellido: u.apellido,
    correo: u.correo,
    telefono: u.telefono,
    fechaRegistro: u.fecha_registro,
    estado: u.estado
  }));

  const [loans] = await mysqlPool.query<RowDataPacket[]>(`
    SELECT p.id_prestamo, p.fecha_prestamo, p.estado,
           u.id_usuario, u.nombre, u.apellido, u.correo
    FROM prestamo p
    JOIN usuario u ON u.id_usuario = p.id_usuario
    ORDER BY p.id_prestamo
  `);

  const loanDocs = [];
  for (const loan of loans) {
    const [details] = await mysqlPool.query<RowDataPacket[]>(`
      SELECT dp.id_detalle, dp.id_ejemplar, dp.fecha_limite, dp.fecha_devolucion, dp.estado,
             ej.codigo_inventario, l.id_libro, l.titulo
      FROM detalle_prestamo dp
      JOIN ejemplar ej ON ej.id_ejemplar = dp.id_ejemplar
      JOIN libro l ON l.id_libro = ej.id_libro
      WHERE dp.id_prestamo = ?
      ORDER BY dp.id_detalle
    `, [loan.id_prestamo]);

    loanDocs.push({
      relationalId: loan.id_prestamo,
      usuario: {
        idUsuario: loan.id_usuario,
        nombre: loan.nombre,
        apellido: loan.apellido,
        correo: loan.correo
      },
      fechaPrestamo: loan.fecha_prestamo,
      estado: loan.estado,
      detalles: details.map((d) => ({
        idDetalle: d.id_detalle,
        idEjemplar: d.id_ejemplar,
        codigoInventario: d.codigo_inventario,
        libro: {
          idLibro: d.id_libro,
          titulo: d.titulo
        },
        fechaLimite: d.fecha_limite,
        fechaDevolucion: d.fecha_devolucion,
        estado: d.estado
      }))
    });
  }

  await Promise.all([
    db.collection('libros').deleteMany({}),
    db.collection('usuarios').deleteMany({}),
    db.collection('prestamos').deleteMany({})
  ]);

  if (bookDocs.length) await db.collection('libros').insertMany(bookDocs);
  if (userDocs.length) await db.collection('usuarios').insertMany(userDocs);
  if (loanDocs.length) await db.collection('prestamos').insertMany(loanDocs);

  await Promise.all([
    db.collection('libros').createIndex({ relationalId: 1 }, { unique: true }),
    db.collection('libros').createIndex({ titulo: 1 }),
    db.collection('libros').createIndex({ 'categoria.nombre': 1 }),
    db.collection('usuarios').createIndex({ relationalId: 1 }, { unique: true }),
    db.collection('usuarios').createIndex({ correo: 1 }, { unique: true }),
    db.collection('prestamos').createIndex({ relationalId: 1 }, { unique: true }),
    db.collection('prestamos').createIndex({ 'usuario.idUsuario': 1 })
  ]);

  return {
    books: bookDocs.length,
    users: userDocs.length,
    loans: loanDocs.length
  };
}
