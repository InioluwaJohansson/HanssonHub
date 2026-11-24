import * as React from 'react';
import {
  Box,
  Building2,
  Camera,
  Check,
  Columns3,
  CopyPlus,
  DoorOpen,
  Droplets,
  Eye,
  Flame,
  Grid2x2,
  Home,
  Layers,
  LayoutGrid,
  Lightbulb,
  Maximize2,
  Minimize2,
  Moon,
  PanelLeft,
  PanelRight,
  Plug,
  Plus,
  Radio,
  RotateCcw,
  Shield,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  Trees,
  Waves,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Device, Room, Section } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { CameraPreset, ThreeHouseViewport } from './ThreeHouseViewport';
import {
  Building3D,
  createEmptyHouseModel,
  createSampleHouseModel,
  FLOOR_LABELS,
  FloorLevel,
  FacilityKind,
  MATERIAL_OPTIONS,
  MaterialType,
  MountSurface,
  PaletteDragPayload,
  PlacedFacility3D,
  PlacedUtility3D,
  Property3DModel,
  ROOF_STYLE_OPTIONS,
  RoofStyle,
  SelectedItemRef,
  UtilityKind,
  UtilityTargetScope,
  WALL_COLOR_SWATCHES,
} from './types';

interface House3DOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  rooms: Room[];
  sections: Section[];
  theme: 'light' | 'dark';
  onToggleDevice?: (id: string) => void;
}

