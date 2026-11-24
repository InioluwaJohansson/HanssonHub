import { Device, Room, Section } from '../../types';

export type FloorLevel = 'underground' | 'ground' | 'top';

export type MaterialType = 'plaster' | 'brick' | 'concrete' | 'wood' | 'metal' | 'glass';

export type RoofStyle = 'flat' | 'gable' | 'hip' | 'shed' | 'modern';

export type FacilityKind =
  | 'door'
  | 'window'
  | 'camera'
  | 'power_outlet'
  | 'light'
  | 'external_sensor';

export type MountSurface = 'wall' | 'ceiling' | 'perimeter' | 'roof' | 'floor';

export type UtilityKind =
  | 'generator'
  | 'solar_panel'
  | 'water_tank'
  | 'water_pump'
  | 'water_meter'
  | 'gas_cylinder'
  | 'air_conditioner'
  | 'heater';

export type UtilityTargetScope = 'property' | 'section' | 'room' | 'scaffold';

export interface RoofConfig {
  style: RoofStyle;
  color: string;
  material: MaterialType;
  height: number;
  overhang: number;
  hasGlassOpening: boolean;
  glassOpeningWidthRatio: number; // 0.2 - 0.75
  glassOpeningDepthRatio: number; // 0.2 - 0.75
}

export interface Slab3D {
  id: string;
  buildingId: string;
  floor: FloorLevel;
  name: string;
  x: number; // local to building center or top-left? All building children use coords relative to building center!
  z: number;
  width: number;
  depth: number;
  isHalfLength?: boolean;
  attachedStaircaseId?: string | null;
}

export interface Opening3D {
  id: string;
  buildingId: string;
  floor: FloorLevel;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  hasGlassRailing: boolean;
  railingMaterial: MaterialType;
  attachedStaircaseId?: string | null;
}

export interface Staircase3D {
  id: string;
  buildingId: string;
  fromFloor: FloorLevel;
  toFloor: FloorLevel;
  bidirectional: boolean;
  targetType: 'opening' | 'slab';
  targetId: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  rotation: number; // radians
  stepMaterial: MaterialType;
  railingMaterial: MaterialType;
  hasGuards: boolean;
}

export interface CylinderSupport3D {
  id: string;
  buildingId?: string | null; // null if placed in compound outside buildings
  floor: FloorLevel;
  name: string;
  x: number;
  z: number;
  radius: number;
  height: number;
  material: MaterialType;
  color: string;
}

export interface Room3D {
  id: string;
  buildingId: string;
  floor: FloorLevel;
  sectionId: string;
  linkedRoomId?: string;
  name: string;
  x: number; // relative to building center
  z: number;
  width: number;
  depth: number;
  wallColor: string;
  floorColor: string;
  wallMaterial: MaterialType;
  doorMaterial: MaterialType;
  railingMaterial: MaterialType;
}

export interface Section3D {
  id: string;
  buildingId?: string | null; // null = outdoor compound section (e.g. Pool Patio)
  floor: FloorLevel;
  linkedSectionId?: string;
  name: string;
  x: number; // relative to building center if buildingId set, else property center
  z: number;
  width: number;
  depth: number;
  color: string;
  isVeranda?: boolean;
  hasRailing?: boolean;
  railingMaterial: MaterialType;
}

export interface Building3D {
  id: string;
  name: string;
  x: number; // relative to property center
  z: number;
  width: number;
  depth: number;
  floors: FloorLevel[]; // subset or all 3: ['underground', 'ground', 'top']
  floorHeight: number;
  wallColor: string;
  wallMaterial: MaterialType;
  doorMaterial: MaterialType;
  railingMaterial: MaterialType;
  hasVeranda: boolean;
  verandaDepth: number;
  roof: RoofConfig;
}

export interface GrassPatch3D {
  id: string;
  name: string;
  x: number; // relative to property center
  z: number;
  width: number;
  depth: number;
}

export interface Pool3D {
  id: string;
  sectionId: string; // tied to a Section
  name: string;
  x: number; // relative to property center
  z: number;
  width: number;
  depth: number;
  waterDepth: number;
}

export interface Scaffold3D {
  id: string;
  name: string;
  x: number; // relative to property center
  z: number;
  width: number;
  depth: number;
  height: number;
  material: MaterialType;
}

