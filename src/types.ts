export type DeviceType = 'light' | 'door' | 'appliance' | 'camera' | 'speaker';

export type DoorStatus = 'locked' | 'unlocked' | 'open' | 'open-locked';
export type LightStatus = 'on' | 'off';
export type CameraStatus = 'active' | 'inactive';
export type ApplianceStatus = 'on' | 'off' | 'active' | 'inactive';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: string; // Using string to accommodate various statuses
  value?: number; // For dimmers, volume, etc.
  room?: string; // Optional if attached directly to a section
  section: string;
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
}
