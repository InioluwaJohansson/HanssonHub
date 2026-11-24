export enum SpatialNodeKind {
  Property = 1,
  Building = 2,
  Floor = 3,
  Section = 4,
  Room = 5,
  ExteriorArea = 6,
  Structure = 7,
}

export enum SpatialGeometryKind {
  RoomOutline = 1,
  Wall = 2,
  WallSegment = 3,
  Slab = 4,
  RoofSurface = 5,
  Boundary = 6,
  Pool = 7,
  GlassPanel = 8,
  StairFlight = 9,
  StairLanding = 10,
  Void = 11,
  Generic = 12,
}

export enum SpatialTargetKind {
  Door = 1,
  Window = 2,
  Light = 3,
  Camera = 4,
  Appliance = 5,
  External = 6,
  Utility = 7,
}

export enum SpatialAttachmentKind {
  Free = 1,
  WallMounted = 2,
  CeilingMounted = 3,
  FloorMounted = 4,
  OpeningMounted = 5,
  StructureMounted = 6,
  Suspended = 7,
}

export enum SpatialOpeningKind {
  Door = 1,
  Window = 2,
  Gate = 3,
  Generic = 4,
}

export enum SpatialVisibilityEffect {
  HideNodeAndDescendants = 1,
  HidePlacement = 2,
  HideOpening = 3,
}

export type SegmentCurveKind = 'line' | 'arc' | 'bezier';

export interface OutlineSegmentMeta {
  index: number;
  curveType: SegmentCurveKind;
  // For 'arc': sagitta height (metres) perpendicular to chord or midpoint bulge
  arcBulge?: number;
  // For 'bezier': [x, y, z] control points in metres
  control1?: [number, number, number];
  control2?: [number, number, number];
}

export interface WallOpeningSpec {
  id: string;
  kind: SpatialOpeningKind;
  label?: string;
  offsetAlongWall: number; // metres from start vertex (or normalized 0..1 when < 0?) -> stored in metres
  sillHeight: number; // metres from floor
  width: number; // metres
  height: number; // metres
  hasFrame?: boolean;
  hasGlass?: boolean;
  deviceId?: number;
  deviceKind?: SpatialTargetKind;
}

export interface RoomOutlineGeometryPayload {
  type: 'polygon';
  points: [number, number, number][]; // X, Y, Z in metres
  segments?: OutlineSegmentMeta[];
  roomId?: number;
  sectionId?: number;
  floorId?: number;
  buildingId?: number;
  sourceOutlineId?: number | string;
}

export interface WallGeometryPayload {
  type: 'wall' | 'wallSegment';
  points: [number, number, number][]; // [start, end]
  curveType?: SegmentCurveKind;
  arcBulge?: number;
  control1?: [number, number, number];
  control2?: [number, number, number];
  style?: 'solid' | 'partial' | 'railing' | 'glassPanel' | 'openBoundary';
  material?: 'concrete' | 'brick' | 'wood' | 'glass' | 'drywall' | 'metal';
  sourceOutlineId?: number | string;
  sourceSegmentIndex?: number;
  sharedWallKey?: string;
  spaceRefs?: { kind: SpatialNodeKind; id: number; name?: string }[];
  floorIds?: number[];
  openings?: WallOpeningSpec[];
  elevationY?: number;
}

export interface SlabGeometryPayload {
  type: 'slab' | 'void';
  points: [number, number, number][];
  elevationY?: number;
  role?: 'floor' | 'ceiling' | 'sharedFloorCeiling' | 'deck' | 'voidCutout';
  servesFloorIds?: number[];
  sourceOutlineId?: number | string;
  roomId?: number;
  floorId?: number;
  voidCutouts?: [number, number, number][][];
}

export interface RoofGeometryPayload {
  type: 'roof';
  points: [number, number, number][];
  buildingId?: number;
  elevationY?: number;
  roofStyle?: 'flat' | 'slantedEdges' | 'pitched';
  slopeDeg?: number;
  overhang?: number;
  parapetHeight?: number;
  parapetThickness?: number;
  sectionLabel?: string;
}

export interface StairGeometryPayload {
  type: 'stairFlight' | 'stairLanding';
  origin: [number, number, number];
  rotationYDeg?: number;
  width: number;
  runLength: number;
  riseHeight: number;
  stepCount?: number;
  flightIndex?: number;
  layout?: 'straight' | 'uturn';
  stairGroupId?: string;
  floorId?: number;
  targetUpperFloorId?: number;
}

