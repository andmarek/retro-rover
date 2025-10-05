"use client"

import { useState } from "react"
import type { RetroCard as RetroCardType } from "./RetroCard"
import { RetroCard } from "./RetroCard"
import { RetroInput } from "./RetroInput"
import { cn } from "@/lib/utils"

export type ColumnType = "went-well" | "to-improve" | "action-items"

type RetroColumnProps = {
  title: string
  description: string
  columnType: ColumnType
  cards: RetroCardType[]
  onAddCard: (columnType: ColumnType, content: string) => void
  onDeleteCard: (columnType: ColumnType, cardId: string) => void
  onVoteCard: (columnType: ColumnType, cardId: string) => void
  accentColor: "primary" | "accent" | "destructive"
}

export function RetroColumn({
  title,
  description,
  columnType,
  cards,
  onAddCard,
  onDeleteCard,
  onVoteCard,
  accentColor,
}: RetroColumnProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddCard = (content: string) => {
    onAddCard(columnType, content)
    setIsAdding(false)
  }

  const accentClasses = {
    primary: "border-primary/20 bg-primary/5",
    accent: "border-accent/20 bg-accent/5",
    destructive: "border-destructive/20 bg-destructive/5",
  }

  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className={cn("mb-4 rounded-xl border-2 p-4 transition-colors", accentClasses[accentColor])}>
        <h2 className="text-balance text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Cards Container */}
      <div className="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
        {cards.length === 0 && !isAdding && (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No cards yet. Add one to get started!</p>
          </div>
        )}

        {cards
          .sort((a, b) => b.votes - a.votes)
          .map((card) => (
            <RetroCard
              key={card.id}
              card={card}
              onDelete={() => onDeleteCard(columnType, card.id)}
              onVote={() => onVoteCard(columnType, card.id)}
            />
          ))}

        {isAdding && (
          <RetroInput
            onSubmit={handleAddCard}
            onCancel={() => setIsAdding(false)}
            placeholder="Enter your thoughts..."
          />
        )}

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="group mt-2 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/10 transition-colors group-hover:bg-primary/20">
              <span className="text-xs">+</span>
            </span>
            Add Card
          </button>
        )}
      </div>
    </div>
  )
}
