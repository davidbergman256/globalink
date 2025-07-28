import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

export const dynamic = 'force-dynamic'

// Simple admin auth - in production you'd want proper admin roles
const ADMIN_EMAILS = ['globalink.supp@gmail.com'] // Updated admin email

async function getAdminData() {
  const supabase = createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/login')
  }

  // Get all users in queue with their profiles
  const { data: queueEntries } = await supabase
    .from('queue')
    .select('*')
    .order('joined_at', { ascending: true })

  // Get profiles for queue users
  const queueUserIds = queueEntries?.map(q => q.user_id) || []
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('user_id', queueUserIds)

  // Get user emails and display names using the admin function
  let userEmails: Record<string, string> = {}
  let userDisplayNames: Record<string, string> = {}
  
  if (queueUserIds.length > 0) {
    const { data: userEmailData } = await supabase
      .rpc('get_user_emails_for_admin', { user_ids: queueUserIds })
    
    if (userEmailData) {
      userEmailData.forEach((user: any) => {
        userEmails[user.user_id] = user.email
        userDisplayNames[user.user_id] = user.display_name || `User ${user.user_id.slice(0, 8)}`
      })
    }
  }
  
  // Fallback for any missing data
  queueUserIds.forEach(userId => {
    if (!userDisplayNames[userId]) {
      const profile = profiles?.find(p => p.user_id === userId)
      userDisplayNames[userId] = profile?.display_name || `User ${userId.slice(0, 8)}`
    }
  })

  // Get all active groups
  const { data: activeGroups } = await supabase
    .from('groups')
    .select('*')
    .in('status', ['forming', 'pending_payment', 'location_revealed'])
    .order('created_at', { ascending: false })

  return {
    user: {
      id: user.id,
      email: user.email!, // Safe to assert since we checked it exists in ADMIN_EMAILS
      created_at: user.created_at
    },
    queueEntries: queueEntries || [],
    profiles: profiles || [],
    activeGroups: activeGroups || [],
    userEmails,
    userDisplayNames
  }
}

export default async function AdminPage() {
  const data = await getAdminData()

  return <AdminDashboard {...data} />
} 