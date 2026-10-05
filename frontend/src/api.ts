const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `Error HTTP ${response.status}`);
  }
  return data as T;
}

export const api = {
  health: () => request<Record<string, any>>('/health'),
  models: () => request<any>('/models'),
  operations: () => request<any[]>('/compare/operations'),
  compare: (operation: string, params: Record<string, string>) => request<any>('/compare/query', {
    method: 'POST',
    body: JSON.stringify({ operation, params })
  }),
  referenceData: () => request<any>('/crud/reference-data'),
  getBook: (id: number) => request<any>(`/crud/books/${id}`),
  createBook: (payload: any) => request<any>('/crud/books', {
    method: 'POST', body: JSON.stringify(payload)
  }),
  updateBook: (id: number, payload: any) => request<any>(`/crud/books/${id}`, {
    method: 'PUT', body: JSON.stringify(payload)
  }),
  deleteBook: (id: number) => request<any>(`/crud/books/${id}`, { method: 'DELETE' }),
  syncMongo: () => request<any>('/crud/sync-mongo', { method: 'POST' })
};
