import { Card } from "@/components/ui/card"

export function ProductPreview() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">See it in action</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A beautiful, intuitive interface that makes running retrospectives effortless
            </p>
          </div>

          {/* Product Screenshot Placeholder */}
          <Card className="overflow-hidden border-2">
            <div className="aspect-video bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground">Product demo video</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

