export type TicketStatus = "abierto" | "en_progreso" | "resuelto" | "cerrado"
export type TicketPriority = "baja" | "media" | "alta" | "critica"
export type TicketCategory = "hardware" | "software" | "red" | "acceso" | "otro"

export interface Ticket {
  id: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  createdBy: string
  createdByName: string
  assignedTo?: string
  assignedToName?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  solution?: string
}

export interface TicketComment {
  id: string
  ticketId: string
  userId: string
  userName: string
  userRole: string
  comment: string
  isInternal: boolean
  createdAt: Date
}

// Mock data - In production, this would be a real database
export const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "No puedo acceder al sistema de correo",
    description: "Desde esta mañana no puedo iniciar sesión en Outlook. Me aparece un error de credenciales.",
    category: "software",
    priority: "alta",
    status: "abierto",
    createdBy: "5",
    createdByName: "Ana López",
    createdAt: new Date("2024-03-10T09:30:00"),
    updatedAt: new Date("2024-03-10T09:30:00"),
  },
  {
    id: "2",
    title: "Impresora no funciona en el departamento de ventas",
    description: "La impresora Canon del segundo piso no responde. Las luces están encendidas pero no imprime.",
    category: "hardware",
    priority: "media",
    status: "en_progreso",
    createdBy: "5",
    createdByName: "Ana López",
    assignedTo: "2",
    assignedToName: "Juan Pérez",
    createdAt: new Date("2024-03-09T14:15:00"),
    updatedAt: new Date("2024-03-10T08:00:00"),
  },
  {
    id: "3",
    title: "Internet lento en toda la oficina",
    description: "Desde ayer la conexión a internet está muy lenta. Afecta el trabajo de todo el equipo.",
    category: "red",
    priority: "critica",
    status: "resuelto",
    createdBy: "4",
    createdByName: "Carlos Rodríguez",
    assignedTo: "2",
    assignedToName: "Juan Pérez",
    createdAt: new Date("2024-03-08T11:00:00"),
    updatedAt: new Date("2024-03-09T16:30:00"),
    resolvedAt: new Date("2024-03-09T16:30:00"),
    solution: "Se reinició el router principal y se optimizó la configuración de ancho de banda.",
  },
]

export const mockComments: TicketComment[] = [
  {
    id: "1",
    ticketId: "2",
    userId: "2",
    userName: "Juan Pérez",
    userRole: "empleado",
    comment: "He revisado la impresora. Parece ser un problema de conectividad. Voy a revisar los cables.",
    isInternal: false,
    createdAt: new Date("2024-03-10T08:00:00"),
  },
  {
    id: "2",
    ticketId: "3",
    userId: "2",
    userName: "Juan Pérez",
    userRole: "empleado",
    comment: "Problema resuelto. Se reinició el router y se optimizó la configuración.",
    isInternal: false,
    createdAt: new Date("2024-03-09T16:30:00"),
  },
]

export const createTicket = async (
  ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status">,
): Promise<Ticket> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newTicket: Ticket = {
    ...ticketData,
    id: Date.now().toString(),
    status: "abierto",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  mockTickets.push(newTicket)
  return newTicket
}

export const updateTicket = async (id: string, ticketData: Partial<Ticket>): Promise<Ticket | null> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockTickets.findIndex((t) => t.id === id)
  if (index === -1) return null

  mockTickets[index] = {
    ...mockTickets[index],
    ...ticketData,
    updatedAt: new Date(),
    resolvedAt: ticketData.status === "resuelto" ? new Date() : mockTickets[index].resolvedAt,
  }

  return mockTickets[index]
}

export const getTickets = (): Ticket[] => {
  return mockTickets
}

export const getTicketById = (id: string): Ticket | undefined => {
  return mockTickets.find((t) => t.id === id)
}

export const getTicketComments = (ticketId: string): TicketComment[] => {
  return mockComments.filter((c) => c.ticketId === ticketId)
}

export const addComment = async (commentData: Omit<TicketComment, "id" | "createdAt">): Promise<TicketComment> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const newComment: TicketComment = {
    ...commentData,
    id: Date.now().toString(),
    createdAt: new Date(),
  }

  mockComments.push(newComment)
  return newComment
}

export const getPriorityColor = (priority: TicketPriority): string => {
  const colors = {
    baja: "text-green-600 bg-green-50",
    media: "text-yellow-600 bg-yellow-50",
    alta: "text-orange-600 bg-orange-50",
    critica: "text-red-600 bg-red-50",
  }
  return colors[priority]
}

export const getStatusColor = (status: TicketStatus): string => {
  const colors = {
    abierto: "text-blue-600 bg-blue-50",
    en_progreso: "text-yellow-600 bg-yellow-50",
    resuelto: "text-green-600 bg-green-50",
    cerrado: "text-gray-600 bg-gray-50",
  }
  return colors[status]
}

export const getCategoryLabel = (category: TicketCategory): string => {
  const labels = {
    hardware: "Hardware",
    software: "Software",
    red: "Red/Conectividad",
    acceso: "Acceso/Permisos",
    otro: "Otro",
  }
  return labels[category]
}
