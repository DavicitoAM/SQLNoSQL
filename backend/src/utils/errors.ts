export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function friendlyMysqlError(error: unknown): string {
  const anyError = error as { code?: string; message?: string };
  if (anyError.code === 'ER_ROW_IS_REFERENCED_2') {
    return 'MySQL bloqueó la eliminación porque el registro todavía tiene datos relacionados mediante una clave foránea.';
  }
  if (anyError.code === 'ER_DUP_ENTRY') {
    return 'MySQL rechazó la operación porque un valor UNIQUE ya existe.';
  }
  return anyError.message ?? errorMessage(error);
}
