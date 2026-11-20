/** Mensaje de validación bajo un campo; fieldErrorProps lo enlaza al input para el lector de pantalla. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function fieldErrorProps(id: string, message?: string) {
  return message ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {};
}

/** Primer mensaje por campo de un error de Zod. `rename` reubica el error de un campo en otro del formulario. */
export function fieldErrorsOf<K extends string>(
  issues: { path: PropertyKey[]; message: string }[],
  rename: Partial<Record<string, K>> = {},
): Partial<Record<K, string>> {
  const errors: Partial<Record<K, string>> = {};
  for (const issue of issues) {
    const field = String(issue.path[0]);
    errors[rename[field] ?? (field as K)] ??= issue.message;
  }
  return errors;
}
