"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Users, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useNotImplementedToast } from "@/components/not-implemented-toast"

interface Board {
  id: string
  name: string
  description?: string
  status: string
  template: string
  lastModified: Date
  itemCount: number
  columns: any[]
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-500"
    case "completed":
      return "bg-blue-500"
    case "archived":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

function getStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function BoardsList() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { showNotImplemented } = useNotImplementedToast()

  useEffect(() => {
    async function fetchBoards() {
      try {
        const response = await fetch("/api/boards")
        if (!response.ok) {
          throw new Error("Failed to fetch boards")
        }
        const boardsData = await response.json()
        // Convert lastModified strings back to Date objects
        const boardsWithDates = boardsData.map((board: any) => ({
          ...board,
          lastModified: new Date(board.lastModified)
        }))
        setBoards(boardsWithDates)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch boards")
      } finally {
        setLoading(false)
      }
    }

    fetchBoards()
  }, [])

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading boards...</div>
  }

  if (error) {
    return <div className="text-center text-destructive">Error: {error}</div>
  }

  if (boards.length === 0) {
    return <div className="text-center text-muted-foreground">No boards found. Create your first board!</div>
  }

  return (
    <div className="space-y-2">
      {boards.map((board) => (
        <div
          key={board.id}
          className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          {/* Status indicator */}
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${getStatusColor(board.status)}`} />
          </div>

          {/* Board name and template */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">{board.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {board.template}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{getStatusLabel(board.status)}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span>{board.itemCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
            </div>
          </div>


          {/* Last modified */}
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(board.lastModified, { addSuffix: true })}
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 transition-opacity group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/boards/${board.id}`)}>
                Open Board
              </DropdownMenuItem>
              <DropdownMenuItem onClick={showNotImplemented}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={showNotImplemented}>Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={showNotImplemented}>Export</DropdownMenuItem>
              <DropdownMenuItem onClick={showNotImplemented}>Archive</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={showNotImplemented}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
}
