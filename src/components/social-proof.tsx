export function SocialProof() {
  const stats = [
    {
      value: "10,000+",
      label: "Teams using Retrospective",
    },
    {
      value: "500K+",
      label: "Retrospectives run",
    },
    {
      value: "95%",
      label: "Would recommend",
    },
    {
      value: "4.9/5",
      label: "Average rating",
    },
  ]

  const companies = ["Stripe", "Shopify", "GitHub", "Atlassian", "Spotify", "Netflix"]

  return (
    <section className="py-16 md:py-20 border-y border-border bg-muted/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Company Logos */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-8">Trusted by leading teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {companies.map((company) => (
                <div key={company} className="text-lg font-semibold text-muted-foreground/60">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

