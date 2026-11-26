---
status: accepted
---

# Roles dinámicos con alcance por departamento y un Administrador de sistema

Los roles dejan de ser un enum en el código y pasan a ser datos: el cliente puede crear roles y elegir sus permisos sin migraciones ni despliegues. El área de trabajo no se codifica en el rol: el usuario tiene un rol (qué puede hacer) y un departamento (dónde), y cada permiso lleva un alcance (`OWN`, `DEPARTMENT`, `ALL`). Así un mismo rol, como Manager, sirve para todas las áreas y se evita tener un rol por cada combinación de área y nivel. El rol Administrador es de sistema: tiene todos los permisos de forma implícita, no se puede editar ni borrar y siempre debe existir al menos uno activo.

## Considered Options

- **Mantener el enum y agregar valores** (`REQUESTER`, `MANAGER`...): simple, pero cada rol nuevo exige migración, cambio de contrato y despliegue, y no permite que el cliente cree roles.
- **Roles por área y nivel** (`VENTAS_JEFE`, `RRHH_MIEMBRO`...): explosión de roles (áreas × niveles) y permisos repetidos entre ellos.
- **Permisos por usuario**: máxima flexibilidad, pero imposible de auditar a medida que crece la empresa.

## Consequences

- El contrato cambia una vez (`role` pasa de enum a `{ id, name }` y la sesión incluye los permisos); después, crear roles no lo cambia.
- La autorización se aplica en dos lugares: el guard decide si hay permiso y el servicio filtra los datos según el alcance.
- Un cambio de permisos llega al usuario cuando se renueva su sesión (máximo 15 minutos).
- Una sola empresa: si aparecen sucursales se agrega el alcance `BRANCH`, sin rediseñar el modelo.

Detalle e historias de usuario: `docs/roles-y-permisos.md`.
