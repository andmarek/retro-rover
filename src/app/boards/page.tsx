import { BoardsList } from "@/components/boards-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function BoardsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Boards</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage your team retrospective boards</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Board
            </Button>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-6">
        <BoardsList />
      </div>
    </div>
  )
}
