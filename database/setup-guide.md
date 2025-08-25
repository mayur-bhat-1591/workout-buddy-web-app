# Database Setup Guide - Supabase Integration

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Note down your project URL and anon key from Settings > API

## 2. Run Database Schema

1. Open Supabase Dashboard > SQL Editor
2. Copy and paste the entire contents of `database/schema.sql`
3. Click "Run" to execute the schema

## 3. Configure Environment Variables

Add these to your `.env` file:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Install Dependencies

```bash
npm install @supabase/supabase-js
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

## 5. Database Features

### Tables Created:
- **users** - User profiles and preferences
- **equipment** - User's workout equipment
- **workout_programs** - Saved workout templates
- **exercises** - Exercise library (custom + system)
- **program_exercises** - Program-exercise relationships
- **workout_activities** - Workout sessions
- **exercise_sessions** - Individual exercise tracking
- **daily_progress** - Daily progress aggregation

### Security:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic user profile creation on signup

### Features:
- User authentication with Supabase Auth
- Cross-device data synchronization
- Workout program templates
- Detailed exercise tracking
- Progress analytics

## 6. Next Steps

After database setup:
1. Configure Supabase client
2. Implement authentication components
3. Create database service layer
4. Migrate existing localStorage data
