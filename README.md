# MyPet - App Overview

This document provides a brief overview of the core features and the main libraries utilized in the **MyPet** application.

## 🐾 Core Features

Based on the application structure, the app is a virtual pet simulation featuring:

- **Pet Activities & Care:** Interactive screens dedicated to taking care of the pet:
  - **Bathing:** Wash and keep your pet clean.
  - **Playing:** Interact and play with your pet to keep it happy.
  - **Sleeping:** Put your pet to rest to regain energy.
- **Status Tracking:** Visual indicators (via `ProgressBar` components) to track the pet's vital stats like health, happiness, or cleanliness.
- **Interactive UI:** Features such as `FallingEmojis` for visual rewards, and custom modals for alerts and interactions.
- **Onboarding & Splash:** Smooth introductory experience for new users.

## 📚 Libraries & Tech Stack

The app is built using **React Native** and incorporates several powerful libraries to ensure a high-performance, engaging user experience:

### UI & Animations

- **`react-native-reanimated` & `react-native-gesture-handler`:** Provides fluid, 60fps animations and complex gesture interactions.
- **`@shopify/react-native-skia`:** High-performance 2D graphics rendering for custom drawing and visual effects.
- **`lottie-react-native`:** Renders high-quality After Effects animations natively.
- **`react-native-svg`:** Provides support for scalable vector graphics.
- **`lucide-react-native`:** A beautiful and consistent icon set.
- **`react-native-size-matters`:** Provides utility functions for responsive UI sizing across different devices and screen sizes.

### Navigation & State Management

- **`@react-navigation/native` & `@react-navigation/native-stack`:** Handles routing and transitions between different screens (Home, Bathing, Playing, etc.).
- **`@reduxjs/toolkit` & `react-redux`:** Manages global application state (likely tracking the pet's stats, level, and user preferences).

### Storage & Utilities

- **`react-native-mmkv`:** An incredibly fast key-value storage solution, perfect for persisting the pet's state locally.
- **`react-native-sound`:** Enables playing audio effects and background music during interactions.
- **`react-native-haptic-feedback`:** Provides tactile feedback (vibrations) to make interactions feel more realistic and engaging.
- **`react-native-keyboard-aware-scroll-view`:** Ensures input fields are never blocked by the device keyboard.
