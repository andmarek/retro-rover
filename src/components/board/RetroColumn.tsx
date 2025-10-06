"use client"

import { useState } from "react"
import type { RetroCard as RetroCardType } from "./RetroCard"
import { RetroCard } from "./RetroCard"
import { RetroInput } from "./RetroInput"
import { cn } from "@/lib/utils"
import { useDroppable, useDraggable } from "@dnd-kit/core"

export type ColumnType = "went-well" | "to-improve" | "action-items"

type RetroColumnProps = {
  title: string
  description: string
  columnType: ColumnType
  cards: RetroCardType[]
  onAddCard: (columnType: ColumnType, content: string) => void
  onDeleteCard: (columnType: ColumnType, cardId: string) => void
  onVoteCard: (columnType: ColumnType, cardId: string) => void
  accentColor: "primary" | "accent" | "destructive" | "success"
  lastAddedCardId?: string | null
}

function DraggableCard({ 
  card, 
  columnType,
  onDelete, 
  onVote,
  isNew
}: { 
  card: RetroCardType
  columnType: ColumnType
  onDelete: () => void
  onVote: () => void
  isNew?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${card.id}`,
    data: {
      cardId: card.id,
      columnType,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={isNew ? "animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out" : ""}
    >
      <RetroCard card={card} onDelete={onDelete} onVote={onVote} />
    </div>
  )
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
  lastAddedCardId,
}: RetroColumnProps) {
  const [isAdding, setIsAdding] = useState(false)

  const { setNodeRef } = useDroppable({
    id: `column-${columnType}`,
    data: {
      columnType,
    },
  })

  const handleAddCard = (content: string) => {
    console.log("HandleAddCard");
    onAddCard(columnType, content)
    setIsAdding(false)
  }

  const accentClasses = {
    primary: "border-primary/20 bg-primary/5",
    accent: "border-accent/20 bg-accent/5",
    destructive: "border-destructive/20 bg-destructive/5",
    success: "border-green-500/20 bg-green-500/5",
  }

  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className={cn("mb-4 rounded-xl border-2 p-4 transition-colors", accentClasses[accentColor])}>
        <h2 className="text-balance text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Cards Container */}
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
        {cards.length === 0 && !isAdding && (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No cards yet. Add one to get started!</p>
          </div>
        )}

        {cards
          .sort((a, b) => b.votes - a.votes)
          .map((card) => (
            <DraggableCard
              key={card.id}
              card={card}
              columnType={columnType}
              onDelete={() => onDeleteCard(columnType, card.id)}
              onVote={() => onVoteCard(columnType, card.id)}
              isNew={card.id === lastAddedCardId}
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
