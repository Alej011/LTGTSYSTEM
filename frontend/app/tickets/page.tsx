"use client"

import { useState } from "react"
import { TicketList } from "@/components/tickets/ticket-list"
import { TicketForm } from "@/components/tickets/ticket-form"
import { TicketDetail } from "@/components/tickets/ticket-detail"
import type { Ticket } from "@/lib/tickets"

type View = "list" | "form" | "detail"

export default function TicketsPage() {
  const [view, setView] = useState<View>("list")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>(undefined)

  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setView("detail")
  }

  const handleAdd = () => {
    setView("form")
  }

  const handleSuccess = () => {
    setView("list")
  }

  const handleCancel = () => {
    setView("list")
  }

  const handleBack = () => {
    setView("list")
    setSelectedTicket(undefined)
  }

  const handleUpdate = () => {
    // Refresh the ticket list
    setView("list")
    setSelectedTicket(undefined)
  }

  return (
    <div className="p-6">
      {view === "list" && <TicketList onView={handleView} onAdd={handleAdd} />}
      {view === "form" && <TicketForm onSuccess={handleSuccess} onCancel={handleCancel} />}
      {view === "detail" && selectedTicket && (
        <TicketDetail ticket={selectedTicket} onBack={handleBack} onUpdate={handleUpdate} />
      )}
    </div>
  )
}
