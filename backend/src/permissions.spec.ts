import { RequestMethod, type Type } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { type Action, ACTIONS, can, type Resource } from '../../frontend/shared/permissions';
import { ROLES } from '../../frontend/shared/roles';
import { type AppRole, ROLES_KEY } from './common/decorators/roles.decorator';
import { ProductsController } from './products/products.controller';
import { UsersController } from './users/users.controller';

// Recursos de la política del frontend que tienen controlador en el backend
const RESOURCES: [Resource, Type][] = [
  ['products', ProductsController],
  ['users', UsersController],
];

// Acción de la política que corresponde a cada ruta REST del recurso
function actionOf(method: RequestMethod, path: string): Action {
  if (method === RequestMethod.GET) return path === ':id' ? 'view_details' : 'view';
  if (method === RequestMethod.POST) return 'create';
  if (method === RequestMethod.PATCH) return 'edit';
  if (method === RequestMethod.DELETE) return 'delete';
  throw new Error(`Ruta sin acción en la política: ${RequestMethod[method]} ${path}`);
}

/** Roles que el backend acepta en cada acción; una acción sin ruta no la acepta para nadie. */
function backendRoles(controller: Type): Map<Action, AppRole[]> {
  const classRoles = Reflect.getMetadata(ROLES_KEY, controller) as AppRole[] | undefined;
  const prototype = controller.prototype as Record<string, unknown>;
  const rules = new Map<Action, AppRole[]>();

  for (const name of Object.getOwnPropertyNames(prototype)) {
    const handler = prototype[name];
    if (name === 'constructor' || typeof handler !== 'function' || !Reflect.hasMetadata(PATH_METADATA, handler)) {
      continue;
    }
    const action = actionOf(
      Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod,
      Reflect.getMetadata(PATH_METADATA, handler) as string,
    );
    // Igual que RolesGuard: el método manda sobre la clase y sin @Roles basta con estar autenticado
    const roles = (Reflect.getMetadata(ROLES_KEY, handler) as AppRole[] | undefined) ?? classRoles ?? [...ROLES];
    rules.set(action, [...roles].sort());
  }
  return rules;
}

// frontend/shared/permissions.ts decide qué muestra la interfaz; @Roles decide qué acepta la API
describe.each(RESOURCES)('permissions for %s', (resource, controller) => {
  const rules = backendRoles(controller);

  it.each(ACTIONS)('%s: the frontend policy matches @Roles', (action) => {
    const allowedByFrontend = ROLES.filter((role) => can(role, resource, action)).sort();
    expect(allowedByFrontend).toEqual(rules.get(action) ?? []);
  });
});
