'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/SupabaseProvider'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import type { QuestionnaireAnswers } from '@/lib/types'

export default function QuestionnairePage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({})
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#698a7b]"></div>
      </div>
    )
  }

  const getTotalSteps = () => {
    let steps = 6 // Core questions

    // Add branching questions
    if (answers.activity === 'trying_foods') steps += 2 // Q6, Q7
    if (answers.activity === 'gaming_online') steps += 2 // Q8, Q9
    if (answers.challenge === 'missing_home') steps += 1 // Q10

    // Add optional questions
    steps += 2 // Q11, Q12

    return steps
  }

  const handleAnswer = (key: keyof QuestionnaireAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
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
    let skipTo = 6 // After core questions
    
    if (answers.activity === 'trying_foods') skipTo += 2
    if (answers.activity === 'gaming_online') skipTo += 2
    if (answers.challenge === 'missing_home') skipTo += 1
    
    setCurrentStep(skipTo + 1)
  }

  const submitQuestionnaire = async () => {
    setLoading(true)
    
    try {
      // Validate required fields
      if (!answers.display_name || !answers.from_location || !answers.current_location || !answers.personality || !answers.challenge || !answers.activity) {
        throw new Error('Please complete all required questions')
      }

      // Save complete profile
      const profileData = {
        user_id: user.id,
        display_name: answers.display_name.trim(),
        from_location: answers.from_location.trim(),
        current_location: answers.current_location.trim(),
        personality: answers.personality,
        challenge: answers.challenge,
        pref_activity: answers.activity,
        branches: {
          challenge_other: answers.challenge_other?.trim() || null,
          activity_other: answers.activity_other?.trim() || null,
          favorite_dish: answers.favorite_dish?.trim() || null,
          likes_spicy: answers.likes_spicy,
          gaming_platform: answers.gaming_platform || null,
          current_game: answers.current_game?.trim() || null,
          cultural_pref: answers.cultural_pref || null,
          study_snack: answers.study_snack?.trim() || null,
          current_song: answers.current_song?.trim() || null
        }
      }

      console.log('Submitting profile data:', profileData)

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
      
      console.log('Adding user to queue with campus:', campus)
      
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

      console.log('Questionnaire completed successfully, redirecting to dashboard')
      router.push('/')

    } catch (error: any) {
      console.error('Error submitting questionnaire:', error)
      alert(`Error completing questionnaire: ${error.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentQuestion = () => {
    const coreQuestions = 6
    let branchingStart = coreQuestions

    // Core questions (1-5)
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
            title: "Where are you originally from?",
            type: "text" as const,
            key: "from_location" as const,
            placeholder: "e.g., Tokyo, Japan"
          }

        case 3:
          return {
            title: "Where do you live now?",
            type: "text" as const,
            key: "current_location" as const,
            placeholder: "e.g., Boston, MA"
          }

        case 4:
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

        case 5:
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

        case 6:
          return {
            title: "How do you prefer to spend time with friends?",
            type: "choice" as const,
            key: "activity" as const,
            options: [
              { value: "studying_together", label: "Studying together" },
              { value: "exploring_city", label: "Exploring the city" },
              { value: "gaming_online", label: "Playing games online" },
              { value: "trying_foods", label: "Trying new foods" },
              { value: "other", label: "Other", hasOther: true, otherKey: "activity_other" }
            ]
          }
      }
    }

    // Branching questions
    let branchStep = currentStep - coreQuestions

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
    return value !== undefined && value !== null
  }

  const isOptionalSection = question.optional

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
                  {option.hasOther && answers[question.key] === option.value && (
                    <input
                      type="text"
                      value={answers[option.otherKey as keyof QuestionnaireAnswers] || ''}
                      onChange={(e) => handleAnswer(option.otherKey as keyof QuestionnaireAnswers, e.target.value)}
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
              {!isOptionalSection && currentStep === 6 && (
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