/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ParkingSpaceType = 'standard' | 'disabled' | 'ev' | 'reserved';
export type ParkingSpaceStatus = 'available' | 'occupied' | 'reserved';
export type CarType = 'sedan' | 'suv' | 'hatchback' | 'pickup' | 'sports';
export type TimeOfDay = 'day' | 'sunset' | 'night';
export type ViewMode = 'live' | 'analytics' | 'incidents';

export interface Car {
  id: string;
  licensePlate: string;
  color: string;
  type: CarType;
  brandModel: string;
  parkedAt: string; // ISO date format
  ownerName: string;
  isSimulated: boolean;
}

export interface ParkingSpace {
  id: string;
  row: 'A' | 'B' | 'C' | 'D';
  index: number;
  x: number; // grid location X (-25 to 25)
  z: number; // grid location Z (-15 to 15)
  angle: number; // rotation in degrees
  type: ParkingSpaceType;
  status: ParkingSpaceStatus;
  occupiedBy: Car | null;
  sensorDesynced?: boolean; // True if the vehicle left but the sensor is stuck / not updated
}

export interface ParkingStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  disabledTotal: number;
  disabledOccupied: number;
  evTotal: number;
  evOccupied: number;
  occupancyRate: number;
}

export interface SystemFailure {
  id: string;
  component: string;
  description: string;
  severity: 'alta' | 'media' | 'baja';
  status: 'activo' | 'solucionando' | 'resuelto';
  time: string;
}

export interface Complaint {
  id: string;
  user: string;
  category: 'infraestructura' | 'usuario' | 'sensor' | 'otro';
  text: string;
  time: string;
  status: 'pendiente' | 'resuelto';
  spaceId?: string;
}
