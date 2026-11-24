import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Device } from '../../types';
import {
  SpatialBuildingDto,
  SpatialDraftPreview,
  SpatialDragPayload,
  SpatialFloorDto,
  SpatialGeometryDto,
  SpatialGeometryKind,
  SpatialNodeKind,
  SpatialOpeningDto,
  SpatialOpeningKind,
  SpatialPlacementDto,
  SpatialSceneDto,
  SpatialTargetKind,
  ViewportRenderMode,
  ViewportToolMode,
} from '../../types/spatial';
import {
  buildGeometryObject,
  buildPlacementObject,
  buildSampledPolygonPoints,
  computeGeometryBounds,
  disposeObject3D,
  extractWallMeta,
  getSpatialThemePalette,
  safeParseJson,
} from './SpatialGeometryBuilders';

export type TransformGizmoMode = 'translate' | 'rotate' | 'scale';

export interface SpatialSelectionTarget {
  key: string;
  entityType: 'geometry' | 'placement';
  id: number;
  name: string;
  geometry?: SpatialGeometryDto;
  placement?: SpatialPlacementDto;
}

export interface WallDropHit {
  wallGeometry: SpatialGeometryDto;
  offsetAlongWall: number;
  sillHeight: number;
  worldPosition: [number, number, number];
  quaternion: [number, number, number, number];
}

export interface ResizeGeometryUpdate {
  geometry: SpatialGeometryDto;
  points: [number, number, number][];
  width: number;
  depth: number;
  length?: number;
}

export type CameraPresetMode = 'homeCore' | 'fitAll' | 'topPlan' | 'iso';

interface SpatialViewportProps {
  isOpen?: boolean;
  theme: 'light' | 'dark';
  sceneData: SpatialSceneDto | null;
  devices: Device[];
  visibleFloors: Record<number, boolean>;
  activeFloorElevation: number;
  selectedKey: string | null;
  gizmoMode: TransformGizmoMode;
  toolMode: ViewportToolMode;
  renderMode?: ViewportRenderMode;
  roomNames?: Record<number, string>;
  gridSnap: boolean;
  activeDragPayload: SpatialDragPayload | null;
  draftPreview?: SpatialDraftPreview | null;
  resetCameraNonce: number;
  cameraPresetRequest?: { mode: CameraPresetMode; nonce: number } | null;
  onSelect: (target: SpatialSelectionTarget | null) => void;
  onPlacementTransformed: (
    placement: SpatialPlacementDto,
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
  ) => void;
  onDrawWallComplete?: (start: [number, number, number], end: [number, number, number]) => void;
  onDrawRoomBoxComplete?: (bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    elevationY: number;
  }) => void;
  onDropPayload?: (
    payload: SpatialDragPayload,
    dropTarget: {
      floorPoint: [number, number, number];
      wallHit?: WallDropHit | null;
    }
  ) => void;
  onGeometryResized?: (update: ResizeGeometryUpdate) => void;
}

const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _hitPt = new THREE.Vector3();

function snapCoord(val: number, enabled: boolean, step = 0.25): number {
  if (!enabled) return Math.round(val * 100) / 100;
  return Math.round(val / step) * step;
}

