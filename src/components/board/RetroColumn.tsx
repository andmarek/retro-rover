"use client"

import { useState } from "react"
import type { RetroCard as RetroCardType } from "./RetroCard"
import { RetroCard } from "./RetroCard"
import { RetroInput } from "./RetroInput"
import { cn } from "@/lib/utils"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import { motion, AnimatePresence } from "framer-motion"

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

function DraggableCard({ 
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${card.id}`,
    data: {
      cardId: card.id,
      columnType,
    },
  })

  return (
    <motion.div
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      layout={!isDragging}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1,
        x: transform ? transform.x : 0,
        y: transform ? transform.y : 0,
        scale: isDragging ? 1.05 : 1,
        rotate: isDragging ? 2 : 0,
      }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ 
        opacity: { type: "spring", stiffness: 500, damping: 35, mass: 0.5 },
        scale: { type: "spring", stiffness: 500, damping: 35, mass: 0.5 },
        rotate: { type: "spring", stiffness: 500, damping: 35, mass: 0.5 },
        x: isDragging ? { type: "tween", duration: 0 } : { type: "spring", stiffness: 500, damping: 35, mass: 0.5 },
        y: isDragging ? { type: "tween", duration: 0 } : { type: "spring", stiffness: 500, damping: 35, mass: 0.5 },
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30
        }
      }}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
        zIndex: isDragging ? 9999 : 1,
        willChange: isDragging ? 'transform' : 'auto',
        isolation: isDragging ? 'isolate' : 'auto',
      }}
      className={isDragging ? 'shadow-2xl' : ''}
    >
      <RetroCard card={card} onDelete={onDelete} onVote={onVote} />
    </motion.div>
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
          "flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm transition-all duration-200",
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

        <AnimatePresence mode="popLayout">
          {displayCards.map((card) => (
            <DraggableCard
              key={card.id}
              card={card}
              columnType={columnType}
              onDelete={() => onDeleteCard(columnType, card.id)}
              onVote={() => onVoteCard(columnType, card.id)}
            />
          ))}
        </AnimatePresence>
        
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
