# WorkoutBuddy Web App

An AI-powered fitness web app that uses video equipment detection, personalized voice coaching, and daily accountability tracking.

## Features

- **🎥 Equipment Detection**: Use your camera to record your home gym equipment, powered by GPT-4V analysis
- **🗣️ AI Voice Coaching**: Personalized audio coaching using ElevenLabs TTS with motivational guidance
- **⚡ Fast Workout Generation**: Ultra-fast workout plan creation using Groq's Llama 3.1 models
- **📊 Progress Tracking**: Daily accountability with streak tracking and weekly goals
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **🏆 Achievement System**: Track streaks, weekly goals, and total workout time

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Context** for state management
- **Lucide React** for icons
- **date-fns** for date utilities

### AI Services
- **Groq API** - Ultra-fast AI inference (Llama 3.1 models)
- **ElevenLabs API** - Natural voice synthesis and coaching
- **OpenAI GPT-4V** - Video/image analysis for equipment detection

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- API Keys for:
  - Groq API
  - ElevenLabs API
  - OpenAI API

### Installation

1. **Clone and setup**
   ```bash
   cd workout-buddy-web-app
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

3. **Add your API keys to `.env`**
   ```bash
   # Groq Configuration (Ultra-fast inference)
   REACT_APP_GROQ_API_KEY=your_groq_api_key_here
   REACT_APP_GROQ_BASE_URL=https://api.groq.com/openai/v1

   # ElevenLabs Configuration (Voice coaching)
   REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   REACT_APP_ELEVENLABS_VOICE_ID=your_selected_coach_voice_id
   REACT_APP_ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1

   # OpenAI Configuration (Video analysis)
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   REACT_APP_OPENAI_BASE_URL=https://api.openai.com/v1
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## How to Use

### 1. Equipment Detection
- Click "Detect Equipment" on the home screen
- Either record a 10-30 second video of your home gym OR upload an existing video
- AI will analyze your equipment and generate personalized workout recommendations

### 2. AI-Powered Workout
- After equipment detection, you'll automatically get a personalized 45-minute workout plan
- The workout includes voice coaching with motivational guidance
- Audio tracks are generated in real-time for each exercise

### 3. Progress Tracking
- **Daily Goal**: Complete 36+ minutes of audio playback (80% of workout)
- **Weekly Goal**: Complete 5 workouts per week
- **Streaks**: Track consecutive days of completed workouts
- **Calendar View**: See your progress over time

### 4. Key Metrics
- **Audio Tracking**: Only counts actual audio playback time (not session time)
- **Completion Threshold**: 36+ minutes = daily goal achieved
- **Weekly Target**: 5 successful days per week
- **Streak System**: Consecutive days with completed workouts

## Project Structure

```
workout-buddy-web-app/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── LoadingSpinner.tsx
│   │   ├── Navigation.tsx
│   │   └── WorkoutCompleteScreen.tsx
│   ├── screens/             # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── EquipmentDetectionScreen.tsx
│   │   ├── WorkoutSessionScreen.tsx
│   │   └── PersonalTrackerScreen.tsx
│   ├── services/            # API integrations & business logic
│   │   ├── GroqService.ts
│   │   ├── ElevenLabsService.ts
│   │   ├── OpenAIService.ts
│   │   └── AudioTracker.ts
│   ├── contexts/            # React Context for state management
│   │   ├── WorkoutContext.tsx
│   │   └── ProgressContext.tsx
│   ├── utils/               # Helper functions
│   │   ├── videoUtils.ts
│   │   ├── dateUtils.ts
│   │   └── storageUtils.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   └── constants/           # App configuration
│       ├── config.ts
│       └── prompts.ts
└── public/
```

## API Integration

### Groq API (Workout Generation)
- **Model**: Llama 3.1 70B for balanced quality/speed
- **Purpose**: Generate personalized workout plans and coaching messages
- **Response Time**: <3 seconds for workout generation

### ElevenLabs API (Voice Coaching)
- **Model**: Eleven Turbo v2.5 for fastest response
- **Purpose**: Convert workout instructions to natural voice coaching
- **Features**: Adjustable intensity (calm, motivating, energetic)

### OpenAI API (Equipment Analysis)
- **Model**: GPT-4V for video/image analysis
- **Purpose**: Analyze home gym equipment from video/images
- **Fallback**: Mock data for demo if API fails

## Key Features Explained

### Audio-Based Progress Tracking
Unlike traditional fitness apps that track session time, WorkoutBuddy tracks **actual audio playback time**. This ensures users are actively engaged with the coaching rather than just having the app open.

### Smart Completion Logic
- **Daily Goal**: 36+ minutes of audio (80% of 45-minute target)
- **Weekly Goal**: 5 completed days per week
- **Streak Tracking**: Consecutive days with completed workouts

### Adaptive Workout Generation
- Equipment-specific exercises based on what you own
- Difficulty adjusted to user's fitness level
- Voice coaching intensity matches exercise intensity

### Offline-First Progress Tracking
- All progress data stored locally in browser
- Export/import functionality for data backup
- Works without internet once workouts are generated

## Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Building for Production
```bash
npm run build
```
Creates an optimized build in the `build` folder.

## Deployment Options

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Netlify
1. Build the project: `npm run build`
2. Upload the `build` folder to Netlify
3. Configure environment variables

### Traditional Hosting
1. Build: `npm run build`
2. Upload `build` folder contents to your web server
3. Configure environment variables on your hosting platform

## Browser Compatibility

- Chrome 80+ (recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

**Camera Access Required**: Equipment detection requires camera permissions.

## Performance Optimizations

- **Code Splitting**: Automatic with React
- **Image Optimization**: Tailwind CSS utilities
- **API Caching**: Built-in response caching
- **Lazy Loading**: Context providers only load when needed

## Troubleshooting

### Camera Issues
- Ensure HTTPS (required for camera access)
- Check browser permissions
- Try different browsers

### API Errors
- Verify API keys in `.env` file
- Check API quotas and limits
- Enable browser developer tools for debugging

### Audio Issues
- Check browser audio permissions
- Ensure speakers/headphones are working
- Try refreshing the page

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes.

## Support

For issues and questions:
1. Check the browser console for error messages
2. Verify API keys and quotas
3. Test with different browsers
4. Check network connectivity

---

**Built with ❤️ using React, TypeScript, and modern AI APIs**