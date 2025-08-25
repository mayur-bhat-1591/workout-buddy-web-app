import { supabase, Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

export class DatabaseService {
  // User Profile Methods
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUserProfile(userId: string, updates: Tables['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Equipment Methods
  static async getUserEquipment(userId: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async addEquipment(equipment: Tables['equipment']['Insert']) {
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteEquipment(equipmentId: string) {
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', equipmentId);
    
    if (error) throw error;
  }

  // Workout Programs Methods
  static async getUserPrograms(userId: string) {
    const { data, error } = await supabase
      .from('workout_programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createProgram(program: Tables['workout_programs']['Insert']) {
    const { data, error } = await supabase
      .from('workout_programs')
      .insert(program)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProgram(programId: string, updates: Tables['workout_programs']['Update']) {
    const { data, error } = await supabase
      .from('workout_programs')
      .update(updates)
      .eq('id', programId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteProgram(programId: string) {
    const { error } = await supabase
      .from('workout_programs')
      .delete()
      .eq('id', programId);
    
    if (error) throw error;
  }

  // Workout Activities Methods
  static async createActivity(activity: Tables['workout_activities']['Insert']) {
    const { data, error } = await supabase
      .from('workout_activities')
      .insert(activity)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateActivity(activityId: string, updates: Tables['workout_activities']['Update']) {
    const { data, error } = await supabase
      .from('workout_activities')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserActivities(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('workout_activities')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async getActivity(activityId: string) {
    const { data, error } = await supabase
      .from('workout_activities')
      .select('*')
      .eq('id', activityId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Daily Progress Methods
  static async updateDailyProgress(userId: string, date: string, progress: Tables['daily_progress']['Update']) {
    const { data, error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        date,
        ...progress
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getDailyProgress(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async getWeeklyProgress(userId: string, weeks = 4) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - (weeks * 7 * 24 * 60 * 60 * 1000))
      .toISOString().split('T')[0];
    
    return this.getDailyProgress(userId, startDate, endDate);
  }

  // Get public workout programs
  static async getWorkoutPrograms(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching workout programs:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get program templates
  static async getProgramTemplates(programId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          *,
          exercises:workout_template_exercises(
            exercise_order,
            sets,
            reps,
            rest_seconds,
            notes,
            exercise:exercises(*)
          )
        `)
        .eq('program_id', programId)
        .order('week_number', { ascending: true })
        .order('day_number', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching program templates:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create workout program
  static async createWorkoutProgram(program: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('workout_programs')
        .insert([program])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating workout program:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create workout template
  static async createWorkoutTemplate(template: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating workout template:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Migration helper to move localStorage data to database
  static async migrateLocalStorageData(userId: string) {
    try {
      // Migrate progress data
      const progressData = localStorage.getItem('workoutBuddyProgress');
      if (progressData) {
        const progress = JSON.parse(progressData);
        
        for (const [date, dayProgress] of Object.entries(progress.dailyProgress || {})) {
          await this.updateDailyProgress(userId, date, {
            completed: (dayProgress as any).completed,
            audio_minutes: (dayProgress as any).audioMinutes,
            completion_percentage: (dayProgress as any).completionPercentage,
            activities_count: 1
          });
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('workoutBuddyProgress');
      console.log('Successfully migrated localStorage data to database');
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  }
}
