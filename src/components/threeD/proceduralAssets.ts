import * as THREE from 'three';
import {
  Building3D,
  CylinderSupport3D,
  MaterialType,
  PlacedFacility3D,
  PlacedUtility3D,
  Pool3D,
  RoofConfig,
  Scaffold3D,
  SelectedItemRef,
  Staircase3D,
} from './types';

export interface ProceduralTexturePool {
  brick: THREE.CanvasTexture;
  wood: THREE.CanvasTexture;
  plaster: THREE.CanvasTexture;
  concrete: THREE.CanvasTexture;
  grass: THREE.CanvasTexture;
  water: THREE.CanvasTexture;
  metal: THREE.CanvasTexture;
  tile: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(size = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finishTexture(
  canvas: HTMLCanvasElement,
  repeatX: number,
  repeatY: number,
  anisotropy: number,
  isColor = true
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

export function createProceduralTexturePool(maxAnisotropy: number): ProceduralTexturePool {
  const aniso = Math.min(8, Math.max(1, maxAnisotropy));

  // 1. Brick (greyscale-friendly light base so material color tints naturally)
  const [brickC, brickCtx] = makeCanvas(256);
  brickCtx.fillStyle = '#c8c3bc'; // mortar
  brickCtx.fillRect(0, 0, 256, 256);
  const rows = 8;
  const cols = 4;
  const rowH = 256 / rows;
  const colW = 256 / cols;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (colW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const shade = 215 + ((r * 7 + c * 13) % 28);
      brickCtx.fillStyle = `rgb(${shade}, ${shade - 8}, ${shade - 14})`;
      brickCtx.fillRect(c * colW + offset + 3, r * rowH + 3, colW - 6, rowH - 6);
    }
  }
  const brick = finishTexture(brickC, 3, 2, aniso);

  // 2. Wood planks
  const [woodC, woodCtx] = makeCanvas(256);
  woodCtx.fillStyle = '#d4b48c';
  woodCtx.fillRect(0, 0, 256, 256);
  for (let p = 0; p < 8; p++) {
    const y = p * 32;
    const tone = (p % 3) * 8;
    woodCtx.fillStyle = `rgb(${210 - tone}, ${172 - tone}, ${126 - tone})`;
    woodCtx.fillRect(0, y, 256, 31);
    woodCtx.fillStyle = 'rgba(90, 56, 28, 0.14)';
    for (let g = 0; g < 6; g++) {
      woodCtx.fillRect(0, y + 4 + g * 4, 256, 1);
    }
    woodCtx.fillStyle = 'rgba(55, 34, 15, 0.35)';
    woodCtx.fillRect(0, y + 30, 256, 2);
  }
  const wood = finishTexture(woodC, 2, 2, aniso);

  // 3. Plaster subtle trowel noise
  const [plasterC, plasterCtx] = makeCanvas(256);
  plasterCtx.fillStyle = '#f5f5f4';
  plasterCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1600; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    plasterCtx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)';
    plasterCtx.fillRect(x, y, 4, 2);
  }
  const plaster = finishTexture(plasterC, 2, 2, aniso);

  // 4. Concrete architectural panels
  const [concC, concCtx] = makeCanvas(256);
  concCtx.fillStyle = '#d4d6d8';
  concCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1400; i++) {
    const x = (i * 97) % 256;
    const y = (i * 53) % 256;
    concCtx.fillStyle = i % 3 === 0 ? 'rgba(30,41,59,0.05)' : 'rgba(255,255,255,0.06)';
    concCtx.fillRect(x, y, 3, 3);
  }
  concCtx.strokeStyle = 'rgba(71,85,105,0.18)';
  concCtx.lineWidth = 2;
  concCtx.strokeRect(1, 1, 126, 126);
  concCtx.strokeRect(129, 129, 126, 126);
  const concrete = finishTexture(concC, 3, 3, aniso);

  // 5. Grass lawn blades
  const [grassC, grassCtx] = makeCanvas(256);
  grassCtx.fillStyle = '#4d8c40';
  grassCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const x = (i * 47) % 256;
    const y = (i * 89) % 256;
    grassCtx.fillStyle =
      i % 3 === 0 ? '#5fa34d' : i % 3 === 1 ? '#3e7833' : '#73b85a';
    grassCtx.fillRect(x, y, 2, 5);
  }
  const grass = finishTexture(grassC, 4, 4, aniso);

  // 6. Pool water caustics
  const [waterC, waterCtx] = makeCanvas(256);
  waterCtx.fillStyle = '#149ec9';
  waterCtx.fillRect(0, 0, 256, 256);
  waterCtx.strokeStyle = 'rgba(186, 244, 255, 0.36)';
  waterCtx.lineWidth = 2.5;
  for (let r = 0; r < 14; r++) {
    const cx = ((r * 61) % 216) + 20;
    const cy = ((r * 97) % 216) + 20;
    waterCtx.beginPath();
    waterCtx.ellipse(cx, cy, 24, 15, (r * 0.5) % Math.PI, 0, Math.PI * 2);
    waterCtx.stroke();
  }
  const water = finishTexture(waterC, 3, 3, aniso);

  // 7. Brushed Metal
  const [metalC, metalCtx] = makeCanvas(256);
  metalCtx.fillStyle = '#cbd5e1';
  metalCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    metalCtx.fillStyle = y % 4 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)';
    metalCtx.fillRect(0, y, 256, 1);
  }
  const metal = finishTexture(metalC, 2, 2, aniso);

  // 8. Ceramic/Stone Floor Tile
  const [tileC, tileCtx] = makeCanvas(256);
  tileCtx.fillStyle = '#e2e8f0';
  tileCtx.fillRect(0, 0, 256, 256);
  tileCtx.strokeStyle = 'rgba(100,116,139,0.22)';
  tileCtx.lineWidth = 2;
  for (let x = 0; x <= 256; x += 64) {
    tileCtx.beginPath();
    tileCtx.moveTo(x, 0);
    tileCtx.lineTo(x, 256);
    tileCtx.stroke();
  }
  for (let y = 0; y <= 256; y += 64) {
    tileCtx.beginPath();
    tileCtx.moveTo(0, y);
    tileCtx.lineTo(256, y);
    tileCtx.stroke();
  }
  const tile = finishTexture(tileC, 4, 4, aniso);

  return {
    brick,
    wood,
    plaster,
    concrete,
    grass,
    water,
    metal,
    tile,
    dispose: () => {
      brick.dispose();
      wood.dispose();
      plaster.dispose();
      concrete.dispose();
      grass.dispose();
      water.dispose();
      metal.dispose();
      tile.dispose();
    },
  };
}

