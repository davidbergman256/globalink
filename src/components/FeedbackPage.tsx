'use client'

import { useState } from 'react'
import { useSupabase } from './SupabaseProvider'
import { useRouter } from 'next/navigation'
import { Star, Heart, MessageCircle, CheckCircle } from 'lucide-react'
import type { User, Group, Feedback } from '@/lib/types'

interface FeedbackPageProps {
  user: User
  group: Group
  existingFeedback: Feedback | null
}

export default function FeedbackPage({ user, group, existingFeedback }: FeedbackPageProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(!!existingFeedback)
  
  const [feedback, setFeedback] = useState({
    stars: existingFeedback?.stars || 0,
    would_meet_again: existingFeedback?.would_meet_again ?? null,
    comment: existingFeedback?.comment || ''
  })

  const handleStarRating = (rating: number) => {
    setFeedback(prev => ({ ...prev, stars: rating }))
    setTimeout(() => setStep(2), 300) // Small delay for visual feedback
  }

  const handleWouldMeetAgain = (answer: boolean) => {
    setFeedback(prev => ({ ...prev, would_meet_again: answer }))
    setTimeout(() => setStep(3), 300)
  }

  const handleCommentChange = (comment: string) => {
    setFeedback(prev => ({ ...prev, comment }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('feedback')
        .upsert({
          group_id: group.id,
          user_id: user.id,
          stars: feedback.stars,
          would_meet_again: feedback.would_meet_again,
          comment: feedback.comment || null
        })

      if (error) throw error
      
      setSubmitted(true)
    } catch (error: any) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (interactive = false) => {
    return (
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && handleStarRating(star)}
            disabled={!interactive}
            className={`${
              interactive ? 'hover:scale-110 transition-transform cursor-pointer' : 'cursor-default'
            }`}
          >
            <Star
              className={`h-12 w-12 ${
                star <= feedback.stars
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (submitted && !existingFeedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thanks for your feedback!
          </h1>
          <p className="text-gray-600 mb-8">
            Your input helps us create better experiences for everyone.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            How was your crew?
          </h1>
          <p className="text-gray-600">
            Help us improve future meetups with your quick feedback
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full ${
                  s <= step ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Step 1: Star Rating */}
          {step === 1 && (
            <div className="text-center">
              <div className="mb-6">
                <Star className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  How was the crew?
                </h2>
                <p className="text-gray-600">
                  Rate your overall experience
                </p>
              </div>
              {renderStars(true)}
              <p className="text-gray-500 text-sm mt-4">
                Tap a star to rate
              </p>
            </div>
          )}

          {/* Step 2: Would Meet Again */}
          {step === 2 && (
            <div className="text-center">
              <div className="mb-8">
                <Heart className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Would meet again?
                </h2>
                <p className="text-gray-600">
                  Would you like to hang out with this crew again?
                </p>
              </div>
              
              <div className="flex justify-center space-x-6">
                <button
                  onClick={() => handleWouldMeetAgain(true)}
                  className="flex flex-col items-center p-6 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                >
                  <div className="text-4xl mb-2">👍</div>
                  <span className="font-medium text-green-700">Yes</span>
                </button>
                
                <button
                  onClick={() => handleWouldMeetAgain(false)}
                  className="flex flex-col items-center p-6 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
                >
                  <div className="text-4xl mb-2">👎</div>
                  <span className="font-medium text-red-700">No</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Optional Comment */}
          {step === 3 && (
            <div className="text-center">
              <div className="mb-6">
                <MessageCircle className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Any thoughts?
                </h2>
                <p className="text-gray-600">
                  Optional - share what made it great or how we can improve
                </p>
              </div>

              <textarea
                value={feedback.comment}
                onChange={(e) => handleCommentChange(e.target.value)}
                maxLength={140}
                placeholder="Your thoughts... (optional)"
                className="w-full p-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows={4}
              />
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  {feedback.comment.length}/140 characters
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm"
                >
                  Skip comment
                </button>
              </div>
            </div>
          )}

          {/* Summary for existing feedback */}
          {existingFeedback && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Your Previous Feedback
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Rating</h3>
                  {renderStars(false)}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Would meet again</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    feedback.would_meet_again 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {feedback.would_meet_again ? '👍 Yes' : '👎 No'}
                  </span>
                </div>
                
                {feedback.comment && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Comment</h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-md">
                      "{feedback.comment}"
                    </p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => router.push('/')}
                className="mt-8 text-purple-600 hover:text-purple-500 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 