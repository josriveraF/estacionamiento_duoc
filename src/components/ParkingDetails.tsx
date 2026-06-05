/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ParkingSpace, Car, CarType, ParkingSpaceType } from '../types';
import { generateLicensePlate, CAR_MODELS_BY_TYPE, generateRandomCar } from '../data';
import { 
  X, User, CreditCard, Clock, Calendar, ShieldCheck, 
  Trash2, PlusCircle, Car as CarIcon, Accessibility, 
  Zap, Key, RotateCcw, AlertTriangle, CheckCircle 
} from 'lucide-react';

interface ParkingDetailsProps {
  space: ParkingSpace;
  onClose: () => void;
  onParkCar: (spaceId: string, car: Car) => void;
  onUnparkCar: (spaceId: string) => void;
  onChangeSpaceType: (spaceId: string, type: ParkingSpaceType) => void;
  onReserveSpace: (spaceId: string) => void;
}

const PRESET_COLORS = [
  { name: 'Blanco', hex: '#ffffff', class: 'bg-white ring-gray-300' },
  { name: 'Plata', hex: '#f3f4f6', class: 'bg-gray-100 ring-gray-300' },
  { name: 'Gris', hex: '#9ca3af', class: 'bg-gray-400 ring-gray-500' },
  { name: 'Carbono', hex: '#1f2937', class: 'bg-gray-800 ring-gray-900' },
  { name: 'Rojo', hex: '#dc2626', class: 'bg-red-600 ring-red-700' },
  { name: 'Azul', hex: '#2563eb', class: 'bg-blue-600 ring-blue-700' },
  { name: 'Verde', hex: '#16a34a', class: 'bg-green-600 ring-green-700' },
  { name: 'Oro', hex: '#ca8a04', class: 'bg-yellow-600 ring-yellow-700' },
];

