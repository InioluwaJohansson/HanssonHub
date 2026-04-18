import { Device, Room, Section, Scene, LogEntry, Contact, ContactCategory, UserProfile, User } from './types';

export const SECTIONS: Section[] = [
  { id: 'indoor', name: 'Indoor' },
  { id: 'outdoor', name: 'Outdoor' },
  { id: 'security', name: 'Security' },
];

export const ROOMS: Room[] = [
  { id: 'living-room', name: 'Living Room', section: 'indoor', icon: 'Sofa' },
  { id: 'kitchen', name: 'Kitchen', section: 'indoor', icon: 'Utensils' },
  { id: 'bedroom', name: 'Bedroom', section: 'indoor', icon: 'Bed' },
  { id: 'bathroom', name: 'Bathroom', section: 'indoor', icon: 'Bath' },
  { id: 'garage', name: 'Garage', section: 'outdoor', icon: 'Car' },
  { id: 'backyard', name: 'Backyard', section: 'outdoor', icon: 'Trees' },
  { id: 'front-door', name: 'Front Door', section: 'security', icon: 'Shield' },
];

export const INITIAL_DEVICES: Device[] = [
  { id: '1', name: 'Main Light', type: 'light', status: 'on', value: 80, room: 'living-room', section: 'indoor' },
  { id: '2', name: 'Ambient Light', type: 'light', status: 'off', value: 0, room: 'living-room', section: 'indoor' },
  { id: '3', name: 'Smart TV', type: 'appliance', status: 'off', room: 'living-room', section: 'indoor', powerUsage: 0 },
  
  { id: '5', name: 'Ceiling Light', type: 'light', status: 'on', value: 100, room: 'kitchen', section: 'indoor' },
  { id: '6', name: 'Refrigerator', type: 'appliance', status: 'on', room: 'kitchen', section: 'indoor', powerUsage: 150 },
  { id: '7', name: 'Coffee Maker', type: 'appliance', status: 'off', room: 'kitchen', section: 'indoor', powerUsage: 0 },
  
  { id: '8', name: 'Bedside Lamp', type: 'light', status: 'off', value: 0, room: 'bedroom', section: 'indoor' },
  { id: '9', name: 'Main Light', type: 'light', status: 'off', value: 0, room: 'bedroom', section: 'indoor' },
  { id: 'w1', name: 'Bedroom Window', type: 'window', status: 'closed', room: 'bedroom', section: 'indoor' },
  { id: 'd1', name: 'Bedroom Door', type: 'door', status: 'unlocked', room: 'bedroom', section: 'indoor', doorType: 'interior' },
  { id: 'a1', name: 'Air Conditioner', type: 'appliance', status: 'off', room: 'bedroom', section: 'indoor', powerUsage: 0 },
  { id: 'c1', name: 'Bedroom Camera', type: 'camera', status: 'active', room: 'bedroom', section: 'security' },
  
  { id: '10', name: 'Garage Door', type: 'door', status: 'locked', room: 'garage', section: 'outdoor', doorType: 'exterior' },
  { id: '11', name: 'Garage Light', type: 'light', status: 'off', value: 0, room: 'garage', section: 'outdoor' },
  
  { id: '12', name: 'Sprinklers', type: 'appliance', status: 'inactive', room: 'backyard', section: 'outdoor', powerUsage: 0 },
  { id: '13', name: 'Pool Light', type: 'light', status: 'off', value: 0, room: 'backyard', section: 'outdoor' },
  
  { id: '14', name: 'Front Door Camera', type: 'camera', status: 'active', room: 'front-door', section: 'security' },
  { id: 'c-gate', name: 'Gate Camera', type: 'camera', status: 'active', section: 'security' },
  { id: 'c-porch', name: 'Porch Camera', type: 'camera', status: 'active', section: 'security' },
  { id: '15', name: 'Smart Lock', type: 'door', status: 'locked', room: 'front-door', section: 'security', doorType: 'exterior' },
  { id: '16', name: 'Porch Light', type: 'light', status: 'on', value: 50, room: 'front-door', section: 'security' },
  { id: 'w2', name: 'Front Window', type: 'window', status: 'locked', room: 'front-door', section: 'security' },
];

