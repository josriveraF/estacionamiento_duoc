import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Search, Map as MapIcon, Bell, Settings, LayoutGrid, AlertTriangle, ShieldAlert, BadgeCheck, DoorOpen } from 'lucide-react';
import { createInitialSpaces, calculateStats } from './data';
import Parking2D from './components/Parking2D';
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [spaces, setSpaces] = useState(() => createInitialSpaces());
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);
  const [incidentes, setIncidentes] = useState([]);
  
  const stats = calculateStats(spaces);

  // --- SUPABASE REALTIME SYNC ---
  React.useEffect(() => {
    const fetchSpaces = async () => {
      const { data } = await supabase.from('espacios').select('*');
      if (data) {
        setSpaces(prev => prev.map(s => {
          const dbSpot = data.find(d => d.id === s.id);
          if (dbSpot) {
             const statusMap = { 'Libre': 'available', 'Ocupado': 'occupied', 'Reservado': 'reserved' };
             return { ...s, status: statusMap[dbSpot.estado] || 'available' };
          }
          return s;
        }));
      }
    };
    fetchSpaces();

    const fetchIncidentes = async () => {
      const { data } = await supabase.from('incidentes').select('*').order('fecha_reporte', { ascending: false });
      if (data) {
        setIncidentes(data);
      }
    };
    fetchIncidentes();

    const channelSpaces = supabase.channel('realtime-guardia-spaces')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'espacios' }, (payload) => {
         const dbSpot = payload.new;
         const statusMap = { 'Libre': 'available', 'Ocupado': 'occupied', 'Reservado': 'reserved' };
         setSpaces(prev => prev.map(s => s.id === dbSpot.id ? { ...s, status: statusMap[dbSpot.estado] || 'available' } : s));
      })
      .subscribe();

    const channelIncidentes = supabase.channel('realtime-guardia-incidentes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidentes' }, () => {
         fetchIncidentes();
      })
      .subscribe();
      
    return () => { 
      supabase.removeChannel(channelSpaces); 
      supabase.removeChannel(channelIncidentes); 
    };
  }, []);

  return (
    <div className="flex bg-[#0b0c10] min-h-screen font-sans text-white">
      
      {/* Sidebar Navigation (Tablet) */}
      <nav className="w-24 bg-[#111318] border-r border-gray-800 flex flex-col items-center py-6 gap-8 z-10">
        <div className="bg-[#facc15] text-[#111318] font-bold p-2 rounded-lg text-lg mb-4">
          DU
        </div>
        
        <div className="flex flex-col gap-6 flex-1 w-full px-2">
          {/* Dashboard Tab */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 w-full py-4 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'text-blue-400 bg-blue-900/20' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <LayoutGrid size={28} />
            <span className="text-xs font-bold mt-1">Dash</span>
          </button>
          
          {/* Mapa Tab */}
          <button 
            onClick={() => setActiveTab('mapa')}
            className={`flex flex-col items-center justify-center gap-1 w-full py-4 rounded-2xl transition-all ${activeTab === 'mapa' ? 'text-green-400 border border-green-500/50 bg-green-900/10' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <MapIcon size={28} />
            <span className="text-xs font-medium mt-1">Mapa</span>
          </button>

          {/* Alertas Tab */}
          <button 
            onClick={() => setActiveTab('alertas')}
            className={`flex flex-col items-center justify-center gap-1 w-full py-4 rounded-2xl transition-all ${activeTab === 'alertas' ? 'text-blue-400 bg-blue-900/20' : 'text-gray-500 hover:text-gray-300'} relative`}
          >
            <Bell size={28} />
            <span className="absolute top-3 right-6 w-3 h-3 bg-red-500 rounded-full border-2 border-[#111318]"></span>
            <span className="text-xs font-medium mt-1">Alertas</span>
          </button>
        </div>

        <button className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-300 w-full py-4 rounded-2xl transition-all">
          <Settings size={28} />
          <span className="text-xs font-medium mt-1">Ajustes</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#0b0c10]">
        
        {/* Top App Bar */}
        <header className="flex items-center justify-between px-8 py-5 bg-[#111318] border-b border-gray-800">
          <h1 className="text-[#facc15] text-2xl font-bold tracking-wide">VIGILANCIA I.P.S.</h1>
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="text-xl font-bold text-blue-300">5:47 PM</p>
            </div>
            <span className="inline-flex items-center gap-2 bg-[#1e293b] text-blue-300 text-xs px-3 py-1.5 rounded-full border border-blue-900">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> CONECTADO
            </span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {activeTab === 'dashboard' && (
            <>
              {/* Header Info & Search */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-gray-400 text-lg">Panel de Seguridad</p>
                  <h2 className="text-4xl font-bold">Turno Mañana</h2>
                </div>
                <div className="relative w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Ingresar Patente o RUT..." 
                    className="w-full bg-[#1e293b] text-white border border-gray-700 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg"
                  />
                </div>
              </div>

              {/* Two Column Grid for Tablet */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Metrics & Actions */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Capacity Card */}
                  <div className="bg-[#1e293b] rounded-2xl p-8 flex items-center justify-between border border-gray-700 shadow-lg">
                    <div>
                      <p className="text-gray-400 text-sm tracking-widest mb-2">CAPACIDAD TOTAL</p>
                      <p className="text-6xl font-bold text-[#facc15]">{stats.occupancyRate}%</p>
                    </div>
                    <div className="w-28 h-28 rounded-full border-8 border-[#facc15] border-t-gray-700 transform rotate-45"></div>
                  </div>

                  {/* Grid Cards */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700 shadow-lg">
                      <p className="text-gray-400 text-sm tracking-widest mb-2">CUPOS LIBRES</p>
                      <p className="text-5xl font-bold text-blue-300">{stats.available}</p>
                    </div>
                    <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700 shadow-lg">
                      <p className="text-gray-400 text-sm tracking-widest mb-2">ESPECIALES</p>
                      <p className="text-5xl font-bold text-gray-200">{stats.disabledOccupied + stats.evOccupied} <span className="text-xl font-normal text-gray-400">en uso</span></p>
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="pt-4">
                    <h3 className="text-xl font-bold mb-4">Acciones Rápidas</h3>
                    <button className="w-full bg-[#1e3a8a] hover:bg-blue-800 active:scale-[0.99] transition-transform text-blue-100 rounded-2xl p-6 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-4">
                        <DoorOpen size={28} />
                        <span className="text-xl font-medium">Abrir Barrera Manualmente</span>
                      </div>
                      <span className="text-3xl">›</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Alerts Feed */}
                <div className="lg:col-span-5 flex flex-col h-full">
                  <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                    <AlertTriangle className="text-red-500" size={24} /> Alertas Activas
                  </h3>
                  
                  <div className="bg-[#111318] rounded-2xl border border-gray-800 p-6 flex-1 space-y-4 shadow-inner">
                    {incidentes.length === 0 ? (
                      <p className="text-gray-500 text-center mt-4">No hay alertas activas.</p>
                    ) : (
                      incidentes.map(inc => (
                        <div key={inc.id} className="bg-[#7f1d1d] rounded-xl p-5 border border-red-500 flex gap-5 items-center shadow-lg">
                          <div className="bg-red-200/20 p-3 rounded-lg text-red-200">
                            <ShieldAlert size={28} />
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-widest text-red-200 mb-1">CRÍTICO</p>
                            <p className="text-lg text-red-100">{inc.patente_infractor === 'Doble Fila' ? 'Doble fila detectada' : 'Alerta'} en {inc.espacio_id ? `plaza ${inc.espacio_id}` : 'sector general'}</p>
                            <p className="text-xs text-red-300 mt-2">
                              {new Date(inc.fecha_reporte).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'mapa' && (
            <div className="h-full flex flex-col bg-[#f4f4f5] text-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              {/* Top Header of the Map exactly like the 2nd photo */}
              <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Mapa de Estacionamiento 2D</h2>
                  <p className="text-gray-500 mt-1">Vista cenital interactiva. Haz clic en cualquier espacio para ver opciones.</p>
                </div>
                
                {/* Legend */}
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span className="text-sm font-medium">PMR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm font-medium">Carga Eléctrica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                    <span className="text-sm font-medium">Reservado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-300"></div>
                    <span className="text-sm font-medium">Disponible</span>
                  </div>
                </div>
              </div>

              {/* Map Canvas - Render the actual Interactive Map */}
              <div className="flex-1 relative overflow-hidden bg-[#e5e5e5] flex flex-col h-full min-h-[500px]">
                <Parking2D
                  spaces={spaces}
                  onSelectSpace={setSelectedSpaceId}
                  selectedSpaceId={selectedSpaceId}
                />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
