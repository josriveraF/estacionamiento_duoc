/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ParkingSpace, TimeOfDay, Car } from '../types';
import { 
  createCarMesh, 
  createTreeMesh, 
  createLampPost, 
  createSportsField, 
  createWarehouse, 
  createChargingStation 
} from '../utils/threeHelpers';
import { Compass, Rotate3d, Sun, Moon, Sunrise, Eye } from 'lucide-react';

interface Parking3DProps {
  spaces: ParkingSpace[];
  timeOfDay: TimeOfDay;
  onSelectSpace: (space: ParkingSpace) => void;
  selectedSpaceId: string | null;
}

interface ParkingAnimation {
  id: string; // Space ID
  carMesh: THREE.Group;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  startRot: number;
  endRot: number;
  progress: number; // 0 to 1
  duration: number; // ms
  startedAt: number; // timestamp
}

export default function Parking3D({ spaces, timeOfDay, onSelectSpace, selectedSpaceId }: Parking3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Three.js References
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const carsGroupRef = useRef<THREE.Group | null>(null);
  const staticEnvGroupRef = useRef<THREE.Group | null>(null);
  const selectedRingRef = useRef<THREE.LineLoop | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);

  // Animation References
  const animationsRef = useRef<ParkingAnimation[]>([]);
  const requestRef = useRef<number | null>(null);
  const previousCarsRef = useRef<Record<string, string>>({}); // { spaceId: carId }

  // Hover/Interactive selection states (WebGL raycaster)
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const planeClickRef = useRef<THREE.Mesh | null>(null);

  // Clickable bounding boxes mapping meshes back to parking spaces
  const spaceMeshesMapRef = useRef<Record<string, THREE.Mesh>>({});

  // 3D HUD stats
  const [hudMsg, setHudMsg] = useState<string>('Vista 3D inicializada. Usa el Ratón para Rotar (Click Izq), Panear (Click Der/Ctrl) y Zoom (Rueda).');

  // --- INITIALIZE THREE.JS ---
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 32, 38); // High angled overview
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1; // Don't allow camera to go below ground level
    controls.minDistance = 10;
    controls.maxDistance = 120;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Parent Mesh Groups
    const staticGroup = new THREE.Group();
    staticGroup.name = 'staticEnvironment';
    scene.add(staticGroup);
    staticEnvGroupRef.current = staticGroup;

    const carsGroup = new THREE.Group();
    carsGroup.name = 'carsGroup';
    scene.add(carsGroup);
    carsGroupRef.current = carsGroup;

    const lightsGroup = new THREE.Group();
    lightsGroup.name = 'lightsGroup';
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // Create selection ring (glowing circle that surrounds the selected spot)
    const ringGeo = new THREE.RingGeometry(1.6, 1.8, 16);
    ringGeo.rotateX(-Math.PI / 2); // lie flat
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.name = 'selectionRing';
    ringMesh.position.y = 0.1;
    ringMesh.visible = false;
    scene.add(ringMesh);
    // Cast it down to raw LineLoop or just keep it as ring mesh
    selectedRingRef.current = ringMesh as any;

    // --- RECREATE STATIC ENVIRONMENT (ONCE) ---
    buildEnvironment(staticGroup, scene);

    // --- WINDOW RESIZE HANDLING WITH RESIZEOBSERVER ---
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: entryW, height: entryH } = entries[0].contentRect;
      if (rendererRef.current && cameraRef.current) {
        cameraRef.current.aspect = entryW / entryH;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(entryW, entryH);
      }
    });
    resizeObserver.observe(containerRef.current);

    // --- MOUSE CLICK INTERACTION FOR SPACES ---
    const onCanvasClick = (event: MouseEvent) => {
      if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;

      // Calculate mouse position in normalized device coordinates (-1 to +1)
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);

      // Find which space mesh was clicked
      const clickables = Object.values(spaceMeshesMapRef.current);
      const intersects = raycaster.current.intersectObjects(clickables);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        // Lookup the space ID
        const matchedSpaceId = Object.keys(spaceMeshesMapRef.current).find(
          key => spaceMeshesMapRef.current[key] === clickedMesh
        );
        if (matchedSpaceId) {
          const space = spaces.find(s => s.id === matchedSpaceId);
          if (space) {
            onSelectSpace(space);
            setHudMsg(`Espacio seleccionado: ${space.id} (${space.type.toUpperCase()}) - ${space.status.toUpperCase()}`);
          }
        }
      }
    };
    canvasRef.current.addEventListener('click', onCanvasClick);

    // --- ANIMATION RENDER LOOP ---
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      // Update Controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Update Active Animations
      const activeAnims = animationsRef.current;
      const currentTime = Date.now();
      
      for (let i = activeAnims.length - 1; i >= 0; i--) {
        const anim = activeAnims[i];
        const elapsed = currentTime - anim.startedAt;
        const progress = Math.min(elapsed / anim.duration, 1.0);
        
        // Quad ease out formula
        const easeProgress = progress * (2 - progress);

        // Interpolate position
        anim.carMesh.position.lerpVectors(anim.startPos, anim.endPos, easeProgress);
        
        // Interpolate rotation
        const currentRot = THREE.MathUtils.lerp(anim.startRot, anim.endRot, easeProgress);
        anim.carMesh.rotation.y = currentRot;

        if (progress >= 1.0) {
          // Animation finished, snap to final
          anim.carMesh.position.copy(anim.endPos);
          anim.carMesh.rotation.y = anim.endRot;
          // Enable shadow maps fully
          anim.carMesh.traverse(n => {
            if (n instanceof THREE.Mesh) n.castShadow = true;
          });
          // Remove from anim queue
          activeAnims.splice(i, 1);
        }
      }

      // Render Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // CLEANUP ON UNMOUNT
    return () => {
      resizeObserver.disconnect();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (canvasRef.current) canvasRef.current.removeEventListener('click', onCanvasClick);

      // Recursive disposal of three.js components to prevent GPU memory leaks
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          if (node.geometry) node.geometry.dispose();
          if (Array.isArray(node.material)) {
            node.material.forEach((mat) => mat.dispose());
          } else if (node.material) {
            node.material.dispose();
          }
        }
      });
      
      if (rendererRef.current) rendererRef.current.dispose();
      if (controlsRef.current) controlsRef.current.dispose();
    };
  }, []);

  // --- REBUILD ENVIRONMENT FUNCTION ---
  const buildEnvironment = (staticGroup: THREE.Group, scene: THREE.Scene) => {
    // 1. Asphalt Ground Plane
    const groundGeo = new THREE.PlaneGeometry(100, 75);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2c2c2c,
      roughness: 0.85,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    staticGroup.add(ground);

    // Gravel/sand pathways surrounding parking (like second image)
    const gravelPanelGeo = new THREE.PlaneGeometry(80, 50);
    const gravelPanelMat = new THREE.MeshStandardMaterial({
      color: 0xc1bdb3, // gravel dust color matching second image
      roughness: 0.95,
    });
    const gravel = new THREE.Mesh(gravelPanelGeo, gravelPanelMat);
    gravel.rotation.x = -Math.PI / 2;
    gravel.position.y = 0.01; // slightly above ground
    gravel.receiveShadow = true;
    staticGroup.add(gravel);

    // Grass border at the bottom
    const lawnGeo = new THREE.BoxGeometry(80, 0.2, 8);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x558b2f, // darker grass green
      roughness: 0.9,
    });
    const bottomLawn = new THREE.Mesh(lawnGeo, lawnMat);
    bottomLawn.position.set(0, 0.05, 17.0);
    bottomLawn.receiveShadow = true;
    staticGroup.add(bottomLawn);

    // 2. Add Trees on the grass border (Bottom background)
    const treePointsX = [-24, -16, -5, 10, 22];
    treePointsX.forEach((x) => {
      const tree = createTreeMesh();
      tree.position.set(x, 0.1, 17.0);
      staticGroup.add(tree);
    });

    // 3. Add Left Background Features: Soccer Field (Cancha de Fútbol)
    const soccerField = createSportsField();
    soccerField.position.set(-18.5, 0.1, -21.0);
    staticGroup.add(soccerField);

    // 4. Add Right Background Features: Warehouse Building (Bodega Industrial)
    const warehouse = createWarehouse();
    warehouse.position.set(13.5, 0.1, -21.0);
    staticGroup.add(warehouse);

    // 5. Add Lamp Posts at intermediate coordinates (4 lamp posts)
    // Create static references to lamp posts so we can toggle lights later
    const lampCoords = [
      { x: -14, z: 8.0 },
      { x: 14, z: 8.0 },
      { x: -14, z: -8.0 },
      { x: 14, z: -8.0 },
    ];
    
    // We'll spawn these dynamically based on timeOfDay, so let's exclude spotlight components from static group
    // and instead build posts with or without lights inside the main scene update cycle below.
  };

  // --- REACT TO TIME-OF-DAY AND SPACES DATA CHANGES ---
  useEffect(() => {
    const scene = sceneRef.current;
    const carsGroup = carsGroupRef.current;
    const lightsGroup = lightsGroupRef.current;
    const staticGroup = staticEnvGroupRef.current;
    
    if (!scene || !carsGroup || !lightsGroup || !staticGroup) return;

    // --- 1. LIGHTING AND SHADOW UPDATES (Time of Day configuration) ---
    // Clear old lights
    while (lightsGroup.children.length > 0) {
      const light = lightsGroup.children[0];
      lightsGroup.remove(light);
    }

    let bgColor = 0xbadbfb; // daytime sky
    let dirLightColor = 0xffffff;
    let dirLightInt = 1.35;
    let ambLightColor = 0xb0bec5;
    let ambLightInt = 0.55;
    let fogDensity = 0.001;
    let dirLightY = 28;
    const isNightVal = timeOfDay === 'night';

    if (timeOfDay === 'day') {
      bgColor = 0xa9d2ff;
      dirLightColor = 0xffffff;
      dirLightInt = 1.4;
      ambLightColor = 0xdbe5ed;
      ambLightInt = 0.6;
    } else if (timeOfDay === 'sunset') {
      bgColor = 0xfc824c; // sunset golden hour atmosphere
      dirLightColor = 0xffaa55;
      dirLightInt = 1.6;
      ambLightColor = 0x5d315c; // deep purple ambient glow
      ambLightInt = 0.5;
      dirLightY = 12; // lower light source
    } else if (timeOfDay === 'night') {
      bgColor = 0x050811; // deep midnight blue
      dirLightColor = 0x7a93f5;
      dirLightInt = 0.15; // faint bluish moonlight
      ambLightColor = 0x080f26;
      ambLightInt = 0.25;
    }

    // Set background clear color
    if (rendererRef.current) {
      rendererRef.current.setClearColor(bgColor, 1);
    }
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, fogDensity);

    // Base hemisphere celestial light
    const hemiLight = new THREE.HemisphereLight(bgColor, 0x223322, ambLightInt);
    lightsGroup.add(hemiLight);

    // Directional celestial light (Sun/Moon)
    const dirLight = new THREE.DirectionalLight(dirLightColor, dirLightInt);
    dirLight.position.set(22, dirLightY, 22);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 130;
    // Fit camera view bounds
    const d = 40;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    lightsGroup.add(dirLight);

    // --- RE-RENDER DYNAMIC LAMP POST SPOTLIGHTS ON TIMEOFDAY ---
    // Remove old lamp structures from staticGroup if they exist
    const oldLampPosts = staticGroup.children.filter(c => c.name === 'lamppost');
    oldLampPosts.forEach(lp => staticGroup.remove(lp));

    const lampCoords = [
      { x: -14, z: 8.0 },
      { x: 14, z: 8.0 },
      { x: -14, z: -8.0 },
      { x: 14, z: -8.0 },
    ];
    lampCoords.forEach(pos => {
      const lamppost = createLampPost(isNightVal);
      lamppost.position.set(pos.x, 0.1, pos.z);
      staticGroup.add(lamppost);
    });

    // --- 2. PARKED CARS STATE RECONCILIATION AND SMOOTH ANIMATIONS ---
    // We want to keep meshes in carsGroup persistent and trigger sliding entry animations
    // for vehicles that are newly added.

    // Index existing child meshes by spaceId to avoid tearing down everything
    const currentMeshMap: Record<string, THREE.Group> = {};
    const objectsToDispose: THREE.Object3D[] = [];
    
    // Scan modern meshes in group
    for (let i = carsGroup.children.length - 1; i >= 0; i--) {
      const child = carsGroup.children[i];
      const spaceIdAttr = child.userData?.spaceId;
      if (spaceIdAttr) {
        currentMeshMap[spaceIdAttr] = child as THREE.Group;
      }
    }

    // Capture previous car inventory
    const prevCars = previousCarsRef.current;
    const nextCarsList: Record<string, string> = {};

    // Clear raycaster bounding boxes maps
    spaceMeshesMapRef.current = {};

    spaces.forEach((space) => {
      const spaceAndAngleRad = (space.angle * Math.PI) / 180;
      
      // A. Create/Draw the invisible clickable bounding box plate for parking slot selection
      const isSelected = selectedSpaceId === space.id;
      const plateWidth = space.type === 'disabled' ? 3.3 : 2.8;
      const plateDepth = 5.0;
      
      const plateGeo = new THREE.BoxGeometry(plateWidth, 0.12, plateDepth);
      let plateColor = 0xffffff;
      if (space.type === 'disabled') plateColor = 0x2196f3;
      else if (space.type === 'ev') plateColor = 0x4caf50;
      else if (space.type === 'reserved') plateColor = 0xffc107;

      const plateMat = new THREE.MeshStandardMaterial({
        color: plateColor,
        transparent: true,
        opacity: isSelected ? 0.35 : (space.status === 'occupied' ? 0.02 : 0.12),
        roughness: 0.9,
      });

      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateMesh.position.set(space.x, 0.02, space.z);
      plateMesh.rotation.y = spaceAndAngleRad;
      plateMesh.receiveShadow = true;
      // Store in register so mouse clicks hit it
      spaceMeshesMapRef.current[space.id] = plateMesh;
      
      // Clear old plate for this space ID if it exists in the cars group
      const existingPlate = carsGroup.children.find(c => c.name === `plate-${space.id}`);
      if (existingPlate) {
        carsGroup.remove(existingPlate);
        objectsToDispose.push(existingPlate);
      }
      
      plateMesh.name = `plate-${space.id}`;
      carsGroup.add(plateMesh);

      // Draw EV charger mesh on EV charging space!
      if (space.type === 'ev') {
        const chargingMeshName = `charger-${space.id}`;
        let chargerMesh = staticGroup.children.find(c => c.name === chargingMeshName);
        if (!chargerMesh) {
          chargerMesh = createChargingStation();
          chargerMesh.name = chargingMeshName;
          // Position charger at the back of the spot
          // Calculate polar vector for offset
          const backOffsetX = Math.sin(spaceAndAngleRad) * -2.4;
          const backOffsetZ = Math.cos(spaceAndAngleRad) * -2.4;
          chargerMesh.position.set(space.x + backOffsetX, 0.1, space.z + backOffsetZ);
          chargerMesh.rotation.y = spaceAndAngleRad;
          staticGroup.add(chargerMesh);
        }
      }

      // B. Manage Car Meshes
      if (space.status === 'occupied' && space.occupiedBy) {
        const car = space.occupiedBy;
        nextCarsList[space.id] = car.id;

        const targetX = space.x;
        const targetZ = space.z;
        const targetRot = spaceAndAngleRad;

        // If the car exists and is identical, update position and lightning and skip recreation
        const existingCarMesh = currentMeshMap[space.id];
        const isSameCar = existingCarMesh?.userData?.carId === car.id;

        if (existingCarMesh && isSameCar) {
          // Keep it but update lights depending on daytime
          // In case timeOfDay changed, we may want to recreate forward night glow headlights
          const needsGlowRecreation = existingCarMesh.userData?.glowIsNight !== isNightVal;
          if (needsGlowRecreation) {
            carsGroup.remove(existingCarMesh);
            objectsToDispose.push(existingCarMesh);
            
            const newCarMesh = createCarMesh(car.type, car.color, isNightVal);
            newCarMesh.position.set(targetX, 0, targetZ);
            newCarMesh.rotation.y = targetRot;
            newCarMesh.userData = { spaceId: space.id, carId: car.id, glowIsNight: isNightVal };
            carsGroup.add(newCarMesh);
            currentMeshMap[space.id] = newCarMesh;
          } else {
            // All fine, just anchor
            existingCarMesh.position.set(targetX, 0, targetZ);
            existingCarMesh.rotation.y = targetRot;
          }
        } else {
          // If a new car replaced an old car or parked in an available space
          if (existingCarMesh) {
            carsGroup.remove(existingCarMesh);
            objectsToDispose.push(existingCarMesh);
          }

          // Generate New Car Mesh
          const carMesh = createCarMesh(car.type, car.color, isNightVal);
          carMesh.userData = { spaceId: space.id, carId: car.id, glowIsNight: isNightVal };

          // Determine if we should trigger smooth drive-in animation!
          // We trigger it if this car wasn't parked here previously (it is newly spawned)
          const isBrandNew = !prevCars[space.id] || prevCars[space.id] !== car.id;

          if (isBrandNew) {
            // Smoothly drive-in from road entrance!
            // Entrance is at X = 25, Z = 15 (bottom-right edge of driveway)
            const entranceX = 25.0;
            const entranceZ = 15.0;
            carMesh.position.set(entranceX, 0, entranceZ);
            // Angle facing towards spot loosely
            const dx = targetX - entranceX;
            const dz = targetZ - entranceZ;
            const entranceAngle = Math.atan2(dx, dz);
            carMesh.rotation.y = entranceAngle;

            carsGroup.add(carMesh);

            // Register animation parameter
            animationsRef.current.push({
              id: space.id,
              carMesh,
              startPos: new THREE.Vector3(entranceX, 0, entranceZ),
              endPos: new THREE.Vector3(targetX, 0, targetZ),
              startRot: entranceAngle,
              endRot: targetRot,
              progress: 0,
              duration: 2000, // 2 seconds travel
              startedAt: Date.now()
            });

            // Set HUD log
            setHudMsg(`¡Vehículo entrando! ${car.brandModel} (${car.licensePlate}) dirigiéndose a ${space.id}...`);
          } else {
            // Already present, just place it immediately
            carMesh.position.set(targetX, 0, targetZ);
            carMesh.rotation.y = targetRot;
            carsGroup.add(carMesh);
          }
        }
      } else {
        // Space empty, remove any parked car mesh
        const existingCarMesh = currentMeshMap[space.id];
        if (existingCarMesh) {
          carsGroup.remove(existingCarMesh);
          objectsToDispose.push(existingCarMesh);
          
          // Clear animation track if any
          animationsRef.current = animationsRef.current.filter(a => a.id !== space.id);
        }
      }
    });

    // GC old removed structures
    objectsToDispose.forEach((obj) => {
      obj.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          if (node.geometry) node.geometry.dispose();
          if (node.material) {
            if (Array.isArray(node.material)) node.material.forEach(m => m.dispose());
            else node.material.dispose();
          }
        }
      });
    });

    // Store current state for future comparisions
    previousCarsRef.current = nextCarsList;

  }, [spaces, timeOfDay]);

  // --- REACT TO SELECTED SPACE TO MOVE GLOW RING ---
  useEffect(() => {
    const ring = selectedRingRef.current;
    if (!ring) return;

    if (selectedSpaceId) {
      const space = spaces.find(s => s.id === selectedSpaceId);
      if (space) {
        ring.position.set(space.x, 0.1, space.z);
        ring.rotation.y = (space.angle * Math.PI) / 180;
        ring.visible = true;
        return;
      }
    }
    ring.visible = false;
  }, [selectedSpaceId, spaces]);

  // View controllers
  const triggerTopView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 48, 1);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      setHudMsg('Vista ajustada: Dirección Cenital (Desde arriba).');
    }
  };

  const triggerAngledView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 32, 38);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      setHudMsg('Vista ajustada: Ángulo Perspectivo (Por defecto).');
    }
  };

  const triggerCloseView = () => {
    if (cameraRef.current && controlsRef.current) {
      if (selectedSpaceId) {
        const space = spaces.find(s => s.id === selectedSpaceId);
        if (space) {
          cameraRef.current.position.set(space.x, 6, space.z + 10);
          controlsRef.current.target.set(space.x, 0, space.z);
          controlsRef.current.update();
          setHudMsg(`Vista enfocada en el espacio ${space.id}.`);
          return;
        }
      }
      cameraRef.current.position.set(-14, 8, 12);
      controlsRef.current.target.set(-14, 0, 8);
      controlsRef.current.update();
      setHudMsg('Perspectiva enfocada en fila de entrada A.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl relative text-white">
      {/* 3D Canvas Header overlay */}
      <div className="absolute top-0 inset-x-0 bg-slate-950/80 backdrop-blur-md px-6 py-4 border-b border-white/5 flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
            <h3 className="text-base font-semibold text-white">Visualizador Tridimensional 3D (Three.js)</h3>
          </div>
          <p className="text-xs text-slate-400">Renderizado de malla procedural en tiempo real. Inspirado en el entorno de la imagen.</p>
        </div>
        
        {/* Cam controls */}
        <div className="flex gap-2">
          <button
            onClick={triggerAngledView}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            title="Vista de Perspectiva Isométrica"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Perspectiva</span>
          </button>
          <button
            onClick={triggerTopView}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            title="Vista Superior de Planta"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cenital</span>
          </button>
          <button
            onClick={triggerCloseView}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            title="Foco de Detalle"
          >
            <Rotate3d className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">{selectedSpaceId ? 'Enfocar Spot' : 'Foco Fila A'}</span>
          </button>
        </div>
      </div>

      {/* WebGL Canvas */}
      <div className="flex-1 relative w-full h-full min-h-[460px]">
        <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing outline-none" />
        
        {/* Space Indicators indicators inside the canvas corners */}
        <div className="absolute bottom-5 left-5 right-5 pointer-events-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-xl border border-white/5 z-10 transition-all">
          <span className="text-xs text-slate-300 font-medium">💡 {hudMsg}</span>
          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono self-end sm:self-auto">
            <span className="flex items-center gap-1">🔆 Orbit: Click Izq</span>
            <span className="flex items-center gap-1">🤚 Pan: Click Der</span>
            <span className="flex items-center gap-1">🔍 Magnify: Scroll</span>
          </div>
        </div>
      </div>
    </div>
  );
}
