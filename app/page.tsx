import { Navbar } from "../components/navbar"
import { HeroSection } from "../components/hero-section"
import { StudentBenefits } from "../components/student-benefits"
import { TutorBenefits } from "../components/tutor-benefits"
import { PlatformFeatures } from "../components/platform-features"
import { CallToAction } from "../components/call-to-action"
import { Footer } from "../components/footer"
import HowTutorLinkWorks from "../components/how-tutorlink-works"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <HeroSection />
        <HowTutorLinkWorks />
        <StudentBenefits />
        <TutorBenefits />
        <PlatformFeatures />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
