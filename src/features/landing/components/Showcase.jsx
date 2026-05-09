import { showcaseItems } from '@/features/landing/data/chapters'
import { ScrollRevealDetailSection } from '@/features/landing/components/ScrollRevealDetailSection'

function Showcase() {
  return (
    <ScrollRevealDetailSection
      id="craft"
      ariaLabel="Craft details"
      eyebrow="The Details"
      title="Why each carpet feels different."
      intro="Honest materials, slow craft, lasting design. Four quiet principles guide every Firdaus piece."
      items={showcaseItems}
    />
  )
}

export { Showcase }
