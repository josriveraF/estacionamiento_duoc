/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CarType, ParkingSpaceType } from '../types';

/**
 * Creates a beautiful, detailed stylized low-poly car mesh procedurally.
 * This ensures no external network requests or model loading failures.
 */
export function createCarMesh(type: CarType, colorHex: string, isNight = false): THREE.Group {
  const carGroup = new THREE.Group();
  carGroup.name = 'car';

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.2,
    metalness: 0.5,
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85,
  });

  const blackPlasticMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.8,
    roughness: 0.2,
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x151515,
    roughness: 0.9,
  });

  const wheelRimMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.7,
    roughness: 0.3,
  });

  const yellowGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff0aa,
  });

  const redGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xef4444,
  });

  // Base dimensions based on car type
  let carWidth = 1.6;
  let carLength = 3.6;
  let carHeight = 0.7; // Lower body height
  let cabinWidth = 1.35;
  let cabinLength = 2.0;
  let cabinHeight = 0.6;
  let cabinOffsetZ = -0.15; // Shift cabin backwards

  if (type === 'suv') {
    carWidth = 1.75;
    carLength = 3.9;
    carHeight = 0.95;
    cabinWidth = 1.55;
    cabinLength = 2.4;
    cabinHeight = 0.7;
    cabinOffsetZ = -0.1;
  } else if (type === 'pickup') {
    carWidth = 1.8;
    carLength = 4.2;
    carHeight = 0.95;
    cabinWidth = 1.6;
    cabinLength = 1.8; // shorter cabin for cargo bed
    cabinHeight = 0.7;
    cabinOffsetZ = 0.3; // cabin shifted forward
  } else if (type === 'hatchback') {
    carWidth = 1.55;
    carLength = 3.3;
    carHeight = 0.75;
    cabinWidth = 1.35;
    cabinLength = 2.1;
    cabinHeight = 0.6;
    cabinOffsetZ = -0.3; // flat hatch back
  } else if (type === 'sports') {
    carWidth = 1.7;
    carLength = 3.8;
    carHeight = 0.55; // low slung
    cabinWidth = 1.3;
    cabinLength = 1.7;
    cabinHeight = 0.5;
    cabinOffsetZ = -0.4; // cockpit in the back
  }

  // --- 1. CHASSIS (Lower Body) ---
  const bodyGeo = new THREE.BoxGeometry(carWidth, carHeight, carLength);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
  bodyMesh.position.y = carHeight / 2 + 0.3; // clear wheels
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  carGroup.add(bodyMesh);

  // Add front bumper details
  const bumperGeo = new THREE.BoxGeometry(carWidth + 0.04, 0.2, 0.15);
  const frontBumper = new THREE.Mesh(bumperGeo, blackPlasticMaterial);
  frontBumper.position.set(0, 0.2, carLength / 2 + 0.05);
  frontBumper.position.y += carHeight / 2 + 0.1;
  carGroup.add(frontBumper);

  const rearBumper = frontBumper.clone();
  rearBumper.position.z = -carLength / 2 - 0.05;
  carGroup.add(rearBumper);

  // --- 2. CABIN (Upper Glass Structure) ---
  const cabinGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
  const cabinMesh = new THREE.Mesh(cabinGeo, glassMaterial);
  // Position cabin on top of lower body
  cabinMesh.position.set(0, carHeight + cabinHeight / 2 + 0.3, cabinOffsetZ);
  cabinMesh.castShadow = true;
  carGroup.add(cabinMesh);

  // Add roof pillaring (low poly style metal pillars)
  const roofGeo = new THREE.BoxGeometry(cabinWidth + 0.02, 0.06, cabinLength + 0.02);
  const roof = new THREE.Mesh(roofGeo, bodyMaterial);
  roof.position.set(0, carHeight + cabinHeight + 0.32, cabinOffsetZ);
  roof.castShadow = true;
  carGroup.add(roof);

  // --- 3. WHEELS AND AXLES ---
  const wheelRadius = 0.36;
  const wheelThickness = 0.26;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 12);
  // Rotate wheel geometry to stand vertically along Z/X axis
  wheelGeo.rotateZ(Math.PI / 2);

  const rimGeo = new THREE.CylinderGeometry(wheelRadius - 0.1, wheelRadius - 0.1, wheelThickness + 0.02, 10);
  rimGeo.rotateZ(Math.PI / 2);

  // Positions of wheels relative to center of car
  const wheelX = carWidth / 2 + 0.05;
  const wheelZ = carLength / 2 - 0.65;
  const frontY = wheelRadius;

  const wheelPositions = [
    { x: wheelX, z: wheelZ },  // Front Right
    { x: -wheelX, z: wheelZ }, // Front Left
    { x: wheelX, z: -wheelZ }, // Back Right
    { x: -wheelX, z: -wheelZ },// Back Left
  ];

  wheelPositions.forEach((pos) => {
    const tire = new THREE.Mesh(wheelGeo, tireMaterial);
    const rim = new THREE.Mesh(rimGeo, wheelRimMaterial);
    
    const wheelAssembly = new THREE.Group();
    wheelAssembly.add(tire);
    wheelAssembly.add(rim);

    wheelAssembly.position.set(pos.x, frontY, pos.z);
    
    // Add brake discs/axle hubs
    const hubCapsGeo = new THREE.CylinderGeometry(0.12, 0.12, wheelThickness + 0.04, 8);
    hubCapsGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubCapsGeo, metalMaterial);
    wheelAssembly.add(hub);

    wheelAssembly.castShadow = true;
    carGroup.add(wheelAssembly);
  });

  // --- 4. DETAILS BY TYPE ---
  if (type === 'suv') {
    // Roof rack rails
    const rackRailGeo = new THREE.BoxGeometry(0.08, 0.08, cabinLength - 0.4);
    const rackL = new THREE.Mesh(rackRailGeo, metalMaterial);
    rackL.position.set(cabinWidth / 2 - 0.15, carHeight + cabinHeight + 0.38, cabinOffsetZ);
    const rackR = rackL.clone();
    rackR.position.x = -(cabinWidth / 2 - 0.15);
    carGroup.add(rackL);
    carGroup.add(rackR);

    // Spare wheel on the back (very typical SUV)
    const spareWheelGeo = new THREE.CylinderGeometry(wheelRadius - 0.05, wheelRadius - 0.05, 0.22, 10);
    spareWheelGeo.rotateX(Math.PI / 2); // face backwards
    const spareTire = new THREE.Mesh(spareWheelGeo, tireMaterial);
    spareTire.position.set(0, carHeight / 2 + 0.4, -carLength / 2 - 0.12);
    spareTire.castShadow = true;
    carGroup.add(spareTire);
  } else if (type === 'sports') {
    // Spoiler
    const spoilerStandsGeo = new THREE.BoxGeometry(0.06, 0.22, 0.06);
    const spoilerWingGeo = new THREE.BoxGeometry(carWidth + 0.1, 0.04, 0.3);
    
    const spoilerGroup = new THREE.Group();
    const lStand = new THREE.Mesh(spoilerStandsGeo, blackPlasticMaterial);
    lStand.position.set(carWidth / 2 - 0.3, 0.11, -carLength / 2 + 0.15);
    const rStand = lStand.clone();
    rStand.position.x = -(carWidth / 2 - 0.3);

    const wing = new THREE.Mesh(spoilerWingGeo, bodyMaterial);
    wing.position.set(0, 0.22, -carLength / 2 + 0.15);
    wing.castShadow = true;

    spoilerGroup.add(lStand);
    spoilerGroup.add(rStand);
    spoilerGroup.add(wing);
    spoilerGroup.position.y += carHeight + 0.2;
    carGroup.add(spoilerGroup);
  } else if (type === 'pickup') {
    // Bed container (Cargo area in the back)
    // Create side panels for the bed
    const bedWallH = 0.45;
    const bedWallW = 0.1;
    const bedLength = carLength - cabinLength - 0.6; // remaining space
    const bedCenterZ = -carLength / 2 + bedLength / 2 + 0.25;

    // Bed bottom plate (black)
    const bedFloorGeo = new THREE.BoxGeometry(carWidth - 0.2, 0.1, bedLength - 0.1);
    const bedFloor = new THREE.Mesh(bedFloorGeo, blackPlasticMaterial);
    bedFloor.position.set(0, carHeight + 0.25, bedCenterZ);
    carGroup.add(bedFloor);

    // Bed walls (side L & R)
    const bedWallSideGeo = new THREE.BoxGeometry(bedWallW, bedWallH, bedLength);
    const wallL = new THREE.Mesh(bedWallSideGeo, bodyMaterial);
    wallL.position.set(carWidth / 2 - bedWallW / 2, carHeight + bedWallH / 2 + 0.25, bedCenterZ);
    wallL.castShadow = true;
    const wallR = wallL.clone();
    wallR.position.x = -(carWidth / 2 - bedWallW / 2);
    
    // Bed wall back (tailgate)
    const bedWallBackGeo = new THREE.BoxGeometry(carWidth - bedWallW * 2, bedWallH, bedWallW);
    const wallBack = new THREE.Mesh(bedWallBackGeo, bodyMaterial);
    wallBack.position.set(0, carHeight + bedWallH / 2 + 0.25, -carLength / 2 + bedWallW / 2);
    wallBack.castShadow = true;

    carGroup.add(wallL);
    carGroup.add(wallR);
    carGroup.add(wallBack);
  }

  // --- 5. HEADLIGHTS AND TAILLIGHTS ---
  // Headlights
  const headlightGeo = new THREE.BoxGeometry(0.24, 0.14, 0.08);
  const headlightL = new THREE.Mesh(headlightGeo, yellowGlowMaterial);
  headlightL.position.set(carWidth / 2 - 0.26, carHeight / 2 + 0.35, carLength / 2 + 0.01);
  const headlightR = headlightL.clone();
  headlightR.position.x = -(carWidth / 2 - 0.26);
  carGroup.add(headlightL);
  carGroup.add(headlightR);

  // Taillights
  const taillightGeo = new THREE.BoxGeometry(0.26, 0.14, 0.08);
  const taillightL = new THREE.Mesh(taillightGeo, redGlowMaterial);
  taillightL.position.set(carWidth / 2 - 0.26, carHeight / 2 + 0.35, -carLength / 2 - 0.01);
  const taillightR = taillightL.clone();
  taillightR.position.x = -(carWidth / 2 - 0.26);
  carGroup.add(taillightL);
  carGroup.add(taillightR);

  // License Plates
  const plateGeo = new THREE.BoxGeometry(0.45, 0.16, 0.04);
  const plateMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const fPlate = new THREE.Mesh(plateGeo, plateMat);
  fPlate.position.set(0, 0.24 + carHeight / 2, carLength / 2 + 0.06);
  carGroup.add(fPlate);

  const bPlate = fPlate.clone();
  bPlate.position.z = -carLength / 2 - 0.06;
  bPlate.rotation.y = Math.PI;
  carGroup.add(bPlate);

  // --- 6. GLOW FOR NIGHT LIGHTING ---
  if (isNight) {
    // Add two light cones projecting forward for parked cars (optional, subtle style)
    const spotL = new THREE.SpotLight(0xfff5dd, 4, 18, Math.PI / 6, 0.5, 1);
    spotL.position.set(carWidth / 2 - 0.26, carHeight / 2 + 0.35, carLength / 2 + 0.2);
    
    // Create target for spot light
    const targetL = new THREE.Object3D();
    targetL.position.set(carWidth / 2 - 0.26, 0, carLength / 2 + 10);
    carGroup.add(targetL);
    spotL.target = targetL;
    spotL.castShadow = true;
    spotL.shadow.mapSize.width = 256;
    spotL.shadow.mapSize.height = 256;
    carGroup.add(spotL);

    const spotR = new THREE.SpotLight(0xfff5dd, 4, 18, Math.PI / 6, 0.5, 1);
    spotR.position.set(-(carWidth / 2 - 0.26), carHeight / 2 + 0.35, carLength / 2 + 0.2);
    
    const targetR = new THREE.Object3D();
    targetR.position.set(-(carWidth / 2 - 0.26), 0, carLength / 2 + 10);
    carGroup.add(targetR);
    spotR.target = targetR;
    spotR.castShadow = true;
    spotR.shadow.mapSize.width = 256;
    spotR.shadow.mapSize.height = 256;
    carGroup.add(spotR);
  }

  // Set initial shadows enabled
  carGroup.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return carGroup;
}

