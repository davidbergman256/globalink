# globalink v0

A minimal but production-ready web app for connecting group members with rich profiles, built for 1,000 MAU.

## Features

- **Authentication**: Email/password sign-up and sign-in via Supabase Auth
- **Groups**: Users are assigned to groups manually (MVP feature)
- **Rich Profiles**: Display name, location, fun facts, and favorite topics
- **Enhanced Signup**: Collect location, fun facts, and conversation topics during registration
- **Group View**: See all members in your group with their interests
- **Member Profiles**: View detailed profiles with personal information
- **Discord Integration**: Direct link to Discord community
- **Responsive Design**: Mobile-first UI with dark mode support

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS + Headless UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Database Schema

### Tables

**groups**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name TEXT
```

**profiles**
```sql
id UUID PRIMARY KEY
display_name TEXT UNIQUE
avatar_url TEXT
about TEXT
location TEXT
fun_fact TEXT
talk_for_hours TEXT
group_id UUID REFERENCES groups.id
created_at TIMESTAMPTZ DEFAULT now()
```

### Storage

**avatars** bucket for user profile pictures

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard.

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the following SQL to create the tables:

```sql
-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  display_name TEXT UNIQUE,
  avatar_url TEXT,
  about TEXT,
  location TEXT,
  fun_fact TEXT,
  talk_for_hours TEXT,
  group_id UUID REFERENCES groups.id,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Groups policies
CREATE POLICY "Groups are viewable by everyone" ON groups
  FOR SELECT USING (true);
```

**If you have an existing profiles table, run this to add the new columns:**
```sql
ALTER TABLE profiles 
ADD COLUMN location TEXT,
ADD COLUMN fun_fact TEXT,
ADD COLUMN talk_for_hours TEXT;
```

3. Create an `avatars` storage bucket:
   - Go to Storage in Supabase dashboard
   - Create a new bucket named `avatars`
   - Make it public

### 3. Manual Group Assignment (MVP)

To assign users to groups manually:

1. Go to Supabase Dashboard → Table Editor → groups
2. Insert a new group: `INSERT INTO groups (name) VALUES ('Group 1');`
3. Go to profiles table
4. Update user's group_id: `UPDATE profiles SET group_id = 'group-uuid-here' WHERE id = 'user-uuid-here';`

### 4. Installation & Development

```bash
# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deployment

Deploy to Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Routes

- `/join` - Sign-up page
- `/login` - Sign-in page  
- `/` - Home page (group members list)
- `/profile` - Current user's profile
- `/settings` - Profile editing with avatar upload
- `/contact` - Contact information
- `/members/[id]` - Public profile of group mate

## Architecture

- **Server Components**: Home, Profile, Member pages for optimal SEO and performance
- **Client Components**: Forms, interactive elements, auth state management
- **Middleware**: Route protection for authenticated pages
- **Storage**: Supabase Storage for avatar uploads
- **State Management**: React Context for Supabase client

## Security

- Row Level Security (RLS) enabled on all tables
- Route protection via middleware
- Group member access controls
- Secure file uploads to Supabase Storage

## Future Enhancements

- Automated group assignment
- Real-time messaging
- Enhanced dark mode theming  
- Push notifications
- Advanced user matching algorithms

## Contributing

This is an MVP built in under 4 hours. For production use, consider:

- Enhanced error handling
- Loading states and skeletons
- Form validation
- Unit tests
- Performance monitoring
- Advanced security measures 