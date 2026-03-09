# Anki Clone V2

A modern, offline-first flashcard learning application built with Expo and React Native, featuring the **FSRS (Free Spaced Repetition Scheduler)** algorithm.

[![Expo](https://img.shields.io/badge/Expo-55.0.0-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.83.2-61dafb.svg)](https://reactnative.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Overview

Anki Clone V2 allows users to import existing `.apkg` files and study flashcards with all progress saved locally on-device. It leverages the advanced FSRS algorithm for more efficient long-term retention compared to traditional SM-2 based systems.

## ✨ Key Features

- **.apkg Import**: Seamlessly import your existing Anki decks, including media (images and audio).
- **FSRS Algorithm**: State-of-the-art spaced repetition for optimized learning intervals.
- **Offline-First**: All data, including your collection and review history, is stored locally using SQLite.
- **Media Support**: Support for images and audio within flashcards.
- **Modern UI**: Clean, intuitive interface built with React Native and Expo Router.
- **Statistics**: Track your learning progress with detailed study analytics.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Expo SDK 55 + React Native |
| **Navigation** | Expo Router |
| **State Management** | Zustand |
| **Database** | expo-sqlite |
| **SRS Engine** | [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) |
| **Media Handling** | expo-file-system, expo-av |
| **Styling** | TypeScript + React Native Styles |

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo Go](https://expo.dev/expo-go) app on your physical device OR an iOS/Android emulator.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/anki-clone-v2.git
    cd anki-clone-v2
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Running the App

1.  **Start the Expo server**:
    ```bash
    npm start
    ```

2.  **Open the app**:
    - Scan the **QR code** with Expo Go (Android) or the Camera app (iOS).
    - Press **`a`** for Android emulator.
    - Press **`i`** for iOS simulator.

## 📂 Project Structure

- `app/`: Expo Router screens and navigation layouts.
- `src/components/`: Reusable UI components.
- `src/services/`: Business logic, including database repositories and import services.
- `src/stores/`: Zustand state management.
- `src/models/`: TypeScript interfaces and types.
- `docs/`: Detailed project documentation (Architecture, Requirements, Plans).

## 📖 Documentation

For more detailed information, please refer to the files in the `docs/` directory:
- [Architecture](docs/architecture.md)
- [Requirements](docs/requirement.md)
- [Implementation Plan](docs/plan.md)
- [Verification Guide](docs/VERIFICATION_GUIDE.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (if applicable).
