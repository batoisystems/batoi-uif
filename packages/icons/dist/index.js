// src/icons.ts
var icons = {
  activity: { body: '<path d="M22 12h-4l-3 8L9 4l-3 8H2"></path>' },
  alert: { body: '<path d="m12 3 10 18H2L12 3z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>' },
  approval: { body: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path>' },
  archive: { body: '<rect x="3" y="4" width="18" height="4" rx="1"></rect><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"></path><path d="M10 12h4"></path>' },
  "area-chart": { body: '<path d="M3 3v18h18"></path><path d="m7 15 4-5 3 3 5-7v12H7z"></path>' },
  "arrow-down": { body: '<path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path>' },
  "arrow-left": { body: '<path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path>' },
  "arrow-right": { body: '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>' },
  "arrow-up": { body: '<path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path>' },
  "at-sign": { body: '<circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 1 0 3-3"></path><path d="M19.1 17A9 9 0 1 1 21 12"></path>' },
  audit: { body: '<path d="M3 3v18h18"></path><path d="m7 14 3-3 3 2 5-6"></path>' },
  award: { body: '<circle cx="12" cy="8" r="5"></circle><path d="m8.5 12.5-2 8 5.5-3 5.5 3-2-8"></path>' },
  bank: { body: '<path d="m3 10 9-6 9 6"></path><path d="M4 10h16"></path><path d="M6 10v8"></path><path d="M10 10v8"></path><path d="M14 10v8"></path><path d="M18 10v8"></path><path d="M4 18h16"></path>' },
  "bar-chart": { body: '<path d="M3 3v18h18"></path><path d="M7 16V9"></path><path d="M12 16V5"></path><path d="M17 16v-4"></path>' },
  batoi: {
    body: '<path fill="currentColor" stroke="none" d="M10.1 12.2c-.1-2.1.5-4.8 1.7-8C6 4 1.5 8.2 1.5 14.1 1.5 19.6 6 24 11.5 24s10-4.4 10-9.9c0-2.5-.9-4.8-2.5-6.6-3.2.6-6.2 2.2-8.9 4.7z"></path><path fill="currentColor" stroke="none" d="M11.4 9.2C12.2 5.6 14.1 2.7 17.4 0l5.3 4.4c-4.7.5-8.3 2.2-11.3 4.8z"></path>'
  },
  battery: { body: '<rect x="3" y="7" width="16" height="10" rx="2"></rect><path d="M21 11v2"></path><path d="M7 11v2"></path><path d="M10 11v2"></path><path d="M13 11v2"></path>' },
  bell: { body: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path>' },
  bluetooth: { body: '<path d="m7 7 10 10-5 4V3l5 4L7 17"></path>' },
  bot: { body: '<rect x="5" y="8" width="14" height="10" rx="3"></rect><path d="M12 8V4"></path><path d="M8 13h.01"></path><path d="M16 13h.01"></path><path d="M9 18v2"></path><path d="M15 18v2"></path>' },
  box: { body: '<path d="m21 8-9-5-9 5 9 5 9-5z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path>' },
  brain: { body: '<path d="M9 4a3 3 0 0 0-3 3v1a4 4 0 0 0 0 8v1a3 3 0 0 0 5 2.2V4.8A3 3 0 0 0 9 4z"></path><path d="M15 4a3 3 0 0 1 3 3v1a4 4 0 0 1 0 8v1a3 3 0 0 1-5 2.2V4.8A3 3 0 0 1 15 4z"></path><path d="M7 10h4"></path><path d="M13 14h4"></path>' },
  briefcase: { body: '<rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M3 12h18"></path><path d="M10 12v2h4v-2"></path>' },
  building: { body: '<rect x="4" y="3" width="16" height="18" rx="2"></rect><path d="M8 7h.01"></path><path d="M12 7h.01"></path><path d="M16 7h.01"></path><path d="M8 11h.01"></path><path d="M12 11h.01"></path><path d="M16 11h.01"></path><path d="M9 21v-5h6v5"></path>' },
  calculator: { body: '<rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M8 7h8"></path><path d="M8 11h.01"></path><path d="M12 11h.01"></path><path d="M16 11h.01"></path><path d="M8 15h.01"></path><path d="M12 15h.01"></path><path d="M16 15h.01"></path>' },
  calendar: { body: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path>' },
  camera: { body: '<path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z"></path><circle cx="12" cy="13" r="3"></circle>' },
  card: { body: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path><path d="M7 15h3"></path><path d="M14 15h3"></path>' },
  cart: { body: '<circle cx="9" cy="20" r="1"></circle><circle cx="17" cy="20" r="1"></circle><path d="M3 4h2l2.5 11h10L20 7H6"></path>' },
  cash: { body: '<rect x="3" y="6" width="18" height="12" rx="2"></rect><circle cx="12" cy="12" r="3"></circle><path d="M6 9v6"></path><path d="M18 9v6"></path>' },
  chart: { body: '<path d="M3 3v18h18"></path><path d="m7 14 3-3 3 2 5-6"></path>' },
  check: { body: '<path d="m20 6-11 11-5-5"></path>' },
  "check-circle": { body: '<circle cx="12" cy="12" r="9"></circle><path d="m8 12 3 3 5-6"></path>' },
  "chevron-down": { body: '<path d="m6 9 6 6 6-6"></path>' },
  "chevron-left": { body: '<path d="m15 18-6-6 6-6"></path>' },
  "chevron-right": { body: '<path d="m9 18 6-6-6-6"></path>' },
  "chevron-up": { body: '<path d="m18 15-6-6-6 6"></path>' },
  "circle-dot": { body: '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="2"></circle>' },
  clock: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>' },
  close: { body: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>' },
  cloud: { body: '<path d="M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z"></path>' },
  code: { body: '<path d="m16 18 6-6-6-6"></path><path d="m8 6-6 6 6 6"></path>' },
  command: { body: '<path d="M9 9H5.5a2.5 2.5 0 1 1 2.5-2.5V18a2.5 2.5 0 1 1-2.5-2.5H18a2.5 2.5 0 1 1-2.5 2.5V6.5A2.5 2.5 0 1 1 18 9H9z"></path>' },
  compass: { body: '<circle cx="12" cy="12" r="9"></circle><path d="m15.5 8.5-2 5-5 2 2-5 5-2z"></path>' },
  copy: { body: '<rect x="9" y="9" width="13" height="13" rx="2"></rect><rect x="2" y="2" width="13" height="13" rx="2"></rect>' },
  cpu: { body: '<rect x="7" y="7" width="10" height="10" rx="2"></rect><path d="M9 1v3"></path><path d="M15 1v3"></path><path d="M9 20v3"></path><path d="M15 20v3"></path><path d="M1 9h3"></path><path d="M1 15h3"></path><path d="M20 9h3"></path><path d="M20 15h3"></path>' },
  "credit-card": { body: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path><path d="M7 15h4"></path>' },
  dashboard: { body: '<path d="M4 13a8 8 0 1 1 16 0"></path><path d="M12 13l4-4"></path><path d="M5 19h14"></path>' },
  database: { body: '<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path>' },
  desktop: { body: '<rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8"></path><path d="M12 16v4"></path>' },
  document: { body: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h6"></path>' },
  "donut-chart": { body: '<path d="M12 3a9 9 0 1 1-8.5 6"></path><path d="M12 3v6"></path><circle cx="12" cy="12" r="3"></circle>' },
  drag: { body: '<path d="M9 5h.01"></path><path d="M15 5h.01"></path><path d="M9 12h.01"></path><path d="M15 12h.01"></path><path d="M9 19h.01"></path><path d="M15 19h.01"></path>' },
  download: { body: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path>' },
  edit: { body: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>' },
  error: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M15 9 9 15"></path><path d="m9 9 6 6"></path>' },
  "external-link": { body: '<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>' },
  eye: { body: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>' },
  "eye-off": { body: '<path d="M2 2l20 20"></path><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16.7 16.7 0 0 1-3.1 4.1"></path><path d="M14.1 14.1A3 3 0 0 1 9.9 9.9"></path><path d="M6.6 6.6A16.2 16.2 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1"></path>' },
  file: { body: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path>' },
  filter: { body: '<path d="M22 3H2l8 9v7l4 2v-9l8-9z"></path>' },
  flag: { body: '<path d="M5 22V4"></path><path d="M5 4h12l-2 4 2 4H5"></path>' },
  folder: { body: '<path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"></path>' },
  "gauge-chart": { body: '<path d="M4 15a8 8 0 1 1 16 0"></path><path d="M12 15l5-5"></path><path d="M7 19h10"></path>' },
  globe: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18"></path><path d="M12 3a14 14 0 0 0 0 18"></path>' },
  grid: { body: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect>' },
  hash: { body: '<path d="M5 9h14"></path><path d="M4 15h14"></path><path d="M10 3 8 21"></path><path d="M16 3l-2 18"></path>' },
  heart: { body: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>' },
  help: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2"></path><path d="M12 18h.01"></path>' },
  histogram: { body: '<path d="M3 3v18h18"></path><path d="M7 17v-5"></path><path d="M11 17V7"></path><path d="M15 17v-8"></path><path d="M19 17v-3"></path>' },
  home: { body: '<path d="m3 11 9-8 9 8"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-6h6v6"></path>' },
  image: { body: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="8" cy="10" r="2"></circle><path d="m21 15-4-4-5 5-2-2-4 5"></path>' },
  inbox: { body: '<path d="M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z"></path><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>' },
  info: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M12 10v6"></path><path d="M12 7h.01"></path>' },
  key: { body: '<circle cx="7.5" cy="12.5" r="3.5"></circle><path d="M11 12.5h10"></path><path d="M17 12.5v3"></path><path d="M20 12.5v3"></path>' },
  laptop: { body: '<rect x="5" y="4" width="14" height="10" rx="2"></rect><path d="M3 20h18l-2-4H5l-2 4z"></path>' },
  layers: { body: '<path d="m12 2 9 5-9 5-9-5 9-5z"></path><path d="m3 12 9 5 9-5"></path><path d="m3 17 9 5 9-5"></path>' },
  link: { body: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.2-1.2"></path>' },
  "line-chart": { body: '<path d="M3 3v18h18"></path><path d="m7 15 4-4 3 3 5-7"></path>' },
  list: { body: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>' },
  location: { body: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle>' },
  lock: { body: '<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>' },
  mail: { body: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path>' },
  map: { body: '<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path>' },
  maximize: { body: '<path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M21 16v5h-5"></path><path d="M8 21H3v-5"></path>' },
  message: { body: '<path d="M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z"></path>' },
  mic: { body: '<rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v4"></path><path d="M8 22h8"></path>' },
  menu: { body: '<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path>' },
  minus: { body: '<path d="M5 12h14"></path>' },
  moon: { body: '<path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"></path>' },
  "more-horizontal": { body: '<path d="M5 12h.01"></path><path d="M12 12h.01"></path><path d="M19 12h.01"></path>' },
  "more-vertical": { body: '<path d="M12 5h.01"></path><path d="M12 12h.01"></path><path d="M12 19h.01"></path>' },
  offline: { body: '<path d="M2 2 22 22"></path><path d="M8.5 16.5a5 5 0 0 1 7 0"></path><path d="M5 13a10 10 0 0 1 4-2.4"></path><path d="M19 13a10 10 0 0 0-9.5-3"></path>' },
  package: { body: '<path d="m21 8-9-5-9 5 9 5 9-5z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M7.5 5.5 16.5 10.5"></path>' },
  paperclip: { body: '<path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 1 1 5.7 5.7l-8.5 8.5a2 2 0 1 1-2.8-2.8l8-8"></path>' },
  pause: { body: '<path d="M8 5v14"></path><path d="M16 5v14"></path>' },
  phone: { body: '<rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M11 18h2"></path>' },
  "pie-chart": { body: '<path d="M21 12A9 9 0 1 1 12 3v9h9z"></path><path d="M12 3a9 9 0 0 1 9 9h-9V3z"></path>' },
  play: { body: '<path d="m8 5 11 7-11 7V5z"></path>' },
  plus: { body: '<path d="M12 5v14"></path><path d="M5 12h14"></path>' },
  policy: { body: '<path d="M7 3h10l3 4v14H4V3h3z"></path><path d="M8 13h8"></path><path d="M8 17h5"></path><path d="M14 3v5h5"></path>' },
  printer: { body: '<path d="M7 9V3h10v6"></path><path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"></path><path d="M7 14h10v7H7z"></path>' },
  "qr-code": { body: '<rect x="3" y="3" width="6" height="6"></rect><rect x="15" y="3" width="6" height="6"></rect><rect x="3" y="15" width="6" height="6"></rect><path d="M15 15h2v2h-2z"></path><path d="M19 15h2v6h-6v-2"></path><path d="M12 3v3"></path><path d="M12 12h3"></path>' },
  "radar-chart": { body: '<path d="m12 3 8 5v8l-8 5-8-5V8l8-5z"></path><path d="m12 7 4 3v4l-4 3-4-3v-4l4-3z"></path><path d="M12 3v18"></path><path d="M4 8l16 8"></path><path d="M20 8 4 16"></path>' },
  receipt: { body: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"></path><path d="M9 7h6"></path><path d="M9 11h6"></path><path d="M9 15h4"></path>' },
  redo: { body: '<path d="M21 7v6h-6"></path><path d="M21 13a8 8 0 1 0-2.3 5.7"></path>' },
  refresh: { body: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"></path><path d="M3 21v-5h5"></path><path d="M3 12A9 9 0 0 1 18.4 5.6L21 8"></path><path d="M21 3v5h-5"></path>' },
  rocket: { body: '<path d="M4.5 16.5c-1 1-1.5 3-1.5 4.5 1.5 0 3.5-.5 4.5-1.5"></path><path d="M9 15 4 20"></path><path d="M15 9l-6 6"></path><path d="M14 4h6v6c0 5-4 10-11 10H4v-5C4 8 9 4 14 4z"></path>' },
  save: { body: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><path d="M17 21v-8H7v8"></path><path d="M7 3v5h8"></path>' },
  "scatter-chart": { body: '<path d="M3 3v18h18"></path><circle cx="8" cy="15" r="1.5"></circle><circle cx="12" cy="10" r="1.5"></circle><circle cx="17" cy="7" r="1.5"></circle><circle cx="16" cy="16" r="1.5"></circle>' },
  search: { body: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>' },
  send: { body: '<path d="m22 2-7 20-4-9-9-4 20-7z"></path><path d="M22 2 11 13"></path>' },
  server: { body: '<rect x="3" y="4" width="18" height="6" rx="2"></rect><rect x="3" y="14" width="18" height="6" rx="2"></rect><path d="M7 7h.01"></path><path d="M7 17h.01"></path>' },
  settings: { body: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z"></path>' },
  share: { body: '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 10.6 6.8-4.2"></path><path d="m8.6 13.4 6.8 4.2"></path>' },
  shield: { body: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>' },
  sidebar: { body: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M9 4v16"></path>' },
  sliders: { body: '<path d="M4 6h8"></path><path d="M16 6h4"></path><path d="M14 4v4"></path><path d="M4 12h4"></path><path d="M12 12h8"></path><path d="M10 10v4"></path><path d="M4 18h10"></path><path d="M18 18h2"></path><path d="M16 16v4"></path>' },
  spark: { body: '<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"></path><path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17z"></path>' },
  sparkline: { body: '<path d="m3 16 4-4 3 2 4-6 3 4 4-5"></path>' },
  star: { body: '<path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4L12 17l-5.9 3 1.1-6.4L2.5 9 9 8l3-6z"></path>' },
  success: { body: '<circle cx="12" cy="12" r="9"></circle><path d="m8 12 3 3 5-6"></path>' },
  sun: { body: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.9 4.9l1.4 1.4"></path><path d="M17.7 17.7l1.4 1.4"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.9 19.1l1.4-1.4"></path><path d="M17.7 6.3l1.4-1.4"></path>' },
  sync: { body: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"></path><path d="M3 21v-5h5"></path><path d="M3 12A9 9 0 0 1 18.4 5.6L21 8"></path><path d="M21 3v5h-5"></path>' },
  table: { body: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path><path d="M9 4v16"></path><path d="M15 4v16"></path>' },
  tag: { body: '<path d="M20 12 12 20 3 11V3h8l9 9z"></path><path d="M7 7h.01"></path>' },
  target: { body: '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle>' },
  terminal: { body: '<path d="m4 17 6-5-6-5"></path><path d="M12 19h8"></path>' },
  theme: { body: '<path d="M4 21v-7"></path><path d="M4 10V3"></path><path d="M12 21v-9"></path><path d="M12 8V3"></path><path d="M20 21v-5"></path><path d="M20 12V3"></path><path d="M2 14h4"></path><path d="M10 8h4"></path><path d="M18 16h4"></path>' },
  tool: { body: '<path d="M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z"></path>' },
  trash: { body: '<path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 15H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path>' },
  undo: { body: '<path d="M3 7v6h6"></path><path d="M3 13a8 8 0 1 1 2.3 5.7"></path>' },
  unlock: { body: '<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 7.5-2"></path>' },
  upload: { body: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5"></path><path d="M12 3v12"></path>' },
  user: { body: '<path d="M20 21a8 8 0 1 0-16 0"></path><circle cx="12" cy="7" r="4"></circle>' },
  users: { body: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
  video: { body: '<rect x="3" y="6" width="14" height="12" rx="2"></rect><path d="m17 10 4-3v10l-4-3"></path>' },
  wallet: { body: '<path d="M4 7h14a3 3 0 0 1 3 3v8H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12"></path><path d="M16 13h5"></path><path d="M17 13h.01"></path>' },
  warning: { body: '<path d="m12 3 10 18H2L12 3z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>' },
  wifi: { body: '<path d="M5 13a10 10 0 0 1 14 0"></path><path d="M8.5 16.5a5 5 0 0 1 7 0"></path><path d="M12 20h.01"></path>' },
  workflow: { body: '<rect x="3" y="4" width="6" height="6" rx="2"></rect><rect x="15" y="14" width="6" height="6" rx="2"></rect><path d="M9 7h3a3 3 0 0 1 3 3v4"></path><path d="M12 17H9a3 3 0 0 1-3-3v-4"></path>' },
  "x-circle": { body: '<circle cx="12" cy="12" r="9"></circle><path d="M15 9 9 15"></path><path d="m9 9 6 6"></path>' },
  "zoom-in": { body: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path><path d="M11 8v6"></path><path d="M8 11h6"></path>' },
  "zoom-out": { body: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path><path d="M8 11h6"></path>' }
};

// src/render.ts
var customIcons = {};
function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function iconBody(definition) {
  return Array.isArray(definition.body) ? definition.body.join("") : definition.body;
}
function definitionFor(name) {
  return customIcons[name] ?? icons[name];
}
function normalizeSize(size) {
  if (size === void 0) return void 0;
  return typeof size === "number" ? `${size}px` : size;
}
function hasIcon(name) {
  return Boolean(definitionFor(name));
}
function registerIcon(name, body, viewBox = "0 0 24 24") {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Invalid icon name: ${name}`);
  customIcons[name] = { body, viewBox };
}
function icon(name, options = {}) {
  const definition = definitionFor(name);
  if (!definition) return "";
  const className = ["uif-icon", options.className].filter(Boolean).join(" ");
  const size = normalizeSize(options.size);
  const hidden = options.title ? false : options.hidden !== false;
  const attrs = [
    `class="${escapeAttribute(className)}"`,
    `viewBox="${escapeAttribute(definition.viewBox ?? "0 0 24 24")}"`,
    size ? `width="${escapeAttribute(size)}"` : "",
    size ? `height="${escapeAttribute(size)}"` : "",
    options.title ? 'role="img"' : "",
    hidden ? 'aria-hidden="true"' : "",
    'fill="none"',
    'xmlns="http://www.w3.org/2000/svg"'
  ].filter(Boolean);
  const title = options.title ? `<title>${escapeAttribute(options.title)}</title>` : "";
  return `<svg ${attrs.join(" ")}>${title}${iconBody(definition)}</svg>`;
}
function iconElement(name, options = {}) {
  const markup = icon(name, options);
  if (!markup) throw new Error(`Unknown icon: ${name}`);
  const template = document.createElement("template");
  template.innerHTML = markup;
  return template.content.firstElementChild;
}

// src/mount.ts
function parseSize(value) {
  if (!value) return void 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) && value.trim() !== "" ? numeric : value;
}
function isIconHost(root, selector) {
  return "matches" in root && typeof root.matches === "function" && root.matches(selector);
}
function mountIcons(root = document, options = {}) {
  const selector = options.selector ?? "[data-uif-icon]";
  const targets = [
    ...isIconHost(root, selector) ? [root] : [],
    ...root.querySelectorAll(selector)
  ];
  targets.forEach((target) => {
    if (target.dataset.uifIconMounted === "true") return;
    const name = target.dataset.uifIcon;
    if (!name) return;
    const iconOptions = {
      className: target.dataset.uifIconClass,
      hidden: target.dataset.uifIconHidden === "false" ? false : void 0,
      size: parseSize(target.dataset.uifIconSize ?? null),
      title: target.dataset.uifIconTitle
    };
    try {
      const svg = iconElement(name, iconOptions);
      target.replaceChildren(svg);
      target.dataset.uifIconMounted = "true";
    } catch {
      target.dataset.uifIconMissing = name;
    }
  });
}
export {
  hasIcon,
  icon,
  iconElement,
  icons,
  mountIcons,
  registerIcon
};
