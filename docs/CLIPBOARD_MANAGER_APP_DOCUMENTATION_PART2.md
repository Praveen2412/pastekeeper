# PasteKeeper Mobile App - Complete Documentation (Part 2)

## Components and Their Functionality

### 1. Core Services

#### Clipboard Service (`services/clipboard.ts`)

**Purpose**: Manages clipboard monitoring and operations.

**Functions**:
- `startClipboardMonitoring()` - Starts the clipboard monitoring process
  - *Input*: None
  - *Output*: None
  - *Actions*: Sets up interval to check clipboard for changes

- `checkClipboardForChanges()` - Monitors clipboard for new content
  - *Input*: None
  - *Output*: Promise<boolean> (true if changes detected)
  - *Actions*: Polls clipboard, detects changes, processes new content

- `processClipboardContent(content)` - Processes and categorizes clipboard content
  - *Input*: `content` (string or binary data)
  - *Output*: ClipboardItem object
  - *Actions*: Categorizes content, creates new item

- `copyToClipboard(content)` - Copies content to system clipboard
  - *Input*: `content` (string)
  - *Output*: Promise<boolean> (success/failure)
  - *Actions*: Copies content to system clipboard

- `getClipboardContent()` - Gets current clipboard content
  - *Input*: None
  - *Output*: Promise<string | null>
  - *Actions*: Retrieves current clipboard content

#### Storage Service (`services/storage.ts`)

**Purpose**: Manages local storage operations.

**Functions**:
- `saveClipboardData(data)` - Saves clipboard data to local storage
  - *Input*: `data` (ClipboardData object)
  - *Output*: Promise<void>
  - *Actions*: Persists data to AsyncStorage

- `loadClipboardData()` - Loads clipboard data from local storage
  - *Input*: None
  - *Output*: Promise<ClipboardData>
  - *Actions*: Retrieves data from AsyncStorage

- `saveSettings(settings)` - Saves settings to local storage
  - *Input*: `settings` (Settings object)
  - *Output*: Promise<void>
  - *Actions*: Persists settings to AsyncStorage

- `loadSettings()` - Loads settings from local storage
  - *Input*: None
  - *Output*: Promise<Settings>
  - *Actions*: Retrieves settings from AsyncStorage

#### Supabase Service (`services/supabase.ts`)

**Purpose**: Manages Supabase client and operations.

**Functions**:
- `initSupabase()` - Initializes Supabase client
  - *Input*: None
  - *Output*: SupabaseClient
  - *Actions*: Creates and configures Supabase client

- `signIn(email, password)` - Signs in user
  - *Input*: `email` (string), `password` (string)
  - *Output*: Promise<User | null>
  - *Actions*: Authenticates user with Supabase

- `signUp(email, password)` - Signs up new user
  - *Input*: `email` (string), `password` (string)
  - *Output*: Promise<User | null>
  - *Actions*: Creates new user in Supabase

- `signOut()` - Signs out user
  - *Input*: None
  - *Output*: Promise<void>
  - *Actions*: Signs out user from Supabase

- `resetPassword(email)` - Sends password reset email
  - *Input*: `email` (string)
  - *Output*: Promise<void>
  - *Actions*: Sends password reset email via Supabase

- `syncClipboardData(data)` - Synchronizes clipboard data with cloud
  - *Input*: `data` (ClipboardData object)
  - *Output*: Promise<void>
  - *Actions*: Uploads clipboard data to Supabase

- `fetchClipboardData()` - Fetches clipboard data from cloud
  - *Input*: None
  - *Output*: Promise<ClipboardData>
  - *Actions*: Downloads clipboard data from Supabase

#### Notifications Service (`services/notifications.ts`)

**Purpose**: Manages notification functionality.

**Functions**:
- `requestNotificationPermissions()` - Requests notification permissions
  - *Input*: None
  - *Output*: Promise<boolean>
  - *Actions*: Requests permission from user

