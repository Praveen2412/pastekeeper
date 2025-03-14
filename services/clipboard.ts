import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';
import { ClipboardItem, loadClipboardData, saveClipboardData, DEFAULT_CLIPBOARD_DATA } from './storage';

// Simple content type detection
export const detectContentType = (content: string): { type: 'text' | 'url' | 'code' | 'json' | 'html' | 'markdown' | 'image'; subcategory?: string } => {
  if (!content) {
    return { type: 'text' };
  }

  // URL detection
  const urlRegex = /^(https?:\/\/[^\s]+)$/;
  if (urlRegex.test(content)) {
    return { type: 'url' };
  }

  // Code detection (simple heuristic)
  const codeIndicators = [
    '{', '}', // JSON, objects
    'function', 'const ', 'let ', 'var ', // JavaScript
    'import ', 'export ', // ES modules
    '<div', '<span', '<p', '<a', // HTML
    'class ', 'def ', 'if ', 'for ', // Various languages
    '#!/', // Shebang
  ];
  
  const hasCodeIndicator = codeIndicators.some(indicator => 
    content.includes(indicator) && 
    (content.includes(';') || content.includes('{') || content.includes('}'))
  );
  
  if (hasCodeIndicator) {
    return { type: 'code' };
  }

  return { type: 'text' };
};

// Copy content to clipboard
export const copyToClipboard = async (content: string): Promise<void> => {
  try {
    await Clipboard.setStringAsync(content);
    console.log('[CLIPBOARD] Content copied to clipboard');
  } catch (error) {
    console.error('[CLIPBOARD] Error copying to clipboard:', error);
    throw error;
  }
};

// Add to clipboard history
export const addToClipboardHistory = async (item: ClipboardItem): Promise<void> => {
  try {
    const clipboardData = await loadClipboardData();
    
    // Check if item already exists (avoid duplicates)
    const existingItemIndex = clipboardData.items.findIndex(i => i.content === item.content);
    
    if (existingItemIndex !== -1) {
      // Update existing item's timestamp
      clipboardData.items[existingItemIndex].timestamp = Date.now();
      
      // Move to the top of the list
      const existingItem = clipboardData.items[existingItemIndex];
      clipboardData.items.splice(existingItemIndex, 1);
      clipboardData.items.unshift(existingItem);
    } else {
      // Add new item to the beginning
      clipboardData.items.unshift(item);
    }
    
    // Update last updated timestamp
    clipboardData.lastUpdated = Date.now();
    
    // Save updated data
    await saveClipboardData(clipboardData);
  } catch (error) {
    console.error('[CLIPBOARD] Error adding to clipboard history:', error);
    throw error;
  }
};

// Get clipboard history
export const getClipboardHistory = async (): Promise<ClipboardItem[]> => {
  try {
    const clipboardData = await loadClipboardData();
    return clipboardData.items;
  } catch (error) {
    console.error('[CLIPBOARD] Error getting clipboard history:', error);
    return [];
  }
};

// Check if clipboard has changed
export const checkClipboardForChanges = async (
  lastContent: string | null,
  onNewContent: (item: ClipboardItem) => void
): Promise<string | null> => {
  try {
    console.log('[CLIPBOARD] Checking for clipboard changes...');
    
    // Get string content from clipboard
    let content: string | null = null;
    try {
      content = await Clipboard.getStringAsync();
    } catch (error) {
      console.error('[CLIPBOARD] Error getting string from clipboard:', error);
      return lastContent;
    }
    
    // If content is empty or same as last, no change
    if (!content || content === lastContent) {
      return lastContent;
    }
    
    console.log('[CLIPBOARD] New clipboard content detected:', content.substring(0, 50) + (content.length > 50 ? '...' : ''));
    
    // Detect content type
    const { type, subcategory } = detectContentType(content);
    
    // Create new clipboard item
    const newItem: ClipboardItem = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      type,
      subcategory,
      charCount: content.length,
      isFavorite: false,
    };
    
    // Add to history and notify
    await addToClipboardHistory(newItem);
    onNewContent(newItem);
    
    return content;
  } catch (error) {
    console.error('[CLIPBOARD] Error checking clipboard:', error);
    return lastContent;
  }
};

// Start clipboard monitoring
export const startClipboardMonitoring = async (
  onNewContent: (item: ClipboardItem) => void,
  options: {
    interval?: number;
  } = {}
): Promise<() => void> => {
  console.log('[CLIPBOARD] Starting clipboard monitoring...');
  
  // Set interval (default: 2000ms)
  const interval = options.interval || 2000;
  console.log(`[CLIPBOARD] Monitoring interval: ${interval}ms`);
  
  // Clean up any existing intervals
  let intervalId: NodeJS.Timeout | null = null;
  let lastContent: string | null = null;
  
  // Initialize last content
  try {
    lastContent = await Clipboard.getStringAsync();
    console.log('[CLIPBOARD] Initial clipboard content:', lastContent ? 
      (lastContent.substring(0, 50) + (lastContent.length > 50 ? '...' : '')) : 'empty');
  } catch (error) {
    console.error('[CLIPBOARD] Error getting initial clipboard content:', error);
  }
  
  // Start monitoring interval
  intervalId = setInterval(async () => {
    lastContent = await checkClipboardForChanges(lastContent, onNewContent);
  }, interval);
  
  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log('[CLIPBOARD] Clipboard monitoring stopped');
    }
  };
};

// Placeholder function to maintain compatibility
export const isValidImageDataUrl = (str: string): boolean => {
  return false; // Image detection disabled
}; 