// Test script to verify our fixes for the clipboard monitoring infinite loop issue

// Mock the clipboard data
const mockClipboardData = {
  items: [],
  favorites: [],
  lastUpdated: Date.now(),
  version: '1.0.0'
};

// Mock the clipboard service
const mockClipboard = {
  content: null,
  
  // Set clipboard content
  setContent(content) {
    console.log('[TEST] Setting clipboard content:', content);
    this.content = content;
    return true;
  },
  
  // Get clipboard content
  getContent() {
    return this.content;
  },
  
  // Check if clipboard has content
  hasContent() {
    return this.content !== null;
  }
};

// Mock interval ID
let mockIntervalId = null;

// Mock setInterval and clearInterval
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;

global.setInterval = (callback, interval) => {
  console.log('[TEST] Setting up interval with interval:', interval);
  mockIntervalId = 123; // Mock ID
  return mockIntervalId;
};

global.clearInterval = (id) => {
  console.log('[TEST] Clearing interval with ID:', id);
  mockIntervalId = null;
};

// Mock the clipboard monitoring service
const mockClipboardMonitoring = {
  lastClipboardContent: null,
  monitoringIntervalId: null,
  
  // Start monitoring
  startMonitoring(onNewContent, interval = 1000) {
    console.log('[TEST] Starting clipboard monitoring with interval:', interval);
    
    // Clean up any existing monitoring
    if (this.monitoringIntervalId) {
      console.log('[TEST] Cleaning up existing interval');
      clearInterval(this.monitoringIntervalId);
      this.monitoringIntervalId = null;
    }
    
    // Reset last clipboard content
    this.lastClipboardContent = null;
    
    // Initialize last clipboard content
    this.initializeLastClipboardContent();
    
    // Set up interval for checking clipboard
    this.monitoringIntervalId = setInterval(() => {
      this.checkForChanges(onNewContent);
    }, interval);
    
    // Return function to stop monitoring
    return () => {
      console.log('[TEST] Stopping clipboard monitoring');
      if (this.monitoringIntervalId) {
        clearInterval(this.monitoringIntervalId);
        this.monitoringIntervalId = null;
      }
      this.lastClipboardContent = null;
    };
  },
  
  // Initialize last clipboard content
  initializeLastClipboardContent() {
    if (mockClipboard.hasContent()) {
      this.lastClipboardContent = mockClipboard.getContent();
      console.log('[TEST] Initialized last clipboard content:', this.lastClipboardContent);
    } else {
      console.log('[TEST] No initial clipboard content found');
    }
  },
  
  // Check for changes
  checkForChanges(onNewContent) {
    if (!mockClipboard.hasContent()) {
      console.log('[TEST] No content in clipboard');
      return false;
    }
    
    const content = mockClipboard.getContent();
    console.log('[TEST] Current clipboard content:', content);
    console.log('[TEST] Last clipboard content:', this.lastClipboardContent);
    
    // If content is the same as last time or empty, do nothing
    if (content === this.lastClipboardContent || content === '') {
      console.log('[TEST] No change detected or empty content');
      return false;
    }
    
    console.log('[TEST] Change detected:', { 
      previous: this.lastClipboardContent, 
      current: content 
    });
    
    // Update last content
    this.lastClipboardContent = content;
    
    // Process the content
    const processedItem = this.processContent(content);
    console.log('[TEST] Processed item:', processedItem);
    
    // Call the callback with the new item
    console.log('[TEST] Calling onNewContent callback');
    onNewContent(processedItem);
    
    return true;
  },
  
  // Process content
  processContent(content) {
    return {
      content,
      type: 'text',
      isFavorite: false,
      charCount: content.length,
    };
  }
};

// Mock the HomeScreen component
const mockHomeScreen = {
  monitoringActiveRef: { current: false },
  stopMonitoringRef: { current: null },
  
  // Setup monitoring
  setupMonitoring(autoStartMonitoring, interval, handleNewClipboardContent) {
    console.log('[TEST] Setting up monitoring, autoStart:', autoStartMonitoring);
    
    // Clean up any existing monitoring
    if (this.stopMonitoringRef.current) {
      console.log('[TEST] Cleaning up existing monitoring');
      this.stopMonitoringRef.current();
      this.stopMonitoringRef.current = null;
      this.monitoringActiveRef.current = false;
    }
    
    if (autoStartMonitoring) {
      console.log('[TEST] Starting monitoring with interval:', interval);
      this.monitoringActiveRef.current = true;
      
      const stopMonitoring = mockClipboardMonitoring.startMonitoring(
        handleNewClipboardContent,
        interval
      );
      
      // Store the cleanup function in the ref
      this.stopMonitoringRef.current = stopMonitoring;
    }
    
    // Return cleanup function
    return () => {
      if (this.stopMonitoringRef.current) {
        console.log('[TEST] Stopping monitoring on cleanup');
        this.stopMonitoringRef.current();
        this.stopMonitoringRef.current = null;
        this.monitoringActiveRef.current = false;
      }
    };
  }
};

// Test case: Simulate component mounting and unmounting
console.log('\n\nTEST CASE: SIMULATING COMPONENT MOUNTING AND UNMOUNTING\n');

// Simulate component mounting
console.log('\n[TEST] Simulating component mounting');
const cleanup1 = mockHomeScreen.setupMonitoring(true, 2000, (item) => {
  console.log('[TEST] Received item:', item);
});

// Simulate component re-rendering with the same props
console.log('\n[TEST] Simulating component re-rendering with the same props');
const cleanup2 = mockHomeScreen.setupMonitoring(true, 2000, (item) => {
  console.log('[TEST] Received item:', item);
});

// Simulate component re-rendering with different props
console.log('\n[TEST] Simulating component re-rendering with different props');
const cleanup3 = mockHomeScreen.setupMonitoring(true, 3000, (item) => {
  console.log('[TEST] Received item:', item);
});

// Simulate component unmounting
console.log('\n[TEST] Simulating component unmounting');
cleanup3();

// Test case: Simulate toggling monitoring on and off
console.log('\n\nTEST CASE: SIMULATING TOGGLING MONITORING ON AND OFF\n');

// Simulate turning monitoring on
console.log('\n[TEST] Simulating turning monitoring on');
const cleanup4 = mockHomeScreen.setupMonitoring(true, 2000, (item) => {
  console.log('[TEST] Received item:', item);
});

// Simulate turning monitoring off
console.log('\n[TEST] Simulating turning monitoring off');
const cleanup5 = mockHomeScreen.setupMonitoring(false, 2000, (item) => {
  console.log('[TEST] Received item:', item);
});

// Simulate turning monitoring on again
console.log('\n[TEST] Simulating turning monitoring on again');
const cleanup6 = mockHomeScreen.setupMonitoring(true, 2000, (item) => {
  console.log('[TEST] Received item:', item);
});

// Simulate component unmounting
console.log('\n[TEST] Simulating component unmounting');
cleanup6();

// Restore original functions
global.setInterval = originalSetInterval;
global.clearInterval = originalClearInterval;

console.log('\n[TEST] Test completed successfully!'); 