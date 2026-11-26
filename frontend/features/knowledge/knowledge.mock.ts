/**
 * Adaptador en memoria de la base de conocimientos: se comporta como lo hará el BFF (asíncrono, fechas ISO,
 * errores como ApiClientError) y aplica las mismas reglas de visibilidad. Los datos viven mientras la página no se
 * recargue. Cuando exista el módulo real, knowledge.client.ts cambia este adaptador y los componentes no cambian.
 */
import { ApiClientError } from '@/shared/api/api-client';
import { can } from '@/shared/permissions';

import { canSeeArticle, managesArticles, type Viewer } from './knowledge.rules';
import type { Article, ArticleFilters, ArticleInput, Rating } from './knowledge.schemas';

// Sin espera en los tests; en desarrollo imita la latencia de la red para que se vean los estados de carga
const LATENCY_MS = process.env.NODE_ENV === 'test' ? 0 : 250;

// Artículo guardado: sin myRating, que depende de quién pregunta
type StoredArticle = Omit<Article, 'myRating'>;

type State = {
  articles: StoredArticle[];
  ratings: Map<string, Rating>;
  viewedBy: Set<string>;
  nextId: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString();
const key = (articleId: string, userId: string) => `${articleId}:${userId}`;

function seed(): State {
  const juan = { id: 'mock-juan', name: 'Juan Pérez' };
  const laura = { id: 'mock-laura', name: 'Laura Méndez' };
  const everyone = { isCompanyWide: true, departmentIds: [] };

  const articles: StoredArticle[] = [
    {
      ...everyone,
      id: 'kb-1',
      title: 'Cómo reiniciar el router de la oficina',
      summary: 'Pasos para reiniciar correctamente el router principal cuando hay problemas de conectividad.',
      content: [
        '# Reinicio del router principal',
        '',
        '## Cuándo hacerlo',
        'Cuando la conexión a internet está lenta o no funciona.',
        '',
        '## Pasos',
        '1. Ubica el router principal en el cuarto de servidores.',
        '2. Desconecta el cable de alimentación durante 30 segundos.',
        '3. Vuelve a conectarlo y espera 2 a 3 minutos.',
        '4. Verifica que las luces estén en verde.',
        '',
        '## Si el problema persiste',
        'Abre un ticket en Soporte Técnico con la categoría Red/Conectividad.',
      ].join('\n'),
      category: 'NETWORK',
      tags: ['router', 'internet', 'conectividad'],
      status: 'PUBLISHED',
      author: juan,
      views: 45,
      helpful: 12,
      notHelpful: 1,
      createdAt: ago(30),
      updatedAt: ago(30),
      publishedAt: ago(30),
    },
    {
      ...everyone,
      id: 'kb-2',
      title: 'Configurar el correo corporativo en Outlook',
      summary: 'Guía para configurar el correo de la empresa en Microsoft Outlook.',
      content: [
        '# Correo corporativo en Outlook',
        '',
        '## Pasos',
        '1. Abre Outlook y ve a **Archivo > Agregar cuenta**.',
        '2. Escribe tu correo de la empresa y elige **IMAP**.',
        '3. Servidor entrante: `mail.ltgt.com`, puerto `993`, SSL/TLS.',
        '4. Servidor saliente: `mail.ltgt.com`, puerto `587`, STARTTLS.',
        '',
        '## Problemas comunes',
        '- **Error de autenticación:** revisa usuario y contraseña.',
        '- **No envía correos:** revisa la configuración del servidor saliente.',
      ].join('\n'),
      category: 'SOFTWARE',
      tags: ['outlook', 'correo', 'configuracion'],
      status: 'PUBLISHED',
      author: juan,
      views: 78,
      helpful: 25,
      notHelpful: 3,
      createdAt: ago(40),
      updatedAt: ago(20),
      publishedAt: ago(40),
    },
    {
      ...everyone,
      id: 'kb-3',
      title: 'La impresora no imprime',
      summary: 'Soluciones para los problemas más comunes de las impresoras de la oficina.',
      content: [
        '# La impresora no imprime',
        '',
        '1. Revisa que esté encendida y conectada a la red.',
        '2. Apágala 30 segundos y vuelve a encenderla.',
        '3. Verifica que sea tu impresora predeterminada.',
        '4. Cancela los trabajos atascados en la cola de impresión.',
      ].join('\n'),
      category: 'HARDWARE',
      tags: ['impresora', 'cola de impresion'],
      status: 'PUBLISHED',
      author: juan,
      views: 32,
      helpful: 8,
      notHelpful: 0,
      createdAt: ago(25),
      updatedAt: ago(25),
      publishedAt: ago(25),
    },
    {
      ...everyone,
      id: 'kb-4',
      title: 'Política de contraseñas',
      summary: 'Requisitos y cada cuánto cambiar la contraseña de las cuentas de la empresa.',
      content: [
        '# Política de contraseñas',
        '',
        '- Mínimo 12 caracteres.',
        '- Cambio cada 90 días.',
        '- No reutilizar las últimas 5.',
      ].join('\n'),
      category: 'PROCEDURES',
      tags: ['seguridad', 'contraseñas'],
      status: 'DRAFT',
      author: laura,
      views: 0,
      helpful: 0,
      notHelpful: 0,
      createdAt: ago(2),
      updatedAt: ago(1),
      publishedAt: null,
    },
  ];

  return { articles, ratings: new Map(), viewedBy: new Set(), nextId: 5 };
}

let state = seed();

/** Vuelve a los datos iniciales. Para los tests. */
export function resetKnowledgeMock(): void {
  state = seed();
}

const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
const now = () => new Date().toISOString();

function present(article: StoredArticle, viewer: Viewer): Article {
  return structuredClone({ ...article, myRating: state.ratings.get(key(article.id, viewer.id)) ?? null });
}

// Un artículo que el usuario no puede ver responde 404, igual que uno que no existe: no se revela que existe
function findVisible(id: string, viewer: Viewer): StoredArticle {
  const article = state.articles.find((a) => a.id === id);
  if (!article || !canSeeArticle(article, viewer)) {
    throw new ApiClientError('El artículo no existe', 404);
  }
  return article;
}

function matches(article: StoredArticle, filters: ArticleFilters): boolean {
  if (filters.category && article.category !== filters.category) return false;
  const search = filters.search?.trim().toLowerCase();
  if (!search) return true;
  return [article.title, article.summary, article.content, ...article.tags].some((text) =>
    text.toLowerCase().includes(search),
  );
}

export const knowledgeMock = {
  /** Publicados: los más vistos primero. Todos los estados: los editados más recientemente primero. */
  async list(filters: ArticleFilters, viewer: Viewer): Promise<Article[]> {
    await delay();
    const all = filters.scope === 'all';
    if (all && !managesArticles(viewer)) throw new ApiClientError('Sin permiso', 403);
    return state.articles
      .filter((a) => (all || a.status === 'PUBLISHED') && canSeeArticle(a, viewer))
      .filter((a) => matches(a, filters))
      .sort((a, b) => (all ? b.updatedAt.localeCompare(a.updatedAt) : b.views - a.views))
      .map((a) => present(a, viewer));
  },

  /** Detalle; cuenta una vista por usuario, como hará el backend al leer el artículo. */
  async get(id: string, viewer: Viewer): Promise<Article> {
    await delay();
    const article = findVisible(id, viewer);
    const viewKey = key(id, viewer.id);
    if (article.status === 'PUBLISHED' && !state.viewedBy.has(viewKey)) {
      state.viewedBy.add(viewKey);
      article.views += 1;
    }
    return present(article, viewer);
  },

  /** Crea si no recibe id; si lo recibe, actualiza. La primera publicación registra publishedAt. */
  async save(input: ArticleInput, viewer: Viewer, id?: string): Promise<Article> {
    await delay();
    const at = now();
    if (id) {
      if (!can(viewer.role, 'knowledge', 'edit')) throw new ApiClientError('Sin permiso', 403);
      const article = findVisible(id, viewer);
      const publishedAt = article.publishedAt ?? (input.status === 'PUBLISHED' ? at : null);
      Object.assign(article, { ...input, publishedAt, updatedAt: at });
      return present(article, viewer);
    }
    if (!can(viewer.role, 'knowledge', 'create')) throw new ApiClientError('Sin permiso', 403);
    const article: StoredArticle = {
      ...input,
      id: `kb-${state.nextId++}`,
      author: { id: viewer.id, name: viewer.name },
      views: 0,
      helpful: 0,
      notHelpful: 0,
      createdAt: at,
      updatedAt: at,
      publishedAt: input.status === 'PUBLISHED' ? at : null,
    };
    state.articles.push(article);
    return present(article, viewer);
  },

  /** Una valoración por usuario: valorar de nuevo reemplaza la anterior. */
  async rate(id: string, rating: Rating, viewer: Viewer): Promise<Article> {
    await delay();
    const article = findVisible(id, viewer);
    if (article.status !== 'PUBLISHED') throw new ApiClientError('Solo se valoran artículos publicados', 409);
    const ratingKey = key(id, viewer.id);
    const previous = state.ratings.get(ratingKey);
    if (previous === 'HELPFUL') article.helpful -= 1;
    if (previous === 'NOT_HELPFUL') article.notHelpful -= 1;
    if (rating === 'HELPFUL') article.helpful += 1;
    else article.notHelpful += 1;
    state.ratings.set(ratingKey, rating);
    return present(article, viewer);
  },
};
