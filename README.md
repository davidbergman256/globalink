# globalink v0

A simplified meetup coordination platform for connecting strangers through organized events.

## Features

- **Authentication**: Email/password sign-up and sign-in via Supabase Auth
- **Events**: Users are assigned to events for meetups (e.g., "Bouldering with John, Jacob, Jack & James")
- **Simple Onboarding**: Collect basic info during registration
- **Event Dashboard**: View your assigned event details
- **Email Notifications**: Welcome email on signup
- **Responsive Design**: Mobile-first UI with dark mode support

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Database Schema

The application uses a comprehensive schema for user matching and group management. The complete schema is available in `database_schema.sql`.

### Main Tables

- **profiles** - User profile information with personality traits and availability
- **queue** - Users waiting to be matched
- **groups** - Active meetup groups with members and event details
- **payments** - Payment tracking for group events  
- **rsvps** - Event attendance confirmations
- **feedback** - Post-event user feedback

### Key Functions

- `get_user_current_group()` - Returns user's active group
- `get_user_payment_status()` - Checks payment status for group events

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the following SQL to create the tables:

```sql
-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  activity TEXT NOT NULL,
  date TIMESTAMPTZ,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  display_name TEXT UNIQUE,
  avatar_url TEXT,
  location TEXT,
  fun_fact TEXT,
  talk_for_hours TEXT,
  event_id UUID REFERENCES events.id,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);
```

3. Set up Supabase Edge Function for welcome emails (optional):
   - Create a new Edge Function named `send-welcome-email`
   - Configure email service (Resend, SendGrid, etc.)

### 3. Group Management

The application now uses an automated matching system:

1. Users sign up and complete questionnaires
2. They join the queue for their campus
3. Admin dashboard allows manual group creation and management
4. Payment integration handles event fees

### 4. Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deployment

Deploy to Vercel:
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Routes

- `/` - Landing page (public)
- `/login` - Sign-in/Sign-up page
- `/app` - Main dashboard (protected)
- `/questionnaire` - User onboarding form
- `/admin` - Admin dashboard for group management
- `/contact` - Contact information

## Architecture

- **Server Components**: Home page for optimal SEO and performance
- **Client Components**: Forms, interactive elements, auth state management
- **Middleware**: Route protection for authenticated pages
- **Email**: Supabase Edge Functions for welcome emails

## Security

- Row Level Security (RLS) enabled on all tables
- Route protection via middleware
- Secure authentication via Supabase Auth

## Future Enhancements

- Automated event assignment algorithms
- Real-time event updates
- Enhanced email templates
- Event feedback system
- Mobile app (React Native) 