/**
 * Generates low-poly trees.
 */
export function createTreeMesh(): THREE.Group {
  const treeGroup = new THREE.Group();
  treeGroup.name = 'tree';

  // Tree trunk
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.8, 6);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x5a3a22,
    roughness: 0.9,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.9;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  // Tree dome (leaves) - stylized stacked cones/spheres
  const leavesMat = new THREE.MeshStandardMaterial({
    color: 0x1b5e20 + Math.floor(Math.random() * 4) * 0x051000, // randomized shades of green
    roughness: 0.8,
  });

  // Low poly layered leaves
  const levels = 3;
  for (let i = 0; i < levels; i++) {
    const scale = 1.0 - i * 0.25;
    const radius = 1.2 * scale;
    const height = 1.5 * scale;
    const leavesGeo = new THREE.CylinderGeometry(0, radius, height, 5);
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 1.8 + i * 0.75;
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    treeGroup.add(leaves);
  }

  return treeGroup;
}

/**
 * Creates 3D functional Lamp Post.
 */
export function createLampPost(isNight = false): THREE.Group {
  const postGroup = new THREE.Group();
  postGroup.name = 'lamppost';

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.8 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.3;
  postGroup.add(base);

  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 7.0, 6);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.5, metalness: 0.6 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 3.8;
  pole.castShadow = true;
  postGroup.add(pole);

  // Arm
  const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6);
  armGeo.rotateZ(Math.PI / 2.5); // tilt slightly
  const arm = new THREE.Mesh(armGeo, poleMat);
  arm.position.set(0.65, 7.2, 0);
  arm.castShadow = true;
  postGroup.add(arm);

  // Head/Bulb enclosure
  const headGeo = new THREE.BoxGeometry(0.7, 0.22, 0.45);
  const head = new THREE.Mesh(headGeo, baseMat);
  head.position.set(1.3, 7.4, 0);
  postGroup.add(head);

  // Bulb glow face
  const bulbGeo = new THREE.BoxGeometry(0.5, 0.05, 0.35);
  const bulbMat = new THREE.MeshBasicMaterial({ color: isNight ? 0xfff5cc : 0xdddddd });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.set(1.3, 7.28, 0);
  postGroup.add(bulb);

  // Lighting source for Night Mode
  if (isNight) {
    // Spotlight projecting downwards
    const light = new THREE.SpotLight(0xfff1cc, 22, 28, Math.PI / 4, 0.6, 1);
    light.position.set(1.3, 7.2, 0);
    
    // Create target on the ground
    const targetObj = new THREE.Object3D();
    targetObj.position.set(1.3, 0, 0);
    postGroup.add(targetObj);
    light.target = targetObj;

    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.bias = -0.002;
    postGroup.add(light);
  }

  return postGroup;
}

