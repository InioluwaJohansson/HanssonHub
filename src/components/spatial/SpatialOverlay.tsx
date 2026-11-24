import * as React from 'react';
import {
  AlertTriangle,
  Box,
  Building2,
  Camera,
  CheckCircle2,
  DoorOpen,
  Eye,
  EyeOff,
  FileCode2,
  GripVertical,
  Hammer,
  Info,
  Layers,
  Lightbulb,
  Magnet,
  Maximize2,
  MousePointer,
  Move,
  PanelRightClose,
  PanelRightOpen,
  PenTool,
  Plus,
  Power,
  Radio,
  Redo2,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Ruler,
  Save,
  Scaling,
  ShieldAlert,
  Shapes,
  Sparkles,
  Trash2,
  Trees,
  Undo2,
  Wand2,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Device, Room, Section, UtilityType } from '../../types';
import {
  ExteriorOrStructurePayload,
  FixtureArrangement,
  FixtureMountingStyle,
  LightFixtureGroupMeta,
  PoolGeometryPayload,
  RoofGeometryPayload,
  RoomOutlineGeometryPayload,
  SegmentCurveKind,
  SlabGeometryPayload,
  SpatialAttachmentKind,
  SpatialDraftPreview,
  SpatialDragPayload,
  SpatialFloorDto,
  SpatialGeometryDto,
  SpatialGeometryKind,
  SpatialNodeKind,
  SpatialOpeningKind,
  SpatialPlacementDto,
  SpatialPropertyDto,
  SpatialSceneDto,
  SpatialTargetKind,
  StairGeometryPayload,
  ViewportRenderMode,
  ViewportToolMode,
  WallGeometryPayload,
  WallOpeningSpec,
} from '../../types/spatial';
import {
  bindFloorRoom,
  bindFloorSection,
  createSpatialBuilding,
  createSpatialFloor,
  createSpatialGeometry,
  createSpatialProperty,
  deleteSpatialPlacement,
  extractServerErrorMessage,
  getSpatialProperties,
  getSpatialScene,
  SPATIAL_ENDPOINT_CONTRACTS,
  SpatialConflictError,
  upsertSpatialPlacement,
} from '../../lib/spatialApi';
import {
  computeGeometryBounds,
  extractWallMeta,
  safeParseJson,
} from './SpatialGeometryBuilders';
import { RoomOutlineEditor } from './RoomOutlineEditor';
import {
  CameraPresetMode,
  ResizeGeometryUpdate,
  SpatialSelectionTarget,
  SpatialViewport,
  TransformGizmoMode,
  WallDropHit,
} from './SpatialViewport';
import { toast } from 'sonner';

interface SpatialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  rooms: Room[];
  sections: Section[];
  appNamesDetailList?: any;
  devices: Device[];
  activePropertyId: number | null;
  onActivePropertyChange: (propertyId: number | null) => void;
  externalRefreshNonce: number;
  onRefreshHierarchyCatalog?: () => Promise<void>;
}

type DrawerTab = 'setup' | 'outline' | 'architecture' | 'devices';

interface UndoSnapshot {
  label: string;
  placement: SpatialPlacementDto;
  previous: SpatialPlacementDto;
}

interface ResolvedSpatialSection extends Section {
  dbId: number;
}

interface ResolvedSpatialRoom extends Room {
  dbId: number;
}

const getRawEntityId = (id: string | number | undefined | null): number => {
  if (id === undefined || id === null || id === '') return 0;
  if (typeof id === 'number') return Number.isFinite(id) ? id : 0;
  const s = String(id).trim();
  if (/^\d+$/.test(s)) return Number(s);
  if (s.includes('-')) {
    const part = s.split('-')[1];
    if (part && /^\d+$/.test(part)) return Number(part);
  }
  const num = Number(s);
  return Number.isFinite(num) ? num : 0;
};

const resolveEntityDbId = (entity: any, extraKeys: string[] = []): number => {
  if (!entity) return 0;
  const candidates = [
    entity.dbId,
    entity.DbId,
    entity.Id,
    typeof entity.id === 'number' ? entity.id : undefined,
    ...extraKeys.map((k) => entity[k]),
    entity.id,
  ];
  for (const c of candidates) {
    const num = getRawEntityId(c);
    if (num > 0) return num;
  }
  return 0;
};

