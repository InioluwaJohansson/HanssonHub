import * as THREE from 'three';
import { Device, UtilityType } from '../../types';
import {
  ExteriorOrStructurePayload,
  LightFixtureGroupMeta,
  PoolGeometryPayload,
  RoofGeometryPayload,
  RoomOutlineGeometryPayload,
  SegmentCurveKind,
  SlabGeometryPayload,
  SpatialFloorDto,
  SpatialGeometryDto,
  SpatialGeometryKind,
  SpatialNodeKind,
  SpatialOpeningDto,
  SpatialOpeningKind,
  SpatialPlacementDto,
  SpatialTargetKind,
  StairGeometryPayload,
  ViewportRenderMode,
  WallGeometryPayload,
  WallOpeningSpec,
} from '../../types/spatial';

export interface SpatialGeometryBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  width: number;
  depth: number;
  centerX: number;
  centerZ: number;
  floorY: number;
  height: number;
}

export interface SpatialWallMeta {
  start: [number, number, number];
  end: [number, number, number];
  length: number;
  angleRad: number;
  elevationY: number;
  height: number;
  thickness: number;
  style: NonNullable<WallGeometryPayload['style']>;
  material: NonNullable<WallGeometryPayload['material']>;
  openings: WallOpeningSpec[];
}

const coercePoint3D = (p: any, defaultY: number): [number, number, number] | null => {
  if (!p) return null;
  if (Array.isArray(p)) {
    if (p.length >= 3) {
      return [Number(p[0] ?? 0), Number(p[1] ?? defaultY), Number(p[2] ?? 0)];
    }
    if (p.length === 2) {
      return [Number(p[0] ?? 0), defaultY, Number(p[1] ?? 0)];
    }
    return null;
  }
  if (typeof p === 'object') {
    const x = p.x ?? p.X;
    const z = p.z ?? p.Z;
    if (x !== undefined && z !== undefined) {
      return [Number(x), Number(p.y ?? p.Y ?? defaultY), Number(z)];
    }
  }
  return null;
};

export function extractGeometryPoints3D(
  geom: SpatialGeometryDto,
  floorMap?: Map<number, SpatialFloorDto>
): [number, number, number][] {
  const parsed = safeParseJson<any>(geom.geometryJson);
  const floorElev =
    (parsed?.elevationY !== undefined ? Number(parsed.elevationY) : undefined) ??
    (parsed?.ElevationY !== undefined ? Number(parsed.ElevationY) : undefined) ??
    (geom.floorId && floorMap ? floorMap.get(geom.floorId)?.elevation : undefined) ??
    0;

  const rawPts = parsed?.points ?? parsed?.Points;
  if (Array.isArray(rawPts) && rawPts.length > 0) {
    const mapped = rawPts
      .map((p: any) => coercePoint3D(p, floorElev))
      .filter((p): p is [number, number, number] => p !== null);
    if (mapped.length > 0) return mapped;
  }

  if (parsed?.start && parsed?.end) {
    const s = coercePoint3D(parsed.start, floorElev);
    const e = coercePoint3D(parsed.end, floorElev);
    if (s && e) return [s, e];
  }

  if (
    parsed?.x1 !== undefined &&
    parsed?.z1 !== undefined &&
    parsed?.x2 !== undefined &&
    parsed?.z2 !== undefined
  ) {
    return [
      [Number(parsed.x1), floorElev, Number(parsed.z1)],
      [Number(parsed.x2), floorElev, Number(parsed.z2)],
    ];
  }

  if (Array.isArray(geom.points) && geom.points.length > 0) {
    return [...geom.points]
      .sort((a, b) => a.sequence - b.sequence)
      .map((p) => [p.x, p.y ?? floorElev, p.z]);
  }
  return [];
}

export function computeGeometryBounds(
  geom: SpatialGeometryDto,
  floorMap?: Map<number, SpatialFloorDto>
): SpatialGeometryBounds | null {
  const pts = extractGeometryPoints3D(geom, floorMap);
  const parsed = safeParseJson<any>(geom.geometryJson);
  const floorY =
    (parsed?.elevationY !== undefined ? Number(parsed.elevationY) : undefined) ??
    (geom.floorId && floorMap ? floorMap.get(geom.floorId)?.elevation : undefined) ??
    0;

  if (pts.length === 0) {
    if (Array.isArray(parsed?.origin)) {
      const w = Number(parsed?.width ?? parsed?.length ?? 2);
      const d = Number(parsed?.depth ?? parsed?.width ?? 2);
      const cx = Number(parsed.origin[0] ?? 0);
      const cz = Number(parsed.origin[2] ?? 0);
      return {
        minX: cx - w / 2,
        maxX: cx + w / 2,
        minZ: cz - d / 2,
        maxZ: cz + d / 2,
        width: w,
        depth: d,
        centerX: cx,
        centerZ: cz,
        floorY,
        height: geom.height || 2.8,
      };
    }
    return null;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  pts.forEach(([x, , z]) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  });

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    width: Math.max(0.1, maxX - minX),
    depth: Math.max(0.1, maxZ - minZ),
    centerX: (minX + maxX) * 0.5,
    centerZ: (minZ + maxZ) * 0.5,
    floorY,
    height: geom.height || 2.8,
  };
}

export function extractWallMeta(
  geom: SpatialGeometryDto,
  floorMap?: Map<number, SpatialFloorDto>,
  externalOpenings: SpatialOpeningDto[] = []
): SpatialWallMeta | null {
  if (
    geom.kind !== SpatialGeometryKind.Wall &&
    geom.kind !== SpatialGeometryKind.WallSegment &&
    geom.kind !== SpatialGeometryKind.GlassPanel
  ) {
    return null;
  }
  const parsed = safeParseJson<Partial<WallGeometryPayload>>(geom.geometryJson) || {};
  const pts = extractGeometryPoints3D(geom, floorMap);
  if (pts.length < 2) return null;

  const start = pts[0];
  const end = pts[pts.length - 1];
  const dx = end[0] - start[0];
  const dz = end[2] - start[2];
  const length = Math.hypot(dx, dz);
  const floorElev =
    (parsed.elevationY !== undefined ? Number(parsed.elevationY) : undefined) ??
    (geom.floorId && floorMap ? floorMap.get(geom.floorId)?.elevation : undefined) ??
    start[1] ??
    0;

  const mappedExternal: WallOpeningSpec[] = externalOpenings
    .filter((o) => o.hostGeometryId === geom.id)
    .map((o) => ({
      id: `db-op-${o.id}`,
      kind: o.kind,
      offsetAlongWall: o.offset,
      sillHeight: o.sillHeight,
      width: o.width,
      height: o.height,
      hasFrame: true,
      hasGlass: o.kind === SpatialOpeningKind.Window,
    }));

  return {
    start,
    end,
    length,
    angleRad: -Math.atan2(dz, dx),
    elevationY: floorElev,
    height: Math.max(0.1, geom.height || 2.8),
    thickness: Math.max(0.04, geom.thickness || 0.18),
    style:
      geom.kind === SpatialGeometryKind.GlassPanel
        ? 'glassPanel'
        : parsed.style || 'solid',
    material:
      (geom.materialCode as WallGeometryPayload['material']) ||
      parsed.material ||
      'concrete',
    openings: [...(parsed.openings || []), ...mappedExternal],
  };
}

export interface SpatialThemePalette {
  background: number;
  fog: number;
  gridMajor: number;
  gridMinor: number;
  wallConcrete: number;
  wallBrick: number;
  wallWood: number;
  wallDrywall: number;
  wallMetal: number;
  slabColor: number;
  ceilingColor: number;
  roofColor: number;
  parapetColor: number;
  stairColor: number;
  outlineLine: number;
  outlineBeam: number;
  objectEdge: number;
  objectEdgeOpacity: number;
  voidLine: number;
  exteriorGarden: number;
  exteriorDriveway: number;
  scaffoldSteel: number;
  glassTint: number;
  waterTint: number;
  poolDeck: number;
  selectionAccent: number;
}

