export type CommunicationType = "anuncio" | "politica" | "evento" | "urgente" | "general"
export type CommunicationStatus = "draft" | "published" | "archived"

export interface Communication {
  id: string
  title: string
  content: string
  type: CommunicationType
  status: CommunicationStatus
  targetDepartments: string[]
  targetRoles: string[]
  authorId: string
  authorName: string
  authorRole: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  expiresAt?: Date
  isPinned: boolean
  attachments?: string[]
}

export interface CommunicationRead {
  id: string
  communicationId: string
  userId: string
  readAt: Date
}

export interface NotificationPreference {
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  departmentUpdates: boolean
  urgentOnly: boolean
}

// Mock data - In production, this would be a real database
export const mockCommunications: Communication[] = [
  {
    id: "1",
    title: "Nueva Política de Trabajo Remoto",
    content: `# Nueva Política de Trabajo Remoto

## Vigencia
A partir del 1 de abril de 2024, entra en vigencia la nueva política de trabajo remoto para todos los empleados de LTGT S.A.

## Modalidades Disponibles
- **Trabajo Híbrido**: 3 días presencial, 2 días remoto
- **Trabajo Remoto Completo**: Solo para roles específicos previa aprobación
- **Trabajo Presencial**: Roles que requieren presencia física

## Requisitos para Trabajo Remoto
1. Conexión a internet estable (mínimo 50 Mbps)
2. Espacio de trabajo adecuado
3. Disponibilidad durante horario laboral
4. Cumplimiento de objetivos mensuales

## Proceso de Solicitud
1. Completar formulario de solicitud
2. Aprobación del supervisor directo
3. Evaluación de RR.HH.
4. Período de prueba de 30 días

## Herramientas Proporcionadas
- Laptop corporativa
- Software de comunicación
- Acceso VPN
- Soporte técnico remoto

Para más información, contactar a Recursos Humanos.`,
    type: "politica",
    status: "published",
    targetDepartments: ["Todos"],
    targetRoles: ["empleado", "admin"],
    authorId: "1",
    authorName: "Administrador Sistema",
    authorRole: "admin",
    createdAt: new Date("2024-03-15T10:00:00"),
    updatedAt: new Date("2024-03-15T10:00:00"),
    publishedAt: new Date("2024-03-15T10:00:00"),
    expiresAt: new Date("2024-06-15T23:59:59"),
    isPinned: true,
  },
  {
    id: "2",
    title: "Mantenimiento Programado del Sistema",
    content: `# Mantenimiento Programado del Sistema

## Fecha y Hora
**Sábado 23 de marzo, 2024**
**Horario: 2:00 AM - 6:00 AM**

## Sistemas Afectados
- Sistema de gestión de productos
- Correo electrónico corporativo
- Acceso a servidores internos
- Red WiFi corporativa

## Servicios Disponibles
- Teléfonos corporativos
- Internet por cable ethernet
- Sistemas de emergencia

## Preparativos Necesarios
1. Guardar todo el trabajo antes de las 1:30 AM
2. Cerrar sesión en todos los sistemas
3. Descargar archivos importantes localmente
4. Informar a clientes sobre posibles interrupciones

## Contacto de Emergencia
Durante el mantenimiento, contactar al técnico de guardia:
- Juan Pérez: +502 1234-5678
- Email: emergencias@ltgt.com

El sistema estará completamente operativo el sábado a las 6:00 AM.`,
    type: "anuncio",
    status: "published",
    targetDepartments: ["Todos"],
    targetRoles: ["empleado", "admin"],
    authorId: "2",
    authorName: "Juan Pérez",
    authorRole: "empleado",
    createdAt: new Date("2024-03-20T14:30:00"),
    updatedAt: new Date("2024-03-20T14:30:00"),
    publishedAt: new Date("2024-03-20T14:30:00"),
    expiresAt: new Date("2024-03-24T06:00:00"),
    isPinned: true,
  },
  {
    id: "3",
    title: "Celebración Aniversario de la Empresa",
    content: `# 15° Aniversario de LTGT S.A.

## Invitación Especial
Nos complace invitar a todo el equipo de LTGT S.A. a celebrar nuestro 15° aniversario.

## Detalles del Evento
- **Fecha**: Viernes 5 de abril, 2024
- **Hora**: 6:00 PM - 10:00 PM
- **Lugar**: Salón de Eventos "El Jardín"
- **Dirección**: 5ta Avenida 12-34, Zona 10

## Programa del Evento
- 6:00 PM - Recepción y cóctel
- 7:00 PM - Cena buffet
- 8:00 PM - Reconocimientos y premios
- 9:00 PM - Música y baile

## Confirmación de Asistencia
Por favor confirmar asistencia antes del 1 de abril:
- Email: eventos@ltgt.com
- Teléfono: 2234-5678
- Formulario interno en el sistema

## Código de Vestimenta
Formal elegante (traje o vestido)

¡Esperamos celebrar juntos este importante logro!`,
    type: "evento",
    status: "published",
    targetDepartments: ["Todos"],
    targetRoles: ["empleado", "admin"],
    authorId: "1",
    authorName: "Administrador Sistema",
    authorRole: "admin",
    createdAt: new Date("2024-03-18T09:15:00"),
    updatedAt: new Date("2024-03-18T09:15:00"),
    publishedAt: new Date("2024-03-18T09:15:00"),
    expiresAt: new Date("2024-04-06T23:59:59"),
    isPinned: false,
  },
  {
    id: "4",
    title: "Actualización de Procedimientos de Seguridad",
    content: `# Actualización de Procedimientos de Seguridad

## Nuevas Medidas de Seguridad
Efectivo inmediatamente, se implementan las siguientes medidas:

## Acceso a Instalaciones
1. **Tarjeta de identificación obligatoria** en todo momento
2. **Registro de visitantes** en recepción
3. **Acompañamiento** de personal autorizado para visitantes
4. **Horarios de acceso**: 6:00 AM - 8:00 PM

## Seguridad Digital
1. **Cambio de contraseñas** cada 90 días
2. **Autenticación de dos factores** obligatoria
3. **Prohibido** compartir credenciales
4. **Reportar** actividades sospechosas inmediatamente

## Procedimientos de Emergencia
1. **Punto de encuentro**: Parqueo principal
2. **Responsables de evacuación** por piso
3. **Simulacros mensuales** primer viernes del mes
4. **Números de emergencia** actualizados

## Capacitación Obligatoria
Todos los empleados deben completar:
- Curso de seguridad digital (online)
- Simulacro de evacuación
- Certificación antes del 30 de marzo

## Contacto
Preguntas sobre seguridad: seguridad@ltgt.com`,
    type: "urgente",
    status: "published",
    targetDepartments: ["Todos"],
    targetRoles: ["empleado", "admin"],
    authorId: "1",
    authorName: "Administrador Sistema",
    authorRole: "admin",
    createdAt: new Date("2024-03-19T16:45:00"),
    updatedAt: new Date("2024-03-19T16:45:00"),
    publishedAt: new Date("2024-03-19T16:45:00"),
    isPinned: true,
  },
]

