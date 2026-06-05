/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ParkingSpace, Car } from '../types';
import { Sparkles, Accessibility, Zap, ShieldAlert, Check, HelpCircle } from 'lucide-react';

interface Parking2DProps {
  spaces: ParkingSpace[];
  onSelectSpace: (space: ParkingSpace) => void;
  selectedSpaceId: string | null;
}

export default function Parking2D({ spaces, onSelectSpace, selectedSpaceId }: Parking2DProps) {
  const [hoveredSpaceId, setHoveredSpaceId] = useState<string | null>(null);

  // Define SVG Viewport size
  // Grid coordinates run from X: -28 to 28, Z: -18 to 18
  const minX = -28;
  const maxX = 28;
  const minZ = -18;
  const maxZ = 18;
  const width = maxX - minX;
  const height = maxZ - minZ;

  // Render SVG car top-down view
  const renderSVGCar = (car: Car, spaceType: string) => {
    // Determine dimensions based on type
    let carW = 1.4;
    let carH = 3.0;
    if (car.type === 'suv') {
      carW = 1.6;
      carH = 3.4;
    } else if (car.type === 'pickup') {
      carW = 1.6;
      carH = 3.6;
    } else if (car.type === 'hatchback') {
      carW = 1.35;
      carH = 2.8;
    } else if (car.type === 'sports') {
      carW = 1.5;
      carH = 3.2;
    }

    // Car color
    const bodyColor = car.color;
    
    return (
      <g style={{ cursor: 'pointer' }}>
        {/* Shadow */}
        <rect
          x={-carW / 2 + 0.08}
          y={-carH / 2 + 0.08}
          width={carW}
          height={carH}
          rx="0.2"
          fill="#111111"
          opacity="0.25"
        />
        {/* Wheels */}
        <polygon points={`${-carW/2-0.08},${-carH/2+0.5} ${-carW/2},${-carH/2+0.5} ${-carW/2},${-carH/2+1} ${-carW/2-0.08},${-carH/2+1}`} fill="#111" />
        <polygon points={`${carW/2+0.08},${-carH/2+0.5} ${carW/2},${-carH/2+0.5} ${carW/2},${-carH/2+1} ${carW/2+0.08},${-carH/2+1}`} fill="#111" />
        <polygon points={`${-carW/2-0.08},${carH/2-1} ${-carW/2},${carH/2-1} ${-carW/2},${carH/2-0.5} ${-carW/2-0.08},${carH/2-0.5}`} fill="#111" />
        <polygon points={`${carW/2+0.08},${carH/2-1} ${carW/2},${carH/2-1} ${carW/2},${carH/2-0.5} ${carW/2+0.08},${carH/2-0.5}`} fill="#111" />

        {/* Outer body */}
        <rect
          x={-carW / 2}
          y={-carH / 2}
          width={carW}
          height={carH}
          rx="0.3"
          fill={bodyColor}
          stroke="#424242"
          strokeWidth="0.06"
        />
        
        {/* Hood lines/grille (facing forward, i.e. pointing along negative Z/positive Y in local coordinates or viceversa, let's assume forward is down/up) */}
        {/* Windshield */}
        <path
          d={`M ${-carW/2 + 0.1} ${-carH/5} L ${carW/2 - 0.1} ${-carH/5} L ${carW/2 - 0.18} ${-carH/10} L ${-carW/2 + 0.18} ${-carH/10} Z`}
          fill="#212121"
          opacity="0.85"
        />
        {/* Cabin Roof */}
        <rect
          x={-carW / 2 + 0.15}
          y={-carH / 10}
          width={carW - 0.3}
          height={carH / 2.2}
          rx="0.1"
          fill="#121212"
          opacity="0.85"
        />
        {/* Rear Glass Window */}
        <path
          d={`M ${-carW/2 + 0.18} ${carH/3} L ${carW/2 - 0.18} ${carH/3} L ${carW/2 - 0.12} ${carH/2.7} L ${-carW/2 + 0.12} ${carH/2.7} Z`}
          fill="#212121"
          opacity="0.85"
        />

        {/* Headlights */}
        <ellipse cx={-carW / 2 + 0.22} cy={-carH / 2 + 0.1} rx="0.08" ry="0.12" fill="#ffeb3b" />
        <ellipse cx={carW / 2 - 0.22} cy={-carH / 2 + 0.1} rx="0.08" ry="0.12" fill="#ffeb3b" />

        {/* Taillights */}
        <rect x={-carW / 2 + 0.15} y={carH / 2 - 0.08} width="0.18" height="0.06" fill="#f44336" />
        <rect x={carW / 2 - 0.33} y={carH / 2 - 0.08} width="0.18" height="0.06" fill="#f44336" />

        {/* Sports Car Spoiler */}
        {car.type === 'sports' && (
          <path
            d={`M ${-carW/2 - 0.1} ${carH/2 - 0.25} L ${carW/2 + 0.1} ${carH/2 - 0.25} L ${carW/2 + 0.05} ${carH/2 - 0.08} L ${-carW/2 - 0.05} ${carH/2 - 0.08} Z`}
            fill="#333333"
          />
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f2eb] rounded-3xl overflow-hidden border border-gray-200/60 shadow-lg text-slate-800">
      {/* 2D Map Canvas Header */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Mapa de Estacionamiento 2D</h3>
          <p className="text-xs text-slate-500">Vista cenital interactiva. Haz clic en cualquier espacio para ver opciones.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block border border-blue-400"></span>
            <span>PMR</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block border border-emerald-400"></span>
            <span>Carga Eléctrica</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block border border-amber-400"></span>
            <span>Reservado</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block border border-slate-400"></span>
            <span>Disponible</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="flex-1 relative flex items-center justify-center p-4 select-none outline-none overflow-y-auto">
        <svg
          viewBox={`${minX} ${minZ} ${width} ${height}`}
          className="w-full h-auto max-h-[580px] drop-shadow-md select-none transition-all duration-300"
          id="parking-svg-2d"
        >
          {/* DEFINITIONS for gradient fills / textures */}
          <defs>
            <pattern id="gravel" width="2" height="2" patternUnits="userSpaceOnUse">
              <rect width="2" height="2" fill="#e8e5dc" />
              <circle cx="0.5" cy="0.5" r="0.1" fill="#dfdcd3" />
              <circle cx="1.5" cy="1.2" r="0.08" fill="#d0cdc4" />
            </pattern>
            <pattern id="grass" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="#a3d995" />
              <rect x="2" width="2" height="2" fill="#9cd18d" />
            </pattern>
            <pattern id="court" width="1" height="1" patternUnits="userSpaceOnUse">
              <rect width="1" height="1" fill="#4caf50" />
            </pattern>
          </defs>

          {/* BACK BACKGROUND: Dirt / Gravel Arena */}
          <rect x={minX - 10} y={minZ - 10} width={width + 20} height={height + 20} fill="url(#gravel)" />

          {/* BACKGROUND ROAD/LANES LAYOUT COMPLIANT WITH SECOND IMAGE */}
          {/* Main central walkways, paths, asphalt markings */}
          <path
            d={`M -25,0 L 25,0 M -25,8 L 25,8 M -25,-8 L 25,-8`}
            stroke="#dfddd4"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.35"
          />

          {/* TOP FOREST / GROUND BACKGROUNDS */}
          {/* Left Soccer Court (Sports Field) matches second image */}
          <g transform="translate(-17.5, -15.5)">
            {/* Turf */}
            <rect x="-8.5" y="-5" width="17" height="10" fill="#388e3c" rx="0.5" stroke="#4caf50" strokeWidth="0.1" />
            {/* White Court Lines */}
            <rect x="-8.2" y="-4.7" width="16.4" height="9.4" fill="none" stroke="#ffffff" strokeWidth="0.15" opacity="0.6" />
            <line x1="0" y1="-4.7" x2="0" y2="4.7" stroke="#ffffff" strokeWidth="0.15" opacity="0.6" />
            <circle cx="0" cy="0" r="1.8" fill="none" stroke="#ffffff" strokeWidth="0.15" opacity="0.6" />
            <rect x="-8.2" y="-2" width="1.8" height="4" fill="none" stroke="#ffffff" strokeWidth="0.15" opacity="0.6" />
            <rect x="6.4" y="-2" width="1.8" height="4" fill="none" stroke="#ffffff" strokeWidth="0.15" opacity="0.6" />
            <text x="0" y="4.2" fontSize="1.0" fill="#ffffff" fontWeight="bold" textAnchor="middle" opacity="0.4">CANCHA DE FÚTBOL</text>
          </g>

          {/* Right Industrial Building / Warehouse matches second image */}
          <g transform="translate(13.5, -15)">
            <rect x="-11.5" y="-5.5" width="23" height="8.5" fill="#455a64" rx="0.3" stroke="#37474f" strokeWidth="0.15" />
            {/* Gable Roof outline */}
            <polygon points="-11.5,-5.5 0,-7.8 11.5,-5.5" fill="#37474f" />
            {/* Industrial design accents */}
            <rect x="-9.5" y="-1" width="4.5" height="4" fill="#cfd8dc" stroke="#90a4ae" strokeWidth="0.1" />
            <line x1="-9.5" y1="1" x2="-5" y2="1" stroke="#90a4ae" strokeWidth="0.08" />
            <line x1="-9.5" y1="2" x2="-5" y2="2" stroke="#90a4ae" strokeWidth="0.08" />
            <rect x="6" y="-1.5" width="1.3" height="4.5" fill="#1c1c1c" rx="0.1" />
            {/* Windows */}
            <rect x="-2" y="-4" width="2" height="1.2" fill="#212121" rx="0.05" />
            <rect x="2" y="-4" width="2" height="1.2" fill="#212121" rx="0.05" />
            <rect x="6" y="-4" width="2" height="1.2" fill="#212121" rx="0.05" />
            <text x="0" y="-1.5" fontSize="1.1" fill="#cfd8dc" fontWeight="bold" textAnchor="middle" opacity="0.3">BODEGA</text>
          </g>

          {/* BOTTOM LAWN with trees (matches second image's grass edge in bottom-left foreground) */}
          <rect x={minX} y="15.2" width={width} height="4" fill="#81c784" />
          <line x1={minX} y1="15.2" x2={maxX} y2="15.2" stroke="#689f38" strokeWidth="0.15" />
          
          {/* Procedural trees on the bottom grass */}
          <g transform="translate(-24, 16.5)">
            <circle cx="0" cy="0" r="1.3" fill="#2e7d32" opacity="0.9" />
            <circle cx="0.5" cy="-0.4" r="1.0" fill="#388e3c" opacity="0.95" />
            <circle cx="-0.5" cy="-0.3" r="1.1" fill="#4caf50" opacity="0.85" />
          </g>
          <g transform="translate(-16, 17.0)">
            <circle cx="0" cy="0" r="1.4" fill="#2e7d32" opacity="0.9" />
            <circle cx="0.6" cy="-0.5" r="1.1" fill="#4caf50" opacity="0.9" />
          </g>
          <g transform="translate(-5, 16.8)">
            <circle cx="0" cy="0" r="1.2" fill="#2e7d32" opacity="0.9" />
            <circle cx="-0.5" cy="-0.4" r="1.0" fill="#3a8d43" opacity="0.95" />
          </g>
          <g transform="translate(10, 17.2)">
            <circle cx="0" cy="0" r="1.5" fill="#1b5e20" opacity="0.9" />
            <circle cx="0.4" cy="-0.4" r="1.2" fill="#2e7d32" opacity="0.95" />
            <circle cx="-0.6" cy="-0.2" r="1.1" fill="#4caf50" opacity="0.8" />
          </g>
          <g transform="translate(22, 16.6)">
            <circle cx="0" cy="0" r="1.3" fill="#2e7d32" opacity="0.9" />
            <circle cx="-0.4" cy="-0.4" r="1.0" fill="#4caf50" opacity="0.9" />
          </g>

          {/* MAIN LAMP POSTS AT NIGHT (just decorative base markers here, showing lighting spots) */}
          <g transform="translate(-12, 8)">
            <circle cx="0" cy="0" r="0.3" fill="#616161" />
            <circle cx="0" cy="0" r="0.15" fill="#9e9e9e" />
          </g>
          <g transform="translate(12, 8)">
            <circle cx="0" cy="0" r="0.3" fill="#616161" />
            <circle cx="0" cy="0" r="0.15" fill="#9e9e9e" />
          </g>
          <g transform="translate(-12, -8)">
            <circle cx="0" cy="0" r="0.3" fill="#616161" />
            <circle cx="0" cy="0" r="0.15" fill="#9e9e9e" />
          </g>
          <g transform="translate(12, -8)">
            <circle cx="0" cy="0" r="0.3" fill="#616161" />
            <circle cx="0" cy="0" r="0.15" fill="#9e9e9e" />
          </g>

          {/* PARKING SPACES */}
          {spaces.map((space) => {
            const isSelected = selectedSpaceId === space.id;
            const isHovered = hoveredSpaceId === space.id;
            
            // Spot parking lines coordinates locally
            // We draw from x=-1.5 to 1.5, y=-2.5 to 2.5
            const spotW = space.type === 'disabled' ? 3.3 : 2.8; // PMR spots are wider
            const spotH = 5.0;

            // Space outline/background paint based on type and occupancy
            let bgFill = 'transparent';
            let strokeColor = '#ffffff';
            let strokeDash = '0';

            if (space.type === 'disabled') {
              bgFill = '#e3f2fd'; // Soft PMR blue background
              strokeColor = '#1e88e5';
            } else if (space.type === 'ev') {
              bgFill = '#e8f5e9'; // Soft EV green background
              strokeColor = '#43a047';
            } else if (space.type === 'reserved') {
              bgFill = '#fffde7'; // Soft Reserved yellow background
              strokeColor = '#fdd835';
              strokeDash = '0.3, 0.2';
            }

            if (space.status === 'occupied') {
              // Standard occupied lines stay white, background stays light tint
            }

            return (
              <g
                key={space.id}
                transform={`translate(${space.x}, ${space.z}) rotate(${space.angle})`}
                onClick={() => onSelectSpace(space)}
                onMouseEnter={() => setHoveredSpaceId(space.id)}
                onMouseLeave={() => setHoveredSpaceId(null)}
                className="transition-all duration-200"
              >
                {/* Clickable Hover Box */}
                <rect
                  x={-spotW / 2}
                  y={-spotH / 2}
                  width={spotW}
                  height={spotH}
                  fill={bgFill}
                  stroke={isSelected ? '#f43f5e' : (isHovered ? '#06b6d4' : strokeColor)}
                  strokeWidth={isSelected ? 0.35 : (isHovered ? 0.2 : 0.08)}
                  strokeDasharray={strokeDash}
                  style={{ cursor: 'pointer', transition: 'stroke-width 150ms' }}
                />

                {/* Draw Spot Boundaries (White lines left and right) */}
                {/* Avoid drawing lines inside the boundaries to make it look clean */}
                <line x1={-spotW / 2} y1={-spotH / 2} x2={-spotW / 2} y2={spotH / 2} stroke="#ffffff" strokeWidth="0.08" />
                <line x1={spotW / 2} y1={-spotH / 2} x2={spotW / 2} y2={spotH / 2} stroke="#ffffff" strokeWidth="0.08" />
                {/* Yellow Stopper Bar at the back of the spot */}
                <rect x={-spotW / 2 + 0.3} y={-spotH / 2 + 0.5} width={spotW - 0.6} height="0.12" fill="#ffb300" rx="0.02" opacity="0.8" />

                {/* Spot Type Icons / Badges when available */}
                {space.status !== 'occupied' && (
                  <g opacity="0.6" transform="translate(0, 0)">
                    {space.type === 'disabled' && (
                      <path
                        d="M -0.4,-0.8 C -0.4,-0.6 -0.6,-0.4 -0.8,-0.4 C -1.0,-0.4 -1.2,-0.6 -1.2,-0.8 C -1.2,-1.0 -1.0,-1.2 -0.8,-1.2 C -0.6,-1.2 -0.4,-1.0 -0.4,-0.8 Z M -1.0,0.5 L -0.6,0.5 L -0.6,0 L -0.2,0 L -0.2,-0.5 Q -0.2,-0.75 -0.45,-0.75 L -0.9,-0.75 Q -1.15,-0.75 -1.15,-0.5 L -1.15,0.2 Z"
                        fill="#1e88e5"
                        transform="scale(1.5)"
                      />
                    )}
                    {space.type === 'ev' && (
                      <g transform="scale(1.2) translate(-0.35, -0.4)">
                        <path d="M 0.3,0.1 L 0.1,0.5 L 0.4,0.5 L 0.2,0.9 L 0.6,0.4 L 0.3,0.4 Z" fill="#43a047" scale="1.6" />
                      </g>
                    )}
                    {space.type === 'reserved' && (
                      <text
                        x="0"
                        y="0.3"
                        fontSize="0.9"
                        fill="#e5a900"
                        fontWeight="bold"
                        textAnchor="middle"
                        letterSpacing="0.05"
                      >
                        RESERVADO
                      </text>
                    )}
                    {space.type === 'standard' && (
                      <text
                        x="0"
                        y="0.4"
                        fontSize="0.9"
                        fill="#9aa0a6"
                        fontWeight="bold"
                        textAnchor="middle"
                        opacity="0.35"
                      >
                        {space.id}
                      </text>
                    )}
                  </g>
                )}

                {/* Draw Occupied Car if present */}
                {space.status === 'occupied' && space.occupiedBy && (
                  renderSVGCar(space.occupiedBy, space.type)
                )}

                {/* Red outline warning for selection */}
                {isSelected && (
                  <rect
                    x={-spotW / 2 - 0.12}
                    y={-spotH / 2 - 0.12}
                    width={spotW + 0.24}
                    height={spotH + 0.24}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="0.12"
                    strokeDasharray="0.2, 0.1"
                    rx="0.1"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover / Tooltip HUD Overlay */}
        {hoveredSpaceId && (
          (() => {
            const space = spaces.find(s => s.id === hoveredSpaceId);
            if (!space) return null;
            return (
              <div className="absolute top-5 left-5 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-xl flex flex-col gap-1 border border-slate-700/50 pointer-events-none scale-95 origin-top-left transition-transform duration-150">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-cyan-400">{space.id}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {space.type === 'disabled' ? '♿ PMR' : space.type === 'ev' ? '⚡ Carga EV' : space.type === 'reserved' ? '🎟️ Reservado' : '🚗 Estándar'}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  {space.status === 'occupied' && space.occupiedBy ? (
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{space.occupiedBy.brandModel}</span>
                      <span className="font-mono text-[11px] text-cyan-300">{space.occupiedBy.licensePlate}</span>
                      <span className="text-[10px] text-slate-400 mt-1">Conductor: {space.occupiedBy.ownerName}</span>
                    </div>
                  ) : space.status === 'reserved' ? (
                    <span className="text-amber-300">Reservado - No disponible</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">Disponible</span>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Control Map Legend footer */}
      <div className="p-4 bg-slate-950 text-slate-400 border-t border-slate-800 text-[11px] flex justify-between items-center select-none rounded-b-3xl">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Click en cualquier espacio para <strong>Estacionar / Retirar Autos</strong> y cambiar categorización.</span>
        </div>
        <div>
          <span>Escala: 1:100 (Cenital Vectorial)</span>
        </div>
      </div>
    </div>
  );
}
