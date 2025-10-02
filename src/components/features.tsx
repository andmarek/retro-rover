import { MessageSquare, Layout, Zap, Users, BarChart3, Lock } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Layout,
      title: "Customizable Boards",
      description:
        "Choose from popular formats like Start-Stop-Continue, Mad-Sad-Glad, or create your own custom board layouts.",
    },
    {
      icon: MessageSquare,
      title: "Real-time Collaboration",
      description: "Your team can add cards, vote, and discuss simultaneously. See updates instantly as they happen.",
    },
    {
      icon: Zap,
      title: "Action Items Tracking",
      description: "Turn insights into action. Track follow-ups and ensure your retrospectives drive real improvement.",
    },
    {
      icon: Users,
      title: "Anonymous Feedback",
      description: "Enable anonymous mode to encourage honest feedback and create a psychologically safe environment.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track team sentiment over time and identify patterns to continuously improve your process.",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description:
        "SOC 2 compliant with SSO, advanced permissions, and data encryption to keep your retrospectives secure.",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need for great retrospectives
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to make your team retrospectives more engaging and actionable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="group">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
