'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/SupabaseProvider'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import type { QuestionnaireAnswers } from '@/lib/types'

export default function QuestionnairePage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({})
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Check if user is authenticated with better session handling
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth error:', error)
          router.push('/login')
          return
        }

        if (!user) {
          // Wait a bit and try again in case session is still loading
          setTimeout(async () => {
            const { data: { user: retryUser } } = await supabase.auth.getUser()
            if (!retryUser) {
              router.push('/login')
            } else {
              setUser(retryUser)
              setAuthLoading(false)
            }
          }, 1000)
        } else {
          setUser(user)
          setAuthLoading(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      } else if (session?.user) {
        setUser(session.user)
        setAuthLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  // Don't render anything while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const totalSteps = getCurrentTotalSteps()

  function getCurrentTotalSteps() {
    let base = 5 // Base questions 1-5
    
    if (answers.activity === 'trying_foods') base += 2 // Q6a, Q6b
    if (answers.activity === 'gaming_online') base += 2 // Q7a, Q7b
    if (answers.challenge === 'missing_home') base += 1 // Q8
    
    // Optional questions
    if (currentStep > base) {
      return base + 3 // Add optional questions
    }
    return base
  }

  const handleAnswer = (key: keyof QuestionnaireAnswers, value: any) => {
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)
    
    // Auto-save draft
    saveDraft(newAnswers)
  }

  const saveDraft = async (draftAnswers: Partial<QuestionnaireAnswers>) => {
    if (!user) return
    
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      const profileData = {
        user_id: user.id,
        from_location: draftAnswers.from_location || null,
        current_location: draftAnswers.current_location || null,
        personality: draftAnswers.personality || null,
        pref_activity: draftAnswers.activity || null,
        branches: {
          challenge: draftAnswers.challenge,
          favorite_dish: draftAnswers.favorite_dish,
          likes_spicy: draftAnswers.likes_spicy,
          gaming_platform: draftAnswers.gaming_platform,
          current_game: draftAnswers.current_game,
          cultural_pref: draftAnswers.cultural_pref,
          party_size: draftAnswers.party_size,
          study_snack: draftAnswers.study_snack,
          current_song: draftAnswers.current_song
        }
      }

      if (existingProfile) {
        await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('profiles')
          .insert(profileData)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    
    try {
      // Validate required fields
      if (!answers.from_location || !answers.current_location || !answers.personality || !answers.challenge || !answers.activity) {
        throw new Error('Please complete all required questions')
      }

      // Final save with completion
      await saveDraft(answers)
      
      // Redirect to dashboard
      router.push('/')
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderQuestion = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Where are you originally from?</h2>
            <input
              type="text"
              placeholder="e.g. Prague, Czech Republic"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={answers.from_location || ''}
              onChange={(e) => handleAnswer('from_location', e.target.value)}
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Where do you live now?</h2>
            <input
              type="text"
              placeholder="e.g. Boston, MA"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={answers.current_location || ''}
              onChange={(e) => handleAnswer('current_location', e.target.value)}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Which best describes you?</h2>
            <div className="space-y-3">
              {[
                { value: 'outgoing', label: 'Outgoing' },
                { value: 'shy_at_first', label: 'Shy at first' },
                { value: 'somewhere_in_between', label: 'Somewhere in between' }
              ].map((option) => (
                <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="personality"
                    value={option.value}
                    checked={answers.personality === option.value}
                    onChange={(e) => handleAnswer('personality', e.target.value)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Hardest part about making friends here?</h2>
            <div className="space-y-3">
              {[
                { value: 'language_barriers', label: 'Language barriers' },
                { value: 'missing_home', label: 'Missing home' },
                { value: 'finding_interests', label: 'Finding similar interests' },
                { value: 'other', label: 'Other' }
              ].map((option) => (
                <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="challenge"
                    value={option.value}
                    checked={answers.challenge === option.value}
                    onChange={(e) => handleAnswer('challenge', e.target.value)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">How do you like to hang out?</h2>
            <div className="space-y-3">
              {[
                { value: 'studying_together', label: 'Studying together' },
                { value: 'exploring_city', label: 'Exploring the city' },
                { value: 'gaming_online', label: 'Playing games online' },
                { value: 'trying_foods', label: 'Trying new foods' },
                { value: 'other', label: 'Other' }
              ].map((option) => (
                <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="activity"
                    value={option.value}
                    checked={answers.activity === option.value}
                    onChange={(e) => handleAnswer('activity', e.target.value)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      // Branching questions for "Trying new foods"
      case 6:
        if (answers.activity === 'trying_foods') {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">One dish you'd share?</h2>
              <input
                type="text"
                placeholder="e.g. Pad Thai"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                value={answers.favorite_dish || ''}
                onChange={(e) => handleAnswer('favorite_dish', e.target.value)}
              />
            </div>
          )
        }
        // Skip if not food
        setCurrentStep(prev => prev + 1)
        return null

      case 7:
        if (answers.activity === 'trying_foods') {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Like spicy food?</h2>
              <div className="space-y-3">
                {[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' }
                ].map((option) => (
                  <label key={option.value.toString()} className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="likes_spicy"
                      value={option.value.toString()}
                      checked={answers.likes_spicy === option.value}
                      onChange={(e) => handleAnswer('likes_spicy', e.target.value === 'true')}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        } else if (answers.activity === 'gaming_online') {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">What platform?</h2>
              <div className="space-y-3">
                {[
                  { value: 'console', label: 'Console' },
                  { value: 'pc', label: 'PC' },
                  { value: 'mobile', label: 'Mobile' },
                  { value: 'all', label: 'All' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="gaming_platform"
                      value={option.value}
                      checked={answers.gaming_platform === option.value}
                      onChange={(e) => handleAnswer('gaming_platform', e.target.value)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        }
        setCurrentStep(prev => prev + 1)
        return null

      case 8:
        if (answers.activity === 'gaming_online') {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Game you play most now?</h2>
              <input
                type="text"
                placeholder="e.g. Valorant"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                value={answers.current_game || ''}
                onChange={(e) => handleAnswer('current_game', e.target.value)}
              />
            </div>
          )
        } else if (answers.challenge === 'missing_home') {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Prefer friends...</h2>
              <div className="space-y-3">
                {[
                  { value: 'same_culture', label: 'Same culture' },
                  { value: 'different_culture', label: 'Different culture' },
                  { value: 'doesnt_matter', label: "Doesn't matter" }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="cultural_pref"
                      value={option.value}
                      checked={answers.cultural_pref === option.value}
                      onChange={(e) => handleAnswer('cultural_pref', e.target.value)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        }
        setCurrentStep(prev => prev + 1)
        return null

      // Optional questions
      default:
        const optionalStep = currentStep - getCurrentBasicSteps()
        
        if (optionalStep === 1) {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Quick pick: Big party or small gathering?</h2>
              <div className="space-y-3">
                {[
                  { value: 'big', label: 'Big' },
                  { value: 'small', label: 'Small' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="party_size"
                      value={option.value}
                      checked={answers.party_size === option.value}
                      onChange={(e) => handleAnswer('party_size', e.target.value)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        } else if (optionalStep === 2) {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Favourite study snack?</h2>
              <input
                type="text"
                placeholder="e.g. Trail mix"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                value={answers.study_snack || ''}
                onChange={(e) => handleAnswer('study_snack', e.target.value)}
              />
            </div>
          )
        } else if (optionalStep === 3) {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Song on repeat?</h2>
              <input
                type="text"
                placeholder="e.g. Bad Habit by Steve Lacy"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                value={answers.current_song || ''}
                onChange={(e) => handleAnswer('current_song', e.target.value)}
              />
            </div>
          )
        }
        return null
    }
  }

  function getCurrentBasicSteps() {
    let base = 5
    if (answers.activity === 'trying_foods') base += 2
    if (answers.activity === 'gaming_online') base += 2
    if (answers.challenge === 'missing_home') base += 1
    return base
  }

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1: return !!answers.from_location
      case 2: return !!answers.current_location
      case 3: return !!answers.personality
      case 4: return !!answers.challenge
      case 5: return !!answers.activity
      case 6: return answers.activity !== 'trying_foods' || !!answers.favorite_dish
      case 7: 
        if (answers.activity === 'trying_foods') return answers.likes_spicy !== undefined
        if (answers.activity === 'gaming_online') return !!answers.gaming_platform
        return true
      case 8:
        if (answers.activity === 'gaming_online') return !!answers.current_game
        if (answers.challenge === 'missing_home') return !!answers.cultural_pref
        return true
      default: return true // Optional questions
    }
  }

  const isLastStep = currentStep === totalSteps

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          {renderQuestion()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={!isCurrentStepValid() || loading}
                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Find my crew'}
                {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isCurrentStepValid()}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 