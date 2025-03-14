/**
 * Clipboard Monitoring and Image Detection Test
 * 
 * This test verifies:
 * 1. Background clipboard monitoring functionality
 * 2. Image detection capabilities
 * 3. App state transition handling
 */

import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  startClipboardMonitoring,
  checkClipboardForChanges,
  setAppBackgroundState,
  isValidImageDataUrl,
  mightBeImagePath
} from '../services/clipboard';

// Mock data
const TEXT_CONTENT = 'Test clipboard content';
const IMAGE_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const ANDROID_IMAGE_PATH = 'content://media/external/images/media/12345';

// Mock Clipboard API
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve(true)),
  getStringAsync: jest.fn(() => Promise.resolve('')),
  hasStringAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android',
  select: jest.fn(obj => obj.android)
}));

describe('Clipboard Monitoring and Image Detection', () => {
  let onNewContentMock;
  let stopMonitoring;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    onNewContentMock = jest.fn();
    
    // Reset module state
    global.lastClipboardContent = null;
    global.isInBackground = false;
    global.backgroundMonitoringEnabled = true;
    global.monitoringIntervalId = null;
    global.pendingChecksQueue = [];
  });
  
  afterEach(() => {
    if (stopMonitoring) {
      stopMonitoring();
    }
  });
  
  test('Should detect text content changes', async () => {
    // Setup clipboard content
    Clipboard.getStringAsync.mockResolvedValueOnce(TEXT_CONTENT);
    
    // Check for changes
    const hasChanges = await checkClipboardForChanges(onNewContentMock);
    
    // Verify results
    expect(hasChanges).toBe(true);
    expect(onNewContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text',
        content: TEXT_CONTENT
      })
    );
  });
  
  test('Should detect image data URLs', async () => {
    // Setup clipboard content
    Clipboard.getStringAsync.mockResolvedValueOnce(IMAGE_DATA_URL);
    
    // Check for changes
    const hasChanges = await checkClipboardForChanges(onNewContentMock);
    
    // Verify results
    expect(hasChanges).toBe(true);
    expect(onNewContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'image',
        content: IMAGE_DATA_URL
      })
    );
  });
  
  test('Should detect Android image paths', async () => {
    // Setup clipboard content
    Clipboard.getStringAsync.mockResolvedValueOnce(ANDROID_IMAGE_PATH);
    
    // Check for changes
    const hasChanges = await checkClipboardForChanges(onNewContentMock);
    
    // Verify results
    expect(hasChanges).toBe(true);
    expect(onNewContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'image',
        content: ANDROID_IMAGE_PATH,
        subcategory: 'image_path'
      })
    );
  });
  
  test('Should handle background state transitions', async () => {
    // Start monitoring
    stopMonitoring = await startClipboardMonitoring(onNewContentMock, 100);
    
    // Simulate going to background
    const needsRestartOnBackground = setAppBackgroundState(true);
    expect(global.isInBackground).toBe(true);
    expect(needsRestartOnBackground).toBe(false);
    
    // Simulate clipboard change while in background
    Clipboard.getStringAsync.mockResolvedValue(TEXT_CONTENT);
    
    // Wait for a potential check
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate returning to foreground
    const needsRestartOnForeground = setAppBackgroundState(false);
    expect(global.isInBackground).toBe(false);
    expect(needsRestartOnForeground).toBe(true);
    
    // Wait for the check that should happen after returning to foreground
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify that content was detected
    expect(onNewContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text',
        content: TEXT_CONTENT
      })
    );
  });
  
  test('Should validate image data URLs correctly', () => {
    // Valid image data URL
    expect(isValidImageDataUrl(IMAGE_DATA_URL)).toBe(true);
    
    // Invalid data URLs
    expect(isValidImageDataUrl('data:text/plain;base64,SGVsbG8=')).toBe(false);
    expect(isValidImageDataUrl('https://example.com/image.png')).toBe(false);
    expect(isValidImageDataUrl('')).toBe(false);
  });
  
  test('Should identify potential image paths correctly', () => {
    // Valid image paths
    expect(mightBeImagePath(ANDROID_IMAGE_PATH)).toBe(true);
    expect(mightBeImagePath('file:///storage/emulated/0/Pictures/image.jpg')).toBe(true);
    expect(mightBeImagePath('/storage/emulated/0/Pictures/image.png')).toBe(true);
    
    // Invalid image paths
    expect(mightBeImagePath('https://example.com')).toBe(false);
    expect(mightBeImagePath('Just some text')).toBe(false);
  });
}); 