export function SpatialOverlay({
  isOpen,
  onClose,
  theme,
  rooms,
  sections,
  appNamesDetailList,
  devices,
  activePropertyId,
  onActivePropertyChange,
  externalRefreshNonce,
  onRefreshHierarchyCatalog,
}: SpatialOverlayProps) {
  const [properties, setProperties] = React.useState<SpatialPropertyDto[]>([]);
  const [sceneData, setSceneData] = React.useState<SpatialSceneDto | null>(null);
  const [isLoadingProps, setIsLoadingProps] = React.useState(false);
  const [isLoadingScene, setIsLoadingScene] = React.useState(false);
  const [isBusy, setIsBusy] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [conflictMessage, setConflictMessage] = React.useState<string | null>(null);

  const [activeTab, setActiveTab] = React.useState<DrawerTab>('setup');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);
  const [isContractsModalOpen, setIsContractsModalOpen] = React.useState(false);

  const [gizmoMode, setGizmoMode] = React.useState<TransformGizmoMode>('translate');
  const [toolMode, setToolMode] = React.useState<ViewportToolMode>('select');
  const [renderMode, setRenderMode] = React.useState<ViewportRenderMode>('realistic');
  const [gridSnap, setGridSnap] = React.useState(true);
  const [showLivePreview, setShowLivePreview] = React.useState(true);
  const [outlineFocusMode, setOutlineFocusMode] = React.useState<'polygon' | 'dimensions'>('polygon');
  const [outlineDraft, setOutlineDraft] = React.useState<SpatialDraftPreview | null>(null);
  const [activeFloorId, setActiveFloorId] = React.useState<number | null>(null);
  const [activeDragPayload, setActiveDragPayload] = React.useState<SpatialDragPayload | null>(null);
  const [resetCameraNonce, setResetCameraNonce] = React.useState(0);
  const [cameraPresetRequest, setCameraPresetRequest] = React.useState<{
    mode: CameraPresetMode;
    nonce: number;
  } | null>(null);
  const [visibleFloors, setVisibleFloors] = React.useState<Record<number, boolean>>({});
  const [selected, setSelected] = React.useState<SpatialSelectionTarget | null>(null);

  // Room & Section live dimension editor state
  const [dimSpaceKind, setDimSpaceKind] = React.useState<'room' | 'section'>('room');
  const [dimSpaceId, setDimSpaceId] = React.useState<number | ''>('');
  const [dimWidth, setDimWidth] = React.useState<number>(4.5);
  const [dimDepth, setDimDepth] = React.useState<number>(4.0);
  const [dimHeight, setDimHeight] = React.useState<number>(2.8);
  const [dimCenterX, setDimCenterX] = React.useState<number>(0);
  const [dimCenterZ, setDimCenterZ] = React.useState<number>(0);
  const [dimThickness, setDimThickness] = React.useState<number>(0.18);
  const [dimMaterial, setDimMaterial] =
    React.useState<NonNullable<WallGeometryPayload['material']>>('concrete');

  // Selected Wall Opening Inline Editor state
  const [selOpKind, setSelOpKind] = React.useState<SpatialOpeningKind>(SpatialOpeningKind.Window);
  const [selOpOffset, setSelOpOffset] = React.useState<number>(0.8);
  const [selOpWidth, setSelOpWidth] = React.useState<number>(1.2);
  const [selOpHeight, setSelOpHeight] = React.useState<number>(1.2);
  const [selOpSill, setSelOpSill] = React.useState<number>(0.9);

  // Cache flags so closing & reopening the overlay never re-fetches or re-renders unless refreshed
  const hasLoadedPropertiesRef = React.useRef(false);
  const loadedPropertyIdRef = React.useRef<number | null>(null);
  const lastAppliedRefreshNonceRef = React.useRef<number>(externalRefreshNonce);

  // Local undo/redo stacks (reverted cleanly if API rejects; saved incrementally)
  const [undoStack, setUndoStack] = React.useState<UndoSnapshot[]>([]);
  const [redoStack, setRedoStack] = React.useState<UndoSnapshot[]>([]);
  const saveTimerRef = React.useRef<number | null>(null);

  // Authoritative visible sections (merging sections + appNamesDetailList.sectionIdNames, resolving true numeric DB IDs, strictly hiding isHidden)
  const {
    visibleSections,
    visibleSectionIds,
    hiddenSectionIds,
    hiddenSectionNames,
    sectionCodeToDbId,
  } = React.useMemo(() => {
    const hiddenIds = new Set<number>();
    const hiddenNames = new Set<string>();
    const codeMap = new Map<string, number>();

    const appSectionIdNames: any[] =
      appNamesDetailList?.sectionIdNames ||
      appNamesDetailList?.SectionIdNames ||
      [];
    const appSectionIds: any[] =
      appNamesDetailList?.sectionIds ||
      appNamesDetailList?.SectionIds ||
      [];

    const appNameToId = new Map<string, number>();
    [...appSectionIdNames, ...appSectionIds].forEach((item: any) => {
      if (!item) return;
      const itemId = resolveEntityDbId(item, ['sectionId', 'SectionId']);
      const itemName = String(item.name ?? item.Name ?? item.sectionName ?? '').trim();
      const itemHidden = Boolean(item.isHidden ?? item.IsHidden);
      if (itemHidden) {
        if (itemId > 0) hiddenIds.add(itemId);
        if (itemName) hiddenNames.add(itemName.toLowerCase());
      } else if (itemId > 0 && itemName) {
        appNameToId.set(itemName.toLowerCase(), itemId);
      }
    });

    (sections || []).forEach((s: any) => {
      if (!s) return;
      const dbId = resolveEntityDbId(s, ['sectionId', 'SectionId']);
      const name = String(s.name ?? s.sectionName ?? '').trim();
      if (s.isHidden || s.IsHidden) {
        if (dbId > 0) hiddenIds.add(dbId);
        if (name) hiddenNames.add(name.toLowerCase());
        if (s.id) hiddenNames.add(String(s.id).trim().toLowerCase());
        if (s.sectionId) hiddenNames.add(String(s.sectionId).trim().toLowerCase());
      }
    });

    const merged = new Map<number, ResolvedSpatialSection>();

    (sections || []).forEach((s: any) => {
      if (!s || s.isHidden || s.IsHidden) return;
      const name = String(s.name ?? s.sectionName ?? '').trim();
      let dbId = resolveEntityDbId(s, ['sectionId', 'SectionId']);
      if (dbId <= 0 && name) {
        dbId = appNameToId.get(name.toLowerCase()) ?? 0;
      }
      if (dbId <= 0) return;
      if (hiddenIds.has(dbId) || (name && hiddenNames.has(name.toLowerCase()))) return;

      [s.id, s.sectionId, s.dbId, name].forEach((code) => {
        if (code !== undefined && code !== null && String(code).trim() !== '') {
          codeMap.set(String(code).trim().toLowerCase(), dbId);
        }
      });

      if (!merged.has(dbId)) {
        merged.set(dbId, {
          ...s,
          id: dbId,
          dbId,
          name: name || `Section #${dbId}`,
        });
      }
    });

    [...appSectionIdNames, ...appSectionIds].forEach((item: any) => {
      if (!item || item.isHidden || item.IsHidden) return;
      const dbId = resolveEntityDbId(item, ['sectionId', 'SectionId']);
      const name = String(item.name ?? item.Name ?? item.sectionName ?? '').trim();
      if (dbId <= 0) return;
      if (hiddenIds.has(dbId) || (name && hiddenNames.has(name.toLowerCase()))) return;

      [item.id, item.sectionId, dbId, name].forEach((code) => {
        if (code !== undefined && code !== null && String(code).trim() !== '') {
          codeMap.set(String(code).trim().toLowerCase(), dbId);
        }
      });

      if (!merged.has(dbId)) {
        merged.set(dbId, {
          id: dbId,
          dbId,
          name: name || `Section #${dbId}`,
          isHidden: false,
        });
      }
    });

    const list = Array.from(merged.values());
    const idSet = new Set<number>(list.map((s) => s.dbId));
    return {
      visibleSections: list,
      visibleSectionIds: idSet,
      hiddenSectionIds: hiddenIds,
      hiddenSectionNames: hiddenNames,
      sectionCodeToDbId: codeMap,
    };
  }, [sections, appNamesDetailList]);

  const resolveRoomSectionDbId = React.useCallback(
    (r: any): number => {
      if (!r) return 0;
      const directNum =
        getRawEntityId(r.sectionId ?? r.SectionId) ||
        getRawEntityId(r.section ?? r.Section);
      if (directNum > 0) return directNum;
      const code = String(
        r.sectionId ?? r.SectionId ?? r.sectionName ?? r.SectionName ?? r.section ?? r.Section ?? ''
      )
        .trim()
        .toLowerCase();
      if (code && sectionCodeToDbId.has(code)) {
        return sectionCodeToDbId.get(code)!;
      }
      return 0;
    },
    [sectionCodeToDbId]
  );

  // Authoritative visible rooms (merging rooms + appNamesDetailList.roomIdNames, strictly hiding hidden rooms or hidden sections)
  const visibleRooms = React.useMemo<ResolvedSpatialRoom[]>(() => {
    const hiddenRoomIds = new Set<number>();
    const hiddenRoomNames = new Set<string>();

    const appRoomIdNames: any[] =
      appNamesDetailList?.roomIdNames ||
      appNamesDetailList?.RoomIdNames ||
      [];
    const appRoomIds: any[] =
      appNamesDetailList?.roomIds ||
      appNamesDetailList?.RoomIds ||
      [];

    [...appRoomIdNames, ...appRoomIds].forEach((item: any) => {
      if (!item) return;
      const rid = resolveEntityDbId(item, ['roomId', 'RoomId']);
      const rname = String(item.name ?? item.Name ?? item.roomName ?? '').trim().toLowerCase();
      if (item.isHidden || item.IsHidden) {
        if (rid > 0) hiddenRoomIds.add(rid);
        if (rname) hiddenRoomNames.add(rname);
      }
    });

    (rooms || []).forEach((r: any) => {
      if (!r) return;
      const rid = resolveEntityDbId(r, ['roomId', 'RoomId']);
      const rname = String(r.name ?? r.roomName ?? '').trim().toLowerCase();
      if (r.isHidden || r.IsHidden) {
        if (rid > 0) hiddenRoomIds.add(rid);
        if (rname) hiddenRoomNames.add(rname);
      }
    });

    const isRoomAllowed = (r: any, dbId: number, name: string): boolean => {
      if (r.isHidden || r.IsHidden) return false;
      if (hiddenRoomIds.has(dbId)) return false;
      if (name && hiddenRoomNames.has(name.toLowerCase())) return false;

      const secDbId = resolveRoomSectionDbId(r);
      const secName = String(r.sectionName ?? r.SectionName ?? r.section ?? '')
        .trim()
        .toLowerCase();
      if (secDbId > 0 && hiddenSectionIds.has(secDbId)) return false;
      if (secName && hiddenSectionNames.has(secName)) return false;
      if (secDbId > 0 && visibleSectionIds.size > 0 && !visibleSectionIds.has(secDbId)) {
        return false;
      }
      return true;
    };

    const merged = new Map<number, ResolvedSpatialRoom>();

    (rooms || []).forEach((r: any) => {
      if (!r) return;
      const dbId = resolveEntityDbId(r, ['roomId', 'RoomId']);
      const name = String(r.name ?? r.roomName ?? '').trim();
      if (dbId <= 0 || !isRoomAllowed(r, dbId, name)) return;
      if (!merged.has(dbId)) {
        merged.set(dbId, {
          ...r,
          id: dbId,
          dbId,
          name: name || `Room #${dbId}`,
        });
      }
    });

    [...appRoomIdNames, ...appRoomIds].forEach((item: any) => {
      if (!item) return;
      const dbId = resolveEntityDbId(item, ['roomId', 'RoomId']);
      const name = String(item.name ?? item.Name ?? item.roomName ?? '').trim();
      if (dbId <= 0 || !isRoomAllowed(item, dbId, name)) return;
      if (!merged.has(dbId)) {
        merged.set(dbId, {
          ...item,
          id: dbId,
          dbId,
          name: name || `Room #${dbId}`,
          section: item.sectionId?.toString() || item.section || '',
          icon: 'Sofa',
          isHidden: false,
        });
      }
    });

    return Array.from(merged.values());
  }, [rooms, appNamesDetailList, hiddenSectionIds, hiddenSectionNames, visibleSectionIds, resolveRoomSectionDbId]);

  const visibleRoomIds = React.useMemo(
    () => new Set(visibleRooms.map((r) => r.dbId)),
    [visibleRooms]
  );
  const visibleDevices = React.useMemo(
    () =>
      (devices || []).filter((d) => {
        const rId = getRawEntityId(d.room);
        const sId = sectionCodeToDbId.get(String(d.section || '').trim().toLowerCase()) ?? getRawEntityId(d.section);
        if (rId > 0 && !visibleRoomIds.has(rId)) return false;
        if (sId > 0 && !visibleSectionIds.has(sId)) return false;
        return true;
      }),
    [devices, visibleRoomIds, visibleSectionIds, sectionCodeToDbId]
  );

  // --- Setup Forms State ---
  const [newPropertyName, setNewPropertyName] = React.useState('');
  const [newBuildingName, setNewBuildingName] = React.useState('Main Residence');
  const [newBuildingElev, setNewBuildingElev] = React.useState(0);
  const [selectedBuildingId, setSelectedBuildingId] = React.useState<number | ''>('');
  const [newFloorName, setNewFloorName] = React.useState('Ground');
  const [newFloorLevelIdx, setNewFloorLevelIdx] = React.useState(0);
  const [newFloorElev, setNewFloorElev] = React.useState(0);
  const [newFloorCeiling, setNewFloorCeiling] = React.useState(2.8);

  const [bindTargetFloorId, setBindTargetFloorId] = React.useState<number | ''>('');
  const [bindSectionId, setBindSectionId] = React.useState<number | ''>('');
  const [bindRoomId, setBindRoomId] = React.useState<number | ''>('');

  // Exterior & Scaffold form
  const [extKind, setExtKind] = React.useState<'garden' | 'driveway' | 'tankScaffold'>('garden');
  const [extName, setExtName] = React.useState('Front Garden');
  const [extX, setExtX] = React.useState(0);
  const [extY, setExtY] = React.useState(0);
  const [extZ, setExtZ] = React.useState(6);
  const [extW, setExtW] = React.useState(4);
  const [extD, setExtD] = React.useState(3);
  const [extH, setExtH] = React.useState(2.2);

  // --- Architecture Forms State ---
  const [archTool, setArchTool] = React.useState<'wall' | 'slab' | 'roof' | 'stair' | 'pool'>('wall');
  // Shared Wall + Opening
  const [wallName, setWallName] = React.useState('Shared Corridor Wall');
  const [wallFloorId, setWallFloorId] = React.useState<string>('');
  const [wallX1, setWallX1] = React.useState(-3);
  const [wallZ1, setWallZ1] = React.useState(0);
  const [wallX2, setWallX2] = React.useState(3);
  const [wallZ2, setWallZ2] = React.useState(0);
  const [wallHeight, setWallHeight] = React.useState(2.8);
  const [wallThickness, setWallThickness] = React.useState(0.2);
  const [wallStyle, setWallStyle] = React.useState<WallGeometryPayload['style']>('solid');
  const [wallMat, setWallMat] = React.useState<WallGeometryPayload['material']>('concrete');
  const [wallCurve, setWallCurve] = React.useState<SegmentCurveKind>('line');
  const [wallArcBulge, setWallArcBulge] = React.useState(0.6);
  const [wallSpaceRefs, setWallSpaceRefs] = React.useState<number[]>([]);
  const [wallOpenings, setWallOpenings] = React.useState<WallOpeningSpec[]>([]);
  const [newOpKind, setNewOpKind] = React.useState<SpatialOpeningKind>(SpatialOpeningKind.Door);
  const [newOpOffset, setNewOpOffset] = React.useState(1.2);
  const [newOpWidth, setNewOpWidth] = React.useState(0.95);
  const [newOpHeight, setNewOpHeight] = React.useState(2.1);
  const [newOpSill, setNewOpSill] = React.useState(0);

  // Shared Slab / Void
  const [slabName, setSlabName] = React.useState('Shared Structural Slab');
  const [slabMode, setSlabMode] = React.useState<'slab' | 'void'>('slab');
  const [slabRole, setSlabRole] = React.useState<SlabGeometryPayload['role']>('sharedFloorCeiling');
  const [slabFloorId, setSlabFloorId] = React.useState<string>('');
  const [slabSharedFloors, setSlabSharedFloors] = React.useState<number[]>([]);
  const [slabW, setSlabW] = React.useState(6);
  const [slabD, setSlabD] = React.useState(5);
  const [slabCX, setSlabCX] = React.useState(0);
  const [slabCZ, setSlabCZ] = React.useState(0);
  const [slabThickness, setSlabThickness] = React.useState(0.24);

  // Roof
  const [roofName, setRoofName] = React.useState('Main Slanted Roof');
  const [roofBuildingId, setRoofBuildingId] = React.useState<string>('');
  const [roofStyle, setRoofStyle] = React.useState<RoofGeometryPayload['roofStyle']>('slantedEdges');
  const [roofElev, setRoofElev] = React.useState(3.2);
  const [roofOverhang, setRoofOverhang] = React.useState(0.5);
  const [roofParapetH, setRoofParapetH] = React.useState(0.45);
  const [roofSlope, setRoofSlope] = React.useState(12);
  const [roofW, setRoofW] = React.useState(7);
  const [roofD, setRoofD] = React.useState(6);

  // Stairs (Straight & U-Turn)
  const [stairName, setStairName] = React.useState('Main U-Turn Staircase');
  const [stairLayout, setStairLayout] = React.useState<'uturn' | 'straight'>('uturn');
  const [stairFloorId, setStairFloorId] = React.useState<string>('');
  const [stairOrigX, setStairOrigX] = React.useState(-1.5);
  const [stairOrigZ, setStairOrigZ] = React.useState(-1.5);
  const [stairWidth, setStairWidth] = React.useState(1.1);
  const [stairRun, setStairRun] = React.useState(2.6);
  const [stairRise, setStairRise] = React.useState(3.0);
  const [stairIncludeVoid, setStairIncludeVoid] = React.useState(true);

  // Indoor Swimming Pool
  const [poolName, setPoolName] = React.useState('Indoor Wellness Pool');
  const [poolRoomId, setPoolRoomId] = React.useState<string>('');
  const [poolFloorId, setPoolFloorId] = React.useState<string>('');
  const [poolL, setPoolL] = React.useState(6);
  const [poolW, setPoolW] = React.useState(3.2);
  const [poolDepth, setPoolDepth] = React.useState(1.5);
  const [poolDeck, setPoolDeck] = React.useState(0.8);

  // --- Device Placement & Light Fixture Groups ---
  const [targetKind, setTargetKind] = React.useState<SpatialTargetKind>(SpatialTargetKind.Light);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string>('');
  const [parentKind, setParentKind] = React.useState<SpatialNodeKind>(SpatialNodeKind.Floor);
  const [parentId, setParentId] = React.useState<string>('');
  const [attachmentKind, setAttachmentKind] = React.useState<SpatialAttachmentKind>(
    SpatialAttachmentKind.Free
  );
  const [placeX, setPlaceX] = React.useState(0);
  const [placeY, setPlaceY] = React.useState(1.2);
  const [placeZ, setPlaceZ] = React.useState(0);
  const [placeAssetCode, setPlaceAssetCode] = React.useState('standard');

  // Fixture Group state
  const [fixtureMode, setFixtureMode] = React.useState(false);
  const [fixtureGroupName, setFixtureGroupName] = React.useState('Ceiling Downlights');
  const [fixtureArrangement, setFixtureArrangement] =
    React.useState<FixtureArrangement>('squareGrid');
  const [fixtureMounting, setFixtureMounting] =
    React.useState<FixtureMountingStyle>('recessed');
  const [fixtureSpacing, setFixtureSpacing] = React.useState(1.4);
  const [fixtureLightIds, setFixtureLightIds] = React.useState<number[]>([]);

  // Dismiss on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key.toLowerCase() === 'g') setGizmoMode('translate');
      else if (e.key.toLowerCase() === 'r') setGizmoMode('rotate');
      else if (e.key.toLowerCase() === 's') setGizmoMode('scale');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const loadProperties = React.useCallback(async () => {
    setIsLoadingProps(true);
    setServerError(null);
    try {
      const list = await getSpatialProperties();
      setProperties(list);
      hasLoadedPropertiesRef.current = true;
      if (list.length > 0 && (!activePropertyId || !list.some((p) => p.id === activePropertyId))) {
        onActivePropertyChange(list[0].id);
      }
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsLoadingProps(false);
    }
  }, [activePropertyId, onActivePropertyChange]);

  const loadScene = React.useCallback(async (propId: number) => {
    setIsLoadingScene(true);
    setServerError(null);
    try {
      const scene = await getSpatialScene(propId);
      loadedPropertyIdRef.current = propId;
      setSceneData(scene);
      if (scene.buildings.length > 0) {
        setSelectedBuildingId((prev) => prev || scene.buildings[0].id);
        setRoofBuildingId((prev) => prev || String(scene.buildings[0].id));
      }
      if (scene.floors.length > 0) {
        const firstFloorId = scene.floors[0].id;
        setActiveFloorId((prev) =>
          prev && scene.floors.some((f) => f.id === prev) ? prev : firstFloorId
        );
        setBindTargetFloorId((prev) => prev || firstFloorId);
        setWallFloorId((prev) => prev || String(firstFloorId));
        setSlabFloorId((prev) => prev || String(firstFloorId));
        setStairFloorId((prev) => prev || String(firstFloorId));
        setPoolFloorId((prev) => prev || String(firstFloorId));
        setVisibleFloors((prev) => {
          const next = { ...prev };
          scene.floors.forEach((f) => {
            if (next[f.id] === undefined) next[f.id] = true;
          });
          return next;
        });
      } else {
        setActiveFloorId(null);
      }
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsLoadingScene(false);
    }
  }, []);

  const handleManualRefresh = React.useCallback(async () => {
    lastAppliedRefreshNonceRef.current = externalRefreshNonce;
    await Promise.all([
      loadProperties(),
      onRefreshHierarchyCatalog ? onRefreshHierarchyCatalog() : Promise.resolve(),
      activePropertyId ? loadScene(activePropertyId) : Promise.resolve(),
    ]);
  }, [activePropertyId, externalRefreshNonce, loadProperties, loadScene, onRefreshHierarchyCatalog]);

  // Initial properties & hierarchy catalog fetch ONLY once; reopen uses saved state until explicitly refreshed
  React.useEffect(() => {
    if (!isOpen) return;
    if (!hasLoadedPropertiesRef.current) {
      loadProperties();
      if (onRefreshHierarchyCatalog) {
        onRefreshHierarchyCatalog().catch(() => {});
      }
    }
  }, [isOpen, loadProperties, onRefreshHierarchyCatalog]);

  // Fetch 3D scene ONLY on first load for propertyId, property switch, or SignalR refresh signal
  React.useEffect(() => {
    if (!isOpen || !activePropertyId) return;
    const needsInitialForProperty = loadedPropertyIdRef.current !== activePropertyId;
    const needsExternalRefresh = lastAppliedRefreshNonceRef.current !== externalRefreshNonce;
    if (needsInitialForProperty || needsExternalRefresh) {
      lastAppliedRefreshNonceRef.current = externalRefreshNonce;
      loadScene(activePropertyId);
    }
  }, [isOpen, activePropertyId, externalRefreshNonce, loadScene]);

  const buildings = sceneData?.buildings || [];
  const floors = sceneData?.floors || [];
  const geometries = sceneData?.geometries || [];
  const placements = sceneData?.placements || [];

  // Scaffold / exterior / structural geometries for parent selection
  const scaffoldGeometries = React.useMemo(
    () =>
      geometries.filter((g) => {
        try {
          const p = JSON.parse(g.geometryJson || '{}');
          return p?.nodeKind === SpatialNodeKind.Structure;
        } catch {
          return false;
        }
      }),
    [geometries]
  );

  const exteriorGeometries = React.useMemo(
    () =>
      geometries.filter((g) => {
        try {
          const p = JSON.parse(g.geometryJson || '{}');
          return p?.nodeKind === SpatialNodeKind.ExteriorArea;
        } catch {
          return false;
        }
      }),
    [geometries]
  );

  // Filter existing smart-home devices by selected targetKind
  const filteredDevicesForTarget = React.useMemo(() => {
    const mapKind: Record<SpatialTargetKind, string> = {
      [SpatialTargetKind.Door]: 'door',
      [SpatialTargetKind.Window]: 'window',
      [SpatialTargetKind.Light]: 'light',
      [SpatialTargetKind.Camera]: 'camera',
      [SpatialTargetKind.Appliance]: 'appliance',
      [SpatialTargetKind.External]: 'external',
      [SpatialTargetKind.Utility]: 'utility',
    };
    return visibleDevices.filter((d) => d.type === mapKind[targetKind]);
  }, [visibleDevices, targetKind]);

  // Helper to resolve placement transform commit + optimistic concurrency + undo/redo
  const commitPlacementMutation = React.useCallback(
    async (
      nextPlacement: SpatialPlacementDto,
      previousPlacement?: SpatialPlacementDto,
      label = 'Update Placement'
    ) => {
      try {
        const saved = await upsertSpatialPlacement(nextPlacement);
        setSceneData((prev) => {
          if (!prev) return prev;
          const exists = prev.placements.some((p) => p.id === saved.id);
          return {
            ...prev,
            placements: exists
              ? prev.placements.map((p) => (p.id === saved.id ? saved : p))
              : [...prev.placements, saved],
          };
        });
        if (previousPlacement) {
          setUndoStack((prev) => [
            ...prev.slice(-19),
            { label, placement: saved, previous: previousPlacement },
          ]);
          setRedoStack([]);
        }
        toast.success(`${label} synced`);
      } catch (err: any) {
        if (err instanceof SpatialConflictError) {
          setConflictMessage(err.message);
        } else {
          const msg = extractServerErrorMessage(err);
          setServerError(msg);
          toast.error(msg);
        }
      }
    },
    []
  );

  const handlePlacementTransformed = React.useCallback(
    (
      orig: SpatialPlacementDto,
      nextTransform: {
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
      }
    ) => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      const updated: SpatialPlacementDto = { ...orig, ...nextTransform };

      // Debounce harmless gizmo transform commits incrementally
      saveTimerRef.current = window.setTimeout(() => {
        commitPlacementMutation(updated, orig, `Transform Placement #${orig.id}`);
      }, 380);
    },
    [commitPlacementMutation]
  );

  const handleUndo = async () => {
    const top = undoStack[undoStack.length - 1];
    if (!top) return;
    setIsBusy(true);
    try {
      const reverted = await upsertSpatialPlacement({
        ...top.previous,
        version: top.placement.version,
      });
      setUndoStack((prev) => prev.slice(0, -1));
      setRedoStack((prev) => [...prev, { ...top, placement: reverted }]);
      if (activePropertyId) await loadScene(activePropertyId);
      toast.info(`Undid: ${top.label}`);
    } catch (err: any) {
      if (err instanceof SpatialConflictError) setConflictMessage(err.message);
      else toast.error(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleRedo = async () => {
    const top = redoStack[redoStack.length - 1];
    if (!top) return;
    setIsBusy(true);
    try {
      const reapplied = await upsertSpatialPlacement({
        ...top.placement,
      });
      setRedoStack((prev) => prev.slice(0, -1));
      setUndoStack((prev) => [...prev, { ...top, placement: reapplied }]);
      if (activePropertyId) await loadScene(activePropertyId);
      toast.info(`Redid: ${top.label}`);
    } catch (err: any) {
      if (err instanceof SpatialConflictError) setConflictMessage(err.message);
      else toast.error(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  // --- Handlers for Setup Tab ---
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropertyName.trim()) return;
    setIsBusy(true);
    setServerError(null);
    try {
      const created = await createSpatialProperty(newPropertyName.trim());
      setNewPropertyName('');
      await loadProperties();
      if (created.id) onActivePropertyChange(created.id);
      toast.success(`Property "${created.name || newPropertyName}" created`);
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePropertyId || !newBuildingName.trim()) return;
    setIsBusy(true);
    setServerError(null);
    try {
      await createSpatialBuilding({
        propertyId: activePropertyId,
        name: newBuildingName.trim(),
        baseElevation: Number(newBuildingElev) || 0,
      });
      await loadScene(activePropertyId);
      toast.success(`Building "${newBuildingName}" created`);
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const applyFloorPreset = (preset: 'Underground' | 'Ground' | 'Top') => {
    if (preset === 'Underground') {
      setNewFloorName('Underground');
      setNewFloorLevelIdx(-1);
      setNewFloorElev(-3.2);
      setNewFloorCeiling(2.7);
    } else if (preset === 'Ground') {
      setNewFloorName('Ground');
      setNewFloorLevelIdx(0);
      setNewFloorElev(0);
      setNewFloorCeiling(3.0);
    } else {
      setNewFloorName('Top');
      setNewFloorLevelIdx(1);
      setNewFloorElev(3.2);
      setNewFloorCeiling(2.8);
    }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuildingId || !newFloorName.trim() || !activePropertyId) return;
    setIsBusy(true);
    setServerError(null);
    try {
      await createSpatialFloor({
        buildingId: Number(selectedBuildingId),
        name: newFloorName.trim(),
        levelIndex: Number(newFloorLevelIdx),
        elevation: Number(newFloorElev),
        defaultCeilingHeight: Number(newFloorCeiling) || 2.7,
      });
      await loadScene(activePropertyId);
      toast.success(`Floor "${newFloorName}" created`);
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleBindSection = async () => {
    if (!bindTargetFloorId || !bindSectionId || !activePropertyId) return;
    setIsBusy(true);
    setServerError(null);
    try {
      await bindFloorSection(Number(bindTargetFloorId), Number(bindSectionId));
      await loadScene(activePropertyId);
      toast.success('Existing section bound to floor');
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleBindDirectRoom = async () => {
    if (!bindTargetFloorId || !bindRoomId || !activePropertyId) return;
    const roomObj = visibleRooms.find((r) => r.dbId === Number(bindRoomId));
    const secId = roomObj ? resolveRoomSectionDbId(roomObj) : 0;
    const hasStrSection = Boolean(
      roomObj &&
        roomObj.section &&
        roomObj.section !== '0' &&
        roomObj.section.toLowerCase() !== 'none'
    );
    if (secId > 0 || hasStrSection) {
      const msg =
        'Room belongs to a Section (Room.SectionId is set). Bind via Section or unlink section first — a room cannot be bound directly to a floor and via a section simultaneously.';
      setServerError(msg);
      toast.error(msg);
      return;
    }
    setIsBusy(true);
    setServerError(null);
    try {
      await bindFloorRoom(Number(bindTargetFloorId), Number(bindRoomId), 0);
      await loadScene(activePropertyId);
      toast.success('Room bound directly to floor (sectionId = 0)');
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateExteriorOrScaffold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePropertyId || !extName.trim()) return;
    setIsBusy(true);
    setServerError(null);
    try {
      if (extKind === 'tankScaffold') {
        const payload: ExteriorOrStructurePayload = {
          type: 'scaffoldStructure',
          nodeKind: SpatialNodeKind.Structure,
          origin: [extX, extY, extZ],
          width: extW,
          depth: extD,
          height: extH,
          zoneKind: 'tankScaffold',
          propertyId: activePropertyId,
        };
        await createSpatialGeometry(activePropertyId, {
          kind: SpatialGeometryKind.Generic,
          name: extName.trim(),
          geometryJson: JSON.stringify(payload),
          height: extH,
          thickness: 0.08,
          parentKind: SpatialNodeKind.Structure,
        });
      } else {
        const hw = extW / 2;
        const hd = extD / 2;
        const payload: ExteriorOrStructurePayload = {
          type: 'exteriorBoundary',
          nodeKind: SpatialNodeKind.ExteriorArea,
          points: [
            [extX - hw, extY, extZ - hd],
            [extX + hw, extY, extZ - hd],
            [extX + hw, extY, extZ + hd],
            [extX - hw, extY, extZ + hd],
          ],
          zoneKind: extKind,
          propertyId: activePropertyId,
        };
        await createSpatialGeometry(activePropertyId, {
          kind: SpatialGeometryKind.Boundary,
          name: extName.trim(),
          geometryJson: JSON.stringify(payload),
          height: 0.05,
          thickness: 0.05,
          parentKind: SpatialNodeKind.ExteriorArea,
        });
      }
      await loadScene(activePropertyId);
      toast.success(`${extName} added to property scene`);
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  // --- Room Outline Save + Generate Structure (retaining sourceOutlineId) ---
  const handleSaveOutline = async ({
    name,
    floorId,
    roomId,
    height,
    thickness,
    wallMaterial,
    includeFloorSlab,
    includeCeilingSlab,
    payload,
    generateStructure,
  }: {
    name: string;
    floorId: number | null;
    roomId: number | null;
    height: number;
    thickness: number;
    wallMaterial: WallGeometryPayload['material'];
    includeFloorSlab: boolean;
    includeCeilingSlab: boolean;
    payload: RoomOutlineGeometryPayload;
    generateStructure: boolean;
  }) => {
    if (!activePropertyId) {
      toast.error('Create or select a Property first');
      return;
    }
    setIsBusy(true);
    setServerError(null);
    try {
      const locallyAdded: SpatialGeometryDto[] = [];
      const outlineSpaces = [
        ...(floorId ? [{ spaceKind: SpatialNodeKind.Floor, spaceId: floorId, relationship: 'Bounds' }] : []),
        ...(roomId ? [{ spaceKind: SpatialNodeKind.Room, spaceId: roomId, relationship: 'Bounds' }] : []),
      ];
      const savedOutline = await createSpatialGeometry(activePropertyId, {
        kind: SpatialGeometryKind.RoomOutline,
        name,
        geometryJson: JSON.stringify(payload),
        height,
        thickness: 0,
        materialCode: wallMaterial || 'drywall',
        floorId,
        roomId,
        points: payload.points.map((p, idx) => ({
          sequence: idx,
          x: p[0],
          y: p[1],
          z: p[2],
          pointKind: 'Vertex',
        })),
        spaces: outlineSpaces,
      });
      locallyAdded.push({
        ...savedOutline,
        id: savedOutline.id || Date.now(),
        kind: SpatialGeometryKind.RoomOutline,
        name,
        geometryJson: JSON.stringify(payload),
        height,
        thickness: 0,
        materialCode: wallMaterial || 'drywall',
        floorId,
        roomId,
      });

      if (generateStructure) {
        const sourceId = savedOutline.id || `outline-${Date.now()}`;
        const elev = payload.points[0]?.[1] ?? 0;

        // Generate independent WallSegments retaining sourceOutlineId & sourceSegmentIndex
        for (let i = 0; i < payload.points.length; i++) {
          const a = payload.points[i];
          const b = payload.points[(i + 1) % payload.points.length];
          const segMeta = payload.segments?.find((s) => s.index === i);
          const wallPayload: WallGeometryPayload = {
            type: 'wallSegment',
            points: [a, b],
            curveType: segMeta?.curveType || 'line',
            arcBulge: segMeta?.arcBulge,
            control1: segMeta?.control1,
            control2: segMeta?.control2,
            style: 'solid',
            material: wallMaterial || 'drywall',
            sourceOutlineId: sourceId,
            sourceSegmentIndex: i,
            floorIds: floorId ? [floorId] : undefined,
            spaceRefs: roomId ? [{ kind: SpatialNodeKind.Room, id: roomId }] : undefined,
            elevationY: elev,
          };
          const savedWallSeg = await createSpatialGeometry(activePropertyId, {
            kind: SpatialGeometryKind.WallSegment,
            name: `${name} - Wall ${i + 1}`,
            geometryJson: JSON.stringify(wallPayload),
            height,
            thickness,
            materialCode: wallMaterial || 'drywall',
            isGenerated: true,
            sourceOutlineGeometryId: savedOutline.id || null,
            floorId,
            roomId,
            sourceGeometryId: savedOutline.id || null,
            points: [
              { sequence: 0, x: a[0], y: a[1], z: a[2], pointKind: 'Vertex' },
              { sequence: 1, x: b[0], y: b[1], z: b[2], pointKind: 'Vertex' },
            ],
            spaces: outlineSpaces,
          });
          locallyAdded.push({
            ...savedWallSeg,
            id: savedWallSeg.id || Date.now() + i + 1,
            kind: SpatialGeometryKind.WallSegment,
            name: `${name} - Wall ${i + 1}`,
            geometryJson: JSON.stringify(wallPayload),
            height,
            thickness,
            materialCode: wallMaterial || 'drywall',
            floorId,
            roomId,
          });
        }

        if (includeFloorSlab) {
          const floorSlab: SlabGeometryPayload = {
            type: 'slab',
            points: payload.points,
            elevationY: elev,
            role: 'floor',
            servesFloorIds: floorId ? [floorId] : undefined,
            sourceOutlineId: sourceId,
            roomId: roomId ?? undefined,
            floorId: floorId ?? undefined,
          };
          const savedFloorSlab = await createSpatialGeometry(activePropertyId, {
            kind: SpatialGeometryKind.Slab,
            name: `${name} - Floor Slab`,
            geometryJson: JSON.stringify(floorSlab),
            height: 0.18,
            thickness: 0.18,
            materialCode: 'concrete',
            isGenerated: true,
            sourceOutlineGeometryId: savedOutline.id || null,
            floorId,
            roomId,
            sourceGeometryId: savedOutline.id || null,
            points: payload.points.map((p, idx) => ({
              sequence: idx,
              x: p[0],
              y: p[1],
              z: p[2],
              pointKind: 'Vertex',
            })),
            spaces: outlineSpaces,
          });
          locallyAdded.push({
            ...savedFloorSlab,
            id: savedFloorSlab.id || Date.now() + 100,
            kind: SpatialGeometryKind.Slab,
            name: `${name} - Floor Slab`,
            geometryJson: JSON.stringify(floorSlab),
            height: 0.18,
            thickness: 0.18,
            floorId,
            roomId,
          });
        }

        if (includeCeilingSlab) {
          const ceilSlab: SlabGeometryPayload = {
            type: 'slab',
            points: payload.points,
            elevationY: elev + height,
            role: 'ceiling',
            servesFloorIds: floorId ? [floorId] : undefined,
            sourceOutlineId: sourceId,
            roomId: roomId ?? undefined,
            floorId: floorId ?? undefined,
          };
          const savedCeilSlab = await createSpatialGeometry(activePropertyId, {
            kind: SpatialGeometryKind.Slab,
            name: `${name} - Ceiling Slab`,
            geometryJson: JSON.stringify(ceilSlab),
            height: 0.16,
            thickness: 0.16,
            materialCode: 'concrete',
            isGenerated: true,
            sourceOutlineGeometryId: savedOutline.id || null,
            floorId,
            roomId,
            sourceGeometryId: savedOutline.id || null,
            points: payload.points.map((p, idx) => ({
              sequence: idx,
              x: p[0],
              y: p[1] + height,
              z: p[2],
              pointKind: 'Vertex',
            })),
            spaces: outlineSpaces,
          });
          locallyAdded.push({
            ...savedCeilSlab,
            id: savedCeilSlab.id || Date.now() + 101,
            kind: SpatialGeometryKind.Slab,
            name: `${name} - Ceiling Slab`,
            geometryJson: JSON.stringify(ceilSlab),
            height: 0.16,
            thickness: 0.16,
            floorId,
            roomId,
          });
        }
      }

      await loadScene(activePropertyId);
      setSceneData((prev) => {
        if (!prev) return prev;
        const missing = locallyAdded.filter(
          (item) => !prev.geometries.some((g) => g.id === item.id)
        );
        if (missing.length === 0) return prev;
        return { ...prev, geometries: [...prev.geometries, ...missing] };
      });
      toast.success(
        generateStructure
          ? `Outline "${name}" + Walls/Slab saved (linked via sourceOutlineId)`
          : `Room outline "${name}" saved`
      );
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  // --- Architecture Handlers ---
  const handleCreateSharedWall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePropertyId || !wallName.trim()) return;
    const fId = wallFloorId ? Number(wallFloorId) : null;
    const elev = fId ? floors.find((f) => f.id === fId)?.elevation ?? 0 : 0;

    setIsBusy(true);
    setServerError(null);
    try {
      const payload: WallGeometryPayload = {
        type: 'wall',
        points: [
          [wallX1, elev, wallZ1],
          [wallX2, elev, wallZ2],
        ],
        curveType: wallCurve,
        arcBulge: wallCurve === 'arc' ? wallArcBulge : undefined,
        style: wallStyle,
        material: wallMat,
        sharedWallKey: `shared-wall-${Date.now()}`,
        spaceRefs: wallSpaceRefs.map((rid) => ({
          kind: SpatialNodeKind.Room,
          id: rid,
          name: visibleRooms.find((r) => getRawEntityId(r.id) === rid)?.name,
        })),
        floorIds: fId ? [fId] : undefined,
        openings: wallOpenings,
        elevationY: elev,
      };

      const kind =
        wallStyle === 'glassPanel' ? SpatialGeometryKind.GlassPanel : SpatialGeometryKind.Wall;
      const saved = await createSpatialGeometry(activePropertyId, {
        kind,
        name: wallName.trim(),
        geometryJson: JSON.stringify(payload),
        height: wallHeight,
        thickness: wallThickness,
        materialCode: wallMat || 'concrete',
        floorId: fId,
        points: [
          { sequence: 0, x: wallX1, y: elev, z: wallZ1, pointKind: 'Vertex' },
          { sequence: 1, x: wallX2, y: elev, z: wallZ2, pointKind: 'Vertex' },
        ],
        spaces: [
          ...(fId ? [{ spaceKind: SpatialNodeKind.Floor, spaceId: fId, relationship: 'Bounds' }] : []),
          ...wallSpaceRefs.map((rid) => ({
            spaceKind: SpatialNodeKind.Room,
            spaceId: rid,
            relationship: 'Bounds',
          })),
        ],
      });
      await loadScene(activePropertyId);
      setSceneData((prev) => {
        if (!prev) return prev;
        if (saved.id && prev.geometries.some((g) => g.id === saved.id)) return prev;
        return {
          ...prev,
          geometries: [
            ...prev.geometries,
            {
              ...saved,
              id: saved.id || Date.now(),
              kind,
              name: wallName.trim(),
              geometryJson: JSON.stringify(payload),
              height: wallHeight,
              thickness: wallThickness,
              floorId: fId,
            },
          ],
        };
      });
      toast.success(`Shared physical wall "${wallName}" saved without duplication`);
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateSlabOrVoid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePropertyId || !slabName.trim()) return;
    const fId = slabFloorId ? Number(slabFloorId) : null;
    const elev = fId ? floors.find((f) => f.id === fId)?.elevation ?? 0 : 0;
    const hw = slabW / 2;
    const hd = slabD / 2;
    const pts: [number, number, number][] = [
      [slabCX - hw, elev, slabCZ - hd],
      [slabCX + hw, elev, slabCZ - hd],
      [slabCX + hw, elev, slabCZ + hd],
      [slabCX - hw, elev, slabCZ + hd],
    ];

    setIsBusy(true);
    setServerError(null);
    try {
      const payload: SlabGeometryPayload = {
        type: slabMode,
        points: pts,
        elevationY: elev,
        role: slabMode === 'void' ? 'voidCutout' : slabRole,
        servesFloorIds: slabSharedFloors.length > 0 ? slabSharedFloors : fId ? [fId] : undefined,
        floorId: fId ?? undefined,
      };
      const slabKind = slabMode === 'void' ? SpatialGeometryKind.Void : SpatialGeometryKind.Slab;
      const savedSlab = await createSpatialGeometry(activePropertyId, {
        kind: slabKind,
        name: slabName.trim(),
        geometryJson: JSON.stringify(payload),
        height: slabThickness,
        thickness: slabThickness,
        materialCode: 'concrete',
        floorId: fId,
        points: pts.map((p, idx) => ({
          sequence: idx,
          x: p[0],
          y: p[1],
          z: p[2],
          pointKind: 'Vertex',
        })),
        spaces: fId
          ? [{ spaceKind: SpatialNodeKind.Floor, spaceId: fId, relationship: 'Bounds' }]
          : [],
      });
      await loadScene(activePropertyId);
      setSceneData((prev) => {
        if (!prev) return prev;
        if (savedSlab.id && prev.geometries.some((g) => g.id === savedSlab.id)) return prev;
        return {
          ...prev,
          geometries: [
            ...prev.geometries,
            {
              ...savedSlab,
              id: savedSlab.id || Date.now(),
              kind: slabKind,
              name: slabName.trim(),
              geometryJson: JSON.stringify(payload),
              height: slabThickness,
              thickness: slabThickness,
              floorId: fId,
            },
          ],
        };
      });
      toast.success(slabMode === 'void' ? 'Slab void cutout saved' : 'Shared physical slab saved');
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateRoof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePropertyId || !roofName.trim()) return;
    const hw = roofW / 2;
    const hd = roofD / 2;
    const payload: RoofGeometryPayload = {
      type: 'roof',
      points: [
        [-hw, roofElev, -hd],
        [hw, roofElev, -hd],
        [hw, roofElev, hd],
        [-hw, roofElev, hd],
      ],
      buildingId: roofBuildingId ? Number(roofBuildingId) : undefined,
      elevationY: roofElev,
      roofStyle,
      slopeDeg: roofSlope,
      overhang: roofOverhang,
      parapetHeight: roofParapetH,
      parapetThickness: 0.16,
      sectionLabel: roofName.trim(),
    };
    setIsBusy(true);
    setServerError(null);
    try {
      await createSpatialGeometry(activePropertyId, {
        kind: SpatialGeometryKind.RoofSurface,
        name: roofName.trim(),
        geometryJson: JSON.stringify(payload),
        height: 0.2,
        thickness: 0.2,
        buildingId: roofBuildingId ? Number(roofBuildingId) : null,
      });
      await loadScene(activePropertyId);
      toast.success(`Roof section "${roofName}" saved`);
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateStairs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePropertyId || !stairName.trim()) return;
    const fId = stairFloorId ? Number(stairFloorId) : null;
    const elev = fId ? floors.find((f) => f.id === fId)?.elevation ?? 0 : 0;

    setIsBusy(true);
    setServerError(null);
    try {
      const groupId = `stair-${Date.now()}`;
      if (stairLayout === 'straight') {
        const flight: StairGeometryPayload = {
          type: 'stairFlight',
          origin: [stairOrigX, elev, stairOrigZ],
          rotationYDeg: 0,
          width: stairWidth,
          runLength: stairRun,
          riseHeight: stairRise,
          layout: 'straight',
          stairGroupId: groupId,
          floorId: fId ?? undefined,
        };
        await createSpatialGeometry(activePropertyId, {
          kind: SpatialGeometryKind.StairFlight,
          name: `${stairName} - Flight 1`,
          geometryJson: JSON.stringify(flight),
          height: stairRise,
          thickness: stairWidth,
          floorId: fId,
        });
      } else {
        // U-Turn: Flight 1 forward (+Z), Landing at end, Flight 2 reversing (-Z) beside Flight 1
        const halfRise = stairRise * 0.5;
        const landingLen = Math.max(1.0, stairWidth);
        const flight1: StairGeometryPayload = {
          type: 'stairFlight',
          origin: [stairOrigX, elev, stairOrigZ],
          rotationYDeg: 0,
          width: stairWidth,
          runLength: stairRun,
          riseHeight: halfRise,
          flightIndex: 1,
          layout: 'uturn',
          stairGroupId: groupId,
          floorId: fId ?? undefined,
        };
        const landing: StairGeometryPayload = {
          type: 'stairLanding',
          origin: [stairOrigX + stairWidth * 0.5 + 0.05, elev + halfRise, stairOrigZ + stairRun],
          rotationYDeg: 0,
          width: stairWidth * 2 + 0.2,
          runLength: landingLen,
          riseHeight: 0.18,
          stairGroupId: groupId,
          floorId: fId ?? undefined,
        };
        const flight2: StairGeometryPayload = {
          type: 'stairFlight',
          origin: [stairOrigX + stairWidth + 0.15, elev + halfRise, stairOrigZ + stairRun],
          rotationYDeg: 180,
          width: stairWidth,
          runLength: stairRun,
          riseHeight: halfRise,
          flightIndex: 2,
          layout: 'uturn',
          stairGroupId: groupId,
          floorId: fId ?? undefined,
        };
        await createSpatialGeometry(activePropertyId, {
          kind: SpatialGeometryKind.StairFlight,
          name: `${stairName} - Flight 1`,
          geometryJson: JSON.stringify(flight1),
          height: halfRise,
          thickness: stairWidth,
          floorId: fId,
        });
        await createSpatialGeometry(activePropertyId, {
          kind: SpatialGeometryKind.StairLanding,
          name: `${stairName} - Landing`,
          geometryJson: JSON.stringify(landing),
          height: 0.18,
          thickness: 0.18,
          floorId: fId,
        });
        await createSpatialGeometry(activePropertyId, {
          kind: SpatialGeometryKind.StairFlight,
          name: `${stairName} - Flight 2 (Reversed)`,
          geometryJson: JSON.stringify(flight2),
          height: halfRise,
          thickness: stairWidth,
          floorId: fId,
        });
      }

      if (stairIncludeVoid && fId) {
        const voidW = stairLayout === 'uturn' ? stairWidth * 2 + 0.3 : stairWidth + 0.2;
        const voidL = stairRun + (stairLayout === 'uturn' ? stairWidth + 0.2 : 0.2);
        const vx = stairOrigX - stairWidth * 0.5;
        await createSpatialGeometry(activePropertyId, {
          kind: SpatialGeometryKind.Void,
          name: `${stairName} - Stairwell Void`,
          geometryJson: JSON.stringify({
            type: 'void',
            role: 'voidCutout',
            points: [
              [vx, elev, stairOrigZ],
              [vx + voidW, elev, stairOrigZ],
              [vx + voidW, elev, stairOrigZ + voidL],
              [vx, elev, stairOrigZ + voidL],
            ],
          }),
          height: 0.2,
          thickness: 0.2,
          floorId: fId,
        });
      }

      await loadScene(activePropertyId);
      toast.success(`Staircase "${stairName}" created`);
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePropertyId || !poolRoomId) {
      toast.error('Indoor pool must belong to an existing visible Room');
      return;
    }
    const fId = poolFloorId ? Number(poolFloorId) : null;
    const elev = fId ? floors.find((f) => f.id === fId)?.elevation ?? 0 : 0;

    setIsBusy(true);
    setServerError(null);
    try {
      const payload: PoolGeometryPayload = {
        type: 'pool',
        roomId: Number(poolRoomId),
        floorId: fId ?? undefined,
        origin: [0, elev, 0],
        length: poolL,
        width: poolW,
        depth: poolDepth,
        deckMargin: poolDeck,
        waterLevelOffset: 0.14,
        indoor: true,
      };
      await createSpatialGeometry(activePropertyId, {
        kind: SpatialGeometryKind.Pool,
        name: poolName.trim() || 'Indoor Swimming Pool',
        geometryJson: JSON.stringify(payload),
        height: poolDepth,
        thickness: poolW,
        floorId: fId,
        roomId: Number(poolRoomId),
      });
      await loadScene(activePropertyId);
      toast.success('Indoor swimming pool saved to room');
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  // --- Device Placement & Light Fixture Groups ---
  const handlePlaceDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePropertyId) return;

    if (fixtureMode && targetKind === SpatialTargetKind.Light) {
      if (fixtureLightIds.length === 0) {
        toast.error('Select at least 1 existing Light device for this Fixture Group');
        return;
      }
      setIsBusy(true);
      setServerError(null);
      try {
        const groupId = `lfg-${Date.now()}`;
        const count = fixtureLightIds.length;
        const cols =
          fixtureArrangement === 'horizontalStrip'
            ? count
            : fixtureArrangement === 'verticalStrip'
            ? 1
            : fixtureArrangement === 'individual'
            ? 1
            : Math.ceil(Math.sqrt(count));

        for (let i = 0; i < count; i++) {
          const lightId = fixtureLightIds[i];
          const col = i % cols;
          const row = Math.floor(i / cols);
          const offX =
            fixtureArrangement === 'verticalStrip'
              ? 0
              : (col - (cols - 1) / 2) * fixtureSpacing;
          const offY =
            fixtureArrangement === 'verticalStrip'
              ? row * -0.45
              : 0;
          const offZ =
            fixtureArrangement === 'verticalStrip' || fixtureArrangement === 'horizontalStrip'
              ? 0
              : (row - (Math.ceil(count / cols) - 1) / 2) * fixtureSpacing;

          const meta: LightFixtureGroupMeta = {
            groupId,
            groupName: fixtureGroupName.trim() || 'Fixture Group',
            arrangement: fixtureArrangement,
            mountingStyle: fixtureMounting,
            spacingMeters: fixtureSpacing,
            columns: cols,
            rows: Math.ceil(count / cols),
            memberIndex: i,
            memberCount: count,
            memberLightIds: fixtureLightIds,
          };

          await upsertSpatialPlacement({
            id: 0,
            version: 0,
            propertyId: activePropertyId,
            targetKind: SpatialTargetKind.Light,
            targetId: lightId,
            parentKind,
            parentId: Number(parentId) || activePropertyId,
            attachmentKind:
              fixtureMounting === 'pendant'
                ? SpatialAttachmentKind.Suspended
                : SpatialAttachmentKind.CeilingMounted,
            positionX: Math.round((placeX + offX) * 1000) / 1000,
            positionY: Math.round((placeY + offY) * 1000) / 1000,
            positionZ: Math.round((placeZ + offZ) * 1000) / 1000,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            rotationW: 1,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            width: 0.22,
            height: 0.16,
            depth: 0.22,
            assetCode: `fixture-${fixtureMounting}`,
            anchorJson: JSON.stringify(meta),
          });
        }
        await loadScene(activePropertyId);
        toast.success(`Fixture group "${fixtureGroupName}" placed (${count} independent Light IDs)`);
      } catch (err: any) {
        if (err instanceof SpatialConflictError) setConflictMessage(err.message);
        else setServerError(extractServerErrorMessage(err));
      } finally {
        setIsBusy(false);
      }
      return;
    }

    if (!selectedDeviceId) {
      toast.error('Select an existing smart-home device first');
      return;
    }
    const devObj = visibleDevices.find((d) => getRawEntityId(d.id) === Number(selectedDeviceId) && d.id.startsWith(
      targetKind === 1 ? 'door' : targetKind === 2 ? 'window' : targetKind === 3 ? 'light' : targetKind === 4 ? 'camera' : targetKind === 5 ? 'appliance' : targetKind === 6 ? 'external' : 'utility'
    ));

    // Rule: Irrigation is allowed anywhere inside property boundary EXCEPT directly on the Property root
    if (
      targetKind === SpatialTargetKind.Utility &&
      devObj?.utilityType === UtilityType.Irrigation &&
      parentKind === SpatialNodeKind.Property
    ) {
      const msg =
        'Irrigation utility cannot be attached directly to the Property root. Place it inside an Exterior Area, Floor, Section, Room, or Structure.';
      setServerError(msg);
      toast.error(msg);
      return;
    }

    setIsBusy(true);
    setServerError(null);
    try {
      await upsertSpatialPlacement({
        id: 0,
        version: 0,
        propertyId: activePropertyId,
        targetKind,
        targetId: Number(selectedDeviceId),
        parentKind,
        parentId: Number(parentId) || activePropertyId,
        attachmentKind,
        positionX: placeX,
        positionY: placeY,
        positionZ: placeZ,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        rotationW: 1,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        width: targetKind === SpatialTargetKind.Door ? 0.9 : targetKind === SpatialTargetKind.Utility ? 0.85 : 0.3,
        height: targetKind === SpatialTargetKind.Door ? 2.1 : targetKind === SpatialTargetKind.Utility ? 1.1 : 0.3,
        depth: targetKind === SpatialTargetKind.Door ? 0.14 : targetKind === SpatialTargetKind.Utility ? 0.7 : 0.25,
        assetCode: placeAssetCode || 'standard',
        anchorJson: '{}',
      });
      await loadScene(activePropertyId);
      toast.success('Device placed in 3D scene');
    } catch (err: any) {
      if (err instanceof SpatialConflictError) setConflictMessage(err.message);
      else setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeletePlacement = async (placement: SpatialPlacementDto) => {
    if (!activePropertyId) return;
    setIsBusy(true);
    setServerError(null);
    try {
      await deleteSpatialPlacement(placement.id);
      setSelected(null);
      await loadScene(activePropertyId);
      toast.success('Spatial placement deleted (smart-home device preserved)');
    } catch (err: any) {
      if (err instanceof SpatialConflictError) setConflictMessage(err.message);
      else setServerError(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  // --- Interactive 3D Helpers & Scene Auto-Builder ---
  const activeFloor = React.useMemo(
    () => floors.find((f) => f.id === activeFloorId) || floors[0] || null,
    [floors, activeFloorId]
  );
  const activeFloorElevation = activeFloor?.elevation ?? 0;

  const floorMap = React.useMemo(() => {
    const m = new Map<number, SpatialFloorDto>();
    floors.forEach((f) => m.set(f.id, f));
    return m;
  }, [floors]);

  // Sync Room/Section dimension editor when selecting a geometry or changing dimSpaceKind/dimSpaceId
  React.useEffect(() => {
    if (!selected?.geometry) return;
    const g = selected.geometry;
    if (g.roomId && visibleRoomIds.has(g.roomId)) {
      setDimSpaceKind('room');
      setDimSpaceId(g.roomId);
    } else if (g.sectionId && visibleSectionIds.has(g.sectionId)) {
      setDimSpaceKind('section');
      setDimSpaceId(g.sectionId);
    }
    const b = computeGeometryBounds(g, floorMap);
    if (b) {
      setDimWidth(Math.round(b.width * 100) / 100);
      setDimDepth(Math.round(b.depth * 100) / 100);
      setDimCenterX(Math.round(b.centerX * 100) / 100);
      setDimCenterZ(Math.round(b.centerZ * 100) / 100);
      if (g.height > 0) setDimHeight(g.height);
      if (g.thickness > 0) setDimThickness(g.thickness);
      if (g.materialCode) {
        setDimMaterial(g.materialCode as NonNullable<WallGeometryPayload['material']>);
      }
    }
  }, [selected, floorMap, visibleRoomIds, visibleSectionIds]);

  const syncDimensionsFromSpace = React.useCallback(
    (kind: 'room' | 'section', id: number) => {
      if (!id) return;
      const matching = geometries.filter((g) =>
        kind === 'room' ? g.roomId === id : g.sectionId === id
      );
      const pref =
        matching.find((g) => g.kind === SpatialGeometryKind.RoomOutline) ||
        matching.find((g) => g.kind === SpatialGeometryKind.Slab) ||
        matching[0];
      if (!pref) return;
      const b = computeGeometryBounds(pref, floorMap);
      if (b) {
        setDimWidth(Math.round(b.width * 100) / 100);
        setDimDepth(Math.round(b.depth * 100) / 100);
        setDimCenterX(Math.round(b.centerX * 100) / 100);
        setDimCenterZ(Math.round(b.centerZ * 100) / 100);
        if (pref.height > 0) setDimHeight(pref.height);
      }
    },
    [geometries, floorMap]
  );

  // Helper: Persist a geometry update (replacing existing entry in local scene state to prevent overlapping duplicates)
  const saveUpdatedGeometry = React.useCallback(
    async (
      orig: SpatialGeometryDto,
      nextName: string,
      nextJsonObj: any,
      nextPoints: [number, number, number][],
      height: number,
      thickness: number,
      material: string | null | undefined,
      toastLabel?: string
    ) => {
      if (!activePropertyId) return;
      const nextJsonStr = JSON.stringify(nextJsonObj);
      const optimisticallyUpdated: SpatialGeometryDto = {
        ...orig,
        name: nextName,
        geometryJson: nextJsonStr,
        height,
        thickness,
        materialCode: material ?? orig.materialCode,
        points: nextPoints.map((pt, idx) => ({
          sequence: idx,
          x: pt[0],
          y: pt[1],
          z: pt[2],
          pointKind: 'Vertex',
        })),
      };

      // Update local state immediately so Three.js rebuilds cleanly without duplicate overlapping meshes
      setSceneData((prev) =>
        prev
          ? {
              ...prev,
              geometries: prev.geometries.map((g) =>
                g.id === orig.id ? optimisticallyUpdated : g
              ),
            }
          : prev
      );
      if (selected?.key === `geometry-${orig.id}`) {
        setSelected({
          key: `geometry-${orig.id}`,
          entityType: 'geometry',
          id: orig.id,
          name: nextName,
          geometry: optimisticallyUpdated,
        });
      }

      try {
        const saved = await createSpatialGeometry(activePropertyId, {
          kind: orig.kind,
          name: nextName,
          geometryJson: nextJsonStr,
          height,
          thickness,
          materialCode: material || orig.materialCode || 'concrete',
          isGenerated: orig.isGenerated,
          sourceOutlineGeometryId: orig.sourceOutlineGeometryId ?? orig.sourceGeometryId ?? null,
          hostGeometryId: orig.hostGeometryId ?? null,
          floorId: orig.floorId ?? null,
          buildingId: orig.buildingId ?? null,
          roomId: orig.roomId ?? null,
          sectionId: orig.sectionId ?? null,
          parentKind: orig.parentKind ?? null,
          parentId: orig.parentId ?? null,
          sourceGeometryId: orig.sourceGeometryId ?? orig.sourceOutlineGeometryId ?? null,
          points: nextPoints.map((pt, idx) => ({
            sequence: idx,
            x: pt[0],
            y: pt[1],
            z: pt[2],
            pointKind: 'Vertex',
          })),
          spaces:
            orig.spaces && orig.spaces.length > 0
              ? orig.spaces
              : [
                  ...(orig.floorId
                    ? [{ spaceKind: SpatialNodeKind.Floor, spaceId: orig.floorId, relationship: 'Bounds' }]
                    : []),
                  ...(orig.sectionId
                    ? [{ spaceKind: SpatialNodeKind.Section, spaceId: orig.sectionId, relationship: 'Bounds' }]
                    : []),
                  ...(orig.roomId
                    ? [{ spaceKind: SpatialNodeKind.Room, spaceId: orig.roomId, relationship: 'Bounds' }]
                    : []),
                ],
          version: (orig.version ?? 1) + 1,
        });

        setSceneData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            geometries: prev.geometries.map((g) =>
              g.id === orig.id
                ? {
                    ...optimisticallyUpdated,
                    id: saved.id || orig.id,
                    version: saved.version ?? optimisticallyUpdated.version,
                  }
                : g
            ),
          };
        });
        if (saved.id && selected?.key === `geometry-${orig.id}`) {
          setSelected({
            key: `geometry-${saved.id}`,
            entityType: 'geometry',
            id: saved.id,
            name: nextName,
            geometry: { ...optimisticallyUpdated, id: saved.id },
          });
        }
        if (toastLabel) toast.success(toastLabel);
      } catch (err: any) {
        setServerError(extractServerErrorMessage(err));
        toast.error(extractServerErrorMessage(err));
      }
    },
    [activePropertyId, selected]
  );

  // Create a complete 4-wall + outline + slab space box
  const createRoomOrSectionBoxOnFloor = React.useCallback(
    async ({
      name,
      minX,
      maxX,
      minZ,
      maxZ,
      elevationY,
      height,
      thickness,
      material,
      floorId,
      roomId,
      sectionId,
    }: {
      name: string;
      minX: number;
      maxX: number;
      minZ: number;
      maxZ: number;
      elevationY: number;
      height: number;
      thickness: number;
      material: WallGeometryPayload['material'];
      floorId: number | null;
      roomId: number | null;
      sectionId: number | null;
    }) => {
      if (!activePropertyId) return;
      const pts: [number, number, number][] = [
        [minX, elevationY, minZ],
        [maxX, elevationY, minZ],
        [maxX, elevationY, maxZ],
        [minX, elevationY, maxZ],
      ];
      const spaces = [
        ...(floorId ? [{ spaceKind: SpatialNodeKind.Floor, spaceId: floorId, relationship: 'Bounds' }] : []),
        ...(sectionId ? [{ spaceKind: SpatialNodeKind.Section, spaceId: sectionId, relationship: 'Bounds' }] : []),
        ...(roomId ? [{ spaceKind: SpatialNodeKind.Room, spaceId: roomId, relationship: 'Bounds' }] : []),
      ];

      const outlinePayload: RoomOutlineGeometryPayload = {
        type: 'polygon',
        points: pts,
        floorId: floorId ?? undefined,
        roomId: roomId ?? undefined,
        sectionId: sectionId ?? undefined,
      };
      const savedOutline = await createSpatialGeometry(activePropertyId, {
        kind: SpatialGeometryKind.RoomOutline,
        name: `${name} Outline`,
        geometryJson: JSON.stringify(outlinePayload),
        height,
        thickness: 0,
        materialCode: material || 'concrete',
        floorId,
        roomId,
        sectionId,
        points: pts.map((p, idx) => ({ sequence: idx, x: p[0], y: p[1], z: p[2], pointKind: 'Vertex' })),
        spaces,
      });

      const sourceOutlineId = savedOutline.id || undefined;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const wallPayload: WallGeometryPayload = {
          type: 'wallSegment',
          points: [a, b],
          style: 'solid',
          material: material || 'concrete',
          sourceOutlineId,
          sourceSegmentIndex: i,
          floorIds: floorId ? [floorId] : undefined,
          spaceRefs: [
            ...(roomId ? [{ kind: SpatialNodeKind.Room, id: roomId, name }] : []),
            ...(sectionId ? [{ kind: SpatialNodeKind.Section, id: sectionId, name }] : []),
          ],
          elevationY,
        };
        await createSpatialGeometry(activePropertyId, {
          kind: SpatialGeometryKind.WallSegment,
          name: `${name} - Wall ${i + 1}`,
          geometryJson: JSON.stringify(wallPayload),
          height,
          thickness,
          materialCode: material || 'concrete',
          isGenerated: true,
          sourceOutlineGeometryId: sourceOutlineId ?? null,
          sourceGeometryId: sourceOutlineId ?? null,
          floorId,
          roomId,
          sectionId,
          points: [
            { sequence: 0, x: a[0], y: a[1], z: a[2], pointKind: 'Vertex' },
            { sequence: 1, x: b[0], y: b[1], z: b[2], pointKind: 'Vertex' },
          ],
          spaces,
        });
      }

      const slabPayload: SlabGeometryPayload = {
        type: 'slab',
        points: pts,
        elevationY,
        role: 'floor',
        servesFloorIds: floorId ? [floorId] : undefined,
        sourceOutlineId,
        roomId: roomId ?? undefined,
        floorId: floorId ?? undefined,
      };
      await createSpatialGeometry(activePropertyId, {
        kind: SpatialGeometryKind.Slab,
        name: `${name} - Floor Slab`,
        geometryJson: JSON.stringify(slabPayload),
        height: 0.16,
        thickness: 0.16,
        materialCode: 'concrete',
        isGenerated: true,
        sourceOutlineGeometryId: sourceOutlineId ?? null,
        sourceGeometryId: sourceOutlineId ?? null,
        floorId,
        roomId,
        sectionId,
        points: pts.map((p, idx) => ({ sequence: idx, x: p[0], y: p[1], z: p[2], pointKind: 'Vertex' })),
        spaces,
      });
    },
    [activePropertyId]
  );

  // 1-Click Build 3D Scene from bound sections & rooms (never fabricates hidden spaces)
  const handleGenerateSceneFromHierarchy = async () => {
    if (!activePropertyId) {
      toast.error('Select or create a Property first');
      return;
    }

    setIsBusy(true);
    setServerError(null);
    try {
      let targetFloor = activeFloor;
      let targetBuildingId = selectedBuildingId || buildings[0]?.id || 0;

      // Ensure at least one Building + Floor exists on the backend if starting from blank property
      if (!targetBuildingId) {
        const b = await createSpatialBuilding({
          propertyId: activePropertyId,
          name: newBuildingName.trim() || 'Main Residence',
          baseElevation: 0,
        });
        targetBuildingId = b.id;
      }
      if (!targetFloor && targetBuildingId) {
        targetFloor = await createSpatialFloor({
          buildingId: targetBuildingId,
          name: 'Ground',
          levelIndex: 0,
          elevation: 0,
          defaultCeilingHeight: 2.9,
        });
      }

      const fId = targetFloor?.id ?? null;
      const elev = targetFloor?.elevation ?? 0;
      const ceilH = targetFloor?.defaultCeilingHeight ?? 2.9;

      // Determine bound sections & rooms for this floor, or fallback to visible rooms (non-hidden)
      const boundSecIds = new Set<number>(
        (sceneData?.sectionBindings || [])
          .filter((b) => (!fId || b.floorId === fId) && visibleSectionIds.has(b.sectionId))
          .map((b) => b.sectionId)
      );
      const boundRoomIds = new Set<number>(
        (sceneData?.roomBindings || [])
          .filter((b) => (!fId || b.floorId === fId) && visibleRoomIds.has(b.roomId))
          .map((b) => b.roomId)
      );

      // Rooms attached to bound sections + direct bound rooms
      const targetRooms = visibleRooms.filter((r) => {
        const secId = resolveRoomSectionDbId(r);
        if (boundRoomIds.has(r.dbId)) return true;
        if (secId > 0 && boundSecIds.has(secId)) return true;
        return false;
      });

      const targetSections = visibleSections.filter((s) => boundSecIds.has(s.dbId));
      const roomsToBuild =
        targetRooms.length > 0
          ? targetRooms
          : targetSections.length === 0
          ? visibleRooms
          : [];

      let createdCount = 0;

      // Build Section envelopes for bound sections that don't yet have geometries
      const colsSec = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, targetSections.length))));
      for (let idx = 0; idx < targetSections.length; idx++) {
        const sec = targetSections[idx];
        const alreadyBuilt = geometries.some((g) => g.sectionId === sec.dbId);
        if (alreadyBuilt) continue;

        const col = idx % colsSec;
        const row = Math.floor(idx / colsSec);
        const cx = (col - (colsSec - 1) * 0.5) * 6.5;
        const cz = (row - (Math.ceil(targetSections.length / colsSec) - 1) * 0.5) * 5.5;
        await createRoomOrSectionBoxOnFloor({
          name: sec.name,
          minX: cx - 3.0,
          maxX: cx + 3.0,
          minZ: cz - 2.5,
          maxZ: cz + 2.5,
          elevationY: elev,
          height: ceilH,
          thickness: 0.2,
          material: 'concrete',
          floorId: fId,
          roomId: null,
          sectionId: sec.dbId,
        });
        createdCount++;
      }

      // Build Rooms that don't yet have geometries
      const colsRoom = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, roomsToBuild.length))));
      for (let idx = 0; idx < roomsToBuild.length; idx++) {
        const room = roomsToBuild[idx];
        const alreadyBuilt = geometries.some((g) => g.roomId === room.dbId);
        if (alreadyBuilt) continue;

        const secId = resolveRoomSectionDbId(room);
        const col = idx % colsRoom;
        const row = Math.floor(idx / colsRoom);
        const cx = (col - (colsRoom - 1) * 0.5) * 4.5;
        const cz = (row - (Math.ceil(roomsToBuild.length / colsRoom) - 1) * 0.5) * 4.2 + (targetSections.length > 0 ? 0 : 0);

        await createRoomOrSectionBoxOnFloor({
          name: room.name,
          minX: cx - 2.0,
          maxX: cx + 2.0,
          minZ: cz - 1.8,
          maxZ: cz + 1.8,
          elevationY: elev,
          height: ceilH,
          thickness: 0.16,
          material: 'drywall',
          floorId: fId,
          roomId: room.dbId,
          sectionId: secId > 0 ? secId : null,
        });
        createdCount++;
      }

      // If still no rooms or sections exist at all, build a clean 6m × 5m Floor Starter Pad so user can draw walls immediately
      if (createdCount === 0 && geometries.length === 0) {
        await createRoomOrSectionBoxOnFloor({
          name: `${targetFloor?.name || 'Ground'} Main Space`,
          minX: -3,
          maxX: 3,
          minZ: -2.5,
          maxZ: 2.5,
          elevationY: elev,
          height: ceilH,
          thickness: 0.2,
          material: 'concrete',
          floorId: fId,
          roomId: null,
          sectionId: null,
        });
        createdCount++;
      }

      await loadScene(activePropertyId);
      setResetCameraNonce((n) => n + 1);
      toast.success(
        createdCount > 0
          ? `Generated 3D scene structure for ${createdCount} bound space(s)`
          : 'All bound spaces already have 3D geometry'
      );
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
      toast.error(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  // Pointer Draw Wall complete handler from SpatialViewport
  const handleDrawWallComplete = async (
    start: [number, number, number],
    end: [number, number, number]
  ) => {
    if (!activePropertyId) {
      toast.error('Select or create a Property first');
      return;
    }
    const fId = activeFloor?.id ?? null;
    const len = Math.hypot(end[0] - start[0], end[2] - start[2]);
    if (len < 0.2) return;

    const roomId = dimSpaceKind === 'room' && dimSpaceId ? Number(dimSpaceId) : null;
    const sectionId = dimSpaceKind === 'section' && dimSpaceId ? Number(dimSpaceId) : null;

    setIsBusy(true);
    setServerError(null);
    try {
      const payload: WallGeometryPayload = {
        type: 'wall',
        points: [start, end],
        style: wallStyle || 'solid',
        material: wallMat || 'concrete',
        floorIds: fId ? [fId] : undefined,
        spaceRefs: [
          ...(roomId ? [{ kind: SpatialNodeKind.Room, id: roomId }] : []),
          ...(sectionId ? [{ kind: SpatialNodeKind.Section, id: sectionId }] : []),
        ],
        elevationY: start[1],
      };
      const kind =
        wallStyle === 'glassPanel' ? SpatialGeometryKind.GlassPanel : SpatialGeometryKind.Wall;
      const wallNameStr = `Wall ${len.toFixed(1)}m`;
      const saved = await createSpatialGeometry(activePropertyId, {
        kind,
        name: wallNameStr,
        geometryJson: JSON.stringify(payload),
        height: wallHeight || activeFloor?.defaultCeilingHeight || 2.8,
        thickness: wallThickness || 0.18,
        materialCode: wallMat || 'concrete',
        floorId: fId,
        roomId,
        sectionId,
        points: [
          { sequence: 0, x: start[0], y: start[1], z: start[2], pointKind: 'Vertex' },
          { sequence: 1, x: end[0], y: end[1], z: end[2], pointKind: 'Vertex' },
        ],
        spaces: [
          ...(fId ? [{ spaceKind: SpatialNodeKind.Floor, spaceId: fId, relationship: 'Bounds' }] : []),
          ...(sectionId ? [{ spaceKind: SpatialNodeKind.Section, spaceId: sectionId, relationship: 'Bounds' }] : []),
          ...(roomId ? [{ spaceKind: SpatialNodeKind.Room, spaceId: roomId, relationship: 'Bounds' }] : []),
        ],
      });
      await loadScene(activePropertyId);
      setSceneData((prev) => {
        if (!prev) return prev;
        if (saved.id && prev.geometries.some((g) => g.id === saved.id)) return prev;
        return {
          ...prev,
          geometries: [
            ...prev.geometries,
            {
              ...saved,
              id: saved.id || Date.now(),
              kind,
              name: wallNameStr,
              geometryJson: JSON.stringify(payload),
              height: wallHeight || activeFloor?.defaultCeilingHeight || 2.8,
              thickness: wallThickness || 0.18,
              floorId: fId,
              roomId,
              sectionId,
            },
          ],
        };
      });
      toast.success(`Drawn ${len.toFixed(2)}m wall saved`);
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
      toast.error(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  // Pointer Draw Room Box complete handler from SpatialViewport
  const handleDrawRoomBoxComplete = async (bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    elevationY: number;
  }) => {
    if (!activePropertyId) {
      toast.error('Select or create a Property first');
      return;
    }
    const fId = activeFloor?.id ?? null;
    const roomId = dimSpaceKind === 'room' && dimSpaceId ? Number(dimSpaceId) : null;
    const sectionId = dimSpaceKind === 'section' && dimSpaceId ? Number(dimSpaceId) : null;
    const label =
      (roomId && visibleRooms.find((r) => r.dbId === roomId)?.name) ||
      (sectionId && visibleSections.find((s) => s.dbId === sectionId)?.name) ||
      `${(bounds.maxX - bounds.minX).toFixed(1)}×${(bounds.maxZ - bounds.minZ).toFixed(1)}m Space`;

    setIsBusy(true);
    setServerError(null);
    try {
      await createRoomOrSectionBoxOnFloor({
        name: label,
        ...bounds,
        height: dimHeight || activeFloor?.defaultCeilingHeight || 2.8,
        thickness: dimThickness || 0.18,
        material: dimMaterial || 'concrete',
        floorId: fId,
        roomId,
        sectionId,
      });
      await loadScene(activePropertyId);
      setToolMode('select');
      toast.success(`Created "${label}" (${(bounds.maxX - bounds.minX).toFixed(1)}m × ${(bounds.maxZ - bounds.minZ).toFixed(1)}m)`);
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
      toast.error(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  // Drag-and-Drop onto 3D Canvas Handler (Walls, Windows, Doors, Smart Devices & Utilities)
  const handleDropPayload = async (
    payload: SpatialDragPayload,
    dropTarget: { floorPoint: [number, number, number]; wallHit?: WallDropHit | null }
  ) => {
    setActiveDragPayload(null);
    if (!activePropertyId) {
      toast.error('Select or create a Property first');
      return;
    }
    const fId = activeFloor?.id ?? null;
    const { floorPoint, wallHit } = dropTarget;

    if (payload.dragKind === 'wall') {
      const start: [number, number, number] = [floorPoint[0], floorPoint[1], floorPoint[2]];
      const end: [number, number, number] = [
        floorPoint[0] + payload.defaultLength,
        floorPoint[1],
        floorPoint[2],
      ];
      setIsBusy(true);
      try {
        const wallPayload: WallGeometryPayload = {
          type: 'wall',
          points: [start, end],
          style: payload.style,
          material: payload.material,
          floorIds: fId ? [fId] : undefined,
          elevationY: floorPoint[1],
        };
        const dropKind =
          payload.style === 'glassPanel'
            ? SpatialGeometryKind.GlassPanel
            : SpatialGeometryKind.Wall;
        const dropName = `${payload.label} (${payload.defaultLength}m)`;
        const savedDropWall = await createSpatialGeometry(activePropertyId, {
          kind: dropKind,
          name: dropName,
          geometryJson: JSON.stringify(wallPayload),
          height: payload.height,
          thickness: payload.thickness,
          materialCode: payload.material || 'concrete',
          floorId: fId,
          points: [
            { sequence: 0, x: start[0], y: start[1], z: start[2], pointKind: 'Vertex' },
            { sequence: 1, x: end[0], y: end[1], z: end[2], pointKind: 'Vertex' },
          ],
          spaces: fId
            ? [{ spaceKind: SpatialNodeKind.Floor, spaceId: fId, relationship: 'Bounds' }]
            : [],
        });
        await loadScene(activePropertyId);
        setSceneData((prev) => {
          if (!prev) return prev;
          if (savedDropWall.id && prev.geometries.some((g) => g.id === savedDropWall.id)) return prev;
          return {
            ...prev,
            geometries: [
              ...prev.geometries,
              {
                ...savedDropWall,
                id: savedDropWall.id || Date.now(),
                kind: dropKind,
                name: dropName,
                geometryJson: JSON.stringify(wallPayload),
                height: payload.height,
                thickness: payload.thickness,
                materialCode: payload.material || 'concrete',
                floorId: fId,
              },
            ],
          };
        });
        toast.success(`Dropped ${payload.label} onto floor`);
      } catch (err: any) {
        setServerError(extractServerErrorMessage(err));
        toast.error(extractServerErrorMessage(err));
      } finally {
        setIsBusy(false);
      }
      return;
    }

    if (payload.dragKind === 'roomBox') {
      const hw = payload.width * 0.5;
      const hd = payload.depth * 0.5;
      await handleDrawRoomBoxComplete({
        minX: floorPoint[0] - hw,
        maxX: floorPoint[0] + hw,
        minZ: floorPoint[2] - hd,
        maxZ: floorPoint[2] + hd,
        elevationY: floorPoint[1],
      });
      return;
    }

    if (payload.dragKind === 'opening') {
      if (!wallHit) {
        toast.error(`Drag and drop ${payload.label} directly onto an existing 3D Wall`);
        return;
      }
      const wall = wallHit.wallGeometry;
      const parsed = safeParseJson<Partial<WallGeometryPayload>>(wall.geometryJson) || {};
      const existingPts = parsed.points || [
        [wallHit.worldPosition[0] - 1, floorPoint[1], wallHit.worldPosition[2]],
        [wallHit.worldPosition[0] + 1, floorPoint[1], wallHit.worldPosition[2]],
      ];
      const newSpec: WallOpeningSpec = {
        id: `op-${Date.now()}`,
        kind: payload.openingKind,
        label: payload.label,
        offsetAlongWall: Math.max(0.2, Math.round(wallHit.offsetAlongWall * 100) / 100),
        sillHeight: payload.sillHeight,
        width: payload.width,
        height: payload.height,
        hasFrame: true,
        hasGlass: payload.openingKind === SpatialOpeningKind.Window,
      };
      const nextPayload: WallGeometryPayload = {
        type: parsed.type || 'wall',
        points: existingPts as [number, number, number][],
        style: parsed.style || 'solid',
        material: (wall.materialCode as WallGeometryPayload['material']) || parsed.material || 'concrete',
        openings: [...(parsed.openings || []), newSpec],
        elevationY: parsed.elevationY ?? floorPoint[1],
        sourceOutlineId: parsed.sourceOutlineId,
        sourceSegmentIndex: parsed.sourceSegmentIndex,
        sharedWallKey: parsed.sharedWallKey,
        floorIds: parsed.floorIds,
        spaceRefs: parsed.spaceRefs,
      };
      await saveUpdatedGeometry(
        wall,
        wall.name,
        nextPayload,
        nextPayload.points,
        wall.height || 2.8,
        wall.thickness || 0.18,
        nextPayload.material,
        `${payload.label} added to "${wall.name}"`
      );
      return;
    }

    if (payload.dragKind === 'device') {
      // Irrigation restriction: never attach directly to Property root
      const dropParentKind = wallHit?.wallGeometry.roomId
        ? SpatialNodeKind.Room
        : wallHit?.wallGeometry.sectionId
        ? SpatialNodeKind.Section
        : fId
        ? SpatialNodeKind.Floor
        : parentKind !== SpatialNodeKind.Property
        ? parentKind
        : SpatialNodeKind.Property;
      const dropParentId =
        dropParentKind === SpatialNodeKind.Room
          ? wallHit?.wallGeometry.roomId || activePropertyId
          : dropParentKind === SpatialNodeKind.Section
          ? wallHit?.wallGeometry.sectionId || activePropertyId
          : dropParentKind === SpatialNodeKind.Floor
          ? fId || activePropertyId
          : Number(parentId) || activePropertyId;

      if (
        payload.targetKind === SpatialTargetKind.Utility &&
        payload.utilityType === UtilityType.Irrigation &&
        dropParentKind === SpatialNodeKind.Property
      ) {
        toast.error('Irrigation must belong inside a Floor, Section, Room, or Exterior Area — create a Floor first');
        return;
      }

      const isWallMount =
        Boolean(wallHit) &&
        (payload.targetKind === SpatialTargetKind.Door ||
          payload.targetKind === SpatialTargetKind.Window ||
          payload.targetKind === SpatialTargetKind.Camera ||
          payload.targetKind === SpatialTargetKind.Light);

      const posX = isWallMount && wallHit ? wallHit.worldPosition[0] : floorPoint[0];
      const posZ = isWallMount && wallHit ? wallHit.worldPosition[2] : floorPoint[2];
      const posY =
        isWallMount && wallHit
          ? payload.targetKind === SpatialTargetKind.Door
            ? wallHit.worldPosition[1] + 1.05
            : payload.targetKind === SpatialTargetKind.Window
            ? wallHit.worldPosition[1] + 1.5
            : wallHit.worldPosition[1] + 2.1
          : floorPoint[1] +
            (payload.targetKind === SpatialTargetKind.Light
              ? 2.4
              : payload.targetKind === SpatialTargetKind.Utility
              ? 0.55
              : 0.45);

      const quat: [number, number, number, number] =
        isWallMount && wallHit ? wallHit.quaternion : [0, 0, 0, 1];

      // Reuse existing placement version if this device was already placed so we update cleanly
      const existingPl = placements.find(
        (p) => p.targetKind === payload.targetKind && p.targetId === payload.targetId
      );

      setIsBusy(true);
      try {
        await upsertSpatialPlacement({
          id: existingPl?.id ?? 0,
          version: existingPl?.version ?? 0,
          propertyId: activePropertyId,
          targetKind: payload.targetKind,
          targetId: payload.targetId,
          parentKind: dropParentKind,
          parentId: dropParentId,
          attachmentKind: isWallMount
            ? SpatialAttachmentKind.WallMounted
            : payload.attachmentKind ||
              (payload.targetKind === SpatialTargetKind.Light
                ? SpatialAttachmentKind.CeilingMounted
                : SpatialAttachmentKind.FloorMounted),
          hostGeometryId: isWallMount && wallHit ? wallHit.wallGeometry.id : null,
          positionX: Math.round(posX * 1000) / 1000,
          positionY: Math.round(posY * 1000) / 1000,
          positionZ: Math.round(posZ * 1000) / 1000,
          rotationX: quat[0],
          rotationY: quat[1],
          rotationZ: quat[2],
          rotationW: quat[3],
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1,
          width:
            payload.targetKind === SpatialTargetKind.Door
              ? 0.95
              : payload.targetKind === SpatialTargetKind.Window
              ? 1.2
              : payload.targetKind === SpatialTargetKind.Utility
              ? 0.85
              : 0.35,
          height:
            payload.targetKind === SpatialTargetKind.Door
              ? 2.1
              : payload.targetKind === SpatialTargetKind.Window
              ? 1.2
              : payload.targetKind === SpatialTargetKind.Utility
              ? 1.1
              : 0.35,
          depth:
            payload.targetKind === SpatialTargetKind.Door ||
            payload.targetKind === SpatialTargetKind.Window
              ? 0.16
              : payload.targetKind === SpatialTargetKind.Utility
              ? 0.7
              : 0.3,
          assetCode: 'standard',
          anchorJson: '{}',
        });

        // If Window/Door smart device dropped onto a wall, also punch an opening in that wall automatically
        if (
          isWallMount &&
          wallHit &&
          (payload.targetKind === SpatialTargetKind.Window ||
            payload.targetKind === SpatialTargetKind.Door)
        ) {
          const wall = wallHit.wallGeometry;
          const parsed = safeParseJson<Partial<WallGeometryPayload>>(wall.geometryJson) || {};
          const opKind =
            payload.targetKind === SpatialTargetKind.Window
              ? SpatialOpeningKind.Window
              : SpatialOpeningKind.Door;
          const opSpec: WallOpeningSpec = {
            id: `dev-op-${payload.targetKind}-${payload.targetId}`,
            kind: opKind,
            label: payload.label,
            offsetAlongWall: Math.max(0.2, Math.round(wallHit.offsetAlongWall * 100) / 100),
            sillHeight: opKind === SpatialOpeningKind.Window ? 0.9 : 0,
            width: opKind === SpatialOpeningKind.Window ? 1.2 : 0.95,
            height: opKind === SpatialOpeningKind.Window ? 1.2 : 2.1,
            hasFrame: true,
            hasGlass: opKind === SpatialOpeningKind.Window,
            deviceId: payload.targetId,
            deviceKind: payload.targetKind,
          };
          const filteredOps = (parsed.openings || []).filter(
            (o) => !(o.deviceId === payload.targetId && o.deviceKind === payload.targetKind)
          );
          const pts = (parsed.points || []) as [number, number, number][];
          if (pts.length >= 2) {
            await saveUpdatedGeometry(
              wall,
              wall.name,
              {
                ...parsed,
                type: parsed.type || 'wall',
                points: pts,
                openings: [...filteredOps, opSpec],
              },
              pts,
              wall.height || 2.8,
              wall.thickness || 0.18,
              wall.materialCode
            );
          }
        }

        await loadScene(activePropertyId);
        toast.success(`Placed ${payload.label} cleanly in 3D`);
      } catch (err: any) {
        if (err instanceof SpatialConflictError) setConflictMessage(err.message);
        else {
          setServerError(extractServerErrorMessage(err));
          toast.error(extractServerErrorMessage(err));
        }
      } finally {
        setIsBusy(false);
      }
    }
  };

  // Interactive 3D Corner / Endpoint Resize Handle callback from SpatialViewport
  const handleGeometryResized = async (update: ResizeGeometryUpdate) => {
    const geom = update.geometry;
    const parsed = safeParseJson<any>(geom.geometryJson) || {};
    const nextJson = {
      ...parsed,
      points: update.points,
    };
    await saveUpdatedGeometry(
      geom,
      geom.name,
      nextJson,
      update.points,
      geom.height || 2.8,
      geom.thickness || 0.18,
      geom.materialCode,
      `Resized ${geom.name} (${update.width.toFixed(2)}m × ${update.depth.toFixed(2)}m)`
    );
  };

  // Apply explicit numeric Room or Section dimensions across all matching outlines, slabs & walls
  const handleApplySpaceDimensions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePropertyId || !dimSpaceId) {
      toast.error('Select a Room or Section to resize');
      return;
    }
    const targetId = Number(dimSpaceId);
    const matching = geometries.filter((g) =>
      dimSpaceKind === 'room' ? g.roomId === targetId : g.sectionId === targetId
    );
    const hw = Math.max(0.4, dimWidth * 0.5);
    const hd = Math.max(0.4, dimDepth * 0.5);
    const elev = activeFloorElevation;
    const newPts: [number, number, number][] = [
      [dimCenterX - hw, elev, dimCenterZ - hd],
      [dimCenterX + hw, elev, dimCenterZ - hd],
      [dimCenterX + hw, elev, dimCenterZ + hd],
      [dimCenterX - hw, elev, dimCenterZ + hd],
    ];

    setIsBusy(true);
    setServerError(null);
    try {
      if (matching.length === 0) {
        const label =
          dimSpaceKind === 'room'
            ? visibleRooms.find((r) => r.dbId === targetId)?.name || `Room #${targetId}`
            : visibleSections.find((s) => s.dbId === targetId)?.name || `Section #${targetId}`;
        await createRoomOrSectionBoxOnFloor({
          name: label,
          minX: dimCenterX - hw,
          maxX: dimCenterX + hw,
          minZ: dimCenterZ - hd,
          maxZ: dimCenterZ + hd,
          elevationY: elev,
          height: dimHeight,
          thickness: dimThickness,
          material: dimMaterial,
          floorId: activeFloor?.id ?? null,
          roomId: dimSpaceKind === 'room' ? targetId : null,
          sectionId: dimSpaceKind === 'section' ? targetId : null,
        });
        await loadScene(activePropertyId);
        toast.success(`Built & sized "${label}" (${dimWidth}m × ${dimDepth}m × ${dimHeight}m)`);
        return;
      }

      // Update RoomOutline, Slab, and 4 walls matching this Room or Section
      const walls = matching.filter(
        (g) =>
          g.kind === SpatialGeometryKind.Wall ||
          g.kind === SpatialGeometryKind.WallSegment ||
          g.kind === SpatialGeometryKind.GlassPanel
      );
      const outlinesAndSlabs = matching.filter(
        (g) =>
          g.kind === SpatialGeometryKind.RoomOutline || g.kind === SpatialGeometryKind.Slab
      );

      for (const item of outlinesAndSlabs) {
        const parsed = safeParseJson<any>(item.geometryJson) || {};
        await saveUpdatedGeometry(
          item,
          item.name,
          { ...parsed, points: newPts, elevationY: elev },
          newPts,
          item.kind === SpatialGeometryKind.RoomOutline ? dimHeight : item.height || 0.16,
          item.thickness || 0.16,
          dimMaterial
        );
      }

      for (let i = 0; i < Math.min(walls.length, 4); i++) {
        const w = walls[i];
        const a = newPts[i];
        const b = newPts[(i + 1) % 4];
        const parsed = safeParseJson<any>(w.geometryJson) || {};
        await saveUpdatedGeometry(
          w,
          w.name,
          {
            ...parsed,
            points: [a, b],
            material: dimMaterial,
            elevationY: elev,
          },
          [a, b],
          dimHeight,
          dimThickness,
          dimMaterial
        );
      }
      toast.success(`Updated dimensions to ${dimWidth}m × ${dimDepth}m × ${dimHeight}m`);
    } catch (err: any) {
      setServerError(extractServerErrorMessage(err));
      toast.error(extractServerErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  // Helper to attach/remove opening on selected Wall geometry inline
  const handleAddOpeningToSelectedWall = async () => {
    if (!selected?.geometry) return;
    const wall = selected.geometry;
    const parsed = safeParseJson<Partial<WallGeometryPayload>>(wall.geometryJson) || {};
    const wallMeta = extractWallMeta(wall, floorMap, sceneData?.openings || []);
    if (!wallMeta) return;

    const newOp: WallOpeningSpec = {
      id: `op-${Date.now()}`,
      kind: selOpKind,
      offsetAlongWall: Math.max(0.1, Math.min(wallMeta.length - 0.3, selOpOffset)),
      sillHeight: selOpKind === SpatialOpeningKind.Window ? selOpSill : 0,
      width: selOpWidth,
      height: selOpHeight,
      hasFrame: true,
      hasGlass: selOpKind === SpatialOpeningKind.Window,
    };
    const pts = [wallMeta.start, wallMeta.end] as [number, number, number][];
    await saveUpdatedGeometry(
      wall,
      wall.name,
      {
        ...parsed,
        type: parsed.type || 'wall',
        points: pts,
        openings: [...(parsed.openings || []), newOp],
      },
      pts,
      wallMeta.height,
      wallMeta.thickness,
      wallMeta.material,
      `${SpatialOpeningKind[selOpKind]} opening added to wall`
    );
  };

  const handleRemoveOpeningFromSelectedWall = async (openingId: string) => {
    if (!selected?.geometry) return;
    const wall = selected.geometry;
    const parsed = safeParseJson<Partial<WallGeometryPayload>>(wall.geometryJson) || {};
    const wallMeta = extractWallMeta(wall, floorMap, sceneData?.openings || []);
    if (!wallMeta) return;
    const pts = [wallMeta.start, wallMeta.end] as [number, number, number][];
    await saveUpdatedGeometry(
      wall,
      wall.name,
      {
        ...parsed,
        type: parsed.type || 'wall',
        points: pts,
        openings: (parsed.openings || []).filter((o) => o.id !== openingId),
      },
      pts,
      wallMeta.height,
      wallMeta.thickness,
      wallMeta.material,
      'Opening removed from wall'
    );
  };

  const startDragPayload = (e: React.DragEvent, payload: SpatialDragPayload) => {
    setActiveDragPayload(payload);
    try {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('application/x-spatial-drag', JSON.stringify(payload));
    } catch {
      // Fallback relies on activeDragPayload React state during dragover/drop
    }
  };

  const liveDraftPreview = React.useMemo<SpatialDraftPreview | null>(() => {
    if (!showLivePreview || !isDrawerOpen) return null;

    if (activeTab === 'outline') {
      if (outlineFocusMode === 'dimensions') {
        return {
          kind: 'spaceBox',
          centerX: dimCenterX,
          centerZ: dimCenterZ,
          width: dimWidth,
          depth: dimDepth,
          height: dimHeight,
          elevationY: activeFloorElevation,
          label: 'Space Dimensions',
        };
      }
      return outlineDraft;
    }

    if (activeTab === 'architecture') {
      if (archTool === 'wall') {
        const fId = wallFloorId ? Number(wallFloorId) : null;
        const elev = fId ? floorMap.get(fId)?.elevation ?? activeFloorElevation : activeFloorElevation;
        return {
          kind: 'wall',
          x1: wallX1,
          z1: wallZ1,
          x2: wallX2,
          z2: wallZ2,
          height: wallHeight,
          thickness: wallThickness,
          elevationY: elev,
          style: wallStyle,
          openings: wallOpenings,
          label: wallName,
        };
      }
      if (archTool === 'slab') {
        const fId = slabFloorId ? Number(slabFloorId) : null;
        const elev = fId ? floorMap.get(fId)?.elevation ?? activeFloorElevation : activeFloorElevation;
        return {
          kind: 'spaceBox',
          centerX: slabCX,
          centerZ: slabCZ,
          width: slabW,
          depth: slabD,
          height: slabThickness || 0.24,
          elevationY: elev,
          isVoid: slabMode === 'void',
        };
      }
      if (archTool === 'roof') {
        return {
          kind: 'spaceBox',
          centerX: 0,
          centerZ: 0,
          width: roofW,
          depth: roofD,
          height: 0.25,
          elevationY: roofElev,
        };
      }
      if (archTool === 'stair') {
        const fId = stairFloorId ? Number(stairFloorId) : null;
        const elev = fId ? floorMap.get(fId)?.elevation ?? activeFloorElevation : activeFloorElevation;
        return {
          kind: 'spaceBox',
          centerX: stairOrigX,
          centerZ: stairOrigZ + stairRun * 0.5,
          width: stairLayout === 'uturn' ? stairWidth * 2 + 0.2 : stairWidth,
          depth: stairRun,
          height: stairRise,
          elevationY: elev,
        };
      }
      if (archTool === 'pool') {
        const fId = poolFloorId ? Number(poolFloorId) : null;
        const elev = fId ? floorMap.get(fId)?.elevation ?? activeFloorElevation : activeFloorElevation;
        return {
          kind: 'spaceBox',
          centerX: 0,
          centerZ: 0,
          width: poolL,
          depth: poolW,
          height: poolDepth,
          elevationY: elev,
        };
      }
    }

    if (activeTab === 'devices') {
      return {
        kind: 'placement',
        x: placeX,
        y: placeY,
        z: placeZ,
      };
    }

    return null;
  }, [
    showLivePreview,
    isDrawerOpen,
    activeTab,
    outlineFocusMode,
    outlineDraft,
    dimCenterX,
    dimCenterZ,
    dimWidth,
    dimDepth,
    dimHeight,
    activeFloorElevation,
    archTool,
    wallFloorId,
    floorMap,
    wallX1,
    wallZ1,
    wallX2,
    wallZ2,
    wallHeight,
    wallThickness,
    wallStyle,
    wallOpenings,
    wallName,
    slabFloorId,
    slabCX,
    slabCZ,
    slabW,
    slabD,
    slabThickness,
    slabMode,
    roofW,
    roofD,
    roofElev,
    stairFloorId,
    stairOrigX,
    stairOrigZ,
    stairRun,
    stairLayout,
    stairWidth,
    stairRise,
    poolFloorId,
    poolL,
    poolW,
    poolDepth,
    placeX,
    placeY,
    placeZ,
  ]);

  const roomNamesRecord = React.useMemo(() => {
    const rec: Record<number, string> = {};
    visibleRooms.forEach((r) => {
      if (r.dbId > 0 && r.name) {
        rec[r.dbId] = r.name;
      }
    });
    return rec;
  }, [visibleRooms]);

  const triggerCameraPreset = React.useCallback((mode: CameraPresetMode) => {
    setCameraPresetRequest((prev) => ({ mode, nonce: (prev?.nonce ?? 0) + 1 }));
  }, []);

  const isEmptyScene =
    !isLoadingScene &&
    Boolean(activePropertyId) &&
    geometries.length === 0 &&
    placements.length === 0;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[120] flex flex-col overflow-hidden select-none',
        'bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100',
        !isOpen && 'hidden pointer-events-none'
      )}
      role="dialog"
      aria-modal={isOpen ? 'true' : undefined}
      aria-hidden={!isOpen}
      aria-label="3D Spatial Home Architecture & Device Placement"
    >
      {/* Top Toolbar (solid crisp header, zero backdrop-blur over WebGL) */}
      <header className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2.5 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Box className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">
                3D Spatial Designer
              </h2>
              <Badge variant="outline" className="text-[10px] font-mono hidden sm:inline-flex">
                Y-up · metres · Quaternions
              </Badge>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 mx-1 hidden md:block" />

          {/* Active Property Selector */}
          <select
            value={activePropertyId ?? ''}
            onChange={(e) => onActivePropertyChange(e.target.value ? Number(e.target.value) : null)}
            disabled={isLoadingProps}
            aria-label="Select Property"
            className="h-8 max-w-[160px] rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 px-2 text-xs font-medium"
          >
            {properties.length === 0 ? (
              <option value="">No Properties Yet</option>
            ) : (
              properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.propertyName || p.name || `Property #${p.id}`}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Transform Mode Gizmo Buttons */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-0.5">
            {(
              [
                { mode: 'translate', icon: Move, label: 'Move (G)' },
                { mode: 'rotate', icon: RotateCw, label: 'Rotate (R)' },
                { mode: 'scale', icon: Scaling, label: 'Scale (S)' },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.mode}
                  type="button"
                  title={item.label}
                  onClick={() => setGizmoMode(item.mode)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors',
                    gizmoMode === item.mode
                      ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline capitalize">{item.mode}</span>
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={isBusy || undoStack.length === 0}
            title="Undo last confirmed transform"
            className="h-8 px-2 text-xs gap-1"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={isBusy || redoStack.length === 0}
            title="Redo transform"
            className="h-8 px-2 text-xs gap-1"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setResetCameraNonce((n) => n + 1)}
            title="Reset Camera View"
            className="h-8 px-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoadingScene || isLoadingProps}
            title="Refresh Properties, Sections, Rooms & 3D Scene from Server"
            className="h-8 px-2.5 text-xs gap-1"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', (isLoadingScene || isLoadingProps) && 'animate-spin')} />
            <span className="hidden md:inline">Refresh</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsContractsModalOpen(true)}
            title="API Endpoints & Geometry Kernel Status"
            className="h-8 px-2.5 text-xs gap-1"
          >
            <FileCode2 className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">API Status</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDrawerOpen((o) => !o)}
            title={isDrawerOpen ? 'Hide Inspector Panel' : 'Open Inspector Panel'}
            className="h-8 px-2.5 text-xs gap-1"
          >
            {isDrawerOpen ? (
              <PanelRightClose className="h-3.5 w-3.5" />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Tools</span>
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onClose}
            className="h-8 px-3 text-xs font-semibold gap-1"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area: Three.js Canvas + Collapsible Tools Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {/* Left/Main Three.js Viewport */}
        <div className="relative flex-1 min-h-[260px] h-full overflow-hidden">
          <SpatialViewport
            isOpen={isOpen}
            theme={theme}
            sceneData={sceneData}
            devices={visibleDevices}
            visibleFloors={visibleFloors}
            activeFloorElevation={activeFloorElevation}
            selectedKey={selected?.key || null}
            gizmoMode={gizmoMode}
            toolMode={toolMode}
            renderMode={renderMode}
            roomNames={roomNamesRecord}
            gridSnap={gridSnap}
            activeDragPayload={activeDragPayload}
            draftPreview={liveDraftPreview}
            resetCameraNonce={resetCameraNonce}
            cameraPresetRequest={cameraPresetRequest}
            onSelect={setSelected}
            onPlacementTransformed={handlePlacementTransformed}
            onDrawWallComplete={handleDrawWallComplete}
            onDrawRoomBoxComplete={handleDrawRoomBoxComplete}
            onDropPayload={handleDropPayload}
            onGeometryResized={handleGeometryResized}
          />

          {/* Top-Left Floor Visibility & Active Draw/Drop Plane Bar (solid crisp chips, zero blur) */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 max-w-[92%] pointer-events-none">
            <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
              {/* Interactive Canvas Mode Switcher */}
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5 shadow-sm">
                {(
                  [
                    { id: 'select', label: 'Select', icon: MousePointer },
                    { id: 'drawWall', label: 'Draw Wall', icon: PenTool },
                    { id: 'drawRoomBox', label: 'Draw Box', icon: Box },
                  ] as const
                ).map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setToolMode(m.id)}
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors',
                        toolMode === m.id
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setGridSnap((s) => !s)}
                  title="Snap 0.25m & 90° ortho"
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ml-0.5 border-l border-slate-200 dark:border-zinc-700',
                    gridSnap
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-slate-400 dark:text-zinc-500'
                  )}
                >
                  <Magnet className="h-3 w-3" />
                  <span className="hidden sm:inline">Snap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLivePreview((p) => !p)}
                  title="Toggle real-time 3D preview of active editor inputs on the grid"
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ml-0.5 border-l border-slate-200 dark:border-zinc-700',
                    showLivePreview
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-400 dark:text-zinc-500'
                  )}
                >
                  {showLivePreview ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  <span className="hidden sm:inline">Preview</span>
                </button>
              </div>

              {/* Realistic 3D vs 3D Scene Outline Mode Toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setRenderMode('realistic')}
                  title="Textured realistic 3D architectural surfaces with room & device labels"
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors',
                    renderMode === 'realistic'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  )}
                >
                  <Layers className="h-3 w-3" />
                  <span>Realistic 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRenderMode('outline')}
                  title="Crisp 3D structural outline blueprint with edge dimensions"
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors',
                    renderMode === 'outline'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  )}
                >
                  <Shapes className="h-3 w-3" />
                  <span>3D Outline</span>
                </button>
              </div>

              {/* Smart Camera Presets (Home Core vs Top Plan vs Fit All) */}
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => triggerCameraPreset('homeCore')}
                  title="Focus camera on main home rooms & garden cluster"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  <Box className="h-3 w-3 text-primary" />
                  <span>Focus Rooms</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerCameraPreset('topPlan')}
                  title="Overhead architectural plan & outline view"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border-l border-slate-200 dark:border-zinc-700"
                >
                  <Ruler className="h-3 w-3 text-sky-500" />
                  <span>Top Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerCameraPreset('fitAll')}
                  title="Zoom out to include full boundary & extended walls"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border-l border-slate-200 dark:border-zinc-700"
                >
                  <Maximize2 className="h-3 w-3 text-amber-500" />
                  <span>Fit All</span>
                </button>
              </div>

              {/* 1-Click Generate 3D Scene Button */}
              <Button
                type="button"
                size="sm"
                onClick={handleGenerateSceneFromHierarchy}
                disabled={isBusy || !activePropertyId}
                className="h-7 px-2.5 text-[11px] font-semibold gap-1 shadow-sm"
                title="Generate 3D room/section geometry for bound spaces on the active floor"
              >
                <Wand2 className="h-3 w-3" />
                <span>Generate 3D Scene</span>
              </Button>
            </div>

            {floors.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pointer-events-auto">
                {floors.map((f) => {
                  const isVis = visibleFloors[f.id] !== false;
                  const isActivePlane = activeFloor?.id === f.id;
                  return (
                    <div
                      key={f.id}
                      className={cn(
                        'inline-flex items-center rounded-lg border shadow-sm overflow-hidden text-[11px] font-semibold',
                        isActivePlane
                          ? 'border-primary bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 ring-1 ring-primary/40'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleFloors((prev) => ({ ...prev, [f.id]: !isVis }))
                        }
                        title={isVis ? 'Hide floor' : 'Show floor'}
                        className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        {isVis ? (
                          <Eye className="h-3 w-3 text-primary" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-slate-400" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFloorId(f.id);
                          setVisibleFloors((prev) => ({ ...prev, [f.id]: true }));
                        }}
                        title="Set as active drawing & drop elevation floor"
                        className="pr-2.5 py-1 cursor-pointer flex items-center gap-1"
                      >
                        <span className={!isVis ? 'line-through opacity-60' : ''}>{f.name}</span>
                        <span className="font-mono text-[10px] opacity-70">{f.elevation}m</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Server Validation Error Banner */}
          {serverError && (
            <div className="absolute top-3 right-3 z-10 max-w-md rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/95 text-red-900 dark:text-red-200 p-3 shadow-lg flex items-start gap-2 text-xs">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-bold">Server Validation / API Error</div>
                <div className="break-words mt-0.5">{serverError}</div>
              </div>
              <button
                type="button"
                onClick={() => setServerError(null)}
                className="text-red-600 dark:text-red-300 hover:opacity-75 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Loading State */}
          {(isLoadingProps || isLoadingScene) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-lg flex items-center gap-2 text-xs font-semibold">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <span>Loading authorized 3D scene from server...</span>
              </div>
            </div>
          )}

          {/* No Property Selected Prompt */}
          {!activePropertyId && !isLoadingProps && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-4 pointer-events-none">
              <div className="max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-xl text-center space-y-2 pointer-events-auto">
                <Building2 className="h-8 w-8 mx-auto text-primary" />
                <h3 className="text-sm font-bold">No Property Selected</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Create a Property in the Setup tab to begin building floors, outlines, walls, and smart-device placements.
                </p>
              </div>
            </div>
          )}

          {isEmptyScene && (
            <div className="absolute bottom-4 left-4 z-10 max-w-sm rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3.5 shadow-lg text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-primary" />
                <span>Ready to Generate 3D Home Layout</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                Click <strong>Generate 3D Scene</strong> to auto-build your bound sections and rooms on this floor, or switch to <strong>Draw Wall / Draw Box</strong> and drag windows &amp; devices straight onto the canvas.
              </p>
              <Button
                type="button"
                size="sm"
                disabled={isBusy}
                onClick={handleGenerateSceneFromHierarchy}
                className="w-full h-8 text-xs gap-1.5"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Generate 3D Scene Now</span>
              </Button>
            </div>
          )}

          {/* Selected Object Inspector Pill (bottom-left) */}
          {selected && (
            <div className="absolute bottom-3 left-3 z-10 w-80 sm:w-96 max-w-[calc(100%-1.5rem)] max-h-[55vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-xl text-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold truncate">{selected.name}</div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px]">
                    v{selected.placement?.version ?? selected.geometry?.version ?? 1}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {selected.placement && (
                <div className="space-y-2">
                  <div className="font-mono text-[10px] text-slate-600 dark:text-zinc-400 space-y-0.5">
                    <div>
                      Pos: ({selected.placement.positionX.toFixed(2)},{' '}
                      {selected.placement.positionY.toFixed(2)},{' '}
                      {selected.placement.positionZ.toFixed(2)}) m
                    </div>
                    <div>
                      Quat: ({selected.placement.rotationX.toFixed(2)},{' '}
                      {selected.placement.rotationY.toFixed(2)},{' '}
                      {selected.placement.rotationZ.toFixed(2)},{' '}
                      {selected.placement.rotationW.toFixed(2)})
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Drag gizmo to reposition
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleDeletePlacement(selected.placement!)}
                      className="h-7 px-2.5 text-[11px] gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove Placement
                    </Button>
                  </div>
                </div>
              )}

              {selected.geometry && (() => {
                const g = selected.geometry!;
                const wallMeta = extractWallMeta(g, floorMap, sceneData?.openings || []);
                const bounds = computeGeometryBounds(g, floorMap);
                return (
                  <div className="space-y-2 text-[11px] text-slate-600 dark:text-zinc-400">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span>
                        Kind:{' '}
                        <strong className="text-slate-900 dark:text-zinc-100">
                          {SpatialGeometryKind[g.kind]}
                        </strong>
                      </span>
                      {bounds && (
                        <span className="font-mono text-[10px]">
                          {bounds.width.toFixed(2)}m × {bounds.depth.toFixed(2)}m · H:{g.height}m
                        </span>
                      )}
                    </div>

                    {(g.kind === SpatialGeometryKind.RoomOutline ||
                      g.kind === SpatialGeometryKind.Slab ||
                      wallMeta) && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Tip: Drag the amber 3D spheres in the viewport to resize directly, or edit Room/Section dimensions in the Outline tab.
                      </div>
                    )}

                    {/* Inline Wall Opening Editor (Add/Remove Windows & Doors on Selected Wall) */}
                    {wallMeta && (
                      <div className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-2">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                          <span>Wall Openings ({wallMeta.openings.length})</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            Len: {wallMeta.length.toFixed(2)}m
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                          <select
                            value={selOpKind}
                            onChange={(e) =>
                              setSelOpKind(Number(e.target.value) as SpatialOpeningKind)
                            }
                            className="col-span-2 h-7 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[10px] px-1"
                          >
                            <option value={SpatialOpeningKind.Window}>Window</option>
                            <option value={SpatialOpeningKind.Door}>Door</option>
                            <option value={SpatialOpeningKind.Gate}>Gate</option>
                          </select>
                          <Input
                            type="number"
                            step={0.1}
                            value={selOpOffset}
                            onChange={(e) => setSelOpOffset(Number(e.target.value))}
                            title="Offset along wall (m)"
                            className="h-7 text-[10px] bg-white dark:bg-zinc-900 px-1.5"
                          />
                          <Input
                            type="number"
                            step={0.1}
                            value={selOpWidth}
                            onChange={(e) => setSelOpWidth(Number(e.target.value))}
                            title="Width (m)"
                            className="h-7 text-[10px] bg-white dark:bg-zinc-900 px-1.5"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={handleAddOpeningToSelectedWall}
                            className="h-7 px-1.5 text-[10px]"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        {wallMeta.openings.length > 0 && (
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {wallMeta.openings.map((op) => (
                              <div
                                key={op.id}
                                className="flex items-center justify-between px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px]"
                              >
                                <span>
                                  {SpatialOpeningKind[op.kind]} · @{op.offsetAlongWall.toFixed(2)}m ·{' '}
                                  {op.width}×{op.height}m
                                </span>
                                {!op.id.startsWith('db-op-') && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOpeningFromSelectedWall(op.id)}
                                    className="text-red-500 hover:text-red-600 cursor-pointer"
                                    title="Remove opening"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right / Bottom Responsive Tools & Inspector Drawer */}
        {isDrawerOpen && (
          <aside className="w-full lg:w-[400px] xl:w-[430px] h-[46vh] lg:h-full border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-hidden z-10">
            {/* Drawer Navigation Tabs */}
            <div className="grid grid-cols-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-1 gap-1 shrink-0">
              {(
                [
                  { id: 'setup', label: 'Setup', icon: Building2 },
                  { id: 'outline', label: 'Outline', icon: Shapes },
                  { id: 'architecture', label: 'Build', icon: Hammer },
                  { id: 'devices', label: 'Devices', icon: Lightbulb },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors',
                      activeTab === tab.id
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
              {/* TAB 1: SETUP & HIERARCHY */}
              {activeTab === 'setup' && (
                <div className="space-y-4 text-xs">
                  {/* Create Property */}
                  <form
                    onSubmit={handleCreateProperty}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 space-y-2"
                  >
                    <div className="font-bold text-slate-900 dark:text-zinc-100">
                      1. Create Property
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Property name (e.g. Home)"
                        value={newPropertyName}
                        onChange={(e) => setNewPropertyName(e.target.value)}
                        className="h-8 text-xs bg-white dark:bg-zinc-900"
                      />
                      <Button
                        type="submit"
                        disabled={isBusy || !newPropertyName.trim()}
                        className="h-8 px-3 text-xs shrink-0"
                      >
                        Create
                      </Button>
                    </div>
                  </form>

                  {/* Create Building */}
                  <form
                    onSubmit={handleCreateBuilding}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 space-y-2"
                  >
                    <div className="font-bold text-slate-900 dark:text-zinc-100">
                      2. Create Building
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400">Name</label>
                        <Input
                          value={newBuildingName}
                          onChange={(e) => setNewBuildingName(e.target.value)}
                          className="h-8 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Base Elev (m)
                        </label>
                        <Input
                          type="number"
                          step={0.1}
                          value={newBuildingElev}
                          onChange={(e) => setNewBuildingElev(Number(e.target.value))}
                          className="h-8 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isBusy || !activePropertyId}
                      className="w-full h-8 text-xs"
                    >
                      Create Building
                    </Button>
                  </form>

                  {/* Create Floor */}
                  <form
                    onSubmit={handleCreateFloor}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        3. Floor Management
                      </span>
                      <div className="flex gap-1">
                        {(['Underground', 'Ground', 'Top'] as const).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => applyFloorPreset(preset)}
                            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-[10px] font-semibold hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <select
                      value={selectedBuildingId}
                      onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
                      className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                    >
                      <option value="">Select Building...</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} (Elev {b.baseElevation}m)
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Floor Name
                        </label>
                        <Input
                          value={newFloorName}
                          onChange={(e) => setNewFloorName(e.target.value)}
                          className="h-8 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Level Index
                        </label>
                        <Input
                          type="number"
                          value={newFloorLevelIdx}
                          onChange={(e) => setNewFloorLevelIdx(Number(e.target.value))}
                          className="h-8 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Elevation (m)
                        </label>
                        <Input
                          type="number"
                          step={0.1}
                          value={newFloorElev}
                          onChange={(e) => setNewFloorElev(Number(e.target.value))}
                          className="h-8 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Ceiling H (m)
                        </label>
                        <Input
                          type="number"
                          step={0.1}
                          value={newFloorCeiling}
                          onChange={(e) => setNewFloorCeiling(Number(e.target.value))}
                          className="h-8 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isBusy || !selectedBuildingId || !newFloorName.trim()}
                      className="w-full h-8 text-xs"
                    >
                      Create Floor
                    </Button>
                  </form>

                  {/* Bind Existing Sections & Rooms */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 space-y-2.5">
                    <div className="font-bold text-slate-900 dark:text-zinc-100">
                      4. Reuse Existing Sections & Rooms
                    </div>
                    <select
                      value={bindTargetFloorId}
                      onChange={(e) => setBindTargetFloorId(Number(e.target.value))}
                      className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                    >
                      <option value="">Target Floor...</option>
                      {floors.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} (Level {f.levelIndex})
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <select
                        value={bindSectionId}
                        onChange={(e) => setBindSectionId(e.target.value ? Number(e.target.value) : '')}
                        className="flex-1 h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                      >
                        <option value="">
                          Select Existing Section ({visibleSections.length})...
                        </option>
                        {visibleSections.map((s) => (
                          <option key={s.dbId} value={s.dbId}>
                            {s.name} (ID: {s.dbId})
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy || !bindTargetFloorId || !bindSectionId}
                        onClick={handleBindSection}
                        className="h-8 px-2.5 text-xs shrink-0"
                      >
                        Bind Section
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={bindRoomId}
                        onChange={(e) => setBindRoomId(e.target.value ? Number(e.target.value) : '')}
                        className="flex-1 h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                      >
                        <option value="">Direct Room (SectionId == null)...</option>
                        {visibleRooms.map((r) => {
                          const hasSec =
                            resolveRoomSectionDbId(r) > 0 ||
                            Boolean(r.section && r.section !== '0' && r.section.toLowerCase() !== 'none');
                          return (
                            <option
                              key={r.dbId}
                              value={r.dbId}
                              disabled={hasSec}
                            >
                              {r.name} {hasSec ? '(Linked to Section)' : '(Unlinked)'}
                            </option>
                          );
                        })}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy || !bindTargetFloorId || !bindRoomId}
                        onClick={handleBindDirectRoom}
                        className="h-8 px-2.5 text-xs shrink-0"
                      >
                        Bind Room
                      </Button>
                    </div>
                  </div>

                  {/* Exterior Areas & Tank Scaffold Structures */}
                  <form
                    onSubmit={handleCreateExteriorOrScaffold}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 space-y-2"
                  >
                    <div className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Trees className="h-3.5 w-3.5 text-emerald-500" />
                      <span>5. Exterior Areas & Tank Scaffolds</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(
                        [
                          { id: 'garden', label: 'Garden' },
                          { id: 'driveway', label: 'Driveway' },
                          { id: 'tankScaffold', label: 'Scaffold' },
                        ] as const
                      ).map((k) => (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => {
                            setExtKind(k.id);
                            setExtName(
                              k.id === 'garden'
                                ? 'Front Garden'
                                : k.id === 'driveway'
                                ? 'Driveway Zone'
                                : 'Water Tank Scaffold'
                            );
                          }}
                          className={cn(
                            'py-1 rounded-md text-[11px] font-medium border cursor-pointer',
                            extKind === k.id
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700'
                          )}
                        >
                          {k.label}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={extName}
                      onChange={(e) => setExtName(e.target.value)}
                      className="h-8 text-xs bg-white dark:bg-zinc-900"
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      <Input
                        type="number"
                        step={0.5}
                        placeholder="X"
                        value={extX}
                        onChange={(e) => setExtX(Number(e.target.value))}
                        className="h-7 text-xs bg-white dark:bg-zinc-900"
                      />
                      <Input
                        type="number"
                        step={0.5}
                        placeholder="Z"
                        value={extZ}
                        onChange={(e) => setExtZ(Number(e.target.value))}
                        className="h-7 text-xs bg-white dark:bg-zinc-900"
                      />
                      <Input
                        type="number"
                        step={0.2}
                        placeholder={extKind === 'tankScaffold' ? 'Height' : 'Width'}
                        value={extKind === 'tankScaffold' ? extH : extW}
                        onChange={(e) =>
                          extKind === 'tankScaffold'
                            ? setExtH(Number(e.target.value))
                            : setExtW(Number(e.target.value))
                        }
                        className="h-7 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={isBusy || !activePropertyId}
                      className="w-full h-8 text-xs"
                    >
                      Add to Property Root
                    </Button>
                  </form>
                </div>
              )}

              {/* TAB 2: ROOM / SECTION DIMENSIONS & OUTLINE EDITOR */}
              {activeTab === 'outline' && (
                <div className="space-y-4">
                  {/* Live Room & Section Dimension Editor */}
                  <form
                    onSubmit={handleApplySpaceDimensions}
                    onFocus={() => setOutlineFocusMode('dimensions')}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Ruler className="h-3.5 w-3.5 text-primary" />
                        <span>Room &amp; Section Dimensions</span>
                      </span>
                      <div className="flex rounded-md border border-slate-200 dark:border-zinc-700 overflow-hidden">
                        {(['room', 'section'] as const).map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => {
                              setOutlineFocusMode('dimensions');
                              setDimSpaceKind(k);
                              setDimSpaceId('');
                            }}
                            className={cn(
                              'px-2 py-0.5 text-[10px] font-semibold capitalize cursor-pointer',
                              dimSpaceKind === k
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400'
                            )}
                          >
                            {k}
                          </button>
                        ))}
                      </div>
                    </div>

                    <select
                      value={dimSpaceId}
                      onChange={(e) => {
                        setOutlineFocusMode('dimensions');
                        const val = e.target.value ? Number(e.target.value) : '';
                        setDimSpaceId(val);
                        if (typeof val === 'number') syncDimensionsFromSpace(dimSpaceKind, val);
                      }}
                      className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                    >
                      <option value="">
                        Select {dimSpaceKind === 'room' ? 'Room' : 'Section'} to resize/build...
                      </option>
                      {dimSpaceKind === 'room'
                        ? visibleRooms.map((r) => (
                            <option key={r.dbId} value={r.dbId}>
                              {r.name}
                            </option>
                          ))
                        : visibleSections.map((s) => (
                            <option key={s.dbId} value={s.dbId}>
                              {s.name} (ID: {s.dbId})
                            </option>
                          ))}
                    </select>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="text-[10px] text-slate-500">Width (m)</label>
                        <Input
                          type="number"
                          step={0.25}
                          min={0.5}
                          value={dimWidth}
                          onChange={(e) => {
                            setOutlineFocusMode('dimensions');
                            setDimWidth(Number(e.target.value));
                          }}
                          className="h-7 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Depth (m)</label>
                        <Input
                          type="number"
                          step={0.25}
                          min={0.5}
                          value={dimDepth}
                          onChange={(e) => {
                            setOutlineFocusMode('dimensions');
                            setDimDepth(Number(e.target.value));
                          }}
                          className="h-7 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Height (m)</label>
                        <Input
                          type="number"
                          step={0.1}
                          min={0.5}
                          value={dimHeight}
                          onChange={(e) => {
                            setOutlineFocusMode('dimensions');
                            setDimHeight(Number(e.target.value));
                          }}
                          className="h-7 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Center X</label>
                        <Input
                          type="number"
                          step={0.25}
                          value={dimCenterX}
                          onChange={(e) => {
                            setOutlineFocusMode('dimensions');
                            setDimCenterX(Number(e.target.value));
                          }}
                          className="h-7 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Center Z</label>
                        <Input
                          type="number"
                          step={0.25}
                          value={dimCenterZ}
                          onChange={(e) => {
                            setOutlineFocusMode('dimensions');
                            setDimCenterZ(Number(e.target.value));
                          }}
                          className="h-7 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Wall Thick</label>
                        <Input
                          type="number"
                          step={0.02}
                          min={0.05}
                          value={dimThickness}
                          onChange={(e) => {
                            setOutlineFocusMode('dimensions');
                            setDimThickness(Number(e.target.value));
                          }}
                          className="h-7 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={dimMaterial}
                        onChange={(e) => setDimMaterial(e.target.value as any)}
                        className="h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                      >
                        <option value="concrete">Concrete</option>
                        <option value="brick">Brick</option>
                        <option value="drywall">Drywall</option>
                        <option value="wood">Wood</option>
                        <option value="metal">Metal</option>
                        <option value="glass">Glass</option>
                      </select>
                      <Button
                        type="submit"
                        disabled={isBusy || !activePropertyId || !dimSpaceId}
                        className="flex-1 h-7 text-xs gap-1"
                      >
                        <Maximize2 className="h-3 w-3" />
                        <span>Apply / Build Dimensions</span>
                      </Button>
                    </div>
                  </form>

                  <div onPointerDown={() => setOutlineFocusMode('polygon')}>
                    <RoomOutlineEditor
                      floors={floors}
                      rooms={visibleRooms}
                      selectedFloorId={bindTargetFloorId ? Number(bindTargetFloorId) : floors[0]?.id ?? null}
                      selectedRoomId={bindRoomId ? Number(bindRoomId) : null}
                      isBusy={isBusy}
                      onOutlineDraftChange={setOutlineDraft}
                      onSaveOutline={handleSaveOutline}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: ARCHITECTURAL GEOMETRY BUILDERS + DRAG-AND-DROP PALETTE */}
              {activeTab === 'architecture' && (
                <div className="space-y-3 text-xs">
                  {/* Drag & Drop 3D Architecture Components Palette */}
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/70 space-y-2">
                    <div className="font-bold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                      <span>Drag &amp; Drop onto 3D Scene</span>
                      <span className="text-[10px] font-normal text-slate-500">
                        Walls to floor · Openings to walls
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          {
                            label: 'Solid Wall (4m)',
                            payload: {
                              dragKind: 'wall',
                              label: 'Solid Wall',
                              style: 'solid',
                              material: 'concrete',
                              defaultLength: 4,
                              height: 2.8,
                              thickness: 0.18,
                            },
                          },
                          {
                            label: 'Glass Wall (3m)',
                            payload: {
                              dragKind: 'wall',
                              label: 'Glass Partition',
                              style: 'glassPanel',
                              material: 'glass',
                              defaultLength: 3,
                              height: 2.6,
                              thickness: 0.08,
                            },
                          },
                          {
                            label: 'Space Box (4×4m)',
                            payload: {
                              dragKind: 'roomBox',
                              label: 'Space Box',
                              width: 4,
                              depth: 4,
                              height: 2.8,
                              material: 'drywall',
                            },
                          },
                          {
                            label: 'Window (1.2×1.2m)',
                            payload: {
                              dragKind: 'opening',
                              label: 'Window',
                              openingKind: SpatialOpeningKind.Window,
                              width: 1.2,
                              height: 1.2,
                              sillHeight: 0.9,
                            },
                          },
                          {
                            label: 'Door (0.95×2.1m)',
                            payload: {
                              dragKind: 'opening',
                              label: 'Door',
                              openingKind: SpatialOpeningKind.Door,
                              width: 0.95,
                              height: 2.1,
                              sillHeight: 0,
                            },
                          },
                        ] satisfies { label: string; payload: SpatialDragPayload }[]
                      ).map((chip) => (
                        <div
                          key={chip.label}
                          draggable
                          onDragStart={(e) => startDragPayload(e, chip.payload)}
                          onDragEnd={() => setActiveDragPayload(null)}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-primary cursor-grab active:cursor-grabbing text-[11px] font-medium select-none transition-colors"
                        >
                          <GripVertical className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{chip.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {(
                      [
                        { id: 'wall', label: 'Walls' },
                        { id: 'slab', label: 'Slabs' },
                        { id: 'roof', label: 'Roof' },
                        { id: 'stair', label: 'Stairs' },
                        { id: 'pool', label: 'Pool' },
                      ] as const
                    ).map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setArchTool(tool.id)}
                        className={cn(
                          'py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors',
                          archTool === tool.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                        )}
                      >
                        {tool.label}
                      </button>
                    ))}
                  </div>

                  {/* SHARED WALLS, OPENINGS & GLASS */}
                  {archTool === 'wall' && (
                    <form onSubmit={handleCreateSharedWall} className="space-y-2.5">
                      <div className="font-bold text-slate-900 dark:text-zinc-100">
                        Shared Wall, Glass, Railing & Openings
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={wallName}
                          onChange={(e) => setWallName(e.target.value)}
                          placeholder="Wall Name"
                          className="h-8 text-xs bg-white dark:bg-zinc-900"
                        />
                        <select
                          value={wallFloorId}
                          onChange={(e) => setWallFloorId(e.target.value)}
                          className="h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                        >
                          <option value="">Floor...</option>
                          {floors.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="text-[10px] text-slate-500">X1</label>
                          <Input
                            type="number"
                            step={0.25}
                            value={wallX1}
                            onChange={(e) => setWallX1(Number(e.target.value))}
                            className="h-7 text-xs bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Z1</label>
                          <Input
                            type="number"
                            step={0.25}
                            value={wallZ1}
                            onChange={(e) => setWallZ1(Number(e.target.value))}
                            className="h-7 text-xs bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">X2</label>
                          <Input
                            type="number"
                            step={0.25}
                            value={wallX2}
                            onChange={(e) => setWallX2(Number(e.target.value))}
                            className="h-7 text-xs bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Z2</label>
                          <Input
                            type="number"
                            step={0.25}
                            value={wallZ2}
                            onChange={(e) => setWallZ2(Number(e.target.value))}
                            className="h-7 text-xs bg-white dark:bg-zinc-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="text-[10px] text-slate-500">Style</label>
                          <select
                            value={wallStyle}
                            onChange={(e) => setWallStyle(e.target.value as any)}
                            className="w-full h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 text-xs"
                          >
                            <option value="solid">Solid Wall</option>
                            <option value="partial">Partial Wall</option>
                            <option value="glassPanel">Glass Panel</option>
                            <option value="railing">Railing</option>
                            <option value="openBoundary">Open Boundary</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Material</label>
                          <select
                            value={wallMat}
                            onChange={(e) => setWallMat(e.target.value as any)}
                            className="w-full h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 text-xs"
                          >
                            <option value="concrete">Concrete</option>
                            <option value="brick">Brick</option>
                            <option value="drywall">Drywall</option>
                            <option value="wood">Wood</option>
                            <option value="metal">Metal</option>
                            <option value="glass">Glass</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">H (multi-floor)</label>
                          <Input
                            type="number"
                            step={0.2}
                            value={wallHeight}
                            onChange={(e) => setWallHeight(Number(e.target.value))}
                            className="h-7 text-xs bg-white dark:bg-zinc-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="text-[10px] text-slate-500">Curve Type</label>
                          <select
                            value={wallCurve}
                            onChange={(e) => setWallCurve(e.target.value as SegmentCurveKind)}
                            className="w-full h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 text-xs"
                          >
                            <option value="line">Straight Line</option>
                            <option value="arc">Circular Arc</option>
                            <option value="bezier">Bezier Curve</option>
                          </select>
                        </div>
                        {wallCurve === 'arc' && (
                          <div>
                            <label className="text-[10px] text-slate-500">Arc Bulge (m)</label>
                            <Input
                              type="number"
                              step={0.1}
                              value={wallArcBulge}
                              onChange={(e) => setWallArcBulge(Number(e.target.value))}
                              className="h-7 text-xs bg-white dark:bg-zinc-900"
                            />
                          </div>
                        )}
                      </div>

                      {/* Shared Space Associations */}
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">
                          Shared Between Spaces (Single Physical Wall Record)
                        </label>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                          {visibleRooms.map((r) => {
                            const rid = getRawEntityId(r.id);
                            const active = wallSpaceRefs.includes(rid);
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() =>
                                  setWallSpaceRefs((prev) =>
                                    active ? prev.filter((x) => x !== rid) : [...prev, rid]
                                  )
                                }
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-[10px] border cursor-pointer',
                                  active
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                                )}
                              >
                                {r.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Openings inside Physical Wall */}
                      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-2">
                        <div className="font-semibold">Openings on Wall (Door / Window / Gate)</div>
                        <div className="grid grid-cols-5 gap-1">
                          <select
                            value={newOpKind}
                            onChange={(e) => setNewOpKind(Number(e.target.value) as SpatialOpeningKind)}
                            className="col-span-2 h-7 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] px-1"
                          >
                            <option value={SpatialOpeningKind.Door}>Door</option>
                            <option value={SpatialOpeningKind.Window}>Window</option>
                            <option value={SpatialOpeningKind.Gate}>Gate</option>
                            <option value={SpatialOpeningKind.Generic}>Generic</option>
                          </select>
                          <Input
                            type="number"
                            step={0.1}
                            placeholder="Off"
                            value={newOpOffset}
                            onChange={(e) => setNewOpOffset(Number(e.target.value))}
                            className="h-7 text-[11px] bg-white dark:bg-zinc-900"
                            title="Offset along wall (m)"
                          />
                          <Input
                            type="number"
                            step={0.1}
                            placeholder="W"
                            value={newOpWidth}
                            onChange={(e) => setNewOpWidth(Number(e.target.value))}
                            className="h-7 text-[11px] bg-white dark:bg-zinc-900"
                            title="Opening Width (m)"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setWallOpenings((prev) => [
                                ...prev,
                                {
                                  id: `op-${Date.now()}`,
                                  kind: newOpKind,
                                  offsetAlongWall: newOpOffset,
                                  sillHeight: newOpKind === SpatialOpeningKind.Window ? (newOpSill || 0.9) : newOpSill,
                                  width: newOpWidth,
                                  height: newOpHeight,
                                  hasFrame: true,
                                  hasGlass: newOpKind === SpatialOpeningKind.Window,
                                },
                              ])
                            }
                            className="h-7 px-1.5 text-[10px]"
                          >
                            <Plus className="h-3 w-3" /> Add
                          </Button>
                        </div>
                        {wallOpenings.length > 0 && (
                          <div className="space-y-1">
                            {wallOpenings.map((op) => (
                              <div
                                key={op.id}
                                className="flex items-center justify-between px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px]"
                              >
                                <span>
                                  {SpatialOpeningKind[op.kind]} · @{op.offsetAlongWall}m · {op.width}×{op.height}m
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setWallOpenings((prev) => prev.filter((x) => x.id !== op.id))
                                  }
                                  className="text-red-500 cursor-pointer"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button type="submit" disabled={isBusy || !activePropertyId} className="w-full h-8 text-xs">
                        Save Shared Wall Geometry
                      </Button>
                    </form>
                  )}

                  {/* SHARED SLABS & VOIDS */}
                  {archTool === 'slab' && (
                    <form onSubmit={handleCreateSlabOrVoid} className="space-y-2.5">
                      <div className="font-bold text-slate-900 dark:text-zinc-100">
                        Shared Floor/Ceiling Slab & Stairwell Voids
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSlabMode('slab')}
                          className={cn(
                            'py-1 rounded-md border text-[11px] font-semibold cursor-pointer',
                            slabMode === 'slab'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                          )}
                        >
                          Physical Slab
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlabMode('void')}
                          className={cn(
                            'py-1 rounded-md border text-[11px] font-semibold cursor-pointer',
                            slabMode === 'void'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                          )}
                        >
                          Slab Void Cutout
                        </button>
                      </div>
                      <Input
                        value={slabName}
                        onChange={(e) => setSlabName(e.target.value)}
                        className="h-8 text-xs bg-white dark:bg-zinc-900"
                      />
                      <select
                        value={slabFloorId}
                        onChange={(e) => setSlabFloorId(e.target.value)}
                        className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                      >
                        <option value="">Elevation Floor...</option>
                        {floors.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.elevation}m)
                          </option>
                        ))}
                      </select>

                      {slabMode === 'slab' && (
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">
                            Shared Floors Served (e.g. Underground Ceiling = Ground Floor)
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {floors.map((f) => {
                              const checked = slabSharedFloors.includes(f.id);
                              return (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() =>
                                    setSlabSharedFloors((prev) =>
                                      checked ? prev.filter((x) => x !== f.id) : [...prev, f.id]
                                    )
                                  }
                                  className={cn(
                                    'px-2 py-0.5 rounded-full text-[10px] border cursor-pointer',
                                    checked
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                                  )}
                                >
                                  {f.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="text-[10px] text-slate-500">Center X</label>
                          <Input type="number" step={0.25} value={slabCX} onChange={(e) => setSlabCX(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Center Z</label>
                          <Input type="number" step={0.25} value={slabCZ} onChange={(e) => setSlabCZ(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Width</label>
                          <Input type="number" step={0.25} value={slabW} onChange={(e) => setSlabW(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Depth</label>
                          <Input type="number" step={0.25} value={slabD} onChange={(e) => setSlabD(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                      </div>
                      <Button type="submit" disabled={isBusy || !activePropertyId} className="w-full h-8 text-xs">
                        {slabMode === 'void' ? 'Carve Slab Void Cutout' : 'Create Shared Physical Slab'}
                      </Button>
                    </form>
                  )}

                  {/* BUILDING ROOF */}
                  {archTool === 'roof' && (
                    <form onSubmit={handleCreateRoof} className="space-y-2.5">
                      <div className="font-bold text-slate-900 dark:text-zinc-100">
                        Building-Level Roof Geometry
                      </div>
                      <Input
                        value={roofName}
                        onChange={(e) => setRoofName(e.target.value)}
                        className="h-8 text-xs bg-white dark:bg-zinc-900"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <select
                          value={roofBuildingId}
                          onChange={(e) => setRoofBuildingId(e.target.value)}
                          className="h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                        >
                          <option value="">Select Building...</option>
                          {buildings.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                        <select
                          value={roofStyle}
                          onChange={(e) => setRoofStyle(e.target.value as any)}
                          className="h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                        >
                          <option value="flat">Flat Roof</option>
                          <option value="slantedEdges">Slanted Edges</option>
                          <option value="pitched">Pitched Section</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="text-[10px] text-slate-500">Elev Y</label>
                          <Input type="number" step={0.2} value={roofElev} onChange={(e) => setRoofElev(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Overhang</label>
                          <Input type="number" step={0.1} value={roofOverhang} onChange={(e) => setRoofOverhang(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Parapet H</label>
                          <Input type="number" step={0.1} value={roofParapetH} onChange={(e) => setRoofParapetH(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Slope °</label>
                          <Input type="number" step={1} value={roofSlope} onChange={(e) => setRoofSlope(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                      </div>
                      <Button type="submit" disabled={isBusy || !activePropertyId} className="w-full h-8 text-xs">
                        Add Roof Section
                      </Button>
                    </form>
                  )}

                  {/* MULTI-FLIGHT U-TURN STAIRCASE */}
                  {archTool === 'stair' && (
                    <form onSubmit={handleCreateStairs} className="space-y-2.5">
                      <div className="font-bold text-slate-900 dark:text-zinc-100">
                        Staircase Builder (Flights, Landings & Voids)
                      </div>
                      <Input
                        value={stairName}
                        onChange={(e) => setStairName(e.target.value)}
                        className="h-8 text-xs bg-white dark:bg-zinc-900"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStairLayout('uturn')}
                          className={cn(
                            'py-1.5 rounded-md border text-[11px] font-semibold cursor-pointer',
                            stairLayout === 'uturn'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                          )}
                        >
                          U-Turn (Reversing)
                        </button>
                        <button
                          type="button"
                          onClick={() => setStairLayout('straight')}
                          className={cn(
                            'py-1.5 rounded-md border text-[11px] font-semibold cursor-pointer',
                            stairLayout === 'straight'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                          )}
                        >
                          Single Straight
                        </button>
                      </div>
                      <select
                        value={stairFloorId}
                        onChange={(e) => setStairFloorId(e.target.value)}
                        className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                      >
                        <option value="">Base Floor...</option>
                        {floors.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.elevation}m)
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="text-[10px] text-slate-500">Width (m)</label>
                          <Input type="number" step={0.1} value={stairWidth} onChange={(e) => setStairWidth(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Run (m)</label>
                          <Input type="number" step={0.2} value={stairRun} onChange={(e) => setStairRun(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Total Rise (m)</label>
                          <Input type="number" step={0.1} value={stairRise} onChange={(e) => setStairRise(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={stairIncludeVoid}
                          onChange={(e) => setStairIncludeVoid(e.target.checked)}
                        />
                        Auto-create stairwell slab Void cutout
                      </label>
                      <Button type="submit" disabled={isBusy || !activePropertyId} className="w-full h-8 text-xs">
                        Generate Staircase Flights
                      </Button>
                    </form>
                  )}

                  {/* INDOOR SWIMMING POOL */}
                  {archTool === 'pool' && (
                    <form onSubmit={handleCreatePool} className="space-y-2.5">
                      <div className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Waves className="h-3.5 w-3.5 text-sky-500" />
                        <span>INDOOR Swimming Pool (Room-Contained)</span>
                      </div>
                      <Input
                        value={poolName}
                        onChange={(e) => setPoolName(e.target.value)}
                        className="h-8 text-xs bg-white dark:bg-zinc-900"
                      />
                      <select
                        value={poolRoomId}
                        onChange={(e) => setPoolRoomId(e.target.value)}
                        className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                      >
                        <option value="">Select Containing Indoor Room (Required)...</option>
                        {visibleRooms.map((r) => (
                          <option key={r.id} value={getRawEntityId(r.id)}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={poolFloorId}
                        onChange={(e) => setPoolFloorId(e.target.value)}
                        className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                      >
                        <option value="">Floor...</option>
                        {floors.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="text-[10px] text-slate-500">Len (m)</label>
                          <Input type="number" step={0.5} value={poolL} onChange={(e) => setPoolL(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Wid (m)</label>
                          <Input type="number" step={0.5} value={poolW} onChange={(e) => setPoolW(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Depth (m)</label>
                          <Input type="number" step={0.1} value={poolDepth} onChange={(e) => setPoolDepth(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Deck (m)</label>
                          <Input type="number" step={0.1} value={poolDeck} onChange={(e) => setPoolDeck(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                        </div>
                      </div>
                      <Button type="submit" disabled={isBusy || !activePropertyId || !poolRoomId} className="w-full h-8 text-xs">
                        Add Indoor Pool to Room
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 4: DEVICES & LIGHT FIXTURE GROUPS */}
              {activeTab === 'devices' && (
                <form onSubmit={handlePlaceDevice} className="space-y-3 text-xs">
                  <div className="font-bold text-slate-900 dark:text-zinc-100">
                    Place Existing Smart Devices (Zero Duplicates)
                  </div>

                  {/* Target Kind */}
                  <div className="grid grid-cols-4 gap-1">
                    {(
                      [
                        { kind: SpatialTargetKind.Light, label: 'Light' },
                        { kind: SpatialTargetKind.Door, label: 'Door' },
                        { kind: SpatialTargetKind.Window, label: 'Window' },
                        { kind: SpatialTargetKind.Camera, label: 'Camera' },
                        { kind: SpatialTargetKind.Appliance, label: 'Appliance' },
                        { kind: SpatialTargetKind.External, label: 'External' },
                        { kind: SpatialTargetKind.Utility, label: 'Utility' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.kind}
                        type="button"
                        onClick={() => {
                          setTargetKind(item.kind);
                          setSelectedDeviceId('');
                          if (item.kind !== SpatialTargetKind.Light) setFixtureMode(false);
                        }}
                        className={cn(
                          'py-1 rounded-md text-[10px] font-semibold border cursor-pointer',
                          targetKind === item.kind
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Light Fixture Group Toggle */}
                  {targetKind === SpatialTargetKind.Light && (
                    <label className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 cursor-pointer">
                      <span className="font-semibold">Visual Light Fixture Group</span>
                      <input
                        type="checkbox"
                        checked={fixtureMode}
                        onChange={(e) => setFixtureMode(e.target.checked)}
                      />
                    </label>
                  )}

                  {fixtureMode && targetKind === SpatialTargetKind.Light ? (
                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/60 space-y-2">
                      <Input
                        value={fixtureGroupName}
                        onChange={(e) => setFixtureGroupName(e.target.value)}
                        placeholder="Fixture Group Name"
                        className="h-8 text-xs bg-white dark:bg-zinc-900"
                      />
                      <div className="grid grid-cols-3 gap-1.5">
                        <select
                          value={fixtureArrangement}
                          onChange={(e) => setFixtureArrangement(e.target.value as FixtureArrangement)}
                          className="col-span-2 h-7 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 text-xs"
                        >
                          <option value="individual">Individual</option>
                          <option value="squareGrid">Square Grid</option>
                          <option value="rectangularGrid">Rectangular Grid</option>
                          <option value="horizontalStrip">Horizontal Strip</option>
                          <option value="verticalStrip">Vertical Strip</option>
                        </select>
                        <Input
                          type="number"
                          step={0.1}
                          value={fixtureSpacing}
                          onChange={(e) => setFixtureSpacing(Number(e.target.value))}
                          title="Spacing (m)"
                          className="h-7 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <select
                        value={fixtureMounting}
                        onChange={(e) => setFixtureMounting(e.target.value as FixtureMountingStyle)}
                        className="w-full h-7 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 text-xs"
                      >
                        <option value="recessed">Recessed Mounting</option>
                        <option value="surface">Surface Mounting</option>
                        <option value="pendant">Pendant / Suspended</option>
                        <option value="track">Track Rail</option>
                      </select>
                      <div className="text-[10px] text-slate-500">
                        Select existing Lights (each retains independent ID & live state):
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {filteredDevicesForTarget.map((d) => {
                          const rawId = getRawEntityId(d.id);
                          const active = fixtureLightIds.includes(rawId);
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() =>
                                setFixtureLightIds((prev) =>
                                  active ? prev.filter((x) => x !== rawId) : [...prev, rawId]
                                )
                              }
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] border cursor-pointer',
                                active
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700'
                              )}
                            >
                              {d.name} ({d.status})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-500">
                          Existing Device Record (Select or Drag Card into 3D)
                        </label>
                        <select
                          value={selectedDeviceId}
                          onChange={(e) => setSelectedDeviceId(e.target.value)}
                          className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                        >
                          <option value="">
                            Select {SpatialTargetKind[targetKind]} ({filteredDevicesForTarget.length})...
                          </option>
                          {filteredDevicesForTarget.map((d) => (
                            <option key={d.id} value={getRawEntityId(d.id)}>
                              {d.name} — {d.status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {filteredDevicesForTarget.length > 0 && (
                        <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto pr-0.5">
                          {filteredDevicesForTarget.map((d) => {
                            const rawId = getRawEntityId(d.id);
                            const isPlaced = placements.some(
                              (p) => p.targetKind === targetKind && p.targetId === rawId
                            );
                            return (
                              <div
                                key={d.id}
                                draggable
                                onDragStart={(e) =>
                                  startDragPayload(e, {
                                    dragKind: 'device',
                                    label: d.name,
                                    targetKind,
                                    targetId: rawId,
                                    utilityType: d.utilityType,
                                    utilityComponent: d.utilityComponent,
                                  })
                                }
                                onDragEnd={() => setActiveDragPayload(null)}
                                onClick={() => setSelectedDeviceId(String(rawId))}
                                className={cn(
                                  'flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border border-dashed cursor-grab active:cursor-grabbing text-[11px] transition-colors',
                                  selectedDeviceId === String(rawId)
                                    ? 'border-primary bg-primary/5 text-slate-900 dark:text-zinc-100'
                                    : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-primary'
                                )}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <GripVertical className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span className="truncate font-medium">{d.name}</span>
                                </div>
                                <span className="text-[10px] font-mono shrink-0 text-slate-500 dark:text-zinc-400">
                                  {isPlaced ? 'Placed' : 'Drag to 3D'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Parent Container & Attachment */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[10px] text-slate-500">Parent Node Kind</label>
                      <select
                        value={parentKind}
                        onChange={(e) => {
                          setParentKind(Number(e.target.value) as SpatialNodeKind);
                          setParentId('');
                        }}
                        className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 text-xs"
                      >
                        <option value={SpatialNodeKind.Floor}>Floor (3)</option>
                        <option value={SpatialNodeKind.Room}>Room (5)</option>
                        <option value={SpatialNodeKind.Section}>Section (4)</option>
                        <option value={SpatialNodeKind.Structure}>Scaffold Structure (7)</option>
                        <option value={SpatialNodeKind.ExteriorArea}>Exterior Area (6)</option>
                        <option value={SpatialNodeKind.Building}>Building (2)</option>
                        <option value={SpatialNodeKind.Property}>Property Root (1)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Target Parent</label>
                      <select
                        value={parentId}
                        onChange={(e) => setParentId(e.target.value)}
                        className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 text-xs"
                      >
                        <option value="">Default / Selected...</option>
                        {parentKind === SpatialNodeKind.Floor &&
                          floors.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        {parentKind === SpatialNodeKind.Room &&
                          visibleRooms.map((r) => (
                            <option key={r.dbId} value={r.dbId}>{r.name}</option>
                          ))}
                        {parentKind === SpatialNodeKind.Section &&
                          visibleSections.map((s) => (
                            <option key={s.dbId} value={s.dbId}>{s.name} (ID: {s.dbId})</option>
                          ))}
                        {parentKind === SpatialNodeKind.Building &&
                          buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        {parentKind === SpatialNodeKind.Structure &&
                          scaffoldGeometries.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        {parentKind === SpatialNodeKind.ExteriorArea &&
                          exteriorGeometries.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        {parentKind === SpatialNodeKind.Property && activePropertyId && (
                          <option value={activePropertyId}>Property #{activePropertyId}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500">Attachment Mode</label>
                    <select
                      value={attachmentKind}
                      onChange={(e) => setAttachmentKind(Number(e.target.value) as SpatialAttachmentKind)}
                      className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                    >
                      <option value={SpatialAttachmentKind.Free}>Free (1)</option>
                      <option value={SpatialAttachmentKind.WallMounted}>WallMounted (2)</option>
                      <option value={SpatialAttachmentKind.CeilingMounted}>CeilingMounted (3)</option>
                      <option value={SpatialAttachmentKind.FloorMounted}>FloorMounted (4)</option>
                      <option value={SpatialAttachmentKind.OpeningMounted}>OpeningMounted (5)</option>
                      <option value={SpatialAttachmentKind.StructureMounted}>StructureMounted (6)</option>
                      <option value={SpatialAttachmentKind.Suspended}>Suspended (7)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[10px] text-slate-500">X (m)</label>
                      <Input type="number" step={0.2} value={placeX} onChange={(e) => setPlaceX(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Y (m)</label>
                      <Input type="number" step={0.2} value={placeY} onChange={(e) => setPlaceY(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Z (m)</label>
                      <Input type="number" step={0.2} value={placeZ} onChange={(e) => setPlaceZ(Number(e.target.value))} className="h-7 text-xs bg-white dark:bg-zinc-900" />
                    </div>
                  </div>

                  <Button type="submit" disabled={isBusy || !activePropertyId} className="w-full h-8 text-xs gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    <span>{fixtureMode ? 'Create Light Fixture Group' : 'Place Device in 3D'}</span>
                  </Button>
                </form>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Optimistic Concurrency Conflict Dialog */}
      <Dialog open={Boolean(conflictMessage)} onOpenChange={(o) => !o && setConflictMessage(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 z-[150]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Optimistic Concurrency Conflict
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-zinc-400">
              {conflictMessage ||
                'This spatial object was modified elsewhere. Reload the latest scene from the server instead of overwriting.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConflictMessage(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setConflictMessage(null);
                if (activePropertyId) await loadScene(activePropertyId);
              }}
            >
              Reload Server Scene
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Contract & Backend Endpoint Documentation Dialog */}
      <Dialog open={isContractsModalOpen} onOpenChange={setIsContractsModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 z-[150]">
          <DialogHeader>
            <DialogTitle>Spatial API Contracts & Validation Status</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-zinc-400">
              Documented implemented Swagger endpoints vs unimplemented endpoints. Geometry validation is authoritative on the backend; client-side checks do not claim exact solid collision detection.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1">
            {SPATIAL_ENDPOINT_CONTRACTS.map((ep) => (
              <div
                key={ep.path}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800">
                      {ep.method}
                    </span>
                    <span className="truncate">{ep.name}</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 break-all">
                    {ep.path}
                  </div>
                  <div className="text-slate-600 dark:text-zinc-400 mt-1">{ep.notes}</div>
                </div>
                <Badge
                  variant={ep.implementedInBackend ? 'default' : 'outline'}
                  className={cn(
                    'shrink-0 text-[10px]',
                    !ep.implementedInBackend &&
                      'border-amber-500/60 text-amber-600 dark:text-amber-400'
                  )}
                >
                  {ep.implementedInBackend ? 'Connected' : 'Pending Backend'}
                </Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsContractsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