export const INITIAL_SCENES: Scene[] = [
  {
    id: 'movie-night',
    name: 'Movie Night',
    icon: 'Film',
    actions: [
      { deviceId: '1', status: 'on', value: 10 },
      { deviceId: '2', status: 'on', value: 5 },
      { deviceId: '3', status: 'on' },
      { deviceId: '15', status: 'locked' },
    ]
  },
  {
    id: 'good-morning',
    name: 'Good Morning',
    icon: 'Sun',
    actions: [
      { deviceId: '1', status: 'on', value: 80 },
      { deviceId: '5', status: 'on', value: 100 },
      { deviceId: '7', status: 'on' },
      { deviceId: '15', status: 'unlocked' },
    ]
  },
  {
    id: 'away',
    name: 'Away',
    icon: 'Home',
    actions: [
      { deviceId: '1', status: 'off' },
      { deviceId: '2', status: 'off' },
      { deviceId: '5', status: 'off' },
      { deviceId: '8', status: 'off' },
      { deviceId: '9', status: 'off' },
      { deviceId: '15', status: 'locked' },
      { deviceId: '10', status: 'locked' },
    ]
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Turned on Main Light in Living Room', userName: 'Inioluwa', userAvatar: 'https://picsum.photos/seed/user1/100/100' },
  { id: '2', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'Unlocked Front Door', userName: 'Inioluwa', userAvatar: 'https://picsum.photos/seed/user1/100/100' },
  { id: '3', timestamp: new Date(Date.now() - 10800000).toISOString(), action: 'Activated Movie Night Scene', userName: 'Inioluwa', userAvatar: 'https://picsum.photos/seed/user1/100/100' },
];

export const CONTACT_CATEGORIES: ContactCategory[] = [
  { id: 'family', name: 'Family', description: 'Immediate and extended family members', icon: 'UserCircle' },
  { id: 'friends', name: 'Friends', description: 'Close friends and colleagues', icon: 'Users' },
  { id: 'emergency', name: 'Emergency', description: 'Critical security and health contacts', icon: 'ShieldAlert' },
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    category: 'friends',
    emails: [{ label: 'Personal', email: 'john@example.com' }],
    phones: [{ label: 'Mobile', phone: '+1234567890' }],
    addresses: [{ label: 'Home', address: '123 Smart St, Tech City' }],
  },
];

export const INITIAL_USER: UserProfile = {
  name: 'Inioluwa Makinde',
  email: 'inioluwa.makinde10@gmail.com',
  avatar: 'https://picsum.photos/seed/ini/200/200',
  phone: '+234 800 000 0000',
  address: 'Lagos, Nigeria',
  cameraAccess: ['14', 'c-gate'],
};

export const INITIAL_USERS: User[] = [
  { id: '1', name: 'Inioluwa Makinde', email: 'inioluwa.makinde10@gmail.com', role: 'admin', avatar: 'https://picsum.photos/seed/ini/100/100', lastActive: new Date().toISOString() },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user', avatar: 'https://picsum.photos/seed/jane/100/100', lastActive: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', name: 'Bob Smith', email: 'bob@example.com', role: 'guest', avatar: 'https://picsum.photos/seed/bob/100/100', lastActive: new Date(Date.now() - 3600000).toISOString() },
];

export const GENERAL_CAMERAS = [
  { id: '14', name: 'Front Door Camera' },
  { id: 'c-gate', name: 'Gate Camera' },
  { id: 'c-porch', name: 'Porch Camera' },
  { id: 'c-backyard', name: 'Backyard Camera' },
];