export function getSpatialThemePalette(theme: 'light' | 'dark'): SpatialThemePalette {
  if (theme === 'light') {
    return {
      background: 0xeff3f8,
      fog: 0xeff3f8,
      gridMajor: 0x334155,
      gridMinor: 0x94a3b8,
      wallConcrete: 0xd6d3d1,
      wallBrick: 0xc26d53,
      wallWood: 0xb4845a,
      wallDrywall: 0xf1f5f9,
      wallMetal: 0x64748b,
      slabColor: 0xcbd5e1,
      ceilingColor: 0xe2e8f0,
      roofColor: 0x475569,
      parapetColor: 0x64748b,
      stairColor: 0x94a3b8,
      outlineLine: 0x1d4ed8,
      outlineBeam: 0x2563eb,
      objectEdge: 0x0f172a,
      objectEdgeOpacity: 0.78,
      voidLine: 0xd97706,
      exteriorGarden: 0x86efac,
      exteriorDriveway: 0x94a3b8,
      scaffoldSteel: 0x475569,
      glassTint: 0x3b82f6,
      waterTint: 0x0ea5e9,
      poolDeck: 0xd6d3d1,
      selectionAccent: 0xf59e0b,
    };
  }
  return {
    background: 0x0b0f17,
    fog: 0x0b0f17,
    gridMajor: 0x94a3b8,
    gridMinor: 0x334155,
    wallConcrete: 0x64748b,
    wallBrick: 0x9f523b,
    wallWood: 0x8a613e,
    wallDrywall: 0x94a3b8,
    wallMetal: 0x475569,
    slabColor: 0x1e293b,
    ceilingColor: 0x334155,
    roofColor: 0x1e293b,
    parapetColor: 0x334155,
    stairColor: 0x64748b,
    outlineLine: 0x38bdf8,
    outlineBeam: 0x38bdf8,
    objectEdge: 0xf1f5f9,
    objectEdgeOpacity: 0.85,
    voidLine: 0xfbbf24,
    exteriorGarden: 0x166534,
    exteriorDriveway: 0x334155,
    scaffoldSteel: 0x94a3b8,
    glassTint: 0x38bdf8,
    waterTint: 0x0284c7,
    poolDeck: 0x475569,
    selectionAccent: 0xf59e0b,
  };
}

export function safeParseJson<T>(raw?: string | null): T | null {
  if (!raw || typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Sample 3D points along a line, circular arc, or Bezier curve in Y-up metres.
 */
export function sampleSegmentPoints(
  start: [number, number, number],
  end: [number, number, number],
  curveType: SegmentCurveKind = 'line',
  arcBulge = 0,
  control1?: [number, number, number],
  control2?: [number, number, number],
  subdivisions = 18
): THREE.Vector3[] {
  const p0 = new THREE.Vector3(start[0], start[1], start[2]);
  const p1 = new THREE.Vector3(end[0], end[1], end[2]);

  if (curveType === 'line') {
    return [p0, p1];
  }

  if (curveType === 'arc') {
    const chord = p1.clone().sub(p0);
    const len = chord.length();
    if (len < 0.001 || Math.abs(arcBulge) < 0.001) {
      return [p0, p1];
    }
    const mid = p0.clone().add(p1).multiplyScalar(0.5);
    const perp = new THREE.Vector3(-chord.z, 0, chord.x).normalize();
    // Quadratic approximation with sagitta bulge at t=0.5 (control point offset = 2 * arcBulge)
    const ctrl = mid.clone().addScaledVector(perp, arcBulge * 2);
    const curve = new THREE.QuadraticBezierCurve3(p0, ctrl, p1);
    return curve.getPoints(subdivisions);
  }

  if (curveType === 'bezier') {
    const mid = p0.clone().add(p1).multiplyScalar(0.5);
    const c1 = control1
      ? new THREE.Vector3(control1[0], control1[1], control1[2])
      : mid.clone().add(new THREE.Vector3(0, 0, 1));
    if (control2) {
      const c2 = new THREE.Vector3(control2[0], control2[1], control2[2]);
      return new THREE.CubicBezierCurve3(p0, c1, c2, p1).getPoints(subdivisions);
    }
    return new THREE.QuadraticBezierCurve3(p0, c1, p1).getPoints(subdivisions);
  }

  return [p0, p1];
}

export function buildSampledPolygonPoints(
  points: [number, number, number][],
  segments?: RoomOutlineGeometryPayload['segments']
): THREE.Vector3[] {
  if (!points || points.length < 2) return [];
  const result: THREE.Vector3[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const segMeta = segments?.find((s) => s.index === i);
    const sampled = sampleSegmentPoints(
      a,
      b,
      segMeta?.curveType || 'line',
      segMeta?.arcBulge ?? 0,
      segMeta?.control1,
      segMeta?.control2,
      16
    );
    for (let k = 0; k < sampled.length - 1; k++) {
      result.push(sampled[k]);
    }
  }
  return result;
}

function getWallColor(
  materialName: WallGeometryPayload['material'] | undefined,
  palette: SpatialThemePalette
): number {
  switch (materialName) {
    case 'brick':
      return palette.wallBrick;
    case 'wood':
      return palette.wallWood;
    case 'drywall':
      return palette.wallDrywall;
    case 'metal':
      return palette.wallMetal;
    case 'glass':
      return palette.glassTint;
    default:
      return palette.wallConcrete;
  }
}

function makeSlabShape(pointsXZ: [number, number, number][]): THREE.Shape | null {
  if (!pointsXZ || pointsXZ.length < 3) return null;
  const shape = new THREE.Shape();
  shape.moveTo(pointsXZ[0][0], -pointsXZ[0][2]);
  for (let i = 1; i < pointsXZ.length; i++) {
    shape.lineTo(pointsXZ[i][0], -pointsXZ[i][2]);
  }
  shape.closePath();
  return shape;
}

type ProceduralTextureKind = 'concrete' | 'drywall' | 'brick' | 'wood' | 'tile' | 'grass';

const _proceduralTextureCache = new Map<string, THREE.CanvasTexture>();

function getProceduralTexture(
  kind: ProceduralTextureKind,
  theme: 'light' | 'dark'
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const key = `${kind}:${theme}`;
  const cached = _proceduralTextureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const isLight = theme === 'light';

  if (kind === 'brick') {
    ctx.fillStyle = isLight ? '#b4533c' : '#7c3424';
    ctx.fillRect(0, 0, 256, 256);
    const mortar = isLight ? '#d6cfc7' : '#475569';
    ctx.fillStyle = mortar;
    for (let y = 0; y < 256; y += 32) {
      ctx.fillRect(0, y, 256, 4);
      const offset = (Math.floor(y / 32) % 2) * 32;
      for (let x = offset; x < 256; x += 64) {
        ctx.fillRect(x, y, 4, 32);
      }
    }
    for (let i = 0; i < 650; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect((i * 53) % 256, (i * 97) % 256, 6, 4);
    }
  } else if (kind === 'wood') {
    ctx.fillStyle = isLight ? '#a9774d' : '#785130';
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      ctx.fillStyle = y % 64 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, y, 256, 30);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(0, y + 30, 256, 2);
    }
    ctx.strokeStyle = 'rgba(40,20,5,0.12)';
    ctx.lineWidth = 1;
    for (let y = 6; y < 256; y += 11) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(85, y + 3, 170, y - 3, 256, y);
      ctx.stroke();
    }
  } else if (kind === 'tile') {
    ctx.fillStyle = isLight ? '#dce3ec' : '#243247';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = isLight ? 'rgba(100,116,139,0.35)' : 'rgba(148,163,184,0.28)';
    ctx.lineWidth = 3;
    for (let pos = 0; pos <= 256; pos += 64) {
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(256, pos);
      ctx.stroke();
    }
    for (let y = 0; y < 256; y += 64) {
      for (let x = 0; x < 256; x += 64) {
        if (((x + y) / 64) % 2 === 0) {
          ctx.fillStyle = isLight ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)';
          ctx.fillRect(x + 2, y + 2, 60, 60);
        }
      }
    }
  } else if (kind === 'grass') {
    ctx.fillStyle = isLight ? '#4ade80' : '#15803d';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1200; i++) {
      const gx = (i * 73) % 256;
      const gy = (i * 137) % 256;
      ctx.fillStyle =
        i % 3 === 0
          ? 'rgba(255,255,255,0.12)'
          : i % 3 === 1
          ? 'rgba(20,83,45,0.22)'
          : 'rgba(134,239,172,0.18)';
      ctx.fillRect(gx, gy, 2, 6);
    }
  } else if (kind === 'drywall') {
    ctx.fillStyle = isLight ? '#f4f6f8' : '#7b8aa0';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)';
      ctx.fillRect((i * 41) % 256, (i * 89) % 256, 4, 4);
    }
  } else {
    // Architectural concrete formwork
    ctx.fillStyle = isLight ? '#d1d5db' : '#58677d';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = isLight ? 'rgba(71,85,105,0.22)' : 'rgba(15,23,42,0.34)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 254, 126);
    ctx.strokeRect(1, 129, 254, 126);
    ctx.fillStyle = isLight ? 'rgba(71,85,105,0.25)' : 'rgba(15,23,42,0.45)';
    [
      [32, 32],
      [224, 32],
      [32, 160],
      [224, 160],
    ].forEach(([tx, ty]) => {
      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
      ctx.fillRect((i * 61) % 256, (i * 113) % 256, 3, 3);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.userData = { sharedTexture: true };
  _proceduralTextureCache.set(key, tex);
  return tex;
}

function scaleGeometryUVs(geo: THREE.BufferGeometry, tileMeters = 2.0): void {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  if (!pos || !uv) return;
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const sx = bb ? Math.max(1, (bb.max.x - bb.min.x) / tileMeters) : 1;
  const sy = bb ? Math.max(1, (bb.max.y - bb.min.y) / tileMeters) : 1;
  const sz = bb ? Math.max(1, (bb.max.z - bb.min.z) / tileMeters) : 1;
  const horiz = Math.max(sx, sz);
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * horiz, uv.getY(i) * Math.max(1, sy));
  }
  uv.needsUpdate = true;
}