const STORAGE_KEY = 'hanssonhub_3d_property_model_v1';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export const House3DOverlay: React.FC<House3DOverlayProps> = ({
  isOpen,
  onClose,
  devices,
  rooms,
  sections,
  theme,
  onToggleDevice,
}) => {
  const [model, setModel] = React.useState<Property3DModel>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Property3DModel;
        if (parsed && typeof parsed.width === 'number') return parsed;
      }
    } catch {
      // ignore corrupt storage
    }
    return createSampleHouseModel(rooms, sections, devices);
  });

  const [viewMode, setViewMode] = React.useState<'split' | '3d' | '2d'>('split');
  const [activeFloor, setActiveFloor] = React.useState<FloorLevel | 'all'>('all');
  const [blueprintFloor, setBlueprintFloor] = React.useState<FloorLevel>('ground');
  const [exploded, setExploded] = React.useState(false);
  const [cutaway, setCutaway] = React.useState(false);
  const [nightMode, setNightMode] = React.useState(theme === 'dark');
  const [showPalette, setShowPalette] = React.useState(true);
  const [showInspector, setShowInspector] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState<SelectedItemRef>({ type: 'building', id: 'bld-main' });
  const [cameraPresetRequest, setCameraPresetRequest] = React.useState<{
    preset: CameraPreset;
    seq: number;
  } | null>(null);

  // Blueprint SVG coordinate scale (pixels per meter) & drag-resize state
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [dragOp, setDragOp] = React.useState<{
    mode: 'move' | 'resize';
    target: NonNullable<SelectedItemRef>;
    startMouseX: number;
    startMouseY: number;
    origX: number;
    origZ: number;
    origW: number;
    origD: number;
  } | null>(null);

  // Persist changes locally
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
    } catch {
      // ignore storage quota
    }
  }, [model]);

  // Escape key closes overlay cleanly
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Keep activeFloor and blueprintFloor synced when focusing single floor
  React.useEffect(() => {
    if (activeFloor !== 'all') {
      setBlueprintFloor(activeFloor);
    }
  }, [activeFloor]);

  // Smart-home device categorization for palette & references
  const smartFacilities = React.useMemo(
    () =>
      devices.filter((d) =>
        ['door', 'window', 'camera', 'light', 'external'].includes(d.type as string)
      ),
    [devices]
  );

  const smartUtilities = React.useMemo(
    () => devices.filter((d) => d.type === 'utility'),
    [devices]
  );

  // Track which linked smart-home devices (non-lights) are already placed
  const placedLinkedFacilityIds = React.useMemo(() => {
    const map = new Map<string, number>();
    model.facilities.forEach((f) => {
      if (f.linkedDeviceId) {
        map.set(f.linkedDeviceId, (map.get(f.linkedDeviceId) || 0) + 1);
      }
    });
    return map;
  }, [model.facilities]);

  // Blueprint resize/move pointer handling
  React.useEffect(() => {
    if (!dragOp) return;

    const handleMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const viewW = model.width + 10;
      const viewD = model.depth + 10;
      const dxMeters = ((e.clientX - dragOp.startMouseX) / rect.width) * viewW;
      const dzMeters = ((e.clientY - dragOp.startMouseY) / rect.height) * viewD;

      const snap = (v: number) => Math.round(v * 2) / 2;

      setModel((prev) => {
        if (dragOp.target.type === 'property') {
          if (dragOp.mode === 'resize') {
            return {
              ...prev,
              width: Math.max(16, snap(dragOp.origW + dxMeters * 2)),
              depth: Math.max(14, snap(dragOp.origD + dzMeters * 2)),
            };
          }
          return prev;
        }

        const updateSizeOrPos = <T extends { id: string; x: number; z: number; width?: number; depth?: number }>(
          arr: T[],
          id: string,
          minW = 1.5,
          minD = 1.5
        ) =>
          arr.map((item) => {
            if (item.id !== id) return item;
            if (dragOp.mode === 'move') {
              return { ...item, x: snap(dragOp.origX + dxMeters), z: snap(dragOp.origZ + dzMeters) };
            }
            return {
              ...item,
              width: Math.max(minW, snap(dragOp.origW + dxMeters * 2)),
              depth: Math.max(minD, snap(dragOp.origD + dzMeters * 2)),
            };
          });

        switch (dragOp.target.type) {
          case 'building':
            return { ...prev, buildings: updateSizeOrPos(prev.buildings, dragOp.target.id, 4, 4) };
          case 'section':
            return { ...prev, sections: updateSizeOrPos(prev.sections, dragOp.target.id, 2.5, 2.5) };
          case 'room':
            return { ...prev, rooms: updateSizeOrPos(prev.rooms, dragOp.target.id, 2, 2) };
          case 'slab':
            return { ...prev, slabs: updateSizeOrPos(prev.slabs, dragOp.target.id, 2, 2) };
          case 'opening':
            return { ...prev, openings: updateSizeOrPos(prev.openings, dragOp.target.id, 1.8, 2) };
          case 'grass':
            return { ...prev, grassPatches: updateSizeOrPos(prev.grassPatches, dragOp.target.id, 2, 2) };
          case 'pool':
            return { ...prev, pools: updateSizeOrPos(prev.pools, dragOp.target.id, 2.5, 2) };
          case 'scaffold':
            return { ...prev, scaffolds: updateSizeOrPos(prev.scaffolds, dragOp.target.id, 1.8, 1.8) };
          case 'support':
            return { ...prev, supports: updateSizeOrPos(prev.supports, dragOp.target.id) };
          case 'facility':
            return { ...prev, facilities: updateSizeOrPos(prev.facilities, dragOp.target.id) };
          case 'utility':
            return { ...prev, utilities: updateSizeOrPos(prev.utilities, dragOp.target.id) };
          default:
            return prev;
        }
      });
    };

    const handleUp = () => setDragOp(null);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragOp, model.width, model.depth]);

  // Core Spatial Drop Rule Resolver (shared between 2D Blueprint drop & 3D Viewport drop!)
  const handleDropPayload = React.useCallback(
    (payload: PaletteDragPayload, worldX: number, worldZ: number) => {
      const snap = (n: number) => Math.round(n * 2) / 2;
      const wx = snap(worldX);
      const wz = snap(worldZ);

      // 1. Property creation first!
      if (payload.category === 'property') {
        setModel((prev) => ({
          ...prev,
          hasProperty: true,
          width: prev.width || 36,
          depth: prev.depth || 26,
        }));
        setSelectedItem({ type: 'property' });
        toast.success('Property boundary created! Resize it or drag Buildings & Yard items inside.');
        return;
      }

      if (!model.hasProperty) {
        toast.warning('Start by dragging a Property onto the canvas first!');
        return;
      }

      // Find nearest building at drop coordinate
      const hitBuilding = model.buildings.find(
        (b) =>
          Math.abs(wx - b.x) <= b.width / 2 && Math.abs(wz - b.z) <= b.depth / 2
      );
      const fallbackBuilding = model.buildings[0] || null;
      const targetBuilding = hitBuilding || fallbackBuilding;

      const localBldX = targetBuilding ? snap(wx - targetBuilding.x) : 0;
      const localBldZ = targetBuilding ? snap(wz - targetBuilding.z) : 0;

      // Check if drop landed on an Opening or Slab (ONLY Staircase can attach!)
      const hitOpening = targetBuilding
        ? model.openings.find(
            (o) =>
              o.buildingId === targetBuilding.id &&
              o.floor === blueprintFloor &&
              Math.abs(localBldX - o.x) <= o.width / 2 + 0.4 &&
              Math.abs(localBldZ - o.z) <= o.depth / 2 + 0.4
          )
        : undefined;

      const hitSlab = targetBuilding
        ? model.slabs.find(
            (s) =>
              s.buildingId === targetBuilding.id &&
              s.floor === blueprintFloor &&
              Math.abs(localBldX - s.x) <= s.width / 2 + 0.4 &&
              Math.abs(localBldZ - s.z) <= s.depth / 2 + 0.4
          )
        : undefined;

      if ((hitOpening || hitSlab) && payload.category !== 'staircase') {
        toast.error('Only a Staircase can be attached to a floor opening or slab.');
        return;
      }

      // 2. Building
      if (payload.category === 'building') {
        const id = uid('bld');
        const newBld: Building3D = {
          id,
          name: `Building ${model.buildings.length + 1}`,
          x: wx,
          z: wz,
          width: 12,
          depth: 10,
          floors: ['underground', 'ground', 'top'],
          floorHeight: 3.2,
          wallColor: '#f4f1ea',
          wallMaterial: 'plaster',
          doorMaterial: 'wood',
          railingMaterial: 'glass',
          hasVeranda: false,
          verandaDepth: 2.4,
          roof: {
            style: 'gable',
            color: '#334155',
            material: 'metal',
            height: 2.5,
            overhang: 0.6,
            hasGlassOpening: true,
            glassOpeningWidthRatio: 0.4,
            glassOpeningDepthRatio: 0.45,
          },
        };
        setModel((prev) => ({ ...prev, buildings: [...prev.buildings, newBld] }));
        setSelectedItem({ type: 'building', id });
        toast.success(`Added ${newBld.name} with Underground, Ground & Top floors.`);
        return;
      }

      // 3. Section
      if (payload.category === 'section') {
        const id = uid('sec');
        const inBld = !!hitBuilding;
        const newSec = {
          id,
          buildingId: inBld ? hitBuilding!.id : null,
          floor: inBld ? blueprintFloor : 'ground',
          name: payload.label || `Section ${model.sections.length + 1}`,
          x: inBld ? localBldX : wx,
          z: inBld ? localBldZ : wz,
          width: 8,
          depth: 6,
          color: '#e2ddd3',
          isVeranda: false,
          hasRailing: !inBld,
          railingMaterial: 'glass' as MaterialType,
        };
        setModel((prev) => ({ ...prev, sections: [...prev.sections, newSec] }));
        setSelectedItem({ type: 'section', id });
        toast.success(`Placed ${newSec.name}. Drag corners to resize!`);
        return;
      }

      // 4. Room (inside a Building / Section)
      if (payload.category === 'room') {
        if (!targetBuilding) {
          toast.warning('Add a Building first before placing Rooms.');
          return;
        }
        const hostSec =
          model.sections.find((s) => s.buildingId === targetBuilding.id && s.floor === blueprintFloor) ||
          model.sections[0];
        const id = uid('rm');
        const newRoom = {
          id,
          buildingId: targetBuilding.id,
          floor: blueprintFloor,
          sectionId: hostSec?.id || '',
          name: `Room ${model.rooms.length + 1}`,
          x: hitBuilding ? localBldX : 0,
          z: hitBuilding ? localBldZ : 0,
          width: 5.5,
          depth: 5.0,
          wallColor: targetBuilding.wallColor,
          floorColor: '#c9a97c',
          wallMaterial: targetBuilding.wallMaterial,
          doorMaterial: targetBuilding.doorMaterial,
          railingMaterial: targetBuilding.railingMaterial,
        };
        setModel((prev) => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
        setSelectedItem({ type: 'room', id });
        toast.success(`Added ${newRoom.name} on ${FLOOR_LABELS[blueprintFloor]}.`);
        return;
      }

      // 5. Half-Length Slab
      if (payload.category === 'slab') {
        if (!targetBuilding) {
          toast.warning('Add a Building first to create a Slab.');
          return;
        }
        const id = uid('slab');
        const newSlab = {
          id,
          buildingId: targetBuilding.id,
          floor: blueprintFloor,
          name: 'Half-Length Slab',
          x: hitBuilding ? localBldX : 0,
          z: hitBuilding ? localBldZ : 0,
          width: Math.max(4, targetBuilding.width * 0.48),
          depth: Math.max(3.5, targetBuilding.depth * 0.42),
          isHalfLength: true,
          attachedStaircaseId: null,
        };
        setModel((prev) => ({ ...prev, slabs: [...prev.slabs, newSlab] }));
        setSelectedItem({ type: 'slab', id });
        toast.success('Slab created — only a Staircase can attach to this slab.');
        return;
      }

      // 6. Floor Opening
      if (payload.category === 'opening') {
        if (!targetBuilding) {
          toast.warning('Add a Building first to create a Floor Opening.');
          return;
        }
        const id = uid('open');
        const newOpen = {
          id,
          buildingId: targetBuilding.id,
          floor: blueprintFloor,
          name: 'Floor Stairwell Opening',
          x: hitBuilding ? localBldX : 0,
          z: hitBuilding ? localBldZ : 0,
          width: 3.0,
          depth: 4.0,
          hasGlassRailing: true,
          railingMaterial: 'glass' as MaterialType,
          attachedStaircaseId: null,
        };
        setModel((prev) => ({ ...prev, openings: [...prev.openings, newOpen] }));
        setSelectedItem({ type: 'opening', id });
        toast.success('Floor opening created with glass guard — attach a Staircase to link levels.');
        return;
      }

      // 7. Staircase (attaches to Opening or Slab)
      if (payload.category === 'staircase') {
        if (!targetBuilding) {
          toast.warning('Add a Building first before placing a Staircase.');
          return;
        }
        const target = hitOpening || hitSlab || model.openings.find((o) => o.buildingId === targetBuilding.id) || model.slabs.find((s) => s.buildingId === targetBuilding.id);
        const fromFloor: FloorLevel =
          blueprintFloor === 'top' ? 'ground' : blueprintFloor;
        const toFloor: FloorLevel = fromFloor === 'underground' ? 'ground' : 'top';
        const id = uid('stair');
        const newStair = {
          id,
          buildingId: targetBuilding.id,
          fromFloor,
          toFloor,
          bidirectional: true,
          targetType: (hitOpening ? 'opening' : 'slab') as 'opening' | 'slab',
          targetId: target?.id || 'manual',
          x: target ? target.x : localBldX,
          z: target ? target.z : localBldZ,
          width: 2.1,
          depth: 3.8,
          rotation: 0,
          stepMaterial: 'wood' as MaterialType,
          railingMaterial: 'glass' as MaterialType,
          hasGuards: true,
        };
        setModel((prev) => ({
          ...prev,
          staircases: [...prev.staircases, newStair],
          openings: prev.openings.map((o) =>
            o.id === hitOpening?.id ? { ...o, attachedStaircaseId: id } : o
          ),
          slabs: prev.slabs.map((s) =>
            s.id === hitSlab?.id ? { ...s, attachedStaircaseId: id } : s
          ),
        }));
        setSelectedItem({ type: 'staircase', id });
        toast.success(`Attached bidirectional Staircase (${FLOOR_LABELS[fromFloor]} ↔ ${FLOOR_LABELS[toFloor]}).`);
        return;
      }

      // 8. Cylinder Support Column
      if (payload.category === 'support') {
        const id = uid('col');
        const newCol = {
          id,
          buildingId: hitBuilding ? hitBuilding.id : null,
          floor: hitBuilding ? blueprintFloor : 'ground',
          name: `Cylinder Support ${model.supports.length + 1}`,
          x: hitBuilding ? localBldX : wx,
          z: hitBuilding ? localBldZ : wz,
          radius: 0.28,
          height: hitBuilding ? hitBuilding.floorHeight : 3.2,
          material: 'concrete' as MaterialType,
          color: '#f1ede4',
        };
        setModel((prev) => ({ ...prev, supports: [...prev.supports, newCol] }));
        setSelectedItem({ type: 'support', id });
        toast.success('Added Cylinder Support column.');
        return;
      }

      // 9. Grass Patch
      if (payload.category === 'grass') {
        const id = uid('grass');
        const gp = {
          id,
          name: `Grass Patch ${model.grassPatches.length + 1}`,
          x: wx,
          z: wz,
          width: 8,
          depth: 6,
        };
        setModel((prev) => ({ ...prev, grassPatches: [...prev.grassPatches, gp] }));
        setSelectedItem({ type: 'grass', id });
        return;
      }

      // 10. Swimming Pool (tied to a Section)
      if (payload.category === 'pool') {
        const hitSec = model.sections.find(
          (s) =>
            !s.buildingId &&
            Math.abs(wx - s.x) <= s.width / 2 &&
            Math.abs(wz - s.z) <= s.depth / 2
        ) || model.sections.find((s) => !s.buildingId) || model.sections[0];

        let sectionId = hitSec?.id;
        let nextSections = model.sections;
        if (!sectionId) {
          sectionId = uid('sec');
          nextSections = [
            ...model.sections,
            {
              id: sectionId,
              buildingId: null,
              floor: 'ground',
              name: 'Pool Courtyard Section',
              x: wx,
              z: wz,
              width: 11,
              depth: 8,
              color: '#d8d2c5',
              hasRailing: true,
              railingMaterial: 'glass',
            },
          ];
        }
        const id = uid('pool');
        const newPool = {
          id,
          sectionId,
          name: 'Swimming Pool',
          x: wx,
          z: wz,
          width: 7.5,
          depth: 4.5,
          waterDepth: 1.4,
        };
        setModel((prev) => ({
          ...prev,
          sections: nextSections,
          pools: [...prev.pools, newPool],
        }));
        setSelectedItem({ type: 'pool', id });
        toast.success('Swimming Pool added to Section.');
        return;
      }

      // 11. Scaffold (inside compound)
      if (payload.category === 'scaffold') {
        const id = uid('scaf');
        const scaf = {
          id,
          name: `Compound Scaffold ${model.scaffolds.length + 1}`,
          x: wx,
          z: wz,
          width: 3.0,
          depth: 3.0,
          height: 4.4,
          material: 'metal' as MaterialType,
        };
        setModel((prev) => ({ ...prev, scaffolds: [...prev.scaffolds, scaf] }));
        setSelectedItem({ type: 'scaffold', id });
        toast.success('Scaffold placed — drag Water Tanks onto it for elevation.');
        return;
      }

      // 12. Facilities (ENFORCE: Only Lights can be dragged to multiple places!)
      if (payload.category === 'facility' && payload.facilityKind) {
        const kind = payload.facilityKind;
        if (payload.linkedDeviceId && kind !== 'light') {
          const count = placedLinkedFacilityIds.get(payload.linkedDeviceId) || 0;
          if (count >= 1) {
            toast.error(
              'Only Lights can be dragged to multiple places. Move the existing placement or choose a different facility.'
            );
            return;
          }
        }

        // Detect perimeter snap for Doors -> Gates, Cameras, Lights, Sensors
        const hw = model.width / 2;
        const hd = model.depth / 2;
        const nearSouth = Math.abs(wz - hd) < 2.2;
        const nearNorth = Math.abs(wz + hd) < 2.2;
        const nearEast = Math.abs(wx - hw) < 2.2;
        const nearWest = Math.abs(wx + hw) < 2.2;
        const onPerimeter = nearSouth || nearNorth || nearEast || nearWest;

        let mountSurface: MountSurface = payload.mountHint || 'wall';
        let finalX = wx;
        let finalZ = wz;
        let wallSide: PlacedFacility3D['wallSide'] = 'south';
        let rot = 0;

        if (onPerimeter && (kind === 'door' || kind === 'camera' || kind === 'light' || kind === 'external_sensor')) {
          mountSurface = 'perimeter';
          if (nearSouth) { finalZ = hd; wallSide = 'south'; rot = Math.PI; }
          else if (nearNorth) { finalZ = -hd; wallSide = 'north'; rot = 0; }
          else if (nearEast) { finalX = hw; wallSide = 'east'; rot = -Math.PI / 2; }
          else { finalX = -hw; wallSide = 'west'; rot = Math.PI / 2; }
        } else if (mountSurface === 'ceiling' && !hitBuilding) {
          mountSurface = 'wall';
        }

        const hitRoom = hitBuilding
          ? model.rooms.find(
              (r) =>
                r.buildingId === hitBuilding.id &&
                r.floor === blueprintFloor &&
                Math.abs(localBldX - r.x) <= r.width / 2 &&
                Math.abs(localBldZ - r.z) <= r.depth / 2
            )
          : undefined;
        const hitSec = model.sections.find(
          (s) =>
            s.floor === blueprintFloor &&
            Math.abs((s.buildingId ? localBldX : wx) - s.x) <= s.width / 2 &&
            Math.abs((s.buildingId ? localBldZ : wz) - s.z) <= s.depth / 2
        );

        const id = uid('fac');
        const linkedDev = payload.linkedDeviceId
          ? devices.find((d) => d.id === payload.linkedDeviceId)
          : undefined;
        const newFac: PlacedFacility3D = {
          id,
          kind,
          name:
            payload.label ||
            linkedDev?.name ||
            (mountSurface === 'perimeter' && kind === 'door'
              ? 'Perimeter Gate'
              : kind.replace('_', ' ')),
          linkedDeviceId: payload.linkedDeviceId,
          buildingId: mountSurface === 'perimeter' ? null : hitBuilding?.id || null,
          floor: mountSurface === 'perimeter' ? 'ground' : mountSurface === 'roof' ? 'top' : blueprintFloor,
          sectionId: hitSec?.id || hitRoom?.sectionId || null,
          roomId: hitRoom?.id || null,
          mountSurface,
          x: finalX,
          z: finalZ,
          wallSide,
          rotation: rot,
          isOn: linkedDev ? linkedDev.status === 'on' || linkedDev.status === 'active' : true,
          isOpen: linkedDev ? linkedDev.status === 'open' : false,
          material: kind === 'door' ? (mountSurface === 'perimeter' ? 'metal' : 'wood') : undefined,
        };
        setModel((prev) => ({ ...prev, facilities: [...prev.facilities, newFac] }));
        setSelectedItem({ type: 'facility', id });
        toast.success(
          mountSurface === 'perimeter' && kind === 'door'
            ? `Attached Perimeter Gate (${newFac.name}) to property fence.`
            : `Placed ${newFac.name} on ${mountSurface}.`
        );
        return;
      }

      // 13. Utilities (Water Tanks snap onto Scaffolds; others attach anywhere to Property / Section / Room)
      if (payload.category === 'utility' && payload.utilityKind) {
        const uKind = payload.utilityKind;
        let targetScope: UtilityTargetScope = 'property';
        let targetId: string | null = null;
        let finalX = wx;
        let finalZ = wz;

        if (uKind === 'water_tank') {
          const hitScaf =
            model.scaffolds.find(
              (s) => Math.abs(wx - s.x) <= s.width / 2 + 1.5 && Math.abs(wz - s.z) <= s.depth / 2 + 1.5
            ) || model.scaffolds[0];
          if (!hitScaf) {
            toast.warning('Water Tanks require a Scaffold in the compound. Place a Scaffold first!');
            return;
          }
          targetScope = 'scaffold';
          targetId = hitScaf.id;
          finalX = hitScaf.x;
          finalZ = hitScaf.z;
        } else {
          const hitRoom = hitBuilding
            ? model.rooms.find(
                (r) =>
                  r.buildingId === hitBuilding.id &&
                  r.floor === blueprintFloor &&
                  Math.abs(localBldX - r.x) <= r.width / 2 &&
                  Math.abs(localBldZ - r.z) <= r.depth / 2
              )
            : undefined;
          const hitSec = model.sections.find(
            (s) =>
              s.floor === blueprintFloor &&
              Math.abs((s.buildingId ? localBldX : wx) - s.x) <= s.width / 2 &&
              Math.abs((s.buildingId ? localBldZ : wz) - s.z) <= s.depth / 2
          );
          if (hitRoom) {
            targetScope = 'room';
            targetId = hitRoom.id;
          } else if (hitSec) {
            targetScope = 'section';
            targetId = hitSec.id;
          }
        }

        const id = uid('util');
        const newUtil: PlacedUtility3D = {
          id,
          kind: uKind,
          name: payload.label || uKind.replace('_', ' '),
          linkedUtilityId: payload.linkedUtilityId,
          targetScope,
          targetId,
          buildingId: hitBuilding?.id || null,
          floor: uKind === 'solar_panel' ? 'top' : hitBuilding ? blueprintFloor : 'ground',
          x: finalX,
          z: finalZ,
          rotation: 0,
          isActive: true,
        };
        setModel((prev) => ({ ...prev, utilities: [...prev.utilities, newUtil] }));
        setSelectedItem({ type: 'utility', id });
        toast.success(`Attached ${newUtil.name} to ${targetScope}.`);
      }
    },
    [model, blueprintFloor, placedLinkedFacilityIds, devices]
  );

  const startDragPalette = (e: React.DragEvent, payload: PaletteDragPayload) => {
    e.dataTransfer.setData('application/x-hansson-3d', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleBlueprintDrop = (e: React.DragEvent<SVGSVGElement>) => {
    const raw = e.dataTransfer.getData('application/x-hansson-3d');
    if (!raw || !svgRef.current) return;
    e.preventDefault();
    try {
      const payload = JSON.parse(raw) as PaletteDragPayload;
      const rect = svgRef.current.getBoundingClientRect();
      const viewW = model.width + 10;
      const viewD = model.depth + 10;
      const worldX = ((e.clientX - rect.left) / rect.width - 0.5) * viewW;
      const worldZ = ((e.clientY - rect.top) / rect.height - 0.5) * viewD;
      handleDropPayload(payload, worldX, worldZ);
    } catch {
      // ignore
    }
  };

  const deleteSelected = () => {
    if (!selectedItem) return;
    if (selectedItem.type === 'property') {
      setModel(createEmptyHouseModel());
      setSelectedItem(null);
      return;
    }
    const id = selectedItem.id;
    setModel((prev) => ({
      ...prev,
      buildings: selectedItem.type === 'building' ? prev.buildings.filter((b) => b.id !== id) : prev.buildings,
      sections: selectedItem.type === 'section' ? prev.sections.filter((s) => s.id !== id) : prev.sections,
      rooms: selectedItem.type === 'room' ? prev.rooms.filter((r) => r.id !== id) : prev.rooms,
      slabs: selectedItem.type === 'slab' ? prev.slabs.filter((s) => s.id !== id) : prev.slabs,
      openings: selectedItem.type === 'opening' ? prev.openings.filter((o) => o.id !== id) : prev.openings,
      staircases: selectedItem.type === 'staircase' ? prev.staircases.filter((s) => s.id !== id) : prev.staircases,
      supports: selectedItem.type === 'support' ? prev.supports.filter((c) => c.id !== id) : prev.supports,
      grassPatches: selectedItem.type === 'grass' ? prev.grassPatches.filter((g) => g.id !== id) : prev.grassPatches,
      pools: selectedItem.type === 'pool' ? prev.pools.filter((p) => p.id !== id) : prev.pools,
      scaffolds: selectedItem.type === 'scaffold' ? prev.scaffolds.filter((s) => s.id !== id) : prev.scaffolds,
      facilities: selectedItem.type === 'facility' ? prev.facilities.filter((f) => f.id !== id) : prev.facilities,
      utilities: selectedItem.type === 'utility' ? prev.utilities.filter((u) => u.id !== id) : prev.utilities,
    }));
    setSelectedItem(null);
    toast.info('Removed item from 3D design');
  };

  if (!isOpen) return null;

  // Lookup currently selected object for Inspector
  const selBuilding =
    selectedItem?.type === 'building'
      ? model.buildings.find((b) => b.id === selectedItem.id)
      : undefined;
  const selSection =
    selectedItem?.type === 'section'
      ? model.sections.find((s) => s.id === selectedItem.id)
      : undefined;
  const selRoom =
    selectedItem?.type === 'room' ? model.rooms.find((r) => r.id === selectedItem.id) : undefined;
  const selSlab =
    selectedItem?.type === 'slab' ? model.slabs.find((s) => s.id === selectedItem.id) : undefined;
  const selOpening =
    selectedItem?.type === 'opening'
      ? model.openings.find((o) => o.id === selectedItem.id)
      : undefined;
  const selStair =
    selectedItem?.type === 'staircase'
      ? model.staircases.find((s) => s.id === selectedItem.id)
      : undefined;
  const selSupport =
    selectedItem?.type === 'support'
      ? model.supports.find((c) => c.id === selectedItem.id)
      : undefined;
  const selGrass =
    selectedItem?.type === 'grass'
      ? model.grassPatches.find((g) => g.id === selectedItem.id)
      : undefined;
  const selPool =
    selectedItem?.type === 'pool' ? model.pools.find((p) => p.id === selectedItem.id) : undefined;
  const selScaffold =
    selectedItem?.type === 'scaffold'
      ? model.scaffolds.find((s) => s.id === selectedItem.id)
      : undefined;
  const selFacility =
    selectedItem?.type === 'facility'
      ? model.facilities.find((f) => f.id === selectedItem.id)
      : undefined;
  const selUtility =
    selectedItem?.type === 'utility'
      ? model.utilities.find((u) => u.id === selectedItem.id)
      : undefined;

  const isDarkUi = theme === 'dark' || nightMode;
  const surfaceBg = isDarkUi ? 'bg-zinc-950 text-zinc-100 border-zinc-800' : 'bg-white text-slate-900 border-slate-200';
  const subBg = isDarkUi ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200';

  const triggerCam = (preset: CameraPreset) => {
    setCameraPresetRequest((prev) => ({ preset, seq: (prev?.seq || 0) + 1 }));
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9990] flex flex-col overflow-hidden',
        isDarkUi ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-100 text-slate-900'
      )}
      role="dialog"
      aria-modal="true"
      aria-label="3D Smart Property Designer & Renderer"
    >
      {/* Top Studio Header Bar (Opaque — no backdrop-blur over WebGL canvas) */}
      <div className={cn('flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b shrink-0', surfaceBg)}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white shrink-0">
            <Box className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight truncate">{model.name}</h2>
            <p className="text-[11px] text-muted-foreground truncate">
              {model.buildings.length} Buildings · {model.rooms.length} Rooms · {model.facilities.length} Facilities · {model.utilities.length} Utilities
            </p>
          </div>
        </div>

        {/* Center Studio Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* View Mode */}
          <div className={cn('flex items-center p-0.5 rounded-lg border text-xs', subBg)}>
            {([
              { id: 'split', label: 'Split', icon: Columns3 },
              { id: '2d', label: 'Blueprint', icon: Grid2x2 },
              { id: '3d', label: '3D View', icon: Box },
            ] as const).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setViewMode(m.id)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer',
                  viewMode === m.id
                    ? 'bg-sky-600 text-white'
                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                )}
              >
                <m.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* 3-Floor Selector */}
          <div className={cn('flex items-center p-0.5 rounded-lg border text-xs', subBg)}>
            {([
              { id: 'all', label: 'All' },
              { id: 'top', label: 'Top' },
              { id: 'ground', label: 'Ground' },
              { id: 'underground', label: 'Underground' },
            ] as const).map((fl) => (
              <button
                key={fl.id}
                type="button"
                onClick={() => setActiveFloor(fl.id)}
                className={cn(
                  'px-2 py-1 rounded-md font-medium transition-colors cursor-pointer',
                  activeFloor === fl.id
                    ? 'bg-amber-600 text-white'
                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                )}
              >
                {fl.label}
              </button>
            ))}
          </div>

          <Button
            variant={exploded ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs gap-1 cursor-pointer"
            onClick={() => setExploded((v) => !v)}
            title="Explode 3 Floors Vertically"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Explode Floors</span>
          </Button>

          <Button
            variant={cutaway ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs gap-1 cursor-pointer"
            onClick={() => setCutaway((v) => !v)}
            title="Cutaway Interior Walls"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Cutaway</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 cursor-pointer"
            onClick={() => setNightMode((v) => !v)}
            title="Toggle Day / Night Scene"
          >
            {nightMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Right Actions: Presets + Drawers + Close */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 cursor-pointer"
            onClick={() => {
              setModel(createEmptyHouseModel());
              setSelectedItem(null);
              toast.info('Cleared canvas! Drag Property onto the canvas to build from scratch.');
            }}
            title="Start Blank Property (Drag & Drop from scratch)"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Blank</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 cursor-pointer"
            onClick={() => {
              setModel(createSampleHouseModel(rooms, sections, devices));
              setSelectedItem({ type: 'building', id: 'bld-main' });
              toast.success('Loaded Smart Estate 3-Floor Villa preset.');
            }}
            title="Reset to Sample Smart Estate"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Preset</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            onClick={() => setShowPalette((v) => !v)}
            title="Toggle Builder Palette"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            onClick={() => setShowInspector((v) => !v)}
            title="Toggle Inspector"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1 cursor-pointer"
            onClick={onClose}
            title="Close 3D Designer (Esc)"
          >
            <X className="h-3.5 w-3.5" />
            <span>Close</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Left Drag-and-Drop Builder Palette */}
        {showPalette && (
          <aside className={cn('w-64 sm:w-72 border-r flex flex-col min-h-0 shrink-0 z-10', surfaceBg)}>
            <div className="px-3 py-2 border-b border-inherit text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Drag & Drop Palette</span>
              <span className="text-[10px] font-normal">Floor: {blueprintFloor}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-3 text-xs">
              {/* Step 1: Structure */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  1. Property & Architecture
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { cat: 'property', label: 'Property', icon: Home, hint: 'Compound' },
                    { cat: 'building', label: 'Building', icon: Building2, hint: '3 Floors' },
                    { cat: 'section', label: 'Section', icon: LayoutGrid, hint: 'Zone' },
                    { cat: 'room', label: 'Room', icon: Maximize2, hint: 'Inside Sec' },
                    { cat: 'slab', label: 'Half Slab', icon: Layers, hint: 'Stairs Only' },
                    { cat: 'opening', label: 'Opening', icon: Minimize2, hint: 'Stairs Only' },
                    { cat: 'staircase', label: 'Staircase', icon: Sliders, hint: 'Up & Down' },
                    { cat: 'support', label: 'Cylinder Col', icon: Shield, hint: 'Support' },
                  ] as const).map((item) => (
                    <div
                      key={item.cat}
                      draggable
                      onDragStart={(e) => startDragPalette(e, { category: item.cat })}
                      onClick={() => handleDropPayload({ category: item.cat }, 0, 0)}
                      className={cn(
                        'p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:border-sky-500 transition-colors flex flex-col gap-0.5',
                        subBg
                      )}
                      title={`Drag onto Blueprint/3D or click to add ${item.label}`}
                    >
                      <div className="flex items-center justify-between">
                        <item.icon className="h-3.5 w-3.5 text-sky-500" />
                        <span className="text-[9px] text-muted-foreground">{item.hint}</span>
                      </div>
                      <span className="font-semibold text-[11px]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Yard, Pool & Scaffolds */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  2. Compound, Pool & Scaffolds
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { cat: 'grass', label: 'Grass', icon: Trees },
                    { cat: 'pool', label: 'Pool', icon: Waves },
                    { cat: 'scaffold', label: 'Scaffold', icon: Box },
                  ] as const).map((item) => (
                    <div
                      key={item.cat}
                      draggable
                      onDragStart={(e) => startDragPalette(e, { category: item.cat })}
                      onClick={() => handleDropPayload({ category: item.cat }, -8, 6)}
                      className={cn(
                        'p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:border-emerald-500 transition-colors flex flex-col items-center gap-1 text-center',
                        subBg
                      )}
                    >
                      <item.icon className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold text-[11px]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Facilities (Lights Multi-Place Rule) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    3. Facilities
                  </p>
                  <span className="text-[9px] text-amber-500 font-semibold">
                    Lights: Multi-drop ✓
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { kind: 'door', label: 'Door / Gate', icon: DoorOpen, mount: 'wall' },
                    { kind: 'window', label: 'Window', icon: Grid2x2, mount: 'wall' },
                    { kind: 'camera', label: 'Wall Camera', icon: Camera, mount: 'wall' },
                    { kind: 'camera', label: 'Ceiling Cam', icon: Camera, mount: 'ceiling' },
                    { kind: 'power_outlet', label: 'Power Outlet', icon: Plug, mount: 'wall' },
                    { kind: 'light', label: 'Light (Multi)', icon: Lightbulb, mount: 'ceiling' },
                    { kind: 'external_sensor', label: 'Ext Sensor', icon: Radio, mount: 'perimeter' },
                  ] as const).map((f) => (
                    <div
                      key={`${f.kind}-${f.mount}`}
                      draggable
                      onDragStart={(e) =>
                        startDragPalette(e, {
                          category: 'facility',
                          facilityKind: f.kind,
                          mountHint: f.mount,
                          label: f.label,
                        })
                      }
                      onClick={() =>
                        handleDropPayload(
                          {
                            category: 'facility',
                            facilityKind: f.kind,
                            mountHint: f.mount,
                            label: f.label,
                          },
                          0,
                          f.mount === 'perimeter' ? model.depth / 2 : 0
                        )
                      }
                      className={cn(
                        'p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:border-amber-500 transition-colors flex items-center gap-1.5',
                        subBg
                      )}
                    >
                      <f.icon
                        className={cn(
                          'h-3.5 w-3.5 shrink-0',
                          f.kind === 'light' ? 'text-amber-500' : 'text-sky-500'
                        )}
                      />
                      <span className="font-medium text-[11px] truncate">{f.label}</span>
                    </div>
                  ))}
                </div>

                {/* Smart Home Linked Facilities */}
                {smartFacilities.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      Your Smart-Home Facilities
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
                      {smartFacilities.slice(0, 24).map((dev) => {
                        const fKind: FacilityKind =
                          dev.type === 'door'
                            ? 'door'
                            : dev.type === 'window'
                            ? 'window'
                            : dev.type === 'camera'
                            ? 'camera'
                            : dev.type === 'light'
                            ? 'light'
                            : 'external_sensor';
                        const count = placedLinkedFacilityIds.get(dev.id) || 0;
                        const blocked = fKind !== 'light' && count >= 1;
                        return (
                          <div
                            key={dev.id}
                            draggable
                            onDragStart={(e) =>
                              startDragPalette(e, {
                                category: 'facility',
                                facilityKind: fKind,
                                linkedDeviceId: dev.id,
                                label: dev.name,
                                mountHint: fKind === 'light' || fKind === 'camera' ? 'ceiling' : 'wall',
                              })
                            }
                            className={cn(
                              'px-2 py-1.5 rounded-md border flex items-center justify-between gap-1 text-[11px]',
                              blocked
                                ? 'opacity-60 border-dashed cursor-not-allowed'
                                : 'cursor-grab active:cursor-grabbing hover:border-amber-500',
                              subBg
                            )}
                            title={
                              fKind === 'light'
                                ? 'Lights can be dragged to multiple locations!'
                                : blocked
                                ? 'Already placed (only Lights can be placed in multiple places)'
                                : 'Drag to place on blueprint or 3D view'
                            }
                          >
                            <span className="truncate font-medium">{dev.name}</span>
                            {fKind === 'light' ? (
                              <span className="text-[9px] font-semibold text-amber-500 shrink-0 flex items-center gap-0.5">
                                <CopyPlus className="h-2.5 w-2.5" /> {count}
                              </span>
                            ) : count > 0 ? (
                              <span className="text-[9px] text-emerald-500 shrink-0 flex items-center gap-0.5">
                                <Check className="h-2.5 w-2.5" /> Placed
                              </span>
                            ) : (
                              <span className="text-[9px] text-muted-foreground shrink-0">Drag</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4: Utilities */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  4. Utilities (Anywhere on Property)
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { kind: 'water_tank', label: 'Water Tank', icon: Droplets, tip: 'On Scaffold' },
                    { kind: 'generator', label: 'Generator', icon: Zap, tip: 'Property' },
                    { kind: 'solar_panel', label: 'Solar Panel', icon: Sparkles, tip: 'Roof/Yard' },
                    { kind: 'water_pump', label: 'Water Pump', icon: Droplets, tip: 'Yard/Room' },
                    { kind: 'gas_cylinder', label: 'Gas Cylinder', icon: Flame, tip: 'Yard/Room' },
                    { kind: 'air_conditioner', label: 'HVAC / AC', icon: Wind, tip: 'Wall/Room' },
                  ] as const).map((u) => (
                    <div
                      key={u.kind}
                      draggable
                      onDragStart={(e) =>
                        startDragPalette(e, {
                          category: 'utility',
                          utilityKind: u.kind,
                          label: u.label,
                        })
                      }
                      onClick={() =>
                        handleDropPayload(
                          { category: 'utility', utilityKind: u.kind, label: u.label },
                          -6,
                          -6
                        )
                      }
                      className={cn(
                        'p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:border-cyan-500 transition-colors flex flex-col gap-0.5',
                        subBg
                      )}
                      title={`Drag anywhere (${u.tip})`}
                    >
                      <div className="flex items-center justify-between">
                        <u.icon className="h-3.5 w-3.5 text-cyan-500" />
                        <span className="text-[9px] text-muted-foreground">{u.tip}</span>
                      </div>
                      <span className="font-semibold text-[11px]">{u.label}</span>
                    </div>
                  ))}
                </div>

                {smartUtilities.length > 0 && (
                  <div className="mt-2 max-h-28 overflow-y-auto space-y-1">
                    {smartUtilities.map((util) => {
                      const comp = Number(util.utilityComponent);
                      const uKind: UtilityKind =
                        comp === 1
                          ? 'generator'
                          : comp === 2
                          ? 'solar_panel'
                          : comp === 3
                          ? 'water_tank'
                          : comp === 4
                          ? 'water_pump'
                          : comp === 5
                          ? 'water_meter'
                          : comp === 6
                          ? 'gas_cylinder'
                          : comp === 8
                          ? 'heater'
                          : 'air_conditioner';
                      return (
                        <div
                          key={util.id}
                          draggable
                          onDragStart={(e) =>
                            startDragPalette(e, {
                              category: 'utility',
                              utilityKind: uKind,
                              linkedUtilityId: util.id,
                              label: util.name,
                            })
                          }
                          className={cn(
                            'px-2 py-1 rounded-md border flex items-center justify-between text-[11px] cursor-grab active:cursor-grabbing hover:border-cyan-500',
                            subBg
                          )}
                        >
                          <span className="truncate font-medium">{util.name}</span>
                          <span className="text-[9px] text-cyan-500 shrink-0">Drag</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Center Canvas: Blueprint + 3D Split / Individual Views */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-0 overflow-hidden">
          {/* 2D Interactive Spatial Blueprint & Resize Canvas */}
          {(viewMode === 'split' || viewMode === '2d') && (
            <div
              className={cn(
                'relative flex flex-col min-w-0 min-h-0 border-b lg:border-b-0 lg:border-r',
                viewMode === 'split' ? 'h-1/2 lg:h-full lg:w-[44%]' : 'flex-1 h-full',
                isDarkUi ? 'bg-slate-900 border-zinc-800' : 'bg-slate-200/70 border-slate-300'
              )}
            >
              <div className={cn('px-3 py-1.5 border-b flex items-center justify-between text-xs shrink-0', surfaceBg)}>
                <div className="flex items-center gap-2">
                  <span className="font-bold">2D Blueprint & Resize</span>
                  <span className="text-[11px] text-muted-foreground">
                    Drag handles to resize · Drop items onto floor
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {(['underground', 'ground', 'top'] as FloorLevel[]).map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => setBlueprintFloor(fl)}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-semibold uppercase cursor-pointer',
                        blueprintFloor === fl
                          ? 'bg-sky-600 text-white'
                          : 'bg-black/5 dark:bg-white/10 hover:opacity-80'
                      )}
                    >
                      {fl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-h-0 p-3 flex items-center justify-center overflow-hidden relative">
                {!model.hasProperty ? (
                  <div
                    onDragOver={(e) => {
                      if (e.dataTransfer.types.includes('application/x-hansson-3d')) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      const raw = e.dataTransfer.getData('application/x-hansson-3d');
                      if (!raw) return;
                      e.preventDefault();
                      handleDropPayload(JSON.parse(raw), 0, 0);
                    }}
                    className={cn(
                      'w-full h-full max-w-md max-h-72 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 p-6 text-center',
                      isDarkUi ? 'border-sky-500/50 bg-zinc-900/80' : 'border-sky-500/60 bg-white/80'
                    )}
                  >
                    <Home className="h-10 w-10 text-sky-500" />
                    <div>
                      <p className="font-bold text-sm">Start by dragging a Property here</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Resize your property boundary, then add Buildings, 3 Floors, Sections, Rooms, Supports, Pools & Facilities.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => handleDropPayload({ category: 'property' }, 0, 0)}
                    >
                      Create Property Boundary
                    </Button>
                  </div>
                ) : (
                  <svg
                    ref={svgRef}
                    viewBox={`${-(model.width + 10) / 2} ${-(model.depth + 10) / 2} ${model.width + 10} ${model.depth + 10}`}
                    onDragOver={(e) => {
                      if (e.dataTransfer.types.includes('application/x-hansson-3d')) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                      }
                    }}
                    onDrop={handleBlueprintDrop}
                    onClick={() => setSelectedItem({ type: 'property' })}
                    className="w-full h-full max-h-full rounded-lg border border-slate-400/30 bg-[#0f172a]/90 shadow-inner touch-none"
                  >
                    {/* Blueprint grid */}
                    <defs>
                      <pattern id="bp-grid" width="2" height="2" patternUnits="userSpaceOnUse">
                        <path d="M 2 0 L 0 0 0 2" fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="0.06" />
                      </pattern>
                    </defs>
                    <rect
                      x={-(model.width + 10) / 2}
                      y={-(model.depth + 10) / 2}
                      width={model.width + 10}
                      height={model.depth + 10}
                      fill="url(#bp-grid)"
                    />

                    {/* Property Compound Perimeter */}
                    <rect
                      x={-model.width / 2}
                      y={-model.depth / 2}
                      width={model.width}
                      height={model.depth}
                      fill="rgba(51, 65, 85, 0.25)"
                      stroke={selectedItem?.type === 'property' ? '#38bdf8' : '#94a3b8'}
                      strokeWidth={0.22}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem({ type: 'property' });
                      }}
                    />
                    {/* Property resize handle bottom-right */}
                    <circle
                      cx={model.width / 2}
                      cy={model.depth / 2}
                      r={0.65}
                      fill="#38bdf8"
                      className="cursor-nwse-resize"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDragOp({
                          mode: 'resize',
                          target: { type: 'property' },
                          startMouseX: e.clientX,
                          startMouseY: e.clientY,
                          origX: 0,
                          origZ: 0,
                          origW: model.width,
                          origD: model.depth,
                        });
                      }}
                    />

                    {/* Grass patches */}
                    {model.grassPatches.map((gp) => {
                      const sel = selectedItem?.type === 'grass' && selectedItem.id === gp.id;
                      return (
                        <g key={gp.id}>
                          <rect
                            x={gp.x - gp.width / 2}
                            y={gp.z - gp.depth / 2}
                            width={gp.width}
                            height={gp.depth}
                            fill="rgba(34, 197, 94, 0.26)"
                            stroke={sel ? '#38bdf8' : '#22c55e'}
                            strokeWidth={0.14}
                            className="cursor-move"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem({ type: 'grass', id: gp.id });
                            }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDragOp({
                                mode: 'move',
                                target: { type: 'grass', id: gp.id },
                                startMouseX: e.clientX,
                                startMouseY: e.clientY,
                                origX: gp.x,
                                origZ: gp.z,
                                origW: gp.width,
                                origD: gp.depth,
                              });
                            }}
                          />
                          <circle
                            cx={gp.x + gp.width / 2}
                            cy={gp.z + gp.depth / 2}
                            r={0.42}
                            fill="#22c55e"
                            className="cursor-nwse-resize"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDragOp({
                                mode: 'resize',
                                target: { type: 'grass', id: gp.id },
                                startMouseX: e.clientX,
                                startMouseY: e.clientY,
                                origX: gp.x,
                                origZ: gp.z,
                                origW: gp.width,
                                origD: gp.depth,
                              });
                            }}
                          />
                        </g>
                      );
                    })}

                    {/* Outdoor Sections */}
                    {model.sections
                      .filter((s) => !s.buildingId)
                      .map((sec) => {
                        const sel = selectedItem?.type === 'section' && selectedItem.id === sec.id;
                        return (
                          <g key={sec.id}>
                            <rect
                              x={sec.x - sec.width / 2}
                              y={sec.z - sec.depth / 2}
                              width={sec.width}
                              height={sec.depth}
                              fill="rgba(226, 232, 240, 0.18)"
                              stroke={sel ? '#38bdf8' : '#cbd5e1'}
                              strokeDasharray="0.4 0.2"
                              strokeWidth={0.14}
                              className="cursor-move"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem({ type: 'section', id: sec.id });
                              }}
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                setDragOp({
                                  mode: 'move',
                                  target: { type: 'section', id: sec.id },
                                  startMouseX: e.clientX,
                                  startMouseY: e.clientY,
                                  origX: sec.x,
                                  origZ: sec.z,
                                  origW: sec.width,
                                  origD: sec.depth,
                                });
                              }}
                            />
                            <text
                              x={sec.x}
                              y={sec.z - sec.depth / 2 + 0.9}
                              textAnchor="middle"
                              fill="#e2e8f0"
                              fontSize="0.72"
                            >
                              {sec.name}
                            </text>
                            <circle
                              cx={sec.x + sec.width / 2}
                              cy={sec.z + sec.depth / 2}
                              r={0.42}
                              fill="#38bdf8"
                              className="cursor-nwse-resize"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                setDragOp({
                                  mode: 'resize',
                                  target: { type: 'section', id: sec.id },
                                  startMouseX: e.clientX,
                                  startMouseY: e.clientY,
                                  origX: sec.x,
                                  origZ: sec.z,
                                  origW: sec.width,
                                  origD: sec.depth,
                                });
                              }}
                            />
                          </g>
                        );
                      })}

                    {/* Pools */}
                    {model.pools.map((pool) => {
                      const sel = selectedItem?.type === 'pool' && selectedItem.id === pool.id;
                      return (
                        <g key={pool.id}>
                          <rect
                            x={pool.x - pool.width / 2}
                            y={pool.z - pool.depth / 2}
                            width={pool.width}
                            height={pool.depth}
                            rx={0.2}
                            fill="rgba(6, 182, 212, 0.45)"
                            stroke={sel ? '#38bdf8' : '#22d3ee'}
                            strokeWidth={0.16}
                            className="cursor-move"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem({ type: 'pool', id: pool.id });
                            }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDragOp({
                                mode: 'move',
                                target: { type: 'pool', id: pool.id },
                                startMouseX: e.clientX,
                                startMouseY: e.clientY,
                                origX: pool.x,
                                origZ: pool.z,
                                origW: pool.width,
                                origD: pool.depth,
                              });
                            }}
                          />
                          <text x={pool.x} y={pool.z + 0.2} textAnchor="middle" fill="#ecfeff" fontSize="0.72">
                            Pool
                          </text>
                          <circle
                            cx={pool.x + pool.width / 2}
                            cy={pool.z + pool.depth / 2}
                            r={0.42}
                            fill="#22d3ee"
                            className="cursor-nwse-resize"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDragOp({
                                mode: 'resize',
                                target: { type: 'pool', id: pool.id },
                                startMouseX: e.clientX,
                                startMouseY: e.clientY,
                                origX: pool.x,
                                origZ: pool.z,
                                origW: pool.width,
                                origD: pool.depth,
                              });
                            }}
                          />
                        </g>
                      );
                    })}

                    {/* Scaffolds */}
                    {model.scaffolds.map((sc) => {
                      const sel = selectedItem?.type === 'scaffold' && selectedItem.id === sc.id;
                      return (
                        <g key={sc.id}>
                          <rect
                            x={sc.x - sc.width / 2}
                            y={sc.z - sc.depth / 2}
                            width={sc.width}
                            height={sc.depth}
                            fill="rgba(234, 179, 8, 0.25)"
                            stroke={sel ? '#38bdf8' : '#eab308'}
                            strokeWidth={0.15}
                            className="cursor-move"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem({ type: 'scaffold', id: sc.id });
                            }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDragOp({
                                mode: 'move',
                                target: { type: 'scaffold', id: sc.id },
                                startMouseX: e.clientX,
                                startMouseY: e.clientY,
                                origX: sc.x,
                                origZ: sc.z,
                                origW: sc.width,
                                origD: sc.depth,
                              });
                            }}
                          />
                          <text x={sc.x} y={sc.z + 0.2} textAnchor="middle" fill="#fef08a" fontSize="0.62">
                            Scaffold
                          </text>
                        </g>
                      );
                    })}

                    {/* Buildings on current blueprintFloor */}
                    {model.buildings
                      .filter((b) => b.floors.includes(blueprintFloor))
                      .map((bld) => {
                        const sel = selectedItem?.type === 'building' && selectedItem.id === bld.id;
                        return (
                          <g key={bld.id}>
                            <rect
                              x={bld.x - bld.width / 2}
                              y={bld.z - bld.depth / 2}
                              width={bld.width}
                              height={bld.depth}
                              fill={bld.wallColor}
                              fillOpacity={0.2}
                              stroke={sel ? '#38bdf8' : '#f8fafc'}
                              strokeWidth={0.2}
                              className="cursor-move"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem({ type: 'building', id: bld.id });
                              }}
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                setDragOp({
                                  mode: 'move',
                                  target: { type: 'building', id: bld.id },
                                  startMouseX: e.clientX,
                                  startMouseY: e.clientY,
                                  origX: bld.x,
                                  origZ: bld.z,
                                  origW: bld.width,
                                  origD: bld.depth,
                                });
                              }}
                            />
                            <text
                              x={bld.x - bld.width / 2 + 0.5}
                              y={bld.z - bld.depth / 2 + 0.9}
                              fill="#f8fafc"
                              fontSize="0.72"
                              fontWeight="bold"
                            >
                              {bld.name}
                            </text>

                            {/* Rooms inside building floor */}
                            {model.rooms
                              .filter((r) => r.buildingId === bld.id && r.floor === blueprintFloor)
                              .map((room) => {
                                const rSel = selectedItem?.type === 'room' && selectedItem.id === room.id;
                                return (
                                  <g key={room.id}>
                                    <rect
                                      x={bld.x + room.x - room.width / 2}
                                      y={bld.z + room.z - room.depth / 2}
                                      width={room.width}
                                      height={room.depth}
                                      fill={room.floorColor}
                                      fillOpacity={0.35}
                                      stroke={rSel ? '#38bdf8' : '#e2e8f0'}
                                      strokeWidth={0.14}
                                      className="cursor-move"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItem({ type: 'room', id: room.id });
                                      }}
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                        setDragOp({
                                          mode: 'move',
                                          target: { type: 'room', id: room.id },
                                          startMouseX: e.clientX,
                                          startMouseY: e.clientY,
                                          origX: room.x,
                                          origZ: room.z,
                                          origW: room.width,
                                          origD: room.depth,
                                        });
                                      }}
                                    />
                                    <text
                                      x={bld.x + room.x}
                                      y={bld.z + room.z + 0.25}
                                      textAnchor="middle"
                                      fill="#ffffff"
                                      fontSize="0.65"
                                    >
                                      {room.name}
                                    </text>
                                    <circle
                                      cx={bld.x + room.x + room.width / 2}
                                      cy={bld.z + room.z + room.depth / 2}
                                      r={0.36}
                                      fill="#fbbf24"
                                      className="cursor-nwse-resize"
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                        setDragOp({
                                          mode: 'resize',
                                          target: { type: 'room', id: room.id },
                                          startMouseX: e.clientX,
                                          startMouseY: e.clientY,
                                          origX: room.x,
                                          origZ: room.z,
                                          origW: room.width,
                                          origD: room.depth,
                                        });
                                      }}
                                    />
                                  </g>
                                );
                              })}

                            {/* Openings & Slabs */}
                            {model.openings
                              .filter((o) => o.buildingId === bld.id && o.floor === blueprintFloor)
                              .map((op) => (
                                <rect
                                  key={op.id}
                                  x={bld.x + op.x - op.width / 2}
                                  y={bld.z + op.z - op.depth / 2}
                                  width={op.width}
                                  height={op.depth}
                                  fill="rgba(56, 189, 248, 0.22)"
                                  stroke="#38bdf8"
                                  strokeDasharray="0.25 0.15"
                                  strokeWidth={0.14}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem({ type: 'opening', id: op.id });
                                  }}
                                />
                              ))}

                            {model.slabs
                              .filter((sl) => sl.buildingId === bld.id && sl.floor === blueprintFloor)
                              .map((sl) => (
                                <rect
                                  key={sl.id}
                                  x={bld.x + sl.x - sl.width / 2}
                                  y={bld.z + sl.z - sl.depth / 2}
                                  width={sl.width}
                                  height={sl.depth}
                                  fill="rgba(168, 85, 247, 0.18)"
                                  stroke="#c084fc"
                                  strokeDasharray="0.3 0.15"
                                  strokeWidth={0.14}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem({ type: 'slab', id: sl.id });
                                  }}
                                />
                              ))}

                            {/* Building resize handle */}
                            <circle
                              cx={bld.x + bld.width / 2}
                              cy={bld.z + bld.depth / 2}
                              r={0.5}
                              fill="#f8fafc"
                              stroke="#0284c7"
                              strokeWidth={0.12}
                              className="cursor-nwse-resize"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                setDragOp({
                                  mode: 'resize',
                                  target: { type: 'building', id: bld.id },
                                  startMouseX: e.clientX,
                                  startMouseY: e.clientY,
                                  origX: bld.x,
                                  origZ: bld.z,
                                  origW: bld.width,
                                  origD: bld.depth,
                                });
                              }}
                            />
                          </g>
                        );
                      })}

                    {/* Facilities Markers */}
                    {model.facilities
                      .filter((f) => f.floor === blueprintFloor || f.mountSurface === 'perimeter')
                      .map((fac) => (
                        <circle
                          key={fac.id}
                          cx={fac.x}
                          cy={fac.z}
                          r={0.42}
                          fill={
                            fac.kind === 'light'
                              ? '#fbbf24'
                              : fac.kind === 'camera'
                              ? '#38bdf8'
                              : fac.kind === 'door'
                              ? '#fb7185'
                              : '#a78bfa'
                          }
                          stroke="#ffffff"
                          strokeWidth={0.1}
                          className="cursor-move"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem({ type: 'facility', id: fac.id });
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setDragOp({
                              mode: 'move',
                              target: { type: 'facility', id: fac.id },
                              startMouseX: e.clientX,
                              startMouseY: e.clientY,
                              origX: fac.x,
                              origZ: fac.z,
                              origW: 1,
                              origD: 1,
                            });
                          }}
                        />
                      ))}

                    {/* Utilities Markers */}
                    {model.utilities.map((util) => (
                      <rect
                        key={util.id}
                        x={util.x - 0.45}
                        y={util.z - 0.45}
                        width={0.9}
                        height={0.9}
                        rx={0.15}
                        fill="#06b6d4"
                        stroke="#ffffff"
                        strokeWidth={0.1}
                        className="cursor-move"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem({ type: 'utility', id: util.id });
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setDragOp({
                            mode: 'move',
                            target: { type: 'utility', id: util.id },
                            startMouseX: e.clientX,
                            startMouseY: e.clientY,
                            origX: util.x,
                            origZ: util.z,
                            origW: 1,
                            origD: 1,
                          });
                        }}
                      />
                    ))}
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* 3D Interactive Three.js Viewport */}
          {(viewMode === 'split' || viewMode === '3d') && (
            <div className="flex-1 min-w-0 min-h-0 relative">
              <ThreeHouseViewport
                model={model}
                activeFloor={activeFloor}
                exploded={exploded}
                cutaway={cutaway}
                nightMode={nightMode}
                selectedItem={selectedItem}
                cameraPresetRequest={cameraPresetRequest}
                onSelectItem={setSelectedItem}
                onDropAtWorld={handleDropPayload}
              />

              {/* Opaque Compact Bottom Camera Preset Dock (Zero backdrop-blur over WebGL) */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/95 text-white border border-slate-700 shadow-lg text-xs">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 px-1 hidden sm:inline">
                  Camera
                </span>
                {([
                  { id: 'hero', label: 'Hero 3D' },
                  { id: 'top', label: 'Top Plan' },
                  { id: 'front', label: 'Front' },
                  { id: 'underground', label: 'Underground' },
                ] as const).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => triggerCam(c.id)}
                    className="px-2 py-1 rounded-md bg-slate-800 hover:bg-sky-600 transition-colors font-medium cursor-pointer"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Contextual Inspector */}
        {showInspector && (
          <aside className={cn('w-64 sm:w-72 border-l flex flex-col min-h-0 shrink-0 z-10', surfaceBg)}>
            <div className="px-3 py-2 border-b border-inherit flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Properties Inspector
              </span>
              {selectedItem && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  onClick={deleteSelected}
                  title="Delete Selected"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {!selectedItem && (
                <div className="text-muted-foreground text-center py-8 space-y-2">
                  <Box className="h-7 w-7 mx-auto opacity-50" />
                  <p>Click any Building, Room, Slab, Staircase, Roof, Pool, Facility or Utility in 2D or 3D to inspect & customize.</p>
                </div>
              )}

              {/* Property Inspector */}
              {selectedItem?.type === 'property' && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">Property Compound</div>
                  <div className="space-y-1">
                    <Label className="text-xs">Property Name</Label>
                    <Input
                      className="h-8 text-xs"
                      value={model.name}
                      onChange={(e) => setModel((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Width (m)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={model.width}
                        onChange={(e) =>
                          setModel((p) => ({ ...p, width: Math.max(14, Number(e.target.value) || 20) }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Depth (m)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={model.depth}
                        onChange={(e) =>
                          setModel((p) => ({ ...p, depth: Math.max(12, Number(e.target.value) || 18) }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Perimeter Fence Material</Label>
                    <select
                      className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                      value={model.perimeterMaterial}
                      onChange={(e) =>
                        setModel((p) => ({ ...p, perimeterMaterial: e.target.value as MaterialType }))
                      }
                    >
                      {MATERIAL_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fence Color</Label>
                    <Input
                      type="color"
                      className="h-8 p-1 cursor-pointer"
                      value={model.perimeterColor}
                      onChange={(e) => setModel((p) => ({ ...p, perimeterColor: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Building + Custom Roof + Material Inspector */}
              {selBuilding && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">{selBuilding.name}</div>
                  <div className="space-y-1">
                    <Label className="text-xs">Building Name</Label>
                    <Input
                      className="h-8 text-xs"
                      value={selBuilding.name}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          buildings: p.buildings.map((b) =>
                            b.id === selBuilding.id ? { ...b, name: e.target.value } : b
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Width (m)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={selBuilding.width}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            buildings: p.buildings.map((b) =>
                              b.id === selBuilding.id
                                ? { ...b, width: Math.max(4, Number(e.target.value) || 8) }
                                : b
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Depth (m)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={selBuilding.depth}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            buildings: p.buildings.map((b) =>
                              b.id === selBuilding.id
                                ? { ...b, depth: Math.max(4, Number(e.target.value) || 8) }
                                : b
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Active 3 Floors */}
                  <div className="space-y-1">
                    <Label className="text-xs">Enabled Floors</Label>
                    <div className="flex gap-1.5">
                      {(['underground', 'ground', 'top'] as FloorLevel[]).map((fl) => {
                        const active = selBuilding.floors.includes(fl);
                        return (
                          <button
                            key={fl}
                            type="button"
                            onClick={() =>
                              setModel((p) => ({
                                ...p,
                                buildings: p.buildings.map((b) => {
                                  if (b.id !== selBuilding.id) return b;
                                  const next = active
                                    ? b.floors.filter((x) => x !== fl)
                                    : [...b.floors, fl];
                                  return { ...b, floors: next.length ? next : ['ground'] };
                                }),
                              }))
                            }
                            className={cn(
                              'flex-1 py-1 rounded border text-[10px] font-semibold capitalize cursor-pointer',
                              active ? 'bg-sky-600 text-white border-sky-600' : subBg
                            )}
                          >
                            {fl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Wall Color Swatches */}
                  <div className="space-y-1">
                    <Label className="text-xs">Wall Color</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {WALL_COLOR_SWATCHES.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() =>
                            setModel((p) => ({
                              ...p,
                              buildings: p.buildings.map((b) =>
                                b.id === selBuilding.id ? { ...b, wallColor: hex } : b
                              ),
                            }))
                          }
                          className={cn(
                            'w-6 h-6 rounded-md border cursor-pointer',
                            selBuilding.wallColor === hex ? 'ring-2 ring-sky-500' : ''
                          )}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                      <Input
                        type="color"
                        className="w-8 h-6 p-0.5 cursor-pointer"
                        value={selBuilding.wallColor}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            buildings: p.buildings.map((b) =>
                              b.id === selBuilding.id ? { ...b, wallColor: e.target.value } : b
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Materials: Wall, Door, Railing */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Wall Material</Label>
                      <select
                        className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                        value={selBuilding.wallMaterial}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            buildings: p.buildings.map((b) =>
                              b.id === selBuilding.id
                                ? { ...b, wallMaterial: e.target.value as MaterialType }
                                : b
                            ),
                          }))
                        }
                      >
                        {MATERIAL_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Door Material</Label>
                      <select
                        className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                        value={selBuilding.doorMaterial}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            buildings: p.buildings.map((b) =>
                              b.id === selBuilding.id
                                ? { ...b, doorMaterial: e.target.value as MaterialType }
                                : b
                            ),
                          }))
                        }
                      >
                        {MATERIAL_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Veranda & Stair Railing Material</Label>
                      <select
                        className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                        value={selBuilding.railingMaterial}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            buildings: p.buildings.map((b) =>
                              b.id === selBuilding.id
                                ? { ...b, railingMaterial: e.target.value as MaterialType }
                                : b
                            ),
                          }))
                        }
                      >
                        {MATERIAL_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Veranda Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <Label className="text-xs">Veranda Deck + Railings</Label>
                    <Switch
                      checked={selBuilding.hasVeranda}
                      onCheckedChange={(checked) =>
                        setModel((p) => ({
                          ...p,
                          buildings: p.buildings.map((b) =>
                            b.id === selBuilding.id ? { ...b, hasVeranda: checked } : b
                          ),
                        }))
                      }
                    />
                  </div>

                  {/* Custom Roof Designer */}
                  <div className={cn('p-2.5 rounded-lg border space-y-2', subBg)}>
                    <div className="font-bold text-xs text-sky-500">Custom Roof Design</div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Roof Style</Label>
                      <select
                        className={cn('w-full h-8 rounded-md border px-2 text-xs', surfaceBg)}
                        value={selBuilding.roof.style}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            buildings: p.buildings.map((b) =>
                              b.id === selBuilding.id
                                ? { ...b, roof: { ...b.roof, style: e.target.value as RoofStyle } }
                                : b
                            ),
                          }))
                        }
                      >
                        {ROOF_STYLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Roof Material</Label>
                        <select
                          className={cn('w-full h-8 rounded-md border px-2 text-xs', surfaceBg)}
                          value={selBuilding.roof.material}
                          onChange={(e) =>
                            setModel((p) => ({
                              ...p,
                              buildings: p.buildings.map((b) =>
                                b.id === selBuilding.id
                                  ? {
                                      ...b,
                                      roof: { ...b.roof, material: e.target.value as MaterialType },
                                    }
                                  : b
                              ),
                            }))
                          }
                        >
                          {MATERIAL_OPTIONS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Roof Color</Label>
                        <Input
                          type="color"
                          className="h-8 p-1 cursor-pointer"
                          value={selBuilding.roof.color}
                          onChange={(e) =>
                            setModel((p) => ({
                              ...p,
                              buildings: p.buildings.map((b) =>
                                b.id === selBuilding.id
                                  ? { ...b, roof: { ...b.roof, color: e.target.value } }
                                  : b
                              ),
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <Label className="text-[11px]">Glass Skylight Opening</Label>
                      <Switch
                        checked={selBuilding.roof.hasGlassOpening}
                        onCheckedChange={(checked) =>
                          setModel((p) => ({
                            ...p,
                            buildings: p.buildings.map((b) =>
                              b.id === selBuilding.id
                                ? { ...b, roof: { ...b.roof, hasGlassOpening: checked } }
                                : b
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Room Inspector */}
              {selRoom && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">Room: {selRoom.name}</div>
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      className="h-8 text-xs"
                      value={selRoom.name}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          rooms: p.rooms.map((r) =>
                            r.id === selRoom.id ? { ...r, name: e.target.value } : r
                          ),
                        }))
                      }
                    />
                  </div>
                  {rooms.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs">Reference Smart-Home Room</Label>
                      <select
                        className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                        value={selRoom.linkedRoomId || ''}
                        onChange={(e) => {
                          const found = rooms.find((r) => r.id.toString() === e.target.value);
                          setModel((p) => ({
                            ...p,
                            rooms: p.rooms.map((r) =>
                              r.id === selRoom.id
                                ? { ...r, linkedRoomId: e.target.value || undefined, name: found?.name || r.name }
                                : r
                            ),
                          }));
                        }}
                      >
                        <option value="">-- Unlinked --</option>
                        {rooms.map((rm) => (
                          <option key={rm.id} value={rm.id.toString()}>
                            {rm.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Width (m)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={selRoom.width}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            rooms: p.rooms.map((r) =>
                              r.id === selRoom.id ? { ...r, width: Math.max(2, Number(e.target.value) || 4) } : r
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Depth (m)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={selRoom.depth}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            rooms: p.rooms.map((r) =>
                              r.id === selRoom.id ? { ...r, depth: Math.max(2, Number(e.target.value) || 4) } : r
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Wall Color</Label>
                      <Input
                        type="color"
                        className="h-8 p-1 cursor-pointer"
                        value={selRoom.wallColor}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            rooms: p.rooms.map((r) =>
                              r.id === selRoom.id ? { ...r, wallColor: e.target.value } : r
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Wall Material</Label>
                      <select
                        className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                        value={selRoom.wallMaterial}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            rooms: p.rooms.map((r) =>
                              r.id === selRoom.id ? { ...r, wallMaterial: e.target.value as MaterialType } : r
                            ),
                          }))
                        }
                      >
                        {MATERIAL_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Section Inspector */}
              {selSection && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">Section: {selSection.name}</div>
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      className="h-8 text-xs"
                      value={selSection.name}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          sections: p.sections.map((s) =>
                            s.id === selSection.id ? { ...s, name: e.target.value } : s
                          ),
                        }))
                      }
                    />
                  </div>
                  {sections.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs">Reference Smart-Home Section</Label>
                      <select
                        className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                        value={selSection.linkedSectionId || ''}
                        onChange={(e) => {
                          const found = sections.find((s) => s.id.toString() === e.target.value);
                          setModel((p) => ({
                            ...p,
                            sections: p.sections.map((s) =>
                              s.id === selSection.id
                                ? { ...s, linkedSectionId: e.target.value || undefined, name: found?.name || s.name }
                                : s
                            ),
                          }));
                        }}
                      >
                        <option value="">-- Unlinked --</option>
                        {sections.map((sec) => (
                          <option key={sec.id} value={sec.id.toString()}>
                            {sec.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Width (m)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={selSection.width}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            sections: p.sections.map((s) =>
                              s.id === selSection.id ? { ...s, width: Math.max(2, Number(e.target.value) || 6) } : s
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Depth (m)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={selSection.depth}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            sections: p.sections.map((s) =>
                              s.id === selSection.id ? { ...s, depth: Math.max(2, Number(e.target.value) || 6) } : s
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Guard Railings</Label>
                    <Switch
                      checked={!!selSection.hasRailing}
                      onCheckedChange={(checked) =>
                        setModel((p) => ({
                          ...p,
                          sections: p.sections.map((s) =>
                            s.id === selSection.id ? { ...s, hasRailing: checked } : s
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Opening / Slab Inspector */}
              {(selOpening || selSlab) && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">
                    {selOpening ? 'Floor Opening' : 'Half-Length Slab'}
                  </div>
                  <p className="text-[11px] text-amber-500 font-medium">
                    Rule: Only a Staircase can be attached to openings and slabs.
                  </p>
                  <Button
                    size="sm"
                    className="w-full text-xs cursor-pointer"
                    onClick={() => {
                      const host = selOpening || selSlab!;
                      handleDropPayload(
                        { category: 'staircase' },
                        host.x,
                        host.z
                      );
                    }}
                  >
                    Attach Bidirectional Staircase
                  </Button>
                </div>
              )}

              {/* Staircase Inspector */}
              {selStair && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">Staircase</div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Bidirectional (Up & Down)</Label>
                    <Switch
                      checked={selStair.bidirectional}
                      onCheckedChange={(checked) =>
                        setModel((p) => ({
                          ...p,
                          staircases: p.staircases.map((s) =>
                            s.id === selStair.id ? { ...s, bidirectional: checked } : s
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Staircase Guards</Label>
                    <Switch
                      checked={selStair.hasGuards}
                      onCheckedChange={(checked) =>
                        setModel((p) => ({
                          ...p,
                          staircases: p.staircases.map((s) =>
                            s.id === selStair.id ? { ...s, hasGuards: checked } : s
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Guard Material</Label>
                    <select
                      className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                      value={selStair.railingMaterial}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          staircases: p.staircases.map((s) =>
                            s.id === selStair.id ? { ...s, railingMaterial: e.target.value as MaterialType } : s
                          ),
                        }))
                      }
                    >
                      {MATERIAL_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs cursor-pointer"
                    onClick={() =>
                      setModel((p) => ({
                        ...p,
                        staircases: p.staircases.map((s) =>
                          s.id === selStair.id ? { ...s, rotation: s.rotation + Math.PI / 2 } : s
                        ),
                      }))
                    }
                  >
                    Rotate 90°
                  </Button>
                </div>
              )}

              {/* Cylinder Support Inspector */}
              {selSupport && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">Cylinder Support</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Radius (m)</Label>
                      <Input
                        type="number"
                        step="0.05"
                        className="h-8 text-xs"
                        value={selSupport.radius}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            supports: p.supports.map((c) =>
                              c.id === selSupport.id
                                ? { ...c, radius: Math.max(0.12, Number(e.target.value) || 0.25) }
                                : c
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Height (m)</Label>
                      <Input
                        type="number"
                        step="0.2"
                        className="h-8 text-xs"
                        value={selSupport.height}
                        onChange={(e) =>
                          setModel((p) => ({
                            ...p,
                            supports: p.supports.map((c) =>
                              c.id === selSupport.id
                                ? { ...c, height: Math.max(1.2, Number(e.target.value) || 3.2) }
                                : c
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Scaffold / Pool / Grass Inspectors */}
              {selScaffold && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">{selScaffold.name}</div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tower Height (m)</Label>
                    <Input
                      type="number"
                      step="0.4"
                      className="h-8 text-xs"
                      value={selScaffold.height}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          scaffolds: p.scaffolds.map((s) =>
                            s.id === selScaffold.id
                              ? { ...s, height: Math.max(2, Number(e.target.value) || 4) }
                              : s
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {selPool && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">{selPool.name}</div>
                  <div className="space-y-1">
                    <Label className="text-xs">Attached Section</Label>
                    <select
                      className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                      value={selPool.sectionId}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          pools: p.pools.map((pl) =>
                            pl.id === selPool.id ? { ...pl, sectionId: e.target.value } : pl
                          ),
                        }))
                      }
                    >
                      {model.sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {selGrass && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">{selGrass.name}</div>
                  <p className="text-[11px] text-muted-foreground">
                    Drag corner handle on the Blueprint to resize lawn area.
                  </p>
                </div>
              )}

              {/* Facility Inspector */}
              {selFacility && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">{selFacility.name}</div>
                  <div className="space-y-1">
                    <Label className="text-xs">Mount Surface</Label>
                    <select
                      className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                      value={selFacility.mountSurface}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          facilities: p.facilities.map((f) =>
                            f.id === selFacility.id
                              ? { ...f, mountSurface: e.target.value as MountSurface }
                              : f
                          ),
                        }))
                      }
                    >
                      <option value="wall">Wall</option>
                      <option value="ceiling">Ceiling</option>
                      <option value="perimeter">Exterior Fence / Perimeter (Gate)</option>
                      <option value="roof">Roof Mount</option>
                    </select>
                  </div>

                  {(selFacility.kind === 'light' ||
                    selFacility.kind === 'door' ||
                    selFacility.kind === 'camera') && (
                    <Button
                      size="sm"
                      className="w-full text-xs cursor-pointer"
                      onClick={() => {
                        if (selFacility.linkedDeviceId && onToggleDevice) {
                          onToggleDevice(selFacility.linkedDeviceId);
                        }
                        setModel((p) => ({
                          ...p,
                          facilities: p.facilities.map((f) =>
                            f.id === selFacility.id
                              ? {
                                  ...f,
                                  isOn: f.kind !== 'door' ? !f.isOn : f.isOn,
                                  isOpen: f.kind === 'door' ? !f.isOpen : f.isOpen,
                                }
                              : f
                          ),
                        }));
                      }}
                    >
                      {selFacility.kind === 'door'
                        ? selFacility.isOpen
                          ? 'Close Door / Gate'
                          : 'Open Door / Gate'
                        : selFacility.isOn
                        ? 'Turn Off'
                        : 'Turn On'}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs cursor-pointer"
                    onClick={() =>
                      setModel((p) => ({
                        ...p,
                        facilities: p.facilities.map((f) =>
                          f.id === selFacility.id ? { ...f, rotation: f.rotation + Math.PI / 2 } : f
                        ),
                      }))
                    }
                  >
                    Rotate 90°
                  </Button>
                </div>
              )}

              {/* Utility Inspector */}
              {selUtility && (
                <div className="space-y-3">
                  <div className="font-bold text-sm">{selUtility.name}</div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tied To</Label>
                    <select
                      className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                      value={selUtility.targetScope}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          utilities: p.utilities.map((u) =>
                            u.id === selUtility.id
                              ? { ...u, targetScope: e.target.value as UtilityTargetScope }
                              : u
                          ),
                        }))
                      }
                    >
                      <option value="property">Property Itself</option>
                      <option value="section">Section</option>
                      <option value="room">Room</option>
                      {selUtility.kind === 'water_tank' && (
                        <option value="scaffold">Compound Scaffold</option>
                      )}
                    </select>
                  </div>

                  {selUtility.targetScope === 'section' && (
                    <select
                      className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                      value={selUtility.targetId || ''}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          utilities: p.utilities.map((u) =>
                            u.id === selUtility.id ? { ...u, targetId: e.target.value } : u
                          ),
                        }))
                      }
                    >
                      {model.sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {selUtility.targetScope === 'room' && (
                    <select
                      className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                      value={selUtility.targetId || ''}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          utilities: p.utilities.map((u) =>
                            u.id === selUtility.id ? { ...u, targetId: e.target.value } : u
                          ),
                        }))
                      }
                    >
                      {model.rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {selUtility.targetScope === 'scaffold' && (
                    <select
                      className={cn('w-full h-8 rounded-md border px-2 text-xs', subBg)}
                      value={selUtility.targetId || ''}
                      onChange={(e) =>
                        setModel((p) => ({
                          ...p,
                          utilities: p.utilities.map((u) =>
                            u.id === selUtility.id ? { ...u, targetId: e.target.value } : u
                          ),
                        }))
                      }
                    >
                      {model.scaffolds.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
