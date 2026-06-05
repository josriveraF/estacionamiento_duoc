/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ParkingSpaceType = 'standard' | 'disabled' | 'ev' | 'reserved';
export type ParkingSpaceStatus = 'available' | 'occupied' | 'reserved';
export type CarType = 'sedan' | 'suv' | 'hatchback' | 'pickup' | 'sports';
export type TimeOfDay = 'day' | 'sunset' | 'night';
export type ViewMode = '2d' | '3d';

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