export function createArchitecturalMaterial(
  type: MaterialType,
  color: string,
  texPool: ProceduralTexturePool,
  isSoftwareGl: boolean,
  options?: { opacity?: number; cutaway?: boolean; side?: THREE.Side }
): THREE.Material {
  const cutaway = options?.cutaway ?? false;
  if (type === 'glass') {
    if (isSoftwareGl) {
      return new THREE.MeshStandardMaterial({
        color: '#bae6fd',
        roughness: 0.12,
        metalness: 0.1,
        transparent: true,
        opacity: options?.opacity ?? 0.35,
        depthWrite: false,
        side: options?.side ?? THREE.DoubleSide,
      });
    }
    return new THREE.MeshPhysicalMaterial({
      color: '#d8f3ff',
      roughness: 0.08,
      metalness: 0.05,
      transmission: 0.82,
      ior: 1.5,
      thickness: 0.08,
      transparent: true,
      opacity: options?.opacity ?? 0.92,
      side: options?.side ?? THREE.DoubleSide,
    });
  }

  let map: THREE.Texture | null = texPool.plaster;
  let roughness = 0.82;
  let metalness = 0.04;

  switch (type) {
    case 'brick':
      map = texPool.brick;
      roughness = 0.88;
      metalness = 0.02;
      break;
    case 'concrete':
      map = texPool.concrete;
      roughness = 0.85;
      metalness = 0.05;
      break;
    case 'wood':
      map = texPool.wood;
      roughness = 0.65;
      metalness = 0.04;
      break;
    case 'metal':
      map = texPool.metal;
      roughness = 0.32;
      metalness = 0.78;
      break;
    default:
      map = texPool.plaster;
      roughness = 0.82;
      metalness = 0.02;
  }

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color || '#f4f1ea'),
    map,
    roughness,
    metalness,
    transparent: cutaway,
    opacity: cutaway ? 0.34 : 1,
    depthWrite: !cutaway,
    side: options?.side ?? THREE.FrontSide,
  });
}

export function tagGroupSelection(group: THREE.Object3D, itemRef: SelectedItemRef) {
  group.userData.itemRef = itemRef;
  group.traverse((child) => {
    child.userData.itemRef = itemRef;
  });
}

export function buildRailingRun(
  length: number,
  height: number,
  railingMaterial: MaterialType,
  texPool: ProceduralTexturePool,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({
    color: railingMaterial === 'wood' ? '#7c4d2b' : '#334155',
    roughness: railingMaterial === 'wood' ? 0.65 : 0.35,
    metalness: railingMaterial === 'wood' ? 0.05 : 0.8,
  });

  const panelColor =
    railingMaterial === 'wood'
      ? '#a47148'
      : railingMaterial === 'metal'
      ? '#64748b'
      : '#d8f3ff';

  const panelMat = createArchitecturalMaterial(
    railingMaterial === 'glass' ? 'glass' : railingMaterial,
    panelColor,
    texPool,
    isSoftwareGl,
    { opacity: railingMaterial === 'glass' ? 0.42 : 0.92, side: THREE.DoubleSide }
  );

  // Top handrail
  const railGeo = new THREE.BoxGeometry(length, 0.055, 0.075);
  const topRail = new THREE.Mesh(railGeo, postMat);
  topRail.position.y = height;
  topRail.castShadow = !isSoftwareGl;
  group.add(topRail);

  // Bottom shoe channel
  const bottomGeo = new THREE.BoxGeometry(length, 0.05, 0.06);
  const bottomRail = new THREE.Mesh(bottomGeo, postMat);
  bottomRail.position.y = 0.025;
  group.add(bottomRail);

  // Posts spaced evenly
  const postCount = Math.max(2, Math.ceil(length / 1.4) + 1);
  const postGeo = new THREE.BoxGeometry(0.05, height, 0.05);
  for (let i = 0; i < postCount; i++) {
    const t = postCount === 1 ? 0.5 : i / (postCount - 1);
    const px = -length / 2 + t * length;
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(px, height / 2, 0);
    post.castShadow = !isSoftwareGl;
    group.add(post);
  }

  // Glass / infill panels between posts
  if (railingMaterial === 'glass' || railingMaterial === 'wood') {
    const panelGeo = new THREE.BoxGeometry(Math.max(0.2, length - 0.08), height - 0.1, 0.025);
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.y = height / 2;
    group.add(panel);
  } else {
    // Metal vertical pickets
    const picketCount = Math.max(3, Math.floor(length / 0.22));
    const picketGeo = new THREE.CylinderGeometry(0.012, 0.012, height - 0.08, 6);
    for (let i = 1; i < picketCount; i++) {
      const px = -length / 2 + (i / picketCount) * length;
      const picket = new THREE.Mesh(picketGeo, postMat);
      picket.position.set(px, height / 2, 0);
      group.add(picket);
    }
  }

  return group;
}

