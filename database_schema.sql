-- Globalink Platform Database Schema
-- Drop existing tables that are no longer needed
DROP TABLE IF EXISTS events CASCADE;

-- Keep the existing auth.users table (managed by Supabase)
-- But create new profile structure

-- Drop old profiles table and create new one
DROP TABLE IF EXISTS profiles CASCADE;

-- Create new profiles table (1-1 with users)
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER,
  tags TEXT[] DEFAULT '{}', -- max 3 tags
  personality TEXT CHECK (personality IN ('outgoing', 'shy_at_first', 'somewhere_in_between')),
  challenge TEXT CHECK (challenge IN ('language_barriers', 'missing_home', 'finding_interests', 'other')),
  pref_activity TEXT CHECK (pref_activity IN ('studying_together', 'exploring_city', 'gaming_online', 'trying_foods', 'other')),
  -- Branching fields stored as JSON
  branches JSONB DEFAULT '{}',
  -- Questionnaire responses
  from_location TEXT,
  current_location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create queue table
CREATE TABLE queue (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  campus TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT CHECK (status IN ('forming', 'pending_payment', 'location_revealed', 'completed', 'cancelled')) DEFAULT 'forming',
  event_datetime TIMESTAMPTZ,
  campus TEXT,
  member_ids UUID[] NOT NULL,
  venue_name TEXT,
  venue_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('paid', 'refunded')) DEFAULT 'paid',
  stripe_session_id TEXT,
  amount_cents INTEGER DEFAULT 800, -- $8.00
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create rsvps table
CREATE TABLE rsvps (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  answer TEXT CHECK (answer IN ('yes', 'no')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Create feedback table
CREATE TABLE feedback (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stars INTEGER CHECK (stars >= 1 AND stars <= 5),
  would_meet_again BOOLEAN,
  comment TEXT CHECK (length(comment) <= 140),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for queue
CREATE POLICY "Users can view queue" ON queue FOR SELECT USING (true);
CREATE POLICY "Users can insert themselves into queue" ON queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their queue entry" ON queue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their queue entry" ON queue FOR DELETE USING (auth.uid() = user_id);

-- Create policies for groups
CREATE POLICY "Users can view groups they're in" ON groups FOR SELECT USING (auth.uid() = ANY(member_ids));
CREATE POLICY "Authenticated users can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update groups" ON groups FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create policies for payments
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for rsvps
CREATE POLICY "Users can view rsvps for their groups" ON rsvps FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM groups WHERE groups.id = rsvps.group_id AND auth.uid() = ANY(groups.member_ids)
  )
);
CREATE POLICY "Users can insert their own rsvps" ON rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rsvps" ON rsvps FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for feedback
CREATE POLICY "Users can view feedback for their groups" ON feedback FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM groups WHERE groups.id = feedback.group_id AND auth.uid() = ANY(groups.member_ids)
  )
);
CREATE POLICY "Users can insert their own feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON feedback FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_queue_campus ON queue(campus);
CREATE INDEX idx_queue_joined_at ON queue(joined_at);
CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_groups_event_datetime ON groups(event_datetime);
CREATE INDEX idx_groups_member_ids ON groups USING GIN(member_ids);
CREATE INDEX idx_payments_group_user ON payments(group_id, user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_current_group(p_user_id UUID)
RETURNS TABLE(group_id UUID, status TEXT, event_datetime TIMESTAMPTZ, venue_name TEXT, venue_address TEXT) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, g.status, g.event_datetime, g.venue_name, g.venue_address
  FROM groups g
  WHERE p_user_id = ANY(g.member_ids)
    AND g.status IN ('forming', 'pending_payment', 'location_revealed')
  ORDER BY g.created_at DESC
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_payment_status(p_user_id UUID, p_group_id UUID)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payment_status TEXT;
BEGIN
  SELECT status INTO payment_status
  FROM payments
  WHERE user_id = p_user_id AND group_id = p_group_id;
  
  RETURN COALESCE(payment_status, 'unpaid');
END;
$$;

-- Function to get user emails for admin use (only accessible by admins)
CREATE OR REPLACE FUNCTION get_user_emails_for_admin(user_ids UUID[])
RETURNS TABLE(user_id UUID, email TEXT, display_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT (auth.email() = ANY(ARRAY['globalink.supp@gmail.com'])) THEN
    RAISE EXCEPTION 'Access denied: Admin only function';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    u.email,
    p.display_name
  FROM profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.user_id = ANY(user_ids);
END;
$$; 