-- PasteKeeper Supabase Setup
-- Run this SQL in your Supabase SQL Editor to set up the necessary tables and policies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clipboard_items table
CREATE TABLE public.clipboard_items (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  subcategory TEXT,
  timestamp BIGINT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  char_count INTEGER NOT NULL,
  device_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  sync_status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create devices table
CREATE TABLE public.devices (
  device_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  device_name TEXT,
  device_type TEXT,
  platform TEXT,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sync_history table
CREATE TABLE public.sync_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  items_synced INTEGER DEFAULT 0,
  items_received INTEGER DEFAULT 0,
  sync_type TEXT,
  platform TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.clipboard_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

-- Create policies for clipboard_items
CREATE POLICY "Users can view their own clipboard items" 
  ON public.clipboard_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clipboard items" 
  ON public.clipboard_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own clipboard items" 
  ON public.clipboard_items FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clipboard items" 
  ON public.clipboard_items FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for devices
CREATE POLICY "Users can view their own devices" 
  ON public.devices FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" 
  ON public.devices FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own devices" 
  ON public.devices FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" 
  ON public.devices FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for sync_history
CREATE POLICY "Users can view their own sync history" 
  ON public.sync_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync history" 
  ON public.sync_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create function to set user_id on insert
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically set user_id
CREATE TRIGGER set_clipboard_items_user_id
BEFORE INSERT ON public.clipboard_items
FOR EACH ROW
WHEN (NEW.user_id IS NULL)
EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_devices_user_id
BEFORE INSERT ON public.devices
FOR EACH ROW
WHEN (NEW.user_id IS NULL)
EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_sync_history_user_id
BEFORE INSERT ON public.sync_history
FOR EACH ROW
WHEN (NEW.user_id IS NULL)
EXECUTE FUNCTION public.set_user_id();

-- Create indexes for better performance
CREATE INDEX clipboard_items_user_id_idx ON public.clipboard_items(user_id);
CREATE INDEX devices_user_id_idx ON public.devices(user_id);
CREATE INDEX sync_history_user_id_idx ON public.sync_history(user_id);
CREATE INDEX clipboard_items_timestamp_idx ON public.clipboard_items(timestamp); 