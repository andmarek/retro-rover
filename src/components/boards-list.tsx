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

// Mock data for demonstration
const boards = [
  {
    id: "1",
    name: "Sprint 24 Retrospective",
    status: "active",
    template: "Start/Stop/Continue",
    lastModified: new Date(Date.now() - 1000 * 60 * 12),
    itemCount: 23,
  },
  {
    id: "2",
    name: "Q4 Team Retrospective",
    status: "completed",
    template: "Mad/Sad/Glad",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
    itemCount: 18,
  },
  {
    id: "3",
    name: "Product Launch Retro",
    status: "active",
    template: "4Ls (Liked/Learned/Lacked/Longed)",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 5),
    itemCount: 31,

  },
  {
    id: "4",
    name: "Sprint 23 Retrospective",
    status: "archived",
    template: "Start/Stop/Continue",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    itemCount: 15,

  },
  {
    id: "5",
    name: "Design System Review",
    status: "active",
    template: "Sailboat",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
    itemCount: 27,

  },
  {
    id: "6",
    name: "Engineering Offsite Retro",
    status: "completed",
    template: "Start/Stop/Continue",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    itemCount: 42,

  },
]

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
              <DropdownMenuItem>Open Board</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
}
