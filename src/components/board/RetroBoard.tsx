"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ArrowUpDown,
  GripVertical,
  Moon,
  Sun,
} from "lucide-react"
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"

import { BoardWithColumnsAndComments } from "@/app/lib/postgres"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { webSocketManager } from "@/lib/websocket"

import { RetroCard } from "./RetroCard"
import { RetroColumn, ColumnType } from "./RetroColumn"

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
  const [activeCard, setActiveCard] = useState<RetroCard | null>(null)
  const [activeCardColumnType, setActiveCardColumnType] = useState<ColumnType | undefined>()
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const customCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args)
    
    if (pointerCollisions.length > 0) {
      const cardCollision = pointerCollisions.find(c => c.id.toString().startsWith('card-'))
      if (cardCollision) return [cardCollision]
      return [pointerCollisions[0]]
    }
    
    return rectIntersection(args)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark")
    }
  }, [])

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (!active.data.current || !boardData) return
    
    const cardId = active.data.current.cardId as string
    const columnType = active.data.current.columnType as ColumnType
    const columnIndex = columnType === "went-well" ? 0 : columnType === "to-improve" ? 1 : 2
    const sortedColumns = [...boardData.columns].sort((a, b) => a.column_order - b.column_order)
    const column = sortedColumns[columnIndex]
    
    if (column) {
      const card = column.comments.find(c => c.comment_id === cardId)
      if (card) {
        setActiveCard(convertToRetroCard(card))
        setActiveCardColumnType(columnType)
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)
    setActiveCardColumnType(undefined)

    if (!over || !active.data.current || !boardData) return

    const sourceColumnType = active.data.current.columnType as ColumnType
    const draggedCardId = active.data.current.cardId as string
    
    const overId = over.id.toString()
    const isOverCard = overId.startsWith('card-')
    const targetColumnType = over.data.current?.columnType as ColumnType
    
    if (!targetColumnType) return

    if (sourceColumnType === targetColumnType) {
      if (sortMode !== "user") return
      if (!isOverCard || active.id === over.id) return
      
      const overCardId = over.data.current?.cardId as string
      const sourceColumnIndex = sourceColumnType === "went-well" ? 0 : sourceColumnType === "to-improve" ? 1 : 2
      const sortedColumns = [...boardData.columns].sort((a, b) => a.column_order - b.column_order)
      const sourceColumn = sortedColumns[sourceColumnIndex]
      
      if (!sourceColumn) return
      
      const currentOrder = manualOrder[sourceColumn.column_id] || sourceColumn.comments.map(c => c.comment_id)
      const oldIndex = currentOrder.indexOf(draggedCardId)
      const newIndex = currentOrder.indexOf(overCardId)
      
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return
      
      const newOrder = arrayMove(currentOrder, oldIndex, newIndex)
      
      setManualOrder(prev => ({
        ...prev,
        [sourceColumn.column_id]: newOrder
      }))
      
      return
    }

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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-6 dark:bg-slate-950">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-br from-emerald-200/50 via-white to-sky-100/50 dark:from-emerald-500/10 dark:via-slate-950 dark:to-sky-500/10" />
        <div className="relative w-full max-w-md rounded-[28px] border border-white/70 bg-white/85 p-10 text-center shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 dark:border-white/10 dark:border-t-white" />
          <p className="mt-5 text-sm font-medium text-slate-600 dark:text-slate-300">Loading board...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-6 dark:bg-slate-950">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-br from-rose-200/60 via-white to-amber-100/50 dark:from-rose-500/10 dark:via-slate-950 dark:to-amber-500/10" />
        <div className="relative w-full max-w-md rounded-[28px] border border-white/70 bg-white/85 p-10 text-center shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-300">Board unavailable</p>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{error}</p>
          <Button
            onClick={fetchBoardData}
            className="mt-6 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!boardData) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-6 dark:bg-slate-950">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-br from-slate-200/60 via-white to-emerald-100/50 dark:from-slate-700/30 dark:via-slate-950 dark:to-emerald-500/10" />
        <div className="relative w-full max-w-md rounded-[28px] border border-white/70 bg-white/85 p-10 text-center shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Missing board</p>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">Board not found</p>
        </div>
      </div>
    )
  }

  // Prepare columns data
  const sortedColumns = [...boardData.columns].sort((a, b) => a.column_order - b.column_order)
  const columnTypes: ColumnType[] = ["went-well", "to-improve", "action-items"]
  const updatedAt = new Date(boardData.updated_at)
  const updatedLabel = Number.isNaN(updatedAt.valueOf())
    ? "Recently updated"
    : `Updated ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(updatedAt)}`
  const boardDescription = boardData.board_description?.trim()
  const gridClassName =
    sortedColumns.length === 1
      ? "grid-cols-1"
      : sortedColumns.length === 2
        ? "grid-cols-1 lg:grid-cols-2"
        : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
  
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
      columnType: columnTypes[index],
      cards: sortedCards,
    }
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/90 via-slate-100/70 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-br from-emerald-200/30 via-white/30 to-sky-100/30 dark:from-emerald-500/10 dark:via-slate-950 dark:to-sky-500/10" />
      <div className="pointer-events-none absolute left-[-6%] top-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute right-[-4%] top-6 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
          <div className="border-b border-slate-200/70 px-5 py-5 dark:border-white/10 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Live board
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{updatedLabel}</span>
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  {boardData.board_name || "Team retrospective"}
                </h1>

                {boardDescription ? (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                    {boardDescription}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      <span>{sortMode === "votes" ? "Top voted" : "Manual order"}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl dark:border-white/10 dark:bg-slate-900/95"
                  >
                    <DropdownMenuItem
                      onClick={() => setSortMode("votes")}
                      className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-100 focus:text-slate-950 dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white"
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Top voted
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
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
                      }}
                      className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-100 focus:text-slate-950 dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white"
                    >
                      <GripVertical className="mr-2 h-4 w-4" />
                      Manual order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 transition hover:border-slate-300 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <main className="p-2 sm:p-3">
          <DndContext 
            sensors={sensors} 
            collisionDetection={customCollisionDetection} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className={cn("grid gap-2 lg:gap-0", gridClassName)}>
              {columnsToRender.map((col, index) => (
                <div
                  key={col.columnType}
                  className={cn(
                    "min-w-0",
                    index > 0 && "border-t border-slate-200/70 dark:border-white/10 lg:border-l lg:border-t-0"
                  )}
                >
                  <RetroColumn
                    title={col.title}
                    columnType={col.columnType}
                    cards={col.cards}
                    onAddCard={addCard}
                    onDeleteCard={deleteCard}
                    onVoteCard={voteCard}
                    sortByVotes={sortMode === "votes"}
                  />
                </div>
              ))}
            </div>
            <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
              {activeCard ? (
                <div className="rotate-2 opacity-95">
                  <RetroCard
                    card={activeCard}
                    onDelete={() => {}}
                    onVote={() => {}}
                    columnType={activeCardColumnType}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          </main>
        </section>
      </div>
    </div>
  )
}
