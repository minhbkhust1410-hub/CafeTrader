import { useEffect, useRef } from 'react';
import {
  AbstractMesh, Color3, Color4, DynamicTexture, Engine, FreeCamera, HemisphericLight,
  Mesh, MeshBuilder, PointLight, Scene, StandardMaterial, Tools, TransformNode, Vector3,
} from '@babylonjs/core';
import { chillAudio } from './audio/chillAudio';
import { staffVoice, type StaffId } from './audio/staffVoice';
import type { PhotoPresetId } from './components/PhotoModeOverlay';
import { CAFE_MENU, CAFE_MENU_CATEGORIES, menuByCategory } from './data/cafeMenu';
import './CafeScene.css';

type Position = { x: number; y: number; z: number; rotation: number };
export type RemotePlayer = Position & { id: string; name: string; color: string; seatId?: string | null; drink?: string | null };
export type ActiveEmote = { id: string; emoji: string; x: number; y?: number; z: number; time: number };
export type PerformanceStats = { fps: number; frameTime: number; meshes: number };

type Props = {
  cameraMode: 'first' | 'third';
  seatedSeatId?: string | null;
  onSeatClick?: (seatId: string) => void;
  onLeaveSeat?: () => void;
  onMove?: (position: Position) => void;
  remotePlayers?: RemotePlayer[];
  currentDrink?: string | null;
  activeEmotes?: ActiveEmote[];
  floorJump?: { floor: number; nonce: number } | null;
  onFloorChange?: (floor: number) => void;
  onStatsUpdate?: (stats: PerformanceStats) => void;
  selfId?: string;
  speakingPlayerIds?: Set<string>;
  reducedMotion?: boolean;
  onInspectTerminal?: () => void;
  targetPOV?: 'arrival' | 'hearth' | 'library' | 'terrace' | null;
  fireworksNonce?: number;
  massageActive?: boolean;
  onStaffClick?: (staffId: StaffId) => void;
  onBartenderProximity?: (staffId: StaffId) => void;
  onTableMenuClick?: (tableIndex: number) => void;
  photoMode?: boolean;
  photoCameraPreset?: PhotoPresetId;
  photoFov?: number;
  captureTrigger?: { nonce: number } | null;
  onPhotoCaptured?: (rawPngDataUrl: string) => void;
};

type Seat = { x: number; y: number; z: number; facing: number; tableIndex: number; seatIndex: number };
type Character = { root: TransformNode; limbs: Mesh[]; label?: DynamicTexture; speakingHalo?: Mesh; zenHalo?: Mesh };

// Tables 1-5: Ground floor (y = 0); Tables 6-7: VIP Mezzanine Floor (y = 3.2)
const TABLES = [
  // Ground Floor Tables
  { x: -5.4, y: 0, z: -2.7, floor: 1, type: 'standard' },
  { x: -5.4, y: 0, z: 1.35, floor: 1, type: 'standard' },
  { x: -2.2, y: 0, z: 3.9, floor: 1, type: 'standard' },
  { x: -1.5, y: 0, z: -1.5, floor: 1, type: 'standard' },
  { x: 1.8, y: 0, z: -3.35, floor: 1, type: 'standard' },
  // Floor 2 - VIP Mezzanine Tables
  { x: -2.0, y: 3.2, z: 2.8, floor: 2, type: 'vip-balcony' },
  { x: 3.2, y: 3.2, z: 4.6, floor: 2, type: 'vip-lounge' },
];

const SEAT_OFFSETS = [
  { x: 0, z: -1.05, facing: 0 },
  { x: 1.05, z: 0, facing: -Math.PI / 2 },
  { x: 0, z: 1.05, facing: Math.PI },
  { x: -1.05, z: 0, facing: Math.PI / 2 },
];

const ROYAL_FLOOR_HEIGHTS = [0, 3.2, 6.7, 10.2, 13.7, 17.2, 20.7, 24.2];

const TRADER_QUOTES = [
  'Thị trường luôn ở đó · Hãy thảnh thơi nhâm nhi tách cà phê.',
  'Kiên nhẫn là lợi thế · Kỷ luật là sự tự do.',
  'Bảo toàn vốn trước · Lợi nhuận sẽ tự tìm đến.',
  'Slow down · Stay curious · Protect your inner peace.',
  'Tầm nhìn thượng lưu · Giữ tâm tĩnh lặng giữa ngàn biến động.',
  'Giao dịch bằng lý trí · Tận hưởng cuộc sống bằng trái tim.',
];

const PHOTO_PRESETS: Record<PhotoPresetId, { pos: Vector3; target: Vector3 } | null> = {
  current: null,
  exterior: { pos: new Vector3(0, 3.2, -26.5), target: new Vector3(0, 6.0, 0) },
  hearth: { pos: new Vector3(-5.2, 1.8, -4.5), target: new Vector3(-8.8, 2.0, -1.8) },
  bar: { pos: new Vector3(-0.5, 1.7, 1.2), target: new Vector3(2.8, 1.8, 1.2) },
  library: { pos: new Vector3(-3.2, 4.8, 2.0), target: new Vector3(-5.8, 4.5, 3.8) },
  balcony: { pos: new Vector3(-9.2, 4.6, 1.5), target: new Vector3(-16.0, 3.5, 12.0) },
  observatory: { pos: new Vector3(0, 25.5, -6.8), target: new Vector3(0, 15.0, 20.0) },
  selfie: null,
};

