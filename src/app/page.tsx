import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { SocialProof } from "@/components/social-proof"
import { Features } from "@/components/features"
import { ProductPreview } from "@/components/product-preview"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <SocialProof />
      <Features />
      <ProductPreview />
      <CTA />
      <Footer />
    </main>
  )
}

