## Project Overview

A family game night scoring app for tracking scores, statistics, and achievements across card and board games.

## Tech Stack

- TypeScript
- Expo SDK 54 + Expo Router v6
- React Native 0.81 / React 19
- react-native-reanimated, react-native-gesture-handler

## Architecture

- `app/` — Expo Router file-based routes
- `app/index.tsx` — Landing screen
- `app/(tabs)/` — Main app tab group
- `components/` — Shared UI components
- `constants/theme.ts` — Color palette (Palette, Colors) and Fonts
- `assets/` — Images, SVGs, fonts

## Coding Rules

- Use functional React components
- Inline styles (not StyleSheet.create) unless styles are reused
- Use expo-image (not RN Image)
- Use expo-router for all navigation
- Prefer flex gap over margin/padding

## Commands

npx expo start
npx expo start --ios
npx expo start --android