export default function ParkingDetails({ 
  space, 
  onClose, 
  onParkCar, 
  onUnparkCar, 
  onChangeSpaceType,
  onReserveSpace 
}: ParkingDetailsProps) {
  
  // Park form states
  const [carType, setCarType] = useState<CarType>('sedan');
  const [brandModel, setBrandModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  
  // Suggested models based on type selected
  const suggestedModels = CAR_MODELS_BY_TYPE[carType] || [];

  // Re-generate or clear form on space mount
  useEffect(() => {
    resetForm();
  }, [space]);

  const resetForm = () => {
    setCarType('sedan');
    setBrandModel(CAR_MODELS_BY_TYPE.sedan[0].brand + ' ' + CAR_MODELS_BY_TYPE.sedan[0].model);
    setLicensePlate(generateLicensePlate());
    setOwnerName('');
    setSelectedColor('#ffffff');
  };

  const handleTypeChange = (type: CarType) => {
    setCarType(type);
    const defaults = CAR_MODELS_BY_TYPE[type] || [];
    if (defaults.length > 0) {
      setBrandModel(defaults[0].brand + ' ' + defaults[0].model);
    }
  };

  // Safe manual registration submit
  const handleParkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOwner = ownerName.trim() || 'Conductor General';
    const newCar: Car = {
      id: Math.random().toString(36).substring(2, 9),
      licensePlate: licensePlate.toUpperCase() || 'S/PP',
      color: selectedColor,
      type: carType,
      brandModel: brandModel || 'Auto Genérico',
      parkedAt: new Date().toISOString(),
      ownerName: finalOwner,
      isSimulated: false,
    };
    onParkCar(space.id, newCar);
  };

  // Park random quick vehicle
  const handleQuickPark = () => {
    const randomCar = generateRandomCar(false); // marked as user activity, not automated background simulation
    onParkCar(space.id, randomCar);
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 shadow-xl border-l border-slate-100 divide-y divide-gray-100 overflow-y-auto">
      {/* Drawer Header */}
      <div className="px-6 py-5 flex items-center justify-between bg-slate-50 border-b border-gray-200/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {space.id}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">Configuración de Espacio</h3>
            <span className="text-xs font-medium text-slate-400">Fila {space.row} • Espacio N° {space.index}</span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Spot Status Banner */}
      <div className="px-6 py-4 bg-white shrink-0">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estado de Ocupación</label>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${space.status === 'occupied' ? 'bg-rose-500 animate-pulse' : (space.status === 'reserved' ? 'bg-amber-500' : 'bg-emerald-500')}`} />
            <span className="text-sm font-bold capitalize text-slate-800">
              {space.status === 'occupied' ? 'Ocupado' : (space.status === 'reserved' ? 'Reservado' : 'Disponible')}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Ángulo: {space.angle}°</span>
        </div>
      </div>

      {/* --- STANDARD SETTINGS PANEL --- */}
      <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
        
        {/* TOP SECTION: Details for occupied vs vacant */}
        <div className="space-y-6">
          
          {/* OCCUPIED VIEW */}
          {space.status === 'occupied' && space.occupiedBy ? (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 flex flex-col gap-4">
                {/* Real visual licence plate */}
                <div className="flex justify-center select-none py-1">
                  <div className="bg-slate-50 dark:bg-zinc-100 text-stone-900 border-[3px] border-stone-800 rounded-md px-5 py-2 font-mono font-black text-lg tracking-widest shadow-inner text-center flex flex-col leading-tight min-w-[170px]">
                    <div className="text-[7px] tracking-widest text-slate-500 block uppercase font-bold text-center border-b-[0.5px] border-slate-300 pb-0.5 mb-0.5">CHILE / TRANSITO</div>
                    <span>{space.occupiedBy.licensePlate}</span>
                  </div>
                </div>

                {/* Vehicle details */}
                <div className="border-t border-slate-200/60 pt-3 space-y-2.5 text-xs text-slate-600 font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Categoría:</span>
                    <span className="flex items-center gap-1 text-slate-800 capitalize bg-slate-200 px-2 py-0.5 rounded text-[11px] font-bold">
                      <CarIcon className="w-3 h-3 text-slate-600" />
                      {space.occupiedBy.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Marca/Modelo:</span>
                    <span className="text-slate-800 font-bold">{space.occupiedBy.brandModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Conductor:</span>
                    <span className="text-slate-800 inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {space.occupiedBy.ownerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Ingreso:</span>
                    <span className="text-slate-800 inline-flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(space.occupiedBy.parkedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Origen:</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${space.occupiedBy.isSimulated ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {space.occupiedBy.isSimulated ? 'Simulador Auto' : 'Usuario Manual'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Occupied Action Cards */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">Acciones Operativas</span>
                <button
                  onClick={() => onUnparkCar(space.id)}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Liberar</span>
                </button>
              </div>
            </div>
          ) : (
            /* VACANT SPACES - PARK FORM & OPTIONS */
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opciones de Espacio</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleQuickPark}
                    className="flex-1 py-2.5 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm shadow-slate-900/10 flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
                    <span>Ingreso Express</span>
                  </button>
                  {space.status === 'available' ? (
                    <button
                      onClick={() => onReserveSpace(space.id)}
                      className="flex-1 py-2.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 rounded-xl font-bold text-xs transition"
                    >
                      Reservar Spot
                    </button>
                  ) : (
                    <button
                      onClick={() => onReserveSpace(space.id)}
                      className="flex-1 py-2.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-xs transition-colors"
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>
              </div>

              {/* Form header */}
              <form onSubmit={handleParkSubmit} className="space-y-4 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registro Manual de Vehículo</span>
                
                {/* Car type select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Categoría</label>
                  <select
                    value={carType}
                    onChange={(e) => handleTypeChange(e.target.value as CarType)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition cursor-pointer font-medium"
                  >
                    <option value="sedan">Sedán (Auto Familiar)</option>
                    <option value="suv">SUV (Camioneta Rural)</option>
                    <option value="hatchback">Hatchback (Compacto Urbano)</option>
                    <option value="pickup">Pickup (Camioneta Comercial)</option>
                    <option value="sports">Deportivo (Sport Coupe)</option>
                  </select>
                </div>

                {/* Brand & Model Select list */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Marca y Modelo</label>
                  <select
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition cursor-pointer font-medium"
                  >
                    {suggestedModels.map((item, idx) => (
                      <option key={idx} value={`${item.brand} ${item.model}`}>{item.brand} {item.model}</option>
                    ))}
                    <option value="Otro Modelo">Otro (Escribir modelo manual)</option>
                  </select>
                  {brandModel === 'Otro Modelo' && (
                    <input
                      type="text"
                      placeholder="Ej. Tesla Model 3"
                      onChange={(e) => setBrandModel(e.target.value)}
                      className="w-full text-xs px-3 py-2 mt-1 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition font-semibold"
                      required
                    />
                  )}
                </div>

                {/* Plate Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Patente</label>
                      <button
                        type="button"
                        onClick={() => setLicensePlate(generateLicensePlate())}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-900 flex items-center gap-0.5"
                        title="Generar patente simulada"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Auto</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 text-center font-mono font-bold tracking-widest text-slate-800"
                      placeholder="AB-CD-12"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Propietario / Conductor</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 font-medium"
                      placeholder="Nombre completo"
                    />
                  </div>
                </div>

                {/* Color selecting */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Color de Carrocería</label>
                  <div className="flex flex-wrap gap-2.5 py-1 justify-between">
                    {PRESET_COLORS.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(color.hex)}
                        className={`w-6 h-6 rounded-full border border-gray-200 ${color.class} transition-transform focus:outline-none ${selectedColor === color.hex ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Register Manual Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <CarIcon className="w-4 h-4 text-emerald-400" />
                  <span>Estacionar Auto Manual</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* LOWER SECTION: Spot Category configurations */}
        <div className="pt-6 border-t border-gray-100 flex flex-col gap-2 mt-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 block">Configuración de Spot</span>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => onChangeSpaceType(space.id, 'standard')}
              className={`py-2 px-1 text-[10px] font-bold border rounded-lg hover:shadow-sm transition-all text-center flex flex-col items-center gap-1 ${space.type === 'standard' ? 'bg-slate-900 text-white border-slate-900 shadow-inner' : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'}`}
            >
              <CarIcon className="w-3.5 h-3.5" />
              <span>Estándar</span>
            </button>
            
            <button
              onClick={() => onChangeSpaceType(space.id, 'disabled')}
              className={`py-2 px-1 text-[10px] font-bold border rounded-lg hover:shadow-sm transition-all text-center flex flex-col items-center gap-1 ${space.type === 'disabled' ? 'bg-blue-600 text-white border-blue-600 shadow-inner' : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'}`}
            >
              <Accessibility className="w-3.5 h-3.5" />
              <span>PMR</span>
            </button>

            <button
              onClick={() => onChangeSpaceType(space.id, 'ev')}
              className={`py-2 px-1 text-[10px] font-bold border rounded-lg hover:shadow-sm transition-all text-center flex flex-col items-center gap-1 ${space.type === 'ev' ? 'bg-emerald-600 text-white border-emerald-600 shadow-inner' : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'}`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Carga EV</span>
            </button>

            <button
              onClick={() => onChangeSpaceType(space.id, 'reserved')}
              className={`py-2 px-1 text-[10px] font-bold border rounded-lg hover:shadow-sm transition-all text-center flex flex-col items-center gap-1 ${space.type === 'reserved' ? 'bg-amber-500 text-white border-amber-500 shadow-inner' : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'}`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Reservado</span>
            </button>
          </div>

          {/* Warning logic for incorrect spots */}
          {space.status === 'occupied' && space.occupiedBy && (
            (() => {
              const incorrectSpot = 
                (space.type === 'disabled' && space.occupiedBy.type === 'sports') || 
                (space.type === 'ev' && space.occupiedBy.type === 'pickup'); // simplistic heuristics
              if (incorrectSpot) {
                return (
                  <div className="mt-2.5 p-2 px-3 bg-rose-50 text-rose-700 rounded-lg flex items-start gap-1.5 text-[10px] font-medium border border-rose-100 uppercase animate-pulse leading-none">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>Alerta: ¡Infracción! Categoría de vehículo no autorizada para este spot especial.</span>
                  </div>
                );
              }
              return null;
            })()
          )}
        </div>
      </div>
    </div>
  );
}