export function buildStaircaseGroup(
  stair: Staircase3D,
  floorHeight: number,
  texPool: ProceduralTexturePool,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();
  const riseTotal = Math.max(2.6, floorHeight);
  const steps = 13;
  const runTotal = Math.max(2.4, stair.depth);
  const stepRise = riseTotal / steps;
  const stepRun = runTotal / steps;
  const width = Math.max(1.2, stair.width);

  const treadMat = createArchitecturalMaterial(
    stair.stepMaterial,
    stair.stepMaterial === 'wood' ? '#b88652' : '#cbd5e1',
    texPool,
    isSoftwareGl
  );
  const stringerMat = new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.35,
    metalness: 0.72,
  });

  // Side stringers (angled beams)
  const diagLen = Math.hypot(runTotal, riseTotal);
  const angle = Math.atan2(riseTotal, runTotal);
  const stringerGeo = new THREE.BoxGeometry(0.08, 0.22, diagLen);

  [-width / 2 + 0.04, width / 2 - 0.04].forEach((sx) => {
    const stringer = new THREE.Mesh(stringerGeo, stringerMat);
    stringer.position.set(sx, riseTotal / 2 - 0.06, 0);
    stringer.rotation.x = -angle;
    stringer.castShadow = !isSoftwareGl;
    stringer.receiveShadow = true;
    group.add(stringer);
  });

  // Individual treads + subtle riser support
  const treadGeo = new THREE.BoxGeometry(width - 0.1, 0.07, stepRun + 0.06);
  const riserGeo = new THREE.BoxGeometry(width - 0.14, stepRise * 0.78, 0.04);
  for (let i = 0; i < steps; i++) {
    const y = (i + 0.5) * stepRise;
    const z = -runTotal / 2 + (i + 0.5) * stepRun;
    const tread = new THREE.Mesh(treadGeo, treadMat);
    tread.position.set(0, y, z);
    tread.castShadow = !isSoftwareGl;
    tread.receiveShadow = true;
    group.add(tread);

    const riser = new THREE.Mesh(riserGeo, stringerMat);
    riser.position.set(0, y - stepRise * 0.4, z - stepRun * 0.42);
    group.add(riser);
  }

  // Bidirectional Up/Down indicator chevrons on base landing
  const arrowMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 0.3,
    roughness: 0.4,
  });
  const coneUp = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 4), arrowMat);
  coneUp.position.set(-0.22, riseTotal + 0.08, runTotal / 2 - 0.25);
  coneUp.rotation.x = -Math.PI / 2;
  group.add(coneUp);

  if (stair.bidirectional) {
    const coneDown = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 4), arrowMat);
    coneDown.position.set(0.22, 0.16, -runTotal / 2 + 0.25);
    coneDown.rotation.x = Math.PI / 2;
    group.add(coneDown);
  }

  // Staircase guard railings (glass/wood/metal)
  if (stair.hasGuards) {
    const guardHeight = 0.92;
    const guardMat = createArchitecturalMaterial(
      stair.railingMaterial === 'glass' ? 'glass' : stair.railingMaterial,
      stair.railingMaterial === 'glass'
        ? '#d8f3ff'
        : stair.railingMaterial === 'wood'
        ? '#9a6842'
        : '#64748b',
      texPool,
      isSoftwareGl,
      { opacity: 0.4, side: THREE.DoubleSide }
    );
    const panelGeo = new THREE.BoxGeometry(0.03, guardHeight, diagLen);
    const railGeo = new THREE.BoxGeometry(0.06, 0.055, diagLen + 0.12);

    [-width / 2 + 0.04, width / 2 - 0.04].forEach((gx) => {
      const panel = new THREE.Mesh(panelGeo, guardMat);
      panel.position.set(gx, riseTotal / 2 + guardHeight / 2, 0);
      panel.rotation.x = -angle;
      group.add(panel);

      const handrail = new THREE.Mesh(railGeo, stringerMat);
      handrail.position.set(gx, riseTotal / 2 + guardHeight, 0);
      handrail.rotation.x = -angle;
      group.add(handrail);
    });
  }

  group.rotation.y = stair.rotation || 0;
  tagGroupSelection(group, { type: 'staircase', id: stair.id });
  return group;
}

export function buildCylinderSupportGroup(
  col: CylinderSupport3D,
  texPool: ProceduralTexturePool,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();
  const r = Math.max(0.12, col.radius);
  const h = Math.max(1.0, col.height);

  const shaftMat = createArchitecturalMaterial(col.material, col.color, texPool, isSoftwareGl);
  const capMat = new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.55,
    metalness: 0.2,
  });

  // Base square plinth
  const plinthH = Math.min(0.24, h * 0.1);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(r * 2.5, plinthH, r * 2.5), capMat);
  plinth.position.y = plinthH / 2;
  plinth.castShadow = !isSoftwareGl;
  plinth.receiveShadow = true;
  group.add(plinth);

  // Cylinder shaft
  const shaftH = Math.max(0.4, h - plinthH * 2);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.94, r, shaftH, 24), shaftMat);
  shaft.position.y = plinthH + shaftH / 2;
  shaft.castShadow = !isSoftwareGl;
  shaft.receiveShadow = true;
  group.add(shaft);

  // Neck ring
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.12, r * 1.12, 0.08, 24), capMat);
  ring.position.y = h - plinthH - 0.04;
  group.add(ring);

  // Top capital abacus
  const cap = new THREE.Mesh(new THREE.BoxGeometry(r * 2.5, plinthH, r * 2.5), capMat);
  cap.position.y = h - plinthH / 2;
  cap.castShadow = !isSoftwareGl;
  group.add(cap);

  tagGroupSelection(group, { type: 'support', id: col.id });
  return group;
}

