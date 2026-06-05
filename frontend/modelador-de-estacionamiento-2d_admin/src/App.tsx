/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  createInitialSpaces, 
  calculateStats, 
  generateRandomCar, 
  INITIAL_FAILURES, 
  INITIAL_COMPLAINTS, 
  PEAK_HOURS_DATA 
} from './data';
import { 
  ParkingSpace, 
  TimeOfDay, 
  ViewMode, 
  Car, 
  ParkingSpaceType, 
  SystemFailure, 
  Complaint 
} from './types';
import Parking2D from './components/Parking2D';
import ParkingDetails from './components/ParkingDetails';
import { 
  Sun, Moon, Sunset, Play, Pause, RefreshCw, 
  Settings2, Activity, Grid2X2, Gauge, TrendingUp, 
  Sparkles, Car as CarIcon, Accessibility, Zap, 
  MapPin, CheckCircle, Info, Flame, RotateCcw,
  AlertTriangle, ShieldAlert, BadgeInfo, CheckCircle2,
  Wrench, ClipboardList, ShieldCheck, ServerCrash, 
  SlidersHorizontal, Radio, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

interface EventLog {
  id: string;
  text: string;
  time: string;
  type: 'park' | 'unpark' | 'system' | 'type_change' | 'audit' | 'contingencia';
}

export default function App() {
  // --- CORE STATE ---
  const [spaces, setSpaces] = useState<ParkingSpace[]>(() => {
    const rawSpaces = createInitialSpaces();
    // Seed B-8 and A-2 with sensorDesynced for administrative override demonstration
    return rawSpaces.map(s => {
      if (s.id === 'B-8' || s.id === 'A-2') {
        return { ...s, status: 'occupied', occupiedBy: s.occupiedBy || generateRandomCar(true), sensorDesynced: true };
      }
      return s;
    });
  });
  
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [viewMode, setViewMode] = useState<ViewMode>('live'); 
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Real-time Flow Counter (entered / exited vehicles in this session)
  const [flowCounters, setFlowCounters] = useState({ entered: 47, exited: 29 });

  // Interactive Admin Datasets
  const [failures, setFailures] = useState<SystemFailure[]>(() => INITIAL_FAILURES);
  const [complaints, setComplaints] = useState<Complaint[]>(() => INITIAL_COMPLAINTS);

  // Overcapacity mitigations
  const [extraCapacityEnabled, setExtraCapacityEnabled] = useState(false);
  const [valetParkingEnabled, setValetParkingEnabled] = useState(false);
  const [blockNewEntries, setBlockNewEntries] = useState(false);

  // System general logs
  const [logs, setLogs] = useState<EventLog[]>([
    {
      id: 'init-1',
      text: 'Sistema de modelado y analítica admin urbana inicializado.',
      time: new Date(Date.now() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'system'
    },
    {
      id: 'init-2',
      text: 'Sistemas de redundancia de sensores inductivos activos en fila A, B, C y D.',
      time: new Date(Date.now() - 12 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'audit'
    },
    {
      id: 'init-3',
      text: 'Vigilancia de desincronización activada. Encontradas divergencias menores de sensores en B-8.',
      time: new Date(Date.now() - 10 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'audit'
    },
  ]);

  // Handle activity feed logs
  const addLog = useCallback((text: string, type: 'park' | 'unpark' | 'system' | 'type_change' | 'audit' | 'contingencia') => {
    const newLog: EventLog = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); 
  }, []);

  // Compute live statistics and adjust with active overcapacity mitigations
  const stats = useMemo(() => {
    const calculated = calculateStats(spaces);
    const overflowAddition = extraCapacityEnabled ? 10 : 0;
    const valetAddition = valetParkingEnabled ? 5 : 0;
    const bonusCapacity = overflowAddition + valetAddition;

    const modifiedTotal = calculated.total + bonusCapacity;
    const modifiedAvailable = calculated.available + bonusCapacity;
    const occupancyRate = modifiedTotal > 0 ? Math.round((calculated.occupied / modifiedTotal) * 100) : 0;

    return {
      ...calculated,
      total: modifiedTotal,
      available: modifiedAvailable,
      occupancyRate,
    };
  }, [spaces, extraCapacityEnabled, valetParkingEnabled]);

  // Compute live system health score
  const systemHealth = useMemo(() => {
    const pendingCount = complaints.filter(c => c.status === 'pendiente').length;
    const activeFailuresCount = failures.filter(f => f.status === 'activo').length;
    let score = 100 - (activeFailuresCount * 12) - (pendingCount * 5);
    return Math.max(10, Math.min(100, score));
  }, [failures, complaints]);

  // Find desynced sensors count
  const desyncedCount = useMemo(() => {
    return spaces.filter(s => s.sensorDesynced).length;
  }, [spaces]);

  // Find currently selected space details
  const selectedSpace = useMemo(() => {
    return spaces.find(s => s.id === selectedSpaceId) || null;
  }, [spaces, selectedSpaceId]);


  // --- INTERACTION HANDLERS ---
  const handleSelectSpace = useCallback((space: ParkingSpace) => {
    setSelectedSpaceId(space.id);
  }, []);

  const handleParkCar = useCallback((spaceId: string, car: Car) => {
    if (blockNewEntries) {
      addLog(`❌ Rechazo de ingreso: El acceso principal está cerrado por sobrecupo. No se puede estacionar en ${spaceId}`, 'system');
      return;
    }

    setSpaces(prevSpaces => 
      prevSpaces.map(space => {
        if (space.id === spaceId) {
          return {
            ...space,
            status: 'occupied',
            occupiedBy: car,
            sensorDesynced: false, // cleared
          };
        }
        return space;
      })
    );
    setFlowCounters(f => ({ ...f, entered: f.entered + 1 }));
    addLog(`🚗 Vehículo estacionado en ${spaceId}: ${car.brandModel} [${car.licensePlate}] (${car.ownerName})`, 'park');
  }, [addLog, blockNewEntries]);

  // Modified Unpark (NO payments, direct unmarking)
  const handleUnparkCar = useCallback((spaceId: string, overrideReason?: 'standard' | 'sensor_desync') => {
    let unparkedCarInfo = '';
    setSpaces(prevSpaces => 
      prevSpaces.map(space => {
        if (space.id === spaceId) {
          if (space.occupiedBy) {
            unparkedCarInfo = `${space.occupiedBy.brandModel} [${space.occupiedBy.licensePlate}]`;
          }
          return {
            ...space,
            status: 'available',
            occupiedBy: null,
            sensorDesynced: false, // cleared
          };
        }
        return space;
      })
    );
    
    setFlowCounters(f => ({ ...f, exited: f.exited + 1 }));

    if (overrideReason === 'sensor_desync') {
      addLog(`🔄 Forzado de sincronización en plaza ${spaceId}. Sensor corregido manualmente. Vehículo liberado: ${unparkedCarInfo}`, 'audit');
      // If there was a complaint about this space, auto resolve it!
      setComplaints(prev => 
        prev.map(c => c.spaceId === spaceId ? { ...c, status: 'resuelto' } : c)
      );
    } else {
      addLog(`💸 Egreso estándar de vehículo de la plaza ${spaceId}: ${unparkedCarInfo}`, 'unpark');
    }
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

  const handleReserveSpace = useCallback((spaceId: string) => {
    setSpaces(prevSpaces => 
      prevSpaces.map(space => {
        if (space.id === spaceId) {
          const nextStatus = space.status === 'reserved' ? 'available' : 'reserved';
          return {
            ...space,
            status: nextStatus,
          };
        }
        return space;
      })
    );
    const space = spaces.find(s => s.id === spaceId);
    if (space) {
      const isReserving = space.status !== 'reserved';
      addLog(isReserving ? `🎟️ Espacio ${spaceId} bloqueado/reservado por administración.` : `🔓 Reserva cancelada. Espacio ${spaceId} liberado.`, 'system');
    }
  }, [spaces, addLog]);

  // --- AUTOMATED BACKGROUND SIMULATION TICKER ---
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSpaces(prevSpaces => {
        // Decide what to do: park or unpark
        const currentOccupiedCount = prevSpaces.filter(s => s.status === 'occupied').length;
        const totalCount = prevSpaces.length;
        const lotOccupancy = currentOccupiedCount / totalCount;

        const doPark = lotOccupancy < 0.85 && (lotOccupancy < 0.4 || Math.random() < 0.65);

        if (doPark) {
          if (blockNewEntries) {
            return prevSpaces; // entries blocked
          }

          const vacantSpots = prevSpaces.filter(s => s.status === 'available');
          if (vacantSpots.length === 0) return prevSpaces;

          const randomSpot = vacantSpots[Math.floor(Math.random() * vacantSpots.length)];
          const generatedCar = generateRandomCar(true);
          
          setFlowCounters(f => ({ ...f, entered: f.entered + 1 }));
          
          // 5% chance the simulator creates a new "sensor out-of-sync" risk for demonstration later
          const isStuck = Math.random() < 0.08;

          if (isStuck) {
            addLog(`⚠️ [DIVERGENCIA] Vehículo ${generatedCar.brandModel} estacionado en ${randomSpot.id} no gatilló correctamente el receptor inalámbrico de piso.`, 'audit');
          } else {
            addLog(`🤖 [Simulador] Auto ${generatedCar.brandModel} (${generatedCar.licensePlate}) se estacionó en la plaza ${randomSpot.id}.`, 'park');
          }

          return prevSpaces.map(s => {
            if (s.id === randomSpot.id) {
              return {
                ...s,
                status: 'occupied',
                occupiedBy: generatedCar,
                sensorDesynced: isStuck
              };
            }
            return s;
          });
        } else {
          // Unpark a car
          const occupiedSpots = prevSpaces.filter(s => s.status === 'occupied');
          if (occupiedSpots.length === 0) return prevSpaces;

          const randomSpot = occupiedSpots[Math.floor(Math.random() * occupiedSpots.length)];
          const car = randomSpot.occupiedBy;

          if (car) {
            // Simulate the desync problem: "un auto hizo la salida pero el sistema no se actualizo"
            // We set space to vacant, but 10% chance it doesn't update (sensorDesynced state remains true but space occupiedBy is kept!)
            const failsToUpdate = Math.random() < 0.12;

            if (failsToUpdate) {
              addLog(`⚠️ [SENSOR STUCK] El vehículo ${car.brandModel} (${car.licensePlate}) se retiró de la plaza ${randomSpot.id} pero el loop inductivo quedó trabado en ON.`, 'audit');
              setFlowCounters(f => ({ ...f, exited: f.exited + 1 }));
              return prevSpaces.map(s => {
                if (s.id === randomSpot.id) {
                  return {
                    ...s,
                    sensorDesynced: true // flagged as stuck / desynced
                  };
                }
                return s;
              });
            } else {
              addLog(`🤖 [Simulador] Auto ${car.brandModel} (${car.licensePlate}) egresó libremente de la plaza ${randomSpot.id}.`, 'unpark');
              setFlowCounters(f => ({ ...f, exited: f.exited + 1 }));
              return prevSpaces.map(s => {
                if (s.id === randomSpot.id) {
                  return {
                    ...s,
                    status: 'available',
                    occupiedBy: null,
                    sensorDesynced: false
                  };
                }
                return s;
              });
            }
          }
          return prevSpaces;
        }
      });
    }, 5500); // 5.5s interval to make simulation lively

    return () => clearInterval(interval);
  }, [isSimulating, addLog, blockNewEntries]);


  // --- ADMIN MASSIVE PROCEDURES ---
  const handleSolveAllDesync = () => {
    let fixedCount = 0;
    setSpaces(prev => 
      prev.map(space => {
        if (space.sensorDesynced) {
          fixedCount++;
          return {
            ...space,
            status: 'available',
            occupiedBy: null,
            sensorDesynced: false
          };
        }
        return space;
      })
    );
    if (fixedCount > 0) {
      addLog(`🧹 Auditoría General: Se forzó la sincronización de ${fixedCount} sensores trabados. Todas las plazas concuerdan físicamente.`, 'audit');
    } else {
      addLog(`✨ Auditoría General: Sensores limpios, no se encontraron discrepancias físicas activas.`, 'audit');
    }
  };

  const handleClearParkingFull = () => {
    setSpaces(prev => 
      prev.map(space => {
        if (space.status === 'occupied') {
          return {
            ...space,
            status: 'available',
            occupiedBy: null,
            sensorDesynced: false
          };
        }
        return space;
      })
    );
    addLog('🧹 Comando Admin: Se liberó la totalidad de espacios activos.', 'system');
  };

  const handleResetSimDefaults = () => {
    const rawSpaces = createInitialSpaces();
    // Re-seed two desynced for demo
    const seeded = rawSpaces.map(s => {
      if (s.id === 'B-8' || s.id === 'A-2') {
        return { ...s, status: 'occupied', occupiedBy: s.occupiedBy || generateRandomCar(true), sensorDesynced: true };
      }
      return s;
    });
    setSpaces(seeded);
    setFailures(INITIAL_FAILURES);
    setComplaints(INITIAL_COMPLAINTS);
    setSelectedSpaceId(null);
    setFlowCounters({ entered: 47, exited: 29 });
    addLog('🔄 Parámetros del mapa y sensores restablecidos a valores de fábrica.', 'system');
  };

  // Interact with Failures dataset
  const handleResolveFailure = (id: string) => {
    setFailures(prev => 
      prev.map(f => f.id === id ? { ...f, status: 'resuelto' as const } : f)
    );
    const item = failures.find(f => f.id === id);
    addLog(`🔧 Soporte de Red: Módulo ${item?.component || id} reparado y reconectado con éxito.`, 'system');
  };

  // Interact with Complaints dataset
  const handleResolveComplaint = (id: string) => {
    setComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, status: 'resuelto' as const } : c)
    );
    const item = complaints.find(c => c.id === id);
    addLog(`✅ Reclamo Cerrado: Solucionado caso de ${item?.user || id}: "${item?.category.toUpperCase()}"`, 'system');
  };


  // --- COLOR GRADIENTS FOR DESIGN IMMERSION ---
  let gradientBanner = 'from-slate-900 via-zinc-950 to-slate-950';
  let badgeTime = 'bg-slate-950 text-emerald-400 border-zinc-800';
  
  if (timeOfDay === 'sunset') {
    gradientBanner = 'from-amber-950 via-neutral-900 to-stone-950';
    badgeTime = 'bg-[#1e1b4b] text-orange-300 border-orange-950/40';
  } else if (timeOfDay === 'night') {
    gradientBanner = 'from-zinc-950 via-slate-950 to-black';
    badgeTime = 'bg-black text-blue-400 border-blue-900';
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans antialiased text-slate-800 flex flex-col transition-colors duration-500">
      
      {/* 1. TOP PREMIUM HEADER HERO BAR */}
      <header className={`bg-gradient-to-r ${gradientBanner} text-white px-6 py-4.5 shadow-2xl relative border-b border-white/5 overflow-hidden transition-all duration-700`}>
        {/* Glow Ambient Decoration */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          
          {/* Logo & Headline */}
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-1 px-2.5 bg-gradient-to-tr from-[#06b6d5] to-[#3b82f6] rounded-lg shadow-lg text-slate-950 inline-block font-sans font-black tracking-wider text-[10px]">
                LIVE ADMIN CONSOLE
              </span>
              <div className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 uppercase transition-all ${badgeTime}`}>
                <Activity className="w-2.5 h-2.5 animate-pulse" />
                <span>Salud del Sistema: {systemHealth}%</span>
              </div>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white font-sans flex items-center gap-2">
              Consola Operativa y Modelador de Estacionamiento 2D
            </h1>
            <p className="text-xs text-slate-350 font-medium max-w-2xl mt-0.5">
              Panel de administración de flujos vehiculares, incidencias físicas de sensores, soluciones por sobrecupo y reclamos.
            </p>
          </div>

          {/* Core Applet Controllers */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto self-stretch md:self-auto shrink-0">
            
            {/* View Mode Tabs (Admin Mode Only) */}
            <div className="bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10 flex gap-0.5">
              <button
                onClick={() => setViewMode('live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'live' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                <span>Control Directo Map</span>
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'analytics' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Métricas / Peaks</span>
              </button>
              <button
                onClick={() => setViewMode('incidents')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'incidents' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span className="relative">
                  Incidencias / Soporte
                  {(desyncedCount > 0 || complaints.filter(c => c.status === 'pendiente').length > 0 || failures.filter(f => f.status === 'activo').length > 0) && (
                    <span className="absolute -top-1.5 -right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </span>
              </button>
            </div>

            {/* Ambient Time of Day selector */}
            <div className="bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10 flex gap-0.5">
              <button
                onClick={() => setTimeOfDay('day')}
                className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${timeOfDay === 'day' ? 'bg-amber-450 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                title="Modo Día"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTimeOfDay('sunset')}
                className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${timeOfDay === 'sunset' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="Modo Atardecer"
              >
                <Sunset className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTimeOfDay('night')}
                className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${timeOfDay === 'night' ? 'bg-indigo-650 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="Modo Noche"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sim Switcher */}
            <button
              onClick={() => {
                setIsSimulating(!isSimulating);
                addLog(isSimulating ? '🛑 Simulación de tráfico en vivo detenida.' : '⚡ Simulación de tráfico en vivo activada. Spawning dinámico...', 'system');
              }}
              className={`p-2 px-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 text-center text-slate-950 shadow-md cursor-pointer ${isSimulating ? 'bg-emerald-400 hover:bg-emerald-300 animate-pulse' : 'bg-slate-100 hover:bg-white'}`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
              <span>{isSimulating ? 'Simulación ON' : 'Activar Sim.'}</span>
            </button>

          </div>
        </div>
      </header>

      {/* 2. STATS BAR CARDS Row */}
      <section className="bg-white border-b border-gray-200 py-3.5 px-6 relative z-10 shrink-0 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-150 flex items-center gap-3">
            <div className="p-2.5 bg-slate-200 text-slate-700 rounded-xl">
              <Grid2X2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Clasificadas</span>
              <span className="text-base font-black text-slate-800">{stats.total} spots</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-150 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stats.occupancyRate > 90 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Libres Físicas</span>
              <span className={`text-base font-black ${stats.available === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {stats.available} lib
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-150 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <Gauge className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Ocupación total</span>
              <span className="text-base font-black text-slate-850">{stats.occupancyRate}%</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-150 flex items-center gap-3 col-span-1">
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
              <ServerCrash className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Fallas de Sensor</span>
              <span className={`text-base font-black ${desyncedCount > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-450'}`}>
                {desyncedCount} Alertas
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-150 flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <Accessibility className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Área PMR</span>
              <span className="text-sm font-black text-slate-800">{stats.disabledOccupied} / {stats.disabledTotal}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-gray-150 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <Zap className="w-4.5 h-4.5 fill-emerald-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase leading-tight">Termo EV Carga</span>
              <span className="text-sm font-black text-slate-800">{stats.evOccupied} / {stats.evTotal}</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. MAIN CONTENTS AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 min-h-0 overflow-y-auto">
        
        {/* TAB 1: LIVE MAP CONTROL VIEW */}
        {viewMode === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full">
            
            {/* Live 2D Map (Left 8 Columns) */}
            <div className="lg:col-span-8 flex flex-col h-full min-h-[480px]">
              <Parking2D
                spaces={spaces}
                onSelectSpace={handleSelectSpace}
                selectedSpaceId={selectedSpaceId}
              />
            </div>

            {/* Operations Desk Controls (Right 4 Columns) */}
            <div className="lg:col-span-4 flex flex-col h-full min-h-[480px]">
              {selectedSpace ? (
                <ParkingDetails
                  space={selectedSpace}
                  onClose={() => setSelectedSpaceId(null)}
                  onParkCar={handleParkCar}
                  onUnparkCar={handleUnparkCar}
                  onChangeSpaceType={handleChangeSpaceType}
                  onReserveSpace={handleReserveSpace}
                />
              ) : (
                /* DESKTOP DESK GENERAL CONTROL */
                <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-200/60 shadow-lg divide-y divide-gray-100 overflow-y-auto text-slate-700 leading-none">
                  
                  {/* Console Header */}
                  <div className="p-5 bg-slate-50 border-b border-gray-200 flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-white rounded-xl">
                      <Settings2 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 leading-none mb-1 uppercase tracking-wider">Mesa de Operación</h3>
                      <span className="text-[10px] text-slate-400 font-bold tracking-wide">ESTACIONAMIENTO GENERAL</span>
                    </div>
                  </div>

                  {/* Quick Sensor Discrepancy Warnings */}
                  {desyncedCount > 0 && (
                    <div className="p-4.5 bg-amber-50 text-amber-900 m-2 rounded-2xl border border-amber-200 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
                        <span className="text-[11px] font-black uppercase tracking-wide">Divergencias en Sensor Lectura</span>
                      </div>
                      <p className="text-[10px] text-amber-700 leading-normal font-medium">
                        Se detectaron {desyncedCount} sensores inductivos trabados (el auto ya egresó físicamente pero no se actualizó el mapa).
                      </p>
                      <button
                        onClick={handleSolveAllDesync}
                        className="py-1.5 px-3 bg-amber-705 text-white font-bold text-[10px] uppercase rounded-lg shadow-sm hover:bg-amber-800 transition cursor-pointer self-start"
                      >
                        Sincronizar Todos ({desyncedCount})
                      </button>
                    </div>
                  )}

                  {/* Overcapacity quick warnings */}
                  {stats.occupancyRate > 90 && (
                    <div className="p-4.5 bg-rose-50 text-rose-900 m-2 rounded-2xl border border-rose-100 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="text-[11px] uppercase font-black">Límite Crítico de Capacidad!</span>
                      </div>
                      <p className="text-[10px] text-rose-700 font-medium leading-normal">
                        Ocupación global supera {stats.occupancyRate}%. Por favor, vaya a la pestaña <strong>&quot;Incidencias / Soporte&quot;</strong> para habilitar las soluciones por sobrecupo urgentes.
                      </p>
                      <button
                        onClick={() => setViewMode('incidents')}
                        className="py-1.5 px-3 bg-rose-600 text-white font-bold text-[10px] uppercase rounded-lg shadow-sm hover:bg-rose-700 transition cursor-pointer self-start"
                      >
                        Mitigar Sobrecupo
                      </button>
                    </div>
                  )}

                  {/* Manual Sim Seeds Operations */}
                  <div className="p-5 space-y-3.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Operaciones Sistémicas</span>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={handleClearParkingFull}
                        className="py-2.5 bg-slate-100 hover:bg-slate-200 border border-gray-200 text-slate-700 rounded-xl font-bold text-[11px] transition cursor-pointer text-center-all flex justify-center items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Vaciar Todo</span>
                      </button>
                      <button
                        onClick={handleResetSimDefaults}
                        className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[11px] transition cursor-pointer text-center-all flex justify-center items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Reiniciar Base</span>
                      </button>
                    </div>
                  </div>

                  {/* Flow rates info */}
                  <div className="p-5 space-y-3 font-sans">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sesión Flujos en Vivo</span>
                    <div className="grid grid-cols-2 gap-3.5 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-gray-150 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">INGRESOS DE HOY</span>
                          <span className="text-sm font-black text-slate-800">{flowCounters.entered}</span>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-gray-150 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">EGRESOS DE HOY</span>
                          <span className="text-sm font-black text-slate-800">{flowCounters.exited}</span>
                        </div>
                        <ArrowDownLeft className="w-5 h-5 text-indigo-500" />
                      </div>
                    </div>
                  </div>

                  {/* Guide Instructions / Help Block */}
                  <div className="p-5 bg-slate-50/40 space-y-2.5 flex-1 flex flex-col justify-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Guías del Operador</span>
                    <div className="space-y-2 text-[11px] text-slate-500 font-medium font-sans">
                      <div className="flex gap-2 items-start leading-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1"></span>
                        <p>Los autos estacionados tienen colores basados en el vehículo real detectado por la IA de la cámara.</p>
                      </div>
                      <div className="flex gap-2 items-start leading-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1"></span>
                        <p>Plazas azules son para <strong>PMR</strong>. Plazas verdes disponen de <strong>Postes de Carga Rápida EV</strong>.</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: ANALYTICS & PEAK HOURS METRICS DESIGN */}
        {viewMode === 'analytics' && (
          <div className="space-y-6 animate-fadeIn select-none">
            
            {/* Upper stats row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-md">
                <span className="text-[10px] font-black text-slate-405 block uppercase leading-snug tracking-wider">Ocupación Promedio Diario</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900">78.4%</span>
                  <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    +4.2%
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Frente al mismo período anterior</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-md">
                <span className="text-[10px] font-black text-slate-405 block uppercase leading-snug tracking-wider">Estadía Promedio Fila A/B</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900">114 min</span>
                  <span className="text-xs text-rose-500 font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    +12 min
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Alta rotación en asfalto</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-md">
                <span className="text-[10px] font-black text-slate-405 block uppercase leading-snug tracking-wider">Uso Electrocarga EV</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-emerald-600">89.1%</span>
                  <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                    <CheckCircle className="w-3.5 h-3.5 inline text-emerald-500" />
                    Servic. Completo
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Cargadores operando a 22 kW</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-md">
                <span className="text-[10px] font-black text-slate-405 block uppercase leading-snug tracking-wider">Flujo Total Desplazamientos</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-indigo-600">{flowCounters.entered + flowCounters.exited} movs</span>
                  <span className="text-[10px] font-bold text-slate-400">Hoy acumulado</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Ingresos: {flowCounters.entered} | Egresos: {flowCounters.exited}</span>
              </div>
            </div>

            {/* PEAK HOURS GRAPH CARD (Using visual Tailwind custom SVG bar graphs for perfect render reliability) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/65 shadow-lg">
              
              <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-2.5 pb-4.5 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">Monitoreo de Horas Peak (Peak Hours)</h3>
                  <p className="text-xs text-slate-500">Mapeo del porcentaje de ocupación histórica de spots a lo largo de la jornada.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-sm bg-indigo-600"></span>
                    <span>% Ocupación</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-sm bg-rose-500"></span>
                    <span>Horas Flujo Crítico (Peak)</span>
                  </div>
                </div>
              </div>

              {/* Peak hours Visual Chart Grid */}
              <div className="pt-6">
                
                {/* Visual grid layout for bars */}
                <div className="grid grid-cols-5 sm:grid-cols-15 gap-2 items-end h-[220px] px-2 border-b border-gray-200 pb-1.5">
                  {PEAK_HOURS_DATA.map((item, idx) => {
                    const isPeak = item.occupancy >= 88;
                    const barHeight = `${item.occupancy}%`;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                        
                        {/* Hover Tooltip Overlay */}
                        <div className="opacity-0 group-hover:opacity-100 absolute bg-slate-900 text-white text-[9px] p-2 rounded-lg -translate-y-[210px] transition pointer-events-none text-center shadow-lg border border-slate-700 min-w-[70px]">
                          <strong>{item.hour}</strong>
                          <div className="text-cyan-400">Ocup.: {item.occupancy}%</div>
                          <div className="text-slate-300">In: {item.flowIn} / Out: {item.flowOut}</div>
                        </div>

                        {/* Bar Segment */}
                        <div className="w-full flex justify-center items-end h-full">
                          <div 
                            style={{ height: barHeight }}
                            className={`w-4 sm:w-6.5 rounded-t-lg transition-all duration-500 group-hover:opacity-90 ${isPeak ? 'bg-gradient-to-t from-red-600 to-rose-500 shadow-lg shadow-rose-500/20' : 'bg-gradient-to-t from-indigo-700 to-purple-500'}`}
                          />
                        </div>

                        {/* Label */}
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-800 font-mono transition">
                          {item.hour.split(':')[0]}h
                        </span>

                      </div>
                    );
                  })}
                </div>

                {/* Legend caption */}
                <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl flex items-start gap-2.5 text-xs text-slate-500 border border-gray-150 leading-relaxed font-sans">
                  <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Análisis del flujo:</strong> El período de almuerzo corporativo <strong>(13:00)</strong> y la salida laboral <strong>(18:00)</strong> comprenden las franjas de carga máxima. Con la simulación activa, el motor de inteligencia urbana redistribuye dinámicamente las plazas temporales en caso de congestión externa detectada.
                  </p>
                </div>

              </div>

            </div>

            {/* FLOW ANALYTICS / CATEGORY MIX */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left card: Vehicle mix */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-md">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Distribución de Tipajes</h4>
                
                <div className="space-y-3 font-sans">
                  {/* Sedan percentage */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Sedán (Familiar)</span>
                      <span>35%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-650 h-full rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  {/* SUV percentage */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>SUV (Camionetas)</span>
                      <span>35%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  {/* Hatchback percentage */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Hatchback (Urbano)</span>
                      <span>20%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-550 h-full rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  {/* Others percentage */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Otros (Pickup / Deportivos)</span>
                      <span>10%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right card: Active spots analytics */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-md">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Mapeo de Clasificación de Capacidad</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-gray-150">
                    <span className="text-[10px] text-slate-400 font-bold block">PMR (MOVILIDAD REDUCIDA)</span>
                    <span className="text-xl font-bold text-slate-800">{stats.disabledOccupied} / {stats.disabledTotal} ocupados</span>
                    <p className="text-[9px] text-slate-450 mt-1">Índice de saturación: {Math.round((stats.disabledOccupied / (stats.disabledTotal || 1)) * 100)}%</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-gray-150">
                    <span className="text-[10px] text-slate-400 font-bold block">CARGADORES DE BATERÍA EV</span>
                    <span className="text-xl font-bold text-slate-800">{stats.evOccupied} / {stats.evTotal} ocupados</span>
                    <p className="text-[9px] text-slate-450 mt-1">Estaciones de servicio rápido 22kW</p>
                  </div>
                </div>

                {/* Live notice */}
                <div className="mt-4 p-3 bg-indigo-50 border border-indigo-150 rounded-xl flex items-center gap-2">
                  <Radio className="w-4.5 h-4.5 text-indigo-600 animate-pulse shrink-0" />
                  <span className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider">Lectura actual directa de los microprocesadores de piso activada</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: RESOLUTION & INCIDENTS & OVERFLOW */}
        {viewMode === 'incidents' && (
          <div className="space-y-6 animate-fadeIn font-sans">
            
            {/* Upper grid: Overcapacity solutions & counting discrepancies */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column (8/12) - Solutions & Discrepancies */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* OVERCAPACITY MITIGATION SECTOR */}
                <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-md">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                    <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase">Soluciones Operativas por Sobre Cupo</h3>
                      <p className="text-xs text-slate-500">Active medidas de mitigación urgente cuando se alcance un overcapacity crítico.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    
                    {/* Contingency overflows (+10 spots) */}
                    <div className={`p-4 rounded-2xl border transition-all ${extraCapacityEnabled ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300' : 'bg-slate-50/70 border-gray-200 hover:bg-slate-100'}`}>
                      <div className="flex justify-between items-start">
                        <span className="p-1.5 bg-indigo-100 active:bg-indigo-200 text-indigo-700 rounded-lg">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="extra-cap-chk" 
                            checked={extraCapacityEnabled}
                            onChange={(e) => {
                              setExtraCapacityEnabled(e.target.checked);
                              addLog(e.target.checked ? '🚀 CONTINGENCIA: Callejón Norte habilitado para estacionamiento de desborde (+10 plazas).' : '🧹 CONTINGENCIA: Desborde Norte clausurado. Capacidad normal restablecida.', 'contingencia');
                            }}
                            className="w-4.5 h-4.5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-3">Zona de Desborde Norte</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1.5 font-medium">
                        Habilita una calle auxiliar para añadir <strong>+10 plazas</strong> de contención al parque vehicular general.
                      </p>
                      <div className="mt-3.5 flex items-center justify-between text-[10px] font-bold">
                        <span className="text-indigo-600">APLICACIÓN INMEDIATA</span>
                        <span className={extraCapacityEnabled ? 'text-emerald-600' : 'text-slate-400'}>{extraCapacityEnabled ? 'ACTIVO (+10)' : 'INACTIVO'}</span>
                      </div>
                    </div>

                    {/* Valet double row parking (+5 spots) */}
                    <div className={`p-4 rounded-2xl border transition-all ${valetParkingEnabled ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300' : 'bg-slate-50/70 border-gray-200 hover:bg-slate-100'}`}>
                      <div className="flex justify-between items-start">
                        <span className="p-1.5 bg-indigo-100 active:bg-indigo-200 text-indigo-700 rounded-lg">
                          <CarIcon className="w-4 h-4" />
                        </span>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="valet-parking-chk" 
                            checked={valetParkingEnabled}
                            onChange={(e) => {
                              setValetParkingEnabled(e.target.checked);
                              addLog(e.target.checked ? '🚀 CONTINGENCIA: Valet estibador de doble fila habilitado en Fila B (+5 plazas compactas).' : '🧹 CONTINGENCIA: Operativo Valet finalizado.', 'contingencia');
                            }}
                            className="w-4.5 h-4.5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-3">Valet Dobre Fila (Contingencia)</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1.5 font-medium">
                        Personal de valet administra el bloqueo de asfalto agregando <strong>+5 espacios</strong> en asfalto interior.
                      </p>
                      <div className="mt-3.5 flex items-center justify-between text-[10px] font-bold">
                        <span className="text-indigo-600">ADMINISTRACIÓN MANUAL</span>
                        <span className={valetParkingEnabled ? 'text-emerald-600' : 'text-slate-400'}>{valetParkingEnabled ? 'ACTIVO (+5)' : 'INACTIVO'}</span>
                      </div>
                    </div>

                    {/* Lock principal access gate */}
                    <div className={`p-4 rounded-2xl border transition-all ${blockNewEntries ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-300' : 'bg-slate-50/70 border-gray-200 hover:bg-slate-100'}`}>
                      <div className="flex justify-between items-start">
                        <span className={`p-1.5 rounded-lg ${blockNewEntries ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                          <ServerCrash className="w-4 h-4" />
                        </span>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="gate-lock-chk" 
                            checked={blockNewEntries}
                            onChange={(e) => {
                              setBlockNewEntries(e.target.checked);
                              addLog(e.target.checked ? '🛑 OPERACIONES URBANA: Barrera de acceso principal bloqueada. Se prohíbe el paso de más autos.' : '🔓 OPERACIONES URBANA: Acceso principal liberado. Barreras abiertas.', 'contingencia');
                            }}
                            className="w-4.5 h-4.5 text-red-600 rounded focus:ring-rose-500 cursor-pointer"
                          />
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-3">Cierre Total de Accesos</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1.5 font-medium">
                        Bloquea inmediatamente la entrada de vehículos automatizados para evitar colapso de vías centralizadas.
                      </p>
                      <div className="mt-3.5 flex items-center justify-between text-[10px] font-bold">
                        <span className="text-rose-700 font-bold">CONTROL CRÍTICO</span>
                        <span className={blockNewEntries ? 'text-red-600 font-black' : 'text-slate-400'}>{blockNewEntries ? 'BARRERA CERRADA' : 'HABILITADO'}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SENSOR DISCREPANCY OVERRIDES ("Un auto hizo la salida pero el sistema no se actualizo") */}
                <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-md">
                  <div className="flex justify-between items-baseline pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Radio className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase">Fallas de Sincronización y Retraso de Loop</h3>
                        <p className="text-xs text-slate-500">Alineación de base de datos SQL con la presencia real de asfalto.</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSolveAllDesync}
                      className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-[10px] uppercase rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sincronizar Todo en Vivo</span>
                    </button>
                  </div>

                  {/* List of currently occupied spots at risk of out-of-sync */}
                  <div className="space-y-3 pt-4 select-none">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Spots Reportados (Divergencia entre Sensor físico e Historial)</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                      
                      {/* B-8 Simulated Out Of Sync */}
                      {spaces.find(s => s.id === 'B-8')?.sensorDesynced ? (
                        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-inner flex flex-col justify-between gap-3 animate-pulse">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-black text-slate-905 block">Plaza B-8</span>
                              <p className="text-[10px] text-amber-700 leading-normal mt-1 font-medium">
                                El cliente Valentina Gallardo reportó egreso hace 15 min, pero la presencia de asfalto acusa &quot;OCUPADO&quot;.
                              </p>
                            </div>
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-200/50 p-1 rounded border border-amber-300">⚠️ DESALINEADO</span>
                          </div>
                          <button
                            onClick={() => handleUnparkCar('B-8', 'sensor_desync')}
                            className="py-1.5 bg-amber-600 hover:bg-amber-750 text-white font-bold text-[10px] uppercase rounded-xl transition cursor-pointer self-start px-4 shadow-sm"
                          >
                            Forzar Salida (Sincronizar)
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-gray-150 flex items-center justify-center text-center font-bold text-slate-400 py-8 text-[11px] font-sans">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 mr-1.5" />
                          <span>Fila B-8 Concordancia OK</span>
                        </div>
                      )}

                      {/* A-2 Simulated Out Of Sync */}
                      {spaces.find(s => s.id === 'A-2')?.sensorDesynced ? (
                        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-inner flex flex-col justify-between gap-3 animate-pulse">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-black text-slate-905 block">Plaza A-2</span>
                              <p className="text-[10px] text-amber-700 leading-normal mt-1 font-medium">
                                Divergencia inductiva: Presión ausente, lector de patentes registró salida pero no descontó en mapa.
                              </p>
                            </div>
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-200/50 p-1 rounded border border-amber-300">⚠️ DESALINEADO</span>
                          </div>
                          <button
                            onClick={() => handleUnparkCar('A-2', 'sensor_desync')}
                            className="py-1.5 bg-amber-600 hover:bg-amber-750 text-white font-bold text-[10px] uppercase rounded-xl transition cursor-pointer self-start px-4 shadow-sm"
                          >
                            Forzar Salida (Sincronizar)
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-gray-150 flex items-center justify-center text-center font-bold text-slate-400 py-8 text-[11px] font-sans">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 mr-1.5" />
                          <span>Fila A-2 Concordancia OK</span>
                        </div>
                      )}

                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal font-medium max-w-xl pl-1">
                      A veces los inductivos sufren de decalaje de micro-bobinas o el polvo interrumpe la lectura. El botón <strong>&quot;Forzar Salida&quot;</strong> purga la caché virtual conciente en el mapa de control.
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column (4/12) - System Failures and User Complaints / Claims */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* INBOX RECLAMOS (Complaints & Claims) */}
                <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-md">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-gray-150">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase">Buzón de Reclamos (Claims)</h4>
                      <span className="text-[10px] text-slate-405 font-medium uppercase tracking-wider block">Reportes de usuarios en vivo</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 overflow-y-auto max-h-[300px]">
                    {complaints.filter(c => c.status === 'pendiente').map((c) => (
                      <div key={c.id} className="p-3 bg-red-50/50 border border-red-100 rounded-2xl flex flex-col gap-2 relative">
                        <div className="flex justify-between items-baseline gap-1.5 text-[10px]">
                          <span className="font-extrabold text-slate-900">{c.user}</span>
                          <span className="text-slate-400 font-mono text-[9px]">{c.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug font-medium pr-1">{c.text}</p>
                        
                        <div className="flex items-center justify-between text-[10px] font-bold mt-1">
                          <span className="text-[9px] uppercase tracking-wider bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">PENDIENTE</span>
                          <button
                            onClick={() => handleResolveComplaint(c.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] py-1 px-2.5 rounded-lg transition font-extrabold cursor-pointer"
                          >
                            Resolver Caso
                          </button>
                        </div>
                      </div>
                    ))}

                    {complaints.filter(c => c.status === 'pendiente').length === 0 && (
                      <div className="text-center py-6">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
                          <ShieldCheck className="w-4.5 h-4.5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Buzón Absolutamente Vacío</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SYSTEM TECHNICAL FAILURES (Fallas de asfalto y cámaras) */}
                <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-md">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-gray-150">
                    <ServerCrash className="w-5 h-5 text-rose-500" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase">Registro de Fallas Técnicas</h4>
                      <span className="text-[10px] text-slate-405 font-medium uppercase block">Control físico de telemetría</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    {failures.filter(f => f.status !== 'resuelto').map((f) => (
                      <div key={f.id} className="p-3 bg-zinc-50 border border-gray-200/60 rounded-xl flex flex-col gap-1.5 relative text-xs">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">{f.component}</span>
                          <span className={`text-[8px] font-black tracking-widest uppercase p-1 px-1.5 rounded ${f.severity === 'alta' ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-snug font-medium">{f.description}</p>
                        
                        <div className="flex justify-between items-center text-[10px] font-bold mt-1 pt-1.5 border-t border-gray-100">
                          <span className="text-[10px] text-slate-400">{f.time} • STATUS: {f.status.toUpperCase()}</span>
                          <button
                            onClick={() => handleResolveFailure(f.id)}
                            className="bg-white border hover:bg-slate-50 text-slate-705 p-1 px-2.2 rounded-lg text-[9px] font-black transition cursor-pointer"
                          >
                            Asignar Técnico / Reset
                          </button>
                        </div>
                      </div>
                    ))}

                    {failures.filter(f => f.status !== 'resuelto').length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs font-bold font-sans">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <span className="uppercase block">No se encontraron fallas de sensores activas</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
              
            </div>

          </div>
        )}

        {/* LOGGER ACTIVITY FEED ROW (ALWAYS PINNED TO THE BOTTOM OF CORE AREA) */}
        <section className="mt-6 bg-white rounded-3xl border border-gray-205 shadow-md p-5 select-none">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-mono">Consola Terminal de Logs en Tiempo Real (Live Log)</span>
            </div>
            <button
              onClick={() => setLogs([])}
              className="text-[9px] font-extrabold text-slate-400 hover:text-slate-900 uppercase cursor-pointer"
            >
              Borrar Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pt-3.5 pr-1 font-mono text-[10px] max-h-[140px] text-slate-600 font-semibold leading-relaxed">
            {logs.map((log) => {
              let tagColor = 'bg-slate-100 text-slate-500';
              if (log.type === 'park') tagColor = 'bg-emerald-50 text-emerald-700 border-emerald-100/30';
              if (log.type === 'unpark') tagColor = 'bg-indigo-50 text-indigo-750 border-indigo-100/30';
              if (log.type === 'type_change') tagColor = 'bg-amber-50 text-amber-800 border-amber-100/30';
              if (log.type === 'audit') tagColor = 'bg-cyan-50 text-cyan-800 border-cyan-100/30';
              if (log.type === 'contingencia') tagColor = 'bg-pink-50 text-pink-700 border-pink-100/30';

              return (
                <div 
                  key={log.id} 
                  className={`p-1.5 rounded-lg border border-transparent ${tagColor} transition-all duration-300 animate-slideUp flex items-baseline justify-between gap-4`}
                >
                  <div className="flex items-baseline gap-3.5 leading-normal">
                    <span className="font-extrabold text-[8px] uppercase tracking-wider block shrink-0">[{log.type}]</span>
                    <p className="font-sans font-semibold leading-snug">{log.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold font-mono shrink-0">{log.time}</span>
                </div>
              );
            })}

            {logs.length === 0 && (
              <div className="text-center py-6 text-slate-400 uppercase text-[9px] tracking-wider block font-mono">
                No hay logs registrados en esta sesión de operaciones
              </div>
            )}
          </div>
        </section>

      </main>

      {/* 4. FOOTER HUB BRUTAL ACCENTS */}
      <footer className="bg-[#18181b] p-4 shrink-0 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-450 text-xs text-center sm:text-left font-sans">
          <p className="font-medium">
            Entorno de Control de Estacionamiento 2D • Vista y Telemetría Centralizada del Administrador • Cero Librerías Financieras.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            <span className="font-bold text-slate-350">Módulo Administrativo Autogestionado</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
