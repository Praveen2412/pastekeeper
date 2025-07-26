# PasteKeeper Mobile App - Complete Documentation (Part 3)

## Data Flow and Object Interactions

### 1. Data Structures

#### Clipboard Data Structure

The core data structure for the clipboard manager is:

```typescript
interface ClipboardData {
  items: ClipboardItem[];
  favorites: ClipboardItem[];
  lastUpdated: number; // timestamp
  version: string;
}

interface ClipboardItem {
  id: string;
  content: string; // text content or data URL for images
  type: 'text' | 'url' | 'code' | 'image';
  timestamp: number;
  isFavorite: boolean;
  charCount: number;
  syncStatus?: 'synced' | 'pending' | 'conflict';
  deviceId?: string; // for tracking which device created the item
}
```

#### Settings Structure

The settings structure is:

```typescript
interface Settings {
  maxHistoryItems: number; // default: 100
  maxTextLength: number; // default: 10000
  maxImageSize: number; // in KB, default: 1000
  showCharCount: boolean; // default: true
  enableVerboseLogging: boolean; // default: false
  theme: 'light' | 'dark' | 'system'; // default: 'system'
  fontSize: 'small' | 'medium' | 'large'; // default: 'medium'
  accentColor: string; // default: '#007AFF'
  autoStartMonitoring: boolean; // default: true
  monitoringInterval: number; // in ms, default: 2000
  syncEnabled: boolean; // default: false
  syncCategories: string[]; // default: ['text', 'url', 'code', 'image']
  syncInterval: number; // in minutes, default: 30
  syncOnWifiOnly: boolean; // default: true
  encryptSync: boolean; // default: true
}
```

#### User Structure

The user structure is:

```typescript
interface User {
  id: string;
  email: string;
  profile?: {
    displayName?: string;
    avatarUrl?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    fontSize?: 'small' | 'medium' | 'large';
    accentColor?: string;
  };
  subscription?: {
    plan: 'free' | 'premium';
    expiresAt: number;
  };
}
```

#### Sync Status Structure

The sync status structure is:

```typescript
interface SyncStatus {
  lastSyncTime: number | null;
  isSyncing: boolean;
  syncError: string | null;
  pendingChanges: number;
  syncHistory: SyncEvent[];
}

interface SyncEvent {
  timestamp: number;
  action: 'upload' | 'download' | 'merge' | 'error';
  itemCount?: number;
  error?: string;
}
```

### 2. Component Interaction Diagram

```
┌─────────────────────────────────────────┐
│                                         │
│            App (React Native)           │
│                                         │
└───┬─────────┬─────────┬─────────┬───────┘
    │         │         │         │
    ▼         ▼         ▼         ▼
┌─────────┐ ┌───────┐ ┌───────┐ ┌─────────┐
│ AppBar  │ │Category│ │Search │ │Settings │
│         │ │ Tabs   │ │ Bar   │ │ Button  │
└─────────┘ └───┬───┘ └───┬───┘ └────┬────┘
                │         │          │
                ▼         │          ▼
          ┌──────────┐    │    ┌──────────┐
          │Clipboard │◄───┘    │ Settings │
          │  List    │         │ Screens  │
          └────┬─────┘         └────┬─────┘
               │                    │
               ▼                    ▼
         ┌──────────────┐    ┌──────────────┐
         │ ClipboardItem│    │ Cloud Sync   │
         └──────┬───────┘    │ Settings     │
                │            └──────────────┘
                ▼
          ┌──────────┐
          │AddItemModal│
          └──────────┘
```

### 3. Data Flow Diagram

```
┌─────────────────┐  useClipboardData   ┌─────────────┐
│                 │─────────────────────►│             │
│   React Native  │                     │ Clipboard   │
│   Components    │◄─────────────────────│ Service    │
│                 │ clipboardData       │             │
└─────────────────┘                     └──────┬──────┘
      ▲                                        │
      │                                        │
      │ useCloudSync                           │ checkClipboardForChanges
      │                                        │
      │                                        ▼
┌─────┴─────┐                           ┌────────────┐
│           │                           │            │
│  Supabase │                           │  System    │
│  Service  │◄──────────────────────────┤  Clipboard │
│           │   syncClipboardData       │            │
└───────────┘                           └────────────┘
```

## End-to-End Flows

