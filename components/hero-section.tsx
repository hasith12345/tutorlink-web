"use client"

import { Button } from "@/components/ui/button"
import { Rocket, Pencil, Atom } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 overflow-hidden min-h-[100vh] flex pt-8 -mt-20">
      
      {/* Decorative Elements */}
      <div className="absolute top-32 left-16 opacity-20 z-0">
        <Atom className="w-20 h-20 text-white" strokeWidth={1.5} />
      </div>

      <div className="absolute top-42 left-46 z-0 opacity-80">
        <Rocket className="w-28 h-28 text-yellow-300" fill="#FDE047" strokeWidth={1.5} />
      </div>

      <div className="absolute top-46 right-45 z-0 opacity-80">
        <Pencil className="w-24 h-24 text-yellow-300" fill="#FDE047" strokeWidth={1.5} />
      </div>

      <div className="absolute top-32 right-20 opacity-20 z-0">
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="13" r="8" strokeWidth="1.5" />
          <path d="M12 5c1-2 3-2 3-2" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Decorative Circles */}
      <div className="absolute bottom-32 left-8 opacity-10">
        <svg className="w-32 h-32" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="absolute bottom-40 right-8 opacity-10">
        <svg className="w-32 h-32" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Stars */}
      <div className="absolute top-1/4 left-1/4 text-yellow-300 text-4xl opacity-70">★</div>
      <div className="absolute top-1/2 right-1/4 text-yellow-300 text-4xl opacity-70">★</div>
      <div className="absolute bottom-1/5 left-1/3 text-yellow-400 text-4xl opacity-70">★</div>
      <div className="absolute bottom-1/7 right-1/3 text-yellow-300 text-4xl opacity-70">★</div>

      {/* Left Student */}
      <div className="absolute bottom-0 md:left-[-40px] lg:left-[-80px] z-10 w-96 md:w-[450px] lg:w-[600px]">
        <div className="absolute bottom-0 left-0 w-56 h-56 lg:w-96 lg:h-96 bg-orange-500 rounded-full z-0" />
        <div className="relative z-10">
          <Image
            src="/student-left.png"
            alt="Student"
            width={600}
            height={720}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right Tutor */}
      <div className="absolute bottom-0 md:right-[-40px] lg:right-[-80px] z-10 w-96 md:w-[450px] lg:w-[600px]">
        <div className="absolute bottom-0 right-0 w-56 h-56 lg:w-96 lg:h-96 bg-blue-400 rounded-full z-0" />
        <div className="relative z-10">
          <Image
            src="/tutor-right.png"
            alt="Tutor"
            width={700}
            height={820}
            className="object-contain scale-x-[-1]"
            priority
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full pt-44 pb-10">
        <p
          className="text-3xl md:text-3xl fo text-white  text-center" style={{ fontFamily: 'var(--font-bitcount-grid-double)' }}
          
        >
          Smart way to learn
        </p>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight drop-shadow-lg">
          Innovative
          <br />
          Learning
        </h1>

        <p className="text-5xl md:text-2xl fo text-white mb-8 text-center" style={{ fontFamily: 'var(--font-delicious-handrawn)' }}>
          <span>TutorLink connects students and tutors through a secure, smart platform </span><br />
          <span>for easy class discovery, enrollment, and learning access.</span> 
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-indigo-600 text-base font-semibold px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 uppercase tracking-wide">
              <a href="/register">
              REGISTER
              </a>
            </Button>
          

          <Button
            size="lg"
            variant="outline"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 transition-all duration-300 text-base font-semibold px-10 py-6 rounded-full uppercase tracking-wide"
          >
            READ MORE
          </Button>
        </div>
      </div>
    </section>
  )
}