function createTextSprite(
  text: string,
  palette: SpatialThemePalette,
  accentHex?: string,
  scaleWidth = 2.2
): THREE.Sprite | null {
  if (typeof document === 'undefined' || !text.trim()) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const isLightScene = palette.background === 0xeff3f8;
  const bgFill = isLightScene ? 'rgba(15, 23, 42, 0.88)' : 'rgba(241, 245, 249, 0.92)';
  const fgText = isLightScene ? '#f8fafc' : '#0f172a';
  const strokeCol = accentHex || (isLightScene ? '#2563eb' : '#38bdf8');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 34px Inter, system-ui, -apple-system, sans-serif';
  const measured = Math.min(440, Math.max(150, ctx.measureText(text).width + 52));
  const x = (canvas.width - measured) * 0.5;
  const y = 24;
  const h = 76;
  const r = 18;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + measured - r, y);
  ctx.quadraticCurveTo(x + measured, y, x + measured, y + r);
  ctx.lineTo(x + measured, y + h - r);
  ctx.quadraticCurveTo(x + measured, y + h, x + measured - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  ctx.fillStyle = bgFill;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = strokeCol;
  ctx.stroke();

  ctx.fillStyle = fgText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width * 0.5, y + h * 0.5 + 1, measured - 28);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scaleWidth, scaleWidth * 0.25, 1);
  sprite.renderOrder = 25;
  sprite.userData.isLabelSprite = true;
  return sprite;
}

function addMeshEdgeOutline(
  mesh: THREE.Mesh,
  edgeColor: number,
  opacity = 0.82
): void {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({
      color: edgeColor,
      transparent: opacity < 1,
      opacity,
    })
  );
  mesh.add(edges);
}

function createPerimeterOutlineGroup(
  loopPts: THREE.Vector3[],
  elevationY: number,
  beamColor: number,
  edgeColor: number,
  beamThickness = 0.055,
  beamHeight = 0.06
): THREE.Group {
  const g = new THREE.Group();
  const beamMat = new THREE.MeshBasicMaterial({ color: beamColor });
  const nodeMat = new THREE.MeshBasicMaterial({ color: edgeColor });

  for (let i = 0; i < loopPts.length; i++) {
    const a = loopPts[i];
    const b = loopPts[(i + 1) % loopPts.length];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.02) continue;

    const beamGeo = new THREE.BoxGeometry(len, beamHeight, beamThickness);
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set((a.x + b.x) * 0.5, elevationY + beamHeight * 0.5 + 0.01, (a.z + b.z) * 0.5);
    beam.rotation.y = -Math.atan2(dz, dx);
    addMeshEdgeOutline(beam, edgeColor, 0.9);
    g.add(beam);

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(beamThickness * 0.85, beamThickness * 0.85, beamHeight * 1.4, 12),
      nodeMat
    );
    post.position.set(a.x, elevationY + beamHeight * 0.7 + 0.01, a.z);
    g.add(post);
  }
  return g;
}

