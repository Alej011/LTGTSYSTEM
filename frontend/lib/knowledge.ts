export type ArticleStatus = "draft" | "published" | "archived"
export type ArticleCategory = "hardware" | "software" | "red" | "acceso" | "procedimientos" | "faq"

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  summary: string
  category: ArticleCategory
  tags: string[]
  status: ArticleStatus
  authorId: string
  authorName: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  views: number
  helpful: number
  notHelpful: number
  relatedTicketId?: string
}

export interface ArticleRating {
  id: string
  articleId: string
  userId: string
  isHelpful: boolean
  createdAt: Date
}

// Mock data - In production, this would be a real database
export const mockArticles: KnowledgeArticle[] = [
  {
    id: "1",
    title: "Cómo reiniciar el router de la oficina",
    content: `# Reinicio del Router Principal

## Problema
Cuando la conexión a internet está lenta o no funciona correctamente.

## Solución
1. Localizar el router principal en el cuarto de servidores
2. Desconectar el cable de alimentación por 30 segundos
3. Volver a conectar el cable de alimentación
4. Esperar 2-3 minutos para que se establezca la conexión
5. Verificar que las luces estén en verde

## Prevención
- Revisar el router semanalmente
- Mantener el área ventilada
- No desconectar durante horas pico

## Contacto
Si el problema persiste, contactar al departamento de IT.`,
    summary: "Pasos para reiniciar correctamente el router principal cuando hay problemas de conectividad.",
    category: "red",
    tags: ["router", "internet", "conectividad", "reinicio"],
    status: "published",
    authorId: "2",
    authorName: "Juan Pérez",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
    publishedAt: new Date("2024-03-01"),
    views: 45,
    helpful: 12,
    notHelpful: 1,
    relatedTicketId: "3",
  },
  {
    id: "2",
    title: "Configuración de correo en Outlook",
    content: `# Configuración de Correo Corporativo en Outlook

## Requisitos
- Microsoft Outlook instalado
- Credenciales de correo corporativo
- Conexión a internet

## Pasos de Configuración

### 1. Abrir Outlook
- Iniciar Microsoft Outlook
- Si es la primera vez, se abrirá el asistente de configuración

### 2. Agregar Cuenta
1. Ir a Archivo > Agregar Cuenta
2. Seleccionar "Configuración manual o tipos de servidor adicionales"
3. Elegir "POP o IMAP"

### 3. Configuración del Servidor
**Servidor de correo entrante (IMAP):**
- Servidor: mail.ltgt.com
- Puerto: 993
- Cifrado: SSL/TLS

**Servidor de correo saliente (SMTP):**
- Servidor: mail.ltgt.com
- Puerto: 587
- Cifrado: STARTTLS

### 4. Autenticación
- Usuario: su.email@ltgt.com
- Contraseña: su contraseña corporativa

### 5. Prueba de Configuración
- Hacer clic en "Probar configuración de cuenta"
- Verificar que ambas pruebas sean exitosas

## Problemas Comunes
- **Error de autenticación**: Verificar usuario y contraseña
- **No se conecta**: Revisar configuración de firewall
- **Correos no se envían**: Verificar configuración SMTP`,
    summary: "Guía completa para configurar el correo corporativo en Microsoft Outlook.",
    category: "software",
    tags: ["outlook", "correo", "email", "configuracion"],
    status: "published",
    authorId: "2",
    authorName: "Juan Pérez",
    createdAt: new Date("2024-02-28"),
    updatedAt: new Date("2024-03-05"),
    publishedAt: new Date("2024-02-28"),
    views: 78,
    helpful: 25,
    notHelpful: 3,
  },
  {
    id: "3",
    title: "Solución de problemas de impresora Canon",
    content: `# Troubleshooting Impresora Canon PIXMA

## Problemas Comunes y Soluciones

### 1. La impresora no responde
**Síntomas:** Las luces están encendidas pero no imprime
**Solución:**
1. Verificar conexión USB o WiFi
2. Reiniciar la impresora (apagar 30 segundos)
3. Verificar que esté seleccionada como impresora predeterminada
4. Revisar cola de impresión

### 2. Calidad de impresión deficiente
**Síntomas:** Texto borroso, líneas faltantes
**Solución:**
1. Ejecutar limpieza de cabezales desde el panel
2. Verificar niveles de tinta
3. Usar papel de calidad adecuada
4. Ajustar configuración de calidad en el driver

### 3. Atasco de papel
**Síntomas:** Error de papel atascado
**Solución:**
1. Apagar la impresora
2. Abrir todas las cubiertas
3. Retirar cuidadosamente el papel atascado
4. Verificar que no queden restos
5. Cerrar cubiertas y encender

### 4. Error de conexión WiFi
**Síntomas:** No se encuentra la impresora en red
**Solución:**
1. Verificar que esté conectada a la red correcta
2. Reiniciar router y impresora
3. Reconfigurar conexión WiFi desde el panel
4. Reinstalar driver si es necesario

## Mantenimiento Preventivo
- Limpieza mensual de cabezales
- Verificar niveles de tinta semanalmente
- Mantener área libre de polvo`,
    summary: "Soluciones para los problemas más comunes de las impresoras Canon PIXMA.",
    category: "hardware",
    tags: ["impresora", "canon", "pixma", "troubleshooting"],
    status: "published",
    authorId: "2",
    authorName: "Juan Pérez",
    createdAt: new Date("2024-03-02"),
    updatedAt: new Date("2024-03-02"),
    publishedAt: new Date("2024-03-02"),
    views: 32,
    helpful: 8,
    notHelpful: 0,
    relatedTicketId: "2",
  },
  {
    id: "4",
    title: "Procedimiento de respaldo de datos",
    content: `# Procedimiento de Respaldo de Datos

## Frecuencia
- Respaldo diario automático: 2:00 AM
- Respaldo manual: Según necesidad
- Verificación semanal: Viernes 6:00 PM

## Datos a Respaldar
1. Base de datos de productos
2. Documentos corporativos
3. Correos electrónicos
4. Configuraciones de sistema
5. Archivos de usuario

## Proceso Automático
El sistema ejecuta automáticamente:
1. Compresión de datos
2. Cifrado de archivos
3. Transferencia a servidor de respaldo
4. Verificación de integridad
5. Notificación de estado

## Proceso Manual
Para respaldos adicionales:
1. Acceder al panel de administración
2. Seleccionar "Respaldo Manual"
3. Elegir datos específicos
4. Configurar destino
5. Iniciar proceso
6. Verificar completitud

## Restauración
En caso de pérdida de datos:
1. Identificar fecha del respaldo
2. Acceder al sistema de restauración
3. Seleccionar archivos específicos
4. Confirmar restauración
5. Verificar integridad de datos

## Contacto de Emergencia
Para problemas críticos de datos:
- IT Manager: ext. 101
- Administrador de Sistema: ext. 102`,
    summary: "Procedimientos estándar para respaldo y restauración de datos corporativos.",
    category: "procedimientos",
    tags: ["respaldo", "backup", "datos", "procedimiento"],
    status: "published",
    authorId: "1",
    authorName: "Administrador Sistema",
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-02-25"),
    publishedAt: new Date("2024-02-25"),
    views: 15,
    helpful: 5,
    notHelpful: 0,
  },
]

