# LTGTSYSTEM

Sistema interno de LTGT S.A. para gestionar el catálogo de productos, el soporte técnico, la base de conocimientos y las comunicaciones internas de una sola empresa.

## Acceso

**Rol**:
Conjunto de permisos que define qué puede hacer un usuario. Cada usuario tiene exactamente uno.
_Avoid_: Perfil, tipo de usuario

**Permiso**:
Autorización para realizar una acción sobre un recurso (por ejemplo, asignar tickets), siempre con un alcance.
_Avoid_: Privilegio, acceso

**Alcance**:
Sobre qué datos aplica un permiso: lo propio, lo del departamento del usuario o todo en la empresa.
_Avoid_: Nivel, ámbito

**Departamento**:
Área de la empresa a la que pertenece un usuario (Soporte, Marketing, Ventas...). Delimita el alcance de departamento.
_Avoid_: Área, equipo, sucursal

**Administrador**:
Rol de sistema con todos los permisos sobre toda la empresa; no se puede editar ni borrar y siempre existe al menos uno activo.
_Avoid_: Admin, superadmin, root

**Manager**:
Rol de jefe de departamento: gestiona el trabajo y las comunicaciones de su departamento.
_Avoid_: Jefe, supervisor, admin de área

**Member**:
Rol del empleado que trabaja con lo propio; en soporte, es quien reporta problemas.
_Avoid_: Empleado, usuario normal

**Viewer**:
Rol de solo lectura.
_Avoid_: Invitado, guest

**Agente de soporte**:
Usuario con permiso para atender tickets; es el único que puede ser asignado a uno.
_Avoid_: Técnico, support, soporte (como persona)

## Soporte

**Ticket**:
Solicitud de ayuda registrada por un solicitante y atendida por un agente de soporte.
_Avoid_: Caso, incidencia, reporte

**Solicitante**:
Usuario que abrió un ticket y es quien confirma su solución.
_Avoid_: Reportero, creador, cliente

**Asignado**:
Agente de soporte responsable de un ticket en un momento dado.
_Avoid_: Responsable, encargado

**Resuelto**:
Estado de un ticket con una solución registrada por el agente, pendiente de que el solicitante la confirme.
_Avoid_: Solucionado, terminado

**Cerrado**:
Estado final de un ticket: el solicitante confirmó la solución, pasaron 3 días corridos sin respuesta o un Administrador lo cerró. No se reabre.
_Avoid_: Finalizado, archivado

**Cierre automático**:
Cierre de un ticket Resuelto cuando el solicitante no responde en 3 días corridos.
_Avoid_: Autocierre, expiración

**Nota interna**:
Comentario de un ticket visible solo para quienes pueden atender tickets.
_Avoid_: Comentario privado

## Conocimiento

**Artículo**:
Solución o procedimiento publicado en la base de conocimientos.
_Avoid_: Documento, entrada, post

**Visibilidad**:
Departamentos que pueden leer un artículo, o toda la empresa; la elige su autor.
_Avoid_: Permisos del artículo, audiencia