- `showNotification(title, body, data)` - Shows notification
  - *Input*: `title` (string), `body` (string), `data` (object)
  - *Output*: Promise<void>
  - *Actions*: Displays notification to user

- `setupNotificationListeners()` - Sets up notification listeners
  - *Input*: None
  - *Output*: Function (cleanup function)
  - *Actions*: Sets up listeners for notification interactions

### 2. React Contexts

#### AuthContext (`contexts/AuthContext.tsx`)

**Purpose**: Provides authentication state and functions.

**State**:
- `user` (User | null) - Current authenticated user
- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message

**Functions**:
- `signIn(email, password)` - Signs in user
- `signUp(email, password)` - Signs up new user
- `signOut()` - Signs out user
- `resetPassword(email)` - Sends password reset email
- `updateProfile(profile)` - Updates user profile

#### ClipboardContext (`contexts/ClipboardContext.tsx`)

**Purpose**: Provides clipboard data and operations.

**State**:
- `clipboardItems` (ClipboardItem[]) - All clipboard items
- `favorites` (ClipboardItem[]) - Favorited clipboard items
- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message

**Functions**:
- `addItem(content, type)` - Adds new item to clipboard history
- `deleteItem(id)` - Deletes item from history
- `clearAll()` - Clears all clipboard history
- `toggleFavorite(id)` - Toggles favorite status
- `copyItem(id)` - Copies item to clipboard
- `getFilteredItems(category, query)` - Gets filtered items

#### ThemeContext (`contexts/ThemeContext.tsx`)

**Purpose**: Provides theme state and functions.

**State**:
- `theme` ('light' | 'dark' | 'system') - Current theme
- `colors` (object) - Theme colors
- `isDark` (boolean) - Whether current theme is dark

**Functions**:
- `setTheme(theme)` - Sets theme
- `toggleTheme()` - Toggles between light and dark themes

#### SyncContext (`contexts/SyncContext.tsx`)

**Purpose**: Provides cloud sync state and functions.

**State**:
- `isSyncing` (boolean) - Whether sync is in progress
- `lastSyncTime` (Date | null) - Last successful sync time
- `syncError` (string | null) - Sync error message
- `syncEnabled` (boolean) - Whether sync is enabled
- `syncCategories` (string[]) - Categories to sync

**Functions**:
- `enableSync(enabled)` - Enables/disables sync
- `setSyncCategories(categories)` - Sets categories to sync
- `syncNow()` - Triggers immediate sync
- `getSyncStatus()` - Gets current sync status

### 3. Custom Hooks

#### useClipboardData Hook (`hooks/useClipboardData.ts`)

**Purpose**: Manages clipboard data and operations.

**Parameters**:
- `initialCategory` (string) - Initial active category
- `initialQuery` (string) - Initial search query

**Returns**:
- `clipboardItems` (ClipboardItem[]) - All clipboard items
- `filteredItems` (ClipboardItem[]) - Filtered clipboard items
- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message
- `copyItem` (function) - Copies item to clipboard
- `toggleFavorite` (function) - Toggles favorite status
- `deleteItem` (function) - Deletes item from history
- `addItem` (function) - Adds new item to history
- `clearAll` (function) - Clears all clipboard history
- `handleCategoryChange` (function) - Changes active category
- `handleSearchQueryChange` (function) - Updates search query
- `loadData` (function) - Loads data from storage
- `selectedItems` (ClipboardItem[]) - Selected items for multi-select
- `isMultiSelectMode` (boolean) - Multi-select mode state
- `toggleItemSelection` (function) - Toggles item selection
- `selectAllItems` (function) - Selects all items
- `clearSelection` (function) - Clears selection
- `toggleMultiSelectMode` (function) - Toggles multi-select mode
- `deleteSelectedItems` (function) - Deletes selected items
- `shareSelectedItems` (function) - Shares selected items

