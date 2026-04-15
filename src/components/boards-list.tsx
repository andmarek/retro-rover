"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useNotImplementedToast } from "@/components/not-implemented-toast"
import {
  ArrowUpRight,
  FolderOpen,
  MoreHorizontal,
  Plus,
  RefreshCw,
} from "lucide-react"

interface BoardColumn {
  column_id: string | number
  column_name: string
  column_order: number
}

interface BoardApiResponse {
  id: string
  name: string
  description?: string
  status: string
  template: string
  lastModified: string
  itemCount: number
  columns: BoardColumn[]
}

interface Board {
  id: string
  name: string
  description?: string
  status: string
  template: string
  lastModified: Date
  itemCount: number
  columns: BoardColumn[]
}

const columnPreviewStyles = [
  "border-emerald-200/80 bg-emerald-50/90 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100",
  "border-sky-200/80 bg-sky-50/90 text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-100",
  "border-amber-200/80 bg-amber-50/90 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100",
] as const

function formatAbsoluteDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date)
}

function isRecentlyActive(date: Date) {
  return Date.now() - date.getTime() <= 1000 * 60 * 60 * 24 * 3
}

function BoardCardSkeleton() {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/72">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200/80 dark:bg-white/10" />
          <div className="h-7 w-48 animate-pulse rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="mt-6 h-16 animate-pulse rounded-[22px] bg-slate-100/80 dark:bg-white/5" />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100/80 dark:bg-white/5" />
        ))}
      </div>

      <div className="mt-6 h-11 w-full animate-pulse rounded-full bg-slate-200/80 dark:bg-white/10" />
    </div>
  )
}

export function BoardsList() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { showNotImplemented } = useNotImplementedToast()

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/boards")
      if (!response.ok) {
        throw new Error("Failed to fetch boards")
      }

      const boardsData = (await response.json()) as BoardApiResponse[]
      const boardsWithDates = boardsData.map((board) => ({
        ...board,
        lastModified: new Date(board.lastModified),
      }))

      setBoards(boardsWithDates)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch boards")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchBoards()
  }, [fetchBoards])

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
          <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/72 sm:p-8">
            <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-5 h-12 max-w-xl animate-pulse rounded-[20px] bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-3 h-20 max-w-2xl animate-pulse rounded-[24px] bg-slate-100/80 dark:bg-white/5" />
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="h-11 w-36 animate-pulse rounded-full bg-slate-200/80 dark:bg-white/10" />
              <div className="h-11 w-44 animate-pulse rounded-full bg-slate-100/80 dark:bg-white/5" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-white/70 bg-white/72 p-5 shadow-[0_20px_70px_-55px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-900/68"
              >
                <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/10" />
                <div className="mt-5 h-8 w-16 animate-pulse rounded-full bg-slate-200/80 dark:bg-white/10" />
                <div className="mt-3 h-5 w-28 animate-pulse rounded-full bg-slate-100/80 dark:bg-white/5" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white/72 p-4 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <BoardCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <section className="rounded-[32px] border border-white/70 bg-white/78 p-8 text-center shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/72 sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-50 text-rose-600 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
          <RefreshCw className="h-5 w-5" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-rose-600 dark:text-rose-300">
          Boards unavailable
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          We couldn&apos;t load your workspace.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          {error}
        </p>
        <Button
          onClick={() => void fetchBoards()}
          className="mt-8 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Try again
        </Button>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/72">
        <div className="border-b border-slate-200/70 px-5 py-5 dark:border-white/10 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Boards
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                Open a board or create a new one.
              </p>
            </div>

            <Button
              asChild
              className="rounded-full bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Link href="/boards/new">
                <Plus className="h-4 w-4" />
                New board
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/72 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
        <div className="border-b border-slate-200/70 px-5 py-5 dark:border-white/10 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Board list
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {boards.length > 0 ? `${boards.length} boards ready to revisit` : "No boards yet"}
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Sorted by most recent activity.
            </p>
          </div>
        </div>

        {boards.length === 0 ? (
          <div className="px-5 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-slate-200/80 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <FolderOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Create your first board
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Create a board to start collecting notes and actions with your team.
              </p>
              <Button
                asChild
                className="mt-8 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <Link href="/boards/new">
                  <Plus className="h-4 w-4" />
                  Create a board
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 sm:p-5">
            {boards.map((board) => {
              const description = board.description?.trim() || "No description yet. Add context so your team knows exactly what this retro is about."
              const recent = isRecentlyActive(board.lastModified)
              const visibleColumns = board.columns.slice(0, 3)

              return (
                <article
                  key={board.id}
                  className="group flex h-full flex-col rounded-[28px] border border-white/70 bg-white/82 p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] transition duration-200 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-[0_35px_90px_-55px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/45 dark:hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
                          recent
                            ? "border-emerald-200/90 bg-emerald-50/80 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                            : "border-slate-200/80 bg-slate-50/80 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                        )}
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            recent ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
                          )}
                        />
                        {recent ? "Recently active" : "Ready to revisit"}
                      </span>

                      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                        {board.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {description}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full border border-slate-200/80 bg-white/70 text-slate-600 opacity-100 transition hover:border-slate-300 hover:bg-white/90 hover:text-slate-950 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open board actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl dark:border-white/10 dark:bg-slate-900/95"
                      >
                        <DropdownMenuItem
                          onClick={() => router.push(`/boards/${board.id}`)}
                          className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-100 focus:text-slate-950 dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white"
                        >
                          Open board
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={showNotImplemented}
                          className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-100 focus:text-slate-950 dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white"
                        >
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={showNotImplemented}
                          className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-100 focus:text-slate-950 dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white"
                        >
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-200/80 dark:bg-white/10" />
                        <DropdownMenuItem
                          onClick={showNotImplemented}
                          className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-100 focus:text-slate-950 dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white"
                        >
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={showNotImplemented}
                          className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-100 focus:text-slate-950 dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white"
                        >
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-200/80 dark:bg-white/10" />
                        <DropdownMenuItem
                          className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-700 dark:text-rose-300 dark:focus:bg-rose-500/10 dark:focus:text-rose-200"
                          onClick={showNotImplemented}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-slate-50/75 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                          Format
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">{board.template}</p>
                      </div>
                      <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        {board.columns.length} columns
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {visibleColumns.map((column, index) => (
                        <span
                          key={`${board.id}-${column.column_id}`}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium",
                            columnPreviewStyles[index % columnPreviewStyles.length]
                          )}
                        >
                          {column.column_name}
                        </span>
                      ))}
                      {board.columns.length > visibleColumns.length ? (
                        <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                          +{board.columns.length - visibleColumns.length} more
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Notes
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{board.itemCount}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Updated
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                        {formatAbsoluteDate(board.lastModified)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Status
                      </p>
                      <p className="mt-2 text-sm font-medium capitalize text-slate-950 dark:text-white">{board.status}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(board.lastModified, { addSuffix: true })}
                    </p>
                    <Button
                      asChild
                      variant="ghost"
                      className="rounded-full border border-slate-200/80 bg-white/80 px-4 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <Link href={`/boards/${board.id}`}>
                        Open board
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
