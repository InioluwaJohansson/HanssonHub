import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Building3D,
  FloorLevel,
  PaletteDragPayload,
  Property3DModel,
  SelectedItemRef,
} from './types';
import {
  buildCylinderSupportGroup,
  buildFacilityGroup,
  buildPoolGroup,
  buildRailingRun,
  buildRoofGroup,
  buildScaffoldGroup,
  buildStaircaseGroup,
  buildUtilityGroup,
  createArchitecturalMaterial,
  createProceduralTexturePool,
  ProceduralTexturePool,
  tagGroupSelection,
} from './proceduralAssets';

export type CameraPreset = 'hero' | 'top' | 'front' | 'underground';

interface ThreeHouseViewportProps {
  model: Property3DModel;
  activeFloor: FloorLevel | 'all';
  exploded: boolean;
  cutaway: boolean;
  nightMode: boolean;
  selectedItem: SelectedItemRef;
  cameraPresetRequest: { preset: CameraPreset; seq: number } | null;
  onSelectItem: (ref: SelectedItemRef) => void;
  onDropAtWorld?: (payload: PaletteDragPayload, worldX: number, worldZ: number) => void;
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return false;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    let isSoft = false;
    if (ext) {
      const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
      isSoft = /SwiftShader|llvmpipe|Software Renderer/i.test(renderer);
    }
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return isSoft;
  } catch {
    return false;
  }
}

function disposeObjectTree(root: THREE.Object3D) {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (m) m.dispose();
      });
    }
  });
}

function buildSlottedFloorSlab(
  width: number,
  depth: number,
  cutouts: { x: number; z: number; width: number; depth: number }[],
  mat: THREE.Material,
  isSoftwareGl: boolean
): THREE.Mesh {
  const hw = width / 2;
  const hd = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, -hd);
  shape.lineTo(hw, -hd);
  shape.lineTo(hw, hd);
  shape.lineTo(-hw, hd);
  shape.closePath();

  // Shape coordinates map (x, y) -> after rotateX(-PI/2) -> world (x, -y) so z = -y => y = -z
  cutouts.forEach((c) => {
    const cx = THREE.MathUtils.clamp(c.x, -hw + 0.4, hw - 0.4);
    const cz = THREE.MathUtils.clamp(c.z, -hd + 0.4, hd - 0.4);
    const chw = Math.min(c.width / 2, hw - 0.35);
    const chd = Math.min(c.depth / 2, hd - 0.35);
    if (chw > 0.25 && chd > 0.25) {
      const hole = new THREE.Path();
      const yMin = -(cz + chd);
      const yMax = -(cz - chd);
      hole.moveTo(cx - chw, yMin);
      hole.lineTo(cx - chw, yMax);
      hole.lineTo(cx + chw, yMax);
      hole.lineTo(cx + chw, yMin);
      hole.closePath();
      shape.holes.push(hole);
    }
  });

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.22,
    bevelEnabled: false,
  });
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = -0.22;
  mesh.receiveShadow = true;
  mesh.castShadow = !isSoftwareGl;
  return mesh;
}

function getFloorBaseY(floor: FloorLevel, floorHeight: number): number {
  if (floor === 'underground') return -floorHeight;
  if (floor === 'top') return floorHeight;
  return 0;
}

function getFacilityWorldPosition(
  fac: Property3DModel['facilities'][number],
  model: Property3DModel
): { y: number; floorKey: FloorLevel } {
  const bld = fac.buildingId ? model.buildings.find((b) => b.id === fac.buildingId) : null;
  const fh = bld?.floorHeight || 3.2;
  const baseY = getFloorBaseY(fac.floor, fh);

  if (fac.mountSurface === 'perimeter') {
    const h = fac.kind === 'door' ? 0 : Math.max(1.5, model.perimeterHeight - 0.1);
    return { y: h, floorKey: 'ground' };
  }
  if (fac.mountSurface === 'roof' && bld) {
    const topBase = bld.floors.includes('top') ? fh : 0;
    const roofEaveY = topBase + fh + (fac.kind === 'camera' || fac.kind === 'light' ? 0.2 : 0.4);
    return { y: roofEaveY, floorKey: 'top' };
  }
  if (fac.mountSurface === 'ceiling') {
    return { y: baseY + fh - 0.25, floorKey: fac.floor };
  }
  if (fac.kind === 'door') {
    return { y: baseY, floorKey: fac.floor };
  }
  if (fac.kind === 'window') {
    return { y: baseY + 1.45, floorKey: fac.floor };
  }
  if (fac.kind === 'power_outlet') {
    return { y: baseY + 0.52, floorKey: fac.floor };
  }
  if (fac.kind === 'camera' || fac.kind === 'external_sensor') {
    return { y: baseY + 2.35, floorKey: fac.floor };
  }
  if (fac.kind === 'light') {
    return { y: baseY + 2.3, floorKey: fac.floor };
  }
  return { y: baseY + (fac.elevation || 0), floorKey: fac.floor };
}

