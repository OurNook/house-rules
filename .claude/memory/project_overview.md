---
name: Project Overview
description: House Rules app — purpose, tech stack, current state, and known issues
type: project
---

House Rules is a family game night scoring app (card and board games). Tracks scores, stats, and persistent achievement records.

**Tech Stack:** React Native + Expo (expo-router v6), TypeScript, React 19.1. CLAUDE.md incorrectly says Next.js/Tailwind — the actual stack is Expo/React Native.

**Current State (2026-05-04):** Very early — default Expo boilerplate not yet replaced. Two tabs (Home, Explore) still contain placeholder content. No game logic or data layer exists yet.

**PLAN.md** is the working task list. Task 1 (landing page with logo + "Let's Play!" button) is pending.

**Why:** Starting fresh from Expo starter template; no backend or state management chosen yet.

**How to apply:** Treat this as a greenfield mobile app build. Suggest Expo-native solutions (expo-router navigation, AsyncStorage, etc.) rather than web patterns.