export const mockRatings: ArticleRating[] = [
  { id: "1", articleId: "1", userId: "3", isHelpful: true, createdAt: new Date() },
  { id: "2", articleId: "1", userId: "4", isHelpful: true, createdAt: new Date() },
  { id: "3", articleId: "2", userId: "5", isHelpful: true, createdAt: new Date() },
]

export const getArticles = (status?: ArticleStatus): KnowledgeArticle[] => {
  if (status) {
    return mockArticles.filter((article) => article.status === status)
  }
  return mockArticles
}

export const getArticleById = (id: string): KnowledgeArticle | undefined => {
  return mockArticles.find((article) => article.id === id)
}

export const searchArticles = (query: string, category?: ArticleCategory): KnowledgeArticle[] => {
  let filtered = mockArticles.filter((article) => article.status === "published")

  if (query) {
    const searchTerm = query.toLowerCase()
    filtered = filtered.filter(
      (article) =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.summary.toLowerCase().includes(searchTerm) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
    )
  }

  if (category) {
    filtered = filtered.filter((article) => article.category === category)
  }

  return filtered.sort((a, b) => b.views - a.views)
}

export const createArticle = async (
  articleData: Omit<KnowledgeArticle, "id" | "createdAt" | "updatedAt" | "views" | "helpful" | "notHelpful">,
): Promise<KnowledgeArticle> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newArticle: KnowledgeArticle = {
    ...articleData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: articleData.status === "published" ? new Date() : undefined,
    views: 0,
    helpful: 0,
    notHelpful: 0,
  }

  mockArticles.push(newArticle)
  return newArticle
}

export const updateArticle = async (
  id: string,
  articleData: Partial<KnowledgeArticle>,
): Promise<KnowledgeArticle | null> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockArticles.findIndex((a) => a.id === id)
  if (index === -1) return null

  const wasPublished = mockArticles[index].status === "published"
  const isNowPublished = articleData.status === "published"

  mockArticles[index] = {
    ...mockArticles[index],
    ...articleData,
    updatedAt: new Date(),
    publishedAt: !wasPublished && isNowPublished ? new Date() : mockArticles[index].publishedAt,
  }

  return mockArticles[index]
}

export const incrementViews = async (id: string): Promise<void> => {
  const article = mockArticles.find((a) => a.id === id)
  if (article) {
    article.views += 1
  }
}

export const rateArticle = async (articleId: string, userId: string, isHelpful: boolean): Promise<void> => {
  // Remove existing rating from this user
  const existingRatingIndex = mockRatings.findIndex((r) => r.articleId === articleId && r.userId === userId)
  if (existingRatingIndex !== -1) {
    const existingRating = mockRatings[existingRatingIndex]
    const article = mockArticles.find((a) => a.id === articleId)
    if (article) {
      if (existingRating.isHelpful) {
        article.helpful -= 1
      } else {
        article.notHelpful -= 1
      }
    }
    mockRatings.splice(existingRatingIndex, 1)
  }

  // Add new rating
  const newRating: ArticleRating = {
    id: Date.now().toString(),
    articleId,
    userId,
    isHelpful,
    createdAt: new Date(),
  }

  mockRatings.push(newRating)

  // Update article counters
  const article = mockArticles.find((a) => a.id === articleId)
  if (article) {
    if (isHelpful) {
      article.helpful += 1
    } else {
      article.notHelpful += 1
    }
  }
}

export const getCategoryLabel = (category: ArticleCategory): string => {
  const labels = {
    hardware: "Hardware",
    software: "Software",
    red: "Red/Conectividad",
    acceso: "Acceso/Permisos",
    procedimientos: "Procedimientos",
    faq: "Preguntas Frecuentes",
  }
  return labels[category]
}

export const getStatusLabel = (status: ArticleStatus): string => {
  const labels = {
    draft: "Borrador",
    published: "Publicado",
    archived: "Archivado",
  }
  return labels[status]
}
