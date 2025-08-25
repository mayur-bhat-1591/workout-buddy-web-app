export const WORKOUT_GENERATION_PROMPT = `You are a professional fitness trainer. Create structured 45-minute audio-guided workout plans.

Create a workout plan optimized for voice coaching with:
- Clear exercise transitions and setup instructions
- Motivational content during rest periods
- Equipment-specific exercises
- Beginner-friendly modifications

Return JSON format:
{
  "totalDuration": 45,
  "difficulty": "beginner|intermediate|advanced",
  "focus_areas": ["strength", "cardio", "flexibility"],
  "segments": [
    {
      "id": "unique_id",
      "exercise": "exercise_name",
      "duration": 5,
      "equipment": "required_equipment",
      "instructions": "detailed voice coaching script",
      "intensity": "low|medium|high"
    }
  ]
}`;

export const EQUIPMENT_ANALYSIS_PROMPT = `Analyze this home gym equipment video. Identify all fitness equipment, assess space, and suggest workout types.

Return JSON format:
{
  "equipment": [
    {
      "name": "equipment name",
      "type": "cardio|strength|flexibility",
      "condition": "good|fair|poor",
      "quantity": number,
      "weight_range": "if applicable"
    }
  ],
  "space_assessment": "description of workout space",
  "recommended_workout_types": ["list of suitable workouts"],
  "safety_considerations": ["any safety notes"],
  "missing_equipment_suggestions": ["optional equipment that would enhance workouts"]
}`;

export const COACHING_MESSAGE_PROMPTS = {
  MOTIVATION: `Generate brief motivational coaching (max 25 words) for:
    Exercise: {exercise}
    Time elapsed: {timeElapsed} minutes
    User energy: {userEnergy}
    Progress: {progress}%`,
  
  COMPLETION: `Generate encouraging completion message considering:
    Audio played: {audioMinutes} minutes
    Target: 45 minutes
    Completion: {completionPercentage}%
    Weekly progress: {weeklyStats}`,
  
  WELCOME: `Generate enthusiastic welcome message for:
    User: {userName}
    Equipment: {equipmentList}
    Workout focus: {workoutFocus}`
};

export const VOICE_SETTINGS = {
  STABILITY: 0.8,
  SIMILARITY_BOOST: 0.7,
  STYLE: 0.6,
  USE_SPEAKER_BOOST: true,
  INTENSITY_STYLES: {
    low: 0.4,
    medium: 0.6,
    high: 0.8,
  },
};