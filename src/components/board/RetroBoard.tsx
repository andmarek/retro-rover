"use client"

import { useState, useEffect, useCallback } from "react"
import { RetroColumn, ColumnType } from "./RetroColumn"
import { RetroCard } from "./RetroCard"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import { BoardWithColumnsAndComments } from "@/app/lib/postgres"
import { webSocketManager } from "@/lib/websocket"
import { DndContext, DragEndEvent, useSensors, useSensor, PointerSensor } from "@dnd-kit/core"

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
  const [lastAddedCardId, setLastAddedCardId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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
    console.log("Adding card", { columnType, content })
    if (!boardData) {
      console.error("Board data not available");
      return
    }
    
    // Map column types to column indices (0, 1, 2)
    const columnIndex = columnType === "went-well" ? 0 : columnType === "to-improve" ? 1 : 2
    
    // Get the column by order (sorted columns)
    const sortedColumns = [...boardData.columns].sort((a, b) => a.column_order - b.column_order)
    const column = sortedColumns[columnIndex]
    
    if (!column) {
      console.error("Column not found for type:", columnType, "index:", columnIndex);
      console.log("Available columns:", boardData.columns)
      return
    }

    // Generate a unique comment ID
    const commentId = crypto.randomUUID()

    // Optimistically add the card to the state FIRST
    setBoardData(prev => {
      if (!prev) return prev
      const updatedColumns = prev.columns.map(col => {
        if (col.column_id === column.column_id) {
          return {
            ...col,
            comments: [
              ...col.comments,
              {
                comment_id: commentId,
                comment_text: content,
                comment_likes: 0,
                board_id: boardId,
                column_id: column.column_id,
                created_at: new Date(),
                updated_at: new Date(),
              }
            ]
          }
        }
        return col
      })
      return { ...prev, columns: updatedColumns }
    })
    
    // Set animation flag after the card is added to DOM
    setTimeout(() => {
      setLastAddedCardId(commentId)
      // Clear the animation flag after animation completes
      setTimeout(() => setLastAddedCardId(null), 400)
    }, 10)

    try {
      const response = await fetch("/api/boards/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardId,
          columnId: column.column_id,
          commentId,
          commentText: content,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Failed to add card:", error)
        // Rollback on failure
        setBoardData(prev => {
          if (!prev) return prev
          const updatedColumns = prev.columns.map(col => {
            if (col.column_id === column.column_id) {
              return {
                ...col,
                comments: col.comments.filter(c => c.comment_id !== commentId)
              }
            }
            return col
          })
          return { ...prev, columns: updatedColumns }
        })
      }
    } catch (error) {
      console.error("Error adding card:", error)
      // Rollback on error
      setBoardData(prev => {
        if (!prev) return prev
        const updatedColumns = prev.columns.map(col => {
          if (col.column_id === column.column_id) {
            return {
              ...col,
              comments: col.comments.filter(c => c.comment_id !== commentId)
            }
          }
          return col
        })
        return { ...prev, columns: updatedColumns }
      })
    }
  }

  const deleteCard = async (columnType: ColumnType, cardId: string) => {
    if (!boardData) return
    
    // Map column types to column indices
    const columnIndex = columnType === "went-well" ? 0 : columnType === "to-improve" ? 1 : 2
    const sortedColumns = [...boardData.columns].sort((a, b) => a.column_order - b.column_order)
    const column = sortedColumns[columnIndex]
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
        // Optimistically update local state
        setBoardData(prev => {
          if (!prev) return prev
          const updatedColumns = prev.columns.map(col => {
            if (col.column_id === column.column_id) {
              return {
                ...col,
                comments: col.comments.filter(c => c.comment_id !== cardId)
              }
            }
            return col
          })
          return { ...prev, columns: updatedColumns }
        })
      }
    } catch (error) {
      console.error("Error deleting card:", error)
    }
  }

  const voteCard = async (columnType: ColumnType, cardId: string) => {
    if (!boardData) return
    
    // Map column types to column indices
    const columnIndex = columnType === "went-well" ? 0 : columnType === "to-improve" ? 1 : 2
    const sortedColumns = [...boardData.columns].sort((a, b) => a.column_order - b.column_order)
    const column = sortedColumns[columnIndex]
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
        // Optimistically update local state
        setBoardData(prev => {
          if (!prev) return prev
          const updatedColumns = prev.columns.map(col => {
            if (col.column_id === column.column_id) {
              return {
                ...col,
                comments: col.comments.map(c => 
                  c.comment_id === cardId 
                    ? { ...c, comment_likes: c.comment_likes + 1 }
                    : c
                )
              }
            }
            return col
          })
          return { ...prev, columns: updatedColumns }
        })
      }
    } catch (error) {
      console.error("Error voting on card:", error)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || !active.data.current || !boardData) return

    const sourceColumnType = active.data.current.columnType as ColumnType
    const targetColumnType = over.data.current?.columnType as ColumnType
    const draggedCardId = active.data.current.cardId as string

    if (sourceColumnType === targetColumnType) return

    // Get column indices
    const sourceColumnIndex = sourceColumnType === "went-well" ? 0 : sourceColumnType === "to-improve" ? 1 : 2
    const targetColumnIndex = targetColumnType === "went-well" ? 0 : targetColumnType === "to-improve" ? 1 : 2

    const sortedColumns = [...boardData.columns].sort((a, b) => a.column_order - b.column_order)
    const sourceColumn = sortedColumns[sourceColumnIndex]
    const targetColumn = sortedColumns[targetColumnIndex]

    if (!sourceColumn || !targetColumn) return

    // Find the dragged card
    const draggedCard = sourceColumn.comments.find(c => c.comment_id === draggedCardId)
    if (!draggedCard) return

    // Store previous state for rollback
    const previousBoardData = boardData

    // Optimistically update the UI
    setBoardData((prev) => {
      if (!prev) return prev

      const updatedColumns = prev.columns.map((col) => {
        // Remove card from source column
        if (col.column_id === sourceColumn.column_id) {
          return {
            ...col,
            comments: col.comments.filter((c) => c.comment_id !== draggedCardId),
          }
        }
        // Add card to destination column
        if (col.column_id === targetColumn.column_id) {
          return {
            ...col,
            comments: [...col.comments, draggedCard],
          }
        }
        return col
      })

      return { ...prev, columns: updatedColumns }
    })

    try {
      const response = await fetch(`/api/boards/comments/move/${boardId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardId,
          sourceColumnId: sourceColumn.column_id,
          destinationColumnId: targetColumn.column_id,
          sourceCommentId: draggedCard.comment_id,
          commentText: draggedCard.comment_text,
          commentLikes: draggedCard.comment_likes,
        }),
      })

      if (!response.ok) {
        // Rollback on failure
        console.error("Failed to move card, rolling back")
        setBoardData(previousBoardData)
      }
    } catch (error) {
      console.error("Error moving card:", error)
      // Rollback on error
      setBoardData(previousBoardData)
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

  // Prepare columns data
  const sortedColumns = [...boardData.columns].sort((a, b) => a.column_order - b.column_order)
  const columnTypes: ColumnType[] = ["went-well", "to-improve", "action-items"]
  const accentColors = ["success", "destructive", "primary"] as const
  
  // Map columns from database to renderable column data
  const columnsToRender = sortedColumns.slice(0, 3).map((column, index) => ({
    title: column.column_name,
    description: "", // Could add column descriptions to database schema in future
    columnType: columnTypes[index],
    cards: column.comments.map(convertToRetroCard),
    accentColor: accentColors[index]
  }))

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
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className={`grid gap-6 md:grid-cols-${Math.min(sortedColumns.length, 3)}`}>
            {columnsToRender.map((col) => (
              <RetroColumn
                key={col.columnType}
                title={col.title}
                description={col.description}
                columnType={col.columnType}
                cards={col.cards}
                onAddCard={addCard}
                onDeleteCard={deleteCard}
                onVoteCard={voteCard}
                accentColor={col.accentColor}
                lastAddedCardId={lastAddedCardId}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  )
}
