import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createSupabaseServerClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if profile exists, if not redirect to questionnaire
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', data.user.id)
        .single()
      
      if (!profile) {
        // New user, redirect to questionnaire
        return NextResponse.redirect(`${origin}/questionnaire`)
      } else {
        // Existing user, redirect to dashboard
        return NextResponse.redirect(`${origin}/`)
      }
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/login`)
} 