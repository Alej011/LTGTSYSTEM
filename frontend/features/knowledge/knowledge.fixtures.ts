import type { Viewer } from './knowledge.rules';
import type { Article, ArticleInput } from './knowledge.schemas';

export const admin: Viewer = { id: 'u-admin', name: 'Laura Admin', role: 'ADMIN' };
export const agent: Viewer = { id: 'u-agent', name: 'Luis Soporte', role: 'SUPPORT' };

export function article(overrides: Partial<Article> = {}): Article {
  return {
    id: 'a1',
    title: 'Reiniciar el router',
    summary: 'Pasos básicos',
    content: '# Reiniciar',
    category: 'NETWORK',
    tags: ['router'],
    status: 'PUBLISHED',
    author: { id: 'someone', name: 'Juan Pérez' },
    isCompanyWide: true,
    departmentIds: [],
    views: 0,
    helpful: 0,
    notHelpful: 0,
    myRating: null,
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
    publishedAt: '2026-11-20T10:00:00.000Z',
    ...overrides,
  };
}

export const input: ArticleInput = {
  title: 'Conectarse a la VPN',
  summary: 'Acceso remoto a la red de la empresa',
  content: '# VPN\n\n1. Abre el cliente.',
  category: 'NETWORK',
  status: 'PUBLISHED',
  tags: ['vpn'],
  isCompanyWide: true,
  departmentIds: [],
};
