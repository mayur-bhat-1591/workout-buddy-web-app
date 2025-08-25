-- WorkoutBuddy Database Schema for Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
  goals TEXT[] DEFAULT ARRAY['strength', 'endurance'],
  preferences JSONB DEFAULT '{"workoutDuration": 45, "voiceStyle": "motivating", "difficulty": "intermediate"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment table
CREATE TABLE public.equipment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cardio', 'strength', 'flexibility')) NOT NULL,
  condition TEXT CHECK (condition IN ('good', 'fair', 'poor')) DEFAULT 'good',
  quantity INTEGER DEFAULT 1,
  weight_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout programs table
CREATE TABLE public.workout_programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
  duration INTEGER DEFAULT 45, -- minutes
  focus_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  equipment_ids UUID[] DEFAULT ARRAY[]::UUID[],
  is_template BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises table
CREATE TABLE public.exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  equipment_needed TEXT[],
  muscle_groups TEXT[],
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
  duration INTEGER, -- seconds
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program exercises (junction table)
CREATE TABLE public.program_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL,
  duration INTEGER, -- override exercise duration
  intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(program_id, exercise_id, order_index)
);

-- Workout activities (sessions)
CREATE TABLE public.workout_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.workout_programs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  audio_playback_minutes INTEGER DEFAULT 0,
  target_minutes INTEGER DEFAULT 45,
  completion_percentage INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise sessions (tracks individual exercises within activities)
CREATE TABLE public.exercise_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES public.workout_activities(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  sets_completed INTEGER DEFAULT 0,
  reps_completed INTEGER DEFAULT 0,
  weight_used DECIMAL(5,2),
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily progress tracking
CREATE TABLE public.daily_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  audio_minutes INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  activities_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for equipment
CREATE POLICY "Users can manage own equipment" ON public.equipment
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for workout programs
CREATE POLICY "Users can manage own programs" ON public.workout_programs
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for exercises
CREATE POLICY "Users can manage own exercises" ON public.exercises
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for program exercises
CREATE POLICY "Users can manage own program exercises" ON public.program_exercises
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.workout_programs WHERE id = program_id
    )
  );

-- RLS Policies for workout activities
CREATE POLICY "Users can manage own activities" ON public.workout_activities
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for exercise sessions
CREATE POLICY "Users can manage own exercise sessions" ON public.exercise_sessions
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.workout_activities WHERE id = activity_id
    )
  );

-- RLS Policies for daily progress
CREATE POLICY "Users can manage own progress" ON public.daily_progress
  FOR ALL USING (auth.uid() = user_id);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workout_programs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.daily_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance
CREATE INDEX idx_equipment_user_id ON public.equipment(user_id);
CREATE INDEX idx_workout_programs_user_id ON public.workout_programs(user_id);
CREATE INDEX idx_exercises_user_id ON public.exercises(user_id);
CREATE INDEX idx_workout_activities_user_id ON public.workout_activities(user_id);
CREATE INDEX idx_workout_activities_start_time ON public.workout_activities(start_time);
CREATE INDEX idx_daily_progress_user_date ON public.daily_progress(user_id, date);
CREATE INDEX idx_exercise_sessions_activity_id ON public.exercise_sessions(activity_id);