export function buildScaffoldGroup(
  scaf: Scaffold3D,
  texPool: ProceduralTexturePool,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(1.5, scaf.width);
  const d = Math.max(1.5, scaf.depth);
  const h = Math.max(2.0, scaf.height);

  const steelMat = createArchitecturalMaterial(
    scaf.material === 'wood' ? 'wood' : 'metal',
    scaf.material === 'wood' ? '#92613a' : '#475569',
    texPool,
    isSoftwareGl
  );
  const deckMat = createArchitecturalMaterial('wood', '#a37249', texPool, isSoftwareGl);

  const legGeo = new THREE.CylinderGeometry(0.065, 0.075, h, 10);
  const padGeo = new THREE.BoxGeometry(0.32, 0.08, 0.32);

  const corners: [number, number][] = [
    [-w / 2 + 0.12, -d / 2 + 0.12],
    [w / 2 - 0.12, -d / 2 + 0.12],
    [-w / 2 + 0.12, d / 2 - 0.12],
    [w / 2 - 0.12, d / 2 - 0.12],
  ];

  corners.forEach(([cx, cz]) => {
    const leg = new THREE.Mesh(legGeo, steelMat);
    leg.position.set(cx, h / 2, cz);
    leg.castShadow = !isSoftwareGl;
    group.add(leg);

    const pad = new THREE.Mesh(padGeo, steelMat);
    pad.position.set(cx, 0.04, cz);
    group.add(pad);
  });

  // Two tiers of horizontal ledgers + diagonal X-braces
  const tiers = [h * 0.45, h - 0.15];
  tiers.forEach((ty) => {
    const beamX = new THREE.BoxGeometry(w - 0.16, 0.07, 0.07);
    const beamZ = new THREE.BoxGeometry(0.07, 0.07, d - 0.16);
    [-d / 2 + 0.12, d / 2 - 0.12].forEach((bz) => {
      const m = new THREE.Mesh(beamX, steelMat);
      m.position.set(0, ty, bz);
      group.add(m);
    });
    [-w / 2 + 0.12, w / 2 - 0.12].forEach((bx) => {
      const m = new THREE.Mesh(beamZ, steelMat);
      m.position.set(bx, ty, 0);
      group.add(m);
    });
  });

  // Diagonal bracing on front/back
  const braceLen = Math.hypot(w - 0.24, h * 0.85);
  const braceAngle = Math.atan2(h * 0.85, w - 0.24);
  const braceGeo = new THREE.CylinderGeometry(0.03, 0.03, braceLen, 6);
  [-d / 2 + 0.12, d / 2 - 0.12].forEach((bz) => {
    const b1 = new THREE.Mesh(braceGeo, steelMat);
    b1.position.set(0, h * 0.5, bz);
    b1.rotation.z = braceAngle - Math.PI / 2;
    group.add(b1);
  });

  // Top deck platform for water tank
  const deck = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.12, d + 0.1), deckMat);
  deck.position.y = h - 0.06;
  deck.castShadow = !isSoftwareGl;
  deck.receiveShadow = true;
  group.add(deck);

  // Safety guard rim
  const rimMat = new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.45, metalness: 0.4 });
  const rimX = new THREE.BoxGeometry(w + 0.08, 0.05, 0.05);
  const rimZ = new THREE.BoxGeometry(0.05, 0.05, d + 0.08);
  [-d / 2, d / 2].forEach((rz) => {
    const m = new THREE.Mesh(rimX, rimMat);
    m.position.set(0, h + 0.35, rz);
    group.add(m);
  });
  [-w / 2, w / 2].forEach((rx) => {
    const m = new THREE.Mesh(rimZ, rimMat);
    m.position.set(rx, h + 0.35, 0);
    group.add(m);
  });

  tagGroupSelection(group, { type: 'scaffold', id: scaf.id });
  return group;
}

export function buildPoolGroup(
  pool: Pool3D,
  texPool: ProceduralTexturePool,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(2.5, pool.width);
  const d = Math.max(2.0, pool.depth);

  const copingMat = createArchitecturalMaterial('concrete', '#e5e1d8', texPool, isSoftwareGl);
  const basinMat = new THREE.MeshStandardMaterial({
    color: '#0e7490',
    map: texPool.tile,
    roughness: 0.35,
    metalness: 0.05,
  });
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: '#22d3ee',
    map: texPool.water,
    roughness: 0.1,
    metalness: 0.06,
    transparent: true,
    opacity: isSoftwareGl ? 0.74 : 0.82,
    clearcoat: isSoftwareGl ? 0 : 0.8,
  });

  // Raised coping apron edges (around perimeter)
  const rimW = 0.42;
  const copingH = 0.14;
  const northRim = new THREE.Mesh(new THREE.BoxGeometry(w + rimW * 2, copingH, rimW), copingMat);
  northRim.position.set(0, copingH / 2, -d / 2 - rimW / 2);
  const southRim = northRim.clone();
  southRim.position.z = d / 2 + rimW / 2;
  const westRim = new THREE.Mesh(new THREE.BoxGeometry(rimW, copingH, d), copingMat);
  westRim.position.set(-w / 2 - rimW / 2, copingH / 2, 0);
  const eastRim = westRim.clone();
  eastRim.position.x = w / 2 + rimW / 2;
  [northRim, southRim, westRim, eastRim].forEach((m) => {
    m.receiveShadow = true;
    group.add(m);
  });

  // Inner mosaic basin floor (clean Y offset above compound ground)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), basinMat);
  floor.position.y = 0.03;
  floor.receiveShadow = true;
  group.add(floor);

  // Shimmering water surface
  const waterMesh = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, 0.08, d - 0.04), waterMat);
  waterMesh.position.y = 0.085;
  waterMesh.name = 'pool-water-surface';
  group.add(waterMesh);

  // Stainless steel ladder
  const steelMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.2, metalness: 0.9 });
  [-0.26, 0.26].forEach((lx) => {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8), steelMat);
    rail.position.set(-w / 2 + 0.1, 0.34, lx);
    group.add(rail);
  });

  tagGroupSelection(group, { type: 'pool', id: pool.id });
  return group;
}

