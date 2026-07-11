import { discoveryData } from './data/discoveryData';

// Shuffle an array (Fisher-Yates)
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export function getDiscoveryFeed(filters = []) {
  // Combine all items
  const allItems = [
    ...discoveryData.herbs.map(i => ({ ...i, category: 'herbs' })),
    ...discoveryData.foods.map(i => ({ ...i, category: 'foods' })),
    ...discoveryData.tips.map(i => ({ ...i, category: 'tips' }))
  ];

  // Apply filters if any
  let filtered = allItems;
  if (filters.length > 0) {
    filtered = allItems.filter(item => {
      // Return true if any of the item's tags match the selected filters
      if (!item.tags) return false;
      return filters.some(f => item.tags.includes(f));
    });
  }

  // Shuffle to make it dynamic every time it's loaded
  return shuffle([...filtered]);
}

export function getAvailableTags() {
  const tags = new Set();
  const allItems = [...discoveryData.herbs, ...discoveryData.foods, ...discoveryData.tips];
  allItems.forEach(item => {
    if (item.tags) {
      item.tags.forEach(t => tags.add(t));
    }
  });
  return Array.from(tags).sort();
}
