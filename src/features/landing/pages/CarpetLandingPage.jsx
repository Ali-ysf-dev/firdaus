import { Header } from '@/features/landing/components/Header'
import { HeroSequence } from '@/features/landing/components/HeroSequence'
import { StoryChapter } from '@/features/landing/components/StoryChapter'
import { Showcase } from '@/features/landing/components/Showcase'
import { CtaSection } from '@/features/landing/components/CtaSection'
import { Footer } from '@/features/landing/components/Footer'

function CarpetLandingPage() {
  return (
    <div id="top" className="dark min-h-screen bg-stone-950 text-stone-100">
      <Header />

      <main>
        <HeroSequence />

        <StoryChapter
          id="story"
          align="start"
          eyebrow="The Beginning"
          title="A thread, before it becomes a story."
          body="In a quiet workshop, the first knot is tied. There is no rush — only patience, intention, and a steady rhythm passed between generations."
        />

        <StoryChapter
          align="end"
          eyebrow="The Pattern"
          title="Patterns that remember where they came from."
          body="Each motif is drawn from places, prayers, and everyday objects. They are not decoration — they are quiet messages woven into the warp."
        />

        <Showcase />

        <StoryChapter
          id="collection"
          align="center"
          eyebrow="The Carpet"
          title="What stays after everything else fades."
          body="Furniture changes. Walls are painted. A great carpet remains — gathering footsteps, light, and time, becoming more itself with every year."
        />

        <CtaSection />
      </main>

      <Footer />
    </div>
  )
}

export { CarpetLandingPage }
