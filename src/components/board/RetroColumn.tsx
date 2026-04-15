"use client"

import { useState } from "react"
import type { RetroCard as RetroCardType } from "./RetroCard"
import { RetroCard } from "./RetroCard"
import { RetroInput } from "./RetroInput"
import { cn } from "@/lib/utils"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"

export type ColumnType = "went-well" | "to-improve" | "action-items"

const columnThemes: Record<
  ColumnType,
  {
    accent: string
    badge: string
    dropState: string
    emptyState: string
    addButton: string
  }
> = {
  "went-well": {
    accent: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
    dropState: "border-emerald-200/80 bg-emerald-50/65 dark:border-emerald-400/20 dark:bg-emerald-500/10",
    emptyState: "border-emerald-100/80 bg-emerald-50/35 dark:border-emerald-400/10 dark:bg-emerald-500/5",
    addButton: "hover:border-emerald-300/80 hover:bg-emerald-50/55 dark:hover:border-emerald-400/20 dark:hover:bg-emerald-500/10",
  },
  "to-improve": {
    accent: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
    dropState: "border-amber-200/80 bg-amber-50/65 dark:border-amber-400/20 dark:bg-amber-500/10",
    emptyState: "border-amber-100/80 bg-amber-50/35 dark:border-amber-400/10 dark:bg-amber-500/5",
    addButton: "hover:border-amber-300/80 hover:bg-amber-50/55 dark:hover:border-amber-400/20 dark:hover:bg-amber-500/10",
  },
  "action-items": {
    accent: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
    dropState: "border-sky-200/80 bg-sky-50/65 dark:border-sky-400/20 dark:bg-sky-500/10",
    emptyState: "border-sky-100/80 bg-sky-50/35 dark:border-sky-400/10 dark:bg-sky-500/5",
    addButton: "hover:border-sky-300/80 hover:bg-sky-50/55 dark:hover:border-sky-400/20 dark:hover:bg-sky-500/10",
  },
}

const laneLabels: Record<ColumnType, string> = {
  "went-well": "Went well",
  "to-improve": "To improve",
  "action-items": "Action items",
}

type RetroColumnProps = {
  title: string
  columnType: ColumnType
  cards: RetroCardType[]
  onAddCard: (columnType: ColumnType, content: string) => void
  onDeleteCard: (columnType: ColumnType, cardId: string) => void
  onVoteCard: (columnType: ColumnType, cardId: string) => void
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
      <RetroCard card={card} onDelete={onDelete} onVote={onVote} columnType={columnType} />
    </div>
  )
}

export function RetroColumn({
  title,
  columnType,
  cards,
  onAddCard,
  onDeleteCard,
  onVoteCard,
  sortByVotes,
}: RetroColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const theme = columnThemes[columnType]

  const displayCards = sortByVotes ? [...cards].sort((a, b) => b.votes - a.votes) : cards

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnType}`,
    data: {
      columnType,
    },
  })

  const handleAddCard = (content: string) => {
    onAddCard(columnType, content)
    setIsAdding(false)
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col px-4 py-4 sm:px-5 sm:py-5",
        isOver && "rounded-[24px]",
        isOver && theme.dropState
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]", theme.badge)}>
            {laneLabels[columnType]}
          </span>
          <h2 className="mt-3 truncate text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn("hidden h-1.5 w-12 rounded-full sm:block", theme.accent)} />
          <span className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-sm font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {cards.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "mt-5 flex min-h-[18rem] flex-1 flex-col gap-3 transition duration-200",
          isOver && "scale-[0.995]"
        )}
      >
        {cards.length === 0 && !isAdding && (
          <div
            className={cn(
              "flex min-h-[13rem] flex-1 items-center justify-center rounded-[24px] border border-dashed px-6 text-center",
              isOver
                ? theme.dropState
                : theme.emptyState
            )}
          >
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {isOver ? "Drop note here" : "No notes yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Add a note or move one here.</p>
            </div>
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

        {/* Add note input */}
        {isAdding ? (
          <RetroInput
            onSubmit={handleAddCard}
            onCancel={() => setIsAdding(false)}
            placeholder="Type your note..."
            columnType={columnType}
          />
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className={cn(
              "mt-1 flex w-full items-center justify-center gap-2 rounded-[18px] border border-slate-200/80 bg-white/65 px-4 py-3.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20",
              theme.addButton
            )}
          >
            <Plus className="h-4 w-4" />
            <span>Add note</span>
          </button>
        )}
      </div>
    </div>
  )
}
