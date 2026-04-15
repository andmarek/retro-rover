import { BoardsList } from "@/components/boards-list"

export default function BoardsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/90 via-slate-100/75 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-br from-emerald-200/30 via-white/30 to-sky-100/30 dark:from-emerald-500/10 dark:via-slate-950 dark:to-sky-500/10" />
      <div className="pointer-events-none absolute left-[-8%] top-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute right-[-4%] top-8 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <BoardsList />
      </div>
    </div>
  )
}
