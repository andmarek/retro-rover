"use client"

import { useState, useEffect, useCallback } from "react"
import { RetroColumn, ColumnType } from "./RetroColumn"
import { RetroCard } from "./RetroCard"
import { Button } from "@/components/ui/button"
import { Download, Share2, ArrowUpDown, ThumbsUp, GripVertical } from "lucide-react"
import { BoardWithColumnsAndComments } from "@/app/lib/postgres"
import { webSocketManager } from "@/lib/websocket"
import { DndContext, DragEndEvent, useSensors, useSensor, PointerSensor } from "@dnd-kit/core"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface RetroBoardProps {
  boardId: string
}

type SortMode = "votes" | "user"

export function RetroBoard({ boardId }: RetroBoardProps) {
  const [boardData, setBoardData] = useState<BoardWithColumnsAndComments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>("votes")
  const [manualOrder, setManualOrder] = useState<Record<string, string[]>>({})

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
      
      // Ensure manual order includes all current cards when in manual mode
      if (sortMode === "user") {
        setManualOrder(prev => {
          const newOrder = { ...prev }
          data.columns.forEach((column: any) => {
            const existingOrder = prev[column.column_id] || []
            const existingIds = new Set(existingOrder)
            const allCardIds = column.comments.map((c: any) => c.comment_id)
            
            // Add any new cards that aren't in the manual order yet
            const newCards = allCardIds.filter((id: string) => !existingIds.has(id))
            if (newCards.length > 0 || !prev[column.column_id]) {
              newOrder[column.column_id] = [...existingOrder, ...newCards]
            }
          })
          return newOrder
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [boardId, sortMode])

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

    // Optimistically add the card to the state
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

    // Update manual order if in manual mode
    if (sortMode === "user") {
      setManualOrder(prev => {
        const newOrder = { ...prev }
        if (newOrder[column.column_id]) {
          newOrder[column.column_id] = [...newOrder[column.column_id], commentId]
        } else {
          newOrder[column.column_id] = [...column.comments.map(c => c.comment_id), commentId]
        }
        return newOrder
      })
    }

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
      const response = await fetch(`/api/boards/comments/${cardId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardId,
          columnId: column.column_id,
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

    // Update manual order if in manual mode
    if (sortMode === "user") {
      setManualOrder((prev) => {
        const newOrder = { ...prev }
        
        // Update source column order (remove card)
        if (newOrder[sourceColumn.column_id]) {
          newOrder[sourceColumn.column_id] = newOrder[sourceColumn.column_id].filter(
            id => id !== draggedCardId
          )
        }
        
        // Update target column order (add card)
        if (newOrder[targetColumn.column_id]) {
          newOrder[targetColumn.column_id] = [...newOrder[targetColumn.column_id], draggedCardId]
        } else {
          const targetCards = targetColumn.comments.map(c => c.comment_id)
          newOrder[targetColumn.column_id] = [...targetCards, draggedCardId]
        }
        
        return newOrder
      })
    }

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
  const columnsToRender = sortedColumns.map((column, index) => {
    const cards = column.comments.map(convertToRetroCard)
    
    // Sort cards based on sort mode
    let sortedCards: RetroCard[]
    if (sortMode === "votes") {
      sortedCards = [...cards].sort((a, b) => b.votes - a.votes)
    } else {
      // In manual mode, use the manual order if available, otherwise use current order
      const columnOrder = manualOrder[column.column_id]
      if (columnOrder) {
        const cardMap = new Map(cards.map(card => [card.id, card]))
        sortedCards = columnOrder
          .map(id => cardMap.get(id))
          .filter((card): card is RetroCard => card !== undefined)
        // Add any new cards that aren't in the manual order yet
        const orderedIds = new Set(columnOrder)
        const newCards = cards.filter(card => !orderedIds.has(card.id))
        sortedCards.push(...newCards)
      } else {
        sortedCards = cards
      }
    }
    
    return {
      title: column.column_name,
      description: "", // Could add column descriptions to database schema in future
      columnType: columnTypes[index],
      cards: sortedCards,
      accentColor: accentColors[index]
    }
  })

  return (
    <div className="min-h-screen pt-20 px-6 pb-6 md:pt-24 md:px-8 md:pb-8 lg:pt-28 lg:px-12 lg:pb-12">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort: {sortMode === "votes" ? "By Votes" : "Manual"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortMode("votes")}>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Sort by Votes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    // Initialize manual order with current card positions when switching to manual mode
                    if (sortMode === "votes" && boardData) {
                      const newManualOrder: Record<string, string[]> = {}
                      boardData.columns.forEach(column => {
                        const cards = column.comments.map(convertToRetroCard)
                        const sortedCards = [...cards].sort((a, b) => b.votes - a.votes)
                        newManualOrder[column.column_id] = sortedCards.map(card => card.id)
                      })
                      setManualOrder(newManualOrder)
                    }
                    setSortMode("user")
                  }}>
                    <GripVertical className="mr-2 h-4 w-4" />
                    Manual Sorting
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <div className={`grid gap-6 ${sortedColumns.length === 2 ? 'md:grid-cols-2' : sortedColumns.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}>
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
                sortByVotes={sortMode === "votes"}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  )
}
