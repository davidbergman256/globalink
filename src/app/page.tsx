"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function GlobalinkLanding() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState(0)
  const [openFeature, setOpenFeature] = useState(-1)
  const [scrollY, setScrollY] = useState(0)

  const heroRef = useRef<HTMLDivElement>(null)
  const processRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up")
        }
      })
    }, observerOptions)

    const elements = document.querySelectorAll(".animate-on-scroll")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const faqItems = [
    {
      question: "How do I make the first move?",
      answer: "Just sign up, we do the rest! Our platform handles all the matching and initial connections for you.",
    },
    {
      question: "How do I cancel or reschedule an event?",
      answer: "Cancel anytime on your dashboard. We understand plans change and make it easy to adjust your schedule.",
    },
    {
      question: "How do I set up my availability?",
      answer:
        "Set your preferred times and days for the week on sign up. You can update your availability whenever needed to match your schedule.",
    },
  ]

  const features = [
    {
      title: "Explore Cultures",
      color: "bg-[#FF8873]",
      content:
        "US students - learn about different cultures from international students all around the world. International students - immerse yourself in the local community.",
    },
    {
      title: "Verified Student Profiles",
      color: "bg-[#5DD19F]",
      content: "All users are verified college students!",
    },
    {
      title: "Curated Meetups",
      color: "bg-[#FFB36F]",
      content: "Make meaningful connections while doing the activities you love.",
    },
    {
      title: "Interest-Based Matching",
      color: "bg-[#15B4BA]",
      content: "Connect with students who share your hobbies, interests, and personal goals.",
    },
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: "#F9F6EE" }}>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .pulse-gentle {
          animation: pulse-gentle 4s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative min-h-screen" ref={heroRef}>
        {/* Blue dashed border frame */}
        <div
          className="border-2 border-transparent border-dashed m-4 p-8 rounded-3xl relative overflow-hidden mx-0"
          style={{ backgroundColor: "#F9F6EE" }}
        >
          {/* Header - Fixed navbar */}
          <div className="flex justify-between items-center mb-12">
            <div 
              className="h-8 transition-transform duration-300 hover:scale-105 flex items-center"
            >
              <Image 
                src="/logo.png?v=3" 
                alt="GLOBALINK" 
                width={120} 
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <button
              className="px-6 py-3 rounded-full font-bold shadow-lg transition-all duration-300 active:scale-95 hover:shadow-xl hover:translate-y-[-2px] font-chicle"
              style={{
                backgroundColor: "#FF8873",
                color: "#3B001B"
              }}
              onClick={() => window.location.href = '/login'}
            >
              Sign up
            </button>
          </div>

          {/* Hero Content - Text on left, image on right */}
          <div className="grid lg:grid-cols-2 gap-8 items-center relative z-20">
            <div>
              <h1
                className="font-bold mb-6 leading-tight animate-on-scroll font-chicle"
                style={{
                  color: "#3B001B",
                  fontSize: "80px",
                  letterSpacing: "-0.03em",
                  lineHeight: "90%"
                }}
              >
                Connect globally.<br />Belong locally.
              </h1>
              <p
                className="mb-8 leading-relaxed animate-on-scroll font-orelega"
                style={{
                  color: "#3B001B",
                  fontSize: "28px",
                  letterSpacing: "-0.04em",
                  lineHeight: "112%",
                  animationDelay: "0.2s",
                }}
              >
                Get matched with a group of student strangers to meet up over lunch, game night, or even a ceramics
                class.
              </p>
              <button
                className="px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 active:scale-95 hover:shadow-xl hover:translate-y-[-2px] animate-on-scroll"
                style={{
                  backgroundColor: "#FF8873",
                  color: "#3B001B",
                  
                  animationDelay: "0.4s",
                }}
                onClick={() => window.location.href = '/login'}
              >
                Find your circle
              </button>
            </div>

            {/* Hero Image - Right side, positioned to touch right edge */}
            <div className="relative flex items-center justify-end -mr-8">
              <Image
                src="/hero-main.png"
                alt="Students connecting globally"
                width={700}
                height={700}
                className="w-full max-w-[700px] h-auto object-contain rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Process Section - Reduced spacing */}
      <div className="py-6 relative" style={{ backgroundColor: "#F9F6EE" }} ref={processRef}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Step 1 */}
            <div className="text-center animate-on-scroll">
              <div className="flex justify-center mb-8 transition-transform duration-500 hover:scale-110">
                <Image
                  src="/tell-us-illustration.jpg"
                  alt="Tell us about yourself"
                  width={180}
                  height={180}
                  className="float-animation rounded-2xl"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
              <h3
                className="text-3xl font-bold mb-4 font-chicle"
                style={{
                  color: "#3B001B",
                }}
              >
                Tell Us About Yourself
              </h3>
              <p
                className="font-bold font-chicle"
                style={{
                  color: "#3B001B",
                }}
              >
                Sign up and take a short personality quiz.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center animate-on-scroll" style={{ animationDelay: "0.2s" }}>
              <div className="flex justify-center mb-8 transition-transform duration-500 hover:scale-110">
                <Image
                  src="/get-matched-illustration.jpg"
                  alt="Get matched"
                  width={180}
                  height={180}
                  className="float-animation rounded-2xl"
                  style={{ animationDelay: "1s" }}
                />
              </div>
              <h3
                className="text-3xl font-bold mb-4 font-chicle"
                style={{
                  color: "#3B001B",
                }}
              >
                Get Matched
              </h3>
              <p
                className="font-bold font-chicle"
                style={{
                  color: "#3B001B",
                }}
              >
                We connect you with students from different cultural backgrounds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center animate-on-scroll" style={{ animationDelay: "0.4s" }}>
              <div className="flex justify-center mb-8 transition-transform duration-500 hover:scale-110">
                <Image
                  src="/meet-person-illustration.jpg"
                  alt="Meet in person"
                  width={180}
                  height={180}
                  className="float-animation rounded-2xl"
                  style={{ animationDelay: "1.5s" }}
                />
              </div>
              <h3
                className="text-3xl font-bold mb-4 font-chicle"
                style={{
                  color: "#3B001B",
                }}
              >
                Meet In Person
              </h3>
              <p
                className="font-bold font-chicle"
                style={{
                  color: "#3B001B",
                }}
              >
                Attend a fun gathering near campus and enjoy your shared hobbies together!
              </p>
            </div>
          </div>

          {/* Stats Section - Compact and exciting */}
          <div className="relative animate-on-scroll">
            <div className="h-16 w-full rounded-t-3xl" style={{ backgroundColor: "#5DD19F" }} />

            <div className="py-12" style={{ backgroundColor: "#5DD19F" }}>
              <div
                className="max-w-lg mx-auto rounded-3xl py-12 px-8 text-center shadow-2xl transform transition-all duration-500 hover:scale-105 hover:rotate-1 pulse-gentle"
                style={{
                  backgroundColor: "#15B4BA",
                  background: "linear-gradient(135deg, #15B4BA 0%, #5DD19F 100%)",
                }}
              >
                <div
                  className="text-6xl font-bold mb-2 animate-on-scroll flex items-center justify-center"
                  style={{
                    color: "#3B001B",
                    
                    textShadow: "0 4px 8px rgba(59, 0, 27, 0.1)",
                  }}
                >
                  4<span style={{ color: "#FF8873" }}>+</span>
                </div>
                <div
                  className="text-xl font-bold"
                  style={{
                    color: "#3B001B",
                    
                  }}
                >
                  Meetups Organized
                </div>
              </div>
            </div>

            <div className="h-16 w-full rounded-b-3xl" style={{ backgroundColor: "#5DD19F" }} />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20" style={{ backgroundColor: "#F9F6EE" }} ref={featuresRef}>
        <div className="max-w-4xl mx-auto px-4">
          <h2
            className="text-6xl font-bold text-center mb-8 animate-on-scroll"
            style={{
              color: "#15B4BA",
              
            }}
          >
            Why Choose Globalink?
          </h2>
          <p
            className="text-xl text-center mb-16 font-bold animate-on-scroll"
            style={{
              color: "#3B001B",
              
              animationDelay: "0.2s",
            }}
          >
            You don&apos;t need 50 new contacts. You need 5 real ones.
          </p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 animate-on-scroll`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setOpenFeature(openFeature === index ? -1 : index)}
              >
                <div className="flex justify-between items-center">
                  <h3
                    className="text-3xl font-bold"
                    style={{
                      color: "#3B001B",
                      
                    }}
                  >
                    {feature.title}
                  </h3>
                  <Plus
                    className="w-10 h-10 transition-all duration-300"
                    style={{
                      color: "#3B001B",
                      transform: openFeature === index ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  />
                </div>
                {openFeature === index && (
                  <div className="mt-6 pt-6 border-t border-black/20 animate-fade-in-up">
                    <p
                      className="font-bold text-lg"
                      style={{
                        color: "#3B001B",
                        
                      }}
                    >
                      {feature.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative" ref={faqRef}>
        <div className="py-20" style={{ backgroundColor: "#FF8873" }}>
          <div className="max-w-4xl mx-auto px-4">
            <h2
              className="text-6xl font-bold text-center mb-16 animate-on-scroll"
              style={{
                color: "#3B001B",
                
              }}
            >
              You ask, we answer.
            </h2>

            <div className="p-10 rounded-3xl animate-on-scroll" style={{ backgroundColor: "#15B4BA" }}>
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="animate-on-scroll" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div
                      className="rounded-full p-6 cursor-pointer flex justify-between items-center transition-all duration-300 hover:shadow-lg hover:scale-105"
                      style={{ backgroundColor: "#FAFABF" }}
                      onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    >
                      <span
                        className="font-bold text-lg"
                        style={{
                          color: "#3B001B",
                          
                        }}
                      >
                        {item.question}
                      </span>
                      <div
                        className="rounded-full p-3 transition-all duration-300"
                        style={{ backgroundColor: "#5DD19F" }}
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${
                            openFaq === index ? "rotate-180" : ""
                          }`}
                          style={{ color: "#3B001B" }}
                        />
                      </div>
                    </div>
                    {openFaq === index && (
                      <div
                        className="rounded-3xl p-6 mt-4 ml-6 animate-fade-in-up"
                        style={{ backgroundColor: "#5DD19F" }}
                      >
                        <p
                          className="font-bold"
                          style={{
                            color: "#3B001B",
                            
                          }}
                        >
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section - Two rows with button */}
        <div className="py-20" style={{ backgroundColor: "#5DD19F" }}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2
              className="text-6xl font-bold mb-4 leading-tight animate-on-scroll"
              style={{
                color: "#3B001B",
                
              }}
            >
              From foreign to familiar –
            </h2>
            <h2
              className="text-6xl font-bold mb-8 leading-tight animate-on-scroll"
              style={{
                color: "#3B001B",
                
                animationDelay: "0.1s",
              }}
            >
              one small group at a time
            </h2>
            <p
              className="text-2xl mb-12 font-bold animate-on-scroll"
              style={{
                color: "#3B001B",
                
                animationDelay: "0.2s",
              }}
            >
              You don&apos;t need 50 new contacts—you need 5 real ones.
            </p>
            <button
              className="px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 active:scale-95 hover:shadow-xl hover:translate-y-[-2px] animate-on-scroll"
              style={{
                backgroundColor: "#FF8873",
                color: "#3B001B",
                
                animationDelay: "0.4s",
              }}
              onClick={() => window.location.href = '/login'}
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Footer - Centered icons, bigger */}
        <div className="border-2 border-blue-400 border-dashed m-4 rounded-3xl" style={{ backgroundColor: "#FFB36F" }}>
          <div className="p-12">
            <div className="flex justify-center items-center space-x-20">
              <button
                className="font-bold text-2xl transition-all duration-300 hover:scale-125 hover:text-white"
                style={{
                  color: "#3B001B",
                }}
              >
                Home
              </button>
              <button
                className="font-bold text-2xl transition-all duration-300 hover:scale-125 hover:text-white"
                style={{
                  color: "#3B001B",
                }}
                onClick={() => (window.location.href = "mailto:globalink.supp@gmail.com")}
              >
                Email
              </button>
              <button
                className="font-bold text-2xl transition-all duration-300 hover:scale-125 hover:text-white"
                style={{
                  color: "#3B001B",
                }}
              >
                Instagram
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
