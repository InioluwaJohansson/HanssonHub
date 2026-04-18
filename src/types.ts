export type DeviceType = 'light' | 'door' | 'appliance' | 'camera' | 'speaker' | 'window';

export type DoorStatus = 'locked' | 'unlocked' | 'open' | 'open-locked';
export type LightStatus = 'on' | 'off';
export type CameraStatus = 'active' | 'inactive';
export type ApplianceStatus = 'on' | 'off' | 'active' | 'inactive';
export type WindowStatus = 'open' | 'closed' | 'locked';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: string; // Using string to accommodate various statuses
  value?: number; // For dimmers, volume, etc.
  room?: string; // Optional if attached directly to a section
  section?: string;
  doorType?: 'exterior' | 'interior';
  powerUsage?: number; // in Watts
}

export interface SceneAction {
  deviceId: string;
  status: string;
  value?: number;
}

export interface Scene {
  id: string;
  name: string;
  icon: string;
  actions: SceneAction[];
}

export interface Room {
  id: string;
  name: string;
  section: string;
  icon: string;
}

export interface Section {
  id: string;
  name: string;
  type?: 'general' | 'secretive';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  userName: string;
  userAvatar: string;
}

export interface ContactAddress {
  label: string;
  address: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  avatar?: string;
  emails: { label: string; email: string }[];
  phones: { label: string; phone: string }[];
  addresses: ContactAddress[];
}

export interface ContactCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  phone: string;
  address: string;
  cameraAccess: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  avatar: string;
  lastActive: string;
}
