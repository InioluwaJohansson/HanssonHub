import { apiFetch } from '../api/client';
import {
  CreateBuildingDto,
  CreateFloorDto,
  CreateGeometryDto,
  SpatialBuildingDto,
  SpatialEndpointContractInfo,
  SpatialExteriorAreaDto,
  SpatialFloorDto,
  SpatialGeometryDto,
  SpatialGeometryKind,
  SpatialGeometryPointDto,
  SpatialGeometrySpaceLinkDto,
  SpatialLightFixtureDto,
  SpatialNodeKind,
  SpatialOpeningDto,
  SpatialOpeningKind,
  SpatialPlacementDto,
  SpatialPropertyDto,
  SpatialRoomBindingDto,
  SpatialSceneDto,
  SpatialSectionBindingDto,
  SpatialStructureDto,
  SpatialTargetKind,
} from '../types/spatial';

export const SPATIAL_ENDPOINT_CONTRACTS: SpatialEndpointContractInfo[] = [
  {
    name: 'List Properties',
    method: 'GET',
    path: '/Spatial/Properties',
    implementedInBackend: true,
    notes: 'Authenticated JWT fetch of available properties.',
  },
  {
    name: 'Create Property',
    method: 'POST',
    path: '/Spatial/CreateProperty?propertyName=...',
    implementedInBackend: true,
    notes: 'Creates root Property node.',
  },
  {
    name: 'Create Building',
    method: 'POST',
    path: '/Spatial/CreateBuilding',
    implementedInBackend: true,
    notes: 'Creates Building with baseElevation in metres.',
  },
  {
    name: 'Create Floor',
    method: 'POST',
    path: '/Spatial/CreateFloor',
    implementedInBackend: true,
    notes: 'Creates Floor with levelIndex, elevation & defaultCeilingHeight.',
  },
  {
    name: 'Bind Section',
    method: 'POST',
    path: '/Spatial/BindSection?floorId=...&sectionId=...',
    implementedInBackend: true,
    notes: 'Reuses existing Home Security Section; no duplicate section created.',
  },
  {
    name: 'Bind Room',
    method: 'POST',
    path: '/Spatial/BindRoom?floorId=...&roomId=...&sectionId=...',
    implementedInBackend: true,
    notes: 'Direct floor binding allowed only when Room.SectionId is null.',
  },
  {
    name: 'Get Scene',
    method: 'GET',
    path: '/Spatial/GetScene?propertyId=...',
    implementedInBackend: true,
    notes: 'Server-filtered authorized spatial scene graph, geometries & placements.',
  },
  {
    name: 'Create Geometry',
    method: 'POST',
    path: '/Spatial/CreateGeometry?propertyId=...',
    implementedInBackend: true,
    notes: 'Stores outlines, shared walls, slabs, voids, roofs, stairs, pools & scaffolds.',
  },
  {
    name: 'Create / Update Placement',
    method: 'POST',
    path: '/Spatial/Placements',
    implementedInBackend: true,
    notes: 'Incremental quaternion/position/scale placement with Version field.',
  },
  {
    name: 'Delete Placement',
    method: 'DELETE',
    path: '/Spatial/DeletePlacement?id=...',
    implementedInBackend: true,
    notes: 'Removes only spatial placement; preserves underlying smart device.',
  },
  {
    name: 'Dedicated Update/Delete Geometry',
    method: 'PUT',
    path: '/Spatial/UpdateGeometry (not in provided Swagger contract)',
    implementedInBackend: false,
    notes: 'Not present in supplied contract; edits create new geometry or keep local undo until saved via CreateGeometry.',
  },
  {
    name: 'Dedicated Opening / Structure CRUD',
    method: 'POST',
    path: '/Spatial/CreateOpening & /Spatial/CreateStructure (not in provided Swagger contract)',
    implementedInBackend: false,
    notes: 'Represented via CreateGeometry structured geometryJson & SpatialAttachmentKind/SpatialNodeKind on Placements.',
  },
  {
    name: 'Solid Geometry Kernel Validation',
    method: 'POST',
    path: '/Spatial/ValidateGeometry (not in provided Swagger contract)',
    implementedInBackend: false,
    notes: 'No client-side exact CSG collision claims; backend validation remains authoritative.',
  },
];

export class SpatialConflictError extends Error {
  status: number;
  serverVersion?: number;
  constructor(message: string, status = 409, serverVersion?: number) {
    super(message);
    this.name = 'SpatialConflictError';
    this.status = status;
    this.serverVersion = serverVersion;
  }
}

