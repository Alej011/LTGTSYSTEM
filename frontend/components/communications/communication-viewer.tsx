"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { type Communication, getTypeLabel, getTypeColor, markAsRead } from "@/lib/features/communications/communications.service"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Clock, User, Users, Pin, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import ReactMarkdown from "react-markdown"

interface CommunicationViewerProps {
  communication: Communication
  onBack: () => void
}

export function CommunicationViewer({ communication, onBack }: CommunicationViewerProps) {
  const { user } = useAuth()

  useEffect(() => {
    // Mark as read when viewing
    if (user) {
      markAsRead(communication.id, user.id)
    }
  }, [communication.id, user])

  const getTypeBadge = () => (
    <Badge variant="outline" className={getTypeColor(communication.type)}>
      {getTypeLabel(communication.type)}
    </Badge>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {communication.isPinned && <Pin className="h-5 w-5 text-primary" />}
            <h1 className="text-3xl font-bold text-balance">{communication.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {getTypeBadge()}
            {communication.type === "urgente" && <Badge variant="destructive">Urgente</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 ml-6 list-disc text-foreground">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal text-foreground">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
                    ),
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  }}
                >
                  {communication.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Comunicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <div className="mt-1">{getTypeBadge()}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Autor</label>
                <p className="mt-1 flex items-center text-sm">
                  <User className="h-3 w-3 mr-1" />
                  {communication.authorName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{communication.authorRole}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Dirigido a</label>
                <p className="mt-1 flex items-center text-sm">
                  <Users className="h-3 w-3 mr-1" />
                  {communication.targetDepartments.join(", ")}
                </p>
                {communication.targetRoles.length > 0 && (
                  <p className="text-xs text-muted-foreground">Roles: {communication.targetRoles.join(", ")}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Publicado</label>
                <p className="mt-1 flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(communication.publishedAt || communication.createdAt, "PPP 'a las' p", { locale: es })}
                </p>
              </div>

              {communication.updatedAt.getTime() !== communication.createdAt.getTime() && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Actualizado</label>
                  <p className="mt-1 flex items-center text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(communication.updatedAt, "PPP 'a las' p", { locale: es })}
                  </p>
                </div>
              )}

              {communication.expiresAt && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expira</label>
                    <p className="mt-1 flex items-center text-sm text-orange-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(communication.expiresAt, "PPP 'a las' p", { locale: es })}
                    </p>
                  </div>
                </>
              )}

              {communication.isPinned && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Pin className="h-4 w-4" />
                    <span className="font-medium">Comunicación fijada</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
