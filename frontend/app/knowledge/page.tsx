"use client"

import { useState } from "react"
import { ArticleList } from "@/components/knowledge/article-list"
import { ArticleForm } from "@/components/knowledge/article-form"
import { ArticleViewer } from "@/components/knowledge/article-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { KnowledgeArticle } from "@/lib/features/knowledge/knowledge.service"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/features/auth/auth.service"

type View = "browse" | "manage" | "form" | "view"

export default function KnowledgePage() {
  const { user } = useAuth()
  const [view, setView] = useState<View>("browse")
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | undefined>(undefined)
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | undefined>(undefined)

  const handleView = (article: KnowledgeArticle) => {
    setSelectedArticle(article)
    setView("view")
  }

  const handleEdit = (article: KnowledgeArticle) => {
    setEditingArticle(article)
    setView("form")
  }

  const handleAdd = () => {
    setEditingArticle(undefined)
    setView("form")
  }

  const handleSuccess = () => {
    setView("browse")
    setEditingArticle(undefined)
  }

  const handleCancel = () => {
    setView("browse")
    setEditingArticle(undefined)
  }

  const handleBack = () => {
    setView("browse")
    setSelectedArticle(undefined)
  }

  const canManageKnowledge =
    hasPermission(user?.role || "empleado", "knowledge") && (user?.role === "empleado" || user?.role === "admin")

  if (view === "form") {
    return (
      <div className="p-6">
        <ArticleForm article={editingArticle} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    )
  }

  if (view === "view" && selectedArticle) {
    return (
      <div className="p-6">
        <ArticleViewer article={selectedArticle} onBack={handleBack} />
      </div>
    )
  }

  return (
    <div className="p-6">
      {canManageKnowledge ? (
        <Tabs value={view} onValueChange={(value) => setView(value as View)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Explorar</TabsTrigger>
            <TabsTrigger value="manage">Gestionar</TabsTrigger>
          </TabsList>
          <TabsContent value="browse">
            <ArticleList onView={handleView} />
          </TabsContent>
          <TabsContent value="manage">
            <ArticleList onView={handleView} onEdit={handleEdit} onAdd={handleAdd} showManagement={true} />
          </TabsContent>
        </Tabs>
      ) : (
        <ArticleList onView={handleView} />
      )}
    </div>
  )
}
