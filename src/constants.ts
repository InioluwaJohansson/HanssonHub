import { Device, Room, Section, Scene } from './types';

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
  { id: '3', name: 'Smart TV', type: 'appliance', status: 'off', room: 'living-room', section: 'indoor' },
  
  { id: '5', name: 'Ceiling Light', type: 'light', status: 'on', value: 100, room: 'kitchen', section: 'indoor' },
  { id: '6', name: 'Refrigerator', type: 'appliance', status: 'on', room: 'kitchen', section: 'indoor' },
  { id: '7', name: 'Coffee Maker', type: 'appliance', status: 'off', room: 'kitchen', section: 'indoor' },
  
  { id: '8', name: 'Bedside Lamp', type: 'light', status: 'off', value: 0, room: 'bedroom', section: 'indoor' },
  { id: '9', name: 'Main Light', type: 'light', status: 'off', value: 0, room: 'bedroom', section: 'indoor' },
  
  { id: '10', name: 'Garage Door', type: 'door', status: 'locked', room: 'garage', section: 'outdoor' },
  { id: '11', name: 'Garage Light', type: 'light', status: 'off', value: 0, room: 'garage', section: 'outdoor' },
  
  { id: '12', name: 'Sprinklers', type: 'appliance', status: 'inactive', room: 'backyard', section: 'outdoor' },
  { id: '13', name: 'Pool Light', type: 'light', status: 'off', value: 0, room: 'backyard', section: 'outdoor' },
  
  { id: '14', name: 'Front Door Camera', type: 'camera', status: 'active', room: 'front-door', section: 'security' },
  { id: '15', name: 'Smart Lock', type: 'door', status: 'locked', room: 'front-door', section: 'security' },
  { id: '16', name: 'Porch Light', type: 'light', status: 'on', value: 50, room: 'front-door', section: 'security' },
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