export interface PlacedFacility3D {
  id: string;
  kind: FacilityKind;
  name: string;
  linkedDeviceId?: string; // ties to real app smart-home device
  buildingId?: string | null;
  floor: FloorLevel;
  sectionId?: string | null;
  roomId?: string | null;
  mountSurface: MountSurface; // wall | ceiling | perimeter | roof | floor
  x: number; // property-world coordinates for clean global placement
  z: number;
  wallSide?: 'north' | 'south' | 'east' | 'west';
  elevation?: number; // vertical offset on floor/wall
  rotation: number;
  isOn?: boolean;
  isOpen?: boolean;
  material?: MaterialType;
  color?: string;
}

export interface PlacedUtility3D {
  id: string;
  kind: UtilityKind;
  name: string;
  linkedUtilityId?: string; // ties to real app smart-home utility
  targetScope: UtilityTargetScope; // 'property' | 'section' | 'room' | 'scaffold'
  targetId?: string | null; // sectionId, roomId, or scaffoldId
  buildingId?: string | null;
  floor: FloorLevel;
  x: number; // property-world coordinates
  z: number;
  rotation: number;
  isActive?: boolean;
}

export interface Property3DModel {
  id: string;
  name: string;
  hasProperty: boolean;
  width: number; // compound width in meters
  depth: number; // compound depth in meters
  perimeterHeight: number;
  perimeterColor: string;
  perimeterMaterial: MaterialType;
  buildings: Building3D[];
  sections: Section3D[];
  rooms: Room3D[];
  slabs: Slab3D[];
  openings: Opening3D[];
  staircases: Staircase3D[];
  supports: CylinderSupport3D[];
  grassPatches: GrassPatch3D[];
  pools: Pool3D[];
  scaffolds: Scaffold3D[];
  facilities: PlacedFacility3D[];
  utilities: PlacedUtility3D[];
}

export type SelectedItemRef =
  | { type: 'property' }
  | { type: 'building'; id: string }
  | { type: 'section'; id: string }
  | { type: 'room'; id: string }
  | { type: 'slab'; id: string }
  | { type: 'opening'; id: string }
  | { type: 'staircase'; id: string }
  | { type: 'support'; id: string }
  | { type: 'grass'; id: string }
  | { type: 'pool'; id: string }
  | { type: 'scaffold'; id: string }
  | { type: 'facility'; id: string }
  | { type: 'utility'; id: string }
  | null;

export type PaletteDragCategory =
  | 'property'
  | 'building'
  | 'section'
  | 'room'
  | 'slab'
  | 'opening'
  | 'staircase'
  | 'support'
  | 'grass'
  | 'pool'
  | 'scaffold'
  | 'facility'
  | 'utility';

export interface PaletteDragPayload {
  category: PaletteDragCategory;
  facilityKind?: FacilityKind;
  utilityKind?: UtilityKind;
  linkedDeviceId?: string;
  linkedUtilityId?: string;
  label?: string;
  mountHint?: MountSurface;
}

export const FLOOR_LABELS: Record<FloorLevel, string> = {
  underground: 'Underground Floor',
  ground: 'Ground Floor',
  top: 'Top Floor',
};

export const FLOOR_HEIGHT_DEFAULT = 3.2;

export const WALL_COLOR_SWATCHES = [
  '#f4f1ea', // Warm Alabaster
  '#e5dccb', // Limestone Sand
  '#cbd5e1', // Architectural Slate
  '#d97757', // Terracotta Clay
  '#64748b', // Charcoal Blue
  '#475569', // Graphite
  '#ecfdf5', // Sage Mint
  '#fef3c7', // Buttercream
];

export const MATERIAL_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'plaster', label: 'Plaster / Stucco' },
  { value: 'brick', label: 'Masonry Brick' },
  { value: 'concrete', label: 'Architectural Concrete' },
  { value: 'wood', label: 'Timber / Wood' },
  { value: 'metal', label: 'Brushed Steel / Metal' },
  { value: 'glass', label: 'Tempered Glass' },
];