export function buildRoofGroup(
  building: Building3D,
  roof: RoofConfig,
  texPool: ProceduralTexturePool,
  isSoftwareGl: boolean,
  cutaway: boolean
): THREE.Group {
  const group = new THREE.Group();
  const w = building.width + roof.overhang * 2;
  const d = building.depth + roof.overhang * 2;
  const h = Math.max(0.3, roof.height);

  const roofMat = createArchitecturalMaterial(roof.material, roof.color, texPool, isSoftwareGl, {
    cutaway,
    side: THREE.DoubleSide,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.38,
    metalness: 0.65,
    transparent: cutaway,
    opacity: cutaway ? 0.34 : 1,
  });
  const glassMat = createArchitecturalMaterial('glass', '#d8f3ff', texPool, isSoftwareGl, {
    opacity: 0.42,
    side: THREE.DoubleSide,
  });

  if (roof.style === 'flat' || roof.style === 'modern') {
    const slabH = 0.22;
    if (roof.hasGlassOpening) {
      // Build 4 perimeter roof bands leaving a real central glass skylight aperture
      const ow = Math.min(w * 0.72, Math.max(1.6, w * roof.glassOpeningWidthRatio));
      const od = Math.min(d * 0.72, Math.max(1.6, d * roof.glassOpeningDepthRatio));
      const sideW = (w - ow) / 2;
      const sideD = (d - od) / 2;

      const bandN = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, sideD), roofMat);
      bandN.position.set(0, slabH / 2, -d / 2 + sideD / 2);
      const bandS = bandN.clone();
      bandS.position.z = d / 2 - sideD / 2;
      const bandW = new THREE.Mesh(new THREE.BoxGeometry(sideW, slabH, od), roofMat);
      bandW.position.set(-w / 2 + sideW / 2, slabH / 2, 0);
      const bandE = bandW.clone();
      bandE.position.x = w / 2 - sideW / 2;
      [bandN, bandS, bandW, bandE].forEach((b) => {
        b.castShadow = !isSoftwareGl;
        b.receiveShadow = true;
        group.add(b);
      });

      // Skylight glass pane + aluminum mullions
      const glassPane = new THREE.Mesh(new THREE.BoxGeometry(ow, 0.04, od), glassMat);
      glassPane.position.set(0, slabH + 0.04, 0);
      group.add(glassPane);

      const frameOuter = new THREE.Mesh(new THREE.BoxGeometry(ow + 0.14, 0.12, 0.08), trimMat);
      frameOuter.position.set(0, slabH + 0.06, -od / 2);
      const frameOuterS = frameOuter.clone();
      frameOuterS.position.z = od / 2;
      group.add(frameOuter, frameOuterS);

      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, od), trimMat);
      mullion.position.set(0, slabH + 0.06, 0);
      group.add(mullion);
    } else {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), roofMat);
      deck.position.y = slabH / 2;
      deck.castShadow = !isSoftwareGl;
      deck.receiveShadow = true;
      group.add(deck);
    }

    // Parapet walls for flat/modern look
    const pH = roof.style === 'modern' ? 0.5 : 0.35;
    const pN = new THREE.Mesh(new THREE.BoxGeometry(w, pH, 0.16), trimMat);
    pN.position.set(0, slabH + pH / 2, -d / 2 + 0.08);
    const pS = pN.clone();
    pS.position.z = d / 2 - 0.08;
    const pW = new THREE.Mesh(new THREE.BoxGeometry(0.16, pH, d), trimMat);
    pW.position.set(-w / 2 + 0.08, slabH + pH / 2, 0);
    const pE = pW.clone();
    pE.position.x = w / 2 - 0.08;
    group.add(pN, pS, pW, pE);

    if (roof.style === 'modern') {
      // Cantilevered fascia eyebrow fin
      const fin = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.14, 1.1), trimMat);
      fin.position.set(0, slabH + 0.12, d / 2 + 0.25);
      group.add(fin);
    }
  } else if (roof.style === 'gable') {
    // Two pitched slopes meeting along X ridge
    const halfD = d / 2;
    const slopeLen = Math.hypot(halfD, h);
    const pitch = Math.atan2(h, halfD);

    const slopeGeo = new THREE.BoxGeometry(w, 0.16, slopeLen);
    const northSlope = new THREE.Mesh(slopeGeo, roofMat);
    northSlope.position.set(0, h / 2, -halfD / 2);
    northSlope.rotation.x = pitch;
    northSlope.castShadow = !isSoftwareGl;

    const southSlope = new THREE.Mesh(slopeGeo, roofMat);
    southSlope.position.set(0, h / 2, halfD / 2);
    southSlope.rotation.x = -pitch;
    southSlope.castShadow = !isSoftwareGl;

    group.add(northSlope, southSlope);

    // Gable triangular end walls
    const triShape = new THREE.Shape();
    triShape.moveTo(-halfD, 0);
    triShape.lineTo(halfD, 0);
    triShape.lineTo(0, h);
    triShape.closePath();
    const gableGeo = new THREE.ExtrudeGeometry(triShape, { depth: 0.22, bevelEnabled: false });
    const gableW = new THREE.Mesh(
      gableGeo,
      createArchitecturalMaterial(building.wallMaterial, building.wallColor, texPool, isSoftwareGl, {
        cutaway,
      })
    );
    gableW.rotation.y = Math.PI / 2;
    gableW.position.set(-building.width / 2 - 0.02, 0, 0);

    const gableE = gableW.clone();
    gableE.position.set(building.width / 2 - 0.2, 0, 0);
    group.add(gableW, gableE);

    // Ridge beam
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.14, 0.18), trimMat);
    ridge.position.set(0, h, 0);
    group.add(ridge);

    if (roof.hasGlassOpening) {
      // Flush glass skylight dormer inset along south roof slope
      const ow = Math.min(w * 0.55, Math.max(1.8, w * roof.glassOpeningWidthRatio));
      const od = slopeLen * 0.52;
      const skyFrame = new THREE.Mesh(new THREE.BoxGeometry(ow + 0.16, 0.22, od + 0.16), trimMat);
      skyFrame.position.set(0, h * 0.53, halfD * 0.47);
      skyFrame.rotation.x = -pitch;

      const skyGlass = new THREE.Mesh(new THREE.BoxGeometry(ow, 0.24, od), glassMat);
      skyGlass.position.set(0, h * 0.55, halfD * 0.47);
      skyGlass.rotation.x = -pitch;
      group.add(skyFrame, skyGlass);
    }
  } else if (roof.style === 'hip') {
    // 4-sided hip pyramid frustum
    const hipGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.68, h, 4);
    const hipMesh = new THREE.Mesh(hipGeo, roofMat);
    hipMesh.rotation.y = Math.PI / 4;
    hipMesh.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
    hipMesh.position.y = h / 2;
    hipMesh.castShadow = !isSoftwareGl;
    group.add(hipMesh);

    if (roof.hasGlassOpening) {
      // Raised lantern glass crown skylight
      const lw = Math.max(1.5, w * roof.glassOpeningWidthRatio * 0.6);
      const ld = Math.max(1.5, d * roof.glassOpeningDepthRatio * 0.6);
      const lanternGlass = new THREE.Mesh(new THREE.BoxGeometry(lw, 0.45, ld), glassMat);
      lanternGlass.position.y = h * 0.72;
      const lanternCap = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.25, 0.1, ld + 0.25), trimMat);
      lanternCap.position.y = h * 0.72 + 0.25;
      group.add(lanternGlass, lanternCap);
    }
  } else {
    // Shed mono-pitch
    const slopeLen = Math.hypot(d, h);
    const pitch = Math.atan2(h, d);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, slopeLen), roofMat);
    slab.position.set(0, h / 2, 0);
    slab.rotation.x = -pitch;
    slab.castShadow = !isSoftwareGl;
    group.add(slab);

    if (roof.hasGlassOpening) {
      const ow = Math.max(1.8, w * roof.glassOpeningWidthRatio);
      const od = Math.max(1.6, d * roof.glassOpeningDepthRatio * 0.6);
      const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(ow, 0.22, od), glassMat);
      glassMesh.position.set(0, h / 2 + 0.04, 0);
      glassMesh.rotation.x = -pitch;
      group.add(glassMesh);
    }
  }

  tagGroupSelection(group, { type: 'building', id: building.id });
  return group;
}

