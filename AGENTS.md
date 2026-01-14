# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in the workout_tracker repository.

## Project Overview

React Native Expo application for workout tracking with Obsidian integration. Built with pure JavaScript using a custom hooks architecture and local-first data design.

**Technology Stack:**
- Expo SDK 54+ with React Native 0.81.5
- React 19.1.0 with functional components only
- AsyncStorage for local persistence
- Jest for testing
- JetBrains Mono font with dark theme

## Build/Test/Lint Commands

### Primary Commands
```bash
npm start          # Start Expo development server
npm test           # Run all tests
npm run android    # Start on Android emulator
npm run ios        # Start on iOS simulator  
npm run web        # Start in web browser
```

### Single Test Execution
```bash
# Run specific test by name
npm test -- --testNamePattern="creates workout from template"

# Run specific test file
npm test src/logic/WorkoutFactory.test.js

# Run tests in watch mode
npm test -- --watch
```

### Testing Framework
- Jest with jest-expo preset
- Test files follow `ComponentName.test.js` naming convention
- Located alongside source files in `/src/logic/` and `/src/`

**Note:** No ESLint or Prettier configuration exists in this project.

## Code Style Guidelines

### Import Organization
```javascript
// 1. React imports
import React from 'react';
import { useState, useEffect } from 'react';

// 2. React Native imports
import { View, Text, StyleSheet } from 'react-native';

// 3. External libraries
import { format, parseISO } from 'date-fns';
import { Activity } from 'lucide-react-native';

// 4. Local imports (relative paths)
import { COLORS, SPACING } from '../theme/tokens';
import { useWorkout } from '../hooks/useWorkout';
```

### File Structure & Naming
```
src/
├── screens/           # Screen components (PascalCase)
├── hooks/            # Custom hooks (camelCase with 'use' prefix)
├── services/         # Data services (PascalCase)
├── logic/            # Business logic/factories (PascalCase)
├── theme/            # Design tokens
└── components/       # (Currently empty - UI in screens)
```

**Naming Conventions:**
- Components: PascalCase (`Dashboard.js`, `WorkoutSetup.js`)
- Hooks: camelCase with `use` prefix (`useWorkout.js`, `useExercises.js`)
- Functions/Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: PascalCase for components, camelCase for utilities

### Component Architecture
```javascript
// Functional components only - no classes
const Dashboard = ({ onStart, onOpenExercises }) => {
    const { logs } = useLogs();
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>
        </View>
    );
};

export default Dashboard;
```

**Rules:**
- Use functional components exclusively
- Props destructuring in function signature
- Export components as default
- Screen components handle UI logic, services handle data

### Styling & Theming
```javascript
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.md,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
    },
    title: {
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.lg,
        color: COLORS.text,
    },
});
```

**Theme Guidelines:**
- Use centralized design tokens from `/src/theme/tokens.js`
- JetBrains Mono font exclusively (`familyMono`, `familyMonoBold`)
- Dark theme with hazard yellow accent (`#FFB100`)
- Sharp corners (2px border radius)
- Consistent spacing using SPACING constants

### State Management Patterns
```javascript
// Custom hooks for all state management
export const useWorkout = () => {
    const [activeWorkout, setActiveWorkout] = useState(null);
    
    const startWorkout = (config) => {
        const workout = WorkoutFactory.createFromTemplate(config);
        setActiveWorkout(workout);
    };
    
    return { activeWorkout, startWorkout };
};
```

**Patterns:**
- All state managed in custom hooks (`/src/hooks/useWorkout.js`)
- Immutable updates with spread operator
- Loading states and error handling in hooks
- AsyncStorage operations via StorageService

### Data & API Patterns
```javascript
// Service layer for data operations
export const StorageService = {
    async saveExercise(exercise) {
        const exercises = await this.getExercises();
        exercises.push(exercise);
        await this.save(KEYS.EXERCISES, exercises);
    },
    
    async getExercises() {
        return (await this.load(KEYS.EXERCISES)) || [];
    },
};
```

**Conventions:**
- IDs as strings using `Date.now().toString()`
- ISO timestamps for all dates (`new Date().toISOString()`)
- Null checks for optional data
- Default values in service methods

### Error Handling
```javascript
const addExercise = async (name, category) => {
    // Validation
    const existingExercise = exercises.find(ex => 
        ex.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    
    if (existingExercise) {
        throw new Error(`Exercise "${name}" already exists`);
    }
    
    // Storage operations with try-catch
    try {
        await StorageService.saveExercise(newExercise);
    } catch (e) {
        console.error('Error saving exercise:', e);
        throw e;
    }
};
```

**Guidelines:**
- Throw errors for validation failures
- Try-catch blocks in async storage operations
- Console.error for error logging
- User-friendly error messages

### Testing Patterns
```javascript
import { WorkoutFactory } from './WorkoutFactory';

describe('WorkoutFactory', () => {
    const mockTemplate = {
        id: 'temp-1',
        name: 'Heavy Chest',
        exercises: [{ id: 'ex-1', name: 'Bench Press' }]
    };

    it('creates workout from template', () => {
        const workout = WorkoutFactory.createFromTemplate(mockTemplate);
        
        expect(workout.templateId).toBe('temp-1');
        expect(workout.exercises).toHaveLength(1);
        expect(workout.exercises[0]).toEqual(
            expect.objectContaining({ name: 'Bench Press' })
        );
    });
});
```

**Testing Standards:**
- Jest with describe/it structure
- Mock objects for test data
- Test factory methods and edge cases
- Use toBe, toHaveLength, toEqual, expect.objectContaining

## Key Architectural Decisions

### State Management
- **Single Hook Architecture:** All app state in `/src/hooks/useWorkout.js`
- **No External Libraries:** No Redux, Zustand, or Context API
- **Local-First:** AsyncStorage persistence with export capabilities

### Navigation
- **Custom Screen Management:** No routing library (expo-router unused)
- **Screen State:** Navigation handled in App.js with screen state
- **Deep Linking:** Obsidian integration via expo-linking

### Data Flow
```
Services (StorageService) → Hooks (useWorkout) → Screens (Dashboard)
```

### Factory Pattern
- **WorkoutFactory:** Centralized workout creation logic
- **Template System:** Workout templates with exercise configuration
- **Instance Management:** Unique instance IDs for workout exercises

## Development Workflow

1. **Start Development:** `npm start` to launch Expo server
2. **Component Creation:** Create screen in `/src/screens/`
3. **State Management:** Add logic to `/src/hooks/useWorkout.js`
4. **Data Operations:** Use StorageService methods
5. **Testing:** Create `ComponentName.test.js` alongside source
6. **Styling:** Use theme tokens from `/src/theme/tokens.js`

## Integration Notes

### Obsidian Integration
- Primary via Obsidian deep links (`obsidian://vault?file=...`)
- Fallback via file sharing using expo-sharing
- Markdown export with YAML frontmatter
- Customizable field mapping in settings

### Platform Support
- iOS, Android, and Web via Expo
- Platform-specific features handled by Expo
- File system operations via expo-file-system

## Constraints & Limitations

- **No TypeScript:** Pure JavaScript project
- **No Code Formatting:** No Prettier/ESLint configuration
- **Monolithic Hook:** Large useWorkout.js file (consider splitting for complex features)
- **Custom Navigation:** Not using expo-router despite being installed
- **Manual Testing:** No automated UI testing framework

When working on this codebase, prioritize consistency with existing patterns over introducing new libraries or architectural changes. The current design emphasizes simplicity and direct control over data flow.