import { describe, expect, it } from 'vitest';

import { admin, agent, article } from './knowledge.fixtures';
import { canSeeArticle, managesArticles } from './knowledge.rules';

describe('canSeeArticle', () => {
  it.each([
    ['a published company-wide article', article(), true],
    ['a draft by someone else', article({ status: 'DRAFT' }), false],
    ['an archived article', article({ status: 'ARCHIVED' }), false],
    ['a draft of their own', article({ status: 'DRAFT', author: { id: agent.id, name: agent.name } }), true],
    ['an article only for other departments', article({ isCompanyWide: false, departmentIds: ['d-sales'] }), false],
  ] as const)('support staff and %s: %s', (_, a, visible) => {
    expect(canSeeArticle(a, agent)).toBe(visible);
  });

  it('shows articles for the viewer department', () => {
    const forSupport = article({ isCompanyWide: false, departmentIds: ['d-support'] });
    expect(canSeeArticle(forSupport, agent, 'd-support')).toBe(true);
  });

  it('shows everything to whoever manages articles', () => {
    expect(canSeeArticle(article({ status: 'DRAFT' }), admin)).toBe(true);
    expect(canSeeArticle(article({ isCompanyWide: false, departmentIds: ['d-sales'] }), admin)).toBe(true);
  });

  it('shows nothing without a session', () => {
    expect(canSeeArticle(article(), null)).toBe(false);
  });
});

describe('managesArticles', () => {
  it('is only for roles that edit knowledge', () => {
    expect(managesArticles(admin)).toBe(true);
    expect(managesArticles(agent)).toBe(false);
  });
});