### 1. Clipboard Monitoring and Storage Flow

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌─────────────┐
│ User     │     │ Clipboard     │     │ AsyncStorage │     │ Components  │
│ copies   │────►│ Service       │────►│ stores item  │────►│ update with │
│ content  │     │ detects       │     │              │     │ new item    │
└──────────┘     └───────────────┘     └──────────────┘     └─────────────┘
```

**Detailed Steps**:
1. User copies content in any application on the mobile device
2. Clipboard service detects change via `checkClipboardForChanges()`
3. New content is processed by `processClipboardContent()`
4. Content is categorized and a new ClipboardItem is created
5. Item is added to clipboard data structure
6. `saveClipboardData()` persists updated data to AsyncStorage
7. ClipboardContext notifies components of data change
8. UI updates to show new item at top of list

### 2. Cloud Synchronization Flow

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌─────────────┐
│ User     │     │ SyncContext   │     │ Supabase     │     │ Components  │
│ enables  │────►│ triggers      │────►│ Service      │────►│ update with │
│ sync     │     │ syncNow()     │     │ syncs data   │     │ sync status │
└──────────┘     └───────────────┘     └──────────────┘     └─────────────┘
```

**Detailed Steps**:
1. User enables cloud sync in settings
2. SyncContext updates sync settings
3. `syncNow()` is triggered to perform initial sync
4. Supabase service authenticates user if needed
5. Local clipboard data is uploaded to Supabase
6. Remote clipboard data is downloaded and merged
7. Conflicts are resolved based on timestamp and settings
8. Merged data is saved locally and remotely
9. SyncContext updates sync status
10. UI components display updated sync status
11. Automatic sync is scheduled based on settings

### 3. Multi-select and Batch Operations Flow

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌─────────────┐
│ User     │     │ ClipboardList │     │ useClipboard │     │ Components  │
│ selects  │────►│ toggles       │────►│ Data performs│────►│ update with │
│ items    │     │ selection     │     │ batch action │     │ results     │
└──────────┘     └───────────────┘     └──────────────┘     └─────────────┘
```

**Detailed Steps**:
1. User enables multi-select mode via toggle button
2. UI updates to show checkboxes next to items
3. User selects multiple items by tapping checkboxes
4. `toggleItemSelection()` updates selected items array
5. User taps action button (e.g., delete selected, share selected)
6. Appropriate batch action function is called
7. Action is performed on all selected items
8. Data is updated and persisted
9. UI updates to reflect changes
10. Multi-select mode remains active until toggled off

### 4. Settings Management Flow

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌─────────────┐
│ User     │     │ Settings      │     │ Storage      │     │ Components  │
│ changes  │────►│ Screen        │────►│ Service      │────►│ update with │
│ settings │     │ updates       │     │ saves        │     │ new settings│
└──────────┘     └───────────────┘     └──────────────┘     └─────────────┘
```

**Detailed Steps**:
1. User navigates to settings screen
2. User modifies settings (e.g., theme, sync options)
3. Settings screen calls appropriate update function
4. Settings are validated and processed
5. `saveSettings()` persists settings to AsyncStorage
6. Settings context notifies components of changes
7. Components update to reflect new settings
8. If sync settings changed, sync status is updated

