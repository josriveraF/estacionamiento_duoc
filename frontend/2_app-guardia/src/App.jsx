import React from 'react';
import { supabase } from './supabaseClient';

function App() {
  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Left Column - Live Map (70%) */}
      <div className="w-[70%] h-full border-r border-gray-800 p-6 flex flex-col relative">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img 
              src="/logo_estacionamiento_duoc_uc.png" 
              alt="Duoc UC" 
              className="h-8 object-contain"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/150x50?text=DuocUC'; }}
            />
            <h1 className="text-xl font-bold text-gray-300">Monitoreo Sede Maipú</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-green-400 font-mono">Conectado (Supabase Realtime)</span>
          </div>
        </header>

        {/* Map Area */}
        <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-black to-black"></div>
          <p className="text-gray-500 font-mono z-10 text-center">
            [Renderizador de Mapa 2D/3D (ESPACIOS DB)]<br/>
            Espacios Libres se mostrarán aquí.
          </p>
        </div>
      </div>

      {/* Right Column - Actions & Metrics (30%) */}
      <div className="w-[30%] h-full bg-[#0a0a0a] flex flex-col p-6">
        {/* Profile */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center border-2 border-blue-500">
            <span className="text-blue-100 font-bold">G1</span>
          </div>
          <div>
            <p className="text-sm text-gray-400">Turno Actual</p>
            <p className="font-bold">Guardia Pedro S.</p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Entradas</p>
            <p className="text-3xl font-bold text-green-400 font-mono">142</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Disponibles</p>
            <p className="text-3xl font-bold text-blue-400 font-mono">26 <span className="text-sm text-gray-600">/ 110</span></p>
          </div>
        </div>

        {/* Massive NFC Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white rounded-2xl p-8 shadow-[0_0_40px_rgba(37,99,235,0.3)] mb-8 flex flex-col items-center justify-center gap-4 group">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4z"/><path d="M9 10v4"/><path d="M15 10v4"/><path d="M12 10v4"/></svg>
          </div>
          <span className="text-2xl font-bold uppercase tracking-wider">ESCANEAR NFC</span>
        </button>

        {/* Incidents Feed */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Feed de Alertas</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            
            {/* Alert Item */}
            <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-red-900 text-red-200 text-xs px-2 py-1 rounded font-bold">DOBLE FILA</span>
                <span className="text-xs text-gray-500">Hace 2m</span>
              </div>
              <p className="text-sm text-gray-300">Auto patente <span className="text-white font-bold bg-gray-800 px-1 rounded">XX-YY-99</span> reportado como bloqueado en sector B.</p>
            </div>

            <div className="bg-gray-900 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-500">No hay más alertas recientes.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