export const ROOF_STYLE_OPTIONS: { value: RoofStyle; label: string }[] = [
  { value: 'gable', label: 'Gable Pitched' },
  { value: 'hip', label: 'Hip 4-Slope' },
  { value: 'flat', label: 'Flat Parapet' },
  { value: 'shed', label: 'Mono-Pitch Shed' },
  { value: 'modern', label: 'Modern Cantilever' },
];

export function createEmptyHouseModel(): Property3DModel {
  return {
    id: 'prop-empty',
    name: 'New Smart Property',
    hasProperty: false,
    width: 34,
    depth: 26,
    perimeterHeight: 2.1,
    perimeterColor: '#d6d3cd',
    perimeterMaterial: 'concrete',
    buildings: [],
    sections: [],
    rooms: [],
    slabs: [],
    openings: [],
    staircases: [],
    supports: [],
    grassPatches: [],
    pools: [],
    scaffolds: [],
    facilities: [],
    utilities: [],
  };
}

export function createSampleHouseModel(
  appRooms: Room[] = [],
  appSections: Section[] = [],
  appDevices: Device[] = []
): Property3DModel {
  const firstMainSec = appSections[0]?.id?.toString();
  const secondSec = appSections[1]?.id?.toString() || firstMainSec;
  const rLiving = appRooms[0]?.id?.toString();
  const rKitchen = appRooms[1]?.id?.toString();
  const rBed = appRooms[2]?.id?.toString();

  const findDev = (t: string, idx = 0) =>
    appDevices.filter((d) => d.type === t)[idx];

  const light0 = findDev('light', 0);
  const light1 = findDev('light', 1) || light0;
  const door0 = findDev('door', 0);
  const door1 = findDev('door', 1);
  const cam0 = findDev('camera', 0);
  const cam1 = findDev('camera', 1);
  const win0 = findDev('window', 0);
  const utilGen = appDevices.find(
    (d) => d.type === 'utility' && Number(d.utilityComponent) === 1
  ) || findDev('utility', 0);
  const utilTank = appDevices.find(
    (d) => d.type === 'utility' && Number(d.utilityComponent) === 3
  );
  const utilSolar = appDevices.find(
    (d) => d.type === 'utility' && Number(d.utilityComponent) === 2
  );
  const utilPump = appDevices.find(
    (d) => d.type === 'utility' && Number(d.utilityComponent) === 4
  );

  return {
    id: 'prop-main',
    name: 'Hansson Smart Estate',
    hasProperty: true,
    width: 38,
    depth: 28,
    perimeterHeight: 2.1,
    perimeterColor: '#dfd9ce',
    perimeterMaterial: 'concrete',
    buildings: [
      {
        id: 'bld-main',
        name: 'Main Residence',
        x: -3.5,
        z: -1.5,
        width: 16,
        depth: 12,
        floors: ['underground', 'ground', 'top'],
        floorHeight: 3.2,
        wallColor: '#f4f1ea',
        wallMaterial: 'plaster',
        doorMaterial: 'wood',
        railingMaterial: 'glass',
        hasVeranda: true,
        verandaDepth: 2.8,
        roof: {
          style: 'gable',
          color: '#334155',
          material: 'metal',
          height: 2.7,
          overhang: 0.65,
          hasGlassOpening: true,
          glassOpeningWidthRatio: 0.42,
          glassOpeningDepthRatio: 0.48,
        },
      },
      {
        id: 'bld-guest',
        name: 'Guest Studio & Garage',
        x: 10.5,
        z: -5.5,
        width: 8.5,
        depth: 7.5,
        floors: ['ground', 'top'],
        floorHeight: 3.0,
        wallColor: '#e5dccb',
        wallMaterial: 'brick',
        doorMaterial: 'metal',
        railingMaterial: 'glass',
        hasVeranda: false,
        verandaDepth: 0,
        roof: {
          style: 'flat',
          color: '#475569',
          material: 'concrete',
          height: 0.4,
          overhang: 0.35,
          hasGlassOpening: true,
          glassOpeningWidthRatio: 0.5,
          glassOpeningDepthRatio: 0.5,
        },
      },
    ],
    sections: [
      {
        id: 'sec-living',
        buildingId: 'bld-main',
        floor: 'ground',
        linkedSectionId: firstMainSec,
        name: 'Living Wing',
        x: 0,
        z: 0,
        width: 15.2,
        depth: 11.2,
        color: '#e8e2d5',
        isVeranda: false,
        hasRailing: false,
        railingMaterial: 'glass',
      },
      {
        id: 'sec-veranda',
        buildingId: 'bld-main',
        floor: 'top',
        linkedSectionId: secondSec,
        name: 'Upper Veranda & Lounge',
        x: 0,
        z: 6.9,
        width: 15.6,
        depth: 2.8,
        color: '#d9cbb8',
        isVeranda: true,
        hasRailing: true,
        railingMaterial: 'glass',
      },
      {
        id: 'sec-pool-deck',
        buildingId: null,
        floor: 'ground',
        linkedSectionId: secondSec,
        name: 'Pool & Recreation Courtyard',
        x: 9.8,
        z: 6.2,
        width: 11.5,
        depth: 8.8,
        color: '#d8d2c5',
        isVeranda: false,
        hasRailing: true,
        railingMaterial: 'glass',
      },
    ],
    rooms: [
      {
        id: 'rm-lounge',
        buildingId: 'bld-main',
        floor: 'ground',
        sectionId: 'sec-living',
        linkedRoomId: rLiving,
        name: 'Grand Living Room',
        x: -3.6,
        z: 0.4,
        width: 7.4,
        depth: 9.6,
        wallColor: '#f7f4ed',
        floorColor: '#c9a97c',
        wallMaterial: 'plaster',
        doorMaterial: 'wood',
        railingMaterial: 'glass',
      },
      {
        id: 'rm-kitchen',
        buildingId: 'bld-main',
        floor: 'ground',
        sectionId: 'sec-living',
        linkedRoomId: rKitchen,
        name: 'Chef Kitchen & Dining',
        x: 4.1,
        z: -2.2,
        width: 6.6,
        depth: 5.4,
        wallColor: '#eef2f6',
        floorColor: '#cbd5e1',
        wallMaterial: 'plaster',
        doorMaterial: 'wood',
        railingMaterial: 'glass',
      },
      {
        id: 'rm-master',
        buildingId: 'bld-main',
        floor: 'top',
        sectionId: 'sec-veranda',
        linkedRoomId: rBed,
        name: 'Master Suite',
        x: -3.5,
        z: -0.4,
        width: 7.5,
        depth: 9.6,
        wallColor: '#f5efe6',
        floorColor: '#b89468',
        wallMaterial: 'plaster',
        doorMaterial: 'wood',
        railingMaterial: 'glass',
      },
      {
        id: 'rm-bunker',
        buildingId: 'bld-main',
        floor: 'underground',
        sectionId: 'sec-living',
        name: 'Underground Vault & Media',
        x: -2.5,
        z: 0,
        width: 9.2,
        depth: 8.8,
        wallColor: '#cbd5e1',
        floorColor: '#64748b',
        wallMaterial: 'concrete',
        doorMaterial: 'metal',
        railingMaterial: 'metal',
      },
    ],
    slabs: [
      {
        id: 'slab-half-1',
        buildingId: 'bld-main',
        floor: 'ground',
        name: 'Half-Length Atrium Slab',
        x: 4.1,
        z: 3.1,
        width: 6.2,
        depth: 4.2,
        isHalfLength: true,
        attachedStaircaseId: 'stair-ug-ground',
      },
    ],
    openings: [
      {
        id: 'open-top-stair',
        buildingId: 'bld-main',
        floor: 'top',
        name: 'Upper Stairwell Opening',
        x: 4.1,
        z: 3.1,
        width: 3.4,
        depth: 4.2,
        hasGlassRailing: true,
        railingMaterial: 'glass',
        attachedStaircaseId: 'stair-ground-top',
      },
    ],
    staircases: [
      {
        id: 'stair-ug-ground',
        buildingId: 'bld-main',
        fromFloor: 'underground',
        toFloor: 'ground',
        bidirectional: true,
        targetType: 'slab',
        targetId: 'slab-half-1',
        x: 4.1,
        z: 3.1,
        width: 2.2,
        depth: 4.0,
        rotation: 0,
        stepMaterial: 'wood',
        railingMaterial: 'glass',
        hasGuards: true,
      },
      {
        id: 'stair-ground-top',
        buildingId: 'bld-main',
        fromFloor: 'ground',
        toFloor: 'top',
        bidirectional: true,
        targetType: 'opening',
        targetId: 'open-top-stair',
        x: 4.1,
        z: 3.1,
        width: 2.2,
        depth: 4.0,
        rotation: Math.PI,
        stepMaterial: 'wood',
        railingMaterial: 'glass',
        hasGuards: true,
      },
    ],
    supports: [
      {
        id: 'col-1',
        buildingId: 'bld-main',
        floor: 'ground',
        name: 'Front Portico Pillar W',
        x: -6.8,
        z: 7.7,
        radius: 0.28,
        height: 3.2,
        material: 'concrete',
        color: '#f1ede4',
      },
      {
        id: 'col-2',
        buildingId: 'bld-main',
        floor: 'ground',
        name: 'Front Portico Pillar E',
        x: 6.8,
        z: 7.7,
        radius: 0.28,
        height: 3.2,
        material: 'concrete',
        color: '#f1ede4',
      },
      {
        id: 'col-3',
        buildingId: 'bld-main',
        floor: 'ground',
        name: 'Center Veranda Column',
        x: 0,
        z: 7.7,
        radius: 0.28,
        height: 3.2,
        material: 'concrete',
        color: '#f1ede4',
      },
    ],
    grassPatches: [
      {
        id: 'grass-west',
        name: 'Front West Lawn',
        x: -11.5,
        z: 8.6,
        width: 11,
        depth: 8.5,
      },
      {
        id: 'grass-north',
        name: 'North Garden Strip',
        x: -5.5,
        z: -10.5,
        width: 18,
        depth: 4.8,
      },
    ],
    pools: [
      {
        id: 'pool-main',
        sectionId: 'sec-pool-deck',
        name: 'Courtyard Infinity Pool',
        x: 9.8,
        z: 6.4,
        width: 8.2,
        depth: 4.8,
        waterDepth: 1.4,
      },
    ],
    scaffolds: [
      {
        id: 'scaf-tank-tower',
        name: 'Compound Water Tower Scaffold',
        x: -15.2,
        z: -10.2,
        width: 3.2,
        depth: 3.2,
        height: 4.6,
        material: 'metal',
      },
    ],
    facilities: [
      {
        id: 'fac-gate-1',
        kind: 'door',
        name: door0?.name || 'Main Perimeter Gate',
        linkedDeviceId: door0?.id,
        buildingId: null,
        floor: 'ground',
        mountSurface: 'perimeter',
        x: -3.5,
        z: 14,
        wallSide: 'south',
        rotation: 0,
        isOpen: false,
        material: 'metal',
        color: '#1e293b',
      },
      {
        id: 'fac-door-front',
        kind: 'door',
        name: door1?.name || 'Residence Entry Door',
        linkedDeviceId: door1?.id,
        buildingId: 'bld-main',
        floor: 'ground',
        sectionId: 'sec-living',
        roomId: 'rm-lounge',
        mountSurface: 'wall',
        x: -5.2,
        z: 4.5,
        wallSide: 'south',
        rotation: 0,
        isOpen: false,
        material: 'wood',
      },
      {
        id: 'fac-win-1',
        kind: 'window',
        name: win0?.name || 'Living Bay Window',
        linkedDeviceId: win0?.id,
        buildingId: 'bld-main',
        floor: 'ground',
        sectionId: 'sec-living',
        roomId: 'rm-lounge',
        mountSurface: 'wall',
        x: -11.5,
        z: -1.5,
        wallSide: 'west',
        rotation: Math.PI / 2,
        isOpen: false,
        material: 'glass',
      },
      {
        id: 'fac-cam-ceiling',
        kind: 'camera',
        name: cam0?.name || 'Living Ceiling Dome Cam',
        linkedDeviceId: cam0?.id,
        buildingId: 'bld-main',
        floor: 'ground',
        sectionId: 'sec-living',
        roomId: 'rm-lounge',
        mountSurface: 'ceiling',
        x: -6.8,
        z: -1.2,
        rotation: 0.4,
        isOn: true,
      },
      {
        id: 'fac-cam-fence',
        kind: 'camera',
        name: cam1?.name || 'Perimeter Gate PTZ Camera',
        linkedDeviceId: cam1?.id,
        buildingId: null,
        floor: 'ground',
        mountSurface: 'perimeter',
        x: 2.2,
        z: 14,
        wallSide: 'south',
        rotation: Math.PI,
        isOn: true,
      },
      {
        id: 'fac-cam-roof',
        kind: 'camera',
        name: 'Roof Overlook Camera',
        buildingId: 'bld-main',
        floor: 'top',
        mountSurface: 'roof',
        x: 4.4,
        z: 4.4,
        rotation: -0.6,
        isOn: true,
      },
      {
        id: 'fac-light-1',
        kind: 'light',
        name: light0?.name || 'Lounge Pendant Light',
        linkedDeviceId: light0?.id,
        buildingId: 'bld-main',
        floor: 'ground',
        sectionId: 'sec-living',
        roomId: 'rm-lounge',
        mountSurface: 'ceiling',
        x: -7.1,
        z: -1.1,
        rotation: 0,
        isOn: true,
      },
      {
        id: 'fac-light-2',
        kind: 'light',
        name: light1?.name || 'Perimeter Security Floodlight',
        linkedDeviceId: light1?.id || light0?.id,
        buildingId: null,
        floor: 'ground',
        mountSurface: 'perimeter',
        x: -9.0,
        z: 14,
        wallSide: 'south',
        rotation: 0,
        isOn: true,
      },
      {
        id: 'fac-light-roof',
        kind: 'light',
        name: light0?.name || 'Roof Eave Accent Light',
        linkedDeviceId: light0?.id,
        buildingId: 'bld-main',
        floor: 'top',
        mountSurface: 'roof',
        x: -3.5,
        z: 4.6,
        rotation: 0,
        isOn: true,
      },
      {
        id: 'fac-outlet-1',
        kind: 'power_outlet',
        name: 'Kitchen Island Outlet',
        buildingId: 'bld-main',
        floor: 'ground',
        sectionId: 'sec-living',
        roomId: 'rm-kitchen',
        mountSurface: 'wall',
        x: 0.6,
        z: -7.4,
        wallSide: 'north',
        rotation: 0,
      },
      {
        id: 'fac-sensor-1',
        kind: 'external_sensor',
        name: 'Garden Motion Beam Sensor',
        buildingId: null,
        floor: 'ground',
        sectionId: 'sec-pool-deck',
        mountSurface: 'perimeter',
        x: 18.8,
        z: 5.5,
        wallSide: 'east',
        rotation: -Math.PI / 2,
        isOn: true,
      },
    ],
    utilities: [
      {
        id: 'util-tank-1',
        kind: 'water_tank',
        name: utilTank?.name || 'Main Overhead Water Tank',
        linkedUtilityId: utilTank?.id,
        targetScope: 'scaffold',
        targetId: 'scaf-tank-tower',
        buildingId: null,
        floor: 'ground',
        x: -15.2,
        z: -10.2,
        rotation: 0,
        isActive: true,
      },
      {
        id: 'util-pump-1',
        kind: 'water_pump',
        name: utilPump?.name || 'Booster Water Pump',
        linkedUtilityId: utilPump?.id,
        targetScope: 'property',
        targetId: null,
        buildingId: null,
        floor: 'ground',
        x: -15.2,
        z: -7.2,
        rotation: 0,
        isActive: true,
      },
      {
        id: 'util-gen-1',
        kind: 'generator',
        name: utilGen?.name || 'Standby Backup Generator',
        linkedUtilityId: utilGen?.id,
        targetScope: 'property',
        targetId: null,
        buildingId: null,
        floor: 'ground',
        x: 15.8,
        z: -10.5,
        rotation: Math.PI / 2,
        isActive: false,
      },
      {
        id: 'util-solar-1',
        kind: 'solar_panel',
        name: utilSolar?.name || 'Guest Roof Solar Array',
        linkedUtilityId: utilSolar?.id,
        targetScope: 'section',
        targetId: 'sec-living',
        buildingId: 'bld-guest',
        floor: 'top',
        x: 10.5,
        z: -5.5,
        rotation: 0,
        isActive: true,
      },
    ],
  };
}