function createExtrudedSlabMesh(
  pointsXZ: [number, number, number][],
  thickness: number,
  elevationY: number,
  color: number,
  voidCutouts: [number, number, number][][] = [],
  opacity = 1,
  edgeColor = 0xf1f5f9,
  edgeOpacity = 0.8,
  texture: THREE.CanvasTexture | null = null,
  outlineMode = false
): THREE.Mesh | null {
  const shape = makeSlabShape(pointsXZ);
  if (!shape) return null;

  voidCutouts.forEach((holePts) => {
    if (holePts && holePts.length >= 3) {
      const holePath = new THREE.Path();
      holePath.moveTo(holePts[0][0], -holePts[0][2]);
      for (let i = 1; i < holePts.length; i++) {
        holePath.lineTo(holePts[i][0], -holePts[i][2]);
      }
      holePath.closePath();
      shape.holes.push(holePath);
    }
  });

  const safeThickness = Math.max(0.04, thickness || 0.18);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: safeThickness,
    bevelEnabled: false,
    curveSegments: 12,
  });
  // Rotate so 2D (x, -z) maps to 3D (x, +y_extrude, +z)
  geo.rotateX(-Math.PI / 2);
  scaleGeometryUVs(geo, 1.8);

  const mat = new THREE.MeshStandardMaterial({
    color: outlineMode ? color : texture ? 0xffffff : color,
    map: outlineMode ? null : texture,
    roughness: 0.72,
    metalness: 0.08,
    transparent: outlineMode || opacity < 1,
    opacity: outlineMode ? Math.min(opacity, 0.16) : opacity,
    depthWrite: outlineMode ? false : opacity >= 0.99,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = elevationY;
  mesh.receiveShadow = !outlineMode;
  mesh.castShadow = !outlineMode;

  addMeshEdgeOutline(
    mesh,
    edgeColor,
    outlineMode ? 0.95 : opacity >= 0.4 ? edgeOpacity : Math.max(0.7, edgeOpacity)
  );
  return mesh;
}

function createStraightWallSpanMesh(
  a: THREE.Vector3,
  b: THREE.Vector3,
  spanHeight: number,
  thickness: number,
  baseY: number,
  mat: THREE.Material,
  edgeColor = 0xf1f5f9,
  edgeOpacity = 0.82,
  outlineMode = false,
  baseboardMat?: THREE.Material | null
): THREE.Mesh | null {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len = Math.hypot(dx, dz);
  if (len < 0.01 || spanHeight < 0.01) return null;

  const geo = new THREE.BoxGeometry(len, spanHeight, Math.max(0.04, thickness));
  scaleGeometryUVs(geo, 2.2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((a.x + b.x) * 0.5, baseY + spanHeight * 0.5, (a.z + b.z) * 0.5);
  mesh.rotation.y = -Math.atan2(dz, dx);
  mesh.castShadow = !outlineMode;
  mesh.receiveShadow = !outlineMode;

  if (!outlineMode && baseboardMat && spanHeight >= 0.8) {
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(len + 0.01, 0.11, Math.max(0.05, thickness + 0.025)),
      baseboardMat
    );
    trim.position.y = -spanHeight * 0.5 + 0.055;
    mesh.add(trim);
  }

  addMeshEdgeOutline(mesh, edgeColor, outlineMode ? 0.96 : edgeOpacity);
  return mesh;
}

function buildWallWithOpenings(
  start: THREE.Vector3,
  end: THREE.Vector3,
  wallHeight: number,
  thickness: number,
  elevationY: number,
  openings: WallOpeningSpec[],
  wallMat: THREE.Material,
  glassMat: THREE.Material,
  frameMat: THREE.Material,
  edgeColor: number,
  edgeOpacity: number
): THREE.Group {
  const group = new THREE.Group();
  const dir = end.clone().sub(start);
  const totalLen = Math.hypot(dir.x, dir.z);
  if (totalLen < 0.02) return group;

  const unit = new THREE.Vector3(dir.x / totalLen, 0, dir.z / totalLen);
  const sorted = [...openings]
    .filter((o) => o.width > 0.05 && o.height > 0.05)
    .sort((x, y) => x.offsetAlongWall - y.offsetAlongWall);

  let cursor = 0;

  sorted.forEach((op) => {
    const opStart = Math.max(cursor, Math.min(totalLen - 0.05, op.offsetAlongWall));
    const opEnd = Math.min(totalLen, opStart + op.width);
    if (opEnd <= opStart) return;

    // Solid span before opening
    if (opStart - cursor > 0.02) {
      const pA = start.clone().addScaledVector(unit, cursor);
      const pB = start.clone().addScaledVector(unit, opStart);
      const solid = createStraightWallSpanMesh(
        pA,
        pB,
        wallHeight,
        thickness,
        elevationY,
        wallMat,
        edgeColor,
        edgeOpacity
      );
      if (solid) group.add(solid);
    }

    const pOpA = start.clone().addScaledVector(unit, opStart);
    const pOpB = start.clone().addScaledVector(unit, opEnd);
    const sill = Math.max(0, Math.min(wallHeight - 0.1, op.sillHeight || 0));
    const opTop = Math.min(wallHeight, sill + op.height);

    // Sill wall below window opening
    if (sill > 0.02) {
      const under = createStraightWallSpanMesh(
        pOpA,
        pOpB,
        sill,
        thickness,
        elevationY,
        wallMat,
        edgeColor,
        edgeOpacity
      );
      if (under) group.add(under);
    }

    // Lintel / header wall above opening
    const lintelHeight = wallHeight - opTop;
    if (lintelHeight > 0.02) {
      const lintel = createStraightWallSpanMesh(
        pOpA,
        pOpB,
        lintelHeight,
        thickness,
        elevationY + opTop,
        wallMat,
        edgeColor,
        edgeOpacity
      );
      if (lintel) group.add(lintel);
    }

    // Opening frame / glass indicator
    const actualOpHeight = opTop - sill;
    if (actualOpHeight > 0.05 && (op.hasFrame !== false)) {
      const frameThickness = Math.max(thickness * 1.15, 0.08);
      const leftJamb = createStraightWallSpanMesh(
        pOpA,
        pOpA.clone().addScaledVector(unit, 0.05),
        actualOpHeight,
        frameThickness,
        elevationY + sill,
        frameMat,
        edgeColor,
        edgeOpacity
      );
      const rightJamb = createStraightWallSpanMesh(
        pOpB.clone().addScaledVector(unit, -0.05),
        pOpB,
        actualOpHeight,
        frameThickness,
        elevationY + sill,
        frameMat,
        edgeColor,
        edgeOpacity
      );
      if (leftJamb) group.add(leftJamb);
      if (rightJamb) group.add(rightJamb);

      if (op.hasGlass || op.kind === SpatialOpeningKind.Window) {
        const pane = createStraightWallSpanMesh(
          pOpA.clone().addScaledVector(unit, 0.05),
          pOpB.clone().addScaledVector(unit, -0.05),
          actualOpHeight,
          0.025,
          elevationY + sill,
          glassMat,
          edgeColor,
          0.65
        );
        if (pane) group.add(pane);
      }
    }

    cursor = opEnd;
  });

  // Trailing solid span
  if (totalLen - cursor > 0.02) {
    const pA = start.clone().addScaledVector(unit, cursor);
    const solid = createStraightWallSpanMesh(
      pA,
      end,
      wallHeight,
      thickness,
      elevationY,
      wallMat,
      edgeColor,
      edgeOpacity
    );
    if (solid) group.add(solid);
  }

  return group;
}

export function buildGeometryObject(
  geom: SpatialGeometryDto,
  floorMap: Map<number, SpatialFloorDto>,
  allFloorVoids: Map<number, [number, number, number][][]>,
  palette: SpatialThemePalette,
  selectedId?: string | null,
  extraOpenings: SpatialOpeningDto[] = [],
  isSoftwareGl = false,
  renderMode: ViewportRenderMode = 'realistic',
  roomNameLookup?: Map<number, string>
): THREE.Object3D | null {
  const isLightTheme = palette.background === 0xeff3f8;
  const themeKey: 'light' | 'dark' = isLightTheme ? 'light' : 'dark';
  const isOutlineMode = renderMode === 'outline';

  const parsed = safeParseJson<any>(geom.geometryJson);
  const extractedPts = extractGeometryPoints3D(geom, floorMap);
  const floorElevation =
    (parsed?.elevationY !== undefined ? Number(parsed.elevationY) : undefined) ??
    (geom.floorId ? floorMap.get(geom.floorId)?.elevation : undefined) ??
    (extractedPts[0]?.[1] ?? 0);

  const isSelected = selectedId === `geometry-${geom.id}`;
  const group = new THREE.Group();
  group.name = `geometry-${geom.id}`;
  group.userData = {
    entityType: 'geometry',
    selectKey: `geometry-${geom.id}`,
    data: geom,
    floorId: geom.floorId ?? null,
    version: geom.version ?? 1,
  };

  const edgeCol = isSelected ? palette.selectionAccent : palette.objectEdge;
  const edgeOp = isSelected ? 1 : isOutlineMode ? 0.96 : palette.objectEdgeOpacity;

  // 1. Room Outline (floor perimeter collar + upper ceiling perimeter frame + vertical corner posts + room label)
  if (geom.kind === SpatialGeometryKind.RoomOutline) {
    const pts: [number, number, number][] = extractedPts;
    if (pts.length < 2) return null;
    const sampled = buildSampledPolygonPoints(pts, parsed?.segments);
    const outlineCol = isSelected ? palette.selectionAccent : palette.outlineBeam;
    const wallH = Math.max(2.2, geom.height || 2.8);

    // Floor-level 3D perimeter outline collar
    const beamGroup = createPerimeterOutlineGroup(
      sampled,
      floorElevation,
      outlineCol,
      edgeCol,
      isOutlineMode ? 0.08 : 0.055,
      isOutlineMode ? 0.08 : 0.05
    );
    group.add(beamGroup);

    // Upper ceiling-level wireframe outline + vertical corner posts so outline stays visible even above solid walls
    const roofLoopPts = sampled.map((v) => new THREE.Vector3(v.x, floorElevation + wallH + 0.03, v.z));
    if (roofLoopPts.length >= 2) {
      roofLoopPts.push(roofLoopPts[0].clone());
      const topWire = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(roofLoopPts),
        new THREE.LineBasicMaterial({
          color: outlineCol,
          transparent: true,
          opacity: isOutlineMode || isSelected ? 0.98 : 0.65,
        })
      );
      group.add(topWire);
    }

    const postMat = new THREE.LineBasicMaterial({
      color: outlineCol,
      transparent: true,
      opacity: isOutlineMode || isSelected ? 0.85 : 0.4,
    });
    pts.forEach((p) => {
      const postGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p[0], floorElevation + 0.02, p[2]),
        new THREE.Vector3(p[0], floorElevation + wallH + 0.03, p[2]),
      ]);
      group.add(new THREE.Line(postGeo, postMat));
    });

    // Subtle translucent outline footprint with crisp edge wireframe
    const xzPts: [number, number, number][] = sampled.map((v) => [v.x, floorElevation, v.z]);
    const footprint = createExtrudedSlabMesh(
      xzPts,
      0.015,
      floorElevation + 0.004,
      outlineCol,
      [],
      isSelected ? 0.34 : isOutlineMode ? 0.22 : 0.14,
      outlineCol,
      0.95,
      null,
      false
    );
    if (footprint) group.add(footprint);

    // Room nameplate & size Sprite
    const minX = Math.min(...pts.map((p) => p[0]));
    const maxX = Math.max(...pts.map((p) => p[0]));
    const minZ = Math.min(...pts.map((p) => p[2]));
    const maxZ = Math.max(...pts.map((p) => p[2]));
    const spanW = maxX - minX;
    const spanD = maxZ - minZ;
    const resolvedRoomId =
      geom.roomId ??
      (parsed?.roomId ? Number(parsed.roomId) : undefined) ??
      undefined;
    const baseLabel =
      (resolvedRoomId && roomNameLookup?.get(resolvedRoomId)) ||
      (geom.name || 'Room').replace(/\s*Outline$/i, '');
    const badge = createTextSprite(
      `${baseLabel} · ${spanW.toFixed(1)}×${spanD.toFixed(1)}m`,
      palette,
      isSelected ? '#f59e0b' : undefined,
      Math.min(4.2, Math.max(2.1, Math.min(spanW, spanD) * 0.55))
    );
    if (badge) {
      badge.position.set((minX + maxX) * 0.5, floorElevation + wallH + 0.55, (minZ + maxZ) * 0.5);
      group.add(badge);
    }

    return group;
  }

  // 2. Wall, WallSegment, GlassPanel
  if (
    geom.kind === SpatialGeometryKind.Wall ||
    geom.kind === SpatialGeometryKind.WallSegment ||
    geom.kind === SpatialGeometryKind.GlassPanel
  ) {
    const wallPayload = (parsed || {}) as Partial<WallGeometryPayload>;
    const pts = extractedPts;
    if (pts.length < 2) return null;

    const style =
      geom.kind === SpatialGeometryKind.GlassPanel
        ? 'glassPanel'
        : wallPayload.style || 'solid';

    const baseHeight = Math.max(0.1, geom.height || 2.8);
    const effectiveHeight =
      style === 'partial' ? Math.min(baseHeight, 1.2) : style === 'railing' ? 1.05 : baseHeight;
    const thickness = Math.max(0.03, geom.thickness || 0.16);
    const curveType = wallPayload.curveType || 'line';
    const resolvedMaterial =
      (geom.materialCode as WallGeometryPayload['material']) ||
      wallPayload.material ||
      'concrete';

    const texKind: ProceduralTextureKind | null =
      resolvedMaterial === 'brick'
        ? 'brick'
        : resolvedMaterial === 'wood'
        ? 'wood'
        : resolvedMaterial === 'drywall'
        ? 'drywall'
        : resolvedMaterial === 'concrete'
        ? 'concrete'
        : null;
    const wallTex = !isOutlineMode && texKind ? getProceduralTexture(texKind, themeKey) : null;

    const wallColor = getWallColor(resolvedMaterial, palette);
    const wallMat = isOutlineMode
      ? new THREE.MeshStandardMaterial({
          color: isSelected ? palette.selectionAccent : palette.outlineBeam,
          transparent: true,
          opacity: isSelected ? 0.34 : 0.16,
          depthWrite: false,
          roughness: 0.5,
        })
      : new THREE.MeshStandardMaterial({
          color: isSelected ? palette.selectionAccent : wallTex ? 0xffffff : wallColor,
          map: wallTex,
          roughness: resolvedMaterial === 'metal' ? 0.35 : resolvedMaterial === 'drywall' ? 0.85 : 0.72,
          metalness: resolvedMaterial === 'metal' ? 0.65 : 0.06,
        });

    const baseboardMat =
      !isOutlineMode && style !== 'glassPanel'
        ? new THREE.MeshStandardMaterial({
            color: isLightTheme ? 0x334155 : 0x1e293b,
            roughness: 0.45,
            metalness: 0.15,
          })
        : null;

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: palette.glassTint,
      roughness: 0.08,
      metalness: 0,
      transmission: isSoftwareGl || isOutlineMode ? 0 : 0.72,
      transparent: true,
      opacity: isOutlineMode ? 0.22 : isSoftwareGl ? 0.36 : 0.48,
      ior: 1.5,
      depthWrite: false,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: palette.wallMetal,
      roughness: 0.4,
      metalness: 0.55,
      transparent: isOutlineMode,
      opacity: isOutlineMode ? 0.45 : 1,
    });

    group.userData.isWall = true;
    group.userData.wallMeta = extractWallMeta(geom, floorMap, extraOpenings);

    if (style === 'openBoundary') {
      const sampled = sampleSegmentPoints(
        pts[0],
        pts[pts.length - 1],
        curveType,
        wallPayload.arcBulge ?? 0,
        wallPayload.control1,
        wallPayload.control2,
        14
      );
      const linePts = sampled.map((p) => new THREE.Vector3(p.x, floorElevation + 0.05, p.z));
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
      const lineMat = new THREE.LineDashedMaterial({
        color: isSelected ? 0xf59e0b : palette.voidLine,
        dashSize: 0.3,
        gapSize: 0.18,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      group.add(line);
      return group;
    }

    if (style === 'railing') {
      const sampled = sampleSegmentPoints(
        pts[0],
        pts[pts.length - 1],
        curveType,
        wallPayload.arcBulge ?? 0,
        wallPayload.control1,
        wallPayload.control2,
        16
      );
      for (let i = 0; i < sampled.length - 1; i++) {
        const railBar = createStraightWallSpanMesh(
          sampled[i],
          sampled[i + 1],
          0.06,
          0.06,
          floorElevation + effectiveHeight - 0.06,
          frameMat,
          edgeCol,
          edgeOp,
          isOutlineMode
        );
        if (railBar) group.add(railBar);
        const glassInfill = createStraightWallSpanMesh(
          sampled[i],
          sampled[i + 1],
          effectiveHeight - 0.12,
          0.02,
          floorElevation + 0.04,
          glassMat,
          edgeCol,
          0.75,
          isOutlineMode
        );
        if (glassInfill) group.add(glassInfill);
      }
      [sampled[0], sampled[Math.floor(sampled.length / 2)], sampled[sampled.length - 1]].forEach((pt) => {
        const postGeo = new THREE.CylinderGeometry(0.03, 0.03, effectiveHeight, 10);
        const post = new THREE.Mesh(postGeo, frameMat);
        post.position.set(pt.x, floorElevation + effectiveHeight * 0.5, pt.z);
        addMeshEdgeOutline(post, edgeCol, edgeOp);
        group.add(post);
      });
      return group;
    }

    const activeMat = style === 'glassPanel' ? glassMat : wallMat;
    const wallOpenings: WallOpeningSpec[] = [
      ...(wallPayload.openings || []),
      ...extraOpenings
        .filter((o) => o.hostGeometryId === geom.id)
        .map((o) => ({
          id: `db-op-${o.id}`,
          kind: o.kind,
          offsetAlongWall: o.offset,
          sillHeight: o.sillHeight,
          width: o.width,
          height: o.height,
          hasFrame: true,
          hasGlass: o.kind === SpatialOpeningKind.Window,
        })),
    ];

    if (curveType === 'line' && pts.length === 2 && style !== 'glassPanel') {
      const a = new THREE.Vector3(pts[0][0], 0, pts[0][2]);
      const b = new THREE.Vector3(pts[1][0], 0, pts[1][2]);
      const segLen = Math.hypot(b.x - a.x, b.z - a.z);
      if (wallOpenings.length > 0) {
        const wallOpeningsGroup = buildWallWithOpenings(
          a,
          b,
          effectiveHeight,
          thickness,
          floorElevation,
          wallOpenings,
          activeMat,
          glassMat,
          frameMat,
          edgeCol,
          edgeOp
        );
        group.add(wallOpeningsGroup);
      } else {
        const solid = createStraightWallSpanMesh(
          a,
          b,
          effectiveHeight,
          thickness,
          floorElevation,
          activeMat,
          edgeCol,
          edgeOp,
          isOutlineMode,
          baseboardMat
        );
        if (solid) group.add(solid);
      }

      if (isOutlineMode && segLen >= 1.2) {
        const lenTag = createTextSprite(
          `${segLen.toFixed(1)}m`,
          palette,
          isSelected ? '#f59e0b' : undefined,
          1.35
        );
        if (lenTag) {
          lenTag.position.set((a.x + b.x) * 0.5, floorElevation + effectiveHeight + 0.35, (a.z + b.z) * 0.5);
          group.add(lenTag);
        }
      }
    } else {
      for (let i = 0; i < pts.length - 1; i++) {
        const sampled = sampleSegmentPoints(
          pts[i],
          pts[i + 1],
          curveType,
          wallPayload.arcBulge ?? 0,
          wallPayload.control1,
          wallPayload.control2,
          16
        );
        for (let k = 0; k < sampled.length - 1; k++) {
          const seg = createStraightWallSpanMesh(
            sampled[k],
            sampled[k + 1],
            effectiveHeight,
            thickness,
            floorElevation,
            activeMat,
            edgeCol,
            edgeOp,
            isOutlineMode,
            baseboardMat
          );
          if (seg) group.add(seg);
        }
      }
    }
    return group;
  }

  // 3. Slab & Void
  if (geom.kind === SpatialGeometryKind.Slab) {
    const slabPayload = (parsed || {}) as Partial<SlabGeometryPayload>;
    const pts = extractedPts;
    if (pts.length < 3) return null;

    const isCeiling = slabPayload.role === 'ceiling';
    const isDeck = slabPayload.role === 'deck';
    const defaultY = isCeiling
      ? floorElevation + (geom.floorId ? floorMap.get(geom.floorId)?.defaultCeilingHeight ?? 2.7 : 2.7)
      : floorElevation;
    const elevY = slabPayload.elevationY !== undefined ? slabPayload.elevationY : defaultY;
    const cutouts: [number, number, number][][] = [
      ...(slabPayload.voidCutouts || []),
      ...(geom.floorId ? allFloorVoids.get(geom.floorId) || [] : []),
    ];
    const color = isSelected
      ? palette.selectionAccent
      : isCeiling
      ? palette.ceilingColor
      : isDeck
      ? palette.poolDeck
      : palette.slabColor;

    const slabTex =
      !isOutlineMode && !isCeiling
        ? getProceduralTexture(isDeck ? 'wood' : 'tile', themeKey)
        : null;

    const slabMesh = createExtrudedSlabMesh(
      pts,
      Math.max(0.05, geom.thickness || 0.2),
      elevY - Math.max(0.05, geom.thickness || 0.2),
      color,
      cutouts,
      isCeiling ? 0.55 : 0.96,
      edgeCol,
      edgeOp,
      slabTex,
      isOutlineMode
    );
    if (slabMesh) group.add(slabMesh);
    return group;
  }

  if (geom.kind === SpatialGeometryKind.Void) {
    const pts: [number, number, number][] = extractedPts;
    if (pts.length < 3) return null;
    const voidCol = isSelected ? palette.selectionAccent : palette.voidLine;
    const voidBeams = createPerimeterOutlineGroup(
      pts.map((p) => new THREE.Vector3(p[0], floorElevation, p[2])),
      floorElevation,
      voidCol,
      edgeCol,
      0.045,
      0.05
    );
    group.add(voidBeams);
    return group;
  }

  // 4. RoofSurface
  if (geom.kind === SpatialGeometryKind.RoofSurface) {
    const roofPayload = (parsed || {}) as Partial<RoofGeometryPayload>;
    const pts = extractedPts;
    if (pts.length < 3) return null;

    const overhang = Math.max(0, roofPayload.overhang ?? 0.4);
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cz = pts.reduce((s, p) => s + p[2], 0) / pts.length;
    const expanded: [number, number, number][] = pts.map((p) => {
      const dx = p[0] - cx;
      const dz = p[2] - cz;
      const dist = Math.hypot(dx, dz) || 1;
      return [p[0] + (dx / dist) * overhang, p[1], p[2] + (dz / dist) * overhang];
    });

    const elevY = roofPayload.elevationY ?? floorElevation + 3.0;
    const thickness = Math.max(0.08, geom.thickness || 0.18);
    const baseRoof = createExtrudedSlabMesh(
      expanded,
      thickness,
      elevY,
      isSelected ? palette.selectionAccent : palette.roofColor,
      [],
      0.95,
      edgeCol,
      edgeOp
    );
    if (baseRoof) {
      if (roofPayload.roofStyle === 'slantedEdges' || roofPayload.roofStyle === 'pitched') {
        const angle = THREE.MathUtils.degToRad(roofPayload.slopeDeg ?? 12);
        baseRoof.rotation.z = angle * 0.45;
      }
      group.add(baseRoof);
    }

    // Optional Parapet walls around perimeter
    const parapetH = roofPayload.parapetHeight ?? 0;
    if (parapetH > 0.05) {
      const parapetT = roofPayload.parapetThickness ?? 0.15;
      const pMat = new THREE.MeshStandardMaterial({
        color: palette.parapetColor,
        roughness: 0.75,
        metalness: 0.1,
      });
      for (let i = 0; i < expanded.length; i++) {
        const a = expanded[i];
        const b = expanded[(i + 1) % expanded.length];
        const seg = createStraightWallSpanMesh(
          new THREE.Vector3(a[0], 0, a[2]),
          new THREE.Vector3(b[0], 0, b[2]),
          parapetH,
          parapetT,
          elevY + thickness,
          pMat,
          edgeCol,
          edgeOp
        );
        if (seg) group.add(seg);
      }
    }
    return group;
  }

  // 5. StairFlight & StairLanding
  if (
    geom.kind === SpatialGeometryKind.StairFlight ||
    geom.kind === SpatialGeometryKind.StairLanding
  ) {
    const stairPayload = (parsed || {}) as Partial<StairGeometryPayload>;
    const origin = stairPayload.origin || [0, floorElevation, 0];
    const width = Math.max(0.6, stairPayload.width || 1.1);
    const runLen = Math.max(0.6, stairPayload.runLength || 2.8);
    const riseH = Math.max(0.1, stairPayload.riseHeight || geom.height || 1.5);
    const rotY = THREE.MathUtils.degToRad(stairPayload.rotationYDeg || 0);

    const stairMat = new THREE.MeshStandardMaterial({
      color: isSelected ? palette.selectionAccent : palette.stairColor,
      roughness: 0.65,
      metalness: 0.15,
    });
    const railMat = new THREE.MeshStandardMaterial({
      color: palette.wallMetal,
      roughness: 0.35,
      metalness: 0.6,
    });

    const localGroup = new THREE.Group();
    localGroup.position.set(origin[0], origin[1], origin[2]);
    localGroup.rotation.y = rotY;

    if (geom.kind === SpatialGeometryKind.StairLanding) {
      const slabGeo = new THREE.BoxGeometry(width, Math.max(0.12, geom.thickness || 0.18), runLen);
      const landing = new THREE.Mesh(slabGeo, stairMat);
      landing.position.set(0, -0.09, runLen * 0.5);
      landing.castShadow = true;
      landing.receiveShadow = true;
      localGroup.add(landing);
    } else {
      const steps = Math.max(3, stairPayload.stepCount || Math.round(riseH / 0.18));
      const stepRun = runLen / steps;
      const stepRise = riseH / steps;
      for (let i = 0; i < steps; i++) {
        const sGeo = new THREE.BoxGeometry(width, stepRise, stepRun * 1.04);
        const step = new THREE.Mesh(sGeo, stairMat);
        step.position.set(0, (i + 0.5) * stepRise, (i + 0.5) * stepRun);
        step.castShadow = true;
        step.receiveShadow = true;
        localGroup.add(step);
      }
      // Side stringer rails
      const diagLen = Math.hypot(runLen, riseH);
      const pitch = Math.atan2(riseH, runLen);
      [-width * 0.48, width * 0.48].forEach((xOff) => {
        const railGeo = new THREE.BoxGeometry(0.04, 0.05, diagLen);
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(xOff, riseH * 0.5 + 0.9, runLen * 0.5);
        rail.rotation.x = -pitch;
        localGroup.add(rail);
      });
    }

    group.add(localGroup);
    return group;
  }

  // 6. Indoor Swimming Pool
  if (geom.kind === SpatialGeometryKind.Pool) {
    const pool = (parsed || {}) as Partial<PoolGeometryPayload>;
    const origin = pool.origin || [0, floorElevation, 0];
    const length = Math.max(1.5, pool.length || 6);
    const width = Math.max(1.2, pool.width || 3.5);
    const depth = Math.max(0.4, pool.depth || 1.4);
    const deckMargin = pool.deckMargin ?? 0.6;
    const waterOffset = pool.waterLevelOffset ?? 0.14;

    const poolGroup = new THREE.Group();
    poolGroup.position.set(origin[0], origin[1], origin[2]);

    const deckMat = new THREE.MeshStandardMaterial({
      color: isSelected ? palette.selectionAccent : palette.poolDeck,
      roughness: 0.65,
      metalness: 0.05,
    });
    const basinMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.4,
      metalness: 0.05,
    });
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: palette.waterTint,
      roughness: 0.06,
      metalness: 0.02,
      transmission: 0.7,
      transparent: true,
      opacity: 0.72,
      ior: 1.333,
    });

    // Deck surround (4 border strips)
    const outerW = width + deckMargin * 2;
    const outerL = length + deckMargin * 2;
    const topStrip = new THREE.Mesh(new THREE.BoxGeometry(outerW, 0.08, deckMargin), deckMat);
    topStrip.position.set(0, 0.04, -(length + deckMargin) * 0.5);
    const botStrip = new THREE.Mesh(new THREE.BoxGeometry(outerW, 0.08, deckMargin), deckMat);
    botStrip.position.set(0, 0.04, (length + deckMargin) * 0.5);
    const leftStrip = new THREE.Mesh(new THREE.BoxGeometry(deckMargin, 0.08, length), deckMat);
    leftStrip.position.set(-(width + deckMargin) * 0.5, 0.04, 0);
    const rightStrip = new THREE.Mesh(new THREE.BoxGeometry(deckMargin, 0.08, length), deckMat);
    rightStrip.position.set((width + deckMargin) * 0.5, 0.04, 0);
    poolGroup.add(topStrip, botStrip, leftStrip, rightStrip);

    // Basin bottom + 4 basin walls
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, length), basinMat);
    bottom.position.set(0, -depth + 0.04, 0);
    const wNorth = new THREE.Mesh(new THREE.BoxGeometry(width, depth, 0.08), basinMat);
    wNorth.position.set(0, -depth * 0.5, -length * 0.5);
    const wSouth = new THREE.Mesh(new THREE.BoxGeometry(width, depth, 0.08), basinMat);
    wSouth.position.set(0, -depth * 0.5, length * 0.5);
    const wWest = new THREE.Mesh(new THREE.BoxGeometry(0.08, depth, length), basinMat);
    wWest.position.set(-width * 0.5, -depth * 0.5, 0);
    const wEast = new THREE.Mesh(new THREE.BoxGeometry(0.08, depth, length), basinMat);
    wEast.position.set(width * 0.5, -depth * 0.5, 0);
    poolGroup.add(bottom, wNorth, wSouth, wWest, wEast);

    // Water surface volume
    const waterH = Math.max(0.15, depth - waterOffset);
    const water = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, waterH, length - 0.1), waterMat);
    water.position.set(0, -depth + waterH * 0.5 + 0.04, 0);
    poolGroup.add(water);

    group.add(poolGroup);
    return group;
  }

  // 7. Boundary (Exterior Area) & Scaffold Structure (Generic / Structure)
  if (geom.kind === SpatialGeometryKind.Boundary || geom.kind === SpatialGeometryKind.Generic) {
    const payload = (parsed || {}) as Partial<ExteriorOrStructurePayload>;
    if (payload.type === 'scaffoldStructure' || payload.nodeKind === SpatialNodeKind.Structure) {
      const origin = payload.origin || [0, floorElevation, 0];
      const w = Math.max(0.6, payload.width || 2.0);
      const d = Math.max(0.6, payload.depth || 2.0);
      const h = Math.max(0.6, payload.height || geom.height || 2.4);
      const steelMat = new THREE.MeshStandardMaterial({
        color: isSelected ? palette.selectionAccent : palette.scaffoldSteel,
        roughness: 0.35,
        metalness: 0.72,
      });

      const scaff = new THREE.Group();
      scaff.position.set(origin[0], origin[1], origin[2]);

      const postRadius = 0.045;
      const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, h, 10);
      [
        [-w * 0.5, -d * 0.5],
        [w * 0.5, -d * 0.5],
        [-w * 0.5, d * 0.5],
        [w * 0.5, d * 0.5],
      ].forEach(([px, pz]) => {
        const leg = new THREE.Mesh(postGeo, steelMat);
        leg.position.set(px, h * 0.5, pz);
        leg.castShadow = true;
        scaff.add(leg);
      });

      // Top tank deck plate
      const deck = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.07, d + 0.12), steelMat);
      deck.position.set(0, h, 0);
      deck.castShadow = true;
      deck.receiveShadow = true;
      scaff.add(deck);

      // Mid perimeter rails
      const midY = h * 0.52;
      const railXGeo = new THREE.BoxGeometry(w, 0.04, 0.04);
      const railZGeo = new THREE.BoxGeometry(0.04, 0.04, d);
      [-d * 0.5, d * 0.5].forEach((z) => {
        const r = new THREE.Mesh(railXGeo, steelMat);
        r.position.set(0, midY, z);
        scaff.add(r);
      });
      [-w * 0.5, w * 0.5].forEach((x) => {
        const r = new THREE.Mesh(railZGeo, steelMat);
        r.position.set(x, midY, 0);
        scaff.add(r);
      });

      group.add(scaff);
      return group;
    }

    // Exterior Boundary Zone (Garden / Driveway / Patio)
    const pts = extractedPts;
    if (pts.length >= 3) {
      const isGarden = payload.zoneKind === 'garden';
      const zoneColor = isGarden ? palette.exteriorGarden : palette.exteriorDriveway;
      const zoneTex = !isOutlineMode
        ? getProceduralTexture(isGarden ? 'grass' : 'concrete', themeKey)
        : null;
      const pad = createExtrudedSlabMesh(
        pts,
        0.06,
        floorElevation,
        zoneColor,
        [],
        isOutlineMode ? 0.2 : 0.94,
        edgeCol,
        edgeOp,
        zoneTex,
        isOutlineMode
      );
      if (pad) group.add(pad);
      const curbColor = isSelected
        ? palette.selectionAccent
        : isOutlineMode
        ? zoneColor
        : isLightTheme
        ? 0x64748b
        : 0x475569;
      const borderBeams = createPerimeterOutlineGroup(
        pts.map((p) => new THREE.Vector3(p[0], floorElevation, p[2])),
        floorElevation + 0.04,
        curbColor,
        edgeCol,
        0.06,
        isGarden ? 0.085 : 0.055
      );
      group.add(borderBeams);

      const minX = Math.min(...pts.map((p) => p[0]));
      const maxX = Math.max(...pts.map((p) => p[0]));
      const minZ = Math.min(...pts.map((p) => p[2]));
      const maxZ = Math.max(...pts.map((p) => p[2]));
      const zoneLabel = createTextSprite(
        `${geom.name || 'Exterior'} · ${(maxX - minX).toFixed(1)}×${(maxZ - minZ).toFixed(1)}m`,
        palette,
        isGarden ? '#22c55e' : undefined,
        2.3
      );
      if (zoneLabel) {
        zoneLabel.position.set((minX + maxX) * 0.5, floorElevation + 0.75, (minZ + maxZ) * 0.5);
        group.add(zoneLabel);
      }

      return group;
    }
    if (pts.length === 2) {
      const wallFallback = createStraightWallSpanMesh(
        new THREE.Vector3(pts[0][0], 0, pts[0][2]),
        new THREE.Vector3(pts[1][0], 0, pts[1][2]),
        Math.max(0.2, geom.height || 2.8),
        Math.max(0.05, geom.thickness || 0.18),
        floorElevation,
        new THREE.MeshStandardMaterial({
          color: palette.wallConcrete,
          roughness: 0.7,
          transparent: isOutlineMode,
          opacity: isOutlineMode ? 0.18 : 1,
          depthWrite: !isOutlineMode,
        }),
        edgeCol,
        edgeOp,
        isOutlineMode
      );
      if (wallFallback) group.add(wallFallback);
      return group;
    }
  }

  return null;
}

