import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { matchesContract } from './contract';

type Contract = { id: string; note: string | null; tags?: string[] };
const matches = matchesContract<Contract>();

// Los casos inválidos se comprueban al compilar: si el helper dejara de rechazarlos, @ts-expect-error falla en typecheck
describe('matchesContract', () => {
  it('returns the schema when it validates exactly the contract shape', () => {
    const schema = z.object({ id: z.string(), note: z.string().nullable(), tags: z.array(z.string()).optional() });
    expect(matches(schema)).toBe(schema);
  });

  it('rejects schemas that differ from the contract', () => {
    // @ts-expect-error falta un campo del contrato
    matches(z.object({ id: z.string(), tags: z.array(z.string()).optional() }));
    // @ts-expect-error sobra un campo que el contrato no tiene
    matches(z.object({ id: z.string(), note: z.string().nullable(), extra: z.string().optional() }));
    // @ts-expect-error cambia el tipo de un campo
    matches(z.object({ id: z.number(), note: z.string().nullable() }));
    // @ts-expect-error no admite el null que el contrato permite
    matches(z.object({ id: z.string(), note: z.string() }));
    // @ts-expect-error exige un campo que el contrato marca como opcional
    matches(z.object({ id: z.string(), note: z.string().nullable(), tags: z.array(z.string()) }));
  });
});