/**
 * Creates Soccer Field (Cancha de Fútbol) to represent the top-left background in the second image.
 */
export function createSportsField(): THREE.Group {
  const sportsGroup = new THREE.Group();
  sportsGroup.name = 'sportsfield';

  // Field dimensions: length=22, width=14
  const fieldW = 14;
  const fieldL = 22;

  // Green Turf
  const turfGeo = new THREE.BoxGeometry(fieldW, 0.1, fieldL);
  const turfMat = new THREE.MeshStandardMaterial({
    color: 0x2e7d32, // deep sports green
    roughness: 0.9,
  });
  const turf = new THREE.Mesh(turfGeo, turfMat);
  turf.position.y = -0.05;
  turf.receiveShadow = true;
  sportsGroup.add(turf);

  // White markings (lines) - just draw some simple visual bars
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const outLineGeo = new THREE.BoxGeometry(fieldW - 0.2, 0.02, 0.1);
  const outlineNorth = new THREE.Mesh(outLineGeo, lineMat);
  outlineNorth.position.set(0, 0.015, fieldL / 2 - 0.1);
  sportsGroup.add(outlineNorth);

  const outlineSouth = outlineNorth.clone();
  outlineSouth.position.z = -fieldL / 2 + 0.1;
  sportsGroup.add(outlineSouth);

  const outlineSideGeo = new THREE.BoxGeometry(0.1, 0.02, fieldL - 0.2);
  const outlineWest = new THREE.Mesh(outlineSideGeo, lineMat);
  outlineWest.position.set(-fieldW / 2 + 0.1, 0.015, 0);
  sportsGroup.add(outlineWest);

  const outlineEast = outlineWest.clone();
  outlineEast.position.x = fieldW / 2 - 0.1;
  sportsGroup.add(outlineEast);

  // Midfield Line
  const midLine = new THREE.Mesh(outLineGeo, lineMat);
  midLine.position.set(0, 0.015, 0);
  sportsGroup.add(midLine);

  // Center Circle
  const circlePoints = [];
  const radius = 2.5;
  for (let i = 0; i <= 24; i++) {
    const theta = (i / 24) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(Math.cos(theta) * radius, 0.015, Math.sin(theta) * radius));
  }
  const circleGeo = new THREE.BufferGeometry().setFromPoints(circlePoints);
  const circleMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
  const centerCircle = new THREE.Line(circleGeo, circleMat);
  sportsGroup.add(centerCircle);

  // Goals (arco de fútbol) on North and South ends
  const goalGroupN = new THREE.Group();
  const goalPostMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  
  const postVertGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6);
  const leftPost = new THREE.Mesh(postVertGeo, goalPostMat);
  leftPost.position.set(-1.8, 0.8, 0);
  leftPost.castShadow = true;
  
  const rightPost = leftPost.clone();
  rightPost.position.x = 1.8;

  const barHorizGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.6, 6);
  barHorizGeo.rotateZ(Math.PI / 2);
  const crossBar = new THREE.Mesh(barHorizGeo, goalPostMat);
  crossBar.position.set(0, 1.6, 0);
  crossBar.castShadow = true;

  // Simple mesh netting back
  const netGeo = new THREE.BoxGeometry(3.6, 1.6, 0.6);
  const netMat = new THREE.MeshBasicMaterial({ 
    color: 0xcccccc, 
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });
  const goalNet = new THREE.Mesh(netGeo, netMat);
  goalNet.position.set(0, 0.8, -0.3);

  goalGroupN.add(leftPost);
  goalGroupN.add(rightPost);
  goalGroupN.add(crossBar);
  goalGroupN.add(goalNet);
  
  goalGroupN.position.set(0, 0, fieldL / 2 - 0.4);
  goalGroupN.rotation.y = Math.PI; // faces into the field
  sportsGroup.add(goalGroupN);

  const goalGroupS = goalGroupN.clone();
  goalGroupS.position.z = -fieldL / 2 + 0.4;
  goalGroupS.rotation.y = 0; // faces into the field
  sportsGroup.add(goalGroupS);

  // Sports court perimeter fence (malla olímpica en el fondo)
  const fenceGroup = new THREE.Group();
  // Tall posts
  const fencePostGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 6);
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.5 });
  const meshMat = new THREE.MeshBasicMaterial({ 
    color: 0x616161, 
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });

  const fenceStep = 4.0;
  for (let x = -fieldW / 2; x <= fieldW / 2; x += fenceStep) {
    const post = new THREE.Mesh(fencePostGeo, fenceMat);
    post.position.set(x, 1.75, fieldL / 2);
    post.castShadow = true;
    fenceGroup.add(post);

    if (x < fieldW / 2) {
      const panelGeo = new THREE.BoxGeometry(fenceStep, 3.0, 0.02);
      const panel = new THREE.Mesh(panelGeo, meshMat);
      panel.position.set(x + fenceStep / 2, 1.75, fieldL / 2);
      fenceGroup.add(panel);
    }
  }
  sportsGroup.add(fenceGroup);

  return sportsGroup;
}

