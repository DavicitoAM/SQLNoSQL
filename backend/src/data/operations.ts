export type OperationId = 'allBooks' | 'bookByTitle' | 'booksByCategory' | 'availableCopies' | 'userLoans';

export const operations = [
  {
    id: 'allBooks',
    label: 'Catálogo completo con autores',
    description: 'Compara cómo se compone una ficha bibliográfica completa.',
    params: []
  },
  {
    id: 'bookByTitle',
    label: 'Buscar libro por título',
    description: 'Busca coincidencias de título y devuelve sus datos relacionados.',
    params: [{ name: 'title', label: 'Título', placeholder: 'Ej. principito' }]
  },
  {
    id: 'booksByCategory',
    label: 'Libros por categoría',
    description: 'Filtra el catálogo por clasificación temática.',
    params: [{ name: 'category', label: 'Categoría', placeholder: 'Ej. Novela' }]
  },
  {
    id: 'availableCopies',
    label: 'Ejemplares disponibles',
    description: 'Localiza copias físicas disponibles para préstamo.',
    params: []
  },
  {
    id: 'userLoans',
    label: 'Préstamos de un usuario',
    description: 'Reconstruye la operación de préstamo y sus ejemplares.',
    params: [{ name: 'user', label: 'Nombre o apellido', placeholder: 'Ej. David' }]
  }
] as const;
