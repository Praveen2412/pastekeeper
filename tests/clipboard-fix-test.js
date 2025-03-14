// Test script to verify our fixes for the clipboard monitoring issue

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

// Mock the clipboard context
const mockClipboardContext = {
  clipboardData: {...mockClipboardData},
  
  // Add item
  addItem(item) {
    console.log('[TEST] Adding item:', JSON.stringify(item, null, 2));
    
    // Use a ref to get the latest clipboard data
    const currentData = this.clipboardData;
    console.log('[TEST] Current items count:', currentData.items.length);
    
    // Check if this content already exists to avoid duplicates
    const existingItemIndex = currentData.items.findIndex(
      existingItem => existingItem.content === item.content
    );
    
    console.log('[TEST] Existing item index:', existingItemIndex);
    
    let updatedItems;
    const now = Date.now();
    
    if (existingItemIndex !== -1) {
      // Get the existing item
      const existingItem = currentData.items[existingItemIndex];
      console.log('[TEST] Found existing item:', JSON.stringify(existingItem, null, 2));
      
      // Update the existing item's timestamp but preserve all other properties
      const updatedExistingItem = {
        ...existingItem,
        timestamp: now
      };
      
      console.log('[TEST] Updated existing item:', JSON.stringify(updatedExistingItem, null, 2));
      
      // Create a new array with the updated item at the beginning and all other items
      updatedItems = [
        updatedExistingItem,
        ...currentData.items.filter((_, index) => index !== existingItemIndex)
      ];
    } else {
      // If it doesn't exist, create a new item with a unique ID and add it to the beginning
      const newItem = {
        ...item,
        id: now.toString(),
        timestamp: now,
      };
      
      console.log('[TEST] Creating new item:', JSON.stringify(newItem, null, 2));
      updatedItems = [newItem, ...currentData.items];
    }
    
    // Limit to max history items
    updatedItems = updatedItems.slice(0, 100);
    
    console.log('[TEST] Updated items count:', updatedItems.length);
    
    // Update clipboard data
    this.clipboardData = {
      ...currentData,
      items: updatedItems,
      lastUpdated: now,
    };
    
    console.log('[TEST] Current clipboard data items:', this.clipboardData.items.length);
    console.log('[TEST] Current clipboard data:', JSON.stringify(this.clipboardData.items, null, 2));
  }
};

// Mock the clipboard monitoring service
const mockClipboardMonitoring = {
  lastClipboardContent: null,
  
  // Start monitoring
  startMonitoring(onNewContent) {
    console.log('[TEST] Starting clipboard monitoring');
    
    // Reset last clipboard content
    this.lastClipboardContent = null;
    
    // Initialize last clipboard content
    this.initializeLastClipboardContent();
    
    // Return function to stop monitoring
    return () => {
      console.log('[TEST] Stopping clipboard monitoring');
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

// Test case: Simulate multiple clipboard changes with the same content
console.log('\n\nTEST CASE: SIMULATING MULTIPLE CLIPBOARD CHANGES WITH THE SAME CONTENT\n');

// Start monitoring
const stopMonitoring = mockClipboardMonitoring.startMonitoring(
  (item) => mockClipboardContext.addItem(item)
);

// Simulate first clipboard change
console.log('\n[TEST] Simulating first clipboard change');
mockClipboard.setContent('Test content 1');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

// Simulate second clipboard change (different content)
console.log('\n[TEST] Simulating second clipboard change (different content)');
mockClipboard.setContent('Test content 2');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

// Simulate third clipboard change (same as first content)
console.log('\n[TEST] Simulating third clipboard change (same as first content)');
mockClipboard.setContent('Test content 1');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

// Simulate fourth clipboard change (same as second content)
console.log('\n[TEST] Simulating fourth clipboard change (same as second content)');
mockClipboard.setContent('Test content 2');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

// Simulate fifth clipboard change (same as second content again)
console.log('\n[TEST] Simulating fifth clipboard change (same as second content again)');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

// Stop monitoring
stopMonitoring();

// Print final clipboard data
console.log('\n[TEST] Final clipboard data:');
console.log('[TEST] Items count:', mockClipboardContext.clipboardData.items.length);
console.log('[TEST] Items:', JSON.stringify(mockClipboardContext.clipboardData.items, null, 2));

// Verify that we have only 2 unique items
const uniqueContents = new Set(mockClipboardContext.clipboardData.items.map(item => item.content));
console.log('\n[TEST] Unique contents count:', uniqueContents.size);
console.log('[TEST] Unique contents:', Array.from(uniqueContents));

// Verify that the most recent item is at the top
console.log('\n[TEST] Most recent item:', mockClipboardContext.clipboardData.items[0].content);

// Verify that the timestamps are updated correctly
console.log('\n[TEST] Item timestamps:');
mockClipboardContext.clipboardData.items.forEach(item => {
  console.log(`[TEST] ${item.content}: ${item.timestamp}`);
}); 