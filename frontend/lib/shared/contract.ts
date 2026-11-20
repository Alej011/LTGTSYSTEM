/**
 * Contrato con el backend. Los tipos salen de backend/openapi.json (`pnpm openapi` en backend y frontend);
 * no se escriben a mano.
 */
import type { z } from 'zod';

import type { components, paths } from './api-schema';

export type ApiSchemas = components['schemas'];
export type ApiPaths = paths;

type SameShape<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? [Exclude<keyof A, keyof B>] extends [never]
      ? true
      : false
    : false
  : false;

type ContractMismatch<Validated, Contract> = { 'el schema no coincide con el contrato': [Validated, Contract] };

/**
 * Devuelve el mismo schema. No compila si lo que valida no coincide con el tipo del contrato:
 * falta o sobra un campo, cambia un tipo o cambia si admite null u omitirse.
 */
export function matchesContract<Contract>() {
  return <S extends z.ZodType>(
    schema: S & (SameShape<z.output<S>, Contract> extends true ? unknown : ContractMismatch<z.output<S>, Contract>),
  ): S => schema;
}
