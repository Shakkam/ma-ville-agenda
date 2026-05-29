# Ma Ville Agenda — Mobile App

React Native + Expo cross-platform mobile app for iOS and Android.

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator

### Installation

```bash
cd apps/mobile
npm install
```

### Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Set your API URL:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Development

Start the development server:

```bash
npm run start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for web browser

### Building for App Stores

#### Android

```bash
eas build --platform android
```

#### iOS

```bash
eas build --platform ios
```

## Project Structure

- `app/` — Expo Router screens and navigation
- `src/`
  - `api/` — API client
  - `components/` — Reusable React components
  - `store/` — Zustand state management
  - `styles/` — Theme and styling
  - `types/` — TypeScript types