/**
 * Creates Warehouse Building (Bodega Industrial) representing the top-right background in the second image.
 */
export function createWarehouse(): THREE.Group {
  const whGroup = new THREE.Group();
  whGroup.name = 'warehouse';

  // Overall building box
  const width = 16;
  const height = 9;
  const depth = 11;

  // Main structure
  const structureGeo = new THREE.BoxGeometry(width, height, depth);
  const structureMat = new THREE.MeshStandardMaterial({
    color: 0x546e7a, // steel blue/grey
    roughness: 0.7,
    metalness: 0.4,
  });
  const mainBdg = new THREE.Mesh(structureGeo, structureMat);
  mainBdg.position.y = height / 2;
  mainBdg.castShadow = true;
  mainBdg.receiveShadow = true;
  whGroup.add(mainBdg);

  // Gable roof (techado a dos aguas)
  const roofH = 2.0;
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-width / 2, 0);
  roofShape.lineTo(0, roofH);
  roofShape.lineTo(width / 2, 0);
  roofShape.closePath();

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: false,
  };
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
  // Shift roof center to match top of building
  roofGeo.translate(0, height, -depth / 2);

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x37474f, // darker grey slate
    roughness: 0.5,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  // Rotate extrude geometry back to forward orientation
  roof.rotation.y = Math.PI; // fit direction
  roof.position.y = 0; // translation already handles height
  roof.castShadow = true;
  whGroup.add(roof);

  // Large loading dock door (Portón industrial) on front wall facing parking
  const doorW = 4.5;
  const doorH = 4.0;
  const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.15);
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0xb0bec5, // light concrete grey with panels
    roughness: 0.5,
    metalness: 0.7
  });
  const gate = new THREE.Mesh(doorGeo, doorMat);
  gate.position.set(-3, doorH / 2, depth / 2 + 0.05); // slightly outward
  gate.castShadow = true;
  whGroup.add(gate);

  // Gate metal slats decorative detail
  for (let yOffset = 0.5; yOffset < doorH; yOffset += 0.6) {
    const slatGeo = new THREE.BoxGeometry(doorW - 0.2, 0.08, 0.2);
    const slat = new THREE.Mesh(slatGeo, structureMat);
    slat.position.set(-3, yOffset, depth / 2 + 0.1);
    whGroup.add(slat);
  }

  // Small pedestrian entrance door
  const pedDoorGeo = new THREE.BoxGeometry(1.2, 2.4, 0.1);
  const pedDoorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
  const pedDoor = new THREE.Mesh(pedDoorGeo, pedDoorMat);
  pedDoor.position.set(3.5, 1.2, depth / 2 + 0.05);
  whGroup.add(pedDoor);

  // Windows
  const winGeo = new THREE.BoxGeometry(1.6, 1.2, 0.1);
  const winMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9, emissive: 0x051a24 });
  for (let xOffset = -5; xOffset <= 5; xOffset += 3.5) {
    if (xOffset > -1.5 && xOffset < 1.5) continue; // skip above gate area overlap
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(xOffset, 6.2, depth / 2 + 0.05);
    whGroup.add(win);
  }

  return whGroup;
}