export function buildPlacementObject(
  placement: SpatialPlacementDto,
  device: Device | undefined,
  palette: SpatialThemePalette,
  selectedKey?: string | null,
  isSoftwareGl = false,
  renderMode: ViewportRenderMode = 'realistic'
): THREE.Group {
  const isOutlineMode = renderMode === 'outline';
  const group = new THREE.Group();
  const selectKey = `placement-${placement.id}`;
  const isSelected = selectedKey === selectKey;

  group.name = selectKey;
  group.position.set(placement.positionX, placement.positionY, placement.positionZ);
  group.quaternion.set(
    placement.rotationX,
    placement.rotationY,
    placement.rotationZ,
    placement.rotationW || 1
  );
  group.scale.set(
    placement.scaleX || 1,
    placement.scaleY || 1,
    placement.scaleZ || 1
  );

  group.userData = {
    entityType: 'placement',
    selectKey,
    data: placement,
    floorId:
      placement.parentKind === SpatialNodeKind.Floor ? placement.parentId : null,
    parentKind: placement.parentKind,
    parentId: placement.parentId,
    version: placement.version ?? 1,
  };

  const w = Math.max(0.14, placement.width || 0.35);
  const h = Math.max(0.14, placement.height || 0.35);
  const d = Math.max(0.08, placement.depth || 0.25);

  const fixtureMeta = safeParseJson<LightFixtureGroupMeta>(placement.anchorJson);
  const isOn =
    device?.status === 'on' ||
    device?.status === 'active' ||
    device?.status === 'open' ||
    device?.status === 'triggered';

  const bodyColorMap: Record<SpatialTargetKind, number> = {
    [SpatialTargetKind.Door]: device?.status === 'locked' ? 0x10b981 : 0xd97706,
    [SpatialTargetKind.Window]: 0x38bdf8,
    [SpatialTargetKind.Light]: isOn ? 0xfef08a : 0x64748b,
    [SpatialTargetKind.Camera]: 0x8b5cf6,
    [SpatialTargetKind.Appliance]: isOn ? 0x3b82f6 : 0x64748b,
    [SpatialTargetKind.External]: device?.status === 'triggered' ? 0xef4444 : 0x06b6d4,
    [SpatialTargetKind.Utility]:
      device?.utilityType === UtilityType.Emergency ? 0xef4444 : 0x14b8a6,
  };

  const accentColor = isSelected
    ? palette.selectionAccent
    : bodyColorMap[placement.targetKind] ?? 0x94a3b8;

  if (placement.targetKind === SpatialTargetKind.Light) {
    const housingMat = new THREE.MeshStandardMaterial({
      color: palette.wallMetal,
      roughness: 0.28,
      metalness: 0.75,
    });
    const bulbMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: isOn ? new THREE.Color(0xfde047) : new THREE.Color(0x000000),
      emissiveIntensity: isOn ? 0.95 : 0,
      roughness: 0.18,
    });

    if (fixtureMeta?.mountingStyle === 'pendant') {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, h * 0.7, 8), housingMat);
      rod.position.y = h * 0.35;
      group.add(rod);
    }

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(w * 0.45, w * 0.5, Math.max(0.05, h * 0.3), 16),
      housingMat
    );
    base.castShadow = true;
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(w * 0.38, 0.018, 8, 18),
      housingMat
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.y = -Math.max(0.03, h * 0.14);
    const diffuser = new THREE.Mesh(
      new THREE.SphereGeometry(w * 0.36, 16, 12),
      bulbMat
    );
    diffuser.position.y = -Math.max(0.04, h * 0.22);
    group.add(base, collar, diffuser);

    if (!isOutlineMode) {
      const beamCone = new THREE.Mesh(
        new THREE.ConeGeometry(Math.max(0.6, w * 2.2), 1.4, 16, 1, true),
        new THREE.MeshBasicMaterial({
          color: isOn ? 0xfef08a : 0xfde68a,
          transparent: true,
          opacity: isOn ? 0.18 : 0.07,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      beamCone.position.y = -0.82;
      group.add(beamCone);
    }
  } else if (placement.targetKind === SpatialTargetKind.Camera) {
    const camMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.35,
      metalness: 0.5,
    });
    const mountMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.45,
      metalness: 0.7,
    });
    const lensMat = new THREE.MeshStandardMaterial({
      color: isSelected ? palette.selectionAccent : 0x0f172a,
      emissive: isOn ? new THREE.Color(0x8b5cf6) : new THREE.Color(0x000000),
      emissiveIntensity: isOn ? 0.65 : 0,
      roughness: 0.12,
      metalness: 0.85,
    });
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(w * 0.35, h * 0.35, d * 0.55), mountMat);
    bracket.position.set(0, 0, -d * 0.45);
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.62, d), camMat);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.24, w * 0.27, d * 0.38, 16), lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = d * 0.55;
    body.castShadow = true;
    group.add(bracket, body, lens);
  } else if (placement.targetKind === SpatialTargetKind.Door) {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.45,
      metalness: 0.55,
    });
    const leafMat = new THREE.MeshStandardMaterial({
      color: isSelected ? palette.selectionAccent : accentColor,
      roughness: 0.52,
      metalness: 0.15,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.85,
    });
    const postT = 0.06;
    const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(postT, h, d), frameMat);
    leftJamb.position.set(-w * 0.5 + postT * 0.5, 0, 0);
    const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(postT, h, d), frameMat);
    rightJamb.position.set(w * 0.5 - postT * 0.5, 0, 0);
    const header = new THREE.Mesh(new THREE.BoxGeometry(w, postT, d), frameMat);
    header.position.set(0, h * 0.5 - postT * 0.5, 0);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(w - postT * 2, h - postT, d * 0.45), leafMat);
    leaf.position.set(0, -postT * 0.5, 0);
    leaf.castShadow = true;
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), brassMat);
    handle.position.set(w * 0.34, -h * 0.04, d * 0.32);
    group.add(leftJamb, rightJamb, header, leaf, handle);
  } else if (placement.targetKind === SpatialTargetKind.Window) {
    const frameMat = new THREE.MeshStandardMaterial({
      color: isSelected ? palette.selectionAccent : 0x475569,
      roughness: 0.35,
      metalness: 0.65,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: accentColor,
      roughness: 0.08,
      metalness: 0,
      transmission: isSoftwareGl ? 0 : 0.72,
      transparent: true,
      opacity: isSoftwareGl ? 0.38 : 0.52,
      depthWrite: false,
    });
    const frameT = 0.055;
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(w, frameT, d), frameMat);
    topBar.position.y = h * 0.5 - frameT * 0.5;
    const botBar = new THREE.Mesh(new THREE.BoxGeometry(w, frameT * 1.2, d * 1.15), frameMat);
    botBar.position.y = -h * 0.5 + frameT * 0.5;
    const lBar = new THREE.Mesh(new THREE.BoxGeometry(frameT, h, d), frameMat);
    lBar.position.x = -w * 0.5 + frameT * 0.5;
    const rBar = new THREE.Mesh(new THREE.BoxGeometry(frameT, h, d), frameMat);
    rBar.position.x = w * 0.5 - frameT * 0.5;
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(frameT * 0.7, h - frameT, d * 0.7), frameMat);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(w - frameT * 1.5, h - frameT * 1.5, 0.025), glassMat);
    group.add(topBar, botBar, lBar, rBar, mullion, glass);
  } else if (placement.targetKind === SpatialTargetKind.Utility) {
    const comp = Number(device?.utilityComponent ?? 0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.38,
      metalness: 0.45,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.78,
    });

    if (comp === 3) {
      // Water Tank: base plinth + main tank drum + top cap + water gauge strip
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.52, w * 0.54, h * 0.1, 20), metalMat);
      plinth.position.y = -h * 0.45;
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.46, w * 0.48, h * 0.78, 22), bodyMat);
      drum.castShadow = true;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.16, w * 0.2, h * 0.1, 14), metalMat);
      cap.position.y = h * 0.44;
      const gauge = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, h * 0.62, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, emissive: 0x0284c7, emissiveIntensity: 0.35 })
      );
      gauge.position.set(0, 0, w * 0.47);
      group.add(plinth, drum, cap, gauge);
    } else if (comp === 6) {
      // Gas Cylinder: high-pressure cylinder + collar + regulator valve
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.38, w * 0.38, h * 0.74, 20), bodyMat);
      cyl.position.y = -h * 0.08;
      cyl.castShadow = true;
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(w * 0.38, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), bodyMat);
      shoulder.position.y = h * 0.29;
      const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, h * 0.16, 10), metalMat);
      valve.position.y = h * 0.42;
      group.add(cyl, shoulder, valve);
    } else if (comp === 2) {
      // Solar Panel: mounting frame + tilted photovoltaic cell surface
      const stand = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h * 0.25, d * 0.4), metalMat);
      stand.position.y = -h * 0.28;
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(w * 1.1, 0.06, d * 1.1),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.16, metalness: 0.8 })
      );
      panel.rotation.x = -0.35;
      panel.position.y = 0.05;
      panel.castShadow = true;
      group.add(stand, panel);
    } else {
      // Generator / Pump / AC / Heater / Emergency: cabinet + fan grille + manifold
      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.84, d), bodyMat);
      cabinet.position.y = -h * 0.06;
      cabinet.castShadow = true;
      cabinet.receiveShadow = true;
      const skid = new THREE.Mesh(new THREE.BoxGeometry(w * 1.06, h * 0.1, d * 1.06), metalMat);
      skid.position.y = -h * 0.46;
      const vent = new THREE.Mesh(new THREE.CylinderGeometry(Math.min(w, h) * 0.28, Math.min(w, h) * 0.28, 0.05, 16), metalMat);
      vent.rotation.x = Math.PI / 2;
      vent.position.set(0, h * 0.05, d * 0.51);
      group.add(cabinet, skid, vent);
    }
  } else {
    // Appliance & External
    const housingMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.42,
      metalness: 0.3,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.65,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.86, d), housingMat);
    body.castShadow = true;
    body.receiveShadow = true;
    const base = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.1, d * 0.96), trimMat);
    base.position.y = -h * 0.44;
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.35, 0.035, 0.03),
      new THREE.MeshStandardMaterial({
        color: isOn ? 0x22c55e : 0x64748b,
        emissive: isOn ? 0x22c55e : 0x000000,
        emissiveIntensity: isOn ? 0.8 : 0,
      })
    );
    led.position.set(0, h * 0.28, d * 0.51);
    group.add(body, base, led);
  }

  // Add theme-aware crisp edge outlines to every placement mesh so devices stand out in light & dark themes
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      addMeshEdgeOutline(
        child as THREE.Mesh,
        isSelected ? palette.selectionAccent : palette.objectEdge,
        isSelected ? 0.95 : 0.62
      );
    }
  });

  // Selection wireframe halo
  if (isSelected) {
    const haloGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w * 1.15, h * 1.15, d * 1.15));
    const halo = new THREE.LineSegments(
      haloGeo,
      new THREE.LineBasicMaterial({ color: palette.selectionAccent })
    );
    group.add(halo);
  }

  // Floating device badge so mounted lights/cameras/doors remain visible in both Realistic and Outline modes
  const kindFallbackName =
    SpatialTargetKind[placement.targetKind] || `Device #${placement.targetId}`;
  const badgeText = device?.name || `${kindFallbackName} #${placement.targetId}`;
  const devBadge = createTextSprite(
    badgeText,
    palette,
    isSelected ? '#f59e0b' : undefined,
    1.55
  );
  if (devBadge) {
    devBadge.position.set(0, h * 0.65 + 0.28, 0);
    group.add(devBadge);
  }

  return group;
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh || (obj as THREE.Line).isLine) {
      const renderable = obj as THREE.Mesh | THREE.Line;
      if (renderable.geometry) {
        renderable.geometry.dispose();
      }
      const mat = renderable.material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m?.dispose());
      } else if (mat) {
        mat.dispose();
      }
    } else if ((obj as THREE.Sprite).isSprite) {
      const spr = obj as THREE.Sprite;
      if (spr.material) {
        if (spr.material.map && !spr.material.map.userData?.sharedTexture) {
          spr.material.map.dispose();
        }
        spr.material.dispose();
      }
    }
  });
}
