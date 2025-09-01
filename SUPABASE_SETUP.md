# Supabase Setup Guide for BrainPod

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: BrainPod
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"

## 2. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire content from `supabase/migrations/001_initial_schema.sql`
3. Click **Run** to execute the SQL

This will create all the necessary tables, indexes, and security policies.

## 3. Configure Environment Variables

1. In your Supabase project dashboard, go to **Settings > API**
2. Copy your **Project URL** and **Anon public key**
3. Also copy your **Service role secret key** (keep this secure!)

4. Update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Authentication Configuration  
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 4. Set Up Authentication

1. In Supabase dashboard, go to **Authentication > Settings**
2. Configure your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: `http://localhost:3000/auth/callback`

3. Enable the authentication providers you want:
   - **Email**: Already enabled
   - **Google**: Optional (requires OAuth setup)
   - **GitHub**: Optional (requires OAuth setup)

## 5. Configure Vercel Environment Variables

For production deployment, add these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Click **Settings > Environment Variables**
3. Add each variable:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
NEXTAUTH_SECRET = your_random_secret_here
NEXTAUTH_URL = https://your-vercel-domain.vercel.app
```

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the app and try:
   - Creating a user account
   - Taking a diagnostic assessment
   - Generating a learning plan
   - Tracking progress

## 7. Database Schema Overview

The schema includes these main tables:

- **users**: User accounts and subscription info
- **learner_profiles**: Individual learner profiles (multi-learner support)
- **diagnostic_results**: Assessment results and placements
- **learning_plans**: Generated learning plans
- **lesson_progress**: Individual lesson completion tracking
- **skill_mastery**: Granular skill-level progress
- **learning_sessions**: Session tracking for analytics
- **learner_notes**: Parent/teacher observations
- **learner_achievements**: Badges and achievements

## 8. Row Level Security (RLS)

The database uses RLS policies to ensure:
- Users can only see their own data
- Learner data is only accessible to the parent/guardian
- All queries are automatically filtered by user permissions

## 9. Monitoring and Analytics

In Supabase dashboard:
- **Logs**: View real-time database logs
- **Database**: Monitor usage and performance
- **Auth**: Track user authentication events

## Next Steps

With Supabase configured, you can:
1. Implement real user authentication
2. Store and retrieve personalized learning data
3. Track progress across sessions
4. Generate analytics and reports
5. Scale to handle multiple users and families

## Troubleshooting

**Connection Issues:**
- Verify your environment variables are correct
- Check that your project URL and keys match
- Ensure your IP is not blocked (Supabase has generous limits)

**Permission Errors:**
- Check that RLS policies are correctly applied
- Verify user authentication is working
- Test with the service role key for admin operations

**Schema Issues:**
- Re-run the migration SQL if tables are missing
- Check the Supabase logs for any SQL errors
- Verify all foreign key relationships are intact