/**
 * Creates an EV Charging Post to render in 3D charging slots.
 */
export function createChargingStation(): THREE.Group {
  const chargerGroup = new THREE.Group();
  chargerGroup.name = 'evcharger';

  // Base
  const baseGeo = new THREE.BoxGeometry(0.6, 1.6, 0.4);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.5 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.8;
  base.castShadow = true;
  chargerGroup.add(base);

  // Green visual highlights/screen
  const panelGeo = new THREE.BoxGeometry(0.44, 0.6, 0.06);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.2, emissive: 0x1b5e20, emissiveIntensity: 0.5 });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 1.1, 0.18);
  chargerGroup.add(panel);

  // Stylized EV screen logo
  const glassGeo = new THREE.BoxGeometry(0.32, 0.24, 0.02);
  const glassMat = new THREE.MeshBasicMaterial({ color: 0xe0f2f1 });
  const screen = new THREE.Mesh(glassGeo, glassMat);
  screen.position.set(0, 1.15, 0.22);
  chargerGroup.add(screen);

  // Cable wrap (black cylinder toroid)
  const cableGeo = new THREE.TorusGeometry(0.24, 0.06, 6, 12);
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const cable = new THREE.Mesh(cableGeo, cableMat);
  cable.rotation.y = Math.PI / 2;
  cable.position.set(0.28, 0.8, 0);
  chargerGroup.add(cable);

  return chargerGroup;
}
