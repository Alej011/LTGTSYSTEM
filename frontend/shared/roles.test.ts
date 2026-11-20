import { describe, expect, it } from 'vitest';

import { roleLabel } from './roles';

describe('roleLabel', () => {
  it.each([
    ['ADMIN', 'Administrador'],
    ['SUPPORT', 'Soporte'],
  ])('shows %s as %s', (role, label) => {
    expect(roleLabel(role)).toBe(label);
  });

  it('shows an unknown role from mock data as it is', () => {
    expect(roleLabel('AUDITOR')).toBe('AUDITOR');
  });
});