export function SpatialViewport({
  isOpen = true,
  theme,
  sceneData,
  devices,
  visibleFloors,
  activeFloorElevation,
  selectedKey,
  gizmoMode,
  toolMode,
  renderMode = 'realistic',
  roomNames,
  gridSnap,
  activeDragPayload,
  draftPreview = null,
  resetCameraNonce,
  cameraPresetRequest = null,
  onSelect,
  onPlacementTransformed,
  onDrawWallComplete,
  onDrawRoomBoxComplete,
  onDropPayload,
  onGeometryResized,
}: SpatialViewportProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = React.useState(false);
  const [liveHudBadge, setLiveHudBadge] = React.useState<string | null>(null);

  const refs = React.useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    orbit: OrbitControls | null;
    transform: TransformControls | null;
    transformHelper: THREE.Object3D | null;
    propertyRoot: THREE.Group | null;
    overlayGroup: THREE.Group | null;
    draftGroup: THREE.Group | null;
    cursorGroup: THREE.Group | null;
    handlesGroup: THREE.Group | null;
    grid: THREE.GridHelper | null;
    axes: THREE.AxesHelper | null;
    envRT: THREE.WebGLRenderTarget | null;
    isSoftwareGl: boolean;
    needsRender: boolean;
    rafId: number | null;
    selectables: THREE.Object3D[];
    wallObjects: THREE.Object3D[];
    handleObjects: THREE.Object3D[];
    selectedPlacementOriginal?: SpatialPlacementDto;
  }>({
    renderer: null,
    scene: null,
    camera: null,
    orbit: null,
    transform: null,
    transformHelper: null,
    propertyRoot: null,
    overlayGroup: null,
    draftGroup: null,
    cursorGroup: null,
    handlesGroup: null,
    grid: null,
    axes: null,
    envRT: null,
    isSoftwareGl: false,
    needsRender: true,
    rafId: null,
    selectables: [],
    wallObjects: [],
    handleObjects: [],
  });

  // Latest props in refs so Three.js event listeners never hold stale closures
  const onSelectRef = React.useRef(onSelect);
  onSelectRef.current = onSelect;
  const onTransformRef = React.useRef(onPlacementTransformed);
  onTransformRef.current = onPlacementTransformed;
  const onDrawWallRef = React.useRef(onDrawWallComplete);
  onDrawWallRef.current = onDrawWallComplete;
  const onDrawRoomBoxRef = React.useRef(onDrawRoomBoxComplete);
  onDrawRoomBoxRef.current = onDrawRoomBoxComplete;
  const onDropPayloadRef = React.useRef(onDropPayload);
  onDropPayloadRef.current = onDropPayload;
  const onGeometryResizedRef = React.useRef(onGeometryResized);
  onGeometryResizedRef.current = onGeometryResized;

  const isOpenRef = React.useRef(isOpen);
  isOpenRef.current = isOpen;
  const toolModeRef = React.useRef(toolMode);
  toolModeRef.current = toolMode;
  const floorElevRef = React.useRef(activeFloorElevation);
  floorElevRef.current = activeFloorElevation;
  const gridSnapRef = React.useRef(gridSnap);
  gridSnapRef.current = gridSnap;
  const themeRef = React.useRef(theme);
  themeRef.current = theme;
  const activeDragRef = React.useRef(activeDragPayload);
  activeDragRef.current = activeDragPayload;
  const sceneDataRef = React.useRef(sceneData);
  sceneDataRef.current = sceneData;
  const framedPropertyIdRef = React.useRef<number | null>(null);

  // Interactive drawing / handle resize transient state
  const interactionRef = React.useRef<{
    mode: 'none' | 'drawWall' | 'drawRoomBox' | 'resizeHandle';
    startPt: [number, number, number] | null;
    currentPt: [number, number, number] | null;
    resizeMeta?: {
      geometry: SpatialGeometryDto;
      handleKind: 'corner' | 'wallStart' | 'wallEnd';
      anchorX?: number;
      anchorZ?: number;
      otherEnd?: [number, number, number];
      elevY: number;
    };
  }>({
    mode: 'none',
    startPt: null,
    currentPt: null,
  });

  const requestRender = React.useCallback(() => {
    if (!isOpenRef.current) return;
    const state = refs.current;
    state.needsRender = true;
    if (state.rafId !== null) return;
    state.rafId = requestAnimationFrame(() => {
      state.rafId = null;
      if (!isOpenRef.current) return;
      const { renderer, scene, camera, orbit, isSoftwareGl } = refs.current;
      if (!renderer || !scene || !camera) return;
      const orbitMoving = orbit && !isSoftwareGl ? orbit.update() : false;
      renderer.render(scene, camera);
      if (isSoftwareGl) {
        try {
          renderer.getContext().finish();
        } catch {
          // ignore
        }
      }
      if (orbitMoving || refs.current.needsRender) {
        refs.current.needsRender = false;
        if (orbitMoving) requestRender();
      }
    });
  }, []);

  const projectPointerToFloor = React.useCallback(
    (clientX: number, clientY: number): [number, number, number] | null => {
      const { renderer, camera } = refs.current;
      if (!renderer || !camera) return null;
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      _ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_ndc, camera);
      const y = floorElevRef.current || 0;
      _plane.set(new THREE.Vector3(0, 1, 0), -y);
      const hit = _raycaster.ray.intersectPlane(_plane, _hitPt);
      if (!hit) return null;
      // Guard against shallow horizon rays producing faraway coordinates
      const clampedX = Math.max(-40, Math.min(40, hit.x));
      const clampedZ = Math.max(-40, Math.min(40, hit.z));
      const snap = gridSnapRef.current;
      return [snapCoord(clampedX, snap), Math.round(y * 100) / 100, snapCoord(clampedZ, snap)];
    },
    []
  );

  const raycastWalls = React.useCallback(
    (clientX: number, clientY: number): WallDropHit | null => {
      const { renderer, camera, wallObjects } = refs.current;
      if (!renderer || !camera || wallObjects.length === 0) return null;
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      _ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_ndc, camera);
      const hits = _raycaster.intersectObjects(wallObjects, true);
      if (hits.length === 0) return null;

      let cur: THREE.Object3D | null = hits[0].object;
      while (cur && !cur.userData?.isWall) {
        cur = cur.parent;
      }
      if (!cur || !cur.userData?.data || !cur.userData?.wallMeta) return null;

      const geom = cur.userData.data as SpatialGeometryDto;
      const meta = cur.userData.wallMeta as NonNullable<ReturnType<typeof extractWallMeta>>;
      const pt = hits[0].point;

      const ax = meta.start[0];
      const az = meta.start[2];
      const bx = meta.end[0];
      const bz = meta.end[2];
      const dx = bx - ax;
      const dz = bz - az;
      const len = Math.hypot(dx, dz) || 1;
      const ux = dx / len;
      const uz = dz / len;

      const proj = (pt.x - ax) * ux + (pt.z - az) * uz;
      const clampedOffset = snapCoord(
        Math.max(0.15, Math.min(len - 0.15, proj)),
        gridSnapRef.current,
        0.1
      );
      const wx = ax + ux * clampedOffset;
      const wz = az + uz * clampedOffset;
      const relY = Math.max(0, Math.min(meta.height - 0.4, pt.y - meta.elevationY));
      const quat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        meta.angleRad
      );

      return {
        wallGeometry: geom,
        offsetAlongWall: clampedOffset,
        sillHeight: Math.round(relY * 100) / 100,
        worldPosition: [
          Math.round(wx * 1000) / 1000,
          Math.round((meta.elevationY + relY) * 1000) / 1000,
          Math.round(wz * 1000) / 1000,
        ],
        quaternion: [
          Math.round(quat.x * 10000) / 10000,
          Math.round(quat.y * 10000) / 10000,
          Math.round(quat.z * 10000) / 10000,
          Math.round(quat.w * 10000) / 10000,
        ],
      };
    },
    []
  );

  const clearOverlayPreview = React.useCallback(() => {
    const ov = refs.current.overlayGroup;
    if (ov) {
      disposeObject3D(ov);
      ov.clear();
    }
  }, []);

  const renderFloorCursor = React.useCallback(
    (pt: [number, number, number] | null, color = 0x0ea5e9) => {
      const cur = refs.current.cursorGroup;
      if (!cur) return;
      disposeObject3D(cur);
      cur.clear();
      if (!pt) {
        requestRender();
        return;
      }
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.16, 0.24, 24),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(pt[0], pt[1] + 0.02, pt[2]);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.55, 8),
        new THREE.MeshBasicMaterial({ color })
      );
      stem.position.set(pt[0], pt[1] + 0.28, pt[2]);

      cur.add(ring, stem);
      requestRender();
    },
    [requestRender]
  );

  const renderGhostWall = React.useCallback(
    (start: [number, number, number], end: [number, number, number], height = 2.8, thickness = 0.18) => {
      const ov = refs.current.overlayGroup;
      if (!ov) return;
      disposeObject3D(ov);
      ov.clear();

      const dx = end[0] - start[0];
      const dz = end[2] - start[2];
      const len = Math.hypot(dx, dz);

      // Always show bright start marker
      const startMarker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16),
        new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })
      );
      startMarker.position.set(start[0], start[1] + 0.06, start[2]);
      ov.add(startMarker);

      if (len < 0.05) {
        requestRender();
        return;
      }

      const palette = getSpatialThemePalette(themeRef.current);
      const geo = new THREE.BoxGeometry(len, height, thickness);
      const mat = new THREE.MeshStandardMaterial({
        color: palette.outlineBeam,
        emissive: palette.outlineBeam,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.65,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (start[0] + end[0]) * 0.5,
        start[1] + height * 0.5,
        (start[2] + end[2]) * 0.5
      );
      mesh.rotation.y = -Math.atan2(dz, dx);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: palette.objectEdge })
      );
      edges.position.copy(mesh.position);
      edges.rotation.copy(mesh.rotation);

      const endMarker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      endMarker.position.set(end[0], end[1] + 0.06, end[2]);

      ov.add(mesh, edges, endMarker);
      requestRender();
    },
    [requestRender]
  );

  const renderGhostBox = React.useCallback(
    (
      minX: number,
      maxX: number,
      minZ: number,
      maxZ: number,
      elevY: number,
      height = 2.8,
      color = 0x10b981
    ) => {
      const ov = refs.current.overlayGroup;
      if (!ov) return;
      disposeObject3D(ov);
      ov.clear();

      const palette = getSpatialThemePalette(themeRef.current);
      const w = Math.max(0.2, Math.abs(maxX - minX));
      const d = Math.max(0.2, Math.abs(maxZ - minZ));
      const cx = (minX + maxX) * 0.5;
      const cz = (minZ + maxZ) * 0.5;

      const geo = new THREE.BoxGeometry(w, height, d);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cx, elevY + height * 0.5, cz);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: palette.objectEdge })
      );
      edges.position.copy(mesh.position);
      ov.add(mesh, edges);
      requestRender();
    },
    [requestRender]
  );

  const renderGhostPlacement = React.useCallback(
    (
      pos: [number, number, number],
      quat: [number, number, number, number],
      dims: [number, number, number],
      color = 0x38bdf8
    ) => {
      const ov = refs.current.overlayGroup;
      if (!ov) return;
      disposeObject3D(ov);
      ov.clear();

      const geo = new THREE.BoxGeometry(dims[0], dims[1], dims[2]);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.6,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.quaternion.set(quat[0], quat[1], quat[2], quat[3]);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0xffffff })
      );
      edges.position.copy(mesh.position);
      edges.quaternion.copy(mesh.quaternion);
      ov.add(mesh, edges);
      requestRender();
    },
    [requestRender]
  );

  // Initialize Three.js renderer, scene, camera, OrbitControls, TransformControls
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 240);

    // Probe Software WebGL safely per Three.js skill standards
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    let envTex: THREE.WebGLRenderTarget | null = null;
    if (!isSoftwareGl) {
      try {
        const pmrem = new THREE.PMREMGenerator(renderer);
        envTex = pmrem.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = envTex.texture;
        pmrem.dispose();
      } catch {
        envTex = null;
      }
    }

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(11, 8.5, 11);

    // Ambient + Three-point warm/cool architectural lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.42);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xf8fafc, 0x334155, 0.8);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.35);
    keyLight.position.set(14, 22, 12);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 75;
    const d = 22;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.45);
    rimLight.position.set(-12, 10, -14);
    scene.add(rimLight);

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = !isSoftwareGl;
    orbit.dampingFactor = 0.07;
    orbit.maxPolarAngle = Math.PI * 0.85;
    orbit.minDistance = 1.5;
    orbit.maxDistance = 160;
    orbit.target.set(0, 1.2, 0);
    orbit.addEventListener('change', requestRender);

    const transform = new TransformControls(camera, renderer.domElement);
    transform.setSize(0.85);
    const helper = transform.getHelper();
    scene.add(helper);

    transform.addEventListener('change', requestRender);
    transform.addEventListener('dragging-changed', (ev: any) => {
      orbit.enabled = !ev.value;
      if (!ev.value && transform.object && refs.current.selectedPlacementOriginal) {
        const obj = transform.object;
        const orig = refs.current.selectedPlacementOriginal;
        const round3 = (n: number) => Math.round(n * 1000) / 1000;
        const round4 = (n: number) => Math.round(n * 10000) / 10000;
        onTransformRef.current(orig, {
          positionX: round3(obj.position.x),
          positionY: round3(obj.position.y),
          positionZ: round3(obj.position.z),
          rotationX: round4(obj.quaternion.x),
          rotationY: round4(obj.quaternion.y),
          rotationZ: round4(obj.quaternion.z),
          rotationW: round4(obj.quaternion.w),
          scaleX: round3(obj.scale.x),
          scaleY: round3(obj.scale.y),
          scaleZ: round3(obj.scale.z),
        });
      }
    });

    const propertyRoot = new THREE.Group();
    propertyRoot.name = 'property-world-root';
    scene.add(propertyRoot);

    const overlayGroup = new THREE.Group();
    overlayGroup.name = 'interactive-ghost-overlay';
    scene.add(overlayGroup);

    const draftGroup = new THREE.Group();
    draftGroup.name = 'live-form-draft-preview';
    scene.add(draftGroup);

    const cursorGroup = new THREE.Group();
    cursorGroup.name = 'live-floor-cursor';
    scene.add(cursorGroup);

    const handlesGroup = new THREE.Group();
    handlesGroup.name = 'interactive-resize-handles';
    scene.add(handlesGroup);

    refs.current = {
      ...refs.current,
      renderer,
      scene,
      camera,
      orbit,
      transform,
      transformHelper: helper,
      propertyRoot,
      overlayGroup,
      draftGroup,
      cursorGroup,
      handlesGroup,
      envRT: envTex,
      isSoftwareGl,
      needsRender: true,
    };

    // Click, Drag-to-Draw (Wall / RoomBox), and Corner Handle Resizing
    let downPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };

      if (e.button !== 0 || (transform as any).dragging) return;

      // 1. Check 3D Resize Handles first when in select mode (runs in capture phase before OrbitControls)
      if (toolModeRef.current === 'select' && refs.current.handleObjects.length > 0) {
        const rect = renderer.domElement.getBoundingClientRect();
        _ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        _ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        _raycaster.setFromCamera(_ndc, camera);
        const hHits = _raycaster.intersectObjects(refs.current.handleObjects, false);
        if (hHits.length > 0) {
          const ud = hHits[0].object.userData;
          orbit.enabled = false;
          interactionRef.current = {
            mode: 'resizeHandle',
            startPt: [hHits[0].point.x, ud.elevY, hHits[0].point.z],
            currentPt: [hHits[0].point.x, ud.elevY, hHits[0].point.z],
            resizeMeta: {
              geometry: ud.geometry,
              handleKind: ud.handleKind,
              anchorX: ud.anchorX,
              anchorZ: ud.anchorZ,
              otherEnd: ud.otherEnd,
              elevY: ud.elevY ?? 0,
            },
          };
          e.stopImmediatePropagation();
          e.preventDefault();
          return;
        }
      }

      // 2. Direct Drag-to-Draw Wall or Room/Section Box (intercept before OrbitControls!)
      if (toolModeRef.current === 'drawWall' || toolModeRef.current === 'drawRoomBox') {
        const pt = projectPointerToFloor(e.clientX, e.clientY);
        if (pt) {
          orbit.enabled = false;
          interactionRef.current = {
            mode: toolModeRef.current,
            startPt: pt,
            currentPt: pt,
          };
          if (toolModeRef.current === 'drawWall') {
            renderGhostWall(pt, pt);
            setLiveHudBadge(`Start Wall @ (${pt[0].toFixed(2)}, ${pt[2].toFixed(2)}) — drag to end point`);
          } else {
            renderGhostBox(pt[0] - 0.1, pt[0] + 0.1, pt[2] - 0.1, pt[2] + 0.1, pt[1]);
            setLiveHudBadge(`Start Box @ (${pt[0].toFixed(2)}, ${pt[2].toFixed(2)}) — drag opposite corner`);
          }
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const tr = interactionRef.current;
      if (tr.mode === 'none') {
        // Hover cursor over resize handles or active floor grid when drawing
        if (toolModeRef.current === 'select' && refs.current.handleObjects.length > 0) {
          const rect = renderer.domElement.getBoundingClientRect();
          _ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          _ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          _raycaster.setFromCamera(_ndc, camera);
          const hits = _raycaster.intersectObjects(refs.current.handleObjects, false);
          renderer.domElement.style.cursor = hits.length > 0 ? 'grab' : '';
          renderFloorCursor(null);
        } else if (toolModeRef.current !== 'select') {
          renderer.domElement.style.cursor = 'crosshair';
          const rect = renderer.domElement.getBoundingClientRect();
          const inside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
          if (inside) {
            const pt = projectPointerToFloor(e.clientX, e.clientY);
            renderFloorCursor(pt, toolModeRef.current === 'drawWall' ? 0x0ea5e9 : 0x10b981);
            if (pt) {
              setLiveHudBadge(
                `${toolModeRef.current === 'drawWall' ? 'Draw Wall' : 'Draw Box'} @ X:${pt[0].toFixed(2)}m Z:${pt[2].toFixed(2)}m`
              );
            }
          } else {
            renderFloorCursor(null);
            setLiveHudBadge(null);
          }
        } else {
          renderer.domElement.style.cursor = '';
          renderFloorCursor(null);
        }
        return;
      }

      const pt = projectPointerToFloor(e.clientX, e.clientY);
      if (!pt || !tr.startPt) return;

      if (tr.mode === 'drawWall') {
        const endPt: [number, number, number] = [pt[0], pt[1], pt[2]];
        if (!e.shiftKey) {
          const dx = Math.abs(pt[0] - tr.startPt[0]);
          const dz = Math.abs(pt[2] - tr.startPt[2]);
          if (dx < 0.2 && dz > 0.4) endPt[0] = tr.startPt[0];
          else if (dz < 0.2 && dx > 0.4) endPt[2] = tr.startPt[2];
        }
        tr.currentPt = endPt;
        const len = Math.hypot(endPt[0] - tr.startPt[0], endPt[2] - tr.startPt[2]);
        setLiveHudBadge(`Wall Length: ${len.toFixed(2)}m`);
        renderGhostWall(tr.startPt, endPt);
      } else if (tr.mode === 'drawRoomBox') {
        tr.currentPt = pt;
        const w = Math.abs(pt[0] - tr.startPt[0]);
        const d = Math.abs(pt[2] - tr.startPt[2]);
        setLiveHudBadge(`Space Box: ${w.toFixed(2)}m × ${d.toFixed(2)}m (${(w * d).toFixed(1)} m²)`);
        renderGhostBox(
          Math.min(tr.startPt[0], pt[0]),
          Math.max(tr.startPt[0], pt[0]),
          Math.min(tr.startPt[2], pt[2]),
          Math.max(tr.startPt[2], pt[2]),
          tr.startPt[1]
        );
      } else if (tr.mode === 'resizeHandle' && tr.resizeMeta) {
        const rm = tr.resizeMeta;
        const nextPt: [number, number, number] = [pt[0], rm.elevY, pt[2]];
        tr.currentPt = nextPt;
        if (rm.handleKind === 'corner' && rm.anchorX !== undefined && rm.anchorZ !== undefined) {
          const w = Math.max(0.4, Math.abs(nextPt[0] - rm.anchorX));
          const d = Math.max(0.4, Math.abs(nextPt[2] - rm.anchorZ));
          setLiveHudBadge(`Resize Space: ${w.toFixed(2)}m × ${d.toFixed(2)}m`);
          renderGhostBox(
            Math.min(rm.anchorX, nextPt[0]),
            Math.max(rm.anchorX, nextPt[0]),
            Math.min(rm.anchorZ, nextPt[2]),
            Math.max(rm.anchorZ, nextPt[2]),
            rm.elevY,
            rm.geometry.height || 2.8,
            0xf59e0b
          );
        } else if (rm.otherEnd) {
          const len = Math.hypot(nextPt[0] - rm.otherEnd[0], nextPt[2] - rm.otherEnd[2]);
          setLiveHudBadge(`Resize Wall Length: ${len.toFixed(2)}m`);
          renderGhostWall(rm.otherEnd, nextPt, rm.geometry.height || 2.8, rm.geometry.thickness || 0.18);
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const tr = interactionRef.current;

      if (tr.mode === 'drawWall' && tr.startPt && tr.currentPt) {
        const len = Math.hypot(tr.currentPt[0] - tr.startPt[0], tr.currentPt[2] - tr.startPt[2]);
        clearOverlayPreview();
        setLiveHudBadge(null);
        orbit.enabled = true;
        if (len >= 0.35 && onDrawWallRef.current) {
          onDrawWallRef.current(tr.startPt, tr.currentPt);
        }
        interactionRef.current = { mode: 'none', startPt: null, currentPt: null };
        return;
      }

      if (tr.mode === 'drawRoomBox' && tr.startPt && tr.currentPt) {
        const w = Math.abs(tr.currentPt[0] - tr.startPt[0]);
        const d = Math.abs(tr.currentPt[2] - tr.startPt[2]);
        clearOverlayPreview();
        setLiveHudBadge(null);
        orbit.enabled = true;
        if (w >= 0.6 && d >= 0.6 && onDrawRoomBoxRef.current) {
          onDrawRoomBoxRef.current({
            minX: Math.min(tr.startPt[0], tr.currentPt[0]),
            maxX: Math.max(tr.startPt[0], tr.currentPt[0]),
            minZ: Math.min(tr.startPt[2], tr.currentPt[2]),
            maxZ: Math.max(tr.startPt[2], tr.currentPt[2]),
            elevationY: tr.startPt[1],
          });
        }
        interactionRef.current = { mode: 'none', startPt: null, currentPt: null };
        return;
      }

      if (tr.mode === 'resizeHandle' && tr.resizeMeta && tr.currentPt) {
        const rm = tr.resizeMeta;
        clearOverlayPreview();
        setLiveHudBadge(null);
        orbit.enabled = true;

        if (rm.handleKind === 'corner' && rm.anchorX !== undefined && rm.anchorZ !== undefined) {
          const minX = Math.min(rm.anchorX, tr.currentPt[0]);
          const maxX = Math.max(rm.anchorX, tr.currentPt[0]);
          const minZ = Math.min(rm.anchorZ, tr.currentPt[2]);
          const maxZ = Math.max(rm.anchorZ, tr.currentPt[2]);
          const w = Math.round(Math.max(0.4, maxX - minX) * 100) / 100;
          const d = Math.round(Math.max(0.4, maxZ - minZ) * 100) / 100;
          if (w >= 0.4 && d >= 0.4 && onGeometryResizedRef.current) {
            onGeometryResizedRef.current({
              geometry: rm.geometry,
              points: [
                [minX, rm.elevY, minZ],
                [maxX, rm.elevY, minZ],
                [maxX, rm.elevY, maxZ],
                [minX, rm.elevY, maxZ],
              ],
              width: w,
              depth: d,
            });
          }
        } else if (rm.otherEnd) {
          const pA = rm.handleKind === 'wallStart' ? tr.currentPt : rm.otherEnd;
          const pB = rm.handleKind === 'wallStart' ? rm.otherEnd : tr.currentPt;
          const len = Math.round(Math.hypot(pB[0] - pA[0], pB[2] - pA[2]) * 100) / 100;
          if (len >= 0.3 && onGeometryResizedRef.current) {
            onGeometryResizedRef.current({
              geometry: rm.geometry,
              points: [pA, pB],
              width: len,
              depth: rm.geometry.thickness || 0.18,
              length: len,
            });
          }
        }

        interactionRef.current = { mode: 'none', startPt: null, currentPt: null };
        return;
      }

      if ((transform as any).dragging) return;
      if (toolModeRef.current !== 'select') return;
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      _ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_ndc, camera);
      const hits = _raycaster.intersectObjects(refs.current.selectables, true);
      if (hits.length === 0) {
        onSelectRef.current(null);
        return;
      }

      let cur: THREE.Object3D | null = hits[0].object;
      while (cur && !cur.userData?.selectKey) {
        cur = cur.parent;
      }
      if (!cur || !cur.userData?.selectKey) {
        onSelectRef.current(null);
        return;
      }

      const ud = cur.userData;
      if (ud.entityType === 'placement') {
        const p = ud.data as SpatialPlacementDto;
        onSelectRef.current({
          key: ud.selectKey,
          entityType: 'placement',
          id: p.id,
          name: `Placement #${p.id}`,
          placement: p,
        });
      } else if (ud.entityType === 'geometry') {
        const g = ud.data as SpatialGeometryDto;
        onSelectRef.current({
          key: ud.selectKey,
          entityType: 'geometry',
          id: g.id,
          name: g.name || `Geometry #${g.id}`,
          geometry: g,
        });
      }
    };

    const onContextLost = (ev: Event) => {
      ev.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
      requestRender();
    };

    // Capture phase ensures draw tools and 3D resize handles intercept pointerdown before OrbitControls
    renderer.domElement.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const resizeObs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cw = entry.contentRect.width;
      const ch = entry.contentRect.height;
      if (cw <= 0 || ch <= 0) return;
      const w = Math.max(cw, 100);
      const h = Math.max(ch, 100);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObs.observe(container);

    requestRender();

    return () => {
      if (refs.current.rafId !== null) cancelAnimationFrame(refs.current.rafId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      transform.detach();
      transform.dispose();
      orbit.dispose();
      if (refs.current.grid) {
        refs.current.grid.geometry.dispose();
      }
      if (refs.current.axes) {
        refs.current.axes.geometry.dispose();
      }
      if (refs.current.overlayGroup) disposeObject3D(refs.current.overlayGroup);
      if (refs.current.draftGroup) disposeObject3D(refs.current.draftGroup);
      if (refs.current.cursorGroup) disposeObject3D(refs.current.cursorGroup);
      if (refs.current.handlesGroup) disposeObject3D(refs.current.handlesGroup);
      if (refs.current.propertyRoot) disposeObject3D(refs.current.propertyRoot);
      if (envTex) envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [clearOverlayPreview, projectPointerToFloor, renderFloorCursor, renderGhostBox, renderGhostWall, requestRender]);

  // Reserve LEFT drag for Draw Wall / Draw Box while still allowing Right-drag Orbit & Scroll Zoom
  React.useEffect(() => {
    const { orbit } = refs.current;
    if (!orbit) return;
    orbit.enabled = true;
    if (toolMode === 'select') {
      orbit.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      renderFloorCursor(null);
      setLiveHudBadge(null);
    } else {
      orbit.mouseButtons = {
        LEFT: undefined as unknown as THREE.MOUSE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
    }
    orbit.update();
  }, [toolMode, renderFloorCursor]);

  // Live 3D Draft Preview on the Grid while editing forms, dimensions, or room polygons
  React.useEffect(() => {
    const { draftGroup } = refs.current;
    if (!draftGroup) return;
    disposeObject3D(draftGroup);
    draftGroup.clear();

    if (!draftPreview) {
      requestRender();
      return;
    }

    const palette = getSpatialThemePalette(theme);
    const previewMat = new THREE.MeshStandardMaterial({
      color: palette.outlineBeam,
      emissive: palette.outlineBeam,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
    });
    const previewEdgeMat = new THREE.LineBasicMaterial({ color: palette.objectEdge });

    if (draftPreview.kind === 'wall') {
      const dx = draftPreview.x2 - draftPreview.x1;
      const dz = draftPreview.z2 - draftPreview.z1;
      const len = Math.hypot(dx, dz);
      if (len >= 0.05) {
        const h = Math.max(0.2, draftPreview.height || 2.8);
        const t = Math.max(0.05, draftPreview.thickness || 0.18);
        const geo = new THREE.BoxGeometry(len, h, t);
        const mesh = new THREE.Mesh(geo, previewMat);
        mesh.position.set(
          (draftPreview.x1 + draftPreview.x2) * 0.5,
          draftPreview.elevationY + h * 0.5,
          (draftPreview.z1 + draftPreview.z2) * 0.5
        );
        mesh.rotation.y = -Math.atan2(dz, dx);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), previewEdgeMat);
        edges.position.copy(mesh.position);
        edges.rotation.copy(mesh.rotation);
        draftGroup.add(mesh, edges);
      }
    } else if (draftPreview.kind === 'spaceBox') {
      const w = Math.max(0.2, draftPreview.width);
      const d = Math.max(0.2, draftPreview.depth);
      const h = Math.max(0.15, draftPreview.height || 2.8);
      const color = draftPreview.isVoid ? palette.voidLine : 0x10b981;
      const boxGeo = new THREE.BoxGeometry(w, h, d);
      const boxMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.28,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(boxGeo, boxMat);
      mesh.position.set(
        draftPreview.centerX,
        draftPreview.elevationY + h * 0.5,
        draftPreview.centerZ
      );
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(boxGeo),
        new THREE.LineBasicMaterial({ color: palette.objectEdge })
      );
      edges.position.copy(mesh.position);
      draftGroup.add(mesh, edges);
    } else if (draftPreview.kind === 'outline' && draftPreview.points.length >= 3) {
      const sampled = buildSampledPolygonPoints(draftPreview.points, draftPreview.segments);
      const h = Math.max(0.2, draftPreview.wallHeight || 2.8);
      const t = Math.max(0.05, draftPreview.wallThickness || 0.16);
      const elev = draftPreview.elevationY || 0;

      const baseBeamMat = new THREE.MeshBasicMaterial({ color: palette.outlineBeam });
      for (let i = 0; i < sampled.length; i++) {
        const a = sampled[i];
        const b = sampled[(i + 1) % sampled.length];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const len = Math.hypot(dx, dz);
        if (len < 0.04) continue;

        const baseBeam = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.06), baseBeamMat);
        baseBeam.position.set((a.x + b.x) * 0.5, elev + 0.04, (a.z + b.z) * 0.5);
        baseBeam.rotation.y = -Math.atan2(dz, dx);
        draftGroup.add(baseBeam);

        const segGeo = new THREE.BoxGeometry(len, h, t);
        const segMesh = new THREE.Mesh(segGeo, previewMat);
        segMesh.position.set((a.x + b.x) * 0.5, elev + h * 0.5, (a.z + b.z) * 0.5);
        segMesh.rotation.y = -Math.atan2(dz, dx);
        const segEdges = new THREE.LineSegments(new THREE.EdgesGeometry(segGeo), previewEdgeMat);
        segEdges.position.copy(segMesh.position);
        segEdges.rotation.copy(segMesh.rotation);
        draftGroup.add(segMesh, segEdges);
      }
    } else if (draftPreview.kind === 'placement') {
      const ring = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true })
      );
      ring.position.set(draftPreview.x, draftPreview.y, draftPreview.z);
      const stemPts = [
        new THREE.Vector3(draftPreview.x, floorElevRef.current || 0, draftPreview.z),
        new THREE.Vector3(draftPreview.x, draftPreview.y, draftPreview.z),
      ];
      const stem = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(stemPts),
        new THREE.LineBasicMaterial({ color: palette.objectEdge })
      );
      draftGroup.add(ring, stem);
    }

    requestRender();
  }, [draftPreview, theme, requestRender]);

  // Apply light/dark theme palette to Scene background, softened fog, Axes & high-contrast GridHelper
  React.useEffect(() => {
    const { scene } = refs.current;
    if (!scene) return;
    const palette = getSpatialThemePalette(theme);
    scene.background = new THREE.Color(palette.background);
    scene.fog = new THREE.FogExp2(palette.fog, 0.0025);

    if (refs.current.grid) {
      scene.remove(refs.current.grid);
      refs.current.grid.geometry.dispose();
      if (Array.isArray(refs.current.grid.material)) {
        refs.current.grid.material.forEach((m) => m.dispose());
      } else {
        refs.current.grid.material.dispose();
      }
    }
    const nextGrid = new THREE.GridHelper(120, 60, palette.gridMajor, palette.gridMinor);
    nextGrid.position.y = (activeFloorElevation || 0) - 0.002;
    scene.add(nextGrid);
    refs.current.grid = nextGrid;

    if (refs.current.axes) {
      scene.remove(refs.current.axes);
      refs.current.axes.geometry.dispose();
    }
    const axes = new THREE.AxesHelper(2.2);
    axes.position.set(0, (activeFloorElevation || 0) + 0.01, 0);
    scene.add(axes);
    refs.current.axes = axes;

    requestRender();
  }, [theme, activeFloorElevation, requestRender]);

  // Update TransformControls mode
  React.useEffect(() => {
    if (refs.current.transform) {
      refs.current.transform.setMode(gizmoMode);
      requestRender();
    }
  }, [gizmoMode, requestRender]);

  // Re-measure viewport & render a fresh frame when reopened (without rebuilding scene)
  React.useEffect(() => {
    if (!isOpen) return;
    const syncSize = () => {
      const container = containerRef.current;
      const { renderer, camera, scene } = refs.current;
      if (container && renderer && camera && scene) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        if (cw > 0 && ch > 0) {
          camera.aspect = cw / ch;
          camera.updateProjectionMatrix();
          renderer.setSize(cw, ch);
          renderer.render(scene, camera);
        }
      }
      requestRender();
    };
    syncSize();
    const raf = requestAnimationFrame(syncSize);
    return () => cancelAnimationFrame(raf);
  }, [isOpen, requestRender]);

  const frameCameraOnScene = React.useCallback(
    (mode: CameraPresetMode = 'homeCore') => {
      const { camera, orbit, propertyRoot } = refs.current;
      if (!camera || !orbit) return;
      if (propertyRoot && propertyRoot.children.length > 0) {
        const box = new THREE.Box3();
        if (mode === 'fitAll') {
          box.setFromObject(propertyRoot);
        } else {
          // Cluster around the compact home structures so outlier 40m-60m drawn lines don't zoom camera way out on initial load
          const coreBox = new THREE.Box3();
          const fullBox = new THREE.Box3();
          const childSize = new THREE.Vector3();
          const childCenter = new THREE.Vector3();
          propertyRoot.children.forEach((child) => {
            const cb = new THREE.Box3().setFromObject(child);
            if (cb.isEmpty()) return;
            fullBox.union(cb);
            cb.getSize(childSize);
            cb.getCenter(childCenter);
            const maxSpan = Math.max(childSize.x, childSize.z);
            const distFromOrigin = Math.hypot(childCenter.x, childCenter.z);
            if (maxSpan <= 22 && distFromOrigin <= 22) {
              coreBox.union(cb);
            }
          });
          box.copy(coreBox.isEmpty() ? fullBox : coreBox);
        }

        if (!box.isEmpty()) {
          const center = new THREE.Vector3();
          const size = new THREE.Vector3();
          box.getCenter(center);
          box.getSize(size);
          const radius = Math.max(size.length() * 0.5, 4.5);
          if (mode === 'topPlan') {
            camera.position.set(center.x, center.y + Math.max(radius * 2.05, 13), center.z + 0.05);
          } else {
            camera.position.set(
              center.x + radius * 1.1,
              center.y + radius * 0.85,
              center.z + radius * 1.15
            );
          }
          orbit.target.copy(center);
          orbit.update();
          requestRender();
          return;
        }
      }
      if (mode === 'topPlan') {
        camera.position.set(0, 18, 0.05);
        orbit.target.set(0, 0, 0);
      } else {
        camera.position.set(11, 8.5, 11);
        orbit.target.set(0, 1.2, 0);
      }
      orbit.update();
      requestRender();
    },
    [requestRender]
  );

  // Camera reset & preset triggers
  React.useEffect(() => {
    if (resetCameraNonce === 0) return;
    frameCameraOnScene('homeCore');
  }, [resetCameraNonce, frameCameraOnScene]);

  React.useEffect(() => {
    if (!cameraPresetRequest) return;
    frameCameraOnScene(cameraPresetRequest.mode);
  }, [cameraPresetRequest, frameCameraOnScene]);

  // Rebuild strictly server-returned geometry, placement hierarchy & selection resize handles
  React.useEffect(() => {
    const { propertyRoot, handlesGroup, transform, isSoftwareGl } = refs.current;
    if (!propertyRoot || !transform || !handlesGroup) return;

    transform.detach();
    refs.current.selectedPlacementOriginal = undefined;
    disposeObject3D(propertyRoot);
    propertyRoot.clear();
    disposeObject3D(handlesGroup);
    handlesGroup.clear();
    refs.current.selectables = [];
    refs.current.wallObjects = [];
    refs.current.handleObjects = [];

    if (!sceneData) {
      requestRender();
      return;
    }

    const palette = getSpatialThemePalette(theme);
    const floorMap = new Map<number, SpatialFloorDto>();
    (sceneData.floors || []).forEach((f) => floorMap.set(f.id, f));

    // Pre-collect Void polygons per floor so slabs carve stairwells cleanly
    const floorVoids = new Map<number, [number, number, number][][]>();
    (sceneData.geometries || []).forEach((g) => {
      if (g.kind === SpatialGeometryKind.Void && g.floorId) {
        const parsed = safeParseJson<any>(g.geometryJson);
        if (Array.isArray(parsed?.points) && parsed.points.length >= 3) {
          const list = floorVoids.get(g.floorId) || [];
          list.push(parsed.points);
          floorVoids.set(g.floorId, list);
        }
      }
    });

    const sectionToFloor = new Map<number, number>();
    (sceneData.sectionBindings || []).forEach((b) => {
      if (b.sectionId && b.floorId) sectionToFloor.set(b.sectionId, b.floorId);
    });
    const roomToFloor = new Map<number, number>();
    (sceneData.roomBindings || []).forEach((b) => {
      if (b.roomId && b.floorId) roomToFloor.set(b.roomId, b.floorId);
      else if (b.roomId && b.sectionId && sectionToFloor.has(b.sectionId)) {
        roomToFloor.set(b.roomId, sectionToFloor.get(b.sectionId)!);
      }
    });

    const isFloorVisible = (fid?: number | null): boolean => {
      if (!fid) return true;
      return visibleFloors[fid] !== false;
    };

    const extraOpenings: SpatialOpeningDto[] = sceneData.openings || [];
    const roomNameLookup = new Map<number, string>();
    if (roomNames) {
      Object.entries(roomNames).forEach(([k, v]) => {
        const idNum = Number(k);
        if (idNum > 0 && v) roomNameLookup.set(idNum, v);
      });
    }

    // Build geometries returned by server
    let selectedGeom: SpatialGeometryDto | null = null;
    (sceneData.geometries || []).forEach((geom) => {
      const effectiveFloorId =
        geom.floorId ||
        (geom.roomId ? roomToFloor.get(geom.roomId) : undefined) ||
        (geom.sectionId ? sectionToFloor.get(geom.sectionId) : undefined) ||
        null;
      if (!isFloorVisible(effectiveFloorId)) return;
      const obj = buildGeometryObject(
        geom,
        floorMap,
        floorVoids,
        palette,
        selectedKey,
        extraOpenings,
        isSoftwareGl,
        renderMode,
        roomNameLookup
      );
      if (obj) {
        propertyRoot.add(obj);
        refs.current.selectables.push(obj);
        if (obj.userData?.isWall) {
          refs.current.wallObjects.push(obj);
        }
        if (selectedKey === `geometry-${geom.id}`) {
          selectedGeom = geom;
        }
      }
    });

    // Attach 3D resize handles if a RoomOutline, Slab, or Wall is selected
    if (selectedGeom) {
      const g = selectedGeom as SpatialGeometryDto;
      const handleMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
        roughness: 0.25,
      });
      const wallMeta = extractWallMeta(g, floorMap, extraOpenings);
      if (wallMeta) {
        const sGeo = new THREE.SphereGeometry(0.14, 14, 10);
        const hStart = new THREE.Mesh(sGeo, handleMat);
        hStart.position.set(wallMeta.start[0], wallMeta.elevationY + 0.15, wallMeta.start[2]);
        hStart.userData = {
          geometry: g,
          handleKind: 'wallStart',
          otherEnd: wallMeta.end,
          elevY: wallMeta.elevationY,
        };
        const hEnd = new THREE.Mesh(sGeo.clone(), handleMat);
        hEnd.position.set(wallMeta.end[0], wallMeta.elevationY + 0.15, wallMeta.end[2]);
        hEnd.userData = {
          geometry: g,
          handleKind: 'wallEnd',
          otherEnd: wallMeta.start,
          elevY: wallMeta.elevationY,
        };
        handlesGroup.add(hStart, hEnd);
        refs.current.handleObjects.push(hStart, hEnd);
      } else if (
        g.kind === SpatialGeometryKind.RoomOutline ||
        g.kind === SpatialGeometryKind.Slab
      ) {
        const bounds = computeGeometryBounds(g, floorMap);
        if (bounds) {
          const corners: { x: number; z: number; ax: number; az: number }[] = [
            { x: bounds.minX, z: bounds.minZ, ax: bounds.maxX, az: bounds.maxZ },
            { x: bounds.maxX, z: bounds.minZ, ax: bounds.minX, az: bounds.maxZ },
            { x: bounds.maxX, z: bounds.maxZ, ax: bounds.minX, az: bounds.minZ },
            { x: bounds.minX, z: bounds.maxZ, ax: bounds.maxX, az: bounds.minZ },
          ];
          corners.forEach((c) => {
            const h = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), handleMat);
            h.position.set(c.x, bounds.floorY + 0.16, c.z);
            h.userData = {
              geometry: g,
              handleKind: 'corner',
              anchorX: c.ax,
              anchorZ: c.az,
              elevY: bounds.floorY,
            };
            handlesGroup.add(h);
            refs.current.handleObjects.push(h);
          });
        }
      }
    }

    const deviceMap = new Map<string, Device>();
    devices.forEach((d) => {
      const rawId = d.id.includes('-') ? d.id.split('-')[1] : d.id;
      deviceMap.set(`${d.type}:${rawId}`, d);
    });

    const targetKindType = (k: number): string => {
      switch (k) {
        case 1:
          return 'door';
        case 2:
          return 'window';
        case 3:
          return 'light';
        case 4:
          return 'camera';
        case 5:
          return 'appliance';
        case 6:
          return 'external';
        case 7:
          return 'utility';
        default:
          return 'light';
      }
    };

    let attachTarget: THREE.Object3D | null = null;
    (sceneData.placements || []).forEach((pl) => {
      const floorId =
        pl.parentKind === 3
          ? pl.parentId
          : pl.parentKind === 5
          ? roomToFloor.get(pl.parentId) ?? null
          : pl.parentKind === 4
          ? sectionToFloor.get(pl.parentId) ?? null
          : null;
      if (!isFloorVisible(floorId)) return;
      const dev = deviceMap.get(`${targetKindType(pl.targetKind)}:${pl.targetId}`);
      const obj = buildPlacementObject(pl, dev, palette, selectedKey, isSoftwareGl, renderMode);
      propertyRoot.add(obj);
      refs.current.selectables.push(obj);
      if (selectedKey === `placement-${pl.id}`) {
        attachTarget = obj;
        refs.current.selectedPlacementOriginal = pl;
      }
    });

    if (attachTarget) {
      transform.attach(attachTarget);
    }

    if (
      propertyRoot.children.length > 0 &&
      framedPropertyIdRef.current !== sceneData.propertyId
    ) {
      framedPropertyIdRef.current = sceneData.propertyId;
      frameCameraOnScene('homeCore');
    } else {
      requestRender();
    }
  }, [sceneData, devices, visibleFloors, selectedKey, theme, renderMode, roomNames, frameCameraOnScene, requestRender]);

  // HTML5 Drag & Drop onto 3D Canvas handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const payload = activeDragRef.current;
    if (!payload && !e.dataTransfer.types.includes('application/x-spatial-drag')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    const dragItem = payload;
    const floorPt = projectPointerToFloor(e.clientX, e.clientY);
    if (!dragItem || !floorPt) return;

    const prefersWall =
      dragItem.dragKind === 'opening' ||
      (dragItem.dragKind === 'device' &&
        (dragItem.targetKind === SpatialTargetKind.Window ||
          dragItem.targetKind === SpatialTargetKind.Door ||
          dragItem.targetKind === SpatialTargetKind.Camera));

    if (prefersWall) {
      const wallHit = raycastWalls(e.clientX, e.clientY);
      if (wallHit) {
        const w = dragItem.dragKind === 'opening' ? dragItem.width : 0.95;
        const h = dragItem.dragKind === 'opening' ? dragItem.height : 1.25;
        renderGhostPlacement(
          [
            wallHit.worldPosition[0],
            wallHit.worldPosition[1] + h * 0.5,
            wallHit.worldPosition[2],
          ],
          wallHit.quaternion,
          [w, h, 0.24],
          0x38bdf8
        );
        setLiveHudBadge(
          `Snap to ${wallHit.wallGeometry.name} @ ${wallHit.offsetAlongWall.toFixed(2)}m`
        );
        return;
      }
    }

    if (dragItem.dragKind === 'wall') {
      const endPt: [number, number, number] = [
        floorPt[0] + dragItem.defaultLength,
        floorPt[1],
        floorPt[2],
      ];
      renderGhostWall(floorPt, endPt, dragItem.height, dragItem.thickness);
      setLiveHudBadge(`Drop Wall (${dragItem.defaultLength}m) @ (${floorPt[0]}, ${floorPt[2]})`);
    } else if (dragItem.dragKind === 'roomBox') {
      const hw = dragItem.width * 0.5;
      const hd = dragItem.depth * 0.5;
      renderGhostBox(
        floorPt[0] - hw,
        floorPt[0] + hw,
        floorPt[2] - hd,
        floorPt[2] + hd,
        floorPt[1],
        dragItem.height
      );
      setLiveHudBadge(`Drop ${dragItem.width}m × ${dragItem.depth}m Space Box`);
    } else if (dragItem.dragKind === 'device') {
      const dims: [number, number, number] =
        dragItem.targetKind === SpatialTargetKind.Utility ? [0.85, 1.1, 0.7] : [0.45, 0.45, 0.4];
      const elevOffset =
        dragItem.targetKind === SpatialTargetKind.Light ? 2.4 : dims[1] * 0.5;
      renderGhostPlacement(
        [floorPt[0], floorPt[1] + elevOffset, floorPt[2]],
        [0, 0, 0, 1],
        dims,
        0x14b8a6
      );
      setLiveHudBadge(
        `Drop ${dragItem.label} @ (${floorPt[0].toFixed(1)}, ${floorPt[2].toFixed(1)})`
      );
    }
  };

  const handleDragLeave = () => {
    clearOverlayPreview();
    setLiveHudBadge(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    clearOverlayPreview();
    setLiveHudBadge(null);

    let payload: SpatialDragPayload | null = activeDragRef.current;
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('application/x-spatial-drag');
        if (raw) payload = JSON.parse(raw) as SpatialDragPayload;
      } catch {
        payload = null;
      }
    }
    if (!payload || !onDropPayloadRef.current) return;

    const floorPt = projectPointerToFloor(e.clientX, e.clientY) ?? [0, floorElevRef.current || 0, 0];
    const wallHit = raycastWalls(e.clientX, e.clientY);
    onDropPayloadRef.current(payload, {
      floorPoint: floorPt,
      wallHit,
    });
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full h-full overflow-hidden"
    >
      {liveHudBadge && (
        <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-mono font-semibold shadow-lg">
          {liveHudBadge}
        </div>
      )}
      {contextLost && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90 text-white text-sm font-semibold">
          WebGL rendering context interrupted. Restoring 3D scene...
        </div>
      )}
    </div>
  );
}