export interface PoolGeometryPayload {
  type: 'pool';
  roomId: number;
  floorId?: number;
  origin: [number, number, number]; // center X, floor Y, center Z
  length: number;
  width: number;
  depth: number;
  deckMargin?: number;
  waterLevelOffset?: number;
  indoor: true;
}

export interface ExteriorOrStructurePayload {
  type: 'exteriorBoundary' | 'scaffoldStructure';
  nodeKind: SpatialNodeKind.ExteriorArea | SpatialNodeKind.Structure;
  points?: [number, number, number][];
  origin?: [number, number, number];
  width?: number;
  depth?: number;
  height?: number;
  levels?: number;
  zoneKind?: 'garden' | 'driveway' | 'patio' | 'tankScaffold' | 'utilityFrame';
  propertyId?: number;
  floorId?: number;
}

export type FixtureArrangement =
  | 'individual'
  | 'squareGrid'
  | 'rectangularGrid'
  | 'horizontalStrip'
  | 'verticalStrip';

export type FixtureMountingStyle = 'surface' | 'recessed' | 'pendant' | 'track';

export interface LightFixtureGroupMeta {
  groupId: string;
  groupName: string;
  arrangement: FixtureArrangement;
  mountingStyle: FixtureMountingStyle;
  spacingMeters: number;
  columns?: number;
  rows?: number;
  memberIndex: number;
  memberCount: number;
  memberLightIds: number[];
}

export interface SpatialGeometryPointDto {
  id?: number;
  geometryId?: number;
  sequence: number;
  x: number;
  y: number;
  z: number;
  pointKind?: string;
  controlX?: number | null;
  controlY?: number | null;
  controlZ?: number | null;
}

export interface SpatialGeometrySpaceLinkDto {
  id?: number;
  geometryId?: number;
  spaceKind: SpatialNodeKind;
  spaceId: number;
  relationship?: string;
}

export interface SpatialOpeningDto {
  id: number;
  propertyId?: number;
  hostGeometryId: number;
  kind: SpatialOpeningKind;
  offset: number;
  width: number;
  height: number;
  sillHeight: number;
  frameMaterial?: string | null;
  operation?: string | null;
  panelConfigurationJson?: string | null;
}

export interface SpatialExteriorAreaDto {
  id: number;
  propertyId: number;
  name: string;
  areaKind?: string;
}

export interface SpatialStructureDto {
  id: number;
  propertyId: number;
  name: string;
  structureType?: string;
  geometryJson?: string;
}

export interface SpatialLightFixtureMemberDto {
  id?: number;
  fixtureId?: number;
  lightId: number;
  sequence: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
}

export interface SpatialLightFixtureDto {
  id: number;
  propertyId: number;
  name: string;
  arrangement?: string;
  mountingStyle?: string;
  layoutJson?: string;
  members?: SpatialLightFixtureMemberDto[];
}

export interface SpatialPropertyDto {
  id: number;
  name?: string;
  propertyName?: string;
  coordinateSystem?: string;
  boundaryArea?: number | null;
  version?: number;
  createdOn?: string;
  buildings?: SpatialBuildingDto[];
}

export interface SpatialBuildingDto {
  id: number;
  propertyId: number;
  name: string;
  baseElevation: number;
  version?: number;
  floors?: SpatialFloorDto[];
}

export interface SpatialFloorDto {
  id: number;
  buildingId: number;
  name: string;
  levelIndex: number;
  elevation: number;
  defaultCeilingHeight: number;
  version?: number;
  boundSectionIds?: number[];
  boundRoomIds?: number[];
}

export interface CreateBuildingDto {
  propertyId: number;
  name: string;
  baseElevation: number;
}

export interface CreateFloorDto {
  buildingId: number;
  name: string;
  levelIndex: number;
  elevation: number;
  defaultCeilingHeight: number;
}

export interface CreateGeometryDto {
  kind: SpatialGeometryKind;
  name: string;
  geometryJson: string;
  height: number;
  thickness: number;
  materialCode?: string | null;
  isGenerated?: boolean;
  sourceOutlineGeometryId?: number | null;
  hostGeometryId?: number | null;
  floorId?: number | null;
  buildingId?: number | null;
  roomId?: number | null;
  sectionId?: number | null;
  parentKind?: SpatialNodeKind | null;
  parentId?: number | null;
  sourceGeometryId?: number | null;
  points?: SpatialGeometryPointDto[];
  spaces?: SpatialGeometrySpaceLinkDto[];
  version?: number;
}

