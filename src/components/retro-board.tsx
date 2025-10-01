"use client"

import { useState } from "react"
import { RetroColumn } from "./retro-column"
import { Button } from "./ui/button"
import { Download, Share2 } from "lucide-react"

export type RetroCard = {
  id: string
  content: string
  votes: number
  author?: string
}

export type ColumnType = "went-well" | "to-improve" | "action-items"

export function RetroBoard() {
  const [columns, setColumns] = useState<Record<ColumnType, RetroCard[]>>({
    "went-well": [],
    "to-improve": [],
    "action-items": [],
  })

  const addCard = (columnType: ColumnType, content: string) => {
    const newCard: RetroCard = {
      id: Date.now().toString(),
      content,
      votes: 0,
    }
    setColumns((prev) => ({
      ...prev,
      [columnType]: [...prev[columnType], newCard],
    }))
  }

  const deleteCard = (columnType: ColumnType, cardId: string) => {
    setColumns((prev) => ({
      ...prev,
      [columnType]: prev[columnType].filter((card) => card.id !== cardId),
    }))
  }

  const voteCard = (columnType: ColumnType, cardId: string) => {
    setColumns((prev) => ({
      ...prev,
      [columnType]: prev[columnType].map((card) => (card.id === cardId ? { ...card, votes: card.votes + 1 } : card)),
    }))
  }

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Sprint Retrospective</h1>
              <p className="mt-2 text-pretty text-muted-foreground">
                Reflect on what went well, what to improve, and plan action items for the next sprint.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Columns Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <RetroColumn
            title="What Went Well"
            description="Celebrate successes and positive outcomes"
            columnType="went-well"
            cards={columns["went-well"]}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onVoteCard={voteCard}
            accentColor="accent"
          />
          <RetroColumn
            title="To Improve"
            description="Identify challenges and areas for growth"
            columnType="to-improve"
            cards={columns["to-improve"]}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onVoteCard={voteCard}
            accentColor="destructive"
          />
          <RetroColumn
            title="Action Items"
            description="Concrete steps for the next sprint"
            columnType="action-items"
            cards={columns["action-items"]}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onVoteCard={voteCard}
            accentColor="primary"
          />
        </div>
      </div>
    </div>
  )
}
