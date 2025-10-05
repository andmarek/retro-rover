"use client"

import { ThumbsUp, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type RetroCard = {
  id: string
  content: string
  votes: number
  author?: string
}

type RetroCardProps = {
  card: RetroCard
  onDelete: () => void
  onVote: () => void
}

export function RetroCard({ card, onDelete, onVote }: RetroCardProps) {
  return (
    <div className="group relative rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      {/* Card Content */}
      <p className="text-pretty text-sm leading-relaxed text-card-foreground">{card.content}</p>

      {/* Card Actions */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
        <button
          onClick={onVote}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
            card.votes > 0
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{card.votes}</span>
        </button>

        <button
          onClick={onDelete}
          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