export interface SpatialGeometryDto {
  id: number;
  propertyId?: number;
  kind: SpatialGeometryKind;
  name: string;
  geometryJson: string;
  height: number;
  thickness: number;
  materialCode?: string | null;
  isGenerated?: boolean;
  sourceOutlineGeometryId?: number | null;
  hostGeometryId?: number | null;
  floorId?: number | null;
  buildingId?: number | null;
  roomId?: number | null;
  sectionId?: number | null;
  parentKind?: SpatialNodeKind | null;
  parentId?: number | null;
  sourceGeometryId?: number | null;
  points?: SpatialGeometryPointDto[];
  spaces?: SpatialGeometrySpaceLinkDto[];
  version?: number;
  isHidden?: boolean;
}

export interface SpatialPlacementDto {
  id: number;
  createdBy?: number;
  createdOn?: string;
  lastModifiedBy?: number;
  lastModifiedOn?: string;
  deletedOn?: string | null;
  deletedBy?: number;
  isDeleted?: boolean;
  personId?: number;
  version: number;
  propertyId: number;
  targetKind: SpatialTargetKind;
  targetId: number;
  parentKind: SpatialNodeKind;
  parentId: number;
  attachmentKind: SpatialAttachmentKind;
  hostGeometryId?: number | null;
  openingId?: number | null;
  supportingPlacementId?: number | null;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  rotationW: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  width: number;
  height: number;
  depth: number;
  assetCode?: string;
  anchorJson?: string;
}

export interface SpatialSectionBindingDto {
  id?: number;
  floorId: number;
  sectionId: number;
  sectionName?: string;
  isHidden?: boolean;
}

export interface SpatialRoomBindingDto {
  id?: number;
  floorId: number;
  roomId: number;
  sectionId?: number | null;
  roomName?: string;
  isHidden?: boolean;
}

export interface SpatialSceneDto {
  property?: SpatialPropertyDto | null;
  propertyId: number;
  propertyName?: string;
  coordinateSystem?: string;
  version?: number;
  buildings: SpatialBuildingDto[];
  floors: SpatialFloorDto[];
  sectionBindings: SpatialSectionBindingDto[];
  roomBindings: SpatialRoomBindingDto[];
  exteriorAreas?: SpatialExteriorAreaDto[];
  structures?: SpatialStructureDto[];
  openings?: SpatialOpeningDto[];
  lightFixtures?: SpatialLightFixtureDto[];
  geometries: SpatialGeometryDto[];
  placements: SpatialPlacementDto[];
  raw?: unknown;
}

export type ViewportToolMode = 'select' | 'drawWall' | 'drawRoomBox';

export type SpatialDragPayload =
  | {
      dragKind: 'wall';
      label: string;
      style: WallGeometryPayload['style'];
      material: WallGeometryPayload['material'];
      defaultLength: number;
      height: number;
      thickness: number;
    }
  | {
      dragKind: 'roomBox';
      label: string;
      width: number;
      depth: number;
      height: number;
      material: WallGeometryPayload['material'];
    }
  | {
      dragKind: 'opening';
      label: string;
      openingKind: SpatialOpeningKind;
      width: number;
      height: number;
      sillHeight: number;
    }
  | {
      dragKind: 'device';
      label: string;
      targetKind: SpatialTargetKind;
      targetId: number;
      utilityType?: number;
      utilityComponent?: number | null;
      attachmentKind?: SpatialAttachmentKind;
    };

export type SpatialDraftPreview =
  | {
      kind: 'wall';
      x1: number;
      z1: number;
      x2: number;
      z2: number;
      height: number;
      thickness: number;
      elevationY: number;
      style?: WallGeometryPayload['style'];
      openings?: WallOpeningSpec[];
      label?: string;
    }
  | {
      kind: 'spaceBox';
      centerX: number;
      centerZ: number;
      width: number;
      depth: number;
      height: number;
      elevationY: number;
      isVoid?: boolean;
      label?: string;
    }
  | {
      kind: 'outline';
      points: [number, number, number][];
      segments?: OutlineSegmentMeta[];
      wallHeight: number;
      wallThickness: number;
      elevationY: number;
      label?: string;
    }
  | {
      kind: 'placement';
      x: number;
      y: number;
      z: number;
      label?: string;
    };

export type ViewportRenderMode = 'realistic' | 'outline';

export interface SpatialChangeEvent {
  propertyId: number;
  resourceId: number;
  resourceType: string;
  version: number;
  operation: string;
}

export interface SpatialEndpointContractInfo {
  name: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  path: string;
  implementedInBackend: boolean;
  notes: string;
}
