"use client"

import { useState, useEffect, useCallback } from "react"
import { RetroColumn, ColumnType } from "./RetroColumn"
import { RetroCard } from "./RetroCard"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import { BoardWithColumnsAndComments } from "@/app/lib/postgres"
import { webSocketManager } from "@/lib/websocket"

interface RetroCardData extends RetroCard {
  comment_id: string
  comment_text: string
  comment_likes: number
  created_at: Date
  updated_at: Date
}

interface RetroColumnData {
  board_id: string
  column_id: number
  column_name: string
  column_order: number
  created_at: Date
  comments: RetroCardData[]
}

interface RetroBoardProps {
  boardId: string
}

export function RetroBoard({ boardId }: RetroBoardProps) {
  const [boardData, setBoardData] = useState<BoardWithColumnsAndComments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Convert database cards to RetroCard format
  const convertToRetroCard = (dbCard: any): RetroCard => ({
    id: dbCard.comment_id,
    content: dbCard.comment_text,
    votes: dbCard.comment_likes,
  })

  // Convert database columns to our format with proper column types
  const getColumnType = (columnName: string, columnId: number): ColumnType => {
    const lowerName = columnName.toLowerCase()
    if (lowerName.includes('well') || lowerName.includes('good') || lowerName.includes('positive') || columnId === 0) {
      return "went-well"
    }
    if (lowerName.includes('improve') || lowerName.includes('bad') || lowerName.includes('problem') || columnId === 1) {
      return "to-improve"
    }
    return "action-items"
  }

  const getColumnConfig = (columnType: ColumnType, originalName: string) => {
    switch (columnType) {
      case "went-well":
        return {
          title: "What Went Well",
          description: "Celebrate successes and positive outcomes",
          accentColor: "accent" as const
        }
      case "to-improve":
        return {
          title: "To Improve", 
          description: "Identify challenges and areas for growth",
          accentColor: "destructive" as const
        }
      case "action-items":
        return {
          title: "Action Items",
          description: "Concrete steps for the next sprint", 
          accentColor: "primary" as const
        }
    }
  }

  const fetchBoardData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch board data")
      }

      const data = await response.json()
      setBoardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    fetchBoardData()
    
    // Setup WebSocket connection (prepared for future server implementation)
    webSocketManager.connect(boardId)
    
    // Setup real-time event listeners
    webSocketManager.on("board-update", () => {
      console.log("[WebSocket] Board update received, refreshing data")
      fetchBoardData()
    })

    webSocketManager.on("card-added", () => {
      console.log("[WebSocket] Card added, refreshing data")
      fetchBoardData()
    })

    webSocketManager.on("card-moved", () => {
      console.log("[WebSocket] Card moved, refreshing data")
      fetchBoardData()
    })

    webSocketManager.on("card-liked", () => {
      console.log("[WebSocket] Card liked, refreshing data")
      fetchBoardData()
    })

    // Cleanup on unmount
    return () => {
      webSocketManager.off("board-update")
      webSocketManager.off("card-added")
      webSocketManager.off("card-moved")
      webSocketManager.off("card-liked")
      webSocketManager.disconnect()
    }
  }, [fetchBoardData, boardId])

  const addCard = async (columnType: ColumnType, content: string) => {
    if (!boardData) return
    
    // Find the actual column ID for this column type
    const column = boardData.columns.find(col => getColumnType(col.column_name, col.column_id) === columnType)
    if (!column) return

    try {
      const response = await fetch("/api/boards/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardId,
          columnId: column.column_id,
          commentText: content,
        }),
      })

      if (response.ok) {
        await fetchBoardData() // Refresh board data
      }
    } catch (error) {
      console.error("Error adding card:", error)
    }
  }

  const deleteCard = async (columnType: ColumnType, cardId: string) => {
    if (!boardData) return
    
    // Find the actual column ID for this column type
    const column = boardData.columns.find(col => getColumnType(col.column_name, col.column_id) === columnType)
    if (!column) return

    try {
      const response = await fetch("/api/boards/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardId,
          columnId: column.column_id,
          commentId: cardId,
        }),
      })

      if (response.ok) {
        await fetchBoardData() // Refresh board data
      }
    } catch (error) {
      console.error("Error deleting card:", error)
    }
  }

  const voteCard = async (columnType: ColumnType, cardId: string) => {
    if (!boardData) return
    
    // Find the actual column ID for this column type
    const column = boardData.columns.find(col => getColumnType(col.column_name, col.column_id) === columnType)
    if (!column) return

    try {
      const response = await fetch(`/api/boards/comments/${boardId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: cardId,
          columnId: column.column_id,
          action: "like",
        }),
      })

      if (response.ok) {
        await fetchBoardData() // Refresh board data
      }
    } catch (error) {
      console.error("Error voting on card:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading board...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive text-lg">{error}</p>
          <Button
            onClick={fetchBoardData}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!boardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    )
  }

  // Group cards by column type
  const columnsByType: Record<ColumnType, RetroCard[]> = {
    "went-well": [],
    "to-improve": [],
    "action-items": [],
  }

  boardData.columns.forEach(column => {
    const columnType = getColumnType(column.column_name, column.column_id)
    columnsByType[columnType] = column.comments.map(convertToRetroCard)
  })

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                {boardData.board_name || "Sprint Retrospective"}
              </h1>
              <p className="mt-2 text-pretty text-muted-foreground">
                {boardData.board_description || "Reflect on what went well, what to improve, and plan action items for the next sprint."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Columns Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <RetroColumn
            title="What Went Well"
            description="Celebrate successes and positive outcomes"
            columnType="went-well"
            cards={columnsByType["went-well"]}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onVoteCard={voteCard}
            accentColor="accent"
          />
          <RetroColumn
            title="To Improve"
            description="Identify challenges and areas for growth"
            columnType="to-improve"
            cards={columnsByType["to-improve"]}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onVoteCard={voteCard}
            accentColor="destructive"
          />
          <RetroColumn
            title="Action Items"
            description="Concrete steps for the next sprint"
            columnType="action-items"
            cards={columnsByType["action-items"]}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onVoteCard={voteCard}
            accentColor="primary"
          />
        </div>
      </div>
    </div>
  )
}
