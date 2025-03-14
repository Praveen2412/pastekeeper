// Test file to verify clipboard monitoring functionality

// Mock clipboard data
const mockClipboardData = {
  items: [
    {
      id: '1',
      content: 'Existing item 1',
      type: 'text',
      timestamp: 1000,
      isFavorite: false,
      charCount: 14
    },
    {
      id: '2',
      content: 'Existing item 2',
      type: 'text',
      timestamp: 900,
      isFavorite: true,
      charCount: 14
    }
  ],
  favorites: ['2'],
  lastUpdated: 1000,
  version: '1.0.0'
};

// Mock the clipboard service
const mockClipboard = {
  content: null,
  
  // Set clipboard content
  setContent(content) {
    console.log('Setting clipboard content:', content);
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

// Mock the clipboard monitoring service
const mockClipboardMonitoring = {
  lastClipboardContent: null,
  intervalId: null,
  
  // Start monitoring
  startMonitoring(onNewContent, interval = 1000) {
    console.log('Starting clipboard monitoring with interval:', interval);
    
    // Reset last clipboard content
    this.lastClipboardContent = null;
    
    // Initialize last clipboard content
    this.initializeLastClipboardContent();
    
    // Set up interval for checking clipboard
    this.intervalId = setInterval(() => {
      this.checkForChanges(onNewContent);
    }, interval);
    
    // Return function to stop monitoring
    return () => {
      console.log('Stopping clipboard monitoring');
      clearInterval(this.intervalId);
      this.lastClipboardContent = null;
    };
  },
  
  // Initialize last clipboard content
  initializeLastClipboardContent() {
    if (mockClipboard.hasContent()) {
      this.lastClipboardContent = mockClipboard.getContent();
      console.log('Initialized last clipboard content:', this.lastClipboardContent);
    }
  },
  
  // Check for changes
  checkForChanges(onNewContent) {
    if (!mockClipboard.hasContent()) {
      return false;
    }
    
    const content = mockClipboard.getContent();
    
    // If content is the same as last time or empty, do nothing
    if (content === this.lastClipboardContent || content === '') {
      return false;
    }
    
    console.log('Clipboard change detected:', { 
      previous: this.lastClipboardContent, 
      current: content 
    });
    
    // Update last content
    this.lastClipboardContent = content;
    
    // Process the content
    const processedItem = this.processContent(content);
    
    // Call the callback with the new item
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

// Mock the clipboard context
const mockClipboardContext = {
  clipboardData: {...mockClipboardData},
  
  // Add item
  addItem(item) {
    console.log('=== ADDING ITEM ===');
    console.log('Item to add:', JSON.stringify(item, null, 2));
    
    // Check if this content already exists to avoid duplicates
    const existingItemIndex = this.clipboardData.items.findIndex(
      existingItem => existingItem.content === item.content
    );
    
    console.log('Existing item index:', existingItemIndex);
    
    let updatedItems;
    const now = Date.now();
    
    if (existingItemIndex !== -1) {
      // Get the existing item
      const existingItem = this.clipboardData.items[existingItemIndex];
      console.log('Found existing item:', JSON.stringify(existingItem, null, 2));
      
      // Update the existing item's timestamp but preserve all other properties
      const updatedExistingItem = {
        ...existingItem,
        timestamp: now
      };
      
      console.log('Updated existing item:', JSON.stringify(updatedExistingItem, null, 2));
      
      // Create a new array with the updated item at the beginning and all other items
      updatedItems = [
        updatedExistingItem,
        ...this.clipboardData.items.filter((_, index) => index !== existingItemIndex)
      ];
    } else {
      // If it doesn't exist, create a new item with a unique ID and add it to the beginning
      const newItem = {
        ...item,
        id: now.toString(),
        timestamp: now,
      };
      
      console.log('Creating new item:', JSON.stringify(newItem, null, 2));
      updatedItems = [newItem, ...this.clipboardData.items];
    }
    
    // Limit to max history items
    updatedItems = updatedItems.slice(0, 100);
    
    console.log('Updated items count:', updatedItems.length);
    
    // Update clipboard data
    this.clipboardData = {
      ...this.clipboardData,
      items: updatedItems,
      lastUpdated: now,
    };
    
    console.log('Current clipboard data items:', this.clipboardData.items.length);
    console.log('=== ITEM ADDED ===');
  }
};

// Test case 1: Simulate clipboard monitoring with multiple changes
console.log('\n\nTEST CASE 1: SIMULATING CLIPBOARD MONITORING WITH MULTIPLE CHANGES\n');

// Start monitoring
const stopMonitoring = mockClipboardMonitoring.startMonitoring(
  (item) => mockClipboardContext.addItem(item),
  1000
);

// Simulate clipboard changes
console.log('\nSimulating first clipboard change - new content');
mockClipboard.setContent('Test content 1');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

console.log('\nSimulating second clipboard change - different content');
mockClipboard.setContent('Test content 2');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

console.log('\nSimulating third clipboard change - same as first content');
mockClipboard.setContent('Test content 1');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

console.log('\nSimulating fourth clipboard change - same as second content');
mockClipboard.setContent('Test content 2');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

// Stop monitoring
stopMonitoring();

// Print final clipboard data
console.log('\nFinal clipboard data:');
console.log('Items count:', mockClipboardContext.clipboardData.items.length);
console.log('Items:', JSON.stringify(mockClipboardContext.clipboardData.items, null, 2));

// Test case 2: Simulate stopping and restarting monitoring
console.log('\n\nTEST CASE 2: SIMULATING STOPPING AND RESTARTING MONITORING\n');

// Reset clipboard context
mockClipboardContext.clipboardData = {...mockClipboardData};

// Start monitoring
const stopMonitoring2 = mockClipboardMonitoring.startMonitoring(
  (item) => mockClipboardContext.addItem(item),
  1000
);

// Simulate clipboard change
console.log('\nSimulating clipboard change before stopping');
mockClipboard.setContent('Test content 3');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

// Stop monitoring
stopMonitoring2();

// Simulate clipboard change while monitoring is stopped
console.log('\nSimulating clipboard change while monitoring is stopped');
mockClipboard.setContent('Test content 4');

// Restart monitoring
const stopMonitoring3 = mockClipboardMonitoring.startMonitoring(
  (item) => mockClipboardContext.addItem(item),
  1000
);

// Simulate clipboard change after restarting
console.log('\nSimulating clipboard change after restarting');
mockClipboard.setContent('Test content 5');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

// Simulate same clipboard content again
console.log('\nSimulating same clipboard content again');
mockClipboardMonitoring.checkForChanges((item) => mockClipboardContext.addItem(item));

// Stop monitoring
stopMonitoring3();

// Print final clipboard data
console.log('\nFinal clipboard data after restart test:');
console.log('Items count:', mockClipboardContext.clipboardData.items.length);
console.log('Items:', JSON.stringify(mockClipboardContext.clipboardData.items, null, 2)); 