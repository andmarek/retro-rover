"use client"

import { useState } from "react"
import type { RetroCard as RetroCardType } from "./RetroCard"
import { RetroCard } from "./RetroCard"
import { RetroInput } from "./RetroInput"
import { cn } from "@/lib/utils"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"

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
  sortByVotes: boolean
}

function SortableCard({ 
  card, 
  columnType,
  onDelete, 
  onVote
}: { 
  card: RetroCardType
  columnType: ColumnType
  onDelete: () => void
  onVote: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: {
      cardId: card.id,
      columnType,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      style={style}
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
  sortByVotes,
}: RetroColumnProps) {
  const [isAdding, setIsAdding] = useState(false)

  const displayCards = sortByVotes ? [...cards].sort((a, b) => b.votes - a.votes) : cards

  const { setNodeRef, isOver } = useDroppable({
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
      <div 
        ref={setNodeRef} 
        className={cn(
          "flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 transition-colors duration-200",
          isOver && "bg-accent/20 border-accent/50 ring-2 ring-accent/30"
        )}
      >
        {cards.length === 0 && !isAdding && (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {isOver ? "Drop card here" : "No cards yet. Add one to get started!"}
            </p>
          </div>
        )}

        <SortableContext 
          items={displayCards.map(card => `card-${card.id}`)} 
          strategy={verticalListSortingStrategy}
        >
          {displayCards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              columnType={columnType}
              onDelete={() => onDeleteCard(columnType, card.id)}
              onVote={() => onVoteCard(columnType, card.id)}
            />
          ))}
        </SortableContext>
        
        {/* Drop zone indicator */}
        {isOver && cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 60 }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border-2 border-dashed border-accent/50 bg-accent/10 flex items-center justify-center"
          >
            <p className="text-xs text-muted-foreground">Drop here</p>
          </motion.div>
        )}

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