### 5. Share Clipboard Item Flow

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌─────────────┐
│ User     │     │ ClipboardItem │     │ React Native │     │ System      │
│ taps     │────►│ calls         │────►│ Share API    │────►│ Share Sheet │
│ share    │     │ shareItem()   │     │ opens        │     │ displays    │
└──────────┘     └───────────────┘     └──────────────┘     └─────────────┘
```

**Detailed Steps**:
1. User taps share button on a clipboard item
2. `handleSharePress()` is called
3. Item content is prepared for sharing
4. React Native Share API is called
5. System share sheet is displayed
6. User selects destination app
7. Content is shared to selected app
8. Share sheet is dismissed
9. Optional success notification is shown

## Implementation Guide

### 1. Setting Up the Project

1. **Initialize Expo Project**:
   ```bash
   npx create-expo-app -t expo-router pastekeeper-mobile
   cd pastekeeper-mobile
   ```

2. **Install Dependencies**:
   ```bash
   npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-paper react-native-vector-icons react-native-clipboard expo-clipboard expo-notifications expo-sharing expo-file-system expo-haptics
   ```

3. **Configure TypeScript**:
   - Ensure `tsconfig.json` is properly configured
   - Create type definitions in the `types` directory

4. **Set Up Supabase**:
   - Create a Supabase project
   - Set up authentication
   - Create database tables for clipboard data
   - Configure storage buckets for images

5. **Configure Environment Variables**:
   - Create `.env` file for Supabase credentials
   - Set up environment variable loading

### 2. Implementing Core Services

1. **Clipboard Service**:
   - Implement clipboard monitoring system
   - Create content detection and processing
   - Set up clipboard access functions

2. **Storage Service**:
   - Implement AsyncStorage wrapper
   - Create data persistence functions
   - Set up settings storage

3. **Supabase Service**:
   - Initialize Supabase client
   - Implement authentication functions
   - Create data synchronization functions

4. **Notifications Service**:
   - Set up notification permissions
   - Implement notification display
   - Create notification listeners

### 3. Setting Up React Contexts

1. **Auth Context**:
   - Create authentication state management
   - Implement sign in/sign up functions
   - Set up profile management

2. **Clipboard Context**:
   - Implement clipboard data management
   - Create item manipulation functions
   - Set up filtering and search

3. **Theme Context**:
   - Create theme state management
   - Implement theme switching
   - Set up system theme detection

4. **Sync Context**:
   - Implement sync state management
   - Create sync functions
   - Set up automatic sync scheduling

### 4. Creating Custom Hooks

1. **useClipboardData Hook**:
   - Implement clipboard data operations
   - Create filtering and search functions
   - Set up multi-select functionality

2. **useCloudSync Hook**:
   - Implement cloud sync operations
   - Create conflict resolution
   - Set up sync status tracking

3. **useTheme Hook**:
   - Implement theme operations
   - Create theme switching functions
   - Set up system theme detection

4. **useAuth Hook**:
   - Implement authentication operations
   - Create profile management functions
   - Set up auth state tracking

### 5. Building UI Components

1. **Main App Structure**:
   - Set up Expo Router
   - Create layout components
   - Implement navigation

2. **Clipboard Components**:
   - Create ClipboardList component
   - Implement ClipboardItem component
   - Build AddItemModal component
   - Create CategoryTabs component

3. **UI Components**:
   - Build AppBar component
   - Implement SearchBar component
   - Create ThemeToggle component
   - Build LoadingIndicator component

4. **Cloud Sync Components**:
   - Create SyncStatus component
   - Implement AccountInfo component

### 6. Implementing Screens

1. **Home Screen**:
   - Create main clipboard view
   - Implement search and filtering
   - Set up category navigation

2. **Settings Screens**:
   - Build main settings screen
   - Implement appearance settings
   - Create cloud sync settings
   - Build about screen

3. **Authentication Screens**:
   - Create sign in screen
   - Implement sign up screen
   - Build forgot password screen

4. **Clipboard Detail Screen**:
   - Create individual item view
   - Implement item actions
   - Build sharing functionality

### 7. Implementing Cloud Sync

1. **Authentication Flow**:
   - Implement sign in/sign up
   - Create password reset
   - Set up profile management

2. **Data Synchronization**:
   - Implement data upload
   - Create data download
   - Build conflict resolution
   - Set up automatic sync

3. **Selective Sync**:
   - Implement category selection
   - Create sync filtering
   - Build sync settings

4. **Encryption**:
   - Implement end-to-end encryption
   - Create key management
   - Build secure storage

### 8. Adding Mobile-Specific Features

1. **Widget Support**:
   - Create home screen widget
   - Implement widget data updates
   - Build widget interactions

2. **Quick Settings Tile (Android)**:
   - Implement quick settings tile
   - Create tile actions
   - Build tile updates

3. **Action Extension (iOS)**:
   - Create share extension
   - Implement content processing
   - Build extension UI

4. **Notification Access**:
   - Implement notification clipboard access
   - Create notification actions
   - Build notification management

5. **Gesture Support**:
   - Implement swipe actions
   - Create long press actions
   - Build drag and drop support

6. **Haptic Feedback**:
   - Implement haptic feedback for actions
   - Create feedback patterns
   - Build feedback settings

### 9. Testing and Debugging

1. **Unit Testing**:
   - Set up Jest for testing
   - Create service tests
   - Implement hook tests
   - Build component tests

2. **Integration Testing**:
   - Set up integration tests
   - Create end-to-end flows
   - Implement UI testing

3. **Performance Testing**:
   - Test clipboard monitoring performance
   - Measure sync performance
   - Evaluate UI responsiveness

4. **Error Handling**:
   - Implement error boundaries
   - Create error reporting
   - Build error recovery

### 10. Deployment

1. **App Store Preparation**:
   - Create app icons
   - Write app descriptions
   - Prepare screenshots
   - Build privacy policy

2. **Google Play Preparation**:
   - Create store listing
   - Prepare marketing materials
   - Build release APK
   - Set up Play Console

3. **Beta Testing**:
   - Set up TestFlight for iOS
   - Create Google Play beta
   - Gather feedback
   - Implement improvements

4. **Production Release**:
   - Submit to App Store
   - Publish on Google Play
   - Monitor analytics
   - Plan updates 