'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/SupabaseProvider'
import { ArrowRight, ArrowLeft, CheckCircle, Calendar, Clock } from 'lucide-react'
import type { QuestionnaireAnswers, WeeklyAvailability } from '@/lib/types'

// Helper functions for availability calendar
const getWeekDates = () => {
  const today = new Date()
  const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  const monday = new Date(today)
  monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)) // Get this week's Monday
  
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    dates.push(date)
  }
  return dates
}

const formatDateForDisplay = (date: Date) => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatDateKey = (date: Date) => {
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

export default function QuestionnairePage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({})
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Initialize availability with all slots available (user clicks to mark unavailable)
  useEffect(() => {
    if (!answers.availability) {
      const weekDates = getWeekDates()
      const initialAvailability: WeeklyAvailability = {}
      
      weekDates.forEach(date => {
        const dateKey = formatDateKey(date)
        initialAvailability[dateKey] = {
          afternoon: true,  // Default: available
          evening: true     // Default: available
        }
      })
      
      setAnswers(prev => ({ ...prev, availability: initialAvailability }))
    }
  }, [answers.availability])

  // Simple auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log('User found in questionnaire:', session.user.email)
        setUser(session.user)
      } else {
        console.log('No user found, redirecting to login')
        router.push('/login')
        return
      }
      
      setAuthChecked(true)
    }

    checkAuth()
  }, [supabase, router])

  // Don't render until auth is checked
  if (!authChecked || !user) {
    return (
      <div className="min-h-screen bg-[#F5F2EA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#698a7b]"></div>
      </div>
    )
  }

  const getTotalSteps = () => {
    let steps = 8 // Core questions (including age and availability)

    // Add branching questions
    if (answers.activity === 'sports') steps += 2 // Q9, Q10
    if (answers.activity === 'trying_foods') steps += 2 // Q11, Q12
    if (answers.activity === 'gaming_online') steps += 2 // Q13, Q14
    if (answers.challenge === 'missing_home') steps += 1 // Q15

    // Add optional questions
    steps += 2 // Q16, Q17

    return steps
  }

  const handleAnswer = (key: keyof QuestionnaireAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const handleAvailabilityToggle = (dateKey: string, slot: 'afternoon' | 'evening') => {
    setAnswers(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [dateKey]: {
          afternoon: prev.availability?.[dateKey]?.afternoon ?? true,
          evening: prev.availability?.[dateKey]?.evening ?? true,
          [slot]: !prev.availability?.[dateKey]?.[slot]
        }
      }
    }))
  }

  const nextStep = () => {
    const totalSteps = getTotalSteps()
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    } else {
      submitQuestionnaire()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const skipToOptional = () => {
    // Skip to first optional question
    let skipTo = 8 // After core questions
    
    if (answers.activity === 'sports') skipTo += 2
    if (answers.activity === 'trying_foods') skipTo += 2
    if (answers.activity === 'gaming_online') skipTo += 2
    if (answers.challenge === 'missing_home') skipTo += 1
    
    setCurrentStep(skipTo + 1)
  }

  const submitQuestionnaire = async () => {
    setLoading(true)
    
    try {
      // Validate required fields
      if (!answers.display_name || !answers.age || !answers.from_location || !answers.current_location || !answers.personality || !answers.challenge || !answers.activity || !answers.availability) {
        throw new Error('Please complete all required questions')
      }

      // Validate age
      if (answers.age < 16 || answers.age > 99) {
        throw new Error('Please enter a valid age between 16 and 99')
      }

      // Save complete profile
      const profileData = {
        user_id: user.id,
        display_name: answers.display_name.trim(),
        email: user.email,
        age: answers.age,
        from_location: answers.from_location.trim(),
        current_location: answers.current_location.trim(),
        personality: answers.personality,
        challenge: answers.challenge,
        pref_activity: answers.activity,
        availability: answers.availability,
        branches: {
          challenge_other: answers.challenge_other?.trim() || null,
          activity_other: answers.activity_other?.trim() || null,
          favorite_sport: answers.favorite_sport?.trim() || null,
          sport_experience: answers.sport_experience || null,
          favorite_dish: answers.favorite_dish?.trim() || null,
          likes_spicy: answers.likes_spicy,
          gaming_platform: answers.gaming_platform || null,
          current_game: answers.current_game?.trim() || null,
          cultural_pref: answers.cultural_pref || null,
          study_snack: answers.study_snack?.trim() || null,
          current_song: answers.current_song?.trim() || null
        }
      }

      // Upsert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })

      if (profileError) {
        console.error('Profile error:', profileError)
        throw new Error(`Failed to save profile: ${profileError.message}`)
      }

      // Immediately add to queue for matching (reduce churn)
      const campus = answers.current_location.trim()
      
      const { error: queueError } = await supabase
        .from('queue')
        .upsert({
          user_id: user.id,
          campus: campus
        }, { onConflict: 'user_id' })

      if (queueError) {
        console.error('Queue error:', queueError)
        // Don't fail the entire process if queue insertion fails
        console.warn('Failed to add to queue, but profile was saved successfully')
      }

      router.push('/')

    } catch (error: any) {
      console.error('Error submitting questionnaire:', error)
      alert(`Error completing questionnaire: ${error.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentQuestion = () => {
    const coreQuestions = 8
    let branchingStart = coreQuestions

    // Core questions (1-8)
    if (currentStep <= coreQuestions) {
      switch (currentStep) {
        case 1:
          return {
            title: "What should we call you?",
            type: "text" as const,
            key: "display_name" as const,
            placeholder: "e.g., Alex, Sam, Jordan..."
          }

        case 2:
          return {
            title: "What's your age?",
            type: "number" as const,
            key: "age" as const,
            placeholder: "e.g., 20"
          }

        case 3:
          return {
            title: "Where are you originally from?",
            type: "text" as const,
            key: "from_location" as const,
            placeholder: "e.g., Tokyo, Japan"
          }

        case 4:
          return {
            title: "Where do you live now?",
            type: "text" as const,
            key: "current_location" as const,
            placeholder: "e.g., Boston, MA"
          }

        case 5:
          return {
            title: "Would you describe yourself as:",
            type: "choice" as const,
            key: "personality" as const,
            options: [
              { value: "outgoing", label: "Outgoing (love meeting new people)" },
              { value: "shy_at_first", label: "Shy at first (but warm up later)" },
              { value: "somewhere_in_between", label: "Somewhere in between" }
            ]
          }

        case 6:
          return {
            title: "What's been the hardest part about making friends here?",
            type: "choice" as const,
            key: "challenge" as const,
            options: [
              { value: "language_barriers", label: "Language barriers" },
              { value: "missing_home", label: "Missing home" },
              { value: "finding_interests", label: "Finding people with similar interests" },
              { value: "other", label: "Other", hasOther: true, otherKey: "challenge_other" }
            ]
          }

        case 7:
          return {
            title: "How do you prefer to spend time with friends?",
            type: "choice" as const,
            key: "activity" as const,
            options: [
              { value: "sports", label: "Playing sports" },
              { value: "exploring_city", label: "Exploring the city" },
              { value: "gaming_online", label: "Playing games online" },
              { value: "trying_foods", label: "Trying new foods" },
              { value: "other", label: "Other", hasOther: true, otherKey: "activity_other" }
            ]
          }

        case 8:
          return {
            title: "When are you NOT available this week?",
            type: "availability" as const,
            key: "availability" as const,
            subtitle: "Click on times when you're busy or unavailable (we start events at 4pm earliest)"
          }
      }
    }

    // Branching questions
    let branchStep = currentStep - coreQuestions

    // Sports branching (if chose "sports")
    if (answers.activity === 'sports') {
      if (branchStep === 1) {
        return {
          title: "What's your favorite sport to play?",
          type: "text" as const,
          key: "favorite_sport" as const,
          placeholder: "e.g., Basketball, Soccer, Tennis, Volleyball..."
        }
      }
      if (branchStep === 2) {
        return {
          title: "How would you describe your experience level?",
          type: "choice" as const,
          key: "sport_experience" as const,
          options: [
            { value: "beginner", label: "Beginner (just starting out)" },
            { value: "intermediate", label: "Intermediate (play occasionally)" },
            { value: "advanced", label: "Advanced (very experienced)" }
          ]
        }
      }
      branchStep -= 2
    }

    // Food branching (if chose "trying_foods")
    if (answers.activity === 'trying_foods') {
      if (branchStep === 1) {
        return {
          title: "What's one dish from your country you'd love to share?",
          type: "text" as const,
          key: "favorite_dish" as const,
          placeholder: "e.g., Ramen, Tacos, Pierogi..."
        }
      }
      if (branchStep === 2) {
        return {
          title: "Do you like spicy food?",
          type: "choice" as const,
          key: "likes_spicy" as const,
          options: [
            { value: true, label: "Yes, bring on the heat! 🌶️" },
            { value: false, label: "No, I prefer mild flavors" }
          ]
        }
      }
      branchStep -= 2
    }

    // Gaming branching (if chose "gaming_online")
    if (answers.activity === 'gaming_online') {
      if (branchStep === 1) {
        return {
          title: "Do you play on:",
          type: "choice" as const,
          key: "gaming_platform" as const,
          options: [
            { value: "console", label: "Console (PS5, Xbox, Nintendo)" },
            { value: "pc", label: "PC" },
            { value: "mobile", label: "Mobile" },
            { value: "all", label: "All of the above" }
          ]
        }
      }
      if (branchStep === 2) {
        return {
          title: "What game are you playing most right now?",
          type: "text" as const,
          key: "current_game" as const,
          placeholder: "e.g., League of Legends, Valorant, Among Us..."
        }
      }
      branchStep -= 2
    }

    // Cultural preference branching (if answered "missing_home")
    if (answers.challenge === 'missing_home') {
      if (branchStep === 1) {
        return {
          title: "Would you prefer friends:",
          type: "choice" as const,
          key: "cultural_pref" as const,
          options: [
            { value: "same_culture", label: "From similar cultural backgrounds" },
            { value: "different_culture", label: "From completely different cultures" },
            { value: "doesnt_matter", label: "Doesn't matter" }
          ]
        }
      }
      branchStep -= 1
    }

    // Optional questions
    const optionalStart = branchStep
    if (optionalStart === 1) {
      return {
        title: "What's your favourite study snack?",
        type: "text" as const,
        key: "study_snack" as const,
        placeholder: "e.g., Coffee and cookies, Trail mix, Bubble tea...",
        optional: true
      }
    }

    if (optionalStart === 2) {
      return {
        title: "Share a song you've been listening to a lot lately!",
        type: "text" as const,
        key: "current_song" as const,
        placeholder: "e.g., Artist - Song Title",
        optional: true
      }
    }

    return null
  }

  const question = getCurrentQuestion()
  const totalSteps = getTotalSteps()
  const progress = (currentStep / totalSteps) * 100

  if (!question) {
    return <div>Error: Invalid question step</div>
  }

  const canGoNext = () => {
    if (question.optional) return true
    
    const value = answers[question.key]
    
    if (question.type === "text") {
      return value && value.toString().trim().length > 0
    }
    
    if (question.type === "number") {
      return value && typeof value === 'number' && value > 0
    }
    
    if (question.type === "availability") {
      const availability = answers.availability
      if (!availability) return false
      
      // Always allow progression for availability (they can mark all as unavailable if needed)
      return true
    }
    
    return value !== undefined && value !== null
  }

  const isOptionalSection = question.optional

  return (
    <div className="min-h-screen bg-[#F5F2EA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#698a7b] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Optional Section Header */}
        {isOptionalSection && currentStep === getTotalSteps() - 2 && (
                     <div className="text-center mb-8 p-4 bg-[#f0f4f2] border border-[#7a9d8c] rounded-lg">
                         <h3 className="text-lg font-medium text-[#3e5249] mb-2">
               🎉 Almost done! Fun questions ahead
             </h3>
             <p className="text-[#5a7a6b] text-sm">
              These last few questions help us match you better, but feel free to skip any!
            </p>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-[#F9F6EE] rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {question.title}
            </h2>
            {question.optional && (
              <p className="text-sm text-gray-500">Optional question - feel free to skip!</p>
            )}
          </div>

          {question.type === "text" && (
            <div className="mb-6">
              <input
                type="text"
                value={answers[question.key] || ''}
                onChange={(e) => handleAnswer(question.key, e.target.value)}
                placeholder={question.placeholder}
                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#698a7b] focus:border-[#698a7b] text-lg"
                autoFocus
              />
            </div>
          )}

          {question.type === "number" && (
            <div className="mb-6">
              <input
                type="number"
                value={answers[question.key] || ''}
                onChange={(e) => handleAnswer(question.key, parseInt(e.target.value) || 0)}
                placeholder={question.placeholder}
                min="16"
                max="99"
                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#698a7b] focus:border-[#698a7b] text-lg"
                autoFocus
              />
            </div>
          )}

          {question.type === "availability" && (
            <div className="mb-6">
              {question.subtitle && (
                <p className="text-gray-600 mb-4">{question.subtitle}</p>
              )}
              
              <div className="space-y-4">
                {getWeekDates().map(date => {
                  const dateKey = formatDateKey(date)
                  const dayAvailability = answers.availability?.[dateKey]
                  
                  return (
                    <div key={dateKey} className="bg-[#F5F2EA] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="font-medium text-gray-900">
                            {formatDateForDisplay(date)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleAvailabilityToggle(dateKey, 'afternoon')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            dayAvailability?.afternoon === false
                              ? 'border-yellow-500 bg-yellow-100 text-yellow-800'
                              : 'border-green-300 bg-green-50 hover:border-green-400 text-green-700'
                          }`}
                        >
                          <div className="flex items-center justify-center flex-col">
                            <Clock className="h-4 w-4 mb-1" />
                            <span className="text-sm font-medium">Afternoon</span>
                            <span className="text-xs">4pm - 7pm</span>
                            {dayAvailability?.afternoon === false && (
                              <span className="text-xs font-medium mt-1">UNAVAILABLE</span>
                            )}
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleAvailabilityToggle(dateKey, 'evening')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            dayAvailability?.evening === false
                              ? 'border-yellow-500 bg-yellow-100 text-yellow-800'
                              : 'border-green-300 bg-green-50 hover:border-green-400 text-green-700'
                          }`}
                        >
                          <div className="flex items-center justify-center flex-col">
                            <Clock className="h-4 w-4 mb-1" />
                            <span className="text-sm font-medium">Evening</span>
                            <span className="text-xs">7pm - 10pm</span>
                            {dayAvailability?.evening === false && (
                              <span className="text-xs font-medium mt-1">UNAVAILABLE</span>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 Click on times when you&apos;re busy or unavailable. Green = Available, Yellow = Unavailable
                </p>
              </div>
            </div>
          )}

          {question.type === "choice" && (
            <div className="space-y-3 mb-6">
              {question.options?.map((option) => (
                <div key={option.value.toString()}>
                  <button
                    onClick={() => handleAnswer(question.key, option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[question.key] === option.value
                        ? 'border-[#698a7b] bg-[#f0f4f2] text-[#3e5249]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                                             {answers[question.key] === option.value && (
                         <CheckCircle className="h-5 w-5 text-[#698a7b]" />
                       )}
                    </div>
                  </button>
                  
                  {/* Other input field */}
                  {'hasOther' in option && option.hasOther && answers[question.key] === option.value && (
                    <input
                      type="text"
                      value={('otherKey' in option && option.otherKey) ? String(answers[option.otherKey as keyof QuestionnaireAnswers] || '') : ''}
                      onChange={(e) => ('otherKey' in option && option.otherKey) && handleAnswer(option.otherKey as keyof QuestionnaireAnswers, e.target.value)}
                      placeholder="Please specify..."
                                             className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#698a7b] focus:border-[#698a7b]"
                      autoFocus
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 rounded-md font-medium ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>

            <div className="flex space-x-3">
              {/* Skip button for optional questions */}
              {isOptionalSection && currentStep < totalSteps && (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Skip
                </button>
              )}

              {/* Skip to optional section */}
              {!isOptionalSection && currentStep === 8 && (
                                 <button
                   onClick={skipToOptional}
                   className="px-6 py-2 text-[#698a7b] hover:text-[#5a7a6b] font-medium"
                 >
                   Skip branching →
                 </button>
              )}

              <button
                onClick={nextStep}
                disabled={!canGoNext() || loading}
                className={`flex items-center px-6 py-2 rounded-md font-medium ${
                                     !canGoNext() || loading
                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     : 'bg-[#698a7b] text-white hover:bg-[#5a7a6b]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finishing...
                  </>
                ) : currentStep === totalSteps ? (
                  'Complete & Find My Crew!'
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Helper text */}
        <div className="text-center mt-6 text-sm text-gray-500">
          {currentStep === totalSteps ? (
            "🎉 Ready to find your crew! We'll add you to the matching queue right away."
          ) : isOptionalSection ? (
            "These questions help us make better matches - but they're totally optional!"
          ) : (
            "Help us find the perfect people for you to meet"
          )}
        </div>
      </div>
    </div>
  )
} 