"use client";

import { Button } from "@/components/ui/button"
import { useSession, signOut } from "@/lib/auth-client"

export function Header() {
  const { data: session, isPending, error } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg" />
            <span className="font-semibold text-xl tracking-tight">RetroRover</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Templates
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden md:inline-flex" >
              {session?.user ?
                (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{session.user.name}</span>
                    <span className="text-sm font-medium"><a href="/myBoards"> My Boards </a></span>

                  </div>
                )
                :
                (<a href="/sign-in">Login</a>)}
            </Button>
            <Button size="sm">Demo</Button>
          </div>
        </div>
      </div>
    </header>
  )
}
