"use client"

import { useState } from "react"
import { UserList } from "@/components/users/user-list"
import { UserForm } from "@/components/users/user-form"
import type { User } from "@/lib/users"

export default function UsersPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setView("form")
  }

  const handleAdd = () => {
    setEditingUser(undefined)
    setView("form")
  }

  const handleSuccess = () => {
    setView("list")
    setEditingUser(undefined)
  }

  const handleCancel = () => {
    setView("list")
    setEditingUser(undefined)
  }

  return (
    <div className="p-6">
      {view === "list" ? (
        <UserList onEdit={handleEdit} onAdd={handleAdd} />
      ) : (
        <UserForm user={editingUser} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </div>
  )
}