export function extractServerErrorMessage(err: any, fallback = 'Spatial API request failed'): string {
  if (!err) return fallback;

  const responseData = err?.response?.data;
  if (responseData) {
    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }
    const validationErrors = responseData.errors || responseData.Errors;
    if (validationErrors && typeof validationErrors === 'object' && !Array.isArray(validationErrors)) {
      const parts: string[] = [];
      for (const [field, msgs] of Object.entries(validationErrors)) {
        if (Array.isArray(msgs)) {
          parts.push(`${field}: ${msgs.join(', ')}`);
        } else if (typeof msgs === 'string') {
          parts.push(`${field}: ${msgs}`);
        }
      }
      if (parts.length > 0) return parts.join(' | ');
    }
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors.join(' | ');
    }
    const msg =
      responseData.message ||
      responseData.Message ||
      responseData.detail ||
      responseData.title ||
      responseData.error;
    if (typeof msg === 'string' && msg.trim()) {
      return msg;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export function isConflictError(err: any): boolean {
  const status = err?.response?.status;
  const msg = extractServerErrorMessage(err, '').toLowerCase();
  return (
    status === 409 ||
    status === 412 ||
    msg.includes('version') ||
    msg.includes('concurrency') ||
    msg.includes('conflict') ||
    msg.includes('stale')
  );
}

function unwrapPayload<T>(res: any): T {
  if (res && typeof res === 'object') {
    if ('data' in res && res.data !== undefined) return res.data as T;
    if ('Data' in res && res.Data !== undefined) return res.Data as T;
  }
  return res as T;
}

function getNum(obj: any, ...keys: string[]): number | undefined {
  if (!obj) return undefined;
  for (const k of keys) {
    const val = obj[k];
    if (val !== undefined && val !== null && val !== '') {
      const n = Number(val);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function getStr(obj: any, ...keys: string[]): string | undefined {
  if (!obj) return undefined;
  for (const k of keys) {
    const val = obj[k];
    if (typeof val === 'string') return val;
  }
  return undefined;
}

function parseGeometryKind(rawVal: any, parsedJson?: any): SpatialGeometryKind {
  if (typeof rawVal === 'number' && Number.isFinite(rawVal)) {
    return rawVal as SpatialGeometryKind;
  }
  if (typeof rawVal === 'string') {
    const trimmed = rawVal.trim();
    const asNum = Number(trimmed);
    if (trimmed !== '' && Number.isFinite(asNum)) return asNum as SpatialGeometryKind;
    const lower = trimmed.toLowerCase();
    const byName: Record<string, SpatialGeometryKind> = {
      roomoutline: SpatialGeometryKind.RoomOutline,
      outline: SpatialGeometryKind.RoomOutline,
      wall: SpatialGeometryKind.Wall,
      wallsegment: SpatialGeometryKind.WallSegment,
      slab: SpatialGeometryKind.Slab,
      void: SpatialGeometryKind.Void,
      roof: SpatialGeometryKind.RoofSurface,
      roofsurface: SpatialGeometryKind.RoofSurface,
      stair: SpatialGeometryKind.StairFlight,
      stairflight: SpatialGeometryKind.StairFlight,
      stairlanding: SpatialGeometryKind.StairLanding,
      pool: SpatialGeometryKind.Pool,
      generic: SpatialGeometryKind.Generic,
      boundary: SpatialGeometryKind.Boundary,
      glasspanel: SpatialGeometryKind.GlassPanel,
    };
    if (byName[lower] !== undefined) return byName[lower];
  }
  const jType = String(parsedJson?.type ?? parsedJson?.Type ?? '').toLowerCase();
  if (jType === 'polygon' || jType === 'roomoutline') return SpatialGeometryKind.RoomOutline;
  if (jType === 'wall') return SpatialGeometryKind.Wall;
  if (jType === 'wallsegment') return SpatialGeometryKind.WallSegment;
  if (jType === 'slab') return SpatialGeometryKind.Slab;
  if (jType === 'void') return SpatialGeometryKind.Void;
  if (jType === 'roof') return SpatialGeometryKind.RoofSurface;
  if (jType === 'stairflight') return SpatialGeometryKind.StairFlight;
  if (jType === 'stairlanding') return SpatialGeometryKind.StairLanding;
  if (jType === 'pool') return SpatialGeometryKind.Pool;
  if (jType === 'exteriorboundary') return SpatialGeometryKind.Boundary;
  return SpatialGeometryKind.Generic;
}

function parseNodeKind(rawVal: any, fallback = SpatialNodeKind.Room): SpatialNodeKind {
  if (typeof rawVal === 'number' && Number.isFinite(rawVal)) return rawVal as SpatialNodeKind;
  if (typeof rawVal === 'string') {
    const asNum = Number(rawVal);
    if (rawVal.trim() !== '' && Number.isFinite(asNum)) return asNum as SpatialNodeKind;
    const byName: Record<string, SpatialNodeKind> = {
      property: SpatialNodeKind.Property,
      building: SpatialNodeKind.Building,
      floor: SpatialNodeKind.Floor,
      section: SpatialNodeKind.Section,
      room: SpatialNodeKind.Room,
      exteriorarea: SpatialNodeKind.ExteriorArea,
      structure: SpatialNodeKind.Structure,
    };
    const match = byName[rawVal.trim().toLowerCase()];
    if (match !== undefined) return match;
  }
  return fallback;
}

function parseTargetKind(rawVal: any): SpatialTargetKind {
  if (typeof rawVal === 'number' && Number.isFinite(rawVal)) return rawVal as SpatialTargetKind;
  if (typeof rawVal === 'string') {
    const asNum = Number(rawVal);
    if (rawVal.trim() !== '' && Number.isFinite(asNum)) return asNum as SpatialTargetKind;
    const byName: Record<string, SpatialTargetKind> = {
      door: SpatialTargetKind.Door,
      window: SpatialTargetKind.Window,
      light: SpatialTargetKind.Light,
      camera: SpatialTargetKind.Camera,
      appliance: SpatialTargetKind.Appliance,
      external: SpatialTargetKind.External,
      utility: SpatialTargetKind.Utility,
    };
    const match = byName[rawVal.trim().toLowerCase()];
    if (match !== undefined) return match;
  }
  return SpatialTargetKind.Light;
}

function normalizeProperty(raw: any): SpatialPropertyDto {
  return {
    id: getNum(raw, 'id', 'Id', 'propertyId', 'PropertyId') ?? 0,
    name: getStr(raw, 'name', 'Name', 'propertyName', 'PropertyName') ?? 'Property',
    propertyName: getStr(raw, 'propertyName', 'PropertyName', 'name', 'Name'),
    coordinateSystem: getStr(raw, 'coordinateSystem', 'CoordinateSystem'),
    boundaryArea: getNum(raw, 'boundaryArea', 'BoundaryArea') ?? null,
    version: getNum(raw, 'version', 'Version') ?? 1,
    createdOn: getStr(raw, 'createdOn', 'CreatedOn'),
    buildings: Array.isArray(raw?.buildings ?? raw?.Buildings)
      ? (raw.buildings ?? raw.Buildings).map(normalizeBuilding)
      : undefined,
  };
}

function normalizeFloor(raw: any): SpatialFloorDto {
  const sectionsArr = raw?.sections ?? raw?.Sections;
  const directRoomsArr = raw?.directRooms ?? raw?.DirectRooms;
  const rawBoundSectionIds =
    raw?.boundSectionIds ??
    raw?.BoundSectionIds ??
    (Array.isArray(sectionsArr)
      ? sectionsArr.map((s: any) => getNum(s, 'sectionId', 'SectionId') ?? 0).filter((n: number) => n > 0)
      : undefined);
  const rawBoundRoomIds =
    raw?.boundRoomIds ??
    raw?.BoundRoomIds ??
    (Array.isArray(directRoomsArr)
      ? directRoomsArr.map((r: any) => getNum(r, 'roomId', 'RoomId') ?? 0).filter((n: number) => n > 0)
      : undefined);

  return {
    id: getNum(raw, 'id', 'Id', 'floorId', 'FloorId') ?? 0,
    buildingId: getNum(raw, 'buildingId', 'BuildingId') ?? 0,
    name: getStr(raw, 'name', 'Name', 'floorName', 'FloorName') ?? 'Floor',
    levelIndex: getNum(raw, 'levelIndex', 'LevelIndex') ?? 0,
    elevation: getNum(raw, 'elevation', 'Elevation') ?? 0,
    defaultCeilingHeight: getNum(raw, 'defaultCeilingHeight', 'DefaultCeilingHeight') ?? 2.7,
    version: getNum(raw, 'version', 'Version') ?? 1,
    boundSectionIds: rawBoundSectionIds,
    boundRoomIds: rawBoundRoomIds,
  };
}

function normalizeBuilding(raw: any): SpatialBuildingDto {
  const floorsRaw = raw?.floors ?? raw?.Floors;
  return {
    id: getNum(raw, 'id', 'Id', 'buildingId', 'BuildingId') ?? 0,
    propertyId: getNum(raw, 'propertyId', 'PropertyId') ?? 0,
    name: getStr(raw, 'name', 'Name', 'buildingName', 'BuildingName') ?? 'Building',
    baseElevation: getNum(raw, 'baseElevation', 'BaseElevation') ?? 0,
    version: getNum(raw, 'version', 'Version') ?? 1,
    floors: Array.isArray(floorsRaw) ? floorsRaw.map(normalizeFloor) : undefined,
  };
}

function normalizeGeometry(raw: any): SpatialGeometryDto {
  const rawPoints = raw?.points ?? raw?.Points;
  const points: SpatialGeometryPointDto[] | undefined = Array.isArray(rawPoints)
    ? rawPoints
        .map((pt: any, idx: number): SpatialGeometryPointDto => ({
          id: getNum(pt, 'id', 'Id'),
          geometryId: getNum(pt, 'geometryId', 'GeometryId'),
          sequence: getNum(pt, 'sequence', 'Sequence') ?? idx,
          x: getNum(pt, 'x', 'X') ?? 0,
          y: getNum(pt, 'y', 'Y') ?? 0,
          z: getNum(pt, 'z', 'Z') ?? 0,
          pointKind: getStr(pt, 'pointKind', 'PointKind') ?? 'Vertex',
          controlX: getNum(pt, 'controlX', 'ControlX') ?? null,
          controlY: getNum(pt, 'controlY', 'ControlY') ?? null,
          controlZ: getNum(pt, 'controlZ', 'ControlZ') ?? null,
        }))
        .sort((a, b) => a.sequence - b.sequence)
    : undefined;

  const rawSpaces = raw?.spaces ?? raw?.Spaces;
  const spaces: SpatialGeometrySpaceLinkDto[] | undefined = Array.isArray(rawSpaces)
    ? rawSpaces.map((sp: any): SpatialGeometrySpaceLinkDto => ({
        id: getNum(sp, 'id', 'Id'),
        geometryId: getNum(sp, 'geometryId', 'GeometryId'),
        spaceKind: parseNodeKind(sp?.spaceKind ?? sp?.SpaceKind, SpatialNodeKind.Room),
        spaceId: getNum(sp, 'spaceId', 'SpaceId') ?? 0,
        relationship: getStr(sp, 'relationship', 'Relationship') ?? 'Bounds',
      }))
    : undefined;

  let parsedJson: any = null;
  const rawJsonField = raw?.geometryJson ?? raw?.GeometryJson;
  const geometryJson =
    typeof rawJsonField === 'string'
      ? rawJsonField
      : rawJsonField && typeof rawJsonField === 'object'
      ? JSON.stringify(rawJsonField)
      : '{}';
  try {
    parsedJson = typeof rawJsonField === 'object' && rawJsonField !== null ? rawJsonField : JSON.parse(geometryJson);
  } catch {
    parsedJson = null;
  }

  const floorFromSpaces = spaces?.find((s) => s.spaceKind === SpatialNodeKind.Floor)?.spaceId;
  const roomFromSpaces = spaces?.find((s) => s.spaceKind === SpatialNodeKind.Room)?.spaceId;
  const sectionFromSpaces = spaces?.find((s) => s.spaceKind === SpatialNodeKind.Section)?.spaceId;
  const buildingFromSpaces = spaces?.find((s) => s.spaceKind === SpatialNodeKind.Building)?.spaceId;

  const floorFromJson =
    getNum(parsedJson, 'floorId', 'FloorId') ??
    (Array.isArray(parsedJson?.floorIds) && parsedJson.floorIds.length > 0
      ? Number(parsedJson.floorIds[0])
      : undefined);
  const roomFromJson =
    getNum(parsedJson, 'roomId', 'RoomId') ??
    (Array.isArray(parsedJson?.spaceRefs)
      ? parsedJson.spaceRefs.find((sr: any) => Number(sr?.kind) === SpatialNodeKind.Room)?.id
      : undefined);
  const sectionFromJson =
    getNum(parsedJson, 'sectionId', 'SectionId') ??
    (Array.isArray(parsedJson?.spaceRefs)
      ? parsedJson.spaceRefs.find((sr: any) => Number(sr?.kind) === SpatialNodeKind.Section)?.id
      : undefined);

  const sourceId =
    getNum(
      raw,
      'sourceOutlineGeometryId',
      'SourceOutlineGeometryId',
      'sourceGeometryId',
      'SourceGeometryId'
    ) ?? null;

  const rawParentKind = raw?.parentKind ?? raw?.ParentKind;
  return {
    id: getNum(raw, 'id', 'Id') ?? 0,
    propertyId: getNum(raw, 'propertyId', 'PropertyId'),
    kind: parseGeometryKind(raw?.kind ?? raw?.Kind, parsedJson),
    name: getStr(raw, 'name', 'Name') ?? 'Geometry',
    geometryJson,
    height: getNum(raw, 'height', 'Height') ?? 0,
    thickness: getNum(raw, 'thickness', 'Thickness') ?? 0,
    materialCode: getStr(raw, 'materialCode', 'MaterialCode') ?? parsedJson?.material ?? null,
    isGenerated: Boolean(raw?.isGenerated ?? raw?.IsGenerated ?? false),
    sourceOutlineGeometryId: sourceId,
    hostGeometryId: getNum(raw, 'hostGeometryId', 'HostGeometryId') ?? null,
    floorId: getNum(raw, 'floorId', 'FloorId') ?? floorFromSpaces ?? floorFromJson ?? null,
    buildingId: getNum(raw, 'buildingId', 'BuildingId') ?? buildingFromSpaces ?? null,
    roomId: getNum(raw, 'roomId', 'RoomId') ?? roomFromSpaces ?? roomFromJson ?? null,
    sectionId: getNum(raw, 'sectionId', 'SectionId') ?? sectionFromSpaces ?? sectionFromJson ?? null,
    parentKind: rawParentKind !== undefined && rawParentKind !== null ? parseNodeKind(rawParentKind) : null,
    parentId: getNum(raw, 'parentId', 'ParentId') ?? null,
    sourceGeometryId: sourceId,
    points,
    spaces,
    version: getNum(raw, 'version', 'Version') ?? 1,
    isHidden: Boolean(raw?.isHidden ?? raw?.IsHidden ?? false),
  };
}

function normalizePlacement(raw: any): SpatialPlacementDto {
  return {
    id: getNum(raw, 'id', 'Id') ?? 0,
    version: getNum(raw, 'version', 'Version') ?? 1,
    propertyId: getNum(raw, 'propertyId', 'PropertyId') ?? 0,
    targetKind: parseTargetKind(raw?.targetKind ?? raw?.TargetKind),
    targetId: getNum(raw, 'targetId', 'TargetId') ?? 0,
    parentKind: parseNodeKind(raw?.parentKind ?? raw?.ParentKind, SpatialNodeKind.Property),
    parentId: getNum(raw, 'parentId', 'ParentId') ?? 0,
    attachmentKind: (getNum(raw, 'attachmentKind', 'AttachmentKind') ?? 1) as number,
    hostGeometryId: getNum(raw, 'hostGeometryId', 'HostGeometryId') ?? null,
    openingId: getNum(raw, 'openingId', 'OpeningId') ?? null,
    supportingPlacementId: getNum(raw, 'supportingPlacementId', 'SupportingPlacementId') ?? null,
    positionX: getNum(raw, 'positionX', 'PositionX') ?? 0,
    positionY: getNum(raw, 'positionY', 'PositionY') ?? 0,
    positionZ: getNum(raw, 'positionZ', 'PositionZ') ?? 0,
    rotationX: getNum(raw, 'rotationX', 'RotationX') ?? 0,
    rotationY: getNum(raw, 'rotationY', 'RotationY') ?? 0,
    rotationZ: getNum(raw, 'rotationZ', 'RotationZ') ?? 0,
    rotationW: getNum(raw, 'rotationW', 'RotationW') ?? 1,
    scaleX: getNum(raw, 'scaleX', 'ScaleX') ?? 1,
    scaleY: getNum(raw, 'scaleY', 'ScaleY') ?? 1,
    scaleZ: getNum(raw, 'scaleZ', 'ScaleZ') ?? 1,
    width: getNum(raw, 'width', 'Width') ?? 0.3,
    height: getNum(raw, 'height', 'Height') ?? 0.3,
    depth: getNum(raw, 'depth', 'Depth') ?? 0.3,
    assetCode: getStr(raw, 'assetCode', 'AssetCode'),
    anchorJson: getStr(raw, 'anchorJson', 'AnchorJson'),
    createdOn: getStr(raw, 'createdOn', 'CreatedOn'),
    lastModifiedOn: getStr(raw, 'lastModifiedOn', 'LastModifiedOn'),
    isDeleted: Boolean(raw?.isDeleted ?? raw?.IsDeleted ?? false),
  };
}

export async function getSpatialProperties(): Promise<SpatialPropertyDto[]> {
  try {
    const res = await apiFetch<any>('/Spatial/Properties', { method: 'GET' });
    const rawList = unwrapPayload<any>(res);
    if (!Array.isArray(rawList)) return [];
    return rawList.map(normalizeProperty);
  } catch (err) {
    throw new Error(extractServerErrorMessage(err, 'Failed to fetch spatial properties'));
  }
}

export async function createSpatialProperty(propertyName: string): Promise<SpatialPropertyDto> {
  try {
    const encoded = encodeURIComponent(propertyName.trim());
    const res = await apiFetch<any>(`/Spatial/CreateProperty?propertyName=${encoded}`, {
      method: 'POST',
      body: '',
    });
    const payload = unwrapPayload<any>(res);
    return normalizeProperty(payload && typeof payload === 'object' ? payload : { name: propertyName });
  } catch (err) {
    throw new Error(extractServerErrorMessage(err, 'Failed to create property'));
  }
}

export async function createSpatialBuilding(dto: CreateBuildingDto): Promise<SpatialBuildingDto> {
  try {
    const res = await apiFetch<any>('/Spatial/CreateBuilding', {
      method: 'POST',
      body: dto,
    });
    const payload = unwrapPayload<any>(res);
    return normalizeBuilding(payload && typeof payload === 'object' ? payload : dto);
  } catch (err) {
    throw new Error(extractServerErrorMessage(err, 'Failed to create building'));
  }
}

export async function createSpatialFloor(dto: CreateFloorDto): Promise<SpatialFloorDto> {
  try {
    const res = await apiFetch<any>('/Spatial/CreateFloor', {
      method: 'POST',
      body: dto,
    });
    const payload = unwrapPayload<any>(res);
    return normalizeFloor(payload && typeof payload === 'object' ? payload : dto);
  } catch (err) {
    throw new Error(extractServerErrorMessage(err, 'Failed to create floor'));
  }
}

export async function bindFloorSection(floorId: number, sectionId: number): Promise<unknown> {
  try {
    return await apiFetch<any>(
      `/Spatial/BindSection?floorId=${encodeURIComponent(floorId)}&sectionId=${encodeURIComponent(sectionId)}`,
      {
        method: 'POST',
        body: '',
      }
    );
  } catch (err) {
    throw new Error(extractServerErrorMessage(err, 'Failed to bind section to floor'));
  }
}

export async function bindFloorRoom(
  floorId: number,
  roomId: number,
  sectionId = 0
): Promise<unknown> {
  try {
    return await apiFetch<any>(
      `/Spatial/BindRoom?floorId=${encodeURIComponent(floorId)}&roomId=${encodeURIComponent(roomId)}&sectionId=${encodeURIComponent(sectionId)}`,
      {
        method: 'POST',
        body: '',
      }
    );
  } catch (err) {
    throw new Error(extractServerErrorMessage(err, 'Failed to bind room to floor'));
  }
}

export async function getSpatialScene(propertyId: number): Promise<SpatialSceneDto> {
  try {
    const res = await apiFetch<any>(
      `/Spatial/GetScene?propertyId=${encodeURIComponent(propertyId)}`,
      { method: 'GET' }
    );
    const raw = unwrapPayload<any>(res) || {};
    console.log('[Spatial/GetScene] raw response:', res);
    console.log('[Spatial/GetScene] unwrapped payload:', raw);

    const rawBuildings = raw.buildings ?? raw.Buildings ?? raw.property?.buildings ?? raw.Property?.Buildings ?? [];
    const buildings: SpatialBuildingDto[] = Array.isArray(rawBuildings)
      ? rawBuildings.map(normalizeBuilding)
      : [];

    const rawFloors = raw.floors ?? raw.Floors ?? [];
    const floorsFromTop: SpatialFloorDto[] = Array.isArray(rawFloors)
      ? rawFloors.map(normalizeFloor)
      : [];

    // Collect nested floors inside buildings AND nested section/room bindings returned by GetSceneAsync
    const nestedFloors: SpatialFloorDto[] = [];
    const derivedSectionBindings: SpatialSectionBindingDto[] = [];
    const derivedRoomBindings: SpatialRoomBindingDto[] = [];

    const collectFloorBindings = (rawFloor: any, normalizedFloor: SpatialFloorDto) => {
      const fSections = rawFloor?.sections ?? rawFloor?.Sections;
      if (Array.isArray(fSections)) {
        fSections.forEach((s: any) => {
          const secId = getNum(s, 'sectionId', 'SectionId', 'id', 'Id') ?? 0;
          if (secId > 0) {
            derivedSectionBindings.push({
              id: getNum(s, 'id', 'Id'),
              floorId: normalizedFloor.id,
              sectionId: secId,
              sectionName: getStr(s, 'sectionName', 'SectionName', 'name', 'Name'),
              isHidden: Boolean(s?.isHidden ?? s?.IsHidden ?? false),
            });
          }
        });
      }
      const fRooms = rawFloor?.directRooms ?? rawFloor?.DirectRooms ?? rawFloor?.rooms ?? rawFloor?.Rooms;
      if (Array.isArray(fRooms)) {
        fRooms.forEach((r: any) => {
          const rId = getNum(r, 'roomId', 'RoomId', 'id', 'Id') ?? 0;
          if (rId > 0) {
            derivedRoomBindings.push({
              id: getNum(r, 'id', 'Id'),
              floorId: normalizedFloor.id,
              roomId: rId,
              sectionId: getNum(r, 'sectionId', 'SectionId') ?? null,
              roomName: getStr(r, 'roomName', 'RoomName', 'name', 'Name'),
              isHidden: Boolean(r?.isHidden ?? r?.IsHidden ?? false),
            });
          }
        });
      }
    };

    rawBuildings.forEach((bRaw: any, bIdx: number) => {
      const bNorm = buildings[bIdx];
      const fListRaw = bRaw?.floors ?? bRaw?.Floors;
      if (Array.isArray(fListRaw)) {
        fListRaw.forEach((fRaw: any) => {
          const fNorm = normalizeFloor({ ...fRaw, buildingId: fRaw?.buildingId ?? bNorm?.id });
          nestedFloors.push(fNorm);
          collectFloorBindings(fRaw, fNorm);
        });
      }
    });

    const floorMap = new Map<number, SpatialFloorDto>();
    [...nestedFloors, ...floorsFromTop].forEach((f) => {
      if (f.id) floorMap.set(f.id, f);
    });
    const floors = Array.from(floorMap.values()).sort((a, b) => a.levelIndex - b.levelIndex);

    const rawSectionBindings =
      raw.sectionBindings ??
      raw.SectionBindings ??
      raw.floorSections ??
      raw.FloorSections ??
      [];
    const explicitSectionBindings: SpatialSectionBindingDto[] = Array.isArray(rawSectionBindings)
      ? rawSectionBindings
          .filter((b: any) => !(b?.isHidden ?? b?.IsHidden))
          .map((b: any) => ({
            id: getNum(b, 'id', 'Id'),
            floorId: getNum(b, 'floorId', 'FloorId') ?? 0,
            sectionId: getNum(b, 'sectionId', 'SectionId') ?? 0,
            sectionName: getStr(b, 'sectionName', 'SectionName', 'name', 'Name'),
            isHidden: Boolean(b?.isHidden ?? b?.IsHidden ?? false),
          }))
      : [];

    const secBindMap = new Map<string, SpatialSectionBindingDto>();
    [...derivedSectionBindings, ...explicitSectionBindings].forEach((b) => {
      if (!b.isHidden && b.floorId && b.sectionId) {
        secBindMap.set(`${b.floorId}:${b.sectionId}`, b);
      }
    });
    const sectionBindings = Array.from(secBindMap.values());

    const rawRoomBindings =
      raw.roomBindings ??
      raw.RoomBindings ??
      raw.floorRooms ??
      raw.FloorRooms ??
      [];
    const explicitRoomBindings: SpatialRoomBindingDto[] = Array.isArray(rawRoomBindings)
      ? rawRoomBindings
          .filter((b: any) => !(b?.isHidden ?? b?.IsHidden))
          .map((b: any) => ({
            id: getNum(b, 'id', 'Id'),
            floorId: getNum(b, 'floorId', 'FloorId') ?? 0,
            roomId: getNum(b, 'roomId', 'RoomId') ?? 0,
            sectionId: getNum(b, 'sectionId', 'SectionId') ?? null,
            roomName: getStr(b, 'roomName', 'RoomName', 'name', 'Name'),
            isHidden: Boolean(b?.isHidden ?? b?.IsHidden ?? false),
          }))
      : [];

    const roomBindMap = new Map<string, SpatialRoomBindingDto>();
    [...derivedRoomBindings, ...explicitRoomBindings].forEach((b) => {
      if (!b.isHidden && b.floorId && b.roomId) {
        roomBindMap.set(`${b.floorId}:${b.roomId}`, b);
      }
    });
    const roomBindings = Array.from(roomBindMap.values());

    // IMPORTANT: C# GetSceneAsync returns singular `Geometry`! Support Geometry/geometry + Geometries/geometries
    const rawGeometries =
      raw.geometry ??
      raw.Geometry ??
      raw.geometries ??
      raw.Geometries ??
      raw.sceneGeometries ??
      [];
    const geometries: SpatialGeometryDto[] = Array.isArray(rawGeometries)
      ? rawGeometries
          .map(normalizeGeometry)
          .filter((g) => !g.isHidden)
      : [];

    const rawPlacements = raw.placements ?? raw.Placements ?? raw.devicePlacements ?? [];
    const placements: SpatialPlacementDto[] = Array.isArray(rawPlacements)
      ? rawPlacements
          .map(normalizePlacement)
          .filter((p) => !p.isDeleted)
      : [];

    const rawOpenings = raw.openings ?? raw.Openings ?? [];
    const openings: SpatialOpeningDto[] = Array.isArray(rawOpenings)
      ? rawOpenings.map((o: any): SpatialOpeningDto => ({
          id: getNum(o, 'id', 'Id') ?? 0,
          propertyId: getNum(o, 'propertyId', 'PropertyId'),
          hostGeometryId: getNum(o, 'hostGeometryId', 'HostGeometryId') ?? 0,
          kind: (getNum(o, 'kind', 'Kind') ?? SpatialOpeningKind.Window) as SpatialOpeningKind,
          offset: getNum(o, 'offset', 'Offset') ?? 0,
          width: getNum(o, 'width', 'Width') ?? 1.0,
          height: getNum(o, 'height', 'Height') ?? 1.2,
          sillHeight: getNum(o, 'sillHeight', 'SillHeight') ?? 0.9,
          frameMaterial: getStr(o, 'frameMaterial', 'FrameMaterial') ?? null,
          operation: getStr(o, 'operation', 'Operation') ?? null,
          panelConfigurationJson: getStr(o, 'panelConfigurationJson', 'PanelConfigurationJson') ?? null,
        }))
      : [];

    const rawExteriorAreas = raw.exteriorAreas ?? raw.ExteriorAreas ?? [];
    const exteriorAreas: SpatialExteriorAreaDto[] = Array.isArray(rawExteriorAreas)
      ? rawExteriorAreas.map((e: any) => ({
          id: getNum(e, 'id', 'Id') ?? 0,
          propertyId: getNum(e, 'propertyId', 'PropertyId') ?? propertyId,
          name: getStr(e, 'name', 'Name') ?? 'Exterior Area',
          areaKind: getStr(e, 'areaKind', 'AreaKind') ?? 'Garden',
        }))
      : [];

    const rawStructures = raw.structures ?? raw.Structures ?? [];
    const structures: SpatialStructureDto[] = Array.isArray(rawStructures)
      ? rawStructures.map((s: any) => ({
          id: getNum(s, 'id', 'Id') ?? 0,
          propertyId: getNum(s, 'propertyId', 'PropertyId') ?? propertyId,
          name: getStr(s, 'name', 'Name') ?? 'Structure',
          structureType: getStr(s, 'structureType', 'StructureType') ?? 'Scaffold',
          geometryJson: getStr(s, 'geometryJson', 'GeometryJson') ?? '{}',
        }))
      : [];

    const rawLightFixtures = raw.lightFixtures ?? raw.LightFixtures ?? [];
    const lightFixtures: SpatialLightFixtureDto[] = Array.isArray(rawLightFixtures)
      ? rawLightFixtures.map((lf: any) => ({
          id: getNum(lf, 'id', 'Id') ?? 0,
          propertyId: getNum(lf, 'propertyId', 'PropertyId') ?? propertyId,
          name: getStr(lf, 'name', 'Name') ?? 'Fixture',
          arrangement: getStr(lf, 'arrangement', 'Arrangement') ?? 'Individual',
          mountingStyle: getStr(lf, 'mountingStyle', 'MountingStyle') ?? 'Ceiling',
          layoutJson: getStr(lf, 'layoutJson', 'LayoutJson') ?? '{}',
          members: Array.isArray(lf?.members ?? lf?.Members)
            ? (lf.members ?? lf.Members).map((m: any, i: number) => ({
                id: getNum(m, 'id', 'Id'),
                fixtureId: getNum(m, 'fixtureId', 'FixtureId'),
                lightId: getNum(m, 'lightId', 'LightId') ?? 0,
                sequence: getNum(m, 'sequence', 'Sequence') ?? i,
                offsetX: getNum(m, 'offsetX', 'OffsetX') ?? 0,
                offsetY: getNum(m, 'offsetY', 'OffsetY') ?? 0,
                offsetZ: getNum(m, 'offsetZ', 'OffsetZ') ?? 0,
              }))
            : [],
        }))
      : [];

    const propRaw = raw.property ?? raw.Property;
    const property = propRaw ? normalizeProperty(propRaw) : null;

    const sceneResult: SpatialSceneDto = {
      property,
      propertyId: getNum(raw, 'propertyId', 'PropertyId') ?? property?.id ?? propertyId,
      propertyName:
        getStr(raw, 'propertyName', 'PropertyName') ?? property?.propertyName ?? property?.name,
      coordinateSystem:
        getStr(raw, 'coordinateSystem', 'CoordinateSystem') ??
        property?.coordinateSystem ??
        'RightHanded-YUp-Metres',
      version: getNum(raw, 'version', 'Version') ?? property?.version ?? 1,
      buildings,
      floors,
      sectionBindings,
      roomBindings,
      exteriorAreas,
      structures,
      openings,
      lightFixtures,
      geometries,
      placements,
      raw,
    };
    console.log('[Spatial/GetScene] normalized scene:', sceneResult);
    return sceneResult;
  } catch (err) {
    throw new Error(extractServerErrorMessage(err, 'Failed to load 3D spatial scene'));
  }
}

export async function createSpatialGeometry(
  propertyId: number,
  dto: CreateGeometryDto
): Promise<SpatialGeometryDto> {
  try {
    const res = await apiFetch<any>(
      `/Spatial/CreateGeometry?propertyId=${encodeURIComponent(propertyId)}`,
      {
        method: 'POST',
        body: dto,
      }
    );
    const payload = unwrapPayload<any>(res);
    return normalizeGeometry(
      payload && typeof payload === 'object' ? payload : { ...dto, propertyId }
    );
  } catch (err: any) {
    if (isConflictError(err)) {
      throw new SpatialConflictError(extractServerErrorMessage(err, 'Version conflict on geometry'));
    }
    throw new Error(extractServerErrorMessage(err, 'Failed to create spatial geometry'));
  }
}

export async function upsertSpatialPlacement(
  dto: SpatialPlacementDto
): Promise<SpatialPlacementDto> {
  try {
    const bodyPayload: SpatialPlacementDto = {
      ...dto,
      isDeleted: false,
      assetCode: dto.assetCode || 'standard',
      anchorJson: dto.anchorJson || '{}',
    };
    const res = await apiFetch<any>('/Spatial/Placements', {
      method: 'POST',
      body: bodyPayload,
    });
    const payload = unwrapPayload<any>(res);
    return normalizePlacement(
      payload && typeof payload === 'object' ? payload : bodyPayload
    );
  } catch (err: any) {
    if (isConflictError(err)) {
      throw new SpatialConflictError(
        extractServerErrorMessage(err, 'Optimistic concurrency conflict: placement version is stale')
      );
    }
    throw new Error(extractServerErrorMessage(err, 'Failed to save device placement'));
  }
}

export async function deleteSpatialPlacement(id: number): Promise<void> {
  try {
    await apiFetch<any>(`/Spatial/DeletePlacement?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err: any) {
    if (isConflictError(err)) {
      throw new SpatialConflictError(extractServerErrorMessage(err, 'Version conflict deleting placement'));
    }
    throw new Error(extractServerErrorMessage(err, 'Failed to delete spatial placement'));
  }
}