export function buildFacilityGroup(
  fac: PlacedFacility3D,
  texPool: ProceduralTexturePool,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();
  const darkMetal = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.35,
    metalness: 0.75,
  });
  const whiteTrim = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.5,
    metalness: 0.1,
  });

  if (fac.kind === 'door') {
    const isGate = fac.mountSurface === 'perimeter';
    const doorMat = createArchitecturalMaterial(
      fac.material || (isGate ? 'metal' : 'wood'),
      fac.color || (isGate ? '#1e293b' : '#8b5a36'),
      texPool,
      isSoftwareGl
    );

    if (isGate) {
      // Perimeter Gate with twin masonry pillars + double slatted steel gate leaves
      const gateW = 3.4;
      const gateH = 2.05;
      const pillarMat = createArchitecturalMaterial('concrete', '#e2dfd7', texPool, isSoftwareGl);
      const pillarGeo = new THREE.BoxGeometry(0.42, gateH + 0.35, 0.42);
      const pL = new THREE.Mesh(pillarGeo, pillarMat);
      pL.position.set(-gateW / 2 - 0.21, (gateH + 0.35) / 2, 0);
      const pR = pL.clone();
      pR.position.x = gateW / 2 + 0.21;
      group.add(pL, pR);

      // Pillar cap lights
      const capL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.48), darkMetal);
      capL.position.set(pL.position.x, gateH + 0.4, 0);
      const capR = capL.clone();
      capR.position.x = pR.position.x;
      group.add(capL, capR);

      // Gate leaves hinged at pillars
      const leafW = gateW / 2 - 0.04;
      const leftPivot = new THREE.Group();
      leftPivot.position.set(-gateW / 2, 0, 0);
      const leftLeaf = new THREE.Mesh(new THREE.BoxGeometry(leafW, gateH - 0.1, 0.08), doorMat);
      leftLeaf.position.set(leafW / 2, gateH / 2, 0);
      leftPivot.add(leftLeaf);
      leftPivot.rotation.y = fac.isOpen ? -Math.PI * 0.42 : 0;

      const rightPivot = new THREE.Group();
      rightPivot.position.set(gateW / 2, 0, 0);
      const rightLeaf = new THREE.Mesh(new THREE.BoxGeometry(leafW, gateH - 0.1, 0.08), doorMat);
      rightLeaf.position.set(-leafW / 2, gateH / 2, 0);
      rightPivot.add(rightLeaf);
      rightPivot.rotation.y = fac.isOpen ? Math.PI * 0.42 : 0;

      group.add(leftPivot, rightPivot);
    } else {
      // Building door with frame, hinged leaf, and brass handle
      const dW = 1.05;
      const dH = 2.15;
      const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.08, dH, 0.24), darkMetal);
      jambL.position.set(-dW / 2 - 0.04, dH / 2, 0);
      const jambR = jambL.clone();
      jambR.position.x = dW / 2 + 0.04;
      const header = new THREE.Mesh(new THREE.BoxGeometry(dW + 0.16, 0.08, 0.24), darkMetal);
      header.position.set(0, dH + 0.04, 0);
      const sill = new THREE.Mesh(new THREE.BoxGeometry(dW + 0.14, 0.04, 0.26), darkMetal);
      sill.position.set(0, 0.02, 0);

      const hinge = new THREE.Group();
      hinge.position.set(-dW / 2, 0, 0);
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(dW, dH - 0.04, 0.07), doorMat);
      leaf.position.set(dW / 2, dH / 2, 0);
      leaf.castShadow = !isSoftwareGl;
      const handleMat = new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.25, metalness: 0.85 });
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.14), handleMat);
      handle.position.set(dW - 0.14, 1.0, 0);
      hinge.add(leaf, handle);
      hinge.rotation.y = fac.isOpen ? -Math.PI * 0.44 : 0;

      group.add(jambL, jambR, header, sill, hinge);
    }
  } else if (fac.kind === 'window') {
    const wW = 1.6;
    const wH = 1.25;
    const glassMat = createArchitecturalMaterial('glass', '#bae6fd', texPool, isSoftwareGl, {
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const frameH = new THREE.BoxGeometry(wW + 0.14, 0.08, 0.24);
    const topF = new THREE.Mesh(frameH, darkMetal);
    topF.position.y = wH / 2;
    const botF = new THREE.Mesh(new THREE.BoxGeometry(wW + 0.2, 0.09, 0.3), darkMetal);
    botF.position.y = -wH / 2;
    const sideF = new THREE.BoxGeometry(0.08, wH, 0.24);
    const leftF = new THREE.Mesh(sideF, darkMetal);
    leftF.position.x = -wW / 2;
    const rightF = leftF.clone();
    rightF.position.x = wW / 2;
    const centerMullion = new THREE.Mesh(new THREE.BoxGeometry(0.05, wH, 0.16), darkMetal);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(wW - 0.04, wH - 0.08, 0.04), glassMat);
    group.add(topF, botF, leftF, rightF, centerMullion, glass);
  } else if (fac.kind === 'camera') {
    // Multi-part security camera (ceiling dome or articulated wall/perimeter/roof PTZ)
    const isCeiling = fac.mountSurface === 'ceiling';
    const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.06, 16), whiteTrim);
    group.add(basePlate);

    if (isCeiling) {
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.08, 16), darkMetal);
      collar.position.y = -0.07;
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55),
        new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.15, metalness: 0.4 })
      );
      dome.position.y = -0.09;
      group.add(collar, dome);
    } else {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 8), whiteTrim);
      arm.rotation.x = Math.PI / 2;
      arm.position.set(0, 0.04, 0.12);
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.3), whiteTrim);
      body.position.set(0, 0.06, 0.26);
      const lensRing = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16), darkMetal);
      lensRing.rotation.x = Math.PI / 2;
      lensRing.position.set(0, 0.06, 0.42);
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 8, 8),
        new THREE.MeshStandardMaterial({
          color: fac.isOn ? '#22c55e' : '#ef4444',
          emissive: fac.isOn ? '#22c55e' : '#ef4444',
          emissiveIntensity: 1.5,
        })
      );
      led.position.set(0.05, 0.11, 0.41);
      group.add(arm, body, lensRing, led);
    }
  } else if (fac.kind === 'light') {
    const lit = fac.isOn ?? true;
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.05, 16), darkMetal);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 8), darkMetal);
    stem.position.y = -0.1;
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.24, 0.14, 16, 1, true),
      darkMetal
    );
    shade.position.y = -0.2;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 14, 12),
      new THREE.MeshStandardMaterial({
        color: lit ? '#fef08a' : '#94a3b8',
        emissive: lit ? '#fbbf24' : '#000000',
        emissiveIntensity: lit ? 1.8 : 0,
        roughness: 0.2,
      })
    );
    bulb.position.y = -0.22;
    group.add(canopy, stem, shade, bulb);

    if (lit && !isSoftwareGl) {
      const point = new THREE.PointLight('#fde68a', 2.4, 9, 1.8);
      point.position.set(0, -0.35, 0);
      group.add(point);
    }
  } else if (fac.kind === 'power_outlet') {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.04), whiteTrim);
    const socket1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.05), darkMetal);
    socket1.position.set(0, 0.06, 0.01);
    const socket2 = socket1.clone();
    socket2.position.y = -0.06;
    const indicator = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.015, 0.05),
      new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#10b981', emissiveIntensity: 1.2 })
    );
    indicator.position.set(0.06, 0.11, 0.01);
    group.add(plate, socket1, socket2, indicator);
  } else {
    // External sensor
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.14), whiteTrim);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 12, 10),
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.25 })
    );
    dome.position.set(0, -0.02, 0.06);
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      new THREE.MeshStandardMaterial({
        color: fac.isOn ? '#38bdf8' : '#64748b',
        emissive: fac.isOn ? '#38bdf8' : '#000000',
        emissiveIntensity: 1.4,
      })
    );
    led.position.set(0, 0.09, 0.075);
    group.add(housing, dome, led);
  }

  group.rotation.y = fac.rotation || 0;
  tagGroupSelection(group, { type: 'facility', id: fac.id });
  return group;
}

