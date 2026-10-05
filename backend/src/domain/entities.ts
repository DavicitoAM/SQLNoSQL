export type EstadoUsuario = 'ACTIVO' | 'SUSPENDIDO' | 'INACTIVO';
export type EstadoEjemplar = 'DISPONIBLE' | 'PRESTADO' | 'MANTENIMIENTO' | 'PERDIDO';
export type EstadoPrestamo = 'ACTIVO' | 'FINALIZADO' | 'VENCIDO';
export type EstadoDetalle = 'PRESTADO' | 'DEVUELTO' | 'VENCIDO';

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  fechaRegistro: string;
  estado: EstadoUsuario;
}

export interface Editorial {
  idEditorial: number;
  nombre: string;
  pais?: string;
}

export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
}

export interface Autor {
  idAutor: number;
  nombre: string;
  apellido: string;
  nacionalidad?: string;
}

export interface Libro {
  idLibro: number;
  isbn: string;
  titulo: string;
  anioPublicacion: number;
  idioma: string;
  descripcion?: string;
  idEditorial: number;
  idCategoria: number;
}

export interface LibroAutor {
  idLibro: number;
  idAutor: number;
}

export interface Ejemplar {
  idEjemplar: number;
  codigoInventario: string;
  idLibro: number;
  ubicacion: string;
  estado: EstadoEjemplar;
}

export interface Prestamo {
  idPrestamo: number;
  idUsuario: number;
  fechaPrestamo: string;
  estado: EstadoPrestamo;
}

export interface DetallePrestamo {
  idDetalle: number;
  idPrestamo: number;
  idEjemplar: number;
  fechaLimite: string;
  fechaDevolucion?: string | null;
  estado: EstadoDetalle;
}

export interface LibroDocumento {
  relationalId: number;
  isbn: string;
  titulo: string;
  anioPublicacion: number;
  idioma: string;
  descripcion?: string | null;
  editorial: Editorial;
  categoria: Categoria;
  autores: Autor[];
  ejemplares: Array<Omit<Ejemplar, 'idLibro'>>;
}
