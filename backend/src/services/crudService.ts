import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { mysqlPool } from '../config/mysql.js';
import { getMongoDb } from '../config/mongodb.js';
import { buildBookDocument, syncSingleBook } from './mongoSyncService.js';
import { friendlyMysqlError } from '../utils/errors.js';

export interface BookInput {
  isbn: string;
  titulo: string;
  anioPublicacion: number;
  idioma: string;
  descripcion?: string;
  idEditorial: number;
  idCategoria: number;
  autorIds: number[];
}

function validateBook(input: BookInput) {
  if (!input.isbn?.trim() || !input.titulo?.trim()) throw new Error('ISBN y título son obligatorios.');
  if (!Number.isInteger(Number(input.anioPublicacion))) throw new Error('El año de publicación debe ser un número entero.');
  if (!Number(input.idEditorial) || !Number(input.idCategoria)) throw new Error('Selecciona editorial y categoría.');
  if (!Array.isArray(input.autorIds) || input.autorIds.length === 0) throw new Error('Selecciona al menos un autor.');
}


export async function getBookForEdit(idLibro: number) {
  const doc = await buildBookDocument(idLibro);
  if (!doc) throw new Error('No existe el libro solicitado.');
  return {
    idLibro: doc.relationalId,
    isbn: doc.isbn,
    titulo: doc.titulo,
    anioPublicacion: doc.anioPublicacion,
    idioma: doc.idioma,
    descripcion: doc.descripcion ?? '',
    idEditorial: doc.editorial.idEditorial,
    idCategoria: doc.categoria.idCategoria,
    autorIds: doc.autores.map((a) => a.idAutor)
  };
}

export async function getReferenceData() {
  const [[editorials], [categories], [authors]] = await Promise.all([
    mysqlPool.query<RowDataPacket[]>('SELECT id_editorial AS id, nombre, pais FROM editorial ORDER BY nombre'),
    mysqlPool.query<RowDataPacket[]>('SELECT id_categoria AS id, nombre FROM categoria ORDER BY nombre'),
    mysqlPool.query<RowDataPacket[]>("SELECT id_autor AS id, CONCAT(nombre, ' ', apellido) AS nombre FROM autor ORDER BY apellido, nombre")
  ]);
  return { editorials, categories, authors };
}

export async function createBook(input: BookInput) {
  validateBook(input);
  const connection = await mysqlPool.getConnection();
  try {
    await connection.beginTransaction();
    const insertSql = `INSERT INTO libro (isbn, titulo, anio_publicacion, idioma, descripcion, id_editorial, id_categoria)
VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await connection.execute<ResultSetHeader>(insertSql, [
      input.isbn.trim(), input.titulo.trim(), input.anioPublicacion, input.idioma?.trim() || 'Español',
      input.descripcion?.trim() || null, input.idEditorial, input.idCategoria
    ]);
    const idLibro = result.insertId;

    const relationSql = 'INSERT INTO libro_autor (id_libro, id_autor) VALUES (?, ?)';
    for (const authorId of [...new Set(input.autorIds.map(Number))]) {
      await connection.execute(relationSql, [idLibro, authorId]);
    }
    await connection.commit();
    await syncSingleBook(idLibro);

    const db = await getMongoDb();
    const mongoDoc = await db.collection('libros').findOne({ relationalId: idLibro }, { projection: { _id: 0 } });

    return {
      idLibro,
      mysql: {
        query: `${insertSql};\n${relationSql}; -- repetido por cada autor`,
        result: { insertedId: idLibro, authorRelations: input.autorIds.length }
      },
      mongodb: {
        query: `db.libros.replaceOne({ relationalId: ${idLibro} }, <documento embebido>, { upsert: true })`,
        result: mongoDoc
      },
      reading: 'MySQL crea la fila del libro y después sus relaciones en libro_autor. MongoDB guarda la ficha bibliográfica completa como un documento con autores embebidos.'
    };
  } catch (error) {
    await connection.rollback();
    throw new Error(friendlyMysqlError(error));
  } finally {
    connection.release();
  }
}

export async function updateBook(idLibro: number, input: BookInput) {
  validateBook(input);
  const connection = await mysqlPool.getConnection();
  try {
    await connection.beginTransaction();
    const updateSql = `UPDATE libro
SET isbn = ?, titulo = ?, anio_publicacion = ?, idioma = ?, descripcion = ?, id_editorial = ?, id_categoria = ?
WHERE id_libro = ?`;
    const [result] = await connection.execute<ResultSetHeader>(updateSql, [
      input.isbn.trim(), input.titulo.trim(), input.anioPublicacion, input.idioma?.trim() || 'Español',
      input.descripcion?.trim() || null, input.idEditorial, input.idCategoria, idLibro
    ]);
    if (result.affectedRows === 0) throw new Error('No existe el libro solicitado.');

    await connection.execute('DELETE FROM libro_autor WHERE id_libro = ?', [idLibro]);
    for (const authorId of [...new Set(input.autorIds.map(Number))]) {
      await connection.execute('INSERT INTO libro_autor (id_libro, id_autor) VALUES (?, ?)', [idLibro, authorId]);
    }
    await connection.commit();
    await syncSingleBook(idLibro);

    return {
      idLibro,
      mysql: {
        query: `${updateSql};\nDELETE FROM libro_autor WHERE id_libro = ${idLibro};\nINSERT INTO libro_autor (...) VALUES (...);`,
        result: { affectedRows: result.affectedRows }
      },
      mongodb: {
        query: `db.libros.replaceOne({ relationalId: ${idLibro} }, <documento actualizado>, { upsert: true })`,
        result: { synchronized: true }
      },
      reading: 'Modificar las relaciones N:M requiere actualizar libro_autor en MySQL; en MongoDB se sustituye el agregado documental de la ficha.'
    };
  } catch (error) {
    await connection.rollback();
    throw new Error(friendlyMysqlError(error));
  } finally {
    connection.release();
  }
}

export async function deleteBook(idLibro: number) {
  const connection = await mysqlPool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM libro_autor WHERE id_libro = ?', [idLibro]);
    const [result] = await connection.execute<ResultSetHeader>('DELETE FROM libro WHERE id_libro = ?', [idLibro]);
    if (result.affectedRows === 0) throw new Error('No existe el libro solicitado.');
    await connection.commit();

    const db = await getMongoDb();
    const mongoResult = await db.collection('libros').deleteOne({ relationalId: idLibro });

    return {
      mysql: {
        query: `DELETE FROM libro_autor WHERE id_libro = ${idLibro};\nDELETE FROM libro WHERE id_libro = ${idLibro};`,
        result: { deletedRows: result.affectedRows }
      },
      mongodb: {
        query: `db.libros.deleteOne({ relationalId: ${idLibro} })`,
        result: { deletedDocuments: mongoResult.deletedCount }
      },
      reading: 'Las claves foráneas pueden impedir borrar un libro con ejemplares o historial relacionado. MongoDB no tiene esas FK; la aplicación decide mantener la consistencia entre motores.'
    };
  } catch (error) {
    await connection.rollback();
    throw new Error(friendlyMysqlError(error));
  } finally {
    connection.release();
  }
}