**Functions**:
- `loadData()` - Loads data from storage
- `filterItems(items, category, query)` - Filters items based on category and query
- `copyItem(id)` - Copies item to system clipboard
- `toggleFavorite(id)` - Toggles item favorite status
- `deleteItem(id)` - Deletes item from history
- `addItem(content, type)` - Adds new item to history
- `clearAll()` - Clears all clipboard history
- `handleCategoryChange(category)` - Changes active category
- `handleSearchQueryChange(query)` - Updates search query
- `toggleItemSelection(id)` - Toggles item selection
- `selectAllItems()` - Selects all visible items
- `clearSelection()` - Clears current selection
- `toggleMultiSelectMode()` - Toggles multi-select mode
- `deleteSelectedItems()` - Deletes selected items
- `shareSelectedItems()` - Shares selected items

#### useCloudSync Hook (`hooks/useCloudSync.ts`)

**Purpose**: Manages cloud synchronization.

**Returns**:
- `isSyncing` (boolean) - Whether sync is in progress
- `lastSyncTime` (Date | null) - Last successful sync time
- `syncError` (string | null) - Sync error message
- `syncEnabled` (boolean) - Whether sync is enabled
- `syncCategories` (string[]) - Categories to sync
- `enableSync` (function) - Enables/disables sync
- `setSyncCategories` (function) - Sets categories to sync
- `syncNow` (function) - Triggers immediate sync
- `getSyncStatus` (function) - Gets current sync status

**Functions**:
- `enableSync(enabled)` - Enables/disables sync
- `setSyncCategories(categories)` - Sets categories to sync
- `syncNow()` - Triggers immediate sync
- `getSyncStatus()` - Gets current sync status
- `setupAutoSync(interval)` - Sets up automatic sync
- `resolveConflicts(localData, remoteData)` - Resolves sync conflicts

#### useTheme Hook (`hooks/useTheme.ts`)

**Purpose**: Manages theme operations.

**Returns**:
- `theme` ('light' | 'dark' | 'system') - Current theme
- `colors` (object) - Theme colors
- `isDark` (boolean) - Whether current theme is dark
- `setTheme` (function) - Sets theme
- `toggleTheme` (function) - Toggles between light and dark themes

**Functions**:
- `setTheme(theme)` - Sets theme
- `toggleTheme()` - Toggles between light and dark themes
- `getSystemTheme()` - Gets system theme preference

#### useAuth Hook (`hooks/useAuth.ts`)

**Purpose**: Manages authentication operations.

**Returns**:
- `user` (User | null) - Current authenticated user
- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message
- `signIn` (function) - Signs in user
- `signUp` (function) - Signs up new user
- `signOut` (function) - Signs out user
- `resetPassword` (function) - Sends password reset email
- `updateProfile` (function) - Updates user profile

**Functions**:
- `signIn(email, password)` - Signs in user
- `signUp(email, password)` - Signs up new user
- `signOut()` - Signs out user
- `resetPassword(email)` - Sends password reset email
- `updateProfile(profile)` - Updates user profile
- `checkAuthState()` - Checks current authentication state

### 4. React Native Components

#### Main App Component (`app/index.tsx`)

**Purpose**: Main application screen.

**State**:
- `activeCategory` (string) - Currently selected category
- `searchQuery` (string) - Current search query
- `isAddModalOpen` (boolean) - Add item modal visibility
- `notification` (object) - Current notification

**Functions**:
- `handleCategoryChange(category)` - Changes active category
- `handleSearch(query)` - Updates search query
- `handleAddItem(content, type)` - Adds new item to clipboard history

#### CategoryTabs Component (`components/clipboard/CategoryTabs.tsx`)

**Purpose**: Provides navigation between content categories.

**Props**:
- `activeCategory` (string) - Currently selected category
- `onCategoryChange` (function) - Category change handler
- `categories` (array) - Available categories configuration

**Functions**:
- `handleCategoryPress(category)` - Changes active category

#### ClipboardList Component (`components/clipboard/ClipboardList.tsx`)

