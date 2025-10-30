"use client"

import { useState } from "react"
import { CommunicationList } from "@/components/communications/communication-list"
import { CommunicationForm } from "@/components/communications/communication-form"
import { CommunicationViewer } from "@/components/communications/communication-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Communication } from "@/lib/communications"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"

type View = "browse" | "manage" | "form" | "view"

export default function CommunicationsPage() {
  const { user } = useAuth()
  const [view, setView] = useState<View>("browse")
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | undefined>(undefined)
  const [editingCommunication, setEditingCommunication] = useState<Communication | undefined>(undefined)

  const handleView = (communication: Communication) => {
    setSelectedCommunication(communication)
    setView("view")
  }

  const handleEdit = (communication: Communication) => {
    setEditingCommunication(communication)
    setView("form")
  }

  const handleAdd = () => {
    setEditingCommunication(undefined)
    setView("form")
  }

  const handleSuccess = () => {
    setView("browse")
    setEditingCommunication(undefined)
  }

  const handleCancel = () => {
    setView("browse")
    setEditingCommunication(undefined)
  }

  const handleBack = () => {
    setView("browse")
    setSelectedCommunication(undefined)
  }

  const canManageCommunications =
    hasPermission(user?.role || "empleado", "communications") && user?.role === "admin"

  if (view === "form") {
    return (
      <div className="p-6">
        <CommunicationForm communication={editingCommunication} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    )
  }

  if (view === "view" && selectedCommunication) {
    return (
      <div className="p-6">
        <CommunicationViewer communication={selectedCommunication} onBack={handleBack} />
      </div>
    )
  }

  return (
    <div className="p-6">
      {canManageCommunications ? (
        <Tabs value={view} onValueChange={(value) => setView(value as View)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Ver Comunicaciones</TabsTrigger>
            <TabsTrigger value="manage">Gestionar</TabsTrigger>
          </TabsList>
          <TabsContent value="browse">
            <CommunicationList onView={handleView} />
          </TabsContent>
          <TabsContent value="manage">
            <CommunicationList onView={handleView} onEdit={handleEdit} onAdd={handleAdd} showManagement={true} />
          </TabsContent>
        </Tabs>
      ) : (
        <CommunicationList onView={handleView} />
      )}
    </div>
  )
}
