"use client";

import Link from "next/link";

import { useSession, signOut } from "@/lib/auth-client";

function NavLink(props: { linkText: string, href: string }) {
  return (
    <Link
      href={props.href}
      className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
    >
      {props.linkText}
    </Link>
  )
}

function UserMenu({ user }: { user: any }) {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        {user.email}
      </span>
      <button 
        onClick={handleSignOut}
        className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10"
      >
        Sign Out
      </button>
    </div>
  );
}

export default function NavBar() {
  const { data: session, isPending, error } = useSession();

  return (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-background/70 backdrop-blur-xl dark:border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
            RR
          </span>
          <div>
            <p className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">Retro Rover</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {!isPending ? (
            <>
              {session?.user ? (
                <UserMenu user={session.user} />
              ) : (
                <>
                  <NavLink linkText="Sign In" href="/sign-in" />
                  <NavLink linkText="Sign Up" href="/sign-in?mode=signup" />
                </>
              )}
              <NavLink linkText="Home" href="/" />
              {session?.user && (
                <NavLink linkText="My Boards" href="/boards" />
              )}
              {session?.user && (
                <NavLink linkText="Create" href="/boards/new" />
              )}
            </>
          ) : (
            <>
              <NavLink linkText="Home" href="/" />
              <NavLink linkText="Sign In" href="/sign-in" />
              <NavLink linkText="Sign Up" href="/sign-in?mode=signup" />
            </>
          )}
          {error && (
            <div className="text-xs text-red-500">Auth Error</div>
          )}
        </div>
      </div>
    </nav>
  );
};
