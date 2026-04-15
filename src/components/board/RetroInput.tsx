"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type ColumnType = "went-well" | "to-improve" | "action-items"

const columnBorderColors: Record<ColumnType, string> = {
  "went-well": "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-400/20 dark:bg-emerald-500/10",
  "to-improve": "border-amber-200/80 bg-amber-50/80 dark:border-amber-400/20 dark:bg-amber-500/10",
  "action-items": "border-sky-200/80 bg-sky-50/80 dark:border-sky-400/20 dark:bg-sky-500/10",
}

const columnButtonColors: Record<ColumnType, string> = {
  "went-well": "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300",
  "to-improve": "bg-amber-500 hover:bg-amber-600 text-slate-950 dark:bg-amber-300 dark:hover:bg-amber-200",
  "action-items": "bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300",
}

type RetroInputProps = {
  onSubmit: (content: string) => void
  onCancel: () => void
  placeholder?: string
  columnType?: ColumnType
}

export function RetroInput({ onSubmit, onCancel, placeholder = "Type your note...", columnType }: RetroInputProps) {
  const [content, setContent] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim())
      setContent("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <div className={cn(
      "rounded-[20px] border p-4 backdrop-blur",
      columnType ? columnBorderColors[columnType] : "border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5"
    )}>
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[112px] resize-none rounded-[18px] border-slate-200/80 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-white/10"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">Press Cmd/Ctrl + Enter to save quickly.</p>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!content.trim()}
            size="sm"
            className={cn(
              "rounded-full px-4 text-sm font-semibold shadow-sm",
              columnType ? columnButtonColors[columnType] : "bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            )}
          >
            Save note
          </Button>
          <Button
            onClick={onCancel}
            size="sm"
            variant="ghost"
            className="rounded-full px-4 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
