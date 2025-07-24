import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

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

  // Get all active groups
  const { data: activeGroups } = await supabase
    .from('groups')
    .select('*')
    .in('status', ['forming', 'pending_payment', 'location_revealed'])
    .order('created_at', { ascending: false })

  return {
    user,
    queueEntries: queueEntries || [],
    profiles: profiles || [],
    activeGroups: activeGroups || []
  }
}

export default async function AdminPage() {
  const data = await getAdminData()

  return <AdminDashboard {...data} />
} 