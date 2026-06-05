/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createInitialSpaces, calculateStats, generateRandomCar } from './data';
import { ParkingSpace, TimeOfDay, Car, ParkingSpaceType } from './types';
import Parking2D from './components/Parking2D';
import ParkingDetails from './components/ParkingDetails';
import { 
  Sun, Moon, Sunset, Play, Pause, RefreshCw, 
  Settings2, Activity, Grid2X2, Gauge, TrendingUp, 
  Sparkles, Car as CarIcon, Accessibility, Zap, 
  MapPin, CheckCircle, Info, Flame, RotateCcw
} from 'lucide-react';
import { supabase } from './supabaseClient';

interface EventLog {
  id: string;
  text: string;
  time: string;
  type: 'park' | 'unpark' | 'system' | 'type_change';
}

export default function App() {
  // --- CORE STATE ---
  const [spaces, setSpaces] = useState<ParkingSpace[]>(() => createInitialSpaces());
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<EventLog[]>([
    {
      id: 'init-1',
      text: 'Sistema de modelado e inteligencia urbana inicializado.',
      time: new Date(Date.now() - 10 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'system'
    },
    {
      id: 'init-2',
      text: 'Mapa cargado basado en el entorno provisto con filas de asfalto y áreas verdes.',
      time: new Date(Date.now() - 9 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'system'
    },
    {
      id: 'init-3',
      text: 'Simulador en stand-by. Listo para gestionar plazas especiales (PMR y Carga Eléctrica).',
      time: new Date(Date.now() - 8 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'system'
    },
  ]);

  // Compute live statistics
  const stats = calculateStats(spaces);

  // Helper to add activity feed logs
  const addLog = useCallback((text: string, type: 'park' | 'unpark' | 'system' | 'type_change') => {
    const newLog: EventLog = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // keep last 50
  }, []);

  // --- SUPABASE REALTIME SYNC ---
  useEffect(() => {
    const fetchSpaces = async () => {
      const { data } = await supabase.from('espacios').select('*');
      if (data) {
        setSpaces(prev => prev.map(s => {
          const dbSpot = data.find(d => d.id === s.id);
          if (dbSpot) {
             const statusMap: any = { 'Libre': 'available', 'Ocupado': 'occupied', 'Reservado': 'reserved' };
             return { ...s, status: statusMap[dbSpot.estado] || 'available' };
          }
          return s;
        }));
      }
    };
    fetchSpaces();

    const channel = supabase.channel('realtime-jefatura')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'espacios' }, (payload) => {
         const dbSpot = payload.new as any;
         const statusMap: any = { 'Libre': 'available', 'Ocupado': 'occupied', 'Reservado': 'reserved' };
         setSpaces(prev => prev.map(s => s.id === dbSpot.id ? { ...s, status: statusMap[dbSpot.estado] || 'available' } : s));
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- INTERACTION HANDLERS ---
  const handleSelectSpace = useCallback((space: ParkingSpace) => {
    setSelectedSpaceId(space.id);
  }, []);

  const handleParkCar = useCallback(async (spaceId: string, car: Car) => {
    // Update local immediately for UI responsiveness
    setSpaces(prevSpaces => 
      prevSpaces.map(space => {
        if (space.id === spaceId) {
          return { ...space, status: 'occupied', occupiedBy: car };
        }
        return space;
      })
    );
    addLog(`🚗 Vehículo estacionado en ${spaceId}: ${car.brandModel} [${car.licensePlate}] (${car.ownerName})`, 'park');
    // Update Supabase
    await supabase.from('espacios').update({ estado: 'Ocupado' }).eq('id', spaceId);
  }, [addLog]);

  const handleUnparkCar = useCallback(async (spaceId: string) => {
    let unparkedCarInfo = '';
    setSpaces(prevSpaces => 
      prevSpaces.map(space => {
        if (space.id === spaceId) {
          if (space.occupiedBy) {
            unparkedCarInfo = `${space.occupiedBy.brandModel} [${space.occupiedBy.licensePlate}]`;
          }
          return { ...space, status: 'available', occupiedBy: null };
        }
        return space;
      })
    );
    addLog(`💸 Vehículo egresó de la plaza ${spaceId}: ${unparkedCarInfo}`, 'unpark');
    // Update Supabase
    await supabase.from('espacios').update({ estado: 'Libre' }).eq('id', spaceId);
  }, [addLog]);

  const handleChangeSpaceType = useCallback((spaceId: string, type: ParkingSpaceType) => {
    setSpaces(prevSpaces => 
      prevSpaces.map(space => {
        if (space.id === spaceId) {
          return {
            ...space,
            type,
            status: type === 'reserved' && space.status === 'available' ? 'reserved' : (space.status === 'reserved' ? 'available' : space.status)
          };
        }
        return space;
      })
    );
    
    const typeNames: Record<ParkingSpaceType, string> = {
      standard: 'Estándar',
      disabled: 'PMR (Movilidad Reducida)',
      ev: 'Carga Eléctrica ⚡',
      reserved: 'Suscripción Reservada 🎟️'
    };
    addLog(`🔧 Categoría del espacio ${spaceId} modificada a: ${typeNames[type]}`, 'type_change');
  }, [addLog]);

  const handleReserveSpace = useCallback(async (spaceId: string) => {
    let nextStatus = 'available';
    setSpaces(prevSpaces => 
      prevSpaces.map(space => {
        if (space.id === spaceId) {
          nextStatus = space.status === 'reserved' ? 'available' : 'reserved';
          return { ...space, status: nextStatus as any };
        }
        return space;
      })
    );
    
    // Update Supabase
    await supabase.from('espacios').update({ estado: nextStatus === 'reserved' ? 'Reservado' : 'Libre' }).eq('id', spaceId);
    addLog(nextStatus === 'reserved' ? `🎟️ Espacio ${spaceId} reservado temporalmente por administración.` : `🔓 Reserva cancelada. Espacio ${spaceId} vuelto a colocar libre.`, 'system');
  }, [addLog]);

  // --- AUTOMATED BACKGROUND SIMULATION TICKER ---
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSpaces(prevSpaces => {
        // Decide what to do: 65% chance of parking a new car (if lot is under 85% capacity),
        // or 35% chance of unparking an existing car.
        const currentOccupiedCount = prevSpaces.filter(s => s.status === 'occupied').length;
        const totalCount = prevSpaces.length;
        const lotOccupancy = currentOccupiedCount / totalCount;

        const doPark = lotOccupancy < 0.85 && (lotOccupancy < 0.4 || Math.random() < 0.65);

        if (doPark) {
          // Park a car!
          const vacantSpots = prevSpaces.filter(s => s.status === 'available');
          if (vacantSpots.length === 0) return prevSpaces;

          // Select random vacant spot
          const randomSpot = vacantSpots[Math.floor(Math.random() * vacantSpots.length)];
          const generatedCar = generateRandomCar(true);

          addLog(`🤖 [Simulador] Auto ${generatedCar.brandModel} (${generatedCar.licensePlate}) se estacionó en la plaza ${randomSpot.id}.`, 'park');

          return prevSpaces.map(s => {
            if (s.id === randomSpot.id) {
              return {
                ...s,
                status: 'occupied',
                occupiedBy: generatedCar
              };
            }
            return s;
          });
        } else {
          // Unpark a car!
          const occupiedSpots = prevSpaces.filter(s => s.status === 'occupied');
          if (occupiedSpots.length === 0) return prevSpaces;

          // Select random occupied spot
          const randomSpot = occupiedSpots[Math.floor(Math.random() * occupiedSpots.length)];
          const car = randomSpot.occupiedBy;

          if (car) {
            addLog(`🤖 [Simulador] Auto ${car.brandModel} (${car.licensePlate}) egresó libremente de la plaza ${randomSpot.id}.`, 'unpark');
          }

          return prevSpaces.map(s => {
            if (s.id === randomSpot.id) {
              return {
                ...s,
                status: 'available',
                occupiedBy: null
              };
            }
            return s;
          });
        }
      });
    }, 6500); // Trigger every 6.5 seconds

    return () => clearInterval(interval);
  }, [isSimulating, addLog]);

  // --- BATCH SIMULATOR ACTIONS ---
  const handleFillParkingFull = () => {
    setSpaces(prev => 
      prev.map(space => {
        if (space.status === 'available') {
          return {
            ...space,
            status: 'occupied',
            occupiedBy: generateRandomCar(true)
          };
        }
        return space;
      })
    );
    addLog('🔥 Flujo Masivo: Se autocompletaron todos los espacios disponibles con vehículos simulados.', 'system');
  };

  const handleClearParkingFull = () => {
    setSpaces(prev => 
      prev.map(space => {
        if (space.status === 'occupied') {
          return {
            ...space,
            status: 'available',
            occupiedBy: null
          };
        }
        return space;
      })
    );
    addLog('🧹 Limpieza Masiva: Se liberaron todas las plazas ocupadas del estacionamiento.', 'system');
  };

  const handleResetSimDefaults = () => {
    setSpaces(createInitialSpaces());
    setSelectedSpaceId(null);
    addLog('🔄 Estado inicial restablecido. Plazas recreadas y vehículos sembrados.', 'system');
  };

  // Find currently selected space details
  const selectedSpace = spaces.find(s => s.id === selectedSpaceId) || null;

  // Custom colors for background gradients depending on Time of Day to reinforce immersion!
  let gradientBanner = 'from-slate-900 via-indigo-950 to-slate-900';
  let statsCardBg = 'bg-slate-950/60 border-slate-800 text-white';
  let badgeTime = 'bg-[#1e1b4b] text-indigo-300 border-indigo-900/30';
  
  if (timeOfDay === 'sunset') {
    gradientBanner = 'from-amber-950 via-rose-950 to-slate-900';
    badgeTime = 'bg-amber-950 text-amber-200 border-amber-800/30';
  } else if (timeOfDay === 'night') {
    gradientBanner = 'from-slate-950 via-slate-900 to-[#030712]';
    badgeTime = 'bg-slate-950 text-slate-400 border-slate-800';
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans antialiased text-slate-800 flex flex-col transition-colors duration-500">
      
      {/* 1. TOP PREMIUM HEADER HERO BAR */}
      <header className={`bg-gradient-to-r ${gradientBanner} text-white px-6 py-5 shadow-2xl relative border-b border-white/5 overflow-hidden transition-all duration-700`}>
        {/* Glow Ambient Decoration */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          {/* Logo & Headline */}
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20 text-slate-950 inline-block font-sans font-black tracking-tighter text-xs">
                PARKING
              </span>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 uppercase transition-all ${badgeTime}`}>
                <Activity className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                <span>Simulación Activa</span>
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white font-sans flex items-center gap-2">
              Modelador de Estacionamientos Inteligente
            </h1>
            <p className="text-xs text-slate-300 font-medium max-w-2xl mt-0.5">
              Análisis vectorial de flujo de automóviles, basado en la estructura de parque urbano y bodega industrial provista en el mapa.
            </p>
          </div>

          {/* Core Applet Controllers */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto self-stretch md:self-auto shrink-0">
            
            {/* Time of Day selectors */}
            <div className="bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10 flex gap-1">
              <button
                onClick={() => setTimeOfDay('day')}
                className={`p-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${timeOfDay === 'day' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                title="Modo Día"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Día</span>
              </button>
              <button
                onClick={() => setTimeOfDay('sunset')}
                className={`p-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${timeOfDay === 'sunset' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="Modo Atardecer"
              >
                <Sunset className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Tarde</span>
              </button>
              <button
                onClick={() => setTimeOfDay('night')}
                className={`p-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${timeOfDay === 'night' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="Modo Noche"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Noche</span>
              </button>
            </div>

            {/* Auto simulation button */}
            <button
              onClick={() => {
                setIsSimulating(!isSimulating);
                addLog(isSimulating ? '🛑 Auto-Simulador pausado.' : '🚀 Auto-Simulador activado! Spawning de automóviles periódico.', 'system');
              }}
              className={`p-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 text-center text-slate-950 shadow-md ${isSimulating ? 'bg-emerald-400 hover:bg-emerald-300 animate-pulse' : 'bg-slate-100 hover:bg-white'}`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
              <span>{isSimulating ? 'Simulando...' : 'Auto-Mover'}</span>
            </button>

          </div>
        </div>
      </header>

      {/* 2. STATS BAR CARDS Row */}
      <section className="bg-white border-b border-gray-200 py-4 px-6 relative z-10 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="p-2.5 bg-slate-200 text-slate-700 rounded-xl">
              <Grid2X2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Plazas Totales</span>
              <span className="text-base font-black text-slate-800">{stats.total}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Disponibles</span>
              <span className="text-base font-black text-emerald-600">{stats.available}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
              <CarIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Ocupados</span>
              <span className="text-base font-black text-rose-600">{stats.occupied}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3 col-span-1">
            <div className={`p-2.5 rounded-xl ${stats.occupancyRate > 80 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Ocupación %</span>
              <span className="text-base font-black text-slate-800">{stats.occupancyRate}%</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Ocupación PMR</span>
              <span className="text-sm font-black text-slate-850">{stats.disabledOccupied} / {stats.disabledTotal}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <Zap className="w-4 h-4 fill-emerald-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Estaciones EV</span>
              <span className="text-sm font-black text-slate-850">{stats.evOccupied} / {stats.evTotal}</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. MAIN AREA: LAYOUT VIEW + SIDEBAR */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-0 overflow-y-auto">
        
        {/* Left column (8 spans out of 12) containing MAP CANVASES */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[480px]">
          <Parking2D
            spaces={spaces}
            onSelectSpace={handleSelectSpace}
            selectedSpaceId={selectedSpaceId}
          />
        </div>

        {/* Right column (4 spans out of 12) containing SIDEBAR DRAWER AND STATS VIEW */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-[480px]">
          {selectedSpace ? (
            <ParkingDetails
              space={selectedSpace}
              onClose={() => setSelectedSpaceId(null)}
              onParkCar={handleParkCar}
              onUnparkCar={handleUnparkCar}
              onChangeSpaceType={(id, type) => {
                handleChangeSpaceType(id, type);
                // Make sure to refresh details bounding boxes
              }}
              onReserveSpace={handleReserveSpace}
            />
          ) : (
            /* INTRO BOARD / DEFAULT CONTROL PORTAL when no space is selected */
            <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-200/60 shadow-lg divide-y divide-gray-100 overflow-y-auto text-slate-700 uppercase leading-none">
              
              {/* Header */}
              <div className="p-6 bg-slate-50/60 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-tr from-slate-800 to-slate-900 text-white rounded-xl shadow-md">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none mb-1 uppercase">Consola de Control</h3>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide">CONFIGURACIONES MASIVAS Y SIMULACIÓN</span>
                </div>
              </div>

              {/* Quick Batch Actions */}
              <div className="p-6 space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Acciones por Lote</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleFillParkingFull}
                    className="py-3 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition hover:scale-101 flex flex-col items-center gap-1.5 text-center cursor-pointer"
                  >
                    <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span>Llenado Masivo</span>
                  </button>
                  
                  <button
                    onClick={handleClearParkingFull}
                    className="py-3 px-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 rounded-xl font-bold text-xs shadow-sm transition hover:scale-101 flex flex-col items-center gap-1.5 text-center cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-rose-500" />
                    <span>Liberar Todo</span>
                  </button>
                </div>

                <button
                  onClick={handleResetSimDefaults}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200/50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                  <span>Reestablecer Semilla Base</span>
                </button>
              </div>

              {/* Quick instructions / Help Block */}
              <div className="p-6 bg-slate-50/40 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Guía Rápida de Uso</span>
                <div className="space-y-3 text-xs text-slate-500 font-medium font-sans">
                  <div className="flex gap-2.5 items-start">
                    <div className="p-1 rounded bg-slate-200 text-slate-700 font-bold text-[10px] w-5 h-5 flex items-center justify-center shrink-0">1</div>
                    <p className="leading-tight">Haz clic en <strong>cualquier cajón de estacionamiento</strong> para registrar, liberar o categorizar plazas.</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <div className="p-1 rounded bg-slate-200 text-slate-700 font-bold text-[10px] w-5 h-5 flex items-center justify-center shrink-0">2</div>
                    <p className="leading-tight">Usa el botón <strong>&quot;Auto-Mover&quot;</strong> para simular el ingreso y salida automática del parque automotriz.</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <div className="p-1 rounded bg-slate-200 text-slate-700 font-bold text-[10px] w-5 h-5 flex items-center justify-center shrink-0">3</div>
                    <p className="leading-tight">Cambia entre Día, Tarde y Noche para ambientación lumínica de la plataforma.</p>
                  </div>
                </div>
              </div>

              {/* Logger Activity Feed */}
              <div className="flex-1 p-6 flex flex-col justify-between overflow-hidden min-h-[220px]">
                <div className="flex flex-col gap-2.5 h-full overflow-hidden">
                  <div className="flex items-center justify-between shrink-0 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actividad Reciente (Live Feed)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                  
                  {/* Event Feed list */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[10px] font-semibold text-slate-600">
                    {logs.map((log) => {
                      let tagColor = 'bg-slate-100 text-slate-500';
                      if (log.type === 'park') tagColor = 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
                      if (log.type === 'unpark') tagColor = 'bg-rose-50 text-rose-700 border-rose-100/50';
                      if (log.type === 'type_change') tagColor = 'bg-amber-55 text-amber-800 border-amber-100/50';

                      return (
                        <div 
                          key={log.id} 
                          className={`p-2 rounded-lg border border-transparent ${tagColor} transition-all duration-300 animate-slideUp flex flex-col gap-1 gap-y-0.5 leading-tight`}
                        >
                          <div className="flex items-center justify-between opacity-80">
                            <span className="font-bold text-[9px] text-slate-400 uppercase">{log.type}</span>
                            <span>{log.time}</span>
                          </div>
                          <p className="font-sans leading-snug">{log.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </main>

      {/* 4. HUB BOTTOM CAPTION CREDITS */}
      <footer className="bg-slate-900 border-t border-slate-850 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-xs">
          <p className="font-medium text-slate-450 text-center sm:text-left">
            Diseñado e implementado con React 19 • Tailwind CSS • Procedural Vector Vehicles.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            <span className="font-semibold text-slate-300">Google AI Studio • Sandbox container #F2B9</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
