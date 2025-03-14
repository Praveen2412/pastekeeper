// Test file to verify clipboard functionality

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

// Mock settings
const mockSettings = {
  maxHistoryItems: 100
};

// Mock the addItem function to test its behavior
const testAddItem = (clipboardData, item, settings) => {
  console.log('=== TESTING ADD ITEM ===');
  console.log('Initial state:', JSON.stringify(clipboardData, null, 2));
  
  // Create new item with current timestamp
  const now = Date.now();
  const newItem = {
    ...item,
    id: now.toString(),
    timestamp: now,
  };
  console.log('New item to add:', JSON.stringify(newItem, null, 2));

  // Check if this content already exists to avoid duplicates
  const existingItemIndex = clipboardData.items.findIndex(
    existingItem => existingItem.content === item.content
  );
  
  console.log('Existing item index:', existingItemIndex);
  
  let updatedItems;
  
  if (existingItemIndex !== -1) {
    // Get the existing item
    const existingItem = clipboardData.items[existingItemIndex];
    console.log('Found existing item:', JSON.stringify(existingItem, null, 2));
    
    // Update the existing item's timestamp
    const updatedExistingItem = {
      ...existingItem,
      timestamp: now
    };
    console.log('Updated existing item:', JSON.stringify(updatedExistingItem, null, 2));
    
    // Create a new array with the updated item at the beginning and all other items
    updatedItems = [
      updatedExistingItem,
      ...clipboardData.items.filter((_, index) => index !== existingItemIndex)
    ];
  } else {
    // If it doesn't exist, add the new item to the beginning
    console.log('No existing item found, adding new item');
    updatedItems = [newItem, ...clipboardData.items];
  }
  
  // Limit to max history items
  updatedItems = updatedItems.slice(0, settings.maxHistoryItems);
  
  const updatedClipboardData = {
    ...clipboardData,
    items: updatedItems,
    lastUpdated: now,
  };
  
  console.log('Final state:', JSON.stringify(updatedClipboardData, null, 2));
  console.log('=== TEST COMPLETE ===');
  
  return updatedClipboardData;
};

// Test case 1: Adding a new item
console.log('\n\nTEST CASE 1: ADDING A NEW ITEM\n');
const newItem = {
  content: 'New item',
  type: 'text',
  isFavorite: false,
  charCount: 8
};
testAddItem(mockClipboardData, newItem, mockSettings);

// Test case 2: Adding an existing item
console.log('\n\nTEST CASE 2: ADDING AN EXISTING ITEM\n');
const existingItem = {
  content: 'Existing item 1',
  type: 'text',
  isFavorite: false,
  charCount: 14
};
testAddItem(mockClipboardData, existingItem, mockSettings);

// Test case 3: Adding an existing item that is favorited
console.log('\n\nTEST CASE 3: ADDING AN EXISTING ITEM THAT IS FAVORITED\n');
const existingFavoritedItem = {
  content: 'Existing item 2',
  type: 'text',
  isFavorite: false, // Note: This is false in the input but should remain true in the output
  charCount: 14
};
testAddItem(mockClipboardData, existingFavoritedItem, mockSettings);

// Test case 4: Simulating multiple clipboard monitoring events with the same content
console.log('\n\nTEST CASE 4: SIMULATING MULTIPLE CLIPBOARD MONITORING EVENTS\n');
let currentClipboardData = {...mockClipboardData};

// First monitoring event - adds a new item
console.log('First monitoring event - adds a new item');
const monitoredItem1 = {
  content: 'Monitored item',
  type: 'text',
  isFavorite: false,
  charCount: 14
};
currentClipboardData = testAddItem(currentClipboardData, monitoredItem1, mockSettings);

// Second monitoring event - same content, should update timestamp and move to top
console.log('Second monitoring event - same content, should update timestamp and move to top');
const monitoredItem2 = {
  content: 'Monitored item',
  type: 'text',
  isFavorite: false,
  charCount: 14
};
currentClipboardData = testAddItem(currentClipboardData, monitoredItem2, mockSettings);

// Third monitoring event - same content again, should update timestamp and move to top
console.log('Third monitoring event - same content again, should update timestamp and move to top');
const monitoredItem3 = {
  content: 'Monitored item',
  type: 'text',
  isFavorite: false,
  charCount: 14
};
currentClipboardData = testAddItem(currentClipboardData, monitoredItem3, mockSettings); 