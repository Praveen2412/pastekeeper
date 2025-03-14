# Supabase Integration for PasteKeeper

This document provides an overview of how Supabase is integrated with the PasteKeeper app for cloud synchronization of clipboard data.

## Overview

PasteKeeper uses Supabase as its backend service to provide:

1. **User Authentication**: Secure sign-up, sign-in, and password reset functionality.
2. **Data Synchronization**: Cloud storage and synchronization of clipboard items across devices.
3. **Device Management**: Tracking of user devices for multi-device synchronization.
4. **Sync History**: Logging of synchronization events for troubleshooting and analytics.

## Database Structure

The Supabase database consists of the following tables:

### clipboard_items

Stores the actual clipboard data that users save and sync.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| content | text | The clipboard content |
| type | text | Type of content (text, image, etc.) |
| timestamp | timestamptz | When the item was created |
| is_favorite | boolean | Whether the item is marked as favorite |
| is_pinned | boolean | Whether the item is pinned |
| tags | text[] | Array of tags associated with the item |
| metadata | jsonb | Additional metadata about the item |
| device_id | text | ID of the device that created the item |

### devices

Tracks user devices for multi-device synchronization.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| device_id | text | Unique identifier for the device |
| device_name | text | User-friendly name for the device |
| platform | text | Operating system/platform |
| last_sync | timestamptz | When the device last synced |
| is_active | boolean | Whether the device is still active |

### sync_history

Logs synchronization events for troubleshooting and analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| device_id | text | ID of the device that performed the sync |
| timestamp | timestamptz | When the sync occurred |
| items_synced | integer | Number of items sent to server |
| items_received | integer | Number of items received from server |
| success | boolean | Whether the sync was successful |
| error_message | text | Error message if sync failed |

## Security

All tables are protected with Row Level Security (RLS) policies to ensure that:

1. Users can only access their own data.
2. Authentication is required for all database operations.
3. Data integrity is maintained through proper constraints.

## API Functions

The app interacts with Supabase through the following main functions:

- **Authentication**: `signUp`, `signIn`, `signOut`, `resetPassword`
- **Clipboard Data**: `syncClipboardItems`, `getClipboardItems`, `deleteClipboardItems`
- **Device Management**: `registerDevice`, `updateDeviceLastSync`
- **Sync Status**: `logSyncEvent`, `getSyncHistory`

## Setup Instructions

For detailed setup instructions, please refer to the [Supabase Setup Guide](./SUPABASE_SETUP_GUIDE.md) in this directory.

## Files

- `supabase_setup.sql`: SQL script to set up all necessary tables and policies
- `SUPABASE_SETUP_GUIDE.md`: Step-by-step guide for setting up Supabase
- `sample.env`: Example environment file for storing Supabase credentials
- `env-config-example.ts`: Example code for loading environment variables

## Troubleshooting

For common issues and their solutions, refer to the Troubleshooting section in the [Supabase Setup Guide](./SUPABASE_SETUP_GUIDE.md).

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native) 