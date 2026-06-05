/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParkingSpace, Car, CarType, ParkingSpaceType, ParkingStats } from './types';

// Lists for generating realistic parking lot data
const FIRST_NAMES = [
  'Sebastián', 'Alejandro', 'María', 'Camila', 'Diego', 
  'Javiera', 'José', 'Francisca', 'Nicolás', 'Valentina', 
  'Andrés', 'Constanza', 'Manuel', 'Carolina', 'Felipe', 
  'Ignacia', 'Gabriel', 'Daniela', 'Matías', 'Fernanda'
];

const LAST_NAMES = [
  'Gallardo', 'González', 'Muñoz', 'Rojas', 'Díaz', 
  'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 
  'Carrasco', 'Gómez', 'Lara', 'Yáñez', 'Fernández', 
  'Sanhueza', 'Morales', 'Rodríguez', 'López', 'Fuentes'
];

export const CAR_MODELS_BY_TYPE: Record<CarType, { brand: string, model: string }[]> = {
  sedan: [
    { brand: 'Toyota', model: 'Yaris' },
    { brand: 'Hyundai', model: 'Accent' },
    { brand: 'Mazda', model: '3 Sedan' },
    { brand: 'Kia', model: 'Cerato' },
    { brand: 'Nissan', model: 'Versa' },
    { brand: 'Chevrolet', model: 'Sail' }
  ],
  suv: [
    { brand: 'Toyota', model: 'RAV4' },
    { brand: 'Hyundai', model: 'Tucson' },
    { brand: 'Nissan', model: 'Qashqai' },
    { brand: 'Kia', model: 'Sportage' },
    { brand: 'Mazda', model: 'CX-5' },
    { brand: 'Ford', model: 'Explorer' }
  ],
  hatchback: [
    { brand: 'Volkswagen', model: 'Golf' },
    { brand: 'Suzuki', model: 'Swift' },
    { brand: 'Peugeot', model: '208' },
    { brand: 'Ford', model: 'Fiesta' },
    { brand: 'Kia', model: 'Rio5' },
    { brand: 'Hyundai', model: 'i20' }
  ],
  pickup: [
    { brand: 'Toyota', model: 'Hilux' },
    { brand: 'Mitsubishi', model: 'L200' },
    { brand: 'Ford', model: 'Ranger' },
    { brand: 'Nissan', model: 'Navara' },
    { brand: 'Chevrolet', model: 'D-Max' }
  ],
  sports: [
    { brand: 'Ford', model: 'Mustang' },
    { brand: 'Chevrolet', model: 'Camaro' },
    { brand: 'Toyota', model: 'Supra' },
    { brand: 'Mazda', model: 'MX-5 Miata' },
    { brand: 'Subaru', model: 'BRZ' }
  ]
};

const CAR_COLORS = [
  '#ffffff', // White
  '#f3f4f6', // Bright silver
  '#9ca3af', // Grey
  '#1f2937', // Charcoal black
  '#dc2626', // Red
  '#2563eb', // Blue
  '#16a34a', // Green
  '#ca8a04', // Yellow/Gold
  '#7c2d12', // Burgundy/Brown
  '#0891b2', // Teal
];

// Helper to generate a random Chilean/Spanish style license plate (e.g. AB-CD-12 or ABC-123)
export function generateLicensePlate(): string {
  const chars = 'BCDFGHJKLMNPRSTVWXYZ';
  const rLetter = () => chars[Math.floor(Math.random() * chars.length)];
  const rDigit = () => Math.floor(Math.random() * 10).toString();
  
  if (Math.random() > 0.5) {
    // Format XX-XX-00
    return `${rLetter()}${rLetter()}-${rLetter()}${rLetter()}-${rDigit()}${rDigit()}`;
  } else {
    // Format XXXX-00
    return `${rLetter()}${rLetter()}${rLetter()}${rLetter()}-${rDigit()}${rDigit()}`;
  }
}

export function generateRandomCar(isSimulated = true): Car {
  const types: CarType[] = ['sedan', 'suv', 'hatchback', 'pickup', 'sports'];
  // Distribution of types: sedan & suv are more common, sports is rare
  const weights = [0.35, 0.35, 0.20, 0.08, 0.02];
  let r = Math.random();
  let type: CarType = 'sedan';
  let sum = 0;
  for (let i = 0; i < types.length; i++) {
    sum += weights[i];
    if (r <= sum) {
      type = types[i];
      break;
    }
  }

  const modelPool = CAR_MODELS_BY_TYPE[type];
  const selectModel = modelPool[Math.floor(Math.random() * modelPool.length)];
  const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
  const ownerName = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
  
  // Random entry within last 4 hours
  const minutesAgo = Math.floor(Math.random() * 240);
  const parkedAt = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

  return {
    id: Math.random().toString(36).substring(2, 9),
    licensePlate: generateLicensePlate(),
    color,
    type,
    brandModel: `${selectModel.brand} ${selectModel.model}`,
    parkedAt,
    ownerName,
    isSimulated
  };
}

export function createInitialSpaces(): ParkingSpace[] {
  const spaces: ParkingSpace[] = [];
  
  // Row A: Bottom row, angled (diagonal parking) like in the images.
  // Bordering on a green grass area.
  // Z = 12. Angle = -30 degrees.
  const rowACount = 11;
  const rowAStartX = -20;
  const rowASpacingX = 4.0;
  for (let i = 0; i < rowACount; i++) {
    const x = rowAStartX + i * rowASpacingX;
    const z = 12.0;
    
    // Assign special types: first spot is disabled, second is EV charging, rest is standard
    let type: ParkingSpaceType = 'standard';
    if (i === 0) type = 'disabled';
    else if (i === 1) type = 'ev';
    else if (i === rowACount - 1) type = 'reserved';

    spaces.push({
      id: `A-${i + 1}`,
      row: 'A',
      index: i + 1,
      x,
      z,
      angle: -30,
      type,
      status: 'available',
      occupiedBy: null,
    });
  }

  // Row B: Lower middle row.
  // Perpendicular parking, Z = 4. Angle = 0.
  const rowBCount = 13;
  const rowBStartX = -21;
  const rowBSpacingX = 3.5;
  for (let i = 0; i < rowBCount; i++) {
    const x = rowBStartX + i * rowBSpacingX;
    const z = 4.0;
    
    let type: ParkingSpaceType = 'standard';
    if (i === 0 || i === 1) type = 'disabled';
    else if (i === 2) type = 'reserved';
    else if (i === rowBCount - 1) type = 'ev';

    spaces.push({
      id: `B-${i + 1}`,
      row: 'B',
      index: i + 1,
      x,
      z,
      angle: 0,
      type,
      status: 'available',
      occupiedBy: null,
    });
  }

  // Row C: Upper middle row.
  // Perpendicular parking, Z = -4. Angle = 180 (facing the other way).
  const rowCCount = 13;
  const rowCStartX = -21;
  const rowCSpacingX = 3.5;
  for (let i = 0; i < rowCCount; i++) {
    const x = rowCStartX + i * rowCSpacingX;
    const z = -4.0;
    
    let type: ParkingSpaceType = 'standard';
    if (i === rowCCount - 1) type = 'disabled';
    else if (i === 0) type = 'ev';

    spaces.push({
      id: `C-${i + 1}`,
      row: 'C',
      index: i + 1,
      x,
      z,
      angle: 180,
      type,
      status: 'available',
      occupiedBy: null,
    });
  }

  // Row D: Top row, close to background features (fenced court, warehouse).
  // Perpendicular parking, Z = -12. Angle = 180.
  const rowDCount = 12;
  const rowDStartX = -19.5;
  const rowDSpacingX = 3.5;
  for (let i = 0; i < rowDCount; i++) {
    const x = rowDStartX + i * rowDSpacingX;
    const z = -12.0;
    
    let type: ParkingSpaceType = 'standard';
    if (i === 0) type = 'disabled';
    else if (i === 1) type = 'reserved';
    else if (i === 2) type = 'ev';

    spaces.push({
      id: `D-${i + 1}`,
      row: 'D',
      index: i + 1,
      x,
      z,
      angle: 180,
      type,
      status: 'available',
      occupiedBy: null,
    });
  }

  // Seed some initial cars to make it look realistic and busy, similar to the photo (70% busy)
  spaces.forEach(space => {
    // 68% chance of being occupied initially
    if (Math.random() < 0.68) {
      space.status = 'occupied';
      space.occupiedBy = generateRandomCar(true);
    }
  });

  return spaces;
}

export function calculateStats(spaces: ParkingSpace[]): ParkingStats {
  const total = spaces.length;
  const occupied = spaces.filter(s => s.status === 'occupied').length;
  const reserved = spaces.filter(s => s.status === 'reserved').length;
  const available = total - occupied; // unoccupied spaces

  const disabledTotal = spaces.filter(s => s.type === 'disabled').length;
  const disabledOccupied = spaces.filter(s => s.type === 'disabled' && s.status === 'occupied').length;

  const evTotal = spaces.filter(s => s.type === 'ev').length;
  const evOccupied = spaces.filter(s => s.type === 'ev' && s.status === 'occupied').length;

  return {
    total,
    available,
    occupied,
    reserved,
    disabledTotal,
    disabledOccupied,
    evTotal,
    evOccupied,
    occupancyRate: Math.round((occupied / total) * 100),
  };
}
