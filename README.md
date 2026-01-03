# Obsidian Workout Tracker

This is a workout tracking application built with React Native and Expo. It's designed for people who want to own their data and keep it local. The main goal of the app is to make it easy to log your sessions while you're at the gym and then export them as clean markdown files directly into your Obsidian vault.

---

## Core Features

- **Live Tracking**: Log your sets, reps, and weight in real-time. There's a built-in rest timer so you don't have to switch between apps.
- **Templates**: If you have a routine you follow, you can save it as a template to get started faster.
- **Exercise Management**: You can manage your own list of exercises and customize them as needed.
- **Obsidian Integration**: The app exports your workouts as markdown files with YAML frontmatter, making them easy to use with plugins like Dataview.
- **Local Storage**: Everything is stored on your device using Async Storage. No cloud accounts are required.
- **Clean Interface**: The UI uses JetBrains Mono for a clear, readable look that stays out of your way.

---

## Tech Stack

The app is built using modern web technologies adapted for mobile:
- **Framework**: Expo and React Native
- **Icons**: Lucide React Native
- **Typography**: JetBrains Mono via Expo Font
- **Data**: Async Storage for persistence
- **Utilities**: date-fns for handling workout timestamps

---

## Getting Started

If you want to run the project locally, you'll need Node.js and the Expo Go app.

1. Clone the repository to your machine.
2. Run `npm install` to get the dependencies.
3. Start the project with `npm start`.
4. Use the Expo Go app on your phone to scan the QR code and load the application.

---

## Project Structure

Here is a quick overview of how the source code is organized:

```text
src/
├── components/     # UI elements used across different screens
├── hooks/          # Custom logic shared between components
├── logic/          # Core business logic
├── screens/        # The different views (Dashboard, Live Workout, etc.)
├── services/       # Helpers for storage and markdown generation
├── storage/        # Database utilities
└── theme/          # Styling and font configuration
```

---

## Exporting to Obsidian

When you finish a workout, the app generates a markdown file. The files are named using the format `YYYY-MM-DD - Workout Title.md`. Each file includes a YAML block at the top so you can easily track your progress using Obsidian's powerful search and data tools.

---

## Roadmap

You can find the list of planned features in [roadmap.md](./roadmap.md). Some of the things currently in the works include 1RM calculations, volume heatmaps, and Apple Health integration.

---

## License

This project is available under the MIT License.
