import type { IconRegistry } from '../types.js';

export const domainIcons = {
  box: { body: '<path d="m21 8-9-5-9 5 9 5 9-5z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path>' },
  compass: { body: '<circle cx="12" cy="12" r="9"></circle><path d="m15.5 8.5-2 5-5 2 2-5 5-2z"></path>' },
  globe: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18"></path><path d="M12 3a14 14 0 0 0 0 18"></path>' },
  heart: { body: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>' },
  location: { body: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle>' },
  map: { body: '<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path>' },
  anchor: { body: '<circle cx="12" cy="5" r="3"></circle><path d="M12 8v13"></path><path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>' },
  flask: { body: '<path d="M9 2h6"></path><path d="M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2"></path><path d="M7 16h10"></path>' },
  'heart-pulse': { body: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path><path d="M3 13h4l2-4 3 8 2-4h7"></path>' },
  magnet: { body: '<path d="M6 3v8a6 6 0 0 0 12 0V3"></path><path d="M6 8h4"></path><path d="M14 8h4"></path><path d="M6 3h4"></path><path d="M14 3h4"></path>' },
  presentation: { body: '<rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M12 16v5"></path><path d="m8 21 4-5 4 5"></path><path d="M8 9h8"></path><path d="M8 12h5"></path>' },
  school: { body: '<path d="m3 10 9-6 9 6-9 6-9-6z"></path><path d="M7 12v5c3 2 7 2 10 0v-5"></path><path d="M21 10v6"></path>' },
  sitemap: { body: '<rect x="9" y="3" width="6" height="5" rx="1"></rect><rect x="3" y="16" width="6" height="5" rx="1"></rect><rect x="15" y="16" width="6" height="5" rx="1"></rect><path d="M12 8v4"></path><path d="M6 16v-4h12v4"></path>' },
  suitcase: { body: '<rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M3 12h18"></path>' },
  train: { body: '<rect x="5" y="3" width="14" height="16" rx="3"></rect><path d="M9 19 7 22"></path><path d="m15 19 2 3"></path><path d="M8 8h8"></path><path d="M8 13h.01"></path><path d="M16 13h.01"></path>' },
  wand: { body: '<path d="M15 4 20 9"></path><path d="M14.5 9.5 4 20"></path><path d="M18 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"></path><path d="m5 3 .7 1.3L7 5l-1.3.7L5 7l-.7-1.3L3 5l1.3-.7L5 3z"></path>' },
} as const satisfies IconRegistry;
