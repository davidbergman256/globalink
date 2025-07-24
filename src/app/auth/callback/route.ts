import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  console.log('Auth callback hit:', { code: !!code, origin })

  if (code) {
    const supabase = createSupabaseServerClient()
    
    console.log('Attempting to exchange code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Exchange result:', { 
      hasUser: !!data?.user, 
      userEmail: data?.user?.email,
      error: error?.message 
    })
    
    if (!error && data.user) {
      console.log('User authenticated, checking profile...')
      // Check if profile exists, if not redirect to questionnaire
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', data.user.id)
        .single()
      
      console.log('Profile check:', { hasProfile: !!profile, profileError: profileError?.message })
      
      if (!profile) {
        console.log('New user, redirecting to questionnaire')
        // New user, redirect to questionnaire
        return NextResponse.redirect(`${origin}/questionnaire`)
      } else {
        console.log('Existing user, redirecting to dashboard')
        // Existing user, redirect to dashboard
        return NextResponse.redirect(`${origin}/`)
      }
    } else {
      console.log('Auth exchange failed:', error?.message)
    }
  } else {
    console.log('No code provided in callback')
  }

  console.log('Redirecting to login due to error')
  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/login`)
} 