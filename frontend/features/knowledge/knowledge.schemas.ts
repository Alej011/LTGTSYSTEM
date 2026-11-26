/**
 * Modelo de la base de conocimientos. El backend tiene una tabla mínima (knowledge_articles) sin estos campos,
 * así que los tipos se escriben aquí; cuando exista el módulo real pasan a salir de ApiSchemas con matchesContract.
 * Visibilidad: docs/roles-y-permisos.md (sección 2, HU-K01 a HU-K03).
 */
import { z } from 'zod';

export const ARTICLE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export const ARTICLE_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'PROCEDURES', 'FAQ'] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
export type Rating = 'HELPFUL' | 'NOT_HELPFUL';

export type Person = { id: string; name: string };

// Fechas como texto ISO, igual que en el JSON del backend
export type Article = {
  id: string;
  title: string;
  summary: string;
  /** Markdown */
  content: string;
  category: ArticleCategory;
  tags: string[];
  status: ArticleStatus;
  author: Person | null;
  /** Toda la empresa, o solo los departamentos de departmentIds. Hasta la fase I todo es de toda la empresa. */
  isCompanyWide: boolean;
  departmentIds: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  /** Valoración del usuario actual, o null si no valoró. */
  myRating: Rating | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type ArticleFilters = {
  search?: string;
  category?: ArticleCategory;
  /** published: lo que se lee en "Explorar". all: todos los estados, para quien gestiona artículos. */
  scope?: 'published' | 'all';
};

export const ArticleFormSchema = z.object({
  title: z.string().trim().min(1, 'Ingresa el título del artículo'),
  summary: z.string().trim().min(1, 'Escribe un resumen'),
  content: z.string().trim().min(1, 'Escribe el contenido'),
  category: z.enum(ARTICLE_CATEGORIES, 'Selecciona una categoría'),
  status: z.enum(ARTICLE_STATUSES),
  tags: z.array(z.string().trim().min(1)),
  isCompanyWide: z.boolean(),
  departmentIds: z.array(z.string().min(1)),
});

export type ArticleInput = z.infer<typeof ArticleFormSchema>;