export const mockReadStatus: CommunicationRead[] = [
  {
    id: "1",
    communicationId: "1",
    userId: "5",
    readAt: new Date("2024-03-15T11:30:00"),
  },
  {
    id: "2",
    communicationId: "2",
    userId: "5",
    readAt: new Date("2024-03-20T15:00:00"),
  },
]

export const getCommunications = (userId?: string, userRole?: string, userDepartment?: string): Communication[] => {
  let filtered = mockCommunications.filter((comm) => comm.status === "published")

  // Filter by user role and department if provided
  if (userId && userRole && userDepartment) {
    filtered = filtered.filter((comm) => {
      const matchesRole = comm.targetRoles.length === 0 || comm.targetRoles.includes(userRole)
      const matchesDepartment =
        comm.targetDepartments.includes("Todos") || comm.targetDepartments.includes(userDepartment)
      return matchesRole && matchesDepartment
    })
  }

  // Sort by pinned first, then by date
  return filtered.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return b.publishedAt!.getTime() - a.publishedAt!.getTime()
  })
}

export const getAllCommunications = (): Communication[] => {
  return mockCommunications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export const getCommunicationById = (id: string): Communication | undefined => {
  return mockCommunications.find((comm) => comm.id === id)
}

export const createCommunication = async (
  commData: Omit<Communication, "id" | "createdAt" | "updatedAt">,
): Promise<Communication> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newCommunication: Communication = {
    ...commData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: commData.status === "published" ? new Date() : undefined,
  }

  mockCommunications.push(newCommunication)
  return newCommunication
}

export const updateCommunication = async (
  id: string,
  commData: Partial<Communication>,
): Promise<Communication | null> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockCommunications.findIndex((c) => c.id === id)
  if (index === -1) return null

  const wasPublished = mockCommunications[index].status === "published"
  const isNowPublished = commData.status === "published"

  mockCommunications[index] = {
    ...mockCommunications[index],
    ...commData,
    updatedAt: new Date(),
    publishedAt: !wasPublished && isNowPublished ? new Date() : mockCommunications[index].publishedAt,
  }

  return mockCommunications[index]
}

export const markAsRead = async (communicationId: string, userId: string): Promise<void> => {
  // Check if already read
  const existingRead = mockReadStatus.find((r) => r.communicationId === communicationId && r.userId === userId)
  if (existingRead) return

  // Add read status
  const newRead: CommunicationRead = {
    id: Date.now().toString(),
    communicationId,
    userId,
    readAt: new Date(),
  }

  mockReadStatus.push(newRead)
}

export const isRead = (communicationId: string, userId: string): boolean => {
  return mockReadStatus.some((r) => r.communicationId === communicationId && r.userId === userId)
}

export const getUnreadCount = (userId: string, userRole: string, userDepartment: string): number => {
  const userCommunications = getCommunications(userId, userRole, userDepartment)
  return userCommunications.filter((comm) => !isRead(comm.id, userId)).length
}

export const getTypeLabel = (type: CommunicationType): string => {
  const labels = {
    anuncio: "Anuncio",
    politica: "Política",
    evento: "Evento",
    urgente: "Urgente",
    general: "General",
  }
  return labels[type]
}

export const getTypeColor = (type: CommunicationType): string => {
  const colors = {
    anuncio: "text-blue-600 bg-blue-50",
    politica: "text-purple-600 bg-purple-50",
    evento: "text-green-600 bg-green-50",
    urgente: "text-red-600 bg-red-50",
    general: "text-gray-600 bg-gray-50",
  }
  return colors[type]
}