**Purpose**: Displays list of clipboard items.

**Props**:
- `items` (array) - Clipboard items to display
- `onCopyItem` (function) - Copy item handler
- `onDeleteItem` (function) - Delete item handler
- `onToggleFavorite` (function) - Favorite toggle handler
- `selectedItems` (array) - Selected items for multi-select
- `isMultiSelectMode` (boolean) - Multi-select mode state
- `onToggleItemSelection` (function) - Item selection toggle handler
- `onSelectAllItems` (function) - Select all items handler
- `onClearSelection` (function) - Clear selection handler
- `onShareItem` (function) - Share item handler

**Functions**:
- `renderItem({ item })` - Renders individual clipboard item
- `handleSelectAll()` - Selects all visible items
- `handleClearSelection()` - Clears current selection
- `handleRefresh()` - Refreshes list data

#### ClipboardItem Component (`components/clipboard/ClipboardItem.tsx`)

**Purpose**: Renders individual clipboard item with actions.

**Props**:
- `item` (object) - Clipboard item data
- `onCopy` (function) - Copy handler
- `onDelete` (function) - Delete handler
- `onToggleFavorite` (function) - Favorite toggle handler
- `isSelected` (boolean) - Selection state
- `onToggleSelection` (function) - Selection toggle handler
- `isMultiSelectMode` (boolean) - Multi-select mode state
- `onShare` (function) - Share handler

**Functions**:
- `handleCopyPress()` - Handles copy button press
- `handleDeletePress()` - Handles delete button press
- `handleFavoritePress()` - Handles favorite button press
- `handleSelectionToggle()` - Handles selection checkbox toggle
- `handleSharePress()` - Handles share button press
- `renderContent()` - Renders item content based on type
- `formatTimestamp(timestamp)` - Formats timestamp to relative time

#### AddItemModal Component (`components/clipboard/AddItemModal.tsx`)

**Purpose**: Modal for adding new clipboard items manually.

**Props**:
- `visible` (boolean) - Modal visibility
- `onClose` (function) - Close handler
- `onAddItem` (function) - Add item handler

**State**:
- `content` (string) - New item content
- `type` (string) - New item type

**Functions**:
- `handleContentChange(text)` - Updates content state
- `handleTypeChange(type)` - Updates type state
- `handleSubmit()` - Submits new item
- `resetForm()` - Resets form fields

#### AppBar Component (`components/ui/AppBar.tsx`)

**Purpose**: App bar with navigation and actions.

**Props**:
- `title` (string) - App bar title
- `showBackButton` (boolean) - Whether to show back button
- `onBackPress` (function) - Back button handler
- `actions` (array) - Action buttons configuration

**Functions**:
- `handleBackPress()` - Handles back button press
- `renderAction(action, index)` - Renders action button

#### SearchBar Component (`components/ui/SearchBar.tsx`)

**Purpose**: Search input for filtering items.

**Props**:
- `value` (string) - Current search query
- `onChangeText` (function) - Text change handler
- `placeholder` (string) - Placeholder text

**State**:
- `isExpanded` (boolean) - Whether search bar is expanded

**Functions**:
- `handleFocus()` - Handles input focus
- `handleBlur()` - Handles input blur
- `handleClear()` - Clears search query

#### SyncStatus Component (`components/cloud/SyncStatus.tsx`)

**Purpose**: Displays cloud sync status.

**Props**:
- `lastSyncTime` (Date | null) - Last successful sync time
- `isSyncing` (boolean) - Whether sync is in progress
- `syncError` (string | null) - Sync error message
- `onSyncPress` (function) - Sync button handler

**Functions**:
- `handleSyncPress()` - Handles sync button press
- `formatSyncTime(time)` - Formats sync time
- `getSyncStatusText()` - Gets sync status text

#### AccountInfo Component (`components/cloud/AccountInfo.tsx`)

**Purpose**: Displays user account information.

