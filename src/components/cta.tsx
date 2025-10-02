import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-20 md:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-6">
            Ready to transform your retrospectives?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed mb-10">
            Join thousands of agile teams running better retrospectives. Start free, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="text-base px-8">
              Start free trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Schedule demo
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/70 mt-6">
            Free 14-day trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
