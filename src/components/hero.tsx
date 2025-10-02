"use client"

import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
            Better retrospectives
            <br />
            for agile teams
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
            Run engaging retrospectives that drive real change. Create boards, collaborate in real-time, and turn
            insights into action with your team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8">
              Get started free
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
              View demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-8">Trusted by over 10,000 agile teams worldwide</p>
        </div>
      </div>
    </section>
  )
}

