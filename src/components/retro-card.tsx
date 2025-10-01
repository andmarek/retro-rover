"use client"

import type { RetroCard as RetroCardType } from "./retro-board"
import { ThumbsUp, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

type RetroCardProps = {
  card: RetroCardType
  onDelete: () => void
  onVote: () => void
}

export function RetroCard({ card, onDelete, onVote }: RetroCardProps) {
  return (
    <Card className="group transition-all hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-4">
        <p className="text-pretty text-sm leading-relaxed">{card.content}</p>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between gap-2 px-4 py-3 pt-0">
        <Button
          onClick={onVote}
          variant={card.votes > 0 ? "default" : "secondary"}
          size="sm"
          className={cn(
            "h-auto px-2.5 py-1.5 text-xs",
            card.votes > 0 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : ""
          )}
        >
          <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
          {card.votes}
        </Button>

        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="h-auto p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
