import React from 'react';
import { supabase } from './supabaseClient';
import { LayoutDashboard, Car, ShieldAlert, LogOut, Search } from 'lucide-react';

function App() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#001e40] text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight">DuocUC Parking</h2>
          <p className="text-sm text-blue-300">Panel Jefatura</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 bg-blue-900/50 px-4 py-3 rounded-lg text-white font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-blue-900/30 hover:text-white transition-colors">
            <Car size={20} /> Reservas y Bloqueos
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-blue-900/30 hover:text-white transition-colors">
            <ShieldAlert size={20} /> Incidentes
          </a>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white w-full">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar patente o espacio (Ej: A-12)..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
              JS
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Métricas de Sede en Vivo</h1>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ocupación Actual</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">84%</p>
              <span className="text-sm text-red-500 font-medium">+12% vs ayer</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Espacios Bloqueados</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">5 <span className="text-lg text-gray-400 font-normal">/ 110</span></p>
              <span className="text-sm text-gray-500 font-medium">2 Reservas, 3 Mantenimiento</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Hora Peak Estimada</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">18:30</p>
              <span className="text-sm text-blue-500 font-medium">Turno Vespertino</span>
            </div>
          </div>

          {/* Reservas Table Placeholder */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Gestión Rápida de Reservas</h2>
              <button className="px-4 py-2 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
                + Nuevo Bloqueo
              </button>
            </div>
            <div className="p-12 text-center text-gray-500">
              <p>Tabla conectada a Supabase (RESERVAS_BLOQUEOS) se renderizará aquí.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