**Props**:
- `user` (User | null) - Current authenticated user
- `onSignOutPress` (function) - Sign out button handler
- `onEditProfilePress` (function) - Edit profile button handler

**Functions**:
- `handleSignOutPress()` - Handles sign out button press
- `handleEditProfilePress()` - Handles edit profile button press
- `formatUserInfo(user)` - Formats user information

### 5. Screens

#### Home Screen (`app/index.tsx`)

**Purpose**: Main application screen.

**State**:
- `activeCategory` (string) - Currently selected category
- `searchQuery` (string) - Current search query
- `isAddModalOpen` (boolean) - Add item modal visibility

**Functions**:
- `handleCategoryChange(category)` - Changes active category
- `handleSearch(query)` - Updates search query
- `handleAddItem(content, type)` - Adds new item to clipboard history
- `handleOpenSettings()` - Opens settings screen
- `handleOpenCloudSync()` - Opens cloud sync screen

#### Settings Screen (`app/settings/index.tsx`)

**Purpose**: Main settings screen.

**Functions**:
- `navigateToAppearance()` - Navigates to appearance settings
- `navigateToCloudSync()` - Navigates to cloud sync settings
- `navigateToAbout()` - Navigates to about screen
- `handleClearHistory()` - Clears clipboard history
- `handleExportData()` - Exports clipboard data
- `handleImportData()` - Imports clipboard data

#### Cloud Sync Settings Screen (`app/settings/cloud-sync.tsx`)

**Purpose**: Cloud synchronization settings.

**State**:
- `syncEnabled` (boolean) - Whether sync is enabled
- `syncCategories` (string[]) - Categories to sync
- `syncInterval` (number) - Automatic sync interval

**Functions**:
- `handleSyncToggle(enabled)` - Toggles sync enabled state
- `handleCategoryToggle(category)` - Toggles category sync
- `handleIntervalChange(interval)` - Changes sync interval
- `handleSyncNow()` - Triggers immediate sync
- `handleSignOut()` - Signs out user
- `handleDeleteAccount()` - Deletes user account

#### Appearance Settings Screen (`app/settings/appearance.tsx`)

**Purpose**: Appearance settings.

**State**:
- `theme` ('light' | 'dark' | 'system') - Current theme

**Functions**:
- `handleThemeChange(theme)` - Changes theme
- `handleFontSizeChange(size)` - Changes font size
- `handleAccentColorChange(color)` - Changes accent color

#### Sign In Screen (`app/auth/sign-in.tsx`)

**Purpose**: User sign in screen.

**State**:
- `email` (string) - Email input
- `password` (string) - Password input
- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message

**Functions**:
- `handleEmailChange(text)` - Updates email state
- `handlePasswordChange(text)` - Updates password state
- `handleSignIn()` - Handles sign in button press
- `navigateToSignUp()` - Navigates to sign up screen
- `navigateToForgotPassword()` - Navigates to forgot password screen

#### Sign Up Screen (`app/auth/sign-up.tsx`)

**Purpose**: User sign up screen.

**State**:
- `email` (string) - Email input
- `password` (string) - Password input
- `confirmPassword` (string) - Confirm password input
- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message

**Functions**:
- `handleEmailChange(text)` - Updates email state
- `handlePasswordChange(text)` - Updates password state
- `handleConfirmPasswordChange(text)` - Updates confirm password state
- `handleSignUp()` - Handles sign up button press
- `navigateToSignIn()` - Navigates to sign in screen

#### Forgot Password Screen (`app/auth/forgot-password.tsx`)

**Purpose**: Password reset screen.

**State**:
- `email` (string) - Email input
- `isLoading` (boolean) - Loading state
- `isSubmitted` (boolean) - Whether form is submitted
- `error` (string | null) - Error message

**Functions**:
- `handleEmailChange(text)` - Updates email state
- `handleSubmit()` - Handles submit button press
- `navigateToSignIn()` - Navigates to sign in screen 