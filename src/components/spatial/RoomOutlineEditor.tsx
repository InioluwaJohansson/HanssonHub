import * as React from 'react';
import {
  OutlineSegmentMeta,
  RoomOutlineGeometryPayload,
  SegmentCurveKind,
  SpatialDraftPreview,
  SpatialFloorDto,
  SpatialGeometryKind,
  WallGeometryPayload,
} from '../../types/spatial';
import { Room } from '../../types';
import { buildSampledPolygonPoints } from './SpatialGeometryBuilders';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Info, Plus, Shapes, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomOutlineEditorProps {
  floors: SpatialFloorDto[];
  rooms: Room[];
  selectedFloorId: number | null;
  selectedRoomId: number | null;
  isBusy: boolean;
  onOutlineDraftChange?: (draft: SpatialDraftPreview | null) => void;
  onSaveOutline: (args: {
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
  }) => Promise<void>;
}

const SVG_SIZE = 240;
const METRES_RANGE = 12; // -6m..+6m

function toSvg(x: number, z: number): { sx: number; sy: number } {
  const half = METRES_RANGE / 2;
  return {
    sx: ((x + half) / METRES_RANGE) * SVG_SIZE,
    sy: ((z + half) / METRES_RANGE) * SVG_SIZE,
  };
}

function toMetres(sx: number, sy: number, snap: boolean): [number, number] {
  const half = METRES_RANGE / 2;
  let x = (sx / SVG_SIZE) * METRES_RANGE - half;
  let z = (sy / SVG_SIZE) * METRES_RANGE - half;
  if (snap) {
    x = Math.round(x * 4) / 4;
    z = Math.round(z * 4) / 4;
  } else {
    x = Math.round(x * 100) / 100;
    z = Math.round(z * 100) / 100;
  }
  return [x, z];
}

export function RoomOutlineEditor({
  floors,
  rooms,
  selectedFloorId,
  selectedRoomId,
  isBusy,
  onOutlineDraftChange,
  onSaveOutline,
}: RoomOutlineEditorProps) {
  const [name, setName] = React.useState('Living Room Outline');
  const [floorId, setFloorId] = React.useState<string>(
    selectedFloorId ? String(selectedFloorId) : ''
  );
  const [roomId, setRoomId] = React.useState<string>(
    selectedRoomId ? String(selectedRoomId) : ''
  );
  const [wallHeight, setWallHeight] = React.useState(2.8);
  const [wallThickness, setWallThickness] = React.useState(0.18);
  const [wallMaterial, setWallMaterial] =
    React.useState<WallGeometryPayload['material']>('drywall');
  const [includeFloorSlab, setIncludeFloorSlab] = React.useState(true);
  const [includeCeilingSlab, setIncludeCeilingSlab] = React.useState(false);
  const [snapToGrid, setSnapToGrid] = React.useState(true);

  const [points, setPoints] = React.useState<[number, number, number][]>([
    [-2.5, 0, -2],
    [2.5, 0, -2],
    [3.25, 0, 1.5],
    [0, 0, 2.5],
    [-2.5, 0, 1.5],
  ]);

  const [segments, setSegments] = React.useState<OutlineSegmentMeta[]>([]);
  const [selectedSegIdx, setSelectedSegIdx] = React.useState<number>(0);
  const [draggingVertex, setDraggingVertex] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (selectedFloorId) setFloorId(String(selectedFloorId));
  }, [selectedFloorId]);

  React.useEffect(() => {
    if (selectedRoomId) setRoomId(String(selectedRoomId));
  }, [selectedRoomId]);

  React.useEffect(() => {
    if (!onOutlineDraftChange) return;
    const fId = floorId ? Number(floorId) : null;
    const elev = fId ? floors.find((f) => f.id === fId)?.elevation ?? 0 : 0;
    onOutlineDraftChange({
      kind: 'outline',
      points: points.map(([x, , z]) => [x, elev, z]),
      segments: segments.filter((s) => s.index < points.length),
      wallHeight,
      wallThickness,
      elevationY: elev,
      label: name,
    });
  }, [points, segments, wallHeight, wallThickness, floorId, floors, name, onOutlineDraftChange]);

  const sampled3D = React.useMemo(
    () => buildSampledPolygonPoints(points, segments),
    [points, segments]
  );

  // Shoelace area & perimeter in metres
  const metrics = React.useMemo(() => {
    if (sampled3D.length < 3) return { area: 0, perimeter: 0 };
    let area2 = 0;
    let perimeter = 0;
    for (let i = 0; i < sampled3D.length; i++) {
      const a = sampled3D[i];
      const b = sampled3D[(i + 1) % sampled3D.length];
      area2 += a.x * b.z - b.x * a.z;
      perimeter += Math.hypot(b.x - a.x, b.z - a.z);
    }
    return {
      area: Math.abs(area2) * 0.5,
      perimeter,
    };
  }, [sampled3D]);

  const activeSegMeta = React.useMemo<OutlineSegmentMeta>(() => {
    return (
      segments.find((s) => s.index === selectedSegIdx) || {
        index: selectedSegIdx,
        curveType: 'line',
        arcBulge: 0,
      }
    );
  }, [segments, selectedSegIdx]);

  const updateSegmentMeta = (idx: number, patch: Partial<OutlineSegmentMeta>) => {
    setSegments((prev) => {
      const existing = prev.find((s) => s.index === idx);
      const a = points[idx];
      const b = points[(idx + 1) % points.length];
      const midCtrl: [number, number, number] =
        a && b
          ? [(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2 + 0.8]
          : [0, 0, 1];
      const nextItem: OutlineSegmentMeta = {
        index: idx,
        curveType: existing?.curveType ?? 'line',
        arcBulge: existing?.arcBulge ?? 0.6,
        control1: existing?.control1 ?? midCtrl,
        ...patch,
      };
      return [...prev.filter((s) => s.index !== idx), nextItem];
    });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingVertex === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * SVG_SIZE;
    const sy = ((e.clientY - rect.top) / rect.height) * SVG_SIZE;
    const [mx, mz] = toMetres(
      Math.max(6, Math.min(SVG_SIZE - 6, sx)),
      Math.max(6, Math.min(SVG_SIZE - 6, sy)),
      snapToGrid
    );
    setPoints((prev) =>
      prev.map((pt, idx) => (idx === draggingVertex ? [mx, 0, mz] : pt))
    );
  };

  const handleInsertOnEdge = (edgeIdx: number) => {
    const a = points[edgeIdx];
    const b = points[(edgeIdx + 1) % points.length];
    const mid: [number, number, number] = [
      Math.round(((a[0] + b[0]) / 2) * 4) / 4,
      0,
      Math.round(((a[2] + b[2]) / 2) * 4) / 4,
    ];
    const next = [...points];
    next.splice(edgeIdx + 1, 0, mid);
    setPoints(next);
  };

  const applyPreset = (preset: 'lshape' | 'rect' | 'hex') => {
    setSegments([]);
    setSelectedSegIdx(0);
    if (preset === 'lshape') {
      setPoints([
        [-3, 0, -2.5],
        [3, 0, -2.5],
        [3, 0, 0],
        [0.5, 0, 0],
        [0.5, 0, 2.5],
        [-3, 0, 2.5],
      ]);
    } else if (preset === 'rect') {
      setPoints([
        [-2, 0, -1.5],
        [2, 0, -1.5],
        [2, 0, 1.5],
        [-2, 0, 1.5],
      ]);
    } else {
      const hex: [number, number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI * 2) / 6;
        hex.push([
          Math.round(Math.cos(ang) * 2.8 * 4) / 4,
          0,
          Math.round(Math.sin(ang) * 2.8 * 4) / 4,
        ]);
      }
      setPoints(hex);
    }
  };

  const triggerSubmit = async (generateStructure: boolean) => {
    if (points.length < 3 || !name.trim()) return;
    const fId = floorId ? Number(floorId) : null;
    const rId = roomId ? Number(roomId) : null;
    const elev = fId ? floors.find((f) => f.id === fId)?.elevation ?? 0 : 0;
    const payload: RoomOutlineGeometryPayload = {
      type: 'polygon',
      points: points.map(([x, , z]) => [x, elev, z]),
      segments: segments.filter((s) => s.index < points.length),
      floorId: fId ?? undefined,
      roomId: rId ?? undefined,
    };
    await onSaveOutline({
      name: name.trim(),
      floorId: fId,
      roomId: rId,
      height: wallHeight,
      thickness: wallThickness,
      wallMaterial,
      includeFloorSlab,
      includeCeilingSlab,
      payload,
      generateStructure,
    });
  };

  const svgPolyPoints = sampled3D
    .map((v) => {
      const p = toSvg(v.x, v.z);
      return `${p.sx},${p.sy}`;
    })
    .join(' ');

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
          <Shapes className="h-3.5 w-3.5 text-primary" />
          <span>Irregular Polygon & Curve Editor (m)</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => applyPreset('lshape')}
          >
            L-Shape
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => applyPreset('hex')}
          >
            Hex
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => applyPreset('rect')}
          >
            4x3
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400 mb-1">
            Outline Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-xs bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400 mb-1">
            Target Floor
          </label>
          <select
            value={floorId}
            onChange={(e) => setFloorId(e.target.value)}
            className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 px-2 text-xs"
          >
            <option value="">Floor / Unbound</option>
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.elevation}m)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400 mb-1">
            Bind Room (Optional)
          </label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full h-8 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 px-2 text-xs"
          >
            <option value="">No specific room</option>
            {rooms
              .filter((r) => !r.isHidden)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-zinc-300 cursor-pointer">
            <Checkbox
              checked={snapToGrid}
              onCheckedChange={(v) => setSnapToGrid(Boolean(v))}
            />
            Snap 0.25m
          </label>
        </div>
      </div>

      {/* 2D Interactive SVG Canvas */}
      <div className="relative rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-2 flex flex-col items-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="w-full max-w-[230px] aspect-square touch-none select-none cursor-crosshair"
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDraggingVertex(null)}
          onPointerLeave={() => setDraggingVertex(null)}
        >
          {/* 1m Grid */}
          {Array.from({ length: METRES_RANGE + 1 }).map((_, idx) => {
            const pos = (idx / METRES_RANGE) * SVG_SIZE;
            const isCenter = idx === METRES_RANGE / 2;
            return (
              <React.Fragment key={idx}>
                <line
                  x1={pos}
                  y1={0}
                  x2={pos}
                  y2={SVG_SIZE}
                  className={
                    isCenter
                      ? 'stroke-slate-400/70 dark:stroke-zinc-600'
                      : 'stroke-slate-200/80 dark:stroke-zinc-800/80'
                  }
                  strokeWidth={isCenter ? 1.2 : 0.7}
                />
                <line
                  x1={0}
                  y1={pos}
                  x2={SVG_SIZE}
                  y2={pos}
                  className={
                    isCenter
                      ? 'stroke-slate-400/70 dark:stroke-zinc-600'
                      : 'stroke-slate-200/80 dark:stroke-zinc-800/80'
                  }
                  strokeWidth={isCenter ? 1.2 : 0.7}
                />
              </React.Fragment>
            );
          })}

          {/* Filled Polygon */}
          {svgPolyPoints && (
            <polygon
              points={svgPolyPoints}
              className="fill-blue-500/20 stroke-blue-600 dark:stroke-sky-400"
              strokeWidth={2}
            />
          )}

          {/* Edge Click Targets to Select Segment Curve or Insert Point */}
          {points.map((a, idx) => {
            const b = points[(idx + 1) % points.length];
            const sa = toSvg(a[0], a[2]);
            const sb = toSvg(b[0], b[2]);
            const mx = (sa.sx + sb.sx) / 2;
            const my = (sa.sy + sb.sy) / 2;
            const isSelectedEdge = selectedSegIdx === idx;
            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={sa.sx}
                  y1={sa.sy}
                  x2={sb.sx}
                  y2={sb.sy}
                  stroke="transparent"
                  strokeWidth={10}
                  className="cursor-pointer"
                  onClick={() => setSelectedSegIdx(idx)}
                />
                <circle
                  cx={mx}
                  cy={my}
                  r={isSelectedEdge ? 4.5 : 3.2}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelectedEdge
                      ? 'fill-amber-500 stroke-white'
                      : 'fill-slate-400/70 dark:fill-zinc-500 hover:fill-blue-500'
                  )}
                  strokeWidth={1}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (e.shiftKey) {
                      handleInsertOnEdge(idx);
                    } else {
                      setSelectedSegIdx(idx);
                    }
                  }}
                />
              </g>
            );
          })}

          {/* Draggable Corner Vertices */}
          {points.map((pt, idx) => {
            const { sx, sy } = toSvg(pt[0], pt[2]);
            return (
              <g key={`v-${idx}`}>
                <circle
                  cx={sx}
                  cy={sy}
                  r={6}
                  className="fill-white dark:fill-zinc-900 stroke-blue-600 dark:stroke-sky-400 cursor-grab active:cursor-grabbing"
                  strokeWidth={2}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setDraggingVertex(idx);
                  }}
                />
                <text
                  x={sx + 8}
                  y={sy - 6}
                  className="text-[9px] font-mono fill-slate-700 dark:fill-zinc-300 pointer-events-none"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="w-full flex items-center justify-between text-[10px] text-slate-600 dark:text-zinc-400 mt-1.5 px-1">
          <span>Area: {metrics.area.toFixed(2)} m²</span>
          <span>Perimeter: {metrics.perimeter.toFixed(2)} m</span>
          <button
            type="button"
            onClick={() => handleInsertOnEdge(selectedSegIdx)}
            className="inline-flex items-center gap-0.5 text-primary font-semibold hover:underline cursor-pointer"
          >
            <Plus className="h-3 w-3" /> Split Edge {selectedSegIdx + 1}
          </button>
        </div>
      </div>

      {/* Segment Curve Selector (Line / Circular Arc / Bezier) */}
      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800 dark:text-zinc-200">
            Edge #{selectedSegIdx + 1} Curve
          </span>
          {points.length > 3 && (
            <button
              type="button"
              onClick={() => {
                setPoints((prev) => prev.filter((_, i) => i !== selectedSegIdx));
                setSelectedSegIdx(0);
              }}
              className="text-red-500 hover:text-red-600 inline-flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
            >
              <Trash2 className="h-3 w-3" /> Remove V{selectedSegIdx + 1}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1">
          {(['line', 'arc', 'bezier'] as SegmentCurveKind[]).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => updateSegmentMeta(selectedSegIdx, { curveType: kind })}
              className={cn(
                'py-1 rounded-md text-[11px] font-medium capitalize border cursor-pointer transition-colors',
                activeSegMeta.curveType === kind
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
              )}
            >
              {kind}
            </button>
          ))}
        </div>

        {activeSegMeta.curveType === 'arc' && (
          <div>
            <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">
              Arc Sagitta Bulge (m): {(activeSegMeta.arcBulge ?? 0.6).toFixed(2)}m
            </label>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.1}
              value={activeSegMeta.arcBulge ?? 0.6}
              onChange={(e) =>
                updateSegmentMeta(selectedSegIdx, { arcBulge: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        )}

        {activeSegMeta.curveType === 'bezier' && (
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-zinc-400">
                Ctrl X (m)
              </label>
              <Input
                type="number"
                step={0.25}
                value={activeSegMeta.control1?.[0] ?? 0}
                onChange={(e) => {
                  const cur = activeSegMeta.control1 ?? [0, 0, 1];
                  updateSegmentMeta(selectedSegIdx, {
                    control1: [Number(e.target.value), cur[1], cur[2]],
                  });
                }}
                className="h-7 text-xs bg-white dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-zinc-400">
                Ctrl Z (m)
              </label>
              <Input
                type="number"
                step={0.25}
                value={activeSegMeta.control1?.[2] ?? 1}
                onChange={(e) => {
                  const cur = activeSegMeta.control1 ?? [0, 0, 1];
                  updateSegmentMeta(selectedSegIdx, {
                    control1: [cur[0], cur[1], Number(e.target.value)],
                  });
                }}
                className="h-7 text-xs bg-white dark:bg-zinc-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Structural generation parameters */}
      <div className="grid grid-cols-3 gap-1.5">
        <div>
          <label className="block text-[10px] text-slate-500 dark:text-zinc-400">
            Wall H (m)
          </label>
          <Input
            type="number"
            step={0.1}
            min={0.3}
            value={wallHeight}
            onChange={(e) => setWallHeight(Number(e.target.value) || 2.8)}
            className="h-7 text-xs bg-white dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 dark:text-zinc-400">
            Wall T (m)
          </label>
          <Input
            type="number"
            step={0.02}
            min={0.04}
            value={wallThickness}
            onChange={(e) => setWallThickness(Number(e.target.value) || 0.16)}
            className="h-7 text-xs bg-white dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 dark:text-zinc-400">
            Material
          </label>
          <select
            value={wallMaterial}
            onChange={(e) =>
              setWallMaterial(e.target.value as WallGeometryPayload['material'])
            }
            className="w-full h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 px-1.5 text-xs"
          >
            <option value="drywall">Drywall</option>
            <option value="concrete">Concrete</option>
            <option value="brick">Brick</option>
            <option value="wood">Wood</option>
            <option value="metal">Metal</option>
            <option value="glass">Glass</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-slate-700 dark:text-zinc-300">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Checkbox
            checked={includeFloorSlab}
            onCheckedChange={(v) => setIncludeFloorSlab(Boolean(v))}
          />
          Floor Slab
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Checkbox
            checked={includeCeilingSlab}
            onCheckedChange={(v) => setIncludeCeilingSlab(Boolean(v))}
          />
          Optional Ceiling
        </label>
      </div>

      <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          Generated segments retain <code>sourceOutlineId</code> so later manual wall edits stay independent without overwriting this RoomOutline. Backend validation is authoritative; no client-side solid CSG collision claim is made.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isBusy || points.length < 3 || !name.trim()}
          onClick={() => triggerSubmit(false)}
          className="h-8 text-xs font-semibold"
        >
          Save Outline Only
        </Button>
        <Button
          type="button"
          disabled={isBusy || points.length < 3 || !name.trim()}
          onClick={() => triggerSubmit(true)}
          className="h-8 text-xs font-semibold gap-1"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Generate Structure
        </Button>
      </div>
    </div>
  );
}
