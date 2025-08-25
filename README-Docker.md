# Docker Setup for WorkoutBuddy

## Quick Start

### Production Build
```bash
# Build and run the production container
docker-compose up --build

# Or run directly with Docker
docker build -t workout-buddy .
docker run -p 3000:80 workout-buddy
```

Access the app at: http://localhost:3000

### Development Mode
```bash
# Run in development mode with hot reload
docker-compose --profile dev up workout-buddy-dev --build
```

Access the dev server at: http://localhost:3001

## Environment Variables

Create a `.env` file with your API keys:
```bash
# Copy the example file
cp .env.example .env

# Edit with your actual API keys
REACT_APP_GROQ_API_KEY=your_groq_api_key_here
REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

## Docker Commands

### Build
```bash
# Production build
docker build -t workout-buddy .

# Development build
docker build -f Dockerfile.dev -t workout-buddy-dev .
```

### Run
```bash
# Production (nginx)
docker run -p 3000:80 workout-buddy

# Development (with hot reload)
docker run -p 3001:3000 -v $(pwd):/app -v /app/node_modules workout-buddy-dev
```

### Clean Up
```bash
# Stop all containers
docker-compose down

# Remove images
docker rmi workout-buddy workout-buddy-dev

# Clean up everything
docker system prune -a
```

## Architecture

- **Production**: Multi-stage build with nginx serving static files
- **Development**: Node.js with hot reload and volume mounting
- **Port 3000**: Production app (nginx)
- **Port 3001**: Development server (React dev server)
