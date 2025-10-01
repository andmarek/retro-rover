"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Check, X } from "lucide-react"

type RetroInputProps = {
  onSubmit: (content: string) => void
  onCancel: () => void
  placeholder?: string
}

export function RetroInput({ onSubmit, onCancel, placeholder = "Type here..." }: RetroInputProps) {
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
    <Card className="border-2 border-primary/30 shadow-sm">
      <CardContent className="p-3 pb-0">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-sm leading-relaxed focus-visible:ring-0"
          rows={3}
        />
      </CardContent>
      
      <CardFooter className="flex items-center justify-between gap-2 p-3 pt-2">
        <span className="text-xs text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">⌘</kbd> +{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Enter</kbd> to save
        </span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!content.trim()} className="h-7 px-3">
            <Check className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
