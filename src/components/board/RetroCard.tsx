"use client"

import { GripVertical, ThumbsUp, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type ColumnType = "went-well" | "to-improve" | "action-items"

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
  columnType?: ColumnType
}

const cardThemes: Record<
  ColumnType,
  {
    accent: string
    badge: string
    voteButton: string
  }
> = {
  "went-well": {
    accent: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
    voteButton:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20",
  },
  "to-improve": {
    accent: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
    voteButton:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20",
  },
  "action-items": {
    accent: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
    voteButton:
      "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/20",
  },
}

const defaultTheme = {
  accent: "bg-slate-900 dark:bg-white",
  badge: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
  voteButton:
    "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
}

export function RetroCard({ card, onDelete, onVote, columnType }: RetroCardProps) {
  const theme = columnType ? cardThemes[columnType] : defaultTheme

  return (
    <div className="group relative cursor-move overflow-hidden rounded-[20px] border border-slate-200/80 bg-white/76 p-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.22)] backdrop-blur-sm transition-colors duration-200 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20">
      <div className={cn("absolute inset-y-4 left-0 w-1 rounded-r-full", theme.accent)} />
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-slate-400 opacity-0 shadow-sm transition hover:text-slate-700 group-hover:opacity-100 dark:bg-slate-900/90 dark:text-slate-500 dark:hover:text-slate-100"
        aria-label="Remove note"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="pr-8 text-[15px] leading-6 text-slate-800 dark:text-slate-100">{card.content}</p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/10">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          <GripVertical className="h-3.5 w-3.5" />
          Drag
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onVote()
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            theme.voteButton
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{card.votes}</span>
        </button>
      </div>
    </div>
  )
}