export const ThreeHouseViewport: React.FC<ThreeHouseViewportProps> = ({
  model,
  activeFloor,
  exploded,
  cutaway,
  nightMode,
  selectedItem,
  cameraPresetRequest,
  onSelectItem,
  onDropAtWorld,
}) => {
  const mountRef = React.useRef<HTMLDivElement | null>(null);

  const onSelectRef = React.useRef(onSelectItem);
  onSelectRef.current = onSelectItem;
  const onDropRef = React.useRef(onDropAtWorld);
  onDropRef.current = onDropAtWorld;
  const activeFloorRef = React.useRef(activeFloor);
  activeFloorRef.current = activeFloor;

  const engineRef = React.useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    pmrem: THREE.PMREMGenerator;
    envRT: THREE.WebGLRenderTarget;
    texPool: ProceduralTexturePool;
    isSoftwareGl: boolean;
    houseRoot: THREE.Group;
    floorGroups: Record<FloorLevel, THREE.Group>;
    roofGroups: THREE.Group;
    waterMeshes: THREE.Mesh[];
    selectionBox: THREE.Box3Helper | null;
    keyLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
    rimLight: THREE.DirectionalLight;
    groundGrid: THREE.GridHelper;
    explodeCurrent: number;
    explodeTarget: number;
    camTargetPos: THREE.Vector3 | null;
    camTargetLook: THREE.Vector3 | null;
    needsRender: boolean;
    requestRender: () => void;
    selectedObjectMap: Map<string, THREE.Object3D>;
  } | null>(null);

  // Initialize Three.js engine once
  React.useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: isSoftwareGl ? 'default' : 'high-performance',
      preserveDrawingBuffer: isSoftwareGl,
    });

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const dayBg = new THREE.Color('#dbeafe');
    scene.background = dayBg;
    scene.fog = new THREE.Fog('#dbeafe', 55, 145);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.25, 280);
    camera.position.set(28, 22, 32);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.minDistance = 5;
    controls.maxDistance = 110;
    controls.target.set(0, 1.5, 0);

    // Lighting
    const hemiLight = new THREE.HemisphereLight('#f0f9ff', '#94a3b8', 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#fff7ed', 2.0);
    keyLight.position.set(26, 36, 22);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.near = 5;
      keyLight.shadow.camera.far = 110;
      keyLight.shadow.camera.left = -35;
      keyLight.shadow.camera.right = 35;
      keyLight.shadow.camera.top = 35;
      keyLight.shadow.camera.bottom = -35;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.025;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#bae6fd', 0.55);
    rimLight.position.set(-24, 16, -26);
    scene.add(rimLight);

    // Subtle world ground plane & architectural blueprint grid
    const worldGround = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 240),
      new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        roughness: 0.95,
        metalness: 0.0,
      })
    );
    worldGround.rotation.x = -Math.PI / 2;
    worldGround.position.y = -0.04;
    worldGround.receiveShadow = true;
    scene.add(worldGround);

    const groundGrid = new THREE.GridHelper(120, 60, '#94a3b8', '#cbd5e1');
    groundGrid.position.y = -0.025;
    scene.add(groundGrid);

    const houseRoot = new THREE.Group();
    scene.add(houseRoot);

    const floorGroups: Record<FloorLevel, THREE.Group> = {
      underground: new THREE.Group(),
      ground: new THREE.Group(),
      top: new THREE.Group(),
    };
    const roofGroups = new THREE.Group();

    const texPool = createProceduralTexturePool(renderer.capabilities.getMaxAnisotropy());

    let rafId = 0;
    let disposed = false;
    let lastTime = performance.now();

    const state = {
      renderer,
      scene,
      camera,
      controls,
      pmrem,
      envRT,
      texPool,
      isSoftwareGl,
      houseRoot,
      floorGroups,
      roofGroups,
      waterMeshes: [] as THREE.Mesh[],
      selectionBox: null as THREE.Box3Helper | null,
      keyLight,
      hemiLight,
      rimLight,
      groundGrid,
      explodeCurrent: 0,
      explodeTarget: 0,
      camTargetPos: null as THREE.Vector3 | null,
      camTargetLook: null as THREE.Vector3 | null,
      needsRender: true,
      requestRender: () => {},
      selectedObjectMap: new Map<string, THREE.Object3D>(),
    };

    const requestRender = () => {
      state.needsRender = true;
    };
    state.requestRender = requestRender;

    controls.addEventListener('change', requestRender);
    controls.addEventListener('start', () => {
      state.camTargetPos = null;
      state.camTargetLook = null;
    });

    const animate = (now: number) => {
      if (disposed) return;
      rafId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      let activeAnim = false;

      // Damped floor explosion separation
      if (Math.abs(state.explodeCurrent - state.explodeTarget) > 0.002) {
        state.explodeCurrent = THREE.MathUtils.damp(
          state.explodeCurrent,
          state.explodeTarget,
          6.5,
          dt
        );
        state.floorGroups.underground.position.y = -state.explodeCurrent * 2.2;
        state.floorGroups.top.position.y = state.explodeCurrent * 2.0;
        state.roofGroups.position.y = state.explodeCurrent * 3.4;
        activeAnim = true;
      }

      // Smooth damped camera preset transitions
      if (state.camTargetPos && state.camTargetLook) {
        const lambda = 6.0;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, state.camTargetPos.x, lambda, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, state.camTargetPos.y, lambda, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, state.camTargetPos.z, lambda, dt);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, state.camTargetLook.x, lambda, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, state.camTargetLook.y, lambda, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, state.camTargetLook.z, lambda, dt);

        if (
          camera.position.distanceTo(state.camTargetPos) < 0.08 &&
          controls.target.distanceTo(state.camTargetLook) < 0.05
        ) {
          state.camTargetPos = null;
          state.camTargetLook = null;
        } else {
          activeAnim = true;
        }
      }

      // Gentle pool water caustic drift
      if (state.waterMeshes.length > 0) {
        texPool.water.offset.x = (now * 0.00003) % 1;
        texPool.water.offset.y = (now * 0.00002) % 1;
        activeAnim = true;
      }

      if (controls.update()) activeAnim = true;

      if (state.needsRender || activeAnim) {
        renderer.render(scene, camera);
        state.needsRender = false;
      }
    };
    rafId = requestAnimationFrame(animate);

    // ResizeObserver for instant responsive adaptation
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          requestRender();
        }
      }
    });
    resizeObserver.observe(container);

    // Raycasting pointer selection (distinguish click vs orbit drag)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(houseRoot.children, true);
      const hitWithRef = hits.find((h) => h.object.userData?.itemRef);
      if (hitWithRef) {
        onSelectRef.current(hitWithRef.object.userData.itemRef as SelectedItemRef);
      } else {
        onSelectRef.current(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const onContextLost = (e: Event) => {
      e.preventDefault();
    };
    const onContextRestored = () => {
      requestRender();
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    engineRef.current = state;

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      disposeObjectTree(houseRoot);
      worldGround.geometry.dispose();
      (worldGround.material as THREE.Material).dispose();
      texPool.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      engineRef.current = null;
    };
  }, []);

  // Update day / night theme lighting
  React.useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const bgHex = nightMode ? '#0b1220' : '#dbeafe';
    engine.scene.background = new THREE.Color(bgHex);
    engine.scene.fog = new THREE.Fog(bgHex, 55, 145);
    engine.keyLight.intensity = nightMode ? 0.65 : 2.0;
    engine.keyLight.color.set(nightMode ? '#93c5fd' : '#fff7ed');
    engine.hemiLight.intensity = nightMode ? 0.35 : 0.85;
    engine.rimLight.intensity = nightMode ? 0.45 : 0.55;
    engine.requestRender();
  }, [nightMode]);

  // Update exploded target
  React.useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.explodeTarget = exploded ? 1 : 0;
    engine.requestRender();
  }, [exploded]);

  // Trigger camera preset
  React.useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !cameraPresetRequest) return;
    const { preset } = cameraPresetRequest;
    const scale = Math.max(24, Math.max(model.width, model.depth));
    if (preset === 'hero') {
      engine.camTargetPos = new THREE.Vector3(scale * 0.78, scale * 0.58, scale * 0.88);
      engine.camTargetLook = new THREE.Vector3(0, 1.8, 0);
    } else if (preset === 'top') {
      engine.camTargetPos = new THREE.Vector3(0, scale * 1.18, 0.1);
      engine.camTargetLook = new THREE.Vector3(0, 0, 0);
    } else if (preset === 'front') {
      engine.camTargetPos = new THREE.Vector3(0, 6.5, scale * 0.92);
      engine.camTargetLook = new THREE.Vector3(0, 2.2, 0);
    } else if (preset === 'underground') {
      engine.camTargetPos = new THREE.Vector3(scale * 0.62, 5.2, scale * 0.72);
      engine.camTargetLook = new THREE.Vector3(-2, -1.5, 0);
    }
    engine.requestRender();
  }, [cameraPresetRequest, model.width, model.depth]);

  // Rebuild 3D property model scene graph whenever model or visibility flags change
  React.useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const { houseRoot, texPool, isSoftwareGl, selectedObjectMap } = engine;

    disposeObjectTree(houseRoot);
    houseRoot.clear();
    selectedObjectMap.clear();
    engine.waterMeshes = [];
    if (engine.selectionBox) {
      engine.selectionBox.dispose();
      engine.selectionBox = null;
    }

    const floorGroups: Record<FloorLevel, THREE.Group> = {
      underground: new THREE.Group(),
      ground: new THREE.Group(),
      top: new THREE.Group(),
    };
    const roofGroups = new THREE.Group();
    engine.floorGroups = floorGroups;
    engine.roofGroups = roofGroups;

    floorGroups.underground.position.y = -engine.explodeCurrent * 2.2;
    floorGroups.top.position.y = engine.explodeCurrent * 2.0;
    roofGroups.position.y = engine.explodeCurrent * 3.4;

    houseRoot.add(floorGroups.underground, floorGroups.ground, floorGroups.top, roofGroups);

    const showFloor = (f: FloorLevel): boolean => {
      if (activeFloor === 'all') return true;
      return activeFloor === f;
    };

    const registerRef = (key: string, obj: THREE.Object3D) => {
      selectedObjectMap.set(key, obj);
    };

    if (!model.hasProperty) {
      // Render faint property drop guide outline on ground
      const guideGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(28, 0.1, 22));
      const guide = new THREE.LineSegments(
        guideGeo,
        new THREE.LineBasicMaterial({ color: '#3b82f6', transparent: true, opacity: 0.5 })
      );
      guide.position.y = 0.05;
      houseRoot.add(guide);
      engine.requestRender();
      return;
    }

    // 1. Property Compound Yard & Perimeter Wall (with gate cutouts!)
    const yardGroup = new THREE.Group();
    const yardMat = new THREE.MeshStandardMaterial({
      color: '#d6d3cd',
      map: texPool.concrete,
      roughness: 0.9,
      metalness: 0.04,
    });
    const yardSlab = new THREE.Mesh(
      new THREE.BoxGeometry(model.width, 0.16, model.depth),
      yardMat
    );
    yardSlab.position.y = -0.09;
    yardSlab.receiveShadow = true;
    tagGroupSelection(yardSlab, { type: 'property' });
    yardGroup.add(yardSlab);
    registerRef('property', yardSlab);

    // Perimeter fence/wall with gate gap cutouts along south/north/east/west
    const pMat = createArchitecturalMaterial(
      model.perimeterMaterial,
      model.perimeterColor,
      texPool,
      isSoftwareGl
    );
    const pH = Math.max(1.2, model.perimeterHeight);
    const wallT = 0.28;
    const hw = model.width / 2;
    const hd = model.depth / 2;

    const perimeterGates = model.facilities.filter(
      (f) => f.kind === 'door' && f.mountSurface === 'perimeter'
    );

    const buildPerimeterEdge = (
      side: 'north' | 'south' | 'east' | 'west',
      length: number
    ) => {
      const gatesOnSide = perimeterGates.filter((g) => {
        if (g.wallSide) return g.wallSide === side;
        if (side === 'south') return g.z >= hd - 1.5;
        if (side === 'north') return g.z <= -hd + 1.5;
        if (side === 'east') return g.x >= hw - 1.5;
        return g.x <= -hw + 1.5;
      });

      const gaps = gatesOnSide
        .map((g) => {
          const coord = side === 'north' || side === 'south' ? g.x : g.z;
          return { min: coord - 1.85, max: coord + 1.85 };
        })
        .sort((a, b) => a.min - b.min);

      let cursor = -length / 2;
      const segments: [number, number][] = [];
      gaps.forEach((gap) => {
        if (gap.min > cursor + 0.3) segments.push([cursor, Math.min(length / 2, gap.min)]);
        cursor = Math.max(cursor, gap.max);
      });
      if (cursor < length / 2 - 0.3) segments.push([cursor, length / 2]);

      segments.forEach(([a, b]) => {
        const segLen = b - a;
        if (segLen <= 0.2) return;
        const mid = (a + b) / 2;
        const isNS = side === 'north' || side === 'south';
        const geo = new THREE.BoxGeometry(isNS ? segLen : wallT, pH, isNS ? wallT : segLen);
        const wallMesh = new THREE.Mesh(geo, pMat);
        wallMesh.position.set(
          isNS ? mid : side === 'east' ? hw - wallT / 2 : -hw + wallT / 2,
          pH / 2,
          isNS ? (side === 'south' ? hd - wallT / 2 : -hd + wallT / 2) : mid
        );
        wallMesh.castShadow = !isSoftwareGl;
        wallMesh.receiveShadow = true;
        tagGroupSelection(wallMesh, { type: 'property' });
        yardGroup.add(wallMesh);
      });
    };

    buildPerimeterEdge('north', model.width);
    buildPerimeterEdge('south', model.width);
    buildPerimeterEdge('east', model.depth);
    buildPerimeterEdge('west', model.depth);
    floorGroups.ground.add(yardGroup);

    // 2. Grass Patches (offset Y = 0.02 cleanly above yard to avoid Z-fighting)
    model.grassPatches.forEach((gp) => {
      const grassMat = new THREE.MeshStandardMaterial({
        color: '#65a30d',
        map: texPool.grass,
        roughness: 0.94,
        metalness: 0.0,
      });
      const patch = new THREE.Mesh(new THREE.BoxGeometry(gp.width, 0.04, gp.depth), grassMat);
      patch.position.set(gp.x, 0.02, gp.z);
      patch.receiveShadow = true;
      tagGroupSelection(patch, { type: 'grass', id: gp.id });
      registerRef(`grass:${gp.id}`, patch);
      floorGroups.ground.add(patch);
    });

    // 3. Outdoor Sections (not attached to a building)
    model.sections
      .filter((s) => !s.buildingId)
      .forEach((sec) => {
        const secGrp = new THREE.Group();
        secGrp.position.set(sec.x, 0, sec.z);
        const patioMat = createArchitecturalMaterial('concrete', sec.color, texPool, isSoftwareGl);
        const pad = new THREE.Mesh(new THREE.BoxGeometry(sec.width, 0.05, sec.depth), patioMat);
        pad.position.y = 0.025;
        pad.receiveShadow = true;
        secGrp.add(pad);

        if (sec.hasRailing) {
          const rN = buildRailingRun(sec.width, 0.95, sec.railingMaterial, texPool, isSoftwareGl);
          rN.position.set(0, 0.05, -sec.depth / 2);
          const rW = buildRailingRun(sec.depth, 0.95, sec.railingMaterial, texPool, isSoftwareGl);
          rW.rotation.y = Math.PI / 2;
          rW.position.set(-sec.width / 2, 0.05, 0);
          const rE = rW.clone();
          rE.position.x = sec.width / 2;
          secGrp.add(rN, rW, rE);
        }

        tagGroupSelection(secGrp, { type: 'section', id: sec.id });
        registerRef(`section:${sec.id}`, secGrp);
        floorGroups.ground.add(secGrp);
      });

    // 4. Pools (tied to a section)
    model.pools.forEach((pool) => {
      const pGrp = buildPoolGroup(pool, texPool, isSoftwareGl);
      pGrp.position.set(pool.x, 0.01, pool.z);
      const waterMesh = pGrp.getObjectByName('pool-water-surface') as THREE.Mesh | undefined;
      if (waterMesh) engine.waterMeshes.push(waterMesh);
      registerRef(`pool:${pool.id}`, pGrp);
      floorGroups.ground.add(pGrp);
    });

    // 5. Scaffolds inside compound
    model.scaffolds.forEach((scaf) => {
      const sGrp = buildScaffoldGroup(scaf, texPool, isSoftwareGl);
      sGrp.position.set(scaf.x, 0, scaf.z);
      registerRef(`scaffold:${scaf.id}`, sGrp);
      floorGroups.ground.add(sGrp);
    });

    // 6. Buildings & 3 Floors (Underground, Ground, Top)
    const buildBuildingFloor = (bld: Building3D, floor: FloorLevel) => {
      if (!bld.floors.includes(floor) || !showFloor(floor)) return;

      const fh = bld.floorHeight || 3.2;
      const baseY = getFloorBaseY(floor, fh);
      const floorGrp = new THREE.Group();
      floorGrp.position.set(bld.x, baseY, bld.z);

      const slabMat = createArchitecturalMaterial(
        floor === 'underground' ? 'concrete' : bld.wallMaterial,
        floor === 'underground' ? '#94a3b8' : '#e2ddd3',
        texPool,
        isSoftwareGl
      );

      // Slabs & Openings cutouts on this floor
      const floorOpenings = model.openings.filter(
        (o) => o.buildingId === bld.id && o.floor === floor
      );
      const floorSlabs = model.slabs.filter(
        (s) => s.buildingId === bld.id && s.floor === floor
      );

      // Half-length slabs reduce effective floor span or create open stairwell voids
      const halfSlabCutouts = floorSlabs
        .filter((s) => s.isHalfLength)
        .map((s) => ({ x: s.x, z: s.z, width: s.width, depth: s.depth }));
      const allCutouts = [
        ...floorOpenings.map((o) => ({ x: o.x, z: o.z, width: o.width, depth: o.depth })),
        ...halfSlabCutouts,
      ];

      const slabMesh = buildSlottedFloorSlab(
        bld.width,
        bld.depth,
        allCutouts,
        slabMat,
        isSoftwareGl
      );
      tagGroupSelection(slabMesh, { type: 'building', id: bld.id });
      floorGrp.add(slabMesh);

      // Highlight rims + optional Glass railings around Openings & Slabs
      floorOpenings.forEach((op) => {
        const opGroup = new THREE.Group();
        opGroup.position.set(op.x, 0.02, op.z);

        const rimGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(op.width, 0.24, op.depth));
        const rim = new THREE.LineSegments(
          rimGeo,
          new THREE.LineBasicMaterial({ color: '#0284c7' })
        );
        rim.position.y = -0.1;
        opGroup.add(rim);

        if (op.hasGlassRailing) {
          const rN = buildRailingRun(op.width, 0.92, op.railingMaterial, texPool, isSoftwareGl);
          rN.position.set(0, 0, -op.depth / 2);
          const rW = buildRailingRun(op.depth, 0.92, op.railingMaterial, texPool, isSoftwareGl);
          rW.rotation.y = Math.PI / 2;
          rW.position.set(-op.width / 2, 0, 0);
          const rE = rW.clone();
          rE.position.x = op.width / 2;
          opGroup.add(rN, rW, rE);
        }

        tagGroupSelection(opGroup, { type: 'opening', id: op.id });
        registerRef(`opening:${op.id}`, opGroup);
        floorGrp.add(opGroup);
      });

      floorSlabs.forEach((sl) => {
        const sMarker = new THREE.Mesh(
          new THREE.BoxGeometry(sl.width, 0.16, 0.22),
          createArchitecturalMaterial('concrete', '#cbd5e1', texPool, isSoftwareGl)
        );
        sMarker.position.set(sl.x, -0.08, sl.z - sl.depth / 2);
        tagGroupSelection(sMarker, { type: 'slab', id: sl.id });
        registerRef(`slab:${sl.id}`, sMarker);
        floorGrp.add(sMarker);
      });

      // Exterior Perimeter Walls of Building
      const wallH = cutaway ? Math.min(1.15, fh * 0.4) : fh - 0.22;
      const wallMat = createArchitecturalMaterial(
        floor === 'underground' ? 'concrete' : bld.wallMaterial,
        floor === 'underground' ? '#64748b' : bld.wallColor,
        texPool,
        isSoftwareGl,
        { cutaway: cutaway && floor !== 'underground' }
      );
      const wt = 0.22;
      const wN = new THREE.Mesh(new THREE.BoxGeometry(bld.width, wallH, wt), wallMat);
      wN.position.set(0, wallH / 2, -bld.depth / 2 + wt / 2);
      const wS = new THREE.Mesh(new THREE.BoxGeometry(bld.width, wallH, wt), wallMat);
      wS.position.set(0, wallH / 2, bld.depth / 2 - wt / 2);
      const wW = new THREE.Mesh(new THREE.BoxGeometry(wt, wallH, bld.depth - wt * 2), wallMat);
      wW.position.set(-bld.width / 2 + wt / 2, wallH / 2, 0);
      const wE = wW.clone();
      wE.position.x = bld.width / 2 - wt / 2;

      [wN, wS, wW, wE].forEach((wm) => {
        wm.castShadow = !isSoftwareGl && !cutaway;
        wm.receiveShadow = true;
        tagGroupSelection(wm, { type: 'building', id: bld.id });
        floorGrp.add(wm);
      });

      // Ground floor serves as ceiling for underground (plus Top floor ceiling / slab)
      if (floor === 'top' && !bld.floors.includes('top')) {
        // covered by roof
      }

      // Building-scoped Veranda deck & Railings
      if (bld.hasVeranda && (floor === 'ground' || floor === 'top')) {
        const vd = Math.max(1.5, bld.verandaDepth || 2.5);
        const vDeck = new THREE.Mesh(
          new THREE.BoxGeometry(bld.width + 0.4, 0.18, vd),
          createArchitecturalMaterial('wood', '#b6895b', texPool, isSoftwareGl)
        );
        vDeck.position.set(0, -0.09, bld.depth / 2 + vd / 2);
        vDeck.receiveShadow = true;
        tagGroupSelection(vDeck, { type: 'building', id: bld.id });
        floorGrp.add(vDeck);

        const railFront = buildRailingRun(
          bld.width + 0.3,
          0.95,
          bld.railingMaterial,
          texPool,
          isSoftwareGl
        );
        railFront.position.set(0, 0, bld.depth / 2 + vd - 0.05);
        const railL = buildRailingRun(vd, 0.95, bld.railingMaterial, texPool, isSoftwareGl);
        railL.rotation.y = Math.PI / 2;
        railL.position.set(-bld.width / 2 - 0.15, 0, bld.depth / 2 + vd / 2);
        const railR = railL.clone();
        railR.position.x = bld.width / 2 + 0.15;
        floorGrp.add(railFront, railL, railR);
      }

      // Sections inside this building floor
      model.sections
        .filter((s) => s.buildingId === bld.id && s.floor === floor)
        .forEach((sec) => {
          const secMesh = new THREE.Mesh(
            new THREE.BoxGeometry(sec.width, 0.025, sec.depth),
            new THREE.MeshStandardMaterial({
              color: sec.color || '#e2e8f0',
              roughness: 0.85,
              transparent: true,
              opacity: 0.45,
            })
          );
          secMesh.position.set(sec.x, 0.015, sec.z);
          tagGroupSelection(secMesh, { type: 'section', id: sec.id });
          registerRef(`section:${sec.id}`, secMesh);
          floorGrp.add(secMesh);
        });

      // Rooms inside this building floor
      model.rooms
        .filter((r) => r.buildingId === bld.id && r.floor === floor)
        .forEach((room) => {
          const roomGrp = new THREE.Group();
          roomGrp.position.set(room.x, 0, room.z);

          // Offset floor surface +0.025 above slab to prevent Z-fighting
          const rFloorMat = new THREE.MeshStandardMaterial({
            color: room.floorColor || '#cbd5e1',
            map: texPool.tile,
            roughness: 0.65,
          });
          const rFloor = new THREE.Mesh(
            new THREE.BoxGeometry(room.width, 0.03, room.depth),
            rFloorMat
          );
          rFloor.position.y = 0.025;
          rFloor.receiveShadow = true;
          roomGrp.add(rFloor);

          // Interior partition walls (slightly lower than outer wall for clarity in cutaway)
          const rwH = cutaway ? Math.min(1.05, fh * 0.35) : fh - 0.28;
          const rwMat = createArchitecturalMaterial(
            room.wallMaterial,
            room.wallColor,
            texPool,
            isSoftwareGl,
            { cutaway }
          );
          const rwT = 0.12;
          const rwN = new THREE.Mesh(new THREE.BoxGeometry(room.width, rwH, rwT), rwMat);
          rwN.position.set(0, rwH / 2, -room.depth / 2 + rwT / 2);
          const rwS = rwN.clone();
          rwS.position.z = room.depth / 2 - rwT / 2;
          const rwW = new THREE.Mesh(new THREE.BoxGeometry(rwT, rwH, room.depth), rwMat);
          rwW.position.set(-room.width / 2 + rwT / 2, rwH / 2, 0);
          const rwE = rwW.clone();
          rwE.position.x = room.width / 2 - rwT / 2;
          roomGrp.add(rwN, rwS, rwW, rwE);

          tagGroupSelection(roomGrp, { type: 'room', id: room.id });
          registerRef(`room:${room.id}`, roomGrp);
          floorGrp.add(roomGrp);
        });

      // Staircases starting from this floor
      model.staircases
        .filter((st) => st.buildingId === bld.id && st.fromFloor === floor)
        .forEach((st) => {
          const stGrp = buildStaircaseGroup(st, fh, texPool, isSoftwareGl);
          stGrp.position.set(st.x, 0, st.z);
          registerRef(`staircase:${st.id}`, stGrp);
          floorGrp.add(stGrp);
        });

      // Cylinder Support Columns on this floor
      model.supports
        .filter((col) => col.buildingId === bld.id && col.floor === floor)
        .forEach((col) => {
          const colGrp = buildCylinderSupportGroup(col, texPool, isSoftwareGl);
          colGrp.position.set(col.x, 0, col.z);
          registerRef(`support:${col.id}`, colGrp);
          floorGrp.add(colGrp);
        });

      registerRef(`building:${bld.id}`, floorGrp);
      floorGroups[floor].add(floorGrp);
    };

    model.buildings.forEach((bld) => {
      buildBuildingFloor(bld, 'underground');
      buildBuildingFloor(bld, 'ground');
      buildBuildingFloor(bld, 'top');

      // Compound Cylinder Supports not inside a building
      // Roof mounted atop highest floor
      const topFloorPresent = bld.floors.includes('top');
      if (activeFloor === 'all' || (activeFloor === 'top' && topFloorPresent) || (activeFloor === 'ground' && !topFloorPresent)) {
        const highestY = (topFloorPresent ? bld.floorHeight : 0) + bld.floorHeight;
        const rGrp = buildRoofGroup(bld, bld.roof, texPool, isSoftwareGl, cutaway);
        rGrp.position.set(bld.x, highestY - 0.12, bld.z);
        roofGroups.add(rGrp);
      }
    });

    // Free compound Cylinder Supports
    model.supports
      .filter((col) => !col.buildingId)
      .forEach((col) => {
        if (!showFloor(col.floor)) return;
        const colGrp = buildCylinderSupportGroup(col, texPool, isSoftwareGl);
        colGrp.position.set(col.x, 0, col.z);
        registerRef(`support:${col.id}`, colGrp);
        floorGroups[col.floor].add(colGrp);
      });

    // 7. Facilities (Doors/Gates, Windows, Cameras, Lights, Power Outlets, External Sensors)
    model.facilities.forEach((fac) => {
      if (!showFloor(fac.floor)) return;
      const fGrp = buildFacilityGroup(fac, texPool, isSoftwareGl);
      const { y } = getFacilityWorldPosition(fac, model);
      fGrp.position.set(fac.x, y, fac.z);
      registerRef(`facility:${fac.id}`, fGrp);
      if (fac.mountSurface === 'roof') {
        roofGroups.add(fGrp);
      } else {
        floorGroups[fac.floor].add(fGrp);
      }
    });

    // 8. Utilities (Water Tanks attach atop Scaffolds, others anywhere on property/section/room)
    model.utilities.forEach((util) => {
      if (!showFloor(util.floor)) return;
      const uGrp = buildUtilityGroup(util, isSoftwareGl);
      let uy = getFloorBaseY(util.floor, 3.2);
      let ux = util.x;
      let uz = util.z;

      if (util.targetScope === 'scaffold' && util.targetId) {
        const scaf = model.scaffolds.find((s) => s.id === util.targetId);
        if (scaf) {
          ux = scaf.x;
          uz = scaf.z;
          uy = scaf.height;
        }
      } else if (util.buildingId && util.floor === 'top') {
        const bld = model.buildings.find((b) => b.id === util.buildingId);
        if (bld && util.kind === 'solar_panel') {
          uy = (bld.floors.includes('top') ? bld.floorHeight : 0) + bld.floorHeight + bld.roof.height * 0.45;
        }
      }

      uGrp.position.set(ux, uy, uz);
      registerRef(`utility:${util.id}`, uGrp);
      if (util.kind === 'solar_panel' && util.buildingId) {
        roofGroups.add(uGrp);
      } else {
        floorGroups[util.floor].add(uGrp);
      }
    });

    // 9. Selection Bounding Highlight
    if (selectedItem) {
      const selKey =
        selectedItem.type === 'property'
          ? 'property'
          : `${selectedItem.type}:${selectedItem.id}`;
      const targetObj = selectedObjectMap.get(selKey);
      if (targetObj) {
        const box = new THREE.Box3().setFromObject(targetObj);
        if (!box.isEmpty()) {
          const helper = new THREE.Box3Helper(box, new THREE.Color('#38bdf8'));
          houseRoot.add(helper);
          engine.selectionBox = helper;
        }
      }
    }

    engine.requestRender();
  }, [model, activeFloor, cutaway, selectedItem]);

  // Handle drag-and-drop directly onto 3D canvas
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes('application/x-hansson-3d')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const raw = e.dataTransfer.getData('application/x-hansson-3d');
    if (!raw || !engineRef.current || !onDropRef.current) return;
    e.preventDefault();
    try {
      const payload = JSON.parse(raw) as PaletteDragPayload;
      const { renderer, camera } = engineRef.current;
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(ndc, camera);
      const activeY =
        activeFloorRef.current === 'top'
          ? 3.2
          : activeFloorRef.current === 'underground'
          ? -3.2
          : 0;
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -activeY);
      const hitPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, hitPoint)) {
        onDropRef.current(payload, Number(hitPoint.x.toFixed(1)), Number(hitPoint.z.toFixed(1)));
      } else {
        onDropRef.current(payload, 0, 0);
      }
    } catch {
      // ignore invalid drag payload
    }
  };

  return (
    <div
      ref={mountRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="w-full h-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
    />
  );
};
