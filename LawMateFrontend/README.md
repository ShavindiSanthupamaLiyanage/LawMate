# LawMate Mobile App

A React Native mobile application for the LawMate system.

## Getting Started

### Prerequisites

- Node.js (>= 18)
- npm or yarn
- React Native development environment setup
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
# Install dependencies
npm install

# iOS only - Install pods
cd ios && pod install && cd ..
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
LawMateFrontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── styles/          # Global styles and theme
├── android/             # Android native code
├── ios/                 # iOS native code
├── App.tsx              # Root component
├── index.js             # Entry point
└── package.json         # Dependencies
```

## API Integration

The app connects to the LawMate backend API running on `http://localhost:5102`

## Development

- Follow the existing code style
- Run linting before committing: `npm run lint`
- Write tests for new features
