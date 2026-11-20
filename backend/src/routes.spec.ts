import { RequestMethod, type Type } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { AuthController } from './auth/auth.controller';
import { BrandsController } from './brands/brands.controller';
import { CategoriesController } from './categories/categories.controller';
import { HealthController } from './health/health.controller';
import { ProductsController } from './products/products.controller';
import { UsersController } from './users/users.controller';

const CONTROLLERS: Type[] = [
  AuthController,
  BrandsController,
  CategoriesController,
  HealthController,
  ProductsController,
  UsersController,
];

function joinPath(...parts: string[]): string {
  return '/' + parts.filter((part) => part && part !== '/').join('/');
}

function routeTable(): string[] {
  return CONTROLLERS.flatMap((controller) => {
    const base = Reflect.getMetadata(PATH_METADATA, controller) as string;
    const prototype = controller.prototype as Record<string, unknown>;
    return Object.getOwnPropertyNames(prototype)
      .filter((name) => name !== 'constructor')
      .map((name) => prototype[name])
      .filter(
        (handler): handler is object => typeof handler === 'function' && Reflect.hasMetadata(PATH_METADATA, handler),
      )
      .map((handler) => {
        const method = RequestMethod[Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod];
        return `${method} ${joinPath(base, Reflect.getMetadata(PATH_METADATA, handler) as string)}`;
      });
  }).sort();
}

// The BFF and the browser use these same paths under /api; a change here must be mirrored in frontend/app/api
describe('HTTP routes', () => {
  it('expose resources with REST paths', () => {
    expect(routeTable()).toEqual(
      [
        'POST /auth/login',
        'POST /auth/refresh',
        'POST /auth/logout',
        'GET /auth/me',
        'GET /brands',
        'GET /brands/:id',
        'GET /categories',
        'GET /categories/:id',
        'GET /health',
        'GET /products',
        'POST /products',
        'GET /products/:id',
        'PATCH /products/:id',
        'DELETE /products/:id',
        'GET /users',
        'POST /users',
        'GET /users/:id',
        'PATCH /users/:id',
      ].sort(),
    );
  });
});