export function buildUtilityGroup(
  util: PlacedUtility3D,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();
  const active = util.isActive ?? true;
  const darkMetal = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4, metalness: 0.72 });

  if (util.kind === 'water_tank') {
    const tankMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.35,
      metalness: 0.25,
    });
    const cradle = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.14, 1.75), darkMetal);
    cradle.position.y = 0.07;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.78, 1.55, 22), tankMat);
    body.position.y = 0.14 + 0.775;
    body.castShadow = !isSoftwareGl;
    // Ribbed rings
    [0.5, 0.95, 1.4].forEach((ry) => {
      const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.81, 0.81, 0.08, 22), tankMat);
      rib.position.y = ry;
      group.add(rib);
    });
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.14, 16), darkMetal);
    lid.position.y = 1.74;
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 10), darkMetal);
    pipe.position.set(0.82, 0.45, 0);
    const valve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10),
      new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.3, metalness: 0.7 })
    );
    valve.rotation.z = Math.PI / 2;
    valve.position.set(0.88, 0.55, 0);
    group.add(cradle, body, lid, pipe, valve);
  } else if (util.kind === 'generator') {
    const canopyMat = new THREE.MeshStandardMaterial({
      color: '#eab308',
      roughness: 0.42,
      metalness: 0.35,
    });
    const skid = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.14, 1.15), darkMetal);
    skid.position.y = 0.07;
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.05, 0.95), canopyMat);
    canopy.position.y = 0.14 + 0.525;
    canopy.castShadow = !isSoftwareGl;
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 10), darkMetal);
    exhaust.position.set(-0.65, 1.4, 0);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.05), darkMetal);
    panel.position.set(0.45, 0.75, 0.48);
    const statusLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshStandardMaterial({
        color: active ? '#22c55e' : '#ef4444',
        emissive: active ? '#22c55e' : '#ef4444',
        emissiveIntensity: 1.4,
      })
    );
    statusLed.position.set(0.45, 0.84, 0.51);
    group.add(skid, canopy, exhaust, panel, statusLed);
  } else if (util.kind === 'solar_panel') {
    const cellMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.16,
      metalness: 0.65,
    });
    const mountL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), darkMetal);
    mountL.position.set(-0.85, 0.22, -0.3);
    const mountR = mountL.clone();
    mountR.position.x = 0.85;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.07, 1.4), darkMetal);
    frame.position.y = 0.35;
    frame.rotation.x = 0.28;
    const cells = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.08, 1.26), cellMat);
    cells.position.y = 0.36;
    cells.rotation.x = 0.28;
    group.add(mountL, mountR, frame, cells);
  } else if (util.kind === 'water_pump' || util.kind === 'water_meter') {
    const pumpMat = new THREE.MeshStandardMaterial({
      color: util.kind === 'water_pump' ? '#0ea5e9' : '#10b981',
      roughness: 0.38,
      metalness: 0.45,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 0.6), darkMetal);
    base.position.y = 0.05;
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.52, 16), pumpMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-0.1, 0.32, 0);
    const volute = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 16), darkMetal);
    volute.rotation.z = Math.PI / 2;
    volute.position.set(0.24, 0.32, 0);
    const gauge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.05, 12),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 })
    );
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(0.24, 0.62, 0);
    group.add(base, motor, volute, gauge);
  } else if (util.kind === 'gas_cylinder') {
    const cylMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.36, metalness: 0.4 });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.05, 18), cylMat);
    tank.position.y = 0.525;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), cylMat);
    dome.position.y = 1.05;
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 14, 1, true), darkMetal);
    collar.position.y = 1.32;
    const brass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10),
      new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.25, metalness: 0.85 })
    );
    brass.position.y = 1.34;
    group.add(tank, dome, collar, brass);
  } else {
    // Air Conditioner / Heater condenser unit
    const boxMat = new THREE.MeshStandardMaterial({
      color: util.kind === 'heater' ? '#e11d48' : '#e2e8f0',
      roughness: 0.45,
      metalness: 0.25,
    });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.55), darkMetal);
    pad.position.y = 0.04;
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.78, 0.45), boxMat);
    cabinet.position.y = 0.47;
    cabinet.castShadow = !isSoftwareGl;
    const fanGrille = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 18), darkMetal);
    fanGrille.rotation.x = Math.PI / 2;
    fanGrille.position.set(-0.18, 0.48, 0.22);
    group.add(pad, cabinet, fanGrille);
  }

  group.rotation.y = util.rotation || 0;
  tagGroupSelection(group, { type: 'utility', id: util.id });
  return group;
}