/** Five-storey villa café: gate arrival, 500m² forecourt, double-height hall and VIP mezzanine. */
export default function CafeScene(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Favor sharpness: render at the device's native pixel density with anti-aliasing.
    // Static-transform freezing and pointer-pick suppression remain the performance safeguards.
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, antialias: true }, true);
    const scene = new Scene(engine);
    // Camera rotation is handled directly below; avoid a ray-pick for every pointer move.
    scene.skipPointerMovePicking = true;
    scene.clearColor = new Color4(0.04, 0.05, 0.09, 1);
    scene.ambientColor = new Color3(0.48, 0.42, 0.36);
    scene.fogMode = Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.0012;
    scene.fogColor = new Color3(0.05, 0.07, 0.12);

    // Human-scale POV: 1.64m standing eye height, 1.22m seated and a 63° vertical FOV.
    // On a 16:9 display this is close to a natural ~92° horizontal field of view.
    const standingEyeHeight = 1.64;
    const seatedEyeHeight = 1.22;
    const camera = new FreeCamera('guest-camera', new Vector3(0, standingEyeHeight, -5), scene);
    camera.minZ = 0.05;
    camera.maxZ = 1200;
    camera.fov = 1.10;
    scene.activeCamera = camera;

    // Atmospheric warm lighting for double-height space
    const light = new HemisphericLight('soft-sky', new Vector3(0, 1, 0), scene);
    light.intensity = 0.84;
    light.diffuse = new Color3(1, 0.93, 0.84);
    light.groundColor = new Color3(0.24, 0.18, 0.14);

    const barLight = new PointLight('bar-glow', new Vector3(5.2, 3.2, 2.5), scene);
    barLight.diffuse = new Color3(1, 0.68, 0.38);
    barLight.intensity = 1.02;
    barLight.range = 14;

    const windowLight = new PointLight('window-glow', new Vector3(-7, 4.2, 2), scene);
    windowLight.diffuse = new Color3(0.42, 0.60, 0.65);
    windowLight.intensity = 0.32;
    windowLight.range = 16;

    // VIP Lounge Chandelier Light
    const vipLight = new PointLight('vip-chandelier-light', new Vector3(3.2, 5.2, 4.6), scene);
    vipLight.diffuse = new Color3(1, 0.86, 0.62);
    vipLight.intensity = 0.92;
    vipLight.range = 10;

    // Hearth Hall Grand Fireplace Point Light (Flickers warmly in render loop)
    const fireplaceLight = new PointLight('fireplace-glow', new Vector3(-5.8, 1.2, 5.8), scene);
    fireplaceLight.diffuse = new Color3(1.0, 0.58, 0.24);
    fireplaceLight.intensity = 1.42;
    fireplaceLight.range = 14;

    // One broad amber source gives the hall its hotel-lobby glow without adding a costly light grid.
    const grandHallLight = new PointLight('grand-hall-amber', new Vector3(-0.8, 5.15, 0.9), scene);
    grandHallLight.diffuse = new Color3(1.0, 0.76, 0.46);
    grandHallLight.intensity = 0.58;
    grandHallLight.range = 15;

    const material = (name: string, color: string, emissive?: string, alpha?: number) => {
      const mat = new StandardMaterial(name, scene);
      mat.diffuseColor = Color3.FromHexString(color);
      mat.specularColor = new Color3(0.15, 0.12, 0.09);
      if (emissive) mat.emissiveColor = Color3.FromHexString(emissive);
      if (alpha !== undefined) mat.alpha = alpha;
      return mat;
    };

    const wood = material('warm walnut', '#513a2a');
    const woodLight = material('honey oak', '#9d7147');
    const darkWood = material('dark wood', '#261b17');
    const stoneTravertine = material('travertine', '#6d5a49');
    const stoneHearth = material('stone-hearth', '#1c1b1a');
    const fireEmber = material('fire-ember', '#ff4d00', '#ff2200');
    const bankerGreen = material('banker-green', '#194d38', '#0c3322');
    const cream = material('warm plaster', '#c7b89d');
    const charcoal = material('charcoal', '#1e201d');
    const brass = material('aged brass', '#b88c4f');
    const goldBrass = material('polished gold', '#d4af37', '#6d5415');
    const green = material('leaves', '#4c6945');
    const greenDark = material('deep leaves', '#2d4b38');
    const rust = material('rust upholstery', '#a55c40');
    const teal = material('teal upholstery', '#3f5d57');
    const royalVelvet = material('royal velvet', '#244052');
    const cognacLeather = material('cognac leather', '#803c1b');
    const marbleWhite = material('calacatta marble', '#f3f1ec');
    const marbleBlack = material('black marble', '#1a1f1d');
    const white = material('ceramic', '#ede5d4');
    const espresso = material('espresso', '#381f14');
    const lampGlow = material('warm bulbs', '#f8d591', '#c08035');
    const flameMat = material('flame', '#ffc15e', '#ff841f');
    const glass = material('night glass', '#283e42', '#102222', 0.80);
    const balconyGlass = material('balcony glass', '#3c5a5e', '#152b2f', 0.55);
    const revolvingGlass = material('revolving glass', '#557e87', '#152b30', 0.50);
    const floorMaterial = material('floor', '#684d36');
    const rugMat1 = material('rug-1', '#6f4233');
    const rugMat2 = material('rug-2', '#3a4e47');
    const vipRug = material('vip-rug', '#25353d');
    const catFur = material('cat-fur', '#d48852');
    const catWhite = material('cat-white', '#e8dfcb');
    const vinylMat = material('vinyl', '#181818');
    const steamMat = material('steam', '#ffffff', '#ffffff', 0.35);
    const winterSnow = material('winter snow', '#eaf2f3', '#d8f0f4', 0.78);
    const iceBlue = material('winter chart accent', '#8fc8d2', '#5e9fb0');
    const chromeSilver = material('chrome silver', '#d6dadc', '#989e9f');
    const ftPink = material('ft-pink-newsprint', '#f5e4d7', '#4d3a2b');
    const wsjPaper = material('wsj-newsprint', '#f0ede6', '#2b2926');
    const kraftBag = material('kraft-bag', '#a67b4e', '#593e23');
    const lemonYellow = material('lemon-yellow', '#ffd700', '#d4af37');

    // NYC Outdoor Environment & Manhattan Skyline Materials
    const asphalt = material('nyc-asphalt', '#181b20', '#0a0d12');
    const roadYellow = material('road-yellow', '#e5b020', '#997310');
    const roadWhite = material('road-white', '#dcdedc', '#8a8d8a');
    const sidewalk = material('nyc-sidewalk', '#3e3d3a', '#1a1918');
    const streetlampGlow = material('nyc-streetlamp-glow', '#ffe2a3', '#ffc46b');
    const taxiYellow = material('nyc-taxi-yellow', '#f4bc1c', '#604205');
    const skyscraperMat = material('nyc-skyscraper', '#12161f', '#090d14');
    const beaconMat = material('nyc-beacon', '#ff2222', '#ff0000');
    const autumnLeaves = material('autumn-leaves', '#9c5b28');
    const treeBark = material('tree-bark', '#281c14');
    const cloudMat = material('cloud-mat', '#8da0b3', '#2a3545', 0.65);

    const seatPositions = new Map<string, Seat>();
    const collisionDiscs: Array<{ x: number; y: number; z: number; r: number }> = [];
    const winterSnowflakes: Array<{ mesh: Mesh; phase: number; baseX: number; baseY: number }> = [];
    const beaconMeshes: Mesh[] = [];
    const nycCloudRoots: TransformNode[] = [];

    function box(name: string, size: [number, number, number], position: [number, number, number], mat: StandardMaterial, parent?: TransformNode) {
      const mesh = MeshBuilder.CreateBox(name, { width: size[0], height: size[1], depth: size[2] }, scene);
      mesh.position.set(...position); mesh.material = mat;
      if (parent) mesh.parent = parent;
      return mesh;
    }
    function cylinder(name: string, height: number, diameter: number, position: [number, number, number], mat: StandardMaterial, parent?: TransformNode) {
      const mesh = MeshBuilder.CreateCylinder(name, { height, diameter, tessellation: 16 }, scene);
      mesh.position.set(...position); mesh.material = mat;
      if (parent) mesh.parent = parent;
      return mesh;
    }
    function sphere(name: string, diameter: number, position: [number, number, number], mat: StandardMaterial, parent?: TransformNode) {
      const mesh = MeshBuilder.CreateSphere(name, { diameter, segments: 10 }, scene);
      mesh.position.set(...position); mesh.material = mat;
      if (parent) mesh.parent = parent;
      return mesh;
    }

    // ==========================================
    // 0A. NEW YORK SKY, MANHATTAN SKYLINE & AVENUE
    // Authentic New York outdoor view: Sky dome with dusk/twilight gradient,
    // drifting clouds, Manhattan skyline skyscrapers with glowing windows,
    // wide New York Avenue with asphalt, lane lines, streetlamps & Central Park trees.
    // ==========================================
    const skyDomeTex = new DynamicTexture('sky-dome-tex', { width: 1024, height: 512 }, scene, false);
    const sCtx = skyDomeTex.getContext() as unknown as CanvasRenderingContext2D;
    const grad = sCtx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#060a14'); // Zenith: Midnight blue
    grad.addColorStop(0.35, '#0e1828');
    grad.addColorStop(0.68, '#1b2636');
    grad.addColorStop(0.85, '#3a231b'); // Lower horizon: Manhattan city twilight amber glow
    grad.addColorStop(1.0, '#523022');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 1024, 512);
    sCtx.fillStyle = '#ffffff';
    for (let s = 0; s < 450; s++) {
      const sx = Math.random() * 1024;
      const sy = Math.random() * 320;
      const sr = Math.random() < 0.15 ? 1.5 : 0.8;
      sCtx.globalAlpha = Math.random() * 0.75 + 0.25;
      sCtx.beginPath();
      sCtx.arc(sx, sy, sr, 0, Math.PI * 2);
      sCtx.fill();
    }
    sCtx.globalAlpha = 0.95;
    sCtx.fillStyle = '#f8ecc9';
    sCtx.beginPath();
    sCtx.arc(680, 110, 18, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.globalAlpha = 1.0;
    skyDomeTex.update();
    const skyDomeMat = new StandardMaterial('sky-dome-mat', scene);
    skyDomeMat.emissiveTexture = skyDomeTex;
    skyDomeMat.disableLighting = true;
    skyDomeMat.backFaceCulling = false;

    const skyDome = MeshBuilder.CreateSphere('nyc-sky-dome', { diameter: 750, segments: 24, sideOrientation: Mesh.BACKSIDE }, scene);
    skyDome.position.set(0, 25, -50);
    skyDome.material = skyDomeMat;

    // Drifting 3D volumetric clouds
    for (let c = 0; c < 12; c++) {
      const cx = -150 + ((c * 27) % 300);
      const cy = 54 + (c % 5) * 11;
      const cz = -65 - ((c * 17) % 130);
      const cloudRoot = new TransformNode(`nyc-cloud-root-${c}`, scene);
      cloudRoot.position.set(cx, cy, cz);
      nycCloudRoots.push(cloudRoot);
      for (let p = 0; p < 5; p++) {
        const puff = MeshBuilder.CreateSphere(`nyc-cloud-${c}-${p}`, { diameter: 14 + (p % 3) * 6, segments: 8 }, scene);
        puff.scaling.set(1.6, 0.65, 1.2);
        puff.position.set((p - 2) * 7.5, (p % 2) * 2.2, (p % 3 - 1) * 4.5);
        puff.material = cloudMat;
        puff.parent = cloudRoot;
      }
    }

    // Dynamic skyscraper facade texture with thousands of glowing warm windows
    const towerWindowTex = new DynamicTexture('tower-windows-tex', { width: 512, height: 512 }, scene, false);
    const winCtx = towerWindowTex.getContext() as unknown as CanvasRenderingContext2D;
    winCtx.fillStyle = '#10141c';
    winCtx.fillRect(0, 0, 512, 512);
    for (let r = 0; r < 32; r++) {
      for (let c = 0; c < 16; c++) {
        const isLit = (r * 17 + c * 31) % 5 < 3;
        if (isLit) {
          const warm = (r + c) % 3 === 0 ? '#ffeaad' : (r + c) % 3 === 1 ? '#e6af5a' : '#c8e2f0';
          winCtx.fillStyle = warm;
          winCtx.fillRect(c * 32 + 8, r * 16 + 4, 16, 8);
        }
      }
    }
    towerWindowTex.update();
    const towerWindowMat = new StandardMaterial('tower-window-mat', scene);
    towerWindowMat.diffuseTexture = towerWindowTex;
    towerWindowMat.emissiveTexture = towerWindowTex;
    towerWindowMat.emissiveColor = new Color3(0.9, 0.82, 0.72);

    const SKYLINE_BUILDINGS = [
      // Far iconic skyscrapers (Heights 95m - 140m)
      { x: -140, z: -210, w: 28, d: 28, h: 110, style: 'spire' },
      { x: -95,  z: -230, w: 32, d: 30, h: 135, style: 'deco' },
      { x: -50,  z: -200, w: 26, d: 26, h: 105, style: 'glass' },
      { x: 0,    z: -240, w: 34, d: 32, h: 140, style: 'deco-spire' },
      { x: 45,   z: -210, w: 26, d: 26, h: 115, style: 'spire' },
      { x: 90,   z: -230, w: 30, d: 28, h: 130, style: 'deco' },
      { x: 140,  z: -200, w: 28, d: 28, h: 100, style: 'glass' },

      // Mid-distance skyline (Heights 68m - 92m)
      { x: -160, z: -150, w: 24, d: 24, h: 75, style: 'watertower' },
      { x: -115, z: -160, w: 26, d: 24, h: 90, style: 'step' },
      { x: -70,  z: -140, w: 22, d: 22, h: 70, style: 'glass' },
      { x: -25,  z: -165, w: 26, d: 24, h: 88, style: 'deco' },
      { x: 25,   z: -160, w: 24, d: 24, h: 85, style: 'watertower' },
      { x: 70,   z: -145, w: 22, d: 22, h: 72, style: 'step' },
      { x: 115,  z: -160, w: 26, d: 26, h: 92, style: 'glass' },
      { x: 160,  z: -150, w: 24, d: 24, h: 78, style: 'watertower' },

      // Near mid-rises & brownstone avenue frontage (Heights 42m - 58m)
      { x: -140, z: -110, w: 22, d: 20, h: 48, style: 'watertower' },
      { x: -90,  z: -115, w: 20, d: 20, h: 56, style: 'step' },
      { x: -45,  z: -105, w: 18, d: 18, h: 42, style: 'watertower' },
      { x: 45,   z: -105, w: 18, d: 18, h: 45, style: 'watertower' },
      { x: 90,   z: -115, w: 20, d: 20, h: 58, style: 'step' },
      { x: 140,  z: -110, w: 22, d: 20, h: 50, style: 'watertower' },
    ];

    SKYLINE_BUILDINGS.forEach((b, i) => {
      // Main tower shaft
      box(`sky-b-${i}-base`, [b.w, b.h * 0.74, b.d], [b.x, b.h * 0.37, b.z], towerWindowMat);
      // Setback tier 2
      box(`sky-b-${i}-t2`, [b.w * 0.76, b.h * 0.18, b.d * 0.76], [b.x, b.h * 0.83, b.z], towerWindowMat);
      // Crown tier 3
      box(`sky-b-${i}-crown`, [b.w * 0.50, b.h * 0.08, b.d * 0.50], [b.x, b.h * 0.96, b.z], skyscraperMat);

      if (b.style.includes('spire')) {
        cylinder(`sky-b-${i}-spire`, 16, 0.45, [b.x, b.h + 8, b.z], goldBrass);
        const beacon = sphere(`sky-b-${i}-beacon`, 0.85, [b.x, b.h + 16, b.z], beaconMat);
        beaconMeshes.push(beacon);
      }
      if (b.style === 'watertower') {
        cylinder(`sky-b-${i}-wtank`, 3.6, 3.2, [b.x + b.w * 0.22, b.h * 0.74 + 3.0, b.z + b.d * 0.22], darkWood);
        cylinder(`sky-b-${i}-wcone`, 1.4, 3.4, [b.x + b.w * 0.22, b.h * 0.74 + 5.2, b.z + b.d * 0.22], charcoal);
        for (const dx of [-1.1, 1.1]) for (const dz of [-1.1, 1.1]) {
          cylinder(`sky-b-${i}-wleg-${dx}-${dz}`, 1.6, 0.12, [b.x + b.w * 0.22 + dx, b.h * 0.74 + 0.8, b.z + b.d * 0.22 + dz], charcoal);
        }
      }
    });

    // Wide asphalt road deck
    box('nyc-avenue-deck', [360, 0.22, 54], [0, -0.20, -62], asphalt);
    // Sidewalks North and South
    box('nyc-sidewalk-north', [360, 0.28, 8], [0, -0.06, -34], sidewalk);
    box('nyc-sidewalk-south', [360, 0.28, 8], [0, -0.06, -90], sidewalk);
    // Double yellow center divider lines
    box('nyc-yellow-line-1', [360, 0.02, 0.16], [0, -0.08, -61.8], roadYellow);
    box('nyc-yellow-line-2', [360, 0.02, 0.16], [0, -0.08, -62.2], roadYellow);
    // Dashed white lane dividers
    for (let lx = -160; lx <= 160; lx += 8) {
      box(`nyc-lane-n-${lx}`, [4.2, 0.02, 0.14], [lx, -0.08, -51.0], roadWhite);
      box(`nyc-lane-s-${lx}`, [4.2, 0.02, 0.14], [lx, -0.08, -73.0], roadWhite);
    }
    // Zebra crosswalks at avenue crossings
    [-65, 0, 65].forEach((crossX) => {
      for (let cz = -86; cz <= -38; cz += 2.2) {
        box(`nyc-cross-${crossX}-${cz}`, [4.8, 0.02, 1.1], [crossX, -0.08, cz], roadWhite);
      }
    });
    // Streetlamps along North and South sidewalks
    for (let lx = -140; lx <= 140; lx += 14) {
      cylinder(`nyc-lamp-pole-n-${lx}`, 4.2, 0.18, [lx, 2.05, -34], darkWood);
      box(`nyc-lamp-arm-n-${lx}`, [0.4, 0.15, 0.4], [lx, 4.2, -34], goldBrass);
      sphere(`nyc-lamp-bulb-n-${lx}`, 0.38, [lx, 3.9, -34], streetlampGlow);

      cylinder(`nyc-lamp-pole-s-${lx}`, 4.2, 0.18, [lx, 2.05, -90], darkWood);
      box(`nyc-lamp-arm-s-${lx}`, [0.4, 0.15, 0.4], [lx, 4.2, -90], goldBrass);
      sphere(`nyc-lamp-bulb-s-${lx}`, 0.38, [lx, 3.9, -90], streetlampGlow);
    }
    // NYC Yellow Taxis along avenue
    [
      { x: -35, z: -55, r: 0 },
      { x: 12,  z: -69, r: Math.PI },
      { x: 70,  z: -55, r: 0 },
      { x: -85, z: -69, r: Math.PI },
    ].forEach((cab, idx) => {
      const cNode = new TransformNode(`nyc-cab-${idx}`, scene);
      cNode.position.set(cab.x, 0, cab.z); cNode.rotation.y = cab.r;
      box(`cab-body-${idx}`, [4.6, 1.1, 2.0], [0, 0.65, 0], taxiYellow, cNode);
      box(`cab-cabin-${idx}`, [2.4, 0.8, 1.8], [-0.2, 1.45, 0], glass, cNode);
      box(`cab-light-${idx}`, [0.7, 0.25, 0.35], [-0.2, 1.95, 0], white, cNode);
      for (const wx of [-1.5, 1.5]) for (const wz of [-1.05, 1.05]) {
        cylinder(`cab-wheel-${idx}-${wx}-${wz}`, 0.25, 0.65, [wx, 0.33, wz], charcoal, cNode);
      }
    });

    // Lush New York street trees along North and South sidewalks & park verge
    for (let tx = -145; tx <= 145; tx += 12) {
      cylinder(`nyc-tree-trunk-n-${tx}`, 5.6, 0.38, [tx + 3.5, 2.8, -32.5], treeBark);
      sphere(`nyc-tree-crown1-n-${tx}`, 3.2, [tx + 3.5, 5.8, -32.5], greenDark);
      sphere(`nyc-tree-crown2-n-${tx}`, 2.6, [tx + 3.5, 7.2, -32.5], green);
      sphere(`nyc-tree-crown3-n-${tx}`, 2.0, [tx + 3.5, 8.4, -32.5], autumnLeaves);

      cylinder(`nyc-tree-trunk-s-${tx}`, 5.6, 0.38, [tx + 3.5, 2.8, -91.5], treeBark);
      sphere(`nyc-tree-crown1-s-${tx}`, 3.2, [tx + 3.5, 5.8, -91.5], greenDark);
      sphere(`nyc-tree-crown2-s-${tx}`, 2.6, [tx + 3.5, 7.2, -91.5], green);
      sphere(`nyc-tree-crown3-s-${tx}`, 2.0, [tx + 3.5, 8.4, -91.5], autumnLeaves);
    }

    // ==========================================
    // 0. VILLA ARRIVAL: GATE, FORECOURT & FIVE-STOREY FACADE
    // The exterior envelope is 24m × 21m ≈ 504m². Only the arrival court and
    // grand hall are walkable in this MVP; the upper levels create the villa scale.
    // ==========================================
    box('royal-estate-plinth', [64, 0.16, 40], [0, -0.16, -15], charcoal);
    box('royal-estate-lawn', [60, 0.08, 36], [0, -0.05, -15], greenDark);
    // Winter is the current seasonal layer: frost rests on the estate without hiding its villa materials.
    box('winter-frost-lawn', [59.8, 0.025, 35.8], [0, 0.018, -15], winterSnow);
    box('villa-site-plinth', [46, 0.16, 22], [9, -0.12, -10], charcoal);
    box('villa-courtyard-stone', [22.8, 0.08, 14], [0, -0.05, -14.1], stoneTravertine);
    box('arrival-walkway', [4.4, 0.05, 13.2], [0, 0.015, -13.4], cream);
    for (let z = -19.5; z <= -7.5; z += 1.1) {
      box(`arrival-walkway-seam-${z}`, [4.5, 0.012, 0.035], [0, 0.06, z], brass);
    }
    // Gate at the spawn edge: two stone pylons, warm lamps and a café nameplate.
    for (const x of [-4.2, 4.2]) {
      box(`gate-pillar-${x}`, [0.78, 3.6, 0.78], [x, 1.8, -20.3], stoneTravertine);
      box(`gate-cap-${x}`, [1.04, 0.22, 1.04], [x, 3.68, -20.3], goldBrass);
      sphere(`gate-lamp-${x}`, 0.28, [x, 3.36, -20.02], lampGlow);
    }
    box('gate-crossbeam', [9.2, 0.46, 0.58], [0, 3.28, -20.3], darkWood);
    const gateSignTex = new DynamicTexture('gate-sign-tex', { width: 1024, height: 220 }, scene, false);
    const gateCtx = gateSignTex.getContext() as unknown as CanvasRenderingContext2D;
    gateCtx.fillStyle = '#171411'; gateCtx.fillRect(0, 0, 1024, 220);
    gateCtx.strokeStyle = '#c9a15c'; gateCtx.lineWidth = 10; gateCtx.strokeRect(18, 18, 988, 184);
    gateCtx.fillStyle = '#f1d8a6'; gateCtx.font = '600 68px Georgia, serif'; gateCtx.textAlign = 'center'; gateCtx.textBaseline = 'middle';
    gateCtx.fillText('CAFÉTRADER  ·  VILLA SOCIAL CLUB', 512, 110);
    gateSignTex.update();
    const gateSignMat = new StandardMaterial('gate-sign-mat', scene);
    gateSignMat.diffuseTexture = gateSignTex; gateSignMat.emissiveColor = new Color3(0.52, 0.39, 0.2); gateSignMat.backFaceCulling = false;
    const gateSign = MeshBuilder.CreatePlane('gate-sign', { width: 6.2, height: 1.32 }, scene);
    gateSign.position.set(0, 3.28, -20.0); gateSign.rotation.y = Math.PI; gateSign.material = gateSignMat;

    // Low garden walls and rhythmic planting guide a new visitor from the gate to the door.
    for (const x of [-8.9, 8.9]) {
      box(`garden-wall-${x}`, [0.5, 0.72, 11.6], [x, 0.36, -14.2], stoneHearth);
      for (let z = -18.8; z < -8.2; z += 2.1) {
        cylinder(`garden-planter-${x}-${z}`, 0.42, 0.46, [x * 0.87, 0.24, z], rust);
        sphere(`garden-crown-${x}-${z}`, 0.88, [x * 0.87, 0.88, z], greenDark);
      }
    }
    // Royal forecourt: an outdoor map wider than the villa itself, with a fountain and pavilions.
    box('royal-boulevard', [5.8, 0.055, 12.0], [0, 0.012, -26.2], cream);
    cylinder('royal-fountain-basin', 0.28, 5.2, [0, 0.12, -26.2], stoneTravertine);
    cylinder('royal-fountain-water', 0.03, 4.55, [0, 0.28, -26.2], balconyGlass);
    cylinder('royal-fountain-center', 1.15, 0.38, [0, 0.85, -26.2], marbleWhite);
    sphere('royal-fountain-crown', 0.46, [0, 1.62, -26.2], lampGlow);

    // Outdoor seasonal market tableau — decorative context, never trading advice or a live price feed.
    const winterChartTexture = new DynamicTexture('winter-chart-texture', { width: 1024, height: 620 }, scene, false);
    const winterChartCtx = winterChartTexture.getContext() as unknown as CanvasRenderingContext2D;
    winterChartCtx.fillStyle = '#0d1a20'; winterChartCtx.fillRect(0, 0, 1024, 620);
    winterChartCtx.fillStyle = '#d9eef0'; winterChartCtx.font = '600 52px Georgia, serif'; winterChartCtx.textAlign = 'left';
    winterChartCtx.fillText('WINTER MARKET OUTLOOK', 60, 78);
    winterChartCtx.fillStyle = '#8fbcc4'; winterChartCtx.font = '24px "DM Sans", sans-serif';
    winterChartCtx.fillText('Seasonal view · Observe, do not chase', 62, 120);
    winterChartCtx.strokeStyle = '#29424b'; winterChartCtx.lineWidth = 2;
    for (let y = 180; y <= 490; y += 62) { winterChartCtx.beginPath(); winterChartCtx.moveTo(62, y); winterChartCtx.lineTo(962, y); winterChartCtx.stroke(); }
    winterChartCtx.beginPath(); winterChartCtx.strokeStyle = '#8fd5df'; winterChartCtx.lineWidth = 8;
    [410, 388, 425, 355, 372, 318, 340, 270, 292, 232, 255].forEach((y, i) => {
      const x = 76 + i * 84;
      if (i === 0) winterChartCtx.moveTo(x, y); else winterChartCtx.lineTo(x, y);
    });
    winterChartCtx.stroke();
    winterChartCtx.fillStyle = '#d8a85b'; winterChartCtx.font = 'bold 28px monospace';
    winterChartCtx.fillText('❄  WINTER · CALM · LONG VIEW', 62, 558);
    winterChartTexture.update();
    const winterChartMat = new StandardMaterial('winter-chart-mat', scene);
    winterChartMat.diffuseTexture = winterChartTexture; winterChartMat.emissiveColor = new Color3(0.38, 0.52, 0.54); winterChartMat.backFaceCulling = false;
    box('winter-chart-plinth', [6.4, 0.38, 0.7], [11.4, 0.3, -26.3], charcoal);
    box('winter-chart-frame', [5.9, 3.85, 0.20], [11.4, 2.38, -26.3], darkWood);
    const winterChart = MeshBuilder.CreatePlane('winter-chart-board', { width: 5.45, height: 3.35 }, scene);
    winterChart.position.set(11.4, 2.38, -26.42); winterChart.material = winterChartMat;
    box('winter-chart-top-brass', [6.1, 0.10, 0.28], [11.4, 4.34, -26.34], goldBrass);
    sphere('winter-chart-lamp', 0.22, [8.62, 4.10, -26.40], iceBlue);
    sphere('winter-chart-lamp-right', 0.22, [14.18, 4.10, -26.40], iceBlue);

    // Light animated snowfall stays outdoors (in front of the villa only) to preserve a clear indoor café view.
    for (let i = 0; i < 34; i += 1) {
      const x = -22 + ((i * 11) % 44);
      const z = -33 + ((i * 7) % 24);
      const baseY = 2.6 + (i % 8) * 1.02;
      const flake = sphere(`winter-snowflake-${i}`, i % 4 === 0 ? 0.09 : 0.055, [x, baseY, z], winterSnow);
      winterSnowflakes.push({ mesh: flake, phase: i * 0.71, baseX: x, baseY });
    }
    for (const x of [-16, 16]) {
      box(`royal-pavilion-${x}`, [5.2, 0.22, 5.2], [x, 0.04, -24.0], stoneTravertine);
      for (const dx of [-2.0, 2.0]) for (const dz of [-2.0, 2.0]) {
        cylinder(`royal-pavilion-column-${x}-${dx}-${dz}`, 3.1, 0.28, [x + dx, 1.55, -24.0 + dz], marbleWhite);
      }
      box(`royal-pavilion-roof-${x}`, [5.6, 0.25, 5.6], [x, 3.18, -24.0], royalVelvet);
      sphere(`royal-pavilion-lamp-${x}`, 0.30, [x, 2.8, -24.0], lampGlow);
    }
    for (const z of [-11.4, -9.2]) {
      box(`arrival-step-${z}`, [7.0, 0.16, 0.55], [0, (z + 11.4) * 0.1 + 0.08, z], stoneTravertine);
    }

    // Front elevation: five visible floors around the existing open glass entrance.
    // The bands give the building a true villa-café silhouette without making all levels playable yet.
    box('villa-front-left-wing', [9.0, 16.8, 0.52], [-7.5, 8.4, -7.26], darkWood);
    box('villa-front-right-wing', [9.0, 16.8, 0.52], [7.5, 8.4, -7.26], darkWood);
    box('villa-front-entry-crown', [6.0, 10.0, 0.52], [0, 11.8, -7.26], charcoal);
    for (let level = 1; level <= 5; level += 1) {
      const y = level * 3.25;
      box(`villa-floor-band-${level}`, [24.2, 0.22, 0.72], [0, y, -7.58], goldBrass);
      for (const x of [-9.1, -6.6, -4.1, 4.1, 6.6, 9.1]) {
        box(`villa-window-${level}-${x}`, [1.52, 2.0, 0.05], [x, y + 1.46, -7.59], glass);
        box(`villa-window-sill-${level}-${x}`, [1.72, 0.10, 0.13], [x, y + 0.42, -7.68], brass);
        sphere(`villa-window-glow-${level}-${x}`, 0.18, [x, y + 1.42, -7.62], lampGlow);
      }
    }
    box('villa-roof-cornice', [24.6, 0.38, 0.92], [0, 16.58, -7.56], goldBrass);
    box('villa-roofline', [25.2, 0.34, 2.0], [0, 16.88, -6.9], charcoal);
    // ==========================================
    // LUXURY AUTOMATIC SLIDING GLASS DOORS (CỬA KÍNH PHẲNG TRƯỢT MỞ TỰ ĐỘNG)
    // Flat tempered glass double sliding doors that smoothly slide open when
    // a player walks close, and slide closed when walking away.
    // ==========================================
    const autoDoorZ = -7.36;

    // 1. Grand Gold Portal Framing & Overhead Sliding Track Housing
    box('auto-door-portal-header', [5.8, 0.28, 0.26], [0, 3.46, autoDoorZ], goldBrass);
    box('auto-door-track-box', [5.6, 0.20, 0.28], [0, 3.22, autoDoorZ], darkWood);
    box('auto-door-track-trim', [5.62, 0.04, 0.29], [0, 3.10, autoDoorZ], goldBrass);

    // Radar motion sensor unit mounted on the center track box
    box('auto-door-sensor-unit', [0.42, 0.10, 0.12], [0, 3.16, autoDoorZ - 0.15], charcoal);
    const autoSensorIndicator = sphere('auto-door-sensor-light', 0.05, [0, 3.14, autoDoorZ - 0.21], lampGlow);

    // Warm entrance downlight casting glow over the threshold
    const autoDoorLight = new PointLight('auto-door-light', new Vector3(0, 3.1, autoDoorZ), scene);
    autoDoorLight.diffuse = new Color3(1.0, 0.78, 0.45);
    autoDoorLight.intensity = 0.85;
    autoDoorLight.range = 8.5;

    // Symmetrical Travertine entrance pilasters flanking the portal at x = ±2.8m
    for (const x of [-2.8, 2.8]) {
      cylinder(`entry-column-${x}`, 3.42, 0.24, [x, 1.71, autoDoorZ], stoneTravertine);
      sphere(`entry-sconce-${x}`, 0.16, [x, 2.4, autoDoorZ + 0.12], lampGlow);
    }

    // 2. Fixed Sidelite Glass Panels (Vách kính cố định hai bên)
    for (const sign of [-1, 1]) {
      const sideliteX = sign * 2.12;
      box(`auto-sidelite-glass-${sign}`, [1.28, 3.02, 0.035], [sideliteX, 1.53, autoDoorZ], revolvingGlass);
      box(`auto-sidelite-top-${sign}`, [1.32, 0.055, 0.065], [sideliteX, 3.03, autoDoorZ], goldBrass);
      box(`auto-sidelite-bot-${sign}`, [1.32, 0.075, 0.065], [sideliteX, 0.05, autoDoorZ], goldBrass);
      box(`auto-sidelite-mullion-${sign}`, [0.055, 3.05, 0.065], [sign * 1.48, 1.53, autoDoorZ], goldBrass);
    }

    // Sleek floor guide track & black marble threshold
    box('auto-floor-track', [5.6, 0.018, 0.16], [0, 0.01, autoDoorZ], goldBrass);
    box('auto-threshold-plate', [3.4, 0.015, 0.65], [0, 0.008, autoDoorZ], marbleBlack);

    // 3. Two Moving Sliding Glass Doors (Left & Right Wings)
    const autoDoorLeft = new TransformNode('auto-door-left', scene);
    autoDoorLeft.position.set(-0.74, 0, autoDoorZ);

    const autoDoorRight = new TransformNode('auto-door-right', scene);
    autoDoorRight.position.set(0.74, 0, autoDoorZ);

    // Left Sliding Door Panel (moves left when opening)
    box('door-glass-l', [1.44, 2.94, 0.032], [0, 1.53, -0.015], revolvingGlass, autoDoorLeft);
    box('door-frame-top-l', [1.48, 0.06, 0.05], [0, 2.99, -0.015], goldBrass, autoDoorLeft);
    box('door-frame-bot-l', [1.48, 0.08, 0.05], [0, 0.06, -0.015], goldBrass, autoDoorLeft);
    box('door-brush-bot-l', [1.48, 0.03, 0.02], [0, 0.015, -0.015], charcoal, autoDoorLeft);
    box('door-stile-outer-l', [0.05, 2.98, 0.05], [-0.71, 1.53, -0.015], goldBrass, autoDoorLeft);
    box('door-stile-inner-l', [0.05, 2.98, 0.05], [0.71, 1.53, -0.015], goldBrass, autoDoorLeft);
    box('door-rubber-seal-l', [0.016, 2.94, 0.025], [0.74, 1.53, -0.015], charcoal, autoDoorLeft);
    // Luxury vertical cylindrical handle bar on left door
    const handleL = cylinder('door-handle-l', 1.35, 0.032, [0.58, 1.38, 0.025], goldBrass, autoDoorLeft);
    cylinder('door-handle-stud-l1', 0.06, 0.02, [0.58, 1.90, 0.005], brass, autoDoorLeft).rotation.x = Math.PI / 2;
    cylinder('door-handle-stud-l2', 0.06, 0.02, [0.58, 0.86, 0.005], brass, autoDoorLeft).rotation.x = Math.PI / 2;
    box('door-safety-band-l', [1.38, 0.028, 0.036], [0, 1.42, -0.015], goldBrass, autoDoorLeft);

    // Right Sliding Door Panel (moves right when opening)
    box('door-glass-r', [1.44, 2.94, 0.032], [0, 1.53, 0.015], revolvingGlass, autoDoorRight);
    box('door-frame-top-r', [1.48, 0.06, 0.05], [0, 2.99, 0.015], goldBrass, autoDoorRight);
    box('door-frame-bot-r', [1.48, 0.08, 0.05], [0, 0.06, 0.015], goldBrass, autoDoorRight);
    box('door-brush-bot-r', [1.48, 0.03, 0.02], [0, 0.015, 0.015], charcoal, autoDoorRight);
    box('door-stile-outer-r', [0.05, 2.98, 0.05], [0.71, 1.53, 0.015], goldBrass, autoDoorRight);
    box('door-stile-inner-r', [0.05, 2.98, 0.05], [-0.71, 1.53, 0.015], goldBrass, autoDoorRight);
    box('door-rubber-seal-r', [0.016, 2.94, 0.025], [-0.74, 1.53, 0.015], charcoal, autoDoorRight);
    // Luxury vertical cylindrical handle bar on right door
    const handleR = cylinder('door-handle-r', 1.35, 0.032, [-0.58, 1.38, -0.025], goldBrass, autoDoorRight);
    cylinder('door-handle-stud-r1', 0.06, 0.02, [-0.58, 1.90, -0.005], brass, autoDoorRight).rotation.x = Math.PI / 2;
    cylinder('door-handle-stud-r2', 0.06, 0.02, [-0.58, 0.86, -0.005], brass, autoDoorRight).rotation.x = Math.PI / 2;
    box('door-safety-band-r', [1.38, 0.028, 0.036], [0, 1.42, 0.015], goldBrass, autoDoorRight);
    const entryLight = new PointLight('arrival-gate-glow', new Vector3(0, 3.2, -11.2), scene);
    entryLight.diffuse = new Color3(1, 0.62, 0.32); entryLight.intensity = 0.92; entryLight.range = 18;

    // Floors 3–8 are real elevated royal terraces, reached with the Royal Lift selector.
    // Sparse repeated geometry keeps the eight-floor scene practical for a browser prototype.
    for (let floor = 3; floor <= 8; floor += 1) {
      const y = ROYAL_FLOOR_HEIGHTS[floor - 1];
      const accent = floor % 2 ? royalVelvet : marbleWhite;
      box(`royal-floor-deck-${floor}`, [20.8, 0.20, 13.0], [0, y, 0.1], floorMaterial);
      cylinder(`royal-floor-rug-${floor}`, 0.012, 7.0, [0, y + 0.11, 1.2], accent);
      // Front rail split into left and right wings, opening a central portal to the scenic outdoor balcony
      box(`royal-floor-rail-front-l-${floor}`, [5.8, 0.85, 0.10], [-6.9, y + 0.52, -6.05], goldBrass);
      box(`royal-floor-rail-front-r-${floor}`, [5.8, 0.85, 0.10], [6.9, y + 0.52, -6.05], goldBrass);
      box(`royal-floor-rail-back-${floor}`, [20.5, 0.85, 0.10], [0, y + 0.52, 6.05], goldBrass);
      for (const x of [-9.6, -4.2, 4.2, 9.6]) {
        cylinder(`royal-floor-post-front-${floor}-${x}`, 0.86, 0.055, [x, y + 0.52, -6.05], goldBrass);
      }
      for (const x of [-9.6, -4.8, 0, 4.8, 9.6]) {
        cylinder(`royal-floor-post-back-${floor}-${x}`, 0.86, 0.055, [x, y + 0.52, 6.05], goldBrass);
      }
      box(`royal-floor-dais-${floor}`, [4.0, 0.22, 2.4], [0, y + 0.18, 1.2], marbleWhite);
      cylinder(`royal-floor-table-${floor}`, 0.72, 1.05, [0, y + 0.64, 1.2], goldBrass);
      for (const x of [-1.55, 1.55]) box(`royal-floor-sofa-${floor}-${x}`, [1.35, 0.66, 1.05], [x, y + 0.42, 1.2], accent);

      // ==========================================
      // SCENIC OUTDOOR BALCONY — GÓC CHILL TẦNG 3–8
      // ==========================================
      const balconyDeckMat = floor === 7 ? marbleWhite : floorMaterial;
      const balconyChairMat = floor % 2 === 0 ? cognacLeather : royalVelvet;

      // Cantilevered deck extending forward into the open air above the courtyard & fountain
      box(`balcony-deck-${floor}`, [8.6, 0.22, 3.2], [0, y, -7.65], balconyDeckMat);
      box(`balcony-deck-trim-${floor}`, [8.72, 0.08, 3.28], [0, y - 0.08, -7.65], goldBrass);
      for (const dx of [-3.4, -1.2, 1.2, 3.4]) {
        cylinder(`balcony-bracket-${floor}-${dx}`, 2.5, 0.10, [dx, y - 0.72, -6.85], goldBrass);
      }

      // Balustrade: polished brass top & base rails with crystal-clear tempered balcony glass
      box(`balcony-rail-f-${floor}`, [8.6, 0.08, 0.12], [0, y + 0.96, -9.22], goldBrass);
      box(`balcony-base-f-${floor}`, [8.6, 0.06, 0.10], [0, y + 0.06, -9.22], goldBrass);
      box(`balcony-glass-f-${floor}`, [8.4, 0.84, 0.04], [0, y + 0.51, -9.22], balconyGlass);

      box(`balcony-rail-l-${floor}`, [0.12, 0.08, 3.16], [-4.26, y + 0.96, -7.65], goldBrass);
      box(`balcony-base-l-${floor}`, [0.10, 0.06, 3.16], [-4.26, y + 0.06, -7.65], goldBrass);
      box(`balcony-glass-l-${floor}`, [0.04, 0.84, 3.06], [-4.26, y + 0.51, -7.65], balconyGlass);

      box(`balcony-rail-r-${floor}`, [0.12, 0.08, 3.16], [4.26, y + 0.96, -7.65], goldBrass);
      box(`balcony-base-r-${floor}`, [0.10, 0.06, 3.16], [4.26, y + 0.06, -7.65], goldBrass);
      box(`balcony-glass-r-${floor}`, [0.04, 0.84, 3.06], [4.26, y + 0.51, -7.65], balconyGlass);

      for (const x of [-4.26, -2.13, 0, 2.13, 4.26]) {
        cylinder(`balcony-post-f-${floor}-${x}`, 0.96, 0.065, [x, y + 0.51, -9.22], goldBrass);
      }
      for (const z of [-8.4, -6.8]) {
        cylinder(`balcony-post-l-${floor}-${z}`, 0.96, 0.065, [-4.26, y + 0.51, z], goldBrass);
        cylinder(`balcony-post-r-${floor}-${z}`, 0.96, 0.065, [4.26, y + 0.51, z], goldBrass);
      }

      // Outdoor round bistro table facing the peaceful garden & fountain below
      cylinder(`balcony-table-base-${floor}`, 0.06, 0.65, [0, y + 0.04, -7.8], goldBrass);
      cylinder(`balcony-table-pole-${floor}`, 0.62, 0.10, [0, y + 0.35, -7.8], goldBrass);
      const bTableRim = cylinder(`balcony-table-rim-${floor}`, 0.08, 1.30, [0, y + 0.67, -7.8], goldBrass);
      const bTableTop = cylinder(`balcony-table-top-${floor}`, 0.07, 1.24, [0, y + 0.68, -7.8], floor % 2 === 0 ? marbleWhite : marbleBlack);

      // Tabletop warm amber lantern & porcelain coffee cups
      cylinder(`balcony-lantern-b-${floor}`, 0.06, 0.18, [0, y + 0.74, -7.8], brass);
      sphere(`balcony-lantern-bulb-${floor}`, 0.13, [0, y + 0.84, -7.8], lampGlow);
      cylinder(`balcony-lantern-cap-${floor}`, 0.05, 0.20, [0, y + 0.93, -7.8], goldBrass);

      cylinder(`balcony-saucer-1-${floor}`, 0.02, 0.22, [-0.32, y + 0.72, -7.68], white);
      cylinder(`balcony-saucer-2-${floor}`, 0.02, 0.22, [0.32, y + 0.72, -7.92], white);
      cylinder(`balcony-cup-1-${floor}`, 0.11, 0.14, [-0.32, y + 0.78, -7.68], white);
      cylinder(`balcony-cup-2-${floor}`, 0.11, 0.14, [0.32, y + 0.78, -7.92], white);
      cylinder(`balcony-coffee-1-${floor}`, 0.02, 0.11, [-0.32, y + 0.82, -7.68], espresso);
      cylinder(`balcony-coffee-2-${floor}`, 0.02, 0.11, [0.32, y + 0.82, -7.92], espresso);

      // Pair of comfortable outdoor terrace armchairs angled toward the vista
      const seatIdBalconyL = `balcony-${floor}-seat-1`;
      const seatIdBalconyR = `balcony-${floor}-seat-2`;
      seatPositions.set(seatIdBalconyL, { x: -1.45, y, z: -7.8, facing: Math.PI * 0.42, tableIndex: 10 + floor, seatIndex: 1 });
      seatPositions.set(seatIdBalconyR, { x: 1.45, y, z: -7.8, facing: -Math.PI * 0.42, tableIndex: 10 + floor, seatIndex: 2 });

      // Clicking table sits player at seat 1
      [bTableTop, bTableRim].forEach(m => { m.metadata = { seatId: seatIdBalconyL }; });

      const c1 = new TransformNode(`balcony-chair-l-${floor}`, scene);
      c1.position.set(-1.45, y, -7.8); c1.rotation.y = Math.PI * 0.42;
      const c1s = box(`c1-seat-${floor}`, [0.75, 0.14, 0.72], [0, 0.38, 0], balconyChairMat, c1);
      const c1b = box(`c1-back-${floor}`, [0.75, 0.52, 0.12], [0, 0.68, -0.32], balconyChairMat, c1);
      const c1c = box(`c1-cushion-${floor}`, [0.65, 0.08, 0.62], [0, 0.48, 0.02], floor % 2 === 0 ? cognacLeather : royalVelvet, c1);
      [c1s, c1b, c1c].forEach(m => { m.metadata = { seatId: seatIdBalconyL }; });
      for (const dx of [-0.32, 0.32]) for (const dz of [-0.28, 0.28]) {
        const c1Leg = cylinder(`c1-leg-${floor}-${dx}-${dz}`, 0.36, 0.06, [dx, 0.18, dz], goldBrass, c1);
        c1Leg.metadata = { seatId: seatIdBalconyL };
      }

      const c2 = new TransformNode(`balcony-chair-r-${floor}`, scene);
      c2.position.set(1.45, y, -7.8); c2.rotation.y = -Math.PI * 0.42;
      const c2s = box(`c2-seat-${floor}`, [0.75, 0.14, 0.72], [0, 0.38, 0], balconyChairMat, c2);
      const c2b = box(`c2-back-${floor}`, [0.75, 0.52, 0.12], [0, 0.68, -0.32], balconyChairMat, c2);
      const c2c = box(`c2-cushion-${floor}`, [0.65, 0.08, 0.62], [0, 0.48, 0.02], floor % 2 === 0 ? cognacLeather : royalVelvet, c2);
      [c2s, c2b, c2c].forEach(m => { m.metadata = { seatId: seatIdBalconyR }; });
      for (const dx of [-0.32, 0.32]) for (const dz of [-0.28, 0.28]) {
        const c2Leg = cylinder(`c2-leg-${floor}-${dx}-${dz}`, 0.36, 0.06, [dx, 0.18, dz], goldBrass, c2);
        c2Leg.metadata = { seatId: seatIdBalconyR };
      }

      // Corner garden planters with lush boxwood shrubs
      cylinder(`balcony-planter-l-${floor}`, 0.45, 0.48, [-3.75, y + 0.24, -8.7], rust);
      sphere(`balcony-bush-l-${floor}`, 0.64, [-3.75, y + 0.64, -8.7], greenDark);
      cylinder(`balcony-planter-r-${floor}`, 0.45, 0.48, [3.75, y + 0.24, -8.7], rust);
      sphere(`balcony-bush-r-${floor}`, 0.64, [3.75, y + 0.64, -8.7], greenDark);

      // Dedicated brass nameplate on the balcony railing
      box(`balcony-plaque-${floor}`, [2.4, 0.22, 0.04], [0, y + 0.68, -9.26], goldBrass);

      collisionDiscs.push({ x: 0, y, z: -7.8, r: 0.95 });

      // Floors 6–8 become distinct classical hotel salons, guided by the supplied reference:
      // Crown Library & Study (6), Imperial Terrace Salon (7), Sky Observatory Salon (8).
      if (floor >= 6) {
        const salonName = floor === 6 ? 'CROWN LIBRARY & STUDY' : floor === 7 ? 'IMPERIAL TERRACE SALON' : 'SKY OBSERVATORY SALON';
        const ceilingY = floor === 8 ? y + 4.85 : y + 3.14;
        const salonRug = floor === 7 ? royalVelvet : rugMat1;

        // Classical envelope: walls, richly framed panoramic glazing, moulding and a coffer ceiling.
        box(`salon-side-west-${floor}`, [0.16, ceilingY - y, 11.3], [-9.85, y + (ceilingY - y) / 2, 0], cream);
        box(`salon-side-east-${floor}`, [0.16, ceilingY - y, 11.3], [9.85, y + (ceilingY - y) / 2, 0], cream);
        box(`salon-back-${floor}`, [19.6, ceilingY - y, 0.16], [0, y + (ceilingY - y) / 2, 5.72], cream);
        box(`salon-ceiling-${floor}`, [19.6, 0.14, 11.35], [0, ceilingY, 0], darkWood);
        for (const z of [-4.5, -1.5, 1.5, 4.5]) box(`salon-coffer-z-${floor}-${z}`, [19.1, 0.18, 0.12], [0, ceilingY - 0.10, z], goldBrass);
        for (const x of [-7.5, -2.5, 2.5, 7.5]) box(`salon-coffer-x-${floor}-${x}`, [0.12, 0.18, 10.9], [x, ceilingY - 0.10, 0], brass);
        box(`salon-cornice-west-${floor}`, [0.34, 0.28, 11.55], [-9.68, ceilingY - 0.18, 0], goldBrass);
        box(`salon-cornice-east-${floor}`, [0.34, 0.28, 11.55], [9.68, ceilingY - 0.18, 0], goldBrass);

        // A full-width glass wall with central French doors leading to the outdoor Chill balcony
        box(`salon-panorama-l-${floor}`, [6.4, 2.55, 0.06], [-5.6, y + 1.72, -5.72], glass);
        box(`salon-panorama-r-${floor}`, [6.4, 2.55, 0.06], [5.6, y + 1.72, -5.72], glass);
        box(`salon-french-door-l-${floor}`, [2.05, 2.45, 0.05], [-1.15, y + 1.68, -6.15], glass);
        box(`salon-french-door-r-${floor}`, [2.05, 2.45, 0.05], [1.15, y + 1.68, -6.15], glass);
        box(`salon-french-frame-l-${floor}`, [2.12, 2.52, 0.08], [-1.15, y + 1.68, -6.15], goldBrass);
        box(`salon-french-frame-r-${floor}`, [2.12, 2.52, 0.08], [1.15, y + 1.68, -6.15], goldBrass);
        for (const x of [-8.25, -4.1, 4.1, 8.25]) {
          box(`salon-window-mullion-${floor}-${x}`, [0.12, 2.8, 0.18], [x, y + 1.72, -5.82], goldBrass);
          box(`salon-drape-${floor}-${x}`, [0.34, 2.55, 0.25], [x + 0.35, y + 1.72, -5.55], floor === 7 ? royalVelvet : cognacLeather);
        }
        box(`salon-window-top-${floor}`, [18.1, 0.18, 0.25], [0, y + 3.02, -5.78], darkWood);

        // A warm stone fireplace anchors the west wall, flanked by sconces and an art plinth.
        const fireX = -7.85;
        const fireZ = 2.55;
        box(`salon-hearth-${floor}`, [3.25, 0.18, 1.12], [fireX, y + 0.10, fireZ], stoneTravertine);
        box(`salon-firebox-${floor}`, [2.15, 1.55, 0.24], [fireX, y + 0.90, fireZ + 0.37], stoneHearth);
        box(`salon-fire-pillar-l-${floor}`, [0.38, 2.05, 0.55], [fireX - 1.23, y + 1.02, fireZ], stoneTravertine);
        box(`salon-fire-pillar-r-${floor}`, [0.38, 2.05, 0.55], [fireX + 1.23, y + 1.02, fireZ], stoneTravertine);
        box(`salon-fire-mantel-${floor}`, [3.0, 0.18, 0.62], [fireX, y + 2.10, fireZ], darkWood);
        box(`salon-fire-inlay-${floor}`, [2.76, 0.03, 0.05], [fireX, y + 2.21, fireZ - 0.31], goldBrass);
        box(`salon-fire-embers-${floor}`, [1.45, 0.07, 0.38], [fireX, y + 0.28, fireZ - 0.04], fireEmber);
        for (const dx of [-0.42, 0, 0.42]) {
          const flame = sphere(`salon-fire-flame-${floor}-${dx}`, 0.22, [fireX + dx, y + 0.57 + Math.abs(dx) * 0.22, fireZ - 0.04], flameMat);
          flame.scaling.set(0.8, 1.65, 0.8);
        }
        for (const dx of [-1.62, 1.62]) sphere(`salon-fire-sconce-${floor}-${dx}`, 0.13, [fireX + dx, y + 2.52, fireZ - 0.22], lampGlow);

        // Leather conversation set, carved coffee table and executive desk with a wide work surface.
        box(`salon-rug-${floor}`, [8.6, 0.018, 6.4], [-0.45, y + 0.02, 1.55], salonRug);
        box(`salon-rug-border-n-${floor}`, [8.85, 0.026, 0.10], [-0.45, y + 0.03, -1.70], goldBrass);
        box(`salon-rug-border-s-${floor}`, [8.85, 0.026, 0.10], [-0.45, y + 0.03, 4.80], goldBrass);
        box(`salon-sofa-seat-${floor}`, [3.4, 0.46, 1.22], [-1.6, y + 0.38, 2.10], cognacLeather);
        box(`salon-sofa-back-${floor}`, [3.4, 0.85, 0.22], [-1.6, y + 0.88, 2.62], cognacLeather);
        for (const dx of [-1.38, 1.38]) box(`salon-sofa-arm-${floor}-${dx}`, [0.28, 0.68, 1.18], [-1.6 + dx, y + 0.64, 2.10], cognacLeather);
        box(`salon-coffee-table-${floor}`, [1.8, 0.28, 1.04], [-1.6, y + 0.62, 0.12], woodLight);
        for (const dx of [-0.68, 0.68]) for (const dz of [-0.36, 0.36]) cylinder(`salon-table-leg-${floor}-${dx}-${dz}`, 0.58, 0.07, [-1.6 + dx, y + 0.31, 0.12 + dz], darkWood);
        box(`salon-desk-${floor}`, [2.6, 0.86, 1.35], [5.25, y + 0.45, 2.35], darkWood);
        box(`salon-desk-top-${floor}`, [2.8, 0.10, 1.50], [5.25, y + 0.92, 2.35], marbleBlack);
        box(`salon-desk-inlay-${floor}`, [2.35, 0.02, 1.12], [5.25, y + 0.98, 2.35], greenDark);
        box(`salon-desk-chair-${floor}`, [0.88, 0.65, 0.84], [5.25, y + 0.38, 3.55], cognacLeather);
        sphere(`salon-desk-lamp-${floor}`, 0.14, [4.65, y + 1.22, 2.15], lampGlow);

        // Hi-fi speakers and a chandelier provide the hotel-salon atmosphere from the reference.
        for (const x of [-6.15, 6.15]) {
          box(`salon-speaker-${floor}-${x}`, [0.62, 1.05, 0.40], [x, y + 2.32, 5.45], charcoal);
          sphere(`salon-speaker-driver-${floor}-${x}`, 0.20, [x, y + 2.35, 5.20], marbleBlack);
        }
        const chY = ceilingY - 0.72;
        cylinder(`salon-chandelier-ring-${floor}`, 0.10, 1.85, [0, chY, 0.15], goldBrass).rotation.x = Math.PI / 2;
        cylinder(`salon-chandelier-cord-${floor}`, Math.max(0.5, ceilingY - y - 1.15), 0.035, [0, chY + 0.30, 0.15], charcoal);
        for (let i = 0; i < 8; i += 1) {
          const a = (i * Math.PI * 2) / 8;
          sphere(`salon-chandelier-bulb-${floor}-${i}`, 0.12, [Math.cos(a) * 0.76, chY - 0.05, 0.15 + Math.sin(a) * 0.76], lampGlow);
        }

        const salonSignTex = new DynamicTexture(`salon-sign-tex-${floor}`, { width: 1024, height: 180 }, scene, false);
        const salonSignCtx = salonSignTex.getContext() as unknown as CanvasRenderingContext2D;
        salonSignCtx.fillStyle = '#1b1612'; salonSignCtx.fillRect(0, 0, 1024, 180);
        salonSignCtx.fillStyle = '#edd8a7'; salonSignCtx.font = '600 50px Georgia, serif'; salonSignCtx.textAlign = 'center'; salonSignCtx.textBaseline = 'middle';
        salonSignCtx.fillText(salonName, 512, 90); salonSignTex.update();
        const salonSignMat = new StandardMaterial(`salon-sign-mat-${floor}`, scene);
        salonSignMat.diffuseTexture = salonSignTex; salonSignMat.emissiveColor = new Color3(0.42, 0.32, 0.18); salonSignMat.backFaceCulling = false;
        const salonSign = MeshBuilder.CreatePlane(`salon-sign-${floor}`, { width: 4.6, height: 0.78 }, scene);
        salonSign.position.set(0, y + 2.85, 5.60); salonSign.rotation.y = Math.PI; salonSign.material = salonSignMat;
      }
      const levelLight = new PointLight(`royal-floor-light-${floor}`, new Vector3(0, y + 2.15, 1.2), scene);
      levelLight.diffuse = new Color3(1, 0.73, 0.40); levelLight.intensity = 0.62; levelLight.range = 11;
    }
    for (const x of [7.6, 9.2]) cylinder(`royal-lift-column-${x}`, 25.4, 0.22, [x, 12.7, -4.4], goldBrass);
    box('royal-lift-cabin', [1.55, 2.45, 1.5], [8.4, 1.25, -4.4], royalVelvet);
    box('royal-lift-crown', [2.25, 0.18, 2.1], [8.4, 25.48, -4.4], goldBrass);

    // ==========================================
    // 1. ARCHITECTURE: Double-Height Space (6.8m)
    // ==========================================
    // Ground Floor
    box('floor-ground', [18, 0.16, 14], [0, -0.10, 0], floorMaterial);
    for (let x = -8.4; x < 9; x += 0.7) box('floor seam', [0.018, 0.009, 14], [x, 0, 0], darkWood);

    // 8.4m villa vault: the wide coffer grid and central lantern make a human POV read the full ceiling volume.
    box('ceiling-upper', [18, 0.16, 14], [0, 8.4, 0], darkWood);
    for (let z = -6.5; z < 7; z += 1.4) {
      box(`ceiling-rafter-${z}`, [18, 0.30, 0.22], [0, 8.24, z], charcoal);
    }
    for (let x = -7.5; x <= 7.5; x += 3.0) {
      box(`ceiling-crossbeam-${x}`, [0.24, 0.34, 13.6], [x, 8.20, 0], darkWood);
    }
    const skylight = MeshBuilder.CreatePlane('villa-roof-lantern', { width: 5.4, height: 3.0 }, scene);
    skylight.position.set(0, 8.18, 0); skylight.rotation.x = Math.PI / 2; skylight.material = balconyGlass;
    box('villa-roof-lantern-frame-n', [5.8, 0.12, 0.16], [0, 8.10, -1.65], goldBrass);
    box('villa-roof-lantern-frame-s', [5.8, 0.12, 0.16], [0, 8.10, 1.65], goldBrass);
    for (const x of [-2.65, -0.9, 0.9, 2.65]) box(`villa-roof-lantern-rib-${x}`, [0.12, 0.12, 3.35], [x, 8.10, 0], goldBrass);

    // Walls (double-height 8.4m). The east side opens with an expansive 5.4m Grand Portal to the Grand Hotel Hall.
    box('back wall', [18, 6.8, 0.18], [0, 3.4, 7], cream);
    box('right wall south', [0.18, 8.4, 4.3], [9, 4.2, -4.85], cream);
    box('right wall north', [0.18, 8.4, 4.3], [9, 4.2, 4.85], cream);

    // Grand Portal Travertine Pilasters & Polished Gold Brass Arch (5.4m wide clear promenade)
    box('grand-hall-portal-left', [0.42, 6.8, 0.52], [9, 3.4, -2.7], stoneTravertine);
    box('grand-hall-portal-right', [0.42, 6.8, 0.52], [9, 3.4, 2.7], stoneTravertine);
    box('grand-hall-portal-crown', [0.46, 0.56, 5.92], [9, 6.78, 0], goldBrass);
    box('grand-hall-portal-threshold', [0.5, 0.02, 5.4], [9, 0.01, 0], goldBrass);

    // Grand Portal Sconces & Illuminated Header Plaque
    sphere('grand-hall-sconce-l', 0.14, [8.78, 3.2, -2.7], lampGlow);
    sphere('grand-hall-sconce-r', 0.14, [8.78, 3.2, 2.7], lampGlow);
    const portalSignTex = new DynamicTexture('portal-sign-tex', { width: 1024, height: 160 }, scene, false);
    const pCtx = portalSignTex.getContext() as unknown as CanvasRenderingContext2D;
    pCtx.fillStyle = '#141c18'; pCtx.fillRect(0, 0, 1024, 160);
    pCtx.fillStyle = '#edd8a7'; pCtx.font = '600 46px Georgia, serif'; pCtx.textAlign = 'center'; pCtx.textBaseline = 'middle';
    pCtx.fillText('★ HỘI TRƯỜNG LỚN  ·  GRAND HOTEL HALL & BALLROOM ★', 512, 80);
    portalSignTex.update();
    const portalSignMat = new StandardMaterial('portal-sign-mat', scene);
    portalSignMat.diffuseTexture = portalSignTex; portalSignMat.emissiveColor = new Color3(0.5, 0.42, 0.28); portalSignMat.backFaceCulling = false;
    const portalSign = MeshBuilder.CreatePlane('portal-sign', { width: 4.8, height: 0.72 }, scene);
    portalSign.position.set(8.78, 5.8, 0); portalSign.rotation.y = -Math.PI / 2; portalSign.material = portalSignMat;

    box('left low wall', [0.18, 1.0, 14], [-9, 0.5, 0], darkWood);
    box('left upper wall', [0.18, 2.4, 14], [-9, 7.2, 0], darkWood);
    box('front left wall', [6.1, 6.8, 0.18], [-5.95, 3.4, -7], darkWood);
    box('front right wall', [6.1, 6.8, 0.18], [5.95, 3.4, -7], darkWood);
    box('front lintel', [5.8, 2.6, 0.18], [0, 7.1, -7], darkWood);

    // ==========================================
    // 1B. GRAND HOTEL CAFÉ HALL — five 4m bays east of the original salon.
    // Architecture and décor only in this task: the existing authoritative seven-table layout is untouched.
    // ==========================================
    const grandHallCenterX = 19;
    const grandHallFrontZ = -9;
    const grandHallBackZ = 9;
    box('grand-hall-floor', [20, 0.16, 18], [grandHallCenterX, -0.10, 0], floorMaterial);
    box('grand-hall-ceiling', [20, 0.16, 18], [grandHallCenterX, 8.4, 0], darkWood);
    box('grand-hall-back-wall', [20, 8.4, 0.18], [grandHallCenterX, 4.2, grandHallBackZ], cream);
    box('grand-hall-front-wall', [20, 8.4, 0.18], [grandHallCenterX, 4.2, grandHallFrontZ], darkWood);
    box('grand-hall-east-wall', [0.18, 8.4, 18], [29, 4.2, 0], cream);
    box('grand-hall-floor-brass', [19.6, 0.02, 0.10], [grandHallCenterX, 0.01, -1.8], goldBrass);
    for (let x = 9; x <= 29; x += 4) {
      cylinder(`grand-hall-column-${x}`, 8.15, 0.34, [x, 4.075, -8.72], marbleWhite);
      cylinder(`grand-hall-column-cap-${x}`, 0.18, 0.55, [x, 8.16, -8.72], goldBrass);
      box(`grand-hall-bay-rib-${x}`, [0.20, 0.30, 17.5], [x, 8.20, 0], darkWood);
    }
    for (const x of [11, 15, 19, 23, 27]) {
      // Five repeated window bays make the enlargement legible as a hotel hall, not an empty extension.
      box(`grand-hall-window-${x}`, [3.28, 4.3, 0.06], [x, 4.25, -8.90], glass);
      box(`grand-hall-window-sill-${x}`, [3.55, 0.12, 0.18], [x, 1.92, -8.98], brass);
      box(`grand-hall-window-mullion-${x}`, [0.10, 4.48, 0.18], [x, 4.25, -8.98], goldBrass);
      const bayLight = new PointLight(`grand-hall-bay-light-${x}`, new Vector3(x, 5.9, -5.9), scene);
      bayLight.diffuse = new Color3(1.0, 0.72, 0.42); bayLight.intensity = 0.48; bayLight.range = 9;
    }
    for (let z = -7.5; z < 8.5; z += 2.0) {
      box(`grand-hall-coffer-${z}`, [19.5, 0.26, 0.16], [grandHallCenterX, 8.22, z], charcoal);
    }

    // Bay 1 — hotel arrival, concierge and luggage/coat point.
    box('hotel-concierge-desk', [3.5, 1.18, 1.25], [12.2, 0.59, -4.7], darkWood);
    box('hotel-concierge-top', [3.72, 0.13, 1.45], [12.2, 1.23, -4.7], marbleBlack);
    for (const x of [10.8, 11.5, 12.2, 12.9, 13.6]) box(`hotel-concierge-inlay-${x}`, [0.055, 0.96, 0.07], [x, 0.58, -5.30], brass);
    const conciergeTex = new DynamicTexture('concierge-sign-tex', { width: 768, height: 160 }, scene, false);
    const conciergeCtx = conciergeTex.getContext() as unknown as CanvasRenderingContext2D;
    conciergeCtx.fillStyle = '#171411'; conciergeCtx.fillRect(0, 0, 768, 160);
    conciergeCtx.fillStyle = '#efd9a5'; conciergeCtx.font = '600 54px Georgia, serif'; conciergeCtx.textAlign = 'center'; conciergeCtx.textBaseline = 'middle';
    conciergeCtx.fillText('CAFÉTRADER  ·  CONCIERGE', 384, 80); conciergeTex.update();
    const conciergeMat = new StandardMaterial('concierge-sign-mat', scene);
    conciergeMat.diffuseTexture = conciergeTex; conciergeMat.emissiveColor = new Color3(0.42, 0.32, 0.18); conciergeMat.backFaceCulling = false;
    const conciergeSign = MeshBuilder.CreatePlane('concierge-sign', { width: 3.2, height: 0.66 }, scene);
    conciergeSign.position.set(12.2, 2.55, -8.82); conciergeSign.material = conciergeMat;
    collisionDiscs.push({ x: 12.2, y: 0, z: -4.7, r: 2.0 });

    // Bay 2 — hotel café lounge, intentionally decorative until new multiplayer seats are scoped.
    for (const z of [-3.0, 1.1]) {
      box(`hotel-lounge-sofa-${z}`, [2.25, 0.68, 0.82], [16.3, 0.42, z], cognacLeather);
      box(`hotel-lounge-back-${z}`, [2.25, 0.66, 0.16], [16.3, 0.84, z + 0.33], cognacLeather);
      cylinder(`hotel-lounge-table-${z}`, 0.58, 0.82, [19.0, 0.45, z], marbleWhite);
      cylinder(`hotel-lounge-table-base-${z}`, 0.48, 0.10, [19.0, 0.24, z], goldBrass);
      sphere(`hotel-lounge-lamp-${z}`, 0.14, [19.0, 1.04, z], lampGlow);
    }

    // Bays 3–5 — a true ballroom for seasonal briefings, AMAs and community events.
    box('ballroom-carpet', [10.2, 0.018, 11.0], [23.7, 0.02, 1.75], royalVelvet);
    box('ballroom-carpet-border-n', [10.5, 0.025, 0.12], [23.7, 0.03, -3.78], goldBrass);
    box('ballroom-carpet-border-s', [10.5, 0.025, 0.12], [23.7, 0.03, 7.28], goldBrass);
    box('ballroom-stage', [3.5, 0.44, 6.6], [27.0, 0.22, 1.75], marbleWhite);
    box('ballroom-stage-front', [3.62, 0.50, 6.8], [28.68, 0.25, 1.75], darkWood);
    box('ballroom-screen-frame', [0.16, 3.4, 4.8], [26.75, 3.25, 1.75], charcoal);
    const ballroomTex = new DynamicTexture('ballroom-program-tex', { width: 800, height: 560 }, scene, false);
    const ballroomCtx = ballroomTex.getContext() as unknown as CanvasRenderingContext2D;
    ballroomCtx.fillStyle = '#10201f'; ballroomCtx.fillRect(0, 0, 800, 560);
    ballroomCtx.fillStyle = '#ead7a3'; ballroomCtx.font = '600 52px Georgia, serif'; ballroomCtx.textAlign = 'center';
    ballroomCtx.fillText('GRAND HALL', 400, 96);
    ballroomCtx.fillStyle = '#8db4a4'; ballroomCtx.font = '28px "DM Sans", sans-serif';
    ballroomCtx.fillText('Closing Bell · Community Briefing', 400, 154);
    ballroomCtx.strokeStyle = '#c9a248'; ballroomCtx.lineWidth = 4; ballroomCtx.strokeRect(70, 205, 660, 190);
    ballroomCtx.fillStyle = '#d9e5dc'; ballroomCtx.font = 'italic 34px Georgia, serif';
    ballroomCtx.fillText('A room for presence, not pressure.', 400, 310);
    ballroomCtx.fillStyle = '#ad8c53'; ballroomCtx.font = '22px "DM Sans", sans-serif'; ballroomCtx.fillText('EVENT SPACE · NO LIVE TRADING SIGNALS', 400, 472); ballroomTex.update();
    const ballroomMat = new StandardMaterial('ballroom-program-mat', scene);
    ballroomMat.diffuseTexture = ballroomTex; ballroomMat.emissiveColor = new Color3(0.42, 0.45, 0.38); ballroomMat.backFaceCulling = false;
    const ballroomScreen = MeshBuilder.CreatePlane('ballroom-program', { width: 3.95, height: 2.75 }, scene);
    ballroomScreen.position.set(26.64, 3.25, 1.75); ballroomScreen.rotation.y = Math.PI / 2; ballroomScreen.material = ballroomMat;
    for (const z of [-1.6, 1.75, 5.1]) {
      const chandelier = cylinder(`ballroom-chandelier-ring-${z}`, 0.09, 1.65, [22.3, 6.15, z], goldBrass);
      chandelier.rotation.x = Math.PI / 2;
      cylinder(`ballroom-chandelier-cord-${z}`, 1.85, 0.035, [22.3, 7.2, z], charcoal);
      for (let i = 0; i < 6; i += 1) {
        const angle = (i * Math.PI * 2) / 6;
        sphere(`ballroom-chandelier-bulb-${z}-${i}`, 0.13, [22.3 + Math.cos(angle) * 0.73, 6.08, z + Math.sin(angle) * 0.73], lampGlow);
      }
    }
    collisionDiscs.push({ x: 27.0, y: 0, z: 1.75, r: 2.35 });

    // Double-Height Panoramic Glass Windows looking out into city skyline
    for (const z of [-5.8, -2.8, 0.2, 3.2, 6.2]) {
      // Lower windows
      box('window-lower', [0.07, 2.6, 2.8], [-9.02, 2.3, z], glass);
      box('window frame-lower', [0.25, 2.8, 0.13], [-8.94, 2.3, z - 1.45], brass);
      // Upper skyline windows (VIP Floor view)
      box('window-upper', [0.07, 2.4, 2.8], [-9.02, 5.0, z], glass);
      box('window frame-upper', [0.25, 2.6, 0.13], [-8.94, 5.0, z - 1.45], brass);
      box('window middle beam', [0.26, 0.16, 2.9], [-8.94, 3.7, z], brass);
    }

    // Skyline lights in the distance
    for (let i = 0; i < 11; i++) {
      const z = -8 + i * 1.6;
      const h = 2.4 + (i * 7 % 5) * 0.85;
      box('distant silhouette', [0.7, h, 1.2], [-10.5, h / 2, z], charcoal);
      for (let j = 0; j < 5; j++) {
        box('distant light', [0.72, 0.05, 0.12], [-10.12, 0.8 + j * 0.9, z], lampGlow);
      }
    }

    // ==========================================
    // 2. MEZZANINE VIP FLOOR (Tầng lửng VIP - y = 3.2m)
    // ==========================================
    // Mezzanine slab covering Z: 1.2 to 6.9, X: -8.9 to 8.9
    const mezWidth = 17.8;
    const mezDepth = 5.7;
    box('mezzanine-slab', [mezWidth, 0.24, mezDepth], [0, 3.2 - 0.12, 1.2 + mezDepth / 2], floorMaterial);
    box('mezzanine-underside', [mezWidth, 0.04, mezDepth], [0, 3.2 - 0.24, 1.2 + mezDepth / 2], darkWood);

    // Support pillars on ground floor
    const columnPositions = [
      { x: -6.2, z: 1.25 },
      { x: -0.6, z: 1.25 },
      { x: 5.0, z: 1.25 },
    ];
    columnPositions.forEach((pos, idx) => {
      cylinder(`mez-pillar-${idx}`, 3.2, 0.36, [pos.x, 1.6, pos.z], darkWood);
      cylinder(`mez-pillar-base-${idx}`, 0.15, 0.48, [pos.x, 0.075, pos.z], brass);
      cylinder(`mez-pillar-top-${idx}`, 0.15, 0.48, [pos.x, 3.125, pos.z], brass);
      collisionDiscs.push({ x: pos.x, y: 0, z: pos.z, r: 0.35 });
    });

    // Balcony Glass Balustrade & Polished Brass Railing (protects entire east & center mezzanine edge from x: -6.4 to x: 8.8)
    const railingWidth = 15.2;
    const railingCenterX = -6.4 + railingWidth / 2; // 1.2
    box('balcony-glass', [railingWidth, 0.92, 0.04], [railingCenterX, 3.2 + 0.52, 1.2], balconyGlass);
    box('balcony-top-rail', [railingWidth, 0.08, 0.14], [railingCenterX, 3.2 + 1.0, 1.2], goldBrass);
    box('balcony-base-rail', [railingWidth, 0.08, 0.14], [railingCenterX, 3.2 + 0.04, 1.2], goldBrass);
    for (let x = -6.4; x <= 8.8; x += 2.17) {
      cylinder(`balcony-post-${x.toFixed(1)}`, 1.0, 0.06, [x, 3.2 + 0.5, 1.2], goldBrass);
    }

    // Fascia LED Ticker on Balcony Edge (faces ground floor)
    const fasciaTex = new DynamicTexture('fascia-ticker-tex', { width: 1024, height: 64 }, scene, false);
    const fCtx = fasciaTex.getContext() as unknown as CanvasRenderingContext2D;
    fCtx.fillStyle = '#121c18'; fCtx.fillRect(0, 0, 1024, 64);
    fCtx.fillStyle = '#cfb87c';
    fCtx.font = 'bold 22px monospace'; fCtx.textAlign = 'center'; fCtx.textBaseline = 'middle';
    fCtx.fillText('★ CAFETRADER VIP LOUNGE ★  SKYLINE SUITE  ·  EXECUTIVE COFFEE CLUB', 512, 32);
    fasciaTex.update();
    const fasciaMat = new StandardMaterial('fascia-ticker-mat', scene);
    fasciaMat.diffuseTexture = fasciaTex; fasciaMat.emissiveColor = new Color3(0.6, 0.5, 0.35);
    const fasciaPlane = MeshBuilder.CreatePlane('fascia-plane', { width: railingWidth, height: 0.28 }, scene);
    fasciaPlane.position.set(railingCenterX, 3.06, 1.17);
    fasciaPlane.material = fasciaMat;

    // ==========================================
    // 3. GRAND FLOATING STAIRCASE (West Window Wall, Cầu thang gỗ bay & Đèn LED âm bậc)
    // Connects Ground floor to Mezzanine alongside 2-storey Manhattan window vista.
    // Clean minimalist cantilevered floating steps with zero view obstruction.
    // ==========================================
    const numSteps = 14;
    const stairZStart = -3.2;
    const stairZEnd = 1.2;
    const stairX = -7.5;
    const stairWidth = 1.4;
    for (let i = 0; i < numSteps; i++) {
      const t = (i + 1) / numSteps;
      const stepY = t * 3.2 - 0.06;
      const stepZ = stairZStart + t * (stairZEnd - stairZStart);
      box(`stair-step-${i}`, [stairWidth, 0.08, 0.36], [stairX, stepY, stepZ], woodLight);
      // Under-step warm LED strip
      box(`stair-led-${i}`, [stairWidth * 0.9, 0.02, 0.04], [stairX, stepY - 0.04, stepZ + 0.13], lampGlow);
    }

    // ==========================================
    // 4. TRADER WALL SCREEN (Double-Height Feature)
    // ==========================================
    box('display frame', [4.3, 2.4, 0.16], [-1.6, 4.4, 6.86], darkWood);
    const screenTexture = new DynamicTexture('trader-screen-texture', { width: 1024, height: 576 }, scene, false);
    const screenMat = new StandardMaterial('trader-screen-mat', scene);
    screenMat.diffuseTexture = screenTexture;
    screenMat.emissiveColor = new Color3(0.58, 0.54, 0.50);
    screenMat.backFaceCulling = false;
    const screenPlane = MeshBuilder.CreatePlane('display-screen', { width: 4.0, height: 2.15 }, scene);
    screenPlane.position.set(-1.6, 4.4, 6.74);
    screenPlane.rotation.y = Math.PI;
    screenPlane.material = screenMat;

    let quoteIndex = 0;
    let chartOffset = 0;
    let btcPrice = 96540;
    let ethPrice = 3485;
    let goldPrice = 2678;
    const updateTraderScreen = () => {
      chartOffset += 1;
      btcPrice = Math.round((btcPrice + (Math.random() - 0.48) * 32) * 10) / 10;
      ethPrice = Math.round((ethPrice + (Math.random() - 0.49) * 4.2) * 10) / 10;
      goldPrice = Math.round((goldPrice + (Math.random() - 0.49) * 1.5) * 10) / 10;
      if (chartOffset % 8 === 0) quoteIndex += 1;

      const ctx = screenTexture.getContext() as unknown as CanvasRenderingContext2D;
      ctx.fillStyle = '#0f1715';
      ctx.fillRect(0, 0, 1024, 576);

      // Header bar
      ctx.fillStyle = '#172622';
      ctx.fillRect(0, 0, 1024, 60);
      ctx.fillStyle = '#b7cfb5';
      ctx.font = 'bold 20px "DM Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('☕ CAFETRADER TERMINAL · EXECUTIVE EDITION', 28, 38);

      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      ctx.fillStyle = '#e5be6b';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`● LIVE FEED ${nowStr}`, 996, 38);

      // Ticker row
      ctx.fillStyle = '#131e1b';
      ctx.fillRect(0, 60, 1024, 45);
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8ec07c';
      ctx.fillText(`BTC/USDT  $${btcPrice.toLocaleString()} ▲ +2.6%   │   ETH/USDT  $${ethPrice.toLocaleString()} ▲ +1.9%   │   GOLD  $${goldPrice.toLocaleString()} ▲ +0.8%   │   SPX  $5,992 ▲ +0.5%`, 28, 88);

      // Mini Candlestick visual area
      const chartY = 130;
      const chartH = 240;
      ctx.strokeStyle = '#223832';
      ctx.lineWidth = 1;
      for (let y = chartY; y <= chartY + chartH; y += 40) {
        ctx.beginPath();
        ctx.moveTo(28, y);
        ctx.lineTo(996, y);
        ctx.stroke();
      }

      // Draw peaceful stylized candlestick bars
      const numCandles = 24;
      const candleW = 24;
      const candleGap = 16;
      let lastClose = 220;
      for (let i = 0; i < numCandles; i++) {
        const seed = (i + chartOffset) * 0.45;
        const delta = Math.sin(seed) * 18 + Math.cos(seed * 2) * 12;
        const open = lastClose;
        const close = Math.max(140, Math.min(330, open + delta));
        lastClose = close;
        const high = Math.min(350, Math.max(open, close) + Math.abs(Math.sin(seed * 3)) * 14);
        const low = Math.max(130, Math.min(open, close) - Math.abs(Math.cos(seed * 3)) * 14);
        const isUp = close >= open;

        const x = 50 + i * (candleW + candleGap);
        ctx.strokeStyle = isUp ? '#7ec98a' : '#e07a68';
        ctx.beginPath();
        ctx.moveTo(x + candleW / 2, high);
        ctx.lineTo(x + candleW / 2, low);
        ctx.stroke();

        ctx.fillStyle = isUp ? '#68b875' : '#c96452';
        ctx.fillRect(x, Math.min(open, close), candleW, Math.max(4, Math.abs(close - open)));
      }

      // Rotating Zen quote area
      ctx.fillStyle = '#16221f';
      ctx.fillRect(28, 395, 968, 140);
      ctx.strokeStyle = '#283f37';
      ctx.strokeRect(28, 395, 968, 140);

      ctx.fillStyle = '#e8eedc';
      ctx.font = 'italic 25px Georgia, serif';
      ctx.textAlign = 'center';
      const quote = TRADER_QUOTES[quoteIndex % TRADER_QUOTES.length];
      ctx.fillText(`“${quote}”`, 512, 465);

      ctx.fillStyle = '#9cb8a4';
      ctx.font = '13px "DM Sans", sans-serif';
      ctx.fillText('— GÓC CHILL TRADER · GIỮ TÂM AN GIỮA NHỮNG BIẾN ĐỘNG —', 512, 505);

      screenTexture.update();
    };
    updateTraderScreen();
    const screenInterval = window.setInterval(updateTraderScreen, 2800);
    scene.onDisposeObservable.add(() => window.clearInterval(screenInterval));

    // ==========================================
    // 4B. HEARTH HALL: GRAND STONE FIREPLACE (Lò Sưởi Đá Tầng 1)
    // ==========================================
    const fpX = -5.8;
    const fpZ = 6.45;
    // Wider, deeper hearth: a clear social focal point rather than a small wall ornament.
    box('fp-hearth-base', [4.7, 0.26, 1.75], [fpX, 0.13, fpZ - 0.24], stoneTravertine);
    box('fp-hearth-step', [5.15, 0.12, 2.15], [fpX, 0.06, fpZ - 0.70], stoneHearth);
    box('fp-inner-cavity-back', [3.25, 2.15, 0.2], [fpX, 1.13, fpZ + 0.35], stoneHearth);
    box('fp-inner-cavity-top', [3.25, 0.18, 0.82], [fpX, 2.16, fpZ], stoneHearth);

    // Stone Mantel Pillars & Header
    box('fp-pillar-l', [0.58, 2.55, 0.9], [fpX - 1.82, 1.28, fpZ - 0.05], stoneTravertine);
    box('fp-pillar-r', [0.58, 2.55, 0.9], [fpX + 1.82, 1.28, fpZ - 0.05], stoneTravertine);
    box('fp-stone-lintel', [4.25, 0.58, 0.95], [fpX, 2.66, fpZ - 0.05], stoneTravertine);
    box('fp-mantel-shelf', [4.68, 0.16, 1.08], [fpX, 2.98, fpZ - 0.05], darkWood);
    box('fp-mantel-brass-inlay', [4.30, 0.035, 0.06], [fpX, 3.08, fpZ - 0.52], goldBrass);

    // Chimney Breast reaching ceiling
    box('fp-chimney-breast', [3.7, 5.25, 0.62], [fpX, 5.67, fpZ + 0.1], stoneTravertine);
    box('fp-chimney-crown', [4.15, 0.22, 0.82], [fpX, 8.20, fpZ + 0.10], goldBrass);
    for (const x of [-1.28, 1.28]) {
      sphere(`fp-sconce-${x}`, 0.18, [fpX + x, 3.72, fpZ - 0.48], lampGlow);
    }

    // Cast iron grate and timber logs
    box('fp-iron-grate', [2.65, 0.16, 0.62], [fpX, 0.32, fpZ - 0.08], charcoal);
    const log1Mesh = cylinder('fp-log-1', 1.95, 0.18, [fpX, 0.48, fpZ - 0.05], darkWood);
    log1Mesh.rotation.z = Math.PI / 2;
    const log2Mesh = cylinder('fp-log-2', 1.62, 0.16, [fpX + 0.1, 0.63, fpZ], wood);
    log2Mesh.rotation.z = Math.PI / 2;
    log2Mesh.rotation.y = 0.25;

    // Glowing ember bed
    box('fp-embers', [2.35, 0.10, 0.58], [fpX, 0.27, fpZ - 0.05], fireEmber);

    // Dynamic flickering fireplace flames
    const hearthFlames: Mesh[] = [];
    const flamePositions = [
      { dx: -0.88, y: 0.70, dz: -0.05, s: 0.78 },
      { dx: -0.44, y: 0.82, dz: -0.02, s: 1.08 },
      { dx: 0, y: 0.94, dz: -0.03, s: 1.34 },
      { dx: 0.45, y: 0.80, dz: -0.05, s: 1.04 },
      { dx: 0.88, y: 0.69, dz: 0.02, s: 0.76 },
      { dx: -0.20, y: 0.94, dz: 0.04, s: 0.86 },
      { dx: 0.25, y: 0.95, dz: 0.03, s: 0.82 },
    ];
    flamePositions.forEach((fp, i) => {
      const flame = sphere(`hearth-flame-${i}`, 0.28 * fp.s, [fpX + fp.dx, fp.y, fpZ + fp.dz], flameMat);
      flame.scaling.set(0.8, 1.8, 0.8);
      hearthFlames.push(flame);
    });
    const fireplaceEmbers: Mesh[] = [];
    for (let i = 0; i < 14; i += 1) {
      const ember = sphere(`fp-floating-ember-${i}`, 0.045 + (i % 3) * 0.014, [fpX - 0.92 + (i % 7) * 0.30, 0.48 + (i % 4) * 0.14, fpZ - 0.22 + (i % 2) * 0.16], fireEmber);
      fireplaceEmbers.push(ember);
    }

    // Large Fireside Area Rug
    cylinder('fp-fireside-rug', 0.009, 3.8, [fpX, 0.006, fpZ - 1.8], rugMat1);
    cylinder('fp-fireside-rug-border', 0.01, 3.94, [fpX, 0.005, fpZ - 1.8], goldBrass);
    collisionDiscs.push({ x: fpX, y: 0, z: fpZ, r: 1.5 });

    // ==========================================
    // 4C. FOCUS LIBRARY (Thư viện yên tĩnh & học tập trên gác lửng)
    // ==========================================
    const libX = -5.8;
    const libY = 3.2;
    const libZ = 6.65;

    // Tall Mahogany Bookcases
    box('lib-bookcase-frame', [4.4, 2.9, 0.42], [libX, libY + 1.45, libZ], darkWood);
    box('lib-bookcase-back', [4.36, 2.86, 0.04], [libX, libY + 1.45, libZ + 0.2], wood);
    for (let s = 0; s < 4; s++) {
      const sy = libY + 0.35 + s * 0.72;
      box(`lib-shelf-${s}`, [4.3, 0.06, 0.4], [libX, sy, libZ], woodLight);
      for (let b = 0; b < 16; b++) {
        const bx = libX - 1.95 + b * 0.26;
        const bHeight = 0.42 + ((b * 7) % 4) * 0.07;
        const bMat = (b % 4 === 0) ? cognacLeather : (b % 4 === 1) ? royalVelvet : (b % 4 === 2) ? teal : rust;
        const book = box(`lib-book-${s}-${b}`, [0.19, bHeight, 0.32], [bx, sy + bHeight / 2 + 0.03, libZ - 0.02], bMat);
        if (b % 5 === 2) book.rotation.z = 0.06;
      }
    }

    // Focus Study Table & Banker's Lamps (Pushed back to z = 5.2, leaving a grand 4m front promenade)
    const studyTableX = -5.4;
    const studyTableZ = 5.2;
    box('lib-study-table', [2.8, 0.09, 0.9], [studyTableX, libY + 0.76, studyTableZ], woodLight);
    for (const dx of [-1.2, 1.2]) for (const dz of [-0.36, 0.36]) {
      cylinder(`lib-table-leg-${dx}-${dz}`, 0.72, 0.07, [studyTableX + dx, libY + 0.36, studyTableZ + dz], brass);
    }
    // Banker's Desk Lamps
    for (const dx of [-0.8, 0.8]) {
      cylinder(`banker-lamp-base-${dx}`, 0.04, 0.22, [studyTableX + dx, libY + 0.82, studyTableZ], brass);
      cylinder(`banker-lamp-stem-${dx}`, 0.32, 0.03, [studyTableX + dx, libY + 0.98, studyTableZ], brass);
      cylinder(`banker-lamp-shade-${dx}`, 0.13, 0.32, [studyTableX + dx, libY + 1.14, studyTableZ], bankerGreen);
      sphere(`banker-lamp-bulb-${dx}`, 0.10, [studyTableX + dx, libY + 1.12, studyTableZ], lampGlow);
    }
    collisionDiscs.push({ x: studyTableX, y: 3.2, z: studyTableZ, r: 1.1 });

    // Focus Library Signboard
    const libSignTex = new DynamicTexture('lib-sign-tex', { width: 1024, height: 160 }, scene, false);
    const lCtx = libSignTex.getContext() as unknown as CanvasRenderingContext2D;
    lCtx.fillStyle = '#16221d'; lCtx.fillRect(0, 0, 1024, 160);
    lCtx.fillStyle = '#c5d8c8';
    lCtx.font = 'bold 36px "DM Sans", sans-serif'; lCtx.textAlign = 'center'; lCtx.textBaseline = 'middle';
    lCtx.fillText('📚 FOCUS LIBRARY · TRADER STUDY & WORKSHOP (LOW VOICE ZONE)', 512, 80);
    libSignTex.update();
    const libSignMat = new StandardMaterial('lib-sign-mat', scene);
    libSignMat.diffuseTexture = libSignTex; libSignMat.emissiveColor = new Color3(0.5, 0.5, 0.5);
    const libSignPlane = MeshBuilder.CreatePlane('lib-sign-plane', { width: 4.3, height: 0.65 }, scene);
    libSignPlane.position.set(libX, libY + 3.12, 6.58);
    libSignPlane.rotation.y = Math.PI;
    libSignPlane.material = libSignMat;

    // Bookshelves & decoration on ground floor
    for (const y of [1.65, 2.35]) {
      box('wall shelf', [2.5, 0.1, 0.45], [5.5, y, 6.68], woodLight);
      for (let i = 0; i < 6; i++) {
        const book = box('book', [0.16, 0.4 + (i % 3) * 0.07, 0.24], [4.55 + i * 0.28, y + 0.26, 6.64], i % 2 ? teal : rust);
        book.rotation.z = (i % 2) * 0.04;
      }
    }

    // Potted plants
    function plant(x: number, y: number, z: number, size = 1) {
      cylinder('plant pot', 0.45 * size, 0.44 * size, [x, y + 0.225 * size, z], rust);
      cylinder('plant stem', 0.75 * size, 0.06 * size, [x, y + 0.68 * size, z], wood);
      for (let i = 0; i < 7; i++) {
        const a = i * Math.PI * 2 / 7;
        const leaf = sphere('plant leaf', 0.52 * size, [x + Math.cos(a) * 0.28 * size, y + (0.95 + (i % 3) * 0.12) * size, z + Math.sin(a) * 0.28 * size], i % 2 ? green : greenDark);
        leaf.scaling.set(1, 1.35, 0.72);
      }
    }
    plant(-8, 0, 5.9, 1.4);
    plant(7.9, 0, -5.4, 1.1);
    plant(-7.8, 0, -5.5, 1.15);
    // VIP Floor Plants (tucked in corners away from walking lanes)
    plant(-8.4, 3.2, 6.2, 1.1);
    plant(7.8, 3.2, 6.0, 1.2);

    // ==========================================
    // FLOOR 2 SCENIC OUTDOOR BALCONY — GÓC CHILL TẦNG 2 & NIGHT TERRACE BRAZIER
    // Outdoor brazier and skyline armchairs on the balcony deck.
    // Leaves the indoor mezzanine arrival plaza 100% wide open and spacious!
    // ==========================================
    const f2BalconyX = -10.6;
    const f2BalconyY = 3.2;
    const f2BalconyZ = 2.4;

    // Outdoor cast-iron fire brazier on the balcony deck facing the New York skyline
    const brazierX = f2BalconyX - 1.25;
    const brazierY = 3.2;
    const brazierZ = f2BalconyZ;

    cylinder('terrace-brazier-base', 0.12, 0.75, [brazierX, brazierY + 0.06, brazierZ], darkWood);
    for (let a = 0; a < 3; a++) {
      const ang = (a * Math.PI * 2) / 3;
      cylinder(`terrace-brazier-leg-${a}`, 0.45, 0.05, [brazierX + Math.cos(ang) * 0.32, brazierY + 0.22, brazierZ + Math.sin(ang) * 0.32], brass);
    }
    cylinder('terrace-brazier-bowl', 0.22, 0.76, [brazierX, brazierY + 0.45, brazierZ], charcoal);
    cylinder('terrace-brazier-rim', 0.05, 0.82, [brazierX, brazierY + 0.54, brazierZ], brass);
    cylinder('terrace-brazier-coals', 0.06, 0.65, [brazierX, brazierY + 0.50, brazierZ], fireEmber);
    const brazierFlame = sphere('terrace-brazier-flame', 0.26, [brazierX, brazierY + 0.68, brazierZ], flameMat);
    brazierFlame.scaling.set(0.9, 1.7, 0.9);
    hearthFlames.push(brazierFlame);

    // Warm terrace brazier light
    const terraceLight = new PointLight('terrace-light', new Vector3(brazierX, brazierY + 1.1, brazierZ), scene);
    terraceLight.diffuse = new Color3(1.0, 0.62, 0.3);
    terraceLight.intensity = 0.65;
    terraceLight.range = 7;

    const seatIdF2L = 'balcony-2-seat-1';
    const seatIdF2R = 'balcony-2-seat-2';
    seatPositions.set(seatIdF2L, { x: f2BalconyX, y: f2BalconyY, z: f2BalconyZ - 0.95, facing: 0, tableIndex: 9, seatIndex: 1 });
    seatPositions.set(seatIdF2R, { x: f2BalconyX, y: f2BalconyY, z: f2BalconyZ + 0.95, facing: Math.PI, tableIndex: 9, seatIndex: 2 });

    // Cantilevered outdoor deck extending into the city skyline
    box('balcony-deck-2', [3.6, 0.22, 3.4], [f2BalconyX, f2BalconyY, f2BalconyZ], darkWood);
    box('balcony-deck-trim-2', [3.72, 0.08, 3.52], [f2BalconyX, f2BalconyY - 0.08, f2BalconyZ], goldBrass);
    for (const dz of [-1.2, 1.2]) {
      cylinder(`balcony-bracket-2-${dz}`, 2.4, 0.10, [-9.2, f2BalconyY - 0.72, f2BalconyZ + dz], goldBrass);
    }
    // Perimeter glass & gold railings (west, north, south)
    box('balcony-rail-w-2', [0.12, 0.08, 3.4], [f2BalconyX - 1.74, f2BalconyY + 0.96, f2BalconyZ], goldBrass);
    box('balcony-base-w-2', [0.10, 0.06, 3.4], [f2BalconyX - 1.74, f2BalconyY + 0.06, f2BalconyZ], goldBrass);
    box('balcony-glass-w-2', [0.04, 0.84, 3.3], [f2BalconyX - 1.74, f2BalconyY + 0.51, f2BalconyZ], balconyGlass);

    box('balcony-rail-s-2', [3.4, 0.08, 0.12], [f2BalconyX, f2BalconyY + 0.96, f2BalconyZ - 1.64], goldBrass);
    box('balcony-base-s-2', [3.4, 0.06, 0.10], [f2BalconyX, f2BalconyY + 0.06, f2BalconyZ - 1.64], goldBrass);
    box('balcony-glass-s-2', [3.3, 0.84, 0.04], [f2BalconyX, f2BalconyY + 0.51, f2BalconyZ - 1.64], balconyGlass);

    box('balcony-rail-n-2', [3.4, 0.08, 0.12], [f2BalconyX, f2BalconyY + 0.96, f2BalconyZ + 1.64], goldBrass);
    box('balcony-base-n-2', [3.4, 0.06, 0.10], [f2BalconyX, f2BalconyY + 0.06, f2BalconyZ + 1.64], goldBrass);
    box('balcony-glass-n-2', [3.3, 0.84, 0.04], [f2BalconyX, f2BalconyY + 0.51, f2BalconyZ + 1.64], balconyGlass);

    for (const dz of [-1.64, 0, 1.64]) {
      cylinder(`balcony-post-w-2-${dz}`, 0.96, 0.065, [f2BalconyX - 1.74, f2BalconyY + 0.51, f2BalconyZ + dz], goldBrass);
    }
    cylinder('balcony-post-s-2', 0.96, 0.065, [f2BalconyX, f2BalconyY + 0.51, f2BalconyZ - 1.64], goldBrass);
    cylinder('balcony-post-n-2', 0.96, 0.065, [f2BalconyX, f2BalconyY + 0.51, f2BalconyZ + 1.64], goldBrass);

    // Outdoor bistro table overlooking the skyline
    cylinder('balcony-table-base-2', 0.06, 0.65, [f2BalconyX, f2BalconyY + 0.04, f2BalconyZ], goldBrass);
    cylinder('balcony-table-pole-2', 0.62, 0.10, [f2BalconyX, f2BalconyY + 0.35, f2BalconyZ], goldBrass);
    cylinder('balcony-table-rim-2', 0.08, 1.25, [f2BalconyX, f2BalconyY + 0.67, f2BalconyZ], goldBrass);
    cylinder('balcony-table-top-2', 0.07, 1.20, [f2BalconyX, f2BalconyY + 0.68, f2BalconyZ], marbleWhite);

    // Tabletop lantern & coffee cups
    cylinder('balcony-lantern-b-2', 0.06, 0.18, [f2BalconyX, f2BalconyY + 0.74, f2BalconyZ], brass);
    sphere('balcony-lantern-bulb-2', 0.13, [f2BalconyX, f2BalconyY + 0.84, f2BalconyZ], lampGlow);
    cylinder('balcony-lantern-cap-2', 0.05, 0.20, [f2BalconyX, f2BalconyY + 0.93, f2BalconyZ], goldBrass);

    cylinder('balcony-saucer-1-2', 0.02, 0.22, [f2BalconyX - 0.28, f2BalconyY + 0.72, f2BalconyZ - 0.15], white);
    cylinder('balcony-saucer-2-2', 0.02, 0.22, [f2BalconyX + 0.28, f2BalconyY + 0.72, f2BalconyZ + 0.15], white);
    cylinder('balcony-cup-1-2', 0.11, 0.14, [f2BalconyX - 0.28, f2BalconyY + 0.78, f2BalconyZ - 0.15], white);
    cylinder('balcony-cup-2-2', 0.11, 0.14, [f2BalconyX + 0.28, f2BalconyY + 0.78, f2BalconyZ + 0.15], white);
    cylinder('balcony-coffee-1-2', 0.02, 0.11, [f2BalconyX - 0.28, f2BalconyY + 0.82, f2BalconyZ - 0.15], espresso);
    cylinder('balcony-coffee-2-2', 0.02, 0.11, [f2BalconyX + 0.28, f2BalconyY + 0.82, f2BalconyZ + 0.15], espresso);

    // Pair of cognac leather outdoor armchairs angled towards the skyline
    const c1_2 = new TransformNode('balcony-chair-s-2', scene);
    c1_2.position.set(f2BalconyX, f2BalconyY, f2BalconyZ - 0.95); c1_2.rotation.y = 0;
    box('c1-seat-2', [0.75, 0.14, 0.72], [0, 0.38, 0], cognacLeather, c1_2);
    box('c1-back-2', [0.75, 0.52, 0.12], [0, 0.68, -0.32], cognacLeather, c1_2);
    box('c1-cushion-2', [0.65, 0.08, 0.62], [0, 0.48, 0.02], royalVelvet, c1_2);
    for (const dx of [-0.32, 0.32]) for (const dz of [-0.28, 0.28]) {
      cylinder(`c1-leg-2-${dx}-${dz}`, 0.36, 0.06, [dx, 0.18, dz], goldBrass, c1_2);
    }

    const c2_2 = new TransformNode('balcony-chair-n-2', scene);
    c2_2.position.set(f2BalconyX, f2BalconyY, f2BalconyZ + 0.95); c2_2.rotation.y = Math.PI;
    box('c2-seat-2', [0.75, 0.14, 0.72], [0, 0.38, 0], cognacLeather, c2_2);
    box('c2-back-2', [0.75, 0.52, 0.12], [0, 0.68, -0.32], cognacLeather, c2_2);
    box('c2-cushion-2', [0.65, 0.08, 0.62], [0, 0.48, 0.02], royalVelvet, c2_2);
    for (const dx of [-0.32, 0.32]) for (const dz of [-0.28, 0.28]) {
      cylinder(`c2-leg-2-${dx}-${dz}`, 0.36, 0.06, [dx, 0.18, dz], goldBrass, c2_2);
    }
    [c1_2, c2_2].forEach((chairNode, idx) => {
      const sId = idx === 0 ? seatIdF2L : seatIdF2R;
      chairNode.getChildMeshes().forEach(m => { m.metadata = { seatId: sId }; });
    });

    // Terracotta planters with lush shrubs at outer corners
    cylinder('balcony-planter-s-2', 0.45, 0.48, [f2BalconyX - 1.25, f2BalconyY + 0.24, f2BalconyZ - 1.25], rust);
    sphere('balcony-bush-s-2', 0.64, [f2BalconyX - 1.25, f2BalconyY + 0.64, f2BalconyZ - 1.25], greenDark);
    cylinder('balcony-planter-n-2', 0.45, 0.48, [f2BalconyX - 1.25, f2BalconyY + 0.24, f2BalconyZ + 1.25], rust);
    sphere('balcony-bush-n-2', 0.64, [f2BalconyX - 1.25, f2BalconyY + 0.64, f2BalconyZ + 1.25], greenDark);

    // Brass plaque on railing
    box('balcony-plaque-2', [0.04, 0.22, 1.8], [f2BalconyX - 1.78, f2BalconyY + 0.68, f2BalconyZ], goldBrass);
    collisionDiscs.push({ x: f2BalconyX, y: 3.2, z: f2BalconyZ, r: 0.85 });

    // ==========================================
    // FLOOR 1 SCENIC OUTDOOR BALCONY — GÓC CHILL TẦNG 1
    // ==========================================
    const f1BalconyX = -9.2;
    const f1BalconyY = 0;
    const f1BalconyZ = -11.0;

    box('balcony-deck-1', [5.8, 0.20, 3.6], [f1BalconyX, f1BalconyY + 0.10, f1BalconyZ], stoneTravertine);
    box('balcony-deck-inset-1', [5.4, 0.03, 3.2], [f1BalconyX, f1BalconyY + 0.21, f1BalconyZ], darkWood);

    // Perimeter glass & gold railings (west and south facing the grand fountain)
    box('balcony-rail-f-1', [5.8, 0.08, 0.12], [f1BalconyX, f1BalconyY + 1.04, f1BalconyZ - 1.74], goldBrass);
    box('balcony-base-f-1', [5.8, 0.06, 0.10], [f1BalconyX, f1BalconyY + 0.24, f1BalconyZ - 1.74], goldBrass);
    box('balcony-glass-f-1', [5.6, 0.80, 0.04], [f1BalconyX, f1BalconyY + 0.64, f1BalconyZ - 1.74], balconyGlass);

    box('balcony-rail-l-1', [0.12, 0.08, 3.5], [f1BalconyX - 2.84, f1BalconyY + 1.04, f1BalconyZ], goldBrass);
    box('balcony-base-l-1', [0.10, 0.06, 3.5], [f1BalconyX - 2.84, f1BalconyY + 0.24, f1BalconyZ], goldBrass);
    box('balcony-glass-l-1', [0.04, 0.80, 3.4], [f1BalconyX - 2.84, f1BalconyY + 0.64, f1BalconyZ], balconyGlass);

    for (const dx of [-2.84, 0, 2.84]) {
      cylinder(`balcony-post-f-1-${dx}`, 0.94, 0.065, [f1BalconyX + dx, f1BalconyY + 0.64, f1BalconyZ - 1.74], goldBrass);
    }
    for (const dz of [-0.85, 0.85]) {
      cylinder(`balcony-post-l-1-${dz}`, 0.94, 0.065, [f1BalconyX - 2.84, f1BalconyY + 0.64, f1BalconyZ + dz], goldBrass);
    }

    // Outdoor bistro table looking out towards the fountain
    cylinder('balcony-table-base-1', 0.06, 0.65, [f1BalconyX, f1BalconyY + 0.24, f1BalconyZ], goldBrass);
    cylinder('balcony-table-pole-1', 0.62, 0.10, [f1BalconyX, f1BalconyY + 0.55, f1BalconyZ], goldBrass);
    cylinder('balcony-table-rim-1', 0.08, 1.25, [f1BalconyX, f1BalconyY + 0.87, f1BalconyZ], goldBrass);
    cylinder('balcony-table-top-1', 0.07, 1.20, [f1BalconyX, f1BalconyY + 0.88, f1BalconyZ], marbleWhite);

    // Tabletop lantern & coffee cups
    cylinder('balcony-lantern-b-1', 0.06, 0.18, [f1BalconyX, f1BalconyY + 0.94, f1BalconyZ], brass);
    sphere('balcony-lantern-bulb-1', 0.13, [f1BalconyX, f1BalconyY + 1.04, f1BalconyZ], lampGlow);
    cylinder('balcony-lantern-cap-1', 0.05, 0.20, [f1BalconyX, f1BalconyY + 1.13, f1BalconyZ], goldBrass);

    cylinder('balcony-saucer-1-1', 0.02, 0.22, [f1BalconyX - 0.28, f1BalconyY + 0.92, f1BalconyZ - 0.15], white);
    cylinder('balcony-saucer-2-1', 0.02, 0.22, [f1BalconyX + 0.28, f1BalconyY + 0.92, f1BalconyZ + 0.15], white);
    cylinder('balcony-cup-1-1', 0.11, 0.14, [f1BalconyX - 0.28, f1BalconyY + 0.98, f1BalconyZ - 0.15], white);
    cylinder('balcony-cup-2-1', 0.11, 0.14, [f1BalconyX + 0.28, f1BalconyY + 0.98, f1BalconyZ + 0.15], white);
    cylinder('balcony-coffee-1-1', 0.02, 0.11, [f1BalconyX - 0.28, f1BalconyY + 1.02, f1BalconyZ - 0.15], espresso);
    cylinder('balcony-coffee-2-1', 0.02, 0.11, [f1BalconyX + 0.28, f1BalconyY + 1.02, f1BalconyZ + 0.15], espresso);

    // Pair of comfortable outdoor terrace armchairs facing fountain
    const seatIdF1L = 'balcony-1-seat-1';
    const seatIdF1R = 'balcony-1-seat-2';
    seatPositions.set(seatIdF1L, { x: f1BalconyX - 1.25, y: f1BalconyY + 0.20, z: f1BalconyZ, facing: Math.PI * 0.35, tableIndex: 8, seatIndex: 1 });
    seatPositions.set(seatIdF1R, { x: f1BalconyX + 1.25, y: f1BalconyY + 0.20, z: f1BalconyZ, facing: -Math.PI * 0.35, tableIndex: 8, seatIndex: 2 });

    const c1_1 = new TransformNode('balcony-chair-1-1', scene);
    c1_1.position.set(f1BalconyX - 1.25, f1BalconyY + 0.20, f1BalconyZ); c1_1.rotation.y = Math.PI * 0.35;
    const f1c1s = box('c1-seat-1', [0.75, 0.14, 0.72], [0, 0.38, 0], cognacLeather, c1_1);
    const f1c1b = box('c1-back-1', [0.75, 0.52, 0.12], [0, 0.68, -0.32], cognacLeather, c1_1);
    const f1c1c = box('c1-cushion-1', [0.65, 0.08, 0.62], [0, 0.48, 0.02], royalVelvet, c1_1);
    [f1c1s, f1c1b, f1c1c].forEach(m => { m.metadata = { seatId: seatIdF1L }; });
    for (const dx of [-0.32, 0.32]) for (const dz of [-0.28, 0.28]) {
      const leg = cylinder(`c1-leg-1-${dx}-${dz}`, 0.36, 0.06, [dx, 0.18, dz], goldBrass, c1_1);
      leg.metadata = { seatId: seatIdF1L };
    }

    const c2_1 = new TransformNode('balcony-chair-2-1', scene);
    c2_1.position.set(f1BalconyX + 1.25, f1BalconyY + 0.20, f1BalconyZ); c2_1.rotation.y = -Math.PI * 0.35;
    const f1c2s = box('c2-seat-1', [0.75, 0.14, 0.72], [0, 0.38, 0], cognacLeather, c2_1);
    const f1c2b = box('c2-back-1', [0.75, 0.52, 0.12], [0, 0.68, -0.32], cognacLeather, c2_1);
    const f1c2c = box('c2-cushion-1', [0.65, 0.08, 0.62], [0, 0.48, 0.02], royalVelvet, c2_1);
    [f1c2s, f1c2b, f1c2c].forEach(m => { m.metadata = { seatId: seatIdF1R }; });
    for (const dx of [-0.32, 0.32]) for (const dz of [-0.28, 0.28]) {
      const leg = cylinder(`c2-leg-1-${dx}-${dz}`, 0.36, 0.06, [dx, 0.18, dz], goldBrass, c2_1);
      leg.metadata = { seatId: seatIdF1R };
    }

    // Corner planters with green shrubs
    cylinder('balcony-planter-1-l', 0.45, 0.48, [f1BalconyX - 2.4, f1BalconyY + 0.44, f1BalconyZ - 1.3], rust);
    sphere('balcony-bush-1-l', 0.64, [f1BalconyX - 2.4, f1BalconyY + 0.84, f1BalconyZ - 1.3], greenDark);
    cylinder('balcony-planter-1-r', 0.45, 0.48, [f1BalconyX + 2.4, f1BalconyY + 0.44, f1BalconyZ - 1.3], rust);
    sphere('balcony-bush-1-r', 0.64, [f1BalconyX + 2.4, f1BalconyY + 0.84, f1BalconyZ - 1.3], greenDark);

    // Brass plaque
    box('balcony-plaque-1', [2.4, 0.22, 0.04], [f1BalconyX, f1BalconyY + 0.76, f1BalconyZ - 1.78], goldBrass);
    collisionDiscs.push({ x: f1BalconyX, y: 0, z: f1BalconyZ, r: 0.95 });

    // ==========================================
    // 4F. PRIVATE LOUNGE: MINIBAR & PODCAST CORNER
    // ==========================================
    const loungeX = 5.8;
    const loungeY = 3.2;
    const loungeZ = 5.2;

    // Minibar credenza
    box('minibar-cabinet', [2.2, 0.95, 0.58], [loungeX, loungeY + 0.48, loungeZ + 1.2], darkWood);
    box('minibar-counter', [2.3, 0.08, 0.65], [loungeX, loungeY + 0.98, loungeZ + 1.2], marbleBlack);
    for (let b = 0; b < 5; b++) {
      cylinder(`minibar-bottle-${b}`, 0.28, 0.08, [loungeX - 0.7 + b * 0.35, loungeY + 1.15, loungeZ + 1.2], glass);
    }

    // Podcast & Trading Discussion Corner Desk
    const podX = 1.0;
    const podZ = 5.4;
    cylinder('podcast-table', 0.78, 1.1, [podX, loungeY + 0.39, podZ], marbleWhite);
    // Vintage desktop podcast microphone
    cylinder('podcast-mic-stand', 0.03, 0.18, [podX, loungeY + 0.80, podZ], goldBrass);
    cylinder('podcast-mic-body', 0.24, 0.08, [podX, loungeY + 0.94, podZ], charcoal);
    sphere('podcast-mic-grille', 0.10, [podX, loungeY + 1.08, podZ], goldBrass);

    // Sleeping Café Cat on cozy armchair (Ground Floor)
    const catArmchair = new TransformNode('cat-chair', scene);
    catArmchair.position.set(-7.5, 0, 3.6);
    box('chair-seat', [1.1, 0.35, 1.0], [0, 0.32, 0], teal, catArmchair);
    box('chair-back', [1.1, 0.8, 0.2], [0, 0.75, 0.4], teal, catArmchair);
    box('chair-arm-l', [0.2, 0.5, 1.0], [-0.55, 0.5, 0], wood, catArmchair);
    box('chair-arm-r', [0.2, 0.5, 1.0], [0.55, 0.5, 0], wood, catArmchair);

    const catBody = sphere('cat-body', 0.38, [0, 0.62, 0], catFur, catArmchair);
    catBody.scaling.set(1.2, 0.85, 1.0);
    sphere('cat-head', 0.24, [0.28, 0.65, 0], catFur, catArmchair);
    box('cat-ear-1', [0.06, 0.09, 0.06], [0.32, 0.78, -0.06], catWhite, catArmchair);
    box('cat-ear-2', [0.06, 0.09, 0.06], [0.32, 0.78, 0.06], catWhite, catArmchair);
    const catTail = cylinder('cat-tail', 0.4, 0.08, [-0.22, 0.56, 0.25], catFur, catArmchair);
    catTail.rotation.x = Math.PI / 2.5;

    // Vintage Record Player (Hearth Hall fireside listening console)
    const vinylConsole = new TransformNode('vinyl-console', scene);
    vinylConsole.position.set(-3.6, 0, 5.8);
    vinylConsole.rotation.y = Math.PI;
    box('vinyl-table', [1.0, 0.85, 0.8], [0, 0.42, 0], darkWood, vinylConsole);
    box('player-body', [0.65, 0.12, 0.55], [0, 0.9, 0], woodLight, vinylConsole);
    const vinylDisc = cylinder('vinyl-disc', 0.02, 0.44, [0.08, 0.98, 0], vinylMat, vinylConsole);
    cylinder('vinyl-center', 0.025, 0.14, [0.08, 0.985, 0], brass, vinylConsole);
    cylinder('tonearm', 0.24, 0.015, [-0.18, 1.02, -0.1], brass, vinylConsole);

    // Central bar: layered service counter, tools and menu boards. All pieces remain static
    // so the detail reads like a working bar without turning into a per-frame cost.
    box('bar body', [4.2, 1.1, 2.1], [5.4, 0.55, 2.9], darkWood);
    box('bar top', [4.5, 0.18, 2.38], [5.4, 1.16, 2.9], woodLight);
    box('bar-marble-inset', [4.24, 0.028, 1.92], [5.4, 1.268, 2.9], marbleBlack);
    for (let x = 3.55; x < 7.4; x += 0.42) box('bar slat', [0.09, 0.94, 0.08], [x, 0.56, 1.82], brass);
    cylinder('bar-foot-rail', 3.65, 0.08, [5.4, 0.22, 1.62], goldBrass).rotation.z = Math.PI / 2;
    for (const x of [3.78, 7.02]) cylinder(`bar-foot-rail-post-${x}`, 0.30, 0.06, [x, 0.20, 1.62], goldBrass);

    // Espresso station: machine, grinder, knock box and pour-over service are deliberately recognizable.
    box('espresso-machine', [1.42, 0.78, 0.62], [5.55, 1.68, 3.02], charcoal);
    box('espresso-machine-top', [1.52, 0.10, 0.70], [5.55, 2.11, 3.02], brass);
    box('espresso-machine-panel', [1.22, 0.34, 0.05], [5.55, 1.77, 2.68], marbleBlack);
    for (let i = 0; i < 3; i += 1) sphere(`espresso-machine-button-${i}`, 0.065, [5.20 + i * 0.35, 1.79, 2.64], lampGlow);
    for (const x of [5.28, 5.82]) {
      cylinder(`espresso-group-${x}`, 0.10, 0.17, [x, 1.56, 2.66], brass);
      cylinder(`espresso-portafilter-${x}`, 0.05, 0.25, [x, 1.48, 2.52], charcoal).rotation.x = Math.PI / 2;
    }
    cylinder('coffee-grinder-base', 0.38, 0.38, [4.26, 1.47, 3.05], charcoal);
    cylinder('coffee-grinder-neck', 0.30, 0.12, [4.26, 1.78, 3.05], brass);
    sphere('coffee-grinder-hopper', 0.42, [4.26, 2.08, 3.05], glass);
    cylinder('coffee-grinder-beans', 0.10, 0.52, [4.26, 2.10, 3.05], espresso);
    cylinder('knock-box', 0.18, 0.36, [6.63, 1.38, 2.70], charcoal);
    cylinder('knock-box-bar', 0.05, 0.30, [6.63, 1.49, 2.70], brass).rotation.z = Math.PI / 2;
    cylinder('pour-over-kettle', 0.30, 0.30, [6.92, 1.43, 3.14], brass);
    cylinder('pour-over-neck', 0.20, 0.045, [7.12, 1.58, 3.14], brass).rotation.z = Math.PI / 2;
    cylinder('pour-over-dripper', 0.14, 0.22, [6.96, 1.54, 2.80], white);
    cylinder('pour-over-server', 0.25, 0.18, [6.96, 1.40, 2.80], glass);

    // Bartender Workstation: Stainless cocktail shaker, brass jigger, bar towel, mixing glass
    cylinder('bar-cocktail-shaker', 0.25, 0.11, [5.05, 1.48, 2.74], chromeSilver);
    sphere('bar-shaker-cap', 0.085, [5.05, 1.62, 2.74], chromeSilver);
    cylinder('bar-jigger', 0.11, 0.065, [4.84, 1.41, 2.74], goldBrass);
    box('bar-folded-towel', [0.24, 0.035, 0.16], [5.38, 1.36, 2.72], white);
    cylinder('mixing-glass', 0.20, 0.11, [6.32, 1.44, 2.74], glass);
    cylinder('bar-spoon-handle', 0.28, 0.015, [6.34, 1.54, 2.74], goldBrass).rotation.z = 0.25;

    // Classic Brass Service Call Bell ("Ding!" on counter)
    cylinder('bar-bell-base', 0.022, 0.14, [3.62, 1.28, 1.95], darkWood);
    const bellDome = sphere('bar-bell-dome', 0.11, [3.62, 1.33, 1.95], goldBrass);
    cylinder('bar-bell-plunger', 0.035, 0.024, [3.62, 1.39, 1.95], goldBrass);
    bellDome.metadata = { cafeFeature: 'service-bell' };

    // Tabletop Wi-Fi & Crypto Accepted Wooden Tent Card on counter
    const wifiCard = box('bar-wifi-tent', [0.18, 0.11, 0.07], [4.20, 1.32, 1.95], woodLight);
    box('bar-wifi-brass-plate', [0.16, 0.08, 0.008], [4.20, 1.32, 1.99], goldBrass);
    wifiCard.metadata = { cafeFeature: 'wifi-stand' };

    // Back bar: shelf, beans, tea jars, syrups and a dessert dome make the service area feel stocked.
    box('bar-back-wall', [4.75, 3.18, 0.16], [5.4, 2.72, 4.18], darkWood);
    for (const y of [1.78, 2.55, 3.32]) {
      box(`bar-back-shelf-${y}`, [4.44, 0.08, 0.48], [5.4, y, 3.98], woodLight);
    }
    for (let i = 0; i < 9; i += 1) {
      const x = 3.72 + i * 0.42;
      const jarMat = i % 3 === 0 ? espresso : i % 3 === 1 ? rust : bankerGreen;
      cylinder(`bar-jar-${i}`, 0.34 + (i % 2) * 0.08, 0.14, [x, 2.04, 3.83], glass);
      cylinder(`bar-jar-fill-${i}`, 0.23, 0.105, [x, 2.01, 3.83], jarMat);
      cylinder(`bar-jar-lid-${i}`, 0.035, 0.16, [x, 2.23 + (i % 2) * 0.04, 3.83], goldBrass);
    }
    for (let i = 0; i < 6; i += 1) {
      const x = 4.02 + i * 0.56;
      cylinder(`bar-syrup-${i}`, 0.52, 0.11, [x, 2.84, 3.82], glass);
      cylinder(`bar-syrup-cap-${i}`, 0.05, 0.12, [x, 3.13, 3.82], brass);
    }
    for (let i = 0; i < 5; i += 1) cylinder(`bar-cup-${i}`, 0.20, 0.16, [3.86 + i * 0.23, 1.40, 2.45], white);

    // Two-Tier Pastry Showcase & Dessert Warmer (Tủ bánh nướng nóng đèn vàng)
    box('pastry-case-base', [0.88, 0.04, 0.58], [3.78, 1.28, 3.25], darkWood);
    const pastryGlass = box('pastry-case-glass', [0.84, 0.48, 0.54], [3.78, 1.54, 3.25], revolvingGlass);
    box('pastry-case-frame-top', [0.88, 0.03, 0.58], [3.78, 1.80, 3.25], goldBrass);
    box('pastry-case-shelf-mid', [0.80, 0.015, 0.48], [3.78, 1.52, 3.25], glass);
    sphere('pastry-warmer-light', 0.075, [3.78, 1.76, 3.25], lampGlow);
    // Croissants, pain au chocolat, cinnamon rolls inside
    sphere('pastry-croissant-1', 0.22, [3.60, 1.36, 3.22], woodLight).scaling.set(1.35, 0.45, 0.72);
    sphere('pastry-croissant-2', 0.22, [3.96, 1.36, 3.22], woodLight).scaling.set(1.35, 0.45, 0.72);
    box('pastry-choco-1', [0.18, 0.08, 0.12], [3.64, 1.58, 3.25], espresso);
    cylinder('pastry-canele-1', 0.10, 0.09, [3.92, 1.58, 3.25], espresso);
    // Stainless pastry tongs
    box('pastry-tongs', [0.18, 0.02, 0.04], [3.78, 1.32, 2.92], chromeSilver);
    pastryGlass.metadata = { cafeFeature: 'pastry-case' };
    collisionDiscs.push({ x: 5.4, y: 0, z: 2.9, r: 2.3 });

    // Bar sign
    const barSignTex = new DynamicTexture('bar-sign-texture', { width: 1024, height: 256 }, scene, false);
    const barCtx = barSignTex.getContext() as unknown as CanvasRenderingContext2D;
    barCtx.fillStyle = '#201612'; barCtx.fillRect(0, 0, 1024, 256);
    barCtx.fillStyle = '#ead5aa';
    barCtx.font = '600 76px Georgia, serif'; barCtx.textAlign = 'center'; barCtx.textBaseline = 'middle';
    barCtx.fillText('☕ CAFE TRADER · TẦNG TRỆT', 512, 128); barSignTex.update();
    const barSignMat = new StandardMaterial('bar-sign-mat', scene);
    barSignMat.diffuseTexture = barSignTex; barSignMat.emissiveColor = new Color3(0.4, 0.35, 0.3); barSignMat.backFaceCulling = false;
    const barSign = MeshBuilder.CreatePlane('bar-sign', { width: 3.4, height: 0.72 }, scene);
    barSign.position.set(5.4, 4.05, 6.75); barSign.rotation.y = Math.PI; barSign.material = barSignMat;

    // Three menu boards expose the same recipe catalogue that the UI can import from `data/cafeMenu`.
    CAFE_MENU_CATEGORIES.forEach((category, categoryIndex) => {
      const menuTexture = new DynamicTexture(`bar-menu-texture-${categoryIndex}`, { width: 1024, height: 1024 }, scene, false);
      const ctx = menuTexture.getContext() as unknown as CanvasRenderingContext2D;
      ctx.fillStyle = '#17201a'; ctx.fillRect(0, 0, 1024, 1024);
      ctx.strokeStyle = '#c8a15a'; ctx.lineWidth = 14; ctx.strokeRect(26, 26, 972, 972);
      ctx.fillStyle = '#f0d89d'; ctx.font = '600 62px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText(category.toUpperCase(), 512, 104);
      ctx.strokeStyle = '#745d37'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(96, 142); ctx.lineTo(928, 142); ctx.stroke();
      let y = 205;
      menuByCategory(category).forEach((item) => {
        ctx.fillStyle = '#f3ead4'; ctx.font = '600 34px Georgia, serif'; ctx.textAlign = 'left';
        ctx.fillText(item.name, 86, y);
        ctx.fillStyle = '#c9b88f'; ctx.font = '22px "DM Sans", sans-serif';
        ctx.fillText(`${item.serving} · ${item.recipe.slice(0, 2).join(' · ')}`, 86, y + 38);
        ctx.strokeStyle = '#4b513f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(86, y + 58); ctx.lineTo(938, y + 58); ctx.stroke();
        y += 185;
      });
      ctx.fillStyle = '#b99858'; ctx.font = 'italic 22px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText('Hỏi Thu Hà để điều chỉnh độ ngọt', 512, 952);
      menuTexture.update();
      const boardMat = new StandardMaterial(`bar-menu-mat-${categoryIndex}`, scene);
      boardMat.diffuseTexture = menuTexture; boardMat.emissiveColor = new Color3(0.34, 0.31, 0.23); boardMat.backFaceCulling = false;
      const board = MeshBuilder.CreatePlane(`bar-menu-board-${categoryIndex}`, { width: 1.34, height: 1.75 }, scene);
      board.position.set(4.02 + categoryIndex * 1.38, 3.27, 4.06); board.rotation.y = Math.PI; board.material = boardMat;
      box(`bar-menu-frame-top-${categoryIndex}`, [1.47, 0.07, 0.08], [4.02 + categoryIndex * 1.38, 4.17, 4.13], goldBrass);
    });

    // ==========================================
    // 4C. AUTHENTIC REAL-WORLD CAFE DETAILS & SURPRISE DELIGHTS
    // Essential hallmarks of an authentic specialty coffee shop:
    // Self-serve detox water & napkin console, handwritten chalkboard easel,
    // vintage brass umbrella stand, financial newspaper rack, retail merchandise shelf,
    // and tray return & waste sorting station.
    // ==========================================

    // 1. Self-Serve Detox Water & Napkin Station (Quầy Nước Lọc Chanh Bạc Hà Tự Phục Vụ)
    const selfServeX = -3.8;
    const selfServeZ = -4.5;
    box('self-serve-table-body', [1.5, 0.86, 0.70], [selfServeX, 0.43, selfServeZ], darkWood);
    const selfServeTop = box('self-serve-table-top', [1.58, 0.05, 0.78], [selfServeX, 0.885, selfServeZ], marbleWhite);
    selfServeTop.metadata = { cafeFeature: 'water-dispenser' };
    box('self-serve-lower-shelf', [1.44, 0.025, 0.64], [selfServeX, 0.18, selfServeZ], darkWood);

    // Glass beverage dispenser with copper spigot & infused detox lemon-mint water
    const waterJar = cylinder('water-dispenser-glass', 0.46, 0.32, [selfServeX - 0.36, 1.15, selfServeZ], revolvingGlass);
    cylinder('water-dispenser-liquid', 0.40, 0.30, [selfServeX - 0.36, 1.13, selfServeZ], teal);
    const waterSpigot = box('water-spigot-tap', [0.035, 0.045, 0.08], [selfServeX - 0.36, 0.98, selfServeZ - 0.18], goldBrass);
    waterSpigot.metadata = { cafeFeature: 'water-dispenser' };
    cylinder('water-dispenser-lid', 0.04, 0.34, [selfServeX - 0.36, 1.40, selfServeZ], darkWood);
    sphere('water-dispenser-knob', 0.065, [selfServeX - 0.36, 1.44, selfServeZ], goldBrass);
    // Floating lemon slices & mint leaves
    for (let i = 0; i < 3; i++) {
      cylinder(`water-lemon-${i}`, 0.015, 0.11, [selfServeX - 0.36 + (i - 1) * 0.06, 1.06 + i * 0.08, selfServeZ + (i % 2) * 0.04], lemonYellow);
    }
    for (let i = 0; i < 4; i++) {
      cylinder(`water-mint-${i}`, 0.012, 0.075, [selfServeX - 0.36 + ((i % 2) * 0.12 - 0.06), 1.08 + i * 0.06, selfServeZ + (Math.floor(i / 2) * 0.10 - 0.05)], green);
    }
    // Clean drinking glass tumblers on wooden tray
    const waterTray = box('water-tray', [0.38, 0.025, 0.32], [selfServeX + 0.28, 0.92, selfServeZ - 0.10], woodLight);
    waterTray.metadata = { cafeFeature: 'water-dispenser' };
    for (let i = 0; i < 4; i++) {
      cylinder(`water-tumbler-${i}`, 0.12, 0.085, [selfServeX + 0.22 + (i % 2) * 0.12, 0.99, selfServeZ - 0.16 + Math.floor(i / 2) * 0.12], revolvingGlass);
    }
    // Kraft paper napkins & straw canisters
    box('water-napkins-holder', [0.15, 0.11, 0.15], [selfServeX + 0.42, 0.97, selfServeZ + 0.15], darkWood);
    box('water-napkins-paper', [0.13, 0.09, 0.13], [selfServeX + 0.42, 0.97, selfServeZ + 0.15], white);
    cylinder('water-straws-cup', 0.16, 0.09, [selfServeX + 0.18, 1.00, selfServeZ + 0.15], brass);
    for (let i = 0; i < 6; i++) {
      cylinder(`water-straw-${i}`, 0.22, 0.012, [selfServeX + 0.16 + (i % 3) * 0.02, 1.06, selfServeZ + 0.13 + Math.floor(i / 3) * 0.03], kraftBag);
    }
    // Laser engraved wooden sign: "NƯỚC LỌC CHANH BẠC HÀ TỰ PHỤC VỤ (MIỄN PHÍ)"
    const waterSign = box('water-sign-tent', [0.36, 0.09, 0.08], [selfServeX - 0.36, 0.95, selfServeZ + 0.20], woodLight);
    waterJar.metadata = { cafeFeature: 'water-dispenser' };
    waterSign.metadata = { cafeFeature: 'water-dispenser' };
    collisionDiscs.push({ x: selfServeX, y: 0, z: selfServeZ, r: 0.70 });

    // 2. A-Frame Chalkboard Daily Specials (Biển Chữ A Menu Phấn Đen Viết Tay)
    const easelX = 1.95;
    const easelZ = -5.75;
    const chalkboardF = box('chalkboard-face-f', [0.74, 1.12, 0.035], [easelX, 0.58, easelZ + 0.07], charcoal);
    chalkboardF.rotation.x = 0.14;
    const chalkboardB = box('chalkboard-face-b', [0.74, 1.12, 0.035], [easelX, 0.58, easelZ - 0.07], darkWood);
    chalkboardB.rotation.x = -0.14;
    chalkboardB.metadata = { cafeFeature: 'chalkboard' };
    box('chalkboard-top-hinge', [0.78, 0.03, 0.08], [easelX, 1.13, easelZ], goldBrass);
    const chalkLedge = box('chalkboard-ledge', [0.74, 0.04, 0.08], [easelX, 0.12, easelZ + 0.15], darkWood);
    chalkLedge.metadata = { cafeFeature: 'chalkboard' };
    cylinder('chalk-piece-1', 0.06, 0.018, [easelX - 0.12, 0.15, easelZ + 0.15], white).rotation.z = Math.PI / 2;
    cylinder('chalk-piece-2', 0.06, 0.018, [easelX + 0.08, 0.15, easelZ + 0.15], lemonYellow).rotation.z = Math.PI / 2;
    // Paint chalkboard artwork onto face
    const chalkTex = new DynamicTexture('chalkboard-dynamic-tex', { width: 512, height: 768 }, scene, false);
    const chCtx = chalkTex.getContext() as unknown as CanvasRenderingContext2D;
    chCtx.fillStyle = '#181b19'; chCtx.fillRect(0, 0, 512, 768);
    chCtx.strokeStyle = '#c5a363'; chCtx.lineWidth = 6; chCtx.strokeRect(18, 18, 476, 732);
    chCtx.fillStyle = '#f8ecc4'; chCtx.font = 'bold 36px Georgia, serif'; chCtx.textAlign = 'center';
    chCtx.fillText('★ CLOSING BELL CAFÉ ★', 256, 75);
    chCtx.strokeStyle = '#8a6e3e'; chCtx.lineWidth = 2; chCtx.beginPath(); chCtx.moveTo(60, 95); chCtx.lineTo(452, 95); chCtx.stroke();
    chCtx.fillStyle = '#edd299'; chCtx.font = '600 28px Georgia, serif'; chCtx.textAlign = 'left';
    chCtx.fillText('☕ MÓN ĐẶC BIỆT HÔM NAY', 50, 150);
    chCtx.fillStyle = '#ffffff'; chCtx.font = '24px "DM Sans", sans-serif';
    chCtx.fillText('• Cold Brew Cam Sả Vàng', 60, 205);
    chCtx.fillText('• Croissant Bơ Pháp Nướng Nóng', 60, 255);
    chCtx.fillText('• Trà Đào Cam Sả Mật Ong', 60, 305);
    chCtx.fillStyle = '#ffd15c'; chCtx.font = 'bold 25px Georgia, serif';
    chCtx.fillText('🔥 GIỜ VÀNG (14:00 - 16:00):', 50, 385);
    chCtx.fillStyle = '#e8dfcb'; chCtx.font = '23px "DM Sans", sans-serif';
    chCtx.fillText('Mua 1 Tặng 1 mọi đồ uống!', 60, 430);
    chCtx.strokeStyle = '#4a504b'; chCtx.lineWidth = 1; chCtx.beginPath(); chCtx.moveTo(50, 480); chCtx.lineTo(462, 480); chCtx.stroke();
    chCtx.fillStyle = '#9fe8ba'; chCtx.font = '22px "DM Sans", sans-serif';
    chCtx.fillText('📶 Free Wi-Fi: CafeTrader_VIP', 60, 540);
    chCtx.fillStyle = '#ffffff'; chCtx.font = 'bold 23px monospace';
    chCtx.fillText('🔑 Mật khẩu: closingbell', 60, 585);
    chCtx.fillStyle = '#c5a363'; chCtx.font = 'italic 20px Georgia, serif'; chCtx.textAlign = 'center';
    chCtx.fillText('Chúc quý khách giao dịch thăng hoa!', 256, 680);
    chalkTex.update();
    const chalkMat = new StandardMaterial('chalkboard-mat', scene);
    chalkMat.diffuseTexture = chalkTex; chalkMat.emissiveColor = new Color3(0.55, 0.50, 0.42);
    chalkboardF.material = chalkMat;
    chalkboardF.metadata = { cafeFeature: 'chalkboard' };
    collisionDiscs.push({ x: easelX, y: 0, z: easelZ, r: 0.45 });

    // 3. Vintage Brass Umbrella Stand with Classic Umbrellas (Ống Cắm Dù Sang Trọng)
    const umbX = 1.82;
    const umbZ = -6.95;
    const umbBody = cylinder('umb-stand-body', 0.65, 0.32, [umbX, 0.325, umbZ], goldBrass);
    const umbRim = cylinder('umb-stand-rim', 0.04, 0.35, [umbX, 0.65, umbZ], goldBrass);
    cylinder('umb-stand-base', 0.05, 0.36, [umbX, 0.025, umbZ], darkWood);
    // 3 classic umbrellas with wooden curved J-handles
    const u1 = cylinder('umb-shaft-1', 0.85, 0.022, [umbX - 0.04, 0.58, umbZ + 0.02], charcoal); u1.rotation.z = 0.12;
    cylinder('umb-handle-1', 0.14, 0.026, [umbX - 0.11, 0.98, umbZ + 0.02], wood);
    const u2 = cylinder('umb-shaft-2', 0.85, 0.022, [umbX + 0.05, 0.58, umbZ - 0.04], greenDark); u2.rotation.x = -0.10;
    cylinder('umb-handle-2', 0.14, 0.026, [umbX + 0.05, 0.98, umbZ - 0.10], wood);
    const u3 = cylinder('umb-shaft-3', 0.85, 0.022, [umbX + 0.02, 0.58, umbZ + 0.04], rust); u3.rotation.z = -0.08;
    cylinder('umb-handle-3', 0.14, 0.026, [umbX + 0.08, 0.98, umbZ + 0.04], wood);
    const umbHit = cylinder('umb-stand-hit', 0.80, 0.36, [umbX, 0.40, umbZ], revolvingGlass);
    umbHit.visibility = 0.001;
    umbHit.isPickable = true;
    umbBody.metadata = { cafeFeature: 'umbrella-stand' };
    umbRim.metadata = { cafeFeature: 'umbrella-stand' };
    umbHit.metadata = { cafeFeature: 'umbrella-stand' };

    // 4. Newspaper & Financial Periodicals Wooden Rack (Kệ Treo Báo Tài Chính Gỗ & Đồng)
    const newsX = -7.2;
    const newsZ = 0.5;
    const newsPostL = box('news-post-l', [0.06, 1.35, 0.06], [newsX, 0.675, newsZ - 0.35], darkWood);
    const newsPostR = box('news-post-r', [0.06, 1.35, 0.06], [newsX, 0.675, newsZ + 0.35], darkWood);
    box('news-base-l', [0.34, 0.05, 0.08], [newsX, 0.025, newsZ - 0.35], darkWood);
    box('news-base-r', [0.34, 0.05, 0.08], [newsX, 0.025, newsZ + 0.35], darkWood);
    for (let r = 0; r < 3; r++) {
      cylinder(`news-rail-${r}`, 0.70, 0.02, [newsX, 0.40 + r * 0.35, newsZ], goldBrass).rotation.x = Math.PI / 2;
    }
    // Folded newspapers hanging on rods
    const ftPaper = box('news-ft-paper', [0.015, 0.42, 0.58], [newsX + 0.01, 1.02, newsZ], ftPink);
    box('news-ft-spine', [0.035, 0.035, 0.64], [newsX + 0.01, 1.23, newsZ], woodLight);
    const wsjPaperMesh = box('news-wsj-paper', [0.015, 0.42, 0.58], [newsX + 0.01, 0.67, newsZ], wsjPaper);
    box('news-wsj-spine', [0.035, 0.035, 0.64], [newsX + 0.01, 0.88, newsZ], woodLight);
    const bbgMag = box('news-bloomberg-mag', [0.02, 0.32, 0.48], [newsX + 0.01, 0.32, newsZ], darkWood);
    const newsHit = box('news-rack-hit', [0.35, 1.35, 0.80], [newsX, 0.675, newsZ], revolvingGlass);
    newsHit.visibility = 0.001;
    newsHit.isPickable = true;
    newsPostL.metadata = { cafeFeature: 'newspaper-rack' };
    newsPostR.metadata = { cafeFeature: 'newspaper-rack' };
    ftPaper.metadata = { cafeFeature: 'newspaper-rack' };
    wsjPaperMesh.metadata = { cafeFeature: 'newspaper-rack' };
    bbgMag.metadata = { cafeFeature: 'newspaper-rack' };
    newsHit.metadata = { cafeFeature: 'newspaper-rack' };
    collisionDiscs.push({ x: newsX, y: 0, z: newsZ, r: 0.45 });

    // 5. Specialty Coffee Beans & Retail Merchandise Shelf (Kệ Trưng Bày Hạt Cà Phê & Bình Giữ Nhiệt)
    const shelfX = 8.82;
    const shelfZ = 2.4;
    const retailShelfFrame = box('retail-shelf-frame', [0.35, 2.50, 1.65], [shelfX, 1.25, shelfZ], darkWood);
    retailShelfFrame.metadata = { cafeFeature: 'retail-shelf' };
    for (let s = 1; s <= 4; s++) {
      const sy = s * 0.55;
      const boardMesh = box(`retail-shelf-board-${s}`, [0.33, 0.035, 1.60], [shelfX, sy, shelfZ], woodLight);
      boardMesh.metadata = { cafeFeature: 'retail-shelf' };
      box(`retail-shelf-led-${s}`, [0.04, 0.015, 1.50], [shelfX - 0.12, sy - 0.02, shelfZ], lampGlow);
    }
    // Specialty Coffee Kraft Bags
    for (let b = 0; b < 3; b++) {
      const bagMat = b === 0 ? kraftBag : b === 1 ? rust : greenDark;
      const bagMesh = box(`retail-coffee-bag-${b}`, [0.14, 0.24, 0.18], [shelfX - 0.04, 1.22, shelfZ - 0.50 + b * 0.48], bagMat);
      bagMesh.metadata = { cafeFeature: 'retail-shelf' };
      cylinder(`retail-valve-${b}`, 0.01, 0.03, [shelfX - 0.115, 1.26, shelfZ - 0.50 + b * 0.48], goldBrass).rotation.z = Math.PI / 2;
    }
    // Branded ceramic mugs and travel tumblers
    for (let m = 0; m < 4; m++) {
      const mugMat = m % 2 === 0 ? marbleBlack : white;
      cylinder(`retail-mug-${m}`, 0.14, 0.13, [shelfX - 0.04, 0.62, shelfZ - 0.52 + m * 0.35], mugMat);
    }
    for (let t = 0; t < 3; t++) {
      cylinder(`retail-tumbler-${t}`, 0.28, 0.11, [shelfX - 0.04, 1.79, shelfZ - 0.45 + t * 0.45], teal);
      cylinder(`retail-tumbler-cap-${t}`, 0.04, 0.115, [shelfX - 0.04, 1.94, shelfZ - 0.45 + t * 0.45], goldBrass);
    }
    const shelfHit = box('retail-shelf-hit', [0.45, 2.50, 1.70], [shelfX, 1.25, shelfZ], revolvingGlass);
    shelfHit.visibility = 0.001;
    shelfHit.isPickable = true;
    shelfHit.metadata = { cafeFeature: 'retail-shelf' };
    collisionDiscs.push({ x: shelfX, y: 0, z: shelfZ, r: 0.55 });

    // 6. Tray Return & Waste Sorting Station (Trạm Trả Khay & Phân Loại Rác Tự Phục Vụ)
    const trayStationX = 3.65;
    const trayStationZ = -4.5;
    const trayBody = box('tray-cabinet-body', [1.32, 1.05, 0.65], [trayStationX, 0.525, trayStationZ], darkWood);
    const trayTop = box('tray-cabinet-top', [1.38, 0.04, 0.70], [trayStationX, 1.07, trayStationZ], marbleBlack);
    trayBody.metadata = { cafeFeature: 'tray-return' };
    trayTop.metadata = { cafeFeature: 'tray-return' };
    box('tray-rim-back', [1.38, 0.10, 0.03], [trayStationX, 1.12, trayStationZ + 0.335], goldBrass);
    // 2 stacked wooden serving trays
    const tray1 = box('tray-stack-1', [0.42, 0.025, 0.30], [trayStationX - 0.32, 1.10, trayStationZ], woodLight);
    box('tray-stack-2', [0.42, 0.025, 0.30], [trayStationX - 0.32, 1.13, trayStationZ], woodLight);
    tray1.metadata = { cafeFeature: 'tray-return' };
    // 3 circular drop portals
    cylinder('waste-portal-cup', 0.015, 0.17, [trayStationX + 0.08, 1.085, trayStationZ], chromeSilver);
    cylinder('waste-portal-lid', 0.015, 0.17, [trayStationX + 0.32, 1.085, trayStationZ], chromeSilver);
    cylinder('waste-portal-compost', 0.015, 0.17, [trayStationX + 0.54, 1.085, trayStationZ], darkWood);
    const trayHit = box('tray-station-hit', [1.40, 1.15, 0.70], [trayStationX, 0.575, trayStationZ], revolvingGlass);
    trayHit.visibility = 0.001;
    trayHit.isPickable = true;
    trayHit.metadata = { cafeFeature: 'tray-return' };
    collisionDiscs.push({ x: trayStationX, y: 0, z: trayStationZ, r: 0.55 });

    // Cozy candle flames and steaming wisps on tables
    const candleFlames: Mesh[] = [];
    const steamWisps: Mesh[] = [];

    // A layered brass chandelier turns the main floor into a warm, dressed-up café salon.
    // Its bulbs use emissive material; the single amber PointLight above supplies the actual illumination.
    const chandelierX = -0.8;
    const chandelierZ = 0.9;
    cylinder('grand-chandelier-cord', 2.25, 0.045, [chandelierX, 6.72, chandelierZ], charcoal);
    for (const [tier, diameter, y, bulbs] of [[0, 2.25, 5.62, 12], [1, 1.42, 5.28, 8]] as const) {
      const ring = cylinder(`grand-chandelier-ring-${tier}`, 0.10, diameter, [chandelierX, y, chandelierZ], goldBrass);
      ring.rotation.x = Math.PI / 2;
      for (let i = 0; i < bulbs; i += 1) {
        const angle = (i * Math.PI * 2) / bulbs + (tier ? Math.PI / bulbs : 0);
        const radius = diameter * 0.36;
        cylinder(`grand-chandelier-drop-${tier}-${i}`, 0.30 + tier * 0.08, 0.022, [chandelierX + Math.cos(angle) * radius, y - 0.16, chandelierZ + Math.sin(angle) * radius], brass);
        sphere(`grand-chandelier-bulb-${tier}-${i}`, 0.125, [chandelierX + Math.cos(angle) * radius, y - 0.35 - tier * 0.08, chandelierZ + Math.sin(angle) * radius], lampGlow);
      }
    }
    sphere('grand-chandelier-finial', 0.20, [chandelierX, 4.82, chandelierZ], goldBrass);

    // Framed café art and candle clusters add detail at eye level while keeping clear walking lanes.
    const artFrames: Array<[number, string, string]> = [[-1.1, '#803c1b', 'trading-rose'], [1.05, '#244052', 'midnight-blue'], [3.2, '#194d38', 'emerald-still-life']];
    artFrames.forEach(([x, color, name], index) => {
      const art = material(`gallery-art-${name}`, color, color);
      box(`gallery-frame-${name}`, [1.28, 1.52, 0.10], [x, 2.9, 6.58], goldBrass);
      box(`gallery-canvas-${name}`, [1.10, 1.33, 0.035], [x, 2.9, 6.50], art);
      sphere(`gallery-sconce-${name}`, 0.09, [x, 3.82, 6.36], lampGlow);
      if (index === 1) box('gallery-arch-plaque', [1.60, 0.05, 0.16], [x, 1.98, 6.48], darkWood);
    });

    // ==========================================
    // 5. ALL TABLES (Ground + VIP Mezzanine)
    // ==========================================
    TABLES.forEach((table, tableIndex) => {
      const isVIP = table.floor === 2;
      const baseMat = isVIP ? (table.type === 'vip-lounge' ? marbleWhite : marbleBlack) : woodLight;

      // Rug under table
      cylinder(`table-rug-${tableIndex}`, 0.008, isVIP ? 3.6 : 3.2, [table.x, table.y + 0.005, table.z], isVIP ? vipRug : (tableIndex % 2 ? rugMat1 : rugMat2));
      cylinder(`table-rug-border-${tableIndex}`, 0.009, isVIP ? 3.74 : 3.32, [table.x, table.y + 0.004, table.z], isVIP ? goldBrass : darkWood);

      const defaultTableSeat = `table-${tableIndex + 1}-seat-1`;
      let tTopMesh: Mesh;
      if (table.type === 'vip-lounge') {
        // Grand rectangular Calacatta marble coffee table
        tTopMesh = box(`table-top-${tableIndex}`, [1.8, 0.12, 1.1], [table.x, table.y + 0.65, table.z], marbleWhite);
        box(`table-frame-${tableIndex}`, [1.84, 0.04, 1.14], [table.x, table.y + 0.58, table.z], goldBrass);
        for (const dx of [-0.8, 0.8]) for (const dz of [-0.45, 0.45]) {
          cylinder(`table-leg-${tableIndex}-${dx}-${dz}`, 0.56, 0.07, [table.x + dx, table.y + 0.30, table.z + dz], goldBrass);
        }
      } else {
        // Standard or Balcony round table
        tTopMesh = cylinder(`table-top-${tableIndex}`, 0.11, isVIP ? 1.45 : 1.35, [table.x, table.y + 0.79, table.z], baseMat);
        cylinder(`table-base-${tableIndex}`, 0.75, 0.13, [table.x, table.y + 0.39, table.z], isVIP ? goldBrass : darkWood);
        cylinder(`table-foot-${tableIndex}`, 0.06, 0.58, [table.x, table.y + 0.035, table.z], isVIP ? goldBrass : darkWood);
      }
      tTopMesh.metadata = { seatId: defaultTableSeat };

      // Cup & Steam
      cylinder(`table-cup-${tableIndex}`, 0.14, 0.15, [table.x + 0.26, table.y + 0.91, table.z + 0.12], white);
      cylinder(`coffee-${tableIndex}`, 0.01, 0.12, [table.x + 0.26, table.y + 0.985, table.z + 0.12], espresso);

      const steam = sphere(`steam-${tableIndex}`, 0.12, [table.x + 0.26, table.y + 1.08, table.z + 0.12], steamMat);
      steam.scaling.set(0.8, 1.8, 0.8);
      steamWisps.push(steam);

      // One open, leather-bound menu per table. It uses the shared catalogue but a
      // different signature suggestion, giving every table a distinct invitation to order.
      const menuItem = CAFE_MENU[tableIndex % CAFE_MENU.length];
      const menuX = table.x - 0.10;
      const menuZ = table.z + 0.20;
      const menuY = table.y + (table.type === 'vip-lounge' ? 0.735 : 0.865);
      const menuCover = isVIP ? royalVelvet : darkWood;
      const tableMenuMeshes: Mesh[] = [];
      tableMenuMeshes.push(box(`table-menu-cover-${tableIndex}`, [0.76, 0.035, 0.57], [menuX, menuY, menuZ], menuCover));
      tableMenuMeshes.push(box(`table-menu-spine-${tableIndex}`, [0.045, 0.055, 0.57], [menuX, menuY + 0.015, menuZ], goldBrass));
      tableMenuMeshes.push(box(`table-menu-corner-l-${tableIndex}`, [0.085, 0.018, 0.085], [menuX - 0.33, menuY + 0.030, menuZ - 0.23], goldBrass));
      tableMenuMeshes.push(box(`table-menu-corner-r-${tableIndex}`, [0.085, 0.018, 0.085], [menuX + 0.33, menuY + 0.030, menuZ + 0.23], goldBrass));
      const menuTexture = new DynamicTexture(`table-menu-texture-${tableIndex}`, { width: 768, height: 560 }, scene, false);
      const menuCtx = menuTexture.getContext() as unknown as CanvasRenderingContext2D;
      menuCtx.fillStyle = '#f1e4c9'; menuCtx.fillRect(0, 0, 768, 560);
      menuCtx.strokeStyle = '#a77a38'; menuCtx.lineWidth = 10; menuCtx.strokeRect(16, 16, 736, 528);
      menuCtx.fillStyle = '#5f3f21'; menuCtx.font = '600 38px Georgia, serif'; menuCtx.textAlign = 'center';
      menuCtx.fillText('CLOSING BELL', 384, 78);
      menuCtx.fillStyle = '#9a7137'; menuCtx.font = 'bold 18px "DM Sans", sans-serif';
      menuCtx.fillText(menuItem.category.toUpperCase(), 384, 108);
      menuCtx.strokeStyle = '#c9af7c'; menuCtx.lineWidth = 2; menuCtx.beginPath(); menuCtx.moveTo(68, 130); menuCtx.lineTo(700, 130); menuCtx.stroke();
      menuCtx.fillStyle = '#312117'; menuCtx.font = '600 31px Georgia, serif';
      menuCtx.fillText(menuItem.name, 384, 190);
      menuCtx.fillStyle = '#765f43'; menuCtx.font = '20px "DM Sans", sans-serif';
      menuCtx.fillText(menuItem.shortDescription, 384, 235);
      menuCtx.font = 'italic 19px Georgia, serif'; menuCtx.fillStyle = '#5f4d38';
      menuCtx.fillText(menuItem.recipe[0], 384, 315);
      menuCtx.fillStyle = '#aa7b37'; menuCtx.font = 'bold 17px "DM Sans", sans-serif';
      menuCtx.fillText(`${menuItem.serving.toUpperCase()} · HỎI BARISTA THU HÀ`, 384, 456);
      menuCtx.fillStyle = '#806844'; menuCtx.font = 'italic 16px Georgia, serif';
      menuCtx.fillText('Mở menu UI để xem đủ công thức', 384, 500);
      menuTexture.update();
      const menuPageMat = new StandardMaterial(`table-menu-page-mat-${tableIndex}`, scene);
      menuPageMat.diffuseTexture = menuTexture; menuPageMat.emissiveColor = new Color3(0.16, 0.12, 0.07); menuPageMat.backFaceCulling = false;
      const menuPage = MeshBuilder.CreatePlane(`table-menu-page-${tableIndex}`, { width: 0.68, height: 0.49 }, scene);
      menuPage.position.set(menuX, menuY + 0.038, menuZ); menuPage.rotation.x = Math.PI / 2; menuPage.material = menuPageMat;
      tableMenuMeshes.push(menuPage);
      tableMenuMeshes.forEach((mesh) => { mesh.metadata = { tableMenuIndex: tableIndex }; });

      // Candle
      cylinder(`candle-${tableIndex}`, 0.16, 0.10, [table.x - 0.28, table.y + 0.91, table.z - 0.15], isVIP ? goldBrass : lampGlow);
      const flame = sphere(`candle-flame-${tableIndex}`, 0.07, [table.x - 0.28, table.y + 1.03, table.z - 0.15], flameMat);
      flame.scaling.set(0.7, 1.4, 0.7);
      candleFlames.push(flame);

      // Tabletop Wireless Fast Charging Pad (Qi2 15W)
      const tableYTop = table.y + (table.type === 'vip-lounge' ? 0.71 : 0.845);
      const padX = table.x + (table.type === 'vip-lounge' ? 0.52 : 0.32);
      const padZ = table.z - (table.type === 'vip-lounge' ? 0.26 : 0.22);
      const padY = tableYTop + 0.004;
      const chargerPad = cylinder(`table-charger-${tableIndex}`, 0.008, 0.22, [padX, padY, padZ], charcoal);
      const chargerRing = cylinder(`table-charger-ring-${tableIndex}`, 0.009, 0.236, [padX, padY, padZ], goldBrass);
      const chargerLed = cylinder(`table-charger-led-${tableIndex}`, 0.010, 0.06, [padX, padY + 0.001, padZ], teal);
      chargerPad.metadata = { cafeFeature: 'wireless-charger' };
      chargerRing.metadata = { cafeFeature: 'wireless-charger' };
      chargerLed.metadata = { cafeFeature: 'wireless-charger' };

      // Under-table Duplex AC & Dual USB-C Fast Charger Outlet Box
      const outletZ = table.z - (table.type === 'vip-lounge' ? 0.52 : 0.62);
      box(`table-outlet-box-${tableIndex}`, [0.14, 0.08, 0.06], [table.x, tableYTop - 0.09, outletZ], charcoal);
      box(`table-outlet-face-${tableIndex}`, [0.12, 0.06, 0.006], [table.x, tableYTop - 0.09, outletZ - 0.03], goldBrass);

      // Miniature Tabletop Wi-Fi & Crypto Accepted Tent Card
      const tentX = table.x - (table.type === 'vip-lounge' ? 0.48 : 0.32);
      const tentZ = table.z + (table.type === 'vip-lounge' ? 0.24 : 0.20);
      const tableTent = box(`table-wifi-tent-${tableIndex}`, [0.12, 0.07, 0.05], [tentX, tableYTop + 0.035, tentZ], woodLight);
      const tableTentPlate = box(`table-wifi-brass-${tableIndex}`, [0.10, 0.05, 0.006], [tentX, tableYTop + 0.035, tentZ + 0.026], goldBrass);
      tableTent.metadata = { cafeFeature: 'wifi-stand' };
      tableTentPlate.metadata = { cafeFeature: 'wifi-stand' };

      collisionDiscs.push({ x: table.x, y: table.y, z: table.z, r: 0.75 });

      // Chairs around table
      SEAT_OFFSETS.forEach((offset, seatIndex) => {
        const seatId = `table-${tableIndex + 1}-seat-${seatIndex + 1}`;
        const x = table.x + offset.x, z = table.z + offset.z;
        seatPositions.set(seatId, { x, y: table.y, z, facing: offset.facing, tableIndex: tableIndex + 1, seatIndex: seatIndex + 1 });

        const chair = new TransformNode(`chair-${seatId}`, scene);
        chair.position.set(x, table.y, z); chair.rotation.y = offset.facing;

        const clickable: Mesh[] = [];
        const seatMat = isVIP ? (table.type === 'vip-lounge' ? cognacLeather : royalVelvet) : (tableIndex % 2 ? rust : teal);

        clickable.push(box('seat', [0.64, 0.13, 0.64], [0, 0.49, 0], seatMat, chair));
        clickable.push(box('backrest', [0.64, 0.65, 0.11], [0, 0.82, -0.28], seatMat, chair));
        for (const dx of [-0.24, 0.24]) for (const dz of [-0.23, 0.23]) {
          clickable.push(box('chair leg', [0.07, 0.46, 0.07], [dx, 0.24, dz], isVIP ? goldBrass : darkWood, chair));
        }
        clickable.forEach(mesh => { mesh.metadata = { seatId }; });
      });
    });

    // VIP Lounge Modern Ring Chandelier
    const chRing = cylinder('vip-chandelier-ring', 0.08, 2.0, [3.2, 5.6, 4.6], goldBrass);
    chRing.rotation.x = Math.PI / 2;
    cylinder('vip-chandelier-cord', 1.2, 0.02, [3.2, 6.2, 4.6], charcoal);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6;
      sphere(`vip-bulb-${i}`, 0.16, [3.2 + Math.cos(a) * 0.95, 5.5, 4.6 + Math.sin(a) * 0.95], lampGlow);
    }

    // Ground floor pendant lights
    for (const x of [-5.3, -1.8, 1.8]) for (const z of [-1.8, 3.0]) {
      cylinder('pendant cable', 1.6, 0.035, [x, 4.8, z], charcoal);
      cylinder('pendant shade', 0.22, 0.62, [x, 3.9, z], darkWood);
      sphere('pendant light', 0.22, [x, 3.76, z], lampGlow);
    }

    // Wall clock
    const clock = cylinder('wall clock', 0.05, 0.95, [-6.0, 4.6, 6.74], goldBrass); clock.rotation.x = Math.PI / 2;
    const clockFace = cylinder('clock face', 0.06, 0.8, [-6.0, 4.6, 6.7], white); clockFace.rotation.x = Math.PI / 2;

    // Characters
    function character(name: string, color: string, label?: string): Character {
      const root = new TransformNode(`person-${name}`, scene);
      let col: Color3;
      try { col = Color3.FromHexString(/^#[0-9a-f]{6}$/i.test(color) ? color : '#b07852'); } catch { col = Color3.FromHexString('#b07852'); }
      const shirt = new StandardMaterial(`shirt-${name}`, scene); shirt.diffuseColor = col; shirt.specularColor = Color3.Black();
      const skin = material(`skin-${name}`, '#c99470');
      const hair = material(`hair-${name}`, '#34241d');
      const trousers = material(`trousers-${name}`, '#303a39');
      box('body', [0.42, 0.61, 0.24], [0, 1.12, 0], shirt, root);
      sphere('head', 0.33, [0, 1.65, 0], skin, root);
      const hairMesh = sphere('hair', 0.34, [0, 1.73, -0.025], hair, root); hairMesh.scaling.y = 0.56;
      const leftArm = box('arm', [0.13, 0.58, 0.14], [-0.28, 1.12, 0], shirt, root);
      const rightArm = box('arm', [0.13, 0.58, 0.14], [0.28, 1.12, 0], shirt, root);
      const leftLeg = box('leg', [0.16, 0.68, 0.17], [-0.12, 0.47, 0], trousers, root);
      const rightLeg = box('leg', [0.16, 0.68, 0.17], [0.12, 0.47, 0], trousers, root);

      let labelTex: DynamicTexture | undefined;
      if (label) {
        labelTex = new DynamicTexture(`label-${name}`, { width: 512, height: 128 }, scene, false);
        const lCtx = labelTex.getContext() as unknown as CanvasRenderingContext2D;
        lCtx.fillStyle = '#1c2923'; lCtx.fillRect(0, 0, 512, 128);
        lCtx.fillStyle = '#e8dcc4';
        lCtx.font = 'bold 50px "DM Sans", sans-serif'; lCtx.textAlign = 'center'; lCtx.textBaseline = 'middle';
        lCtx.fillText(label.slice(0, 20), 256, 64); labelTex.update();
        const lMat = new StandardMaterial(`label-mat-${name}`, scene);
        lMat.diffuseTexture = labelTex; lMat.emissiveColor = new Color3(0.5, 0.5, 0.5); lMat.backFaceCulling = false;
        const lPlane = MeshBuilder.CreatePlane(`label-plane-${name}`, { width: 1.05, height: 0.26 }, scene);
        lPlane.position.set(0, 2.05, 0); lPlane.billboardMode = Mesh.BILLBOARDMODE_ALL; lPlane.material = lMat; lPlane.parent = root;
      }

      // 3D Speaking Acoustic Halo (pulsates when speaking)
      const speakingHalo = MeshBuilder.CreateTorus(`speaking-halo-${name}`, { diameter: 0.62, thickness: 0.04, tessellation: 24 }, scene);
      speakingHalo.position.set(0, 1.95, 0);
      speakingHalo.rotation.x = Math.PI / 2;
      const haloMat = new StandardMaterial(`speaking-halo-mat-${name}`, scene);
      haloMat.diffuseColor = Color3.FromHexString('#22c55e');
      haloMat.emissiveColor = Color3.FromHexString('#16a34a');
      haloMat.specularColor = Color3.Black();
      speakingHalo.material = haloMat;
      speakingHalo.parent = root;
      speakingHalo.isVisible = false;

      // 3D Zen Massage Aura (glows when receiving wellness massage)
      const zenHalo = MeshBuilder.CreateTorus(`zen-halo-${name}`, { diameter: 0.88, thickness: 0.045, tessellation: 24 }, scene);
      zenHalo.position.set(0, 2.18, 0);
      zenHalo.rotation.x = Math.PI / 2;
      const zenMat = new StandardMaterial(`zen-halo-mat-${name}`, scene);
      zenMat.diffuseColor = Color3.FromHexString('#f59e0b');
      zenMat.emissiveColor = Color3.FromHexString('#eab308');
      zenMat.specularColor = Color3.Black();
      zenHalo.material = zenMat;
      zenHalo.parent = root;
      zenHalo.isVisible = false;

      return { root, limbs: [leftArm, rightArm, leftLeg, rightLeg], label: labelTex, speakingHalo, zenHalo };
    }

    const cafeStaff = [
      { id: 'concierge-minh-an' as StaffId, color: '#355d52', label: '✦ Quản gia Minh An', pos: [12.1, 0, -3.3] as [number, number, number], facing: Math.PI },
      { id: 'barista-thu-ha' as StaffId, color: '#8d4f38', label: '🍸 Bartender Thu Hà', pos: [5.8, 0, 4.15] as [number, number, number], facing: Math.PI },
      { id: 'host-bao-ngoc' as StaffId, color: '#7d5278', label: '❋ Tiếp viên Bảo Ngọc', pos: [-6.9, 0, -0.1] as [number, number, number], facing: Math.PI / 2 },
    ].map((profile) => {
      const staff = character(`staff-${profile.id}`, profile.color, profile.label);
      staff.root.position.set(...profile.pos);
      staff.root.rotation.y = profile.facing;

      if (profile.id === 'barista-thu-ha') {
        // Professional Bartender & Barista Attire: Charcoal apron, leather straps, red bowtie & brass badge
        const apronMat = material('bartender-apron-mat', '#1c2226');
        const bowMat = material('bartender-bowtie-mat', '#943828');
        box('bartender-apron', [0.38, 0.60, 0.25], [0, 1.08, 0.01], apronMat, staff.root);
        box('bartender-strap-l', [0.035, 0.38, 0.02], [-0.10, 1.34, 0.125], goldBrass, staff.root);
        box('bartender-strap-r', [0.035, 0.38, 0.02], [0.10, 1.34, 0.125], goldBrass, staff.root);
        box('bartender-bowtie', [0.11, 0.055, 0.04], [0, 1.48, 0.13], bowMat, staff.root);
        box('bartender-badge', [0.08, 0.035, 0.02], [-0.11, 1.36, 0.135], goldBrass, staff.root);
      }

      staff.root.getChildMeshes().forEach((mesh) => { mesh.metadata = { staffId: profile.id }; });
      return staff;
    });
    const me = character('local', '#c3a16f');
    const remotes = new Map<string, Character>();

    // Architectural meshes never move. Freeze their transforms so Babylon does not
    // recalculate world matrices for the whole villa on every rendered frame.
    const dynamicMeshes = new Set<AbstractMesh>([
      ...winterSnowflakes.map(({ mesh }) => mesh), ...candleFlames, ...hearthFlames,
      ...fireplaceEmbers, ...steamWisps, vinylDisc, catBody, ...me.root.getChildMeshes(),
      ...autoDoorLeft.getChildMeshes(), ...autoDoorRight.getChildMeshes(), autoSensorIndicator,
      ...(me.speakingHalo ? [me.speakingHalo] : []), ...(me.zenHalo ? [me.zenHalo] : []),
      ...cafeStaff.flatMap((s) => [...s.root.getChildMeshes(), ...s.limbs]),
      ...beaconMeshes,
    ]);
    scene.meshes.forEach(mesh => {
      if (!dynamicMeshes.has(mesh)) mesh.freezeWorldMatrix();
    });

    // Visual drink meshes on tables
    type TableDrinkVisual = {
      cup: Mesh;
      fluid: Mesh;
      fluidMaterial: StandardMaterial;
      drinkName: string;
    };
    const tableDrinkMeshes = new Map<string, TableDrinkVisual>();

    function renderDrinkOnTable(seatId: string, drinkName: string) {
      const seat = seatPositions.get(seatId);
      if (!seat) return;
      const table = TABLES[seat.tableIndex - 1];
      if (!table) return;

      const angle = seat.facing;
      const distFromSeat = 0.55;
      const dx = -Math.sin(angle) * distFromSeat;
      const dz = -Math.cos(angle) * distFromSeat;
      const drinkX = seat.x + dx;
      const drinkZ = seat.z + dz;
      const drinkY = seat.y + 0.92;

      const meshKey = `drink-${seatId}`;
      const existing = tableDrinkMeshes.get(meshKey);
      // This function is called from the render loop for local and remote players.
      // Do not allocate meshes/materials again unless the actual drink changed.
      if (existing?.drinkName === drinkName) return;
      let fluidColor = '#3a2016';
      if (drinkName.includes('Matcha') || drinkName.includes('Trà xanh')) fluidColor = '#4a7543';
      else if (drinkName.includes('sữa') || drinkName.includes('xỉu')) fluidColor = '#946d4a';
      else if (drinkName.includes('Cacao')) fluidColor = '#4a2c1f';
      else if (drinkName.includes('Đào') || drinkName.includes('Nước')) fluidColor = '#d98b4c';

      const fluidMat = material(`fluid-${seatId}`, fluidColor, fluidColor);
      if (existing) {
        existing.fluidMaterial.dispose();
        existing.fluid.material = fluidMat;
        existing.fluidMaterial = fluidMat;
        existing.drinkName = drinkName;
        return;
      }

      const cup = cylinder(meshKey, 0.16, 0.14, [drinkX, drinkY, drinkZ], white);
      const fluid = cylinder(`fluid-top-${seatId}`, 0.01, 0.12, [0, 0.08, 0], fluidMat, cup);
      tableDrinkMeshes.set(meshKey, { cup, fluid, fluidMaterial: fluidMat, drinkName });
    }

    function removeDrinkFromTable(seatId: string) {
      const meshKey = `drink-${seatId}`;
      const visual = tableDrinkMeshes.get(meshKey);
      if (visual) {
        visual.fluidMaterial.dispose();
        visual.cup.dispose(false, true);
        tableDrinkMeshes.delete(meshKey);
      }
    }

    const floatingEmoteMeshes = new Map<string, { plane: Mesh; startY: number; startTime: number }>();

    // Position state includes y for multi-floor navigation
    // New guests begin outside the villa gate and walk toward the illuminated café doors.
    const position = { x: 0, y: 0, z: -31.2, yaw: 0, pitch: 0.04 };
    const keys = new Set<string>();
    const touch = { forward: 0, right: 0 };
    let pointerDown: { x: number; y: number; dragged: boolean } | null = null;
    let lastSent = 0;
    let lastReported = { x: Infinity, y: Infinity, z: Infinity, rotation: Infinity };
    let lastSeat: string | null = null;
    let moving = false;
    let walkingTime = 0;
    let totalTime = 0;
    let lastQuoteChange = 0;
    let lastReportedFloor = 1;
    let lastStatsTime = 0;
    let lastCaptureNonce = 0;

    const isTyping = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return;
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(key)) {
        chillAudio.resume();
        keys.add(key); if (key.startsWith('arrow')) event.preventDefault();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    const onBlur = () => { keys.clear(); touch.forward = 0; touch.right = 0; };
    window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur);

    const onPointerDown = (event: PointerEvent) => { chillAudio.resume(); pointerDown = { x: event.clientX, y: event.clientY, dragged: false }; canvas.setPointerCapture(event.pointerId); };
    const onPointerMove = (event: PointerEvent) => {
      if (!pointerDown) return;
      const dx = event.clientX - pointerDown.x, dy = event.clientY - pointerDown.y;
      if (Math.abs(dx) + Math.abs(dy) > 1) pointerDown.dragged = true;
      position.yaw += dx * 0.005;
      // Allow a near-vertical 89.5° upward look: enough to inspect the full vault without a gimbal singularity.
      position.pitch = Math.max(-(Math.PI / 2 - 0.01), Math.min(0.85, position.pitch + dy * 0.004));
      pointerDown.x = event.clientX; pointerDown.y = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (pointerDown && !pointerDown.dragged) {
        const rect = canvas.getBoundingClientRect();
        const pick = scene.pick((event.clientX - rect.left) * engine.getRenderWidth() / rect.width, (event.clientY - rect.top) * engine.getRenderHeight() / rect.height);
        const seatId = pick?.pickedMesh?.metadata?.seatId as string | undefined;
        const staffId = pick?.pickedMesh?.metadata?.staffId as StaffId | undefined;
        const tableMenuIndex = pick?.pickedMesh?.metadata?.tableMenuIndex as number | undefined;
        const cafeFeature = pick?.pickedMesh?.metadata?.cafeFeature as string | undefined;

        if (cafeFeature) {
          switch (cafeFeature) {
            case 'service-bell':
              chillAudio.playDeskBell();
              window.dispatchEvent(new CustomEvent('cafe-toast', {
                detail: '🔔 Ding! Bạn đã bấm chuông gọi phục vụ quầy bar. Bartender Thu Hà mỉm cười chào bạn!'
              }));
              propsRef.current.onStaffClick?.('barista-thu-ha');
              break;
            case 'water-dispenser':
              chillAudio.playWaterPour();
              window.dispatchEvent(new CustomEvent('cafe-toast', {
                detail: '🍋 Bạn vừa rót một ly nước lọc ngâm chanh vàng và lá bạc hà mát lạnh (Miễn phí)!'
              }));
              break;
            case 'wifi-stand':
              chillAudio.playMenuPaper();
              window.dispatchEvent(new CustomEvent('cafe-toast', {
                detail: '📶 Thẻ Wi-Fi: "CafeTrader_VIP" | Mật khẩu: "closingbell" (Tốc độ 1 Gbps, bảo mật WPA3).'
              }));
              break;
            case 'chalkboard':
              chillAudio.playMenuPaper();
              window.dispatchEvent(new CustomEvent('cafe-toast', {
                detail: '📋 Menu phấn: Giờ vàng 14:00 - 16:00 Mua 1 Tặng 1! Hot: Cold Brew Cam Sả & Bánh Croissant nướng bơ Pháp.'
              }));
              break;
            case 'newspaper-rack':
              chillAudio.playPageFlip();
              window.dispatchEvent(new CustomEvent('cafe-toast', {
                detail: '📰 Báo tài chính hôm nay: Financial Times & The Wall Street Journal số mới nhất về crypto & vĩ mô!'
              }));
              break;
            case 'pastry-case':
              chillAudio.playTongsClick();
              window.dispatchEvent(new CustomEvent('cafe-toast', {
                detail: '🥐 Tủ bánh nóng sốt: Bánh sừng bò Pháp bơ vàng giòn, Pain au Chocolat và Canelé thơm nức vừa ra lò!'
              }));
              break;
            case 'umbrella-stand':
              window.dispatchEvent(new CustomEvent('cafe-toast', {
                detail: '☂️ Ống cắm dù đồng cổ điển: Quý khách có thể mượn ô miễn phí khi trời New York mưa tuyết!'
              }));
              break;
            case 'wireless-charger':
              chillAudio.playQiChime();
              window.dispatchEvent(new CustomEvent('cafe-toast', {
                detail: '⚡ Sạc không dây nhanh 15W Qi2: Đã đặt điện thoại lên đế sạc bàn, pin đang được nạp nhanh!'
              }));
              break;
            case 'retail-shelf':
              chillAudio.playMenuPaper();
              window.dispatchEvent(new CustomEvent('cafe-toast', {
                detail: '🛍️ Kệ lưu niệm: Hạt specialty coffee Arabica Cầu Đất, Ethiopia Yirgacheffe, Ly sứ & Bình giữ nhiệt CafeTrader.'
              }));
              break;
            case 'tray-return':
              window.dispatchEvent(new CustomEvent('cafe-toast', {
                detail: '♻️ Quầy trả khay & phân loại rác tự phục vụ: Cảm ơn bạn đã giữ gìn không gian quán sạch đẹp!'
              }));
              break;
          }
        } else if (tableMenuIndex !== undefined) {
          propsRef.current.onTableMenuClick?.(tableMenuIndex);
        } else if (seatId) {
          propsRef.current.onSeatClick?.(seatId);
        } else if (staffId) {
          propsRef.current.onStaffClick?.(staffId);
        } else if (pick?.pickedMesh?.name?.includes('screen') || pick?.pickedMesh?.name?.includes('display')) {
          propsRef.current.onInspectTerminal?.();
        }
      }
      pointerDown = null;
    };
    canvas.addEventListener('pointerdown', onPointerDown); canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp); canvas.addEventListener('pointercancel', onPointerUp);
    const onResize = () => engine.resize(); window.addEventListener('resize', onResize);

    const onTouchDirection = (event: Event) => {
      chillAudio.resume();
      const detail = (event as CustomEvent<{ forward: number; right: number }>).detail;
      if (detail) { touch.forward = Math.max(-1, Math.min(1, detail.forward)); touch.right = Math.max(-1, Math.min(1, detail.right)); }
    };
    canvas.addEventListener('cafe-direction', onTouchDirection);

    const onTeleportPOV = (event: Event) => {
      const pov = (event as CustomEvent<'arrival' | 'hearth' | 'library' | 'terrace'>).detail;
      if (!pov) return;
      if (pov === 'arrival') {
        position.x = 0; position.y = 0; position.z = -31.2; position.yaw = 0; position.pitch = 0.04;
      } else if (pov === 'hearth') {
        position.x = -5.8; position.y = 0; position.z = 3.6; position.yaw = 0; position.pitch = 0.02;
      } else if (pov === 'library') {
        position.x = -5.8; position.y = 3.2; position.z = 4.2; position.yaw = 0; position.pitch = 0.02;
      } else if (pov === 'terrace') {
        position.x = -6.4; position.y = 3.2; position.z = 2.4; position.yaw = -Math.PI / 2; position.pitch = 0.04;
      }
      lastReportedFloor = ROYAL_FLOOR_HEIGHTS.reduce((closest, height, index) => Math.abs(position.y - height) < Math.abs(position.y - ROYAL_FLOOR_HEIGHTS[closest - 1]) ? index + 1 : closest, 1);
      propsRef.current.onFloorChange?.(lastReportedFloor);
      propsRef.current.onMove?.({ x: position.x, y: position.y, z: position.z, rotation: position.yaw });
    };
    canvas.addEventListener('cafe-teleport-pov', onTeleportPOV);

    const onTeleportFloor = (event: Event) => {
      const floor = (event as CustomEvent<number>).detail;
      if (!Number.isInteger(floor) || floor < 1 || floor > 8) return;
      position.x = 0;
      position.y = ROYAL_FLOOR_HEIGHTS[floor - 1];
      position.z = floor === 1 ? -4.9 : floor === 2 ? 2.25 : 1.2;
      position.yaw = floor >= 3 ? Math.PI : 0;
      position.pitch = 0.03;
      lastReportedFloor = floor;
      propsRef.current.onFloorChange?.(floor);
      propsRef.current.onMove?.({ x: position.x, y: position.y, z: position.z, rotation: position.yaw });
    };
    canvas.addEventListener('cafe-teleport-floor', onTeleportFloor);

    // 3D Fireworks Particle System & Light Flash
    const fireworkLight = new PointLight('firework-flash', new Vector3(0, 20, 0), scene);
    fireworkLight.diffuse = new Color3(1, 0.88, 0.5);
    fireworkLight.intensity = 0;
    fireworkLight.range = 70;

    type FireworkSpark = {
      mesh: Mesh;
      velocity: Vector3;
      life: number;
      maxLife: number;
    };
    const activeSparks: FireworkSpark[] = [];
    const sparkMatGold = new StandardMaterial('fw-mat-gold', scene);
    sparkMatGold.emissiveColor = Color3.FromHexString('#f59e0b');
    sparkMatGold.diffuseColor = Color3.FromHexString('#fbbf24');
    const sparkMatRuby = new StandardMaterial('fw-mat-ruby', scene);
    sparkMatRuby.emissiveColor = Color3.FromHexString('#ef4444');
    sparkMatRuby.diffuseColor = Color3.FromHexString('#f87171');
    const sparkMatEmerald = new StandardMaterial('fw-mat-emerald', scene);
    sparkMatEmerald.emissiveColor = Color3.FromHexString('#10b981');
    sparkMatEmerald.diffuseColor = Color3.FromHexString('#34d399');
    const sparkMatCyan = new StandardMaterial('fw-mat-cyan', scene);
    sparkMatCyan.emissiveColor = Color3.FromHexString('#06b6d4');
    sparkMatCyan.diffuseColor = Color3.FromHexString('#38bdf8');
    const sparkMaterials = [sparkMatGold, sparkMatRuby, sparkMatEmerald, sparkMatCyan];

    const onFireworks = () => {
      fireworkLight.intensity = 3.6;
      const burstPoints = [
        new Vector3(0, 19, -12),
        new Vector3(-4.5, 23, -2),
        new Vector3(4.5, 22, 6),
      ];
      burstPoints.forEach((origin, bIdx) => {
        const mat = sparkMaterials[bIdx % sparkMaterials.length];
        for (let i = 0; i < 22; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const spd = 3.2 + Math.random() * 5.8;
          const vx = spd * Math.sin(phi) * Math.cos(theta);
          const vy = spd * Math.cos(phi) + 1.2;
          const vz = spd * Math.sin(phi) * Math.sin(theta);
          const spMesh = MeshBuilder.CreateSphere(`spark-${bIdx}-${i}-${performance.now()}`, { diameter: 0.16, segments: 6 }, scene);
          spMesh.position.copyFrom(origin);
          spMesh.material = mat;
          activeSparks.push({
            mesh: spMesh,
            velocity: new Vector3(vx, vy, vz),
            life: 1.6 + Math.random() * 0.7,
            maxLife: 2.3,
          });
        }
      });
    };
    canvas.addEventListener('cafe-fireworks', onFireworks);

    // Proximity greeting states for staff
    let playerNearBartender = false;
    let lastBartenderGreetTime = 0;
    let autoDoorProgress = 0; // 0 = closed, 1 = open

    // Render loop with multi-floor physics & navigation
    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
      totalTime += dt;

      // Gentle exterior-only winter snowfall. The deterministic paths avoid allocating particles every frame.
      winterSnowflakes.forEach(({ mesh, phase, baseX, baseY }) => {
        const fall = (totalTime * 0.55 + phase) % 7.8;
        mesh.position.y = baseY - fall;
        mesh.position.x = baseX + Math.sin(totalTime * 0.55 + phase) * 0.42;
        mesh.rotation.y += dt * 1.5;
        if (mesh.position.y < 0.16) mesh.position.y = baseY;
      });

      // NYC drifting clouds animation
      nycCloudRoots.forEach((cRoot) => {
        cRoot.position.x += dt * 0.75;
        if (cRoot.position.x > 180) cRoot.position.x = -180;
      });

      // NYC skyscraper beacon flashing
      const beaconPulse = 0.3 + 0.7 * Math.abs(Math.sin(totalTime * 3.0));
      beaconMat.emissiveColor = new Color3(beaconPulse, 0, 0);

      // Staff speaking acoustic halos (pulse dynamically when staff is speaking)
      const currentStaffSpeaker = staffVoice.getCurrentSpeaker();
      const staffIds: StaffId[] = ['concierge-minh-an', 'barista-thu-ha', 'host-bao-ngoc'];
      cafeStaff.forEach((s, idx) => {
        const isStaffSpeaking = staffIds[idx] === currentStaffSpeaker;
        if (s.speakingHalo) {
          s.speakingHalo.isVisible = isStaffSpeaking;
          if (isStaffSpeaking) {
            const pulse = 1 + Math.sin(totalTime * 8) * 0.18;
            s.speakingHalo.scaling.set(pulse, pulse, pulse);
          }
        }
      });

      // Staff patrol & walking animation
      // 1. Bartender Thu Hà behind the bar counter
      const thuHa = cafeStaff[1];
      const pX = propsRef.current.cameraMode === 'first' ? camera.position.x : me.root.position.x;
      const pY = propsRef.current.cameraMode === 'first' ? camera.position.y : me.root.position.y;
      const pZ = propsRef.current.cameraMode === 'first' ? camera.position.z : me.root.position.z;

      const thuHaCurX = thuHa.root.position.x;
      const thuHaCurZ = thuHa.root.position.z;
      const distToThuHa = Math.hypot(pX - thuHaCurX, pZ - thuHaCurZ);

      // Customer is right in front of the bar counter on Ground Floor (x: 2.8..8.2, z: 0.5..3.3)
      const isCustomerAtBar = pY < 2.0 && distToThuHa < 3.4 && pZ < 3.3 && pZ > 0.4 && pX > 2.8 && pX < 8.2;

      let thuHaX = 5.8;
      let thuHaFacing = Math.PI;
      let thuHaWalking = false;

      if (isCustomerAtBar) {
        // Customer approaches! Turn smoothly towards customer
        const targetAngle = Math.atan2(-(pX - thuHaCurX), -(pZ - thuHaCurZ));
        thuHaFacing = targetAngle;
        thuHaWalking = false;

        // Welcoming greeting posture: right arm raised friendly greeting wave
        thuHa.limbs[1].rotation.x = -1.15;
        thuHa.limbs[1].rotation.z = -0.35;
        thuHa.limbs[0].rotation.x = -0.30;
        thuHa.limbs[2].rotation.x = 0;
        thuHa.limbs[3].rotation.x = 0;

        if (!playerNearBartender && (Date.now() - lastBartenderGreetTime > 35_000)) {
          playerNearBartender = true;
          lastBartenderGreetTime = Date.now();
          propsRef.current.onBartenderProximity?.('barista-thu-ha');
        }
      } else {
        if (distToThuHa > 5.0) {
          playerNearBartender = false;
        }

        // Normal patrol cycle behind counter when no customer is at the counter
        const thuHaCycle = (totalTime * 0.35) % 16;
        if (thuHaCycle < 5) {
          const t = thuHaCycle / 5;
          thuHaX = 3.8 + t * (7.2 - 3.8);
          thuHaFacing = -Math.PI / 2;
          thuHaWalking = true;
        } else if (thuHaCycle < 8) {
          thuHaX = 7.2;
          thuHaFacing = Math.PI;
          thuHaWalking = false;
        } else if (thuHaCycle < 13) {
          const t = (thuHaCycle - 8) / 5;
          thuHaX = 7.2 - t * (7.2 - 3.8);
          thuHaFacing = Math.PI / 2;
          thuHaWalking = true;
        } else {
          thuHaX = 3.8;
          thuHaFacing = Math.PI;
          thuHaWalking = false;
        }
        thuHa.root.position.x = thuHaX;
        thuHa.limbs.forEach((limb, idx) => {
          limb.rotation.x = thuHaWalking ? Math.sin(totalTime * 8 + (idx % 2) * Math.PI) * 0.32 : 0;
          limb.rotation.z = 0;
        });
      }

      thuHa.root.position.z = 4.15;
      thuHa.root.rotation.y = thuHaFacing;

      // 2. Hostess Bảo Ngọc in Hearth corridor
      const baoNgoc = cafeStaff[2];
      const baoNgocCycle = (totalTime * 0.28 + 3) % 18;
      let baoNgocZ = -0.1;
      let baoNgocFacing = Math.PI / 2;
      let baoNgocWalking = false;
      if (baoNgocCycle < 6) {
        const t = baoNgocCycle / 6;
        baoNgocZ = -2.6 + t * (2.6 - (-2.6));
        baoNgocFacing = 0;
        baoNgocWalking = true;
      } else if (baoNgocCycle < 9) {
        baoNgocZ = 2.6;
        baoNgocFacing = -Math.PI / 2;
        baoNgocWalking = false;
      } else if (baoNgocCycle < 15) {
        const t = (baoNgocCycle - 9) / 6;
        baoNgocZ = 2.6 - t * (2.6 - (-2.6));
        baoNgocFacing = Math.PI;
        baoNgocWalking = true;
      } else {
        baoNgocZ = -2.6;
        baoNgocFacing = Math.PI / 2;
        baoNgocWalking = false;
      }
      baoNgoc.root.position.x = -6.9;
      baoNgoc.root.position.z = baoNgocZ;
      baoNgoc.root.rotation.y = baoNgocFacing;
      baoNgoc.limbs.forEach((limb, idx) => {
        limb.rotation.x = baoNgocWalking ? Math.sin(totalTime * 7 + (idx % 2) * Math.PI) * 0.30 : 0;
      });

      // 3. Concierge Minh An in Grand Foyer
      const minhAn = cafeStaff[0];
      const minhAnCycle = (totalTime * 0.25 + 7) % 20;
      let minhAnX = 12.1;
      let minhAnFacing = Math.PI;
      let minhAnWalking = false;
      if (minhAnCycle < 7) {
        const t = minhAnCycle / 7;
        minhAnX = 13.6 - t * (13.6 - 9.8);
        minhAnFacing = -Math.PI / 2;
        minhAnWalking = true;
      } else if (minhAnCycle < 10) {
        minhAnX = 9.8;
        minhAnFacing = Math.PI;
        minhAnWalking = false;
      } else if (minhAnCycle < 17) {
        const t = (minhAnCycle - 10) / 7;
        minhAnX = 9.8 + t * (13.6 - 9.8);
        minhAnFacing = Math.PI / 2;
        minhAnWalking = true;
      } else {
        minhAnX = 13.6;
        minhAnFacing = Math.PI;
        minhAnWalking = false;
      }
      minhAn.root.position.x = minhAnX;
      minhAn.root.position.z = -3.3;
      minhAn.root.rotation.y = minhAnFacing;
      minhAn.limbs.forEach((limb, idx) => {
        limb.rotation.x = minhAnWalking ? Math.sin(totalTime * 6.5 + (idx % 2) * Math.PI) * 0.28 : 0;
      });

      // Candle flickering
      candleFlames.forEach((flame, i) => {
        const flicker = Math.sin(totalTime * 12 + i * 2.1) * 0.15 + Math.cos(totalTime * 7 + i) * 0.1;
        flame.scaling.set(0.7 + flicker, 1.4 + flicker * 1.5, 0.7 + flicker);
      });

      // Hearth Hall Grand Fireplace dynamic flickering
      hearthFlames.forEach((flame, i) => {
        const flicker = Math.sin(totalTime * 14 + i * 1.8) * 0.16 + Math.cos(totalTime * 9 + i * 2.4) * 0.10;
        flame.scaling.set(0.85 + flicker, 1.6 + flicker * 2.0, 0.85 + flicker);
        flame.position.y = 0.65 + i * 0.04 + Math.sin(totalTime * 11 + i) * 0.03;
      });
      fireplaceLight.intensity = 1.42 + Math.sin(totalTime * 16) * 0.18 + Math.cos(totalTime * 23) * 0.10;
      fireplaceEmbers.forEach((ember, i) => {
        const lift = (totalTime * 0.58 + i * 0.21) % 1;
        ember.position.y = 0.46 + lift * 1.22;
        ember.position.x = -5.8 - 0.95 + (i % 7) * 0.31 + Math.sin(totalTime * 2 + i) * 0.045;
        ember.visibility = 0.82 - lift * 0.68;
      });

      // Proximity audio check: gentle fireplace crackles near Hearth Hall fireplace
      const distToFire = Math.hypot(position.x - (-5.8), position.z - 6.0);
      if (position.y < 1.6 && distToFire < 6.5 && !chillAudio.isPlaying('fire') && !chillAudio.isMuted()) {
        chillAudio.startFire();
      }

      // Steam wisps rising
      steamWisps.forEach((steam, i) => {
        const progress = ((totalTime * 0.35 + i * 0.28) % 1.0);
        steam.position.y = (TABLES[i]?.y ?? 0) + 1.02 + progress * 0.45;
        steam.scaling.set(0.6 + progress * 0.6, 1.2 + progress * 0.5, 0.6 + progress * 0.6);
      });

      // Automatic Sliding Glass Doors (Tự động mở khi lại gần, tự động đóng khi đi ra)
      const distToAutoDoor = Math.hypot(position.x, position.z - (-7.36));
      const isNearAutoDoor = distToAutoDoor < 4.2 && position.y < 1.8;
      const targetDoorOpen = isNearAutoDoor ? 1.0 : 0.0;
      autoDoorProgress += (targetDoorOpen - autoDoorProgress) * Math.min(1.0, dt * 3.8);
      const slideOffset = autoDoorProgress * 1.38;
      autoDoorLeft.position.x = -0.74 - slideOffset;
      autoDoorRight.position.x = 0.74 + slideOffset;
      autoSensorIndicator.material = isNearAutoDoor ? lampGlow : charcoal;

      // Vinyl record rotating
      vinylDisc.rotation.y += dt * 1.6;

      // Cat breathing gently
      catBody.scaling.y = 0.85 + Math.sin(totalTime * 2.2) * 0.04;

      // Dynamic screen update every 4.5s
      if (totalTime - lastQuoteChange > 4.5) {
        quoteIndex++;
        chartOffset++;
        lastQuoteChange = totalTime;
        updateTraderScreen();
      }

      // Handle seated player positions
      const selected = propsRef.current.seatedSeatId || null;
      const seat = selected ? seatPositions.get(selected) : undefined;
      if (seat && selected !== lastSeat) {
        position.x = seat.x;
        position.y = seat.y;
        position.z = seat.z;
        position.yaw = seat.facing;
      }
      lastSeat = selected;

      // Local player drink visual sync
      if (selected && propsRef.current.currentDrink) {
        renderDrinkOnTable(selected, propsRef.current.currentDrink);
      } else if (lastSeat && !selected) {
        removeDrinkFromTable(lastSeat);
      }

      // Multi-floor height calculation: West floating staircase (x: -8.6 to -6.4, z: -3.2 to 1.2)
      const inStaircase = position.x <= -6.4 && position.x >= -8.6 && position.z >= -3.2 && position.z <= 1.2;
      const onMezzanine = (position.z >= 1.2 && position.x >= -8.5 && position.x <= 8.5) ||
        (position.x >= -12.5 && position.x <= -8.5 && position.z >= 0.8 && position.z <= 4.2);

      let targetY = 0;
      if (seat) {
        targetY = seat.y;
      } else if (inStaircase) {
        const t = Math.max(0, Math.min(1, (position.z - (-3.2)) / (1.2 - (-3.2))));
        targetY = t * 3.2;
      } else if (position.y >= 5.0) {
        targetY = ROYAL_FLOOR_HEIGHTS.slice(2).reduce((closest, height) => Math.abs(position.y - height) < Math.abs(position.y - closest) ? height : closest, ROYAL_FLOOR_HEIGHTS[2]);
      } else if (onMezzanine && position.y >= 1.5) {
        targetY = 3.2;
      } else {
        targetY = 0;
      }
      position.y += (targetY - position.y) * 0.22;

      // Current floor reporting
      const currentFloorNum = ROYAL_FLOOR_HEIGHTS.reduce((closest, height, index) => Math.abs(position.y - height) < Math.abs(position.y - ROYAL_FLOOR_HEIGHTS[closest - 1]) ? index + 1 : closest, 1);
      if (currentFloorNum !== lastReportedFloor) {
        lastReportedFloor = currentFloorNum;
        propsRef.current.onFloorChange?.(currentFloorNum);
      }

      // Movement
      let forward = touch.forward + Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'));
      let right = touch.right + Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
      const length = Math.hypot(forward, right); if (length > 1) { forward /= length; right /= length; }

      // Auto stand-up on movement input (W, A, S, D, Arrow keys, or touch joystick)
      const hasMovement = Math.abs(forward) + Math.abs(right) > 0.05;
      if (selected && hasMovement) {
        propsRef.current.onLeaveSeat?.();
        lastSeat = null;
      }
      moving = (!selected || hasMovement) && (Math.abs(forward) + Math.abs(right) > 0.01);
      if (moving) {
        const isRunning = keys.has('shift');
        const speed = isRunning ? 4.2 : 2.6;
        const dx = (Math.sin(position.yaw) * forward + Math.cos(position.yaw) * right) * speed * dt;
        const dz = (Math.cos(position.yaw) * forward - Math.sin(position.yaw) * right) * speed * dt;

        const tryMove = (x: number, z: number) => {
          // Tầng 1 opens into the five-bay Grand Hotel Hall on the east side.
          if (x <= -22.4 || x >= 30.4 || z <= -33.4 || z >= 8.5) return false;
          // Balcony safety bound on upper royal floors (Floors 3–8)
          if (position.y >= 5.0) {
            const onBalcony = Math.abs(x) <= 4.1 && z >= -9.1 && z <= -5.9;
            const inRoom = x >= -9.9 && x <= 9.9 && z >= -5.9 && z <= 5.9;
            if (!onBalcony && !inRoom) return false;
          }
          // Mezzanine (Floor 2): room interior, staircase, and outdoor skyline balcony
          if (position.y >= 2.0 && position.y < 5.0) {
            const onF2Balcony = x >= -12.4 && x <= -8.6 && z >= 0.8 && z <= 4.2;
            const inMezRoom = z >= 1.15 && x >= -8.5 && x <= 8.5;
            const inMezStair = x <= -6.4 && x >= -8.6 && z >= -3.2 && z <= 1.2;
            if (!inMezRoom && !inMezStair && !onF2Balcony) return false;
          }
          // Ground floor wall collision at x = 9 (separating Hearth Hall and Grand Hall)
          if (position.y < 2.0) {
            const inDoorway = z >= -2.6 && z <= 2.6;
            if (!inDoorway) {
              const crossingFromLeft = position.x < 8.8 && x >= 8.8;
              const crossingFromRight = position.x > 9.2 && x <= 9.2;
              if (crossingFromLeft || crossingFromRight) return false;
            }
            // Front facade wall collision & Automatic Sliding Door passage at z = -7.36
            const crossingFrontThreshold = (position.z < -7.45 && z >= -7.45) || (position.z > -7.25 && z <= -7.25);
            if (crossingFrontThreshold) {
              const inDoorOpening = Math.abs(x) <= 1.35;
              if (!inDoorOpening && Math.abs(x) < 9.5) return false;
              if (inDoorOpening && autoDoorProgress < 0.20) return false;
            }
          }
          // Obstacle collision
          const isBlocked = collisionDiscs.some(disc => {
            const sameFloor = Math.abs(position.y - disc.y) < 1.5;
            return sameFloor && Math.hypot(x - disc.x, z - disc.z) < disc.r + 0.24;
          });
          return !isBlocked;
        };

        if (tryMove(position.x + dx, position.z)) position.x += dx;
        if (tryMove(position.x, position.z + dz)) position.z += dz;
        const stepRate = isRunning ? 12 : 7.6;
        walkingTime += dt * stepRate;
        chillAudio.playFootstep(position.z < -6.5 ? 'stone' : inStaircase ? 'stair' : 'wood', isRunning);
      }

      me.root.position.set(position.x, position.y + (seat ? -0.35 : 0), position.z);
      me.root.rotation.y = position.yaw;
      const isAvatarVisibleInPhoto = Boolean(
        propsRef.current.photoMode &&
        (propsRef.current.photoCameraPreset === 'selfie' ||
         (propsRef.current.photoCameraPreset && propsRef.current.photoCameraPreset !== 'current'))
      );
      me.root.setEnabled(propsRef.current.cameraMode !== 'first' || isAvatarVisibleInPhoto);
      const isMeSpeaking = Boolean(
        propsRef.current.speakingPlayerIds?.has('local') ||
        (propsRef.current.selfId && propsRef.current.speakingPlayerIds?.has(propsRef.current.selfId))
      );
      if (me.speakingHalo) {
        me.speakingHalo.isVisible = isMeSpeaking && (propsRef.current.cameraMode !== 'first' || isAvatarVisibleInPhoto);
        if (isMeSpeaking) {
          const pulse = 1 + Math.sin(totalTime * 8) * 0.18;
          me.speakingHalo.scaling.set(pulse, pulse, pulse);
        }
      }
      if (me.zenHalo) {
        const isZen = Boolean(propsRef.current.massageActive);
        me.zenHalo.isVisible = isZen && (propsRef.current.cameraMode !== 'first' || isAvatarVisibleInPhoto);
        if (isZen) {
          me.zenHalo.rotation.y += dt * 1.8;
          const pulse = 1 + Math.sin(totalTime * 4) * 0.14;
          me.zenHalo.scaling.set(pulse, pulse, pulse);
        }
      }
      me.limbs.forEach((limb, index) => {
        limb.rotation.x = moving ? Math.sin(walkingTime + (index % 2) * Math.PI) * 0.35 : 0;
      });

      // Meticulous head bobbing and walking sway in POV mode (supports Reduced Motion mode)
      const isWalkingPOV = moving && propsRef.current.cameraMode === 'first' && !propsRef.current.reducedMotion;
      const bobY = isWalkingPOV ? Math.sin(walkingTime * 2) * (keys.has('shift') ? 0.045 : 0.024) : 0;
      const swayX = isWalkingPOV ? Math.cos(walkingTime) * 0.015 : 0;
      const eye = (seat ? seatedEyeHeight : standingEyeHeight) + position.y + bobY;

      const look = new Vector3(
        Math.sin(position.yaw) * Math.cos(position.pitch),
        -Math.sin(position.pitch),
        Math.cos(position.yaw) * Math.cos(position.pitch)
      );

      // Camera positioning: Photo Mode vs Regular View
      if (propsRef.current.photoMode) {
        if (propsRef.current.photoFov) {
          camera.fov = propsRef.current.photoFov;
        }
        const preset = propsRef.current.photoCameraPreset;
        if (preset === 'selfie') {
          // Portrait 45-degree angle around player avatar
          camera.position.set(position.x + 1.8, position.y + 1.55, position.z - 2.1);
          camera.setTarget(new Vector3(position.x, position.y + 1.35, position.z));
        } else if (preset && PHOTO_PRESETS[preset]) {
          const config = PHOTO_PRESETS[preset]!;
          camera.position.set(config.pos.x, config.pos.y, config.pos.z);
          camera.setTarget(config.target);
        } else if (propsRef.current.cameraMode === 'first') {
          camera.position.set(position.x + swayX, eye, position.z);
          camera.setTarget(camera.position.add(look));
        } else {
          const targetDist = 4.15;
          let camX = position.x - look.x * targetDist;
          let camY = eye + 1.25;
          let camZ = position.z - look.z * targetDist;
          const inGrandHall = position.x > 8.8;
          const minX = -11.45, maxX = inGrandHall ? 28.5 : 11.45;
          const minZ = inGrandHall ? -8.5 : -33.15, maxZ = inGrandHall ? 8.5 : 6.35;
          const minY = position.y + 1.35;
          const maxY = position.y + 6.45;
          camX = Math.max(minX, Math.min(maxX, camX));
          camZ = Math.max(minZ, Math.min(maxZ, camZ));
          camY = Math.max(minY, Math.min(maxY, camY));
          camera.position.set(camX, camY, camZ);
          camera.setTarget(new Vector3(position.x + look.x * 0.5, eye - 0.22 - Math.sin(position.pitch), position.z + look.z * 0.5));
        }
      } else {
        camera.fov = 1.10;
        if (propsRef.current.cameraMode === 'first') {
          camera.position.set(position.x + swayX, eye, position.z);
          camera.setTarget(camera.position.add(look));
        } else {
          // Camera Wall & Floor Collision Avoidance (anti-wall-clipping)
          const targetDist = 4.15;
          let camX = position.x - look.x * targetDist;
          let camY = eye + 1.25;
          let camZ = position.z - look.z * targetDist;

          // Bounded within interior café room volume or Grand Hall
          const inGrandHall = position.x > 8.8;
          const minX = -11.45, maxX = inGrandHall ? 28.5 : 11.45;
          const minZ = inGrandHall ? -8.5 : -33.15, maxZ = inGrandHall ? 8.5 : 6.35;
          const minY = position.y + 1.35;
          const maxY = position.y + 6.45;

          camX = Math.max(minX, Math.min(maxX, camX));
          camZ = Math.max(minZ, Math.min(maxZ, camZ));
          camY = Math.max(minY, Math.min(maxY, camY));

          camera.position.set(camX, camY, camZ);
          camera.setTarget(new Vector3(position.x + look.x * 0.5, eye - 0.22 - Math.sin(position.pitch), position.z + look.z * 0.5));
        }
      }

      // Photo Mode Snapshot Capture
      if (propsRef.current.captureTrigger && propsRef.current.captureTrigger.nonce !== lastCaptureNonce) {
        lastCaptureNonce = propsRef.current.captureTrigger.nonce;
        try {
          const width = Math.max(1280, canvas.width || 1280);
          const height = Math.max(720, canvas.height || 720);
          Tools.CreateScreenshotUsingRenderTarget(
            engine,
            camera,
            { width, height },
            (dataUrl) => {
              propsRef.current.onPhotoCaptured?.(dataUrl);
            },
            'image/png',
            2,
            true
          );
        } catch (err) {
          console.error('Photo snapshot creation failed:', err);
        }
      }

      // T08 Early Performance Measurement (1s interval)
      if (totalTime - lastStatsTime > 0.8) {
        lastStatsTime = totalTime;
        const frameTime = engine.getDeltaTime();
        propsRef.current.onStatsUpdate?.({
          fps: Math.round(engine.getFps()),
          frameTime: Math.round(frameTime * 10) / 10,
          meshes: scene.meshes.length,
        });
      }

      const timestamp = performance.now();
      const changed = Math.abs(position.x - lastReported.x) > 0.005 ||
        Math.abs(position.y - lastReported.y) > 0.01 ||
        Math.abs(position.z - lastReported.z) > 0.005 ||
        Math.abs(position.yaw - lastReported.rotation) > 0.005;

      if (timestamp - lastSent > 100 && changed) {
        propsRef.current.onMove?.({ x: position.x, y: position.y, z: position.z, rotation: position.yaw });
        lastReported = { x: position.x, y: position.y, z: position.z, rotation: position.yaw };
        lastSent = timestamp;
      }

      // Sync Remote players & multi-floor coordinates
      const active = new Set<string>();
      (propsRef.current.remotePlayers || []).forEach(player => {
        active.add(player.id);
        let other = remotes.get(player.id);
        if (!other) {
          other = character(`remote-${player.id}`, player.color, player.name);
          remotes.set(player.id, other);
        }
        const py = player.y ?? 0;
        other.root.position.set(player.x, py + (player.seatId ? -0.35 : 0), player.z);
        other.root.rotation.y = player.rotation;

        if (player.seatId && player.drink) {
          renderDrinkOnTable(player.seatId, player.drink);
        } else if (player.seatId && !player.drink) {
          removeDrinkFromTable(player.seatId);
        }

        const isSpeaking = Boolean(propsRef.current.speakingPlayerIds?.has(player.id));
        if (other.speakingHalo) {
          other.speakingHalo.isVisible = isSpeaking;
          if (isSpeaking) {
            const pulse = 1 + Math.sin(totalTime * 8) * 0.18;
            other.speakingHalo.scaling.set(pulse, pulse, pulse);
          }
        }
      });

      remotes.forEach((other, id) => {
        if (!active.has(id)) {
          other.root.getChildMeshes().forEach(mesh => mesh.dispose(false, true));
          other.root.dispose();
          remotes.delete(id);
        }
      });

      // Floating Emotes in 3D (supporting multi-floor height)
      const currentEmotes = propsRef.current.activeEmotes || [];
      const emoteIds = new Set(currentEmotes.map(e => e.id));
      currentEmotes.forEach(item => {
        let entry = floatingEmoteMeshes.get(item.id);
        const baseEy = (item.y ?? 0) + 2.2;
        if (!entry) {
          const tex = new DynamicTexture(`emote-tex-${item.id}`, { width: 128, height: 128 }, scene, true);
          const eCtx = tex.getContext() as unknown as CanvasRenderingContext2D;
          eCtx.font = '76px sans-serif';
          eCtx.textAlign = 'center';
          eCtx.textBaseline = 'middle';
          eCtx.fillText(item.emoji, 64, 68);
          tex.update();

          const mat = new StandardMaterial(`emote-mat-${item.id}`, scene);
          mat.diffuseTexture = tex;
          mat.emissiveColor = Color3.White();
          mat.backFaceCulling = false;
          mat.useAlphaFromDiffuseTexture = true;

          const plane = MeshBuilder.CreatePlane(`emote-mesh-${item.id}`, { width: 0.75, height: 0.75 }, scene);
          plane.position.set(item.x, baseEy, item.z);
          plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
          plane.material = mat;
          entry = { plane, startY: baseEy, startTime: performance.now() };
          floatingEmoteMeshes.set(item.id, entry);
        }
        const age = (performance.now() - entry.startTime) / 1000;
        entry.plane.position.y = entry.startY + age * 0.45;
        (entry.plane.material as StandardMaterial).alpha = Math.max(0, 1 - age / 2.5);
      });
      floatingEmoteMeshes.forEach((entry, id) => {
        if (!emoteIds.has(id)) {
          entry.plane.dispose();
          floatingEmoteMeshes.delete(id);
        }
      });

      // 3D Firework sparks & light flash decay
      if (fireworkLight.intensity > 0) {
        fireworkLight.intensity = Math.max(0, fireworkLight.intensity - dt * 1.6);
      }
      for (let i = activeSparks.length - 1; i >= 0; i--) {
        const s = activeSparks[i];
        s.mesh.position.addInPlace(s.velocity.scale(dt));
        s.velocity.y -= 4.2 * dt; // gravity
        s.velocity.scaleInPlace(0.985); // air drag
        s.life -= dt;
        const ratio = Math.max(0, s.life / s.maxLife);
        s.mesh.scaling.setAll(ratio);
        if (s.life <= 0) {
          s.mesh.dispose();
          activeSparks.splice(i, 1);
        }
      }
    });

    engine.runRenderLoop(() => scene.render());

    return () => {
      window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp); canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('cafe-direction', onTouchDirection);
      canvas.removeEventListener('cafe-teleport-pov', onTeleportPOV);
      canvas.removeEventListener('cafe-teleport-floor', onTeleportFloor);
      canvas.removeEventListener('cafe-fireworks', onFireworks);
      activeSparks.forEach(s => s.mesh.dispose());
      fireworkLight.dispose();
      window.removeEventListener('resize', onResize);
      engine.stopRenderLoop(); scene.dispose(); engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (props.targetPOV) {
      canvasRef.current?.dispatchEvent(new CustomEvent('cafe-teleport-pov', { detail: props.targetPOV }));
    }
  }, [props.targetPOV]);

  useEffect(() => {
    if (props.floorJump) {
      canvasRef.current?.dispatchEvent(new CustomEvent('cafe-teleport-floor', { detail: props.floorJump.floor }));
    }
  }, [props.floorJump?.nonce]);

  useEffect(() => {
    if (props.fireworksNonce) {
      canvasRef.current?.dispatchEvent(new CustomEvent('cafe-fireworks'));
    }
  }, [props.fireworksNonce]);

  const sendDirection = (forward: number, right: number) => canvasRef.current?.dispatchEvent(new CustomEvent('cafe-direction', { detail: { forward, right } }));

  return (
    <div className="cafe-scene">
      <canvas ref={canvasRef} className="cafe-scene__canvas" aria-label="Không gian quán cà phê 3D nhiều tầng. Dùng phím W A S D hoặc phím mũi tên để di chuyển, kéo chuột để nhìn quanh." tabIndex={0} />
      <div className="cafe-scene__touch" aria-label="Điều khiển di chuyển">
        <button type="button" aria-label="Đi tiến" onPointerDown={() => sendDirection(1, 0)} onPointerUp={() => sendDirection(0, 0)} onPointerCancel={() => sendDirection(0, 0)}>▲</button>
        <div>
          <button type="button" aria-label="Đi sang trái" onPointerDown={() => sendDirection(0, -1)} onPointerUp={() => sendDirection(0, 0)} onPointerCancel={() => sendDirection(0, 0)}>◀</button>
          <button type="button" aria-label="Đi lùi" onPointerDown={() => sendDirection(-1, 0)} onPointerUp={() => sendDirection(0, 0)} onPointerCancel={() => sendDirection(0, 0)}>▼</button>
          <button type="button" aria-label="Đi sang phải" onPointerDown={() => sendDirection(0, 1)} onPointerUp={() => sendDirection(0, 0)} onPointerCancel={() => sendDirection(0, 0)}>▶</button>
        </div>
      </div>
    </div>
  );
}
