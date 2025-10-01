"use client"

import { useState } from "react"
import type { RetroCard as RetroCardType, ColumnType } from "./retro-board"
import { RetroCard } from "./retro-card"
import { RetroInput } from "./retro-input"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

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
      <Card className={cn("mb-4 border-2 transition-colors", accentClasses[accentColor])}>
        <CardHeader className="p-4">
          <CardTitle className="text-balance text-xl">{title}</CardTitle>
          <CardDescription className="text-pretty">{description}</CardDescription>
        </CardHeader>
      </Card>

      {/* Cards Container */}
      <Card className="flex flex-1 flex-col bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
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
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="group mt-2 h-auto border-2 border-dashed px-4 py-3 text-sm font-medium"
            >
              <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/10 transition-colors group-hover:bg-primary/20">
                <span className="text-xs">+</span>
              </span>
              Add Card
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
