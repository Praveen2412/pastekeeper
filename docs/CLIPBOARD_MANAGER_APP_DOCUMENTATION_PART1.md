# PasteKeeper Mobile App - Complete Documentation (Part 1)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Folder and File Structure](#folder-and-file-structure)
- [Components and Their Functionality](#components-and-their-functionality)
- [Data Flow and Object Interactions](#data-flow-and-object-interactions)
- [End-to-End Flows](#end-to-end-flows)
- [Implementation Guide](#implementation-guide)
- [Troubleshooting and Edge Cases](#troubleshooting-and-edge-cases)

## Overview

The PasteKeeper Mobile App is a cross-platform productivity tool designed to help users efficiently manage their clipboard history across devices. Building on the success of the Chrome extension, this mobile application captures copied content automatically, organizes it into categories, and provides easy access through an intuitive mobile interface. The app features a modern, customizable UI and supports text, URLs, code snippets, and images with cloud synchronization capabilities.

## Features

### 1. Clipboard History Management

- **Automated Tracking**: Automatically captures text, URLs, and images copied to clipboard
- **Categorization**: Sorts content into distinct categories (Text, URLs, Code, Images)
- **Time-based Organization**: Shows when items were copied (e.g., "7 mins ago", "2 hours ago")
- **Character Count**: Displays character count for each clipboard item
- **History Limit**: Maintains up to 100 most recent clipboard items (configurable in settings)
- **Cross-device Sync**: Synchronizes clipboard history across multiple devices via cloud storage

### 2. User Interaction Features

- **Favorite Items**: Star important items for quick access
- **Search Functionality**: Real-time search through clipboard history
- **One-Click Copy**: Copy any saved item back to clipboard with a single click
- **Add Manual Entries**: Add custom text directly to clipboard history
- **Delete Unwanted Items**: Remove individual items from history
- **Clear History**: Option to clear all clipboard history
- **Multi-select Mode**: Select multiple items for batch operations
- **Share Items**: Share clipboard items via messaging apps, email, etc.
- **Export/Import**: Export clipboard history to file and import from file

### 3. Multiple Access Methods

- **Main App Interface**: Primary mobile app interface
- **Widget Support**: Home screen widget for quick access to recent clipboard items
- **Quick Settings Tile**: Quick settings access for Android devices
- **Action Extension**: Share sheet integration for iOS devices
- **Notification Access**: Quick copy from notification panel

### 4. Modern UI & UX

- **Theme Options**: Dark, light, and system theme support
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Intuitive Controls**: Clear, icon-based action buttons
- **Tabbed Navigation**: Easy switching between content categories
- **Real-time Search**: Instant filtering as you type
- **Notifications**: Visual feedback for user actions
- **Gesture Support**: Swipe actions for common operations
- **Haptic Feedback**: Tactile feedback for actions

### 5. Cloud Synchronization

- **Cross-device Sync**: Synchronize clipboard history across multiple devices
- **Selective Sync**: Choose which categories to synchronize
- **Encryption**: End-to-end encryption for sensitive clipboard data
- **Offline Support**: Continue using the app without internet connection
- **Conflict Resolution**: Smart handling of conflicting clipboard items
- **Sync History**: View synchronization history and status
- **Account Management**: Create, manage, and delete cloud sync account

## Technical Architecture

### Architecture Overview

The app is built using a combination of:

- **Frontend**: React Native with TypeScript, Expo, and Expo Router
- **UI Framework**: React Native Paper for consistent, Material Design components
- **Backend/Database**: Supabase for authentication, database, and storage
- **State Management**: React Context API with hooks
- **Storage**: AsyncStorage for local storage, Supabase for cloud storage
- **Clipboard Access**: React Native Clipboard API
- **Navigation**: Expo Router for navigation

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       MOBILE DEVICE                          │
│                                                             │
│  ┌─────────────┐     ┌───────────────┐     ┌──────────────┐  │
│  │  React      │     │  App State    │     │  Clipboard   │  │
│  │  Native UI  │◄───►│  Management   │◄───►│  Service     │  │
│  └─────────────┘     └───────┬───────┘     └──────────────┘  │
│        ▲                     │                   ▲           │
│        │                     ▼                   │           │
│        │             ┌───────────────┐           │           │
│        └─────────────┤  AsyncStorage ├───────────┘           │
│                      │  Local Cache  │                       │
│                      └───────┬───────┘                       │
│                              │                               │
│                              ▼                               │
│                     ┌──────────────────┐                     │
│                     │  System Clipboard │                     │
│                     └────────┬─────────┘                     │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         SUPABASE                             │
│                                                             │
│  ┌─────────────┐     ┌───────────────┐     ┌──────────────┐  │
│  │             │     │               │     │              │  │
│  │  Auth       │     │  PostgreSQL   │     │  Storage     │  │
│  │  Service    │     │  Database     │     │  Service     │  │
│  │             │     │               │     │              │  │
│  └─────────────┘     └───────────────┘     └──────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Technical Components

1. **React Native with Expo**: Provides cross-platform mobile development capabilities with native performance.

2. **TypeScript**: Adds static typing to improve code quality and developer experience.

3. **Expo Router**: Handles navigation between screens with file-system based routing.

4. **React Native Paper**: Provides Material Design components for a consistent UI experience.

5. **Supabase**: Offers authentication, PostgreSQL database, and storage services as a backend.

6. **AsyncStorage**: Provides local storage for offline functionality.

7. **React Context API**: Manages global state across the application.

8. **React Native Clipboard API**: Interfaces with the system clipboard.

9. **Expo Notifications**: Manages notification functionality.

10. **Expo Widgets**: Enables home screen widget functionality.

## Folder and File Structure

```
pastekeeper-mobile/
│
├── app/                       # Main application screens (Expo Router)
│   ├── _layout.tsx            # Root layout component
│   ├── index.tsx              # Home screen
│   ├── settings/              # Settings screens
│   │   ├── index.tsx          # Main settings screen
│   │   ├── cloud-sync.tsx     # Cloud sync settings screen
│   │   ├── appearance.tsx     # Appearance settings screen
│   │   └── about.tsx          # About screen
│   ├── clipboard/             # Clipboard screens
│   │   ├── index.tsx          # Main clipboard screen
│   │   ├── [id].tsx           # Individual clipboard item screen
│   │   └── add.tsx            # Add new clipboard item screen
│   └── auth/                  # Authentication screens
│       ├── sign-in.tsx        # Sign in screen
│       ├── sign-up.tsx        # Sign up screen
│       └── forgot-password.tsx # Forgot password screen
│
├── components/                # Reusable components
│   ├── clipboard/             # Clipboard-related components
│   │   ├── ClipboardItem.tsx  # Individual clipboard item
│   │   ├── ClipboardList.tsx  # List of clipboard items
│   │   ├── AddItemModal.tsx   # Modal for adding new items
│   │   └── CategoryTabs.tsx   # Category navigation tabs
│   ├── ui/                    # UI components
│   │   ├── AppBar.tsx         # App bar component
│   │   ├── SearchBar.tsx      # Search component
│   │   ├── ThemeToggle.tsx    # Theme toggle component
│   │   └── LoadingIndicator.tsx # Loading indicator
│   └── cloud/                 # Cloud sync components
│       ├── SyncStatus.tsx     # Sync status indicator
│       └── AccountInfo.tsx    # Account information component
│
├── contexts/                  # React contexts
│   ├── AuthContext.tsx        # Authentication context
│   ├── ClipboardContext.tsx   # Clipboard data context
│   ├── ThemeContext.tsx       # Theme context
│   └── SyncContext.tsx        # Cloud sync context
│
├── hooks/                     # Custom React hooks
│   ├── useClipboardData.ts    # Hook for clipboard data operations
│   ├── useCloudSync.ts        # Hook for cloud sync operations
│   ├── useTheme.ts            # Hook for theme operations
│   └── useAuth.ts             # Hook for authentication operations
│
├── services/                  # Service modules
│   ├── clipboard.ts           # Clipboard service
│   ├── storage.ts             # Local storage service
│   ├── supabase.ts            # Supabase client and utilities
│   └── notifications.ts       # Notifications service
│
├── utils/                     # Utility functions
│   ├── clipboard.ts           # Clipboard utility functions
│   ├── formatters.ts          # Formatting utility functions
│   ├── validators.ts          # Validation utility functions
│   └── permissions.ts         # Permission handling utilities
│
├── assets/                    # Static assets
│   ├── images/                # Image assets
│   ├── fonts/                 # Font assets
│   └── animations/            # Animation assets
│
├── constants/                 # Constants and configuration
│   ├── theme.ts               # Theme constants
│   ├── config.ts              # App configuration
│   └── endpoints.ts           # API endpoints
│
├── types/                     # TypeScript type definitions
│   ├── clipboard.ts           # Clipboard-related types
│   ├── auth.ts                # Authentication-related types
│   └── supabase.ts            # Supabase-related types
│
├── app.json                   # Expo configuration
├── babel.config.js            # Babel configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # NPM package configuration
└── README.md                  # Project documentation
```

This folder structure follows modern React Native and Expo best practices, with a focus on modularity and separation of concerns. The use of Expo Router dictates the structure of the `app` directory, which contains all the main screens of the application. 