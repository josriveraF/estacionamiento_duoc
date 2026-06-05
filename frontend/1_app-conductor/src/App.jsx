import React from 'react';
import { supabase } from './supabaseClient';

function App() {
  return (
    <>
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-50 bg-surface flex justify-between items-center px-margin-mobile py-sm">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed">
            <img 
              alt="Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAglRFl50gdUGzbFTUNsM-0M1K_3OCz5odj6831z0NN0bb3PoWu7idQqcEa2XhxSlGewQFNINhK2zOd6sxQ38W_HQqeGEVegHzpCbdRL7u0aI2aagZFV17lG-bsHc5nUgWyP6R2Ei_hTT_wYVZNJIUPXMgOcKW6NFaoi9J-q6ZvpT3s1pZ4pbCIc2JJ4_fvzCss0jry91tM7aA7OXrXcRtdJGuj6cUGUALtq3fsAOjfiqvZ3L7M_JplPtrO0VOnzMSSiMxQnD-NOFM" 
            />
          </div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Hola, Estudiante</h1>
        </div>
        <button className="active:scale-95 transition-transform duration-200 hover:opacity-80">
          <span className="material-symbols-outlined text-primary text-[28px]" data-icon="notifications">notifications</span>
        </button>
      </header>

      <main className="px-margin-mobile mt-lg space-y-lg">
        {/* Status Card */}
        <section className="bg-[#e7f0fe] rounded-card p-lg shadow-[0_4px_20px_rgba(0,51,102,0.08)] border border-[#d0e1fd]">
          <div className="flex justify-between items-start mb-md">
            <div>
              <span className="font-label-sm text-label-sm text-on-primary-fixed-variant uppercase tracking-wider">Estado Actual</span>
              <h2 className="font-headline-sm text-headline-sm text-primary mt-base">Estacionado en Espacio B-12</h2>
            </div>
            <div className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full font-label-sm text-label-sm font-bold">
              ACTIVO
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md pt-sm border-t border-[#c6dafc]">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Tiempo transcurrido</p>
              <p className="font-body-lg text-body-lg font-semibold text-primary">2h 15m</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Patente</p>
              <p className="font-body-lg text-body-lg font-semibold text-primary">AB-CD-12</p>
            </div>
          </div>
        </section>

        {/* Digital Credential Action Card */}
        <button className="w-full bg-primary-container text-white rounded-card p-xl flex flex-col items-center justify-center space-y-md active:scale-95 transition-transform shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-sm nfc-wave">
            <span className="material-symbols-outlined text-white text-[48px]" data-icon="contactless">contactless</span>
          </div>
          <div className="text-center">
            <h3 className="font-headline-md text-headline-md text-white">Credencial NFC Digital</h3>
            <p className="font-body-md text-body-md text-on-primary-container opacity-90 mt-xs">Toca para abrir la barrera</p>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary opacity-20 rounded-full blur-3xl group-hover:opacity-40 transition-opacity"></div>
        </button>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {/* Quick Map Card */}
          <button className="bg-surface-container-lowest border border-surface-container-highest rounded-card p-lg flex flex-col justify-between items-start min-h-[160px] shadow-[0_4px_20px_rgba(0,51,102,0.08)] active:scale-95 transition-transform group">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mb-md group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined" data-icon="map">map</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-headline-sm text-primary">Ver Mapa de Ocupación</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">Busca espacios libres en tiempo real</p>
            </div>
          </button>

          {/* Vehicles Card */}
          <button className="bg-surface-container-lowest border border-surface-container-highest rounded-card p-lg flex flex-col justify-between items-start min-h-[160px] shadow-[0_4px_20px_rgba(0,51,102,0.08)] active:scale-95 transition-transform group">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mb-md group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined" data-icon="directions_car">directions_car</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-headline-sm text-primary">Mis Vehículos</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">Gestiona tus patentes registradas</p>
            </div>
          </button>
        </div>

        {/* Emergency / Help Section */}
        <section className="pt-md pb-xl">
          <button className="w-full bg-white border-2 border-error-container rounded-card p-md flex items-center gap-md active:scale-[0.98] transition-transform">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined" data-icon="warning" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
            </div>
            <div className="text-left">
              <h4 className="font-label-lg text-label-lg text-error font-bold">Reportar Auto Bloqueado</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Asistencia inmediata de seguridad</p>
            </div>
            <span className="material-symbols-outlined ml-auto text-outline" data-icon="chevron_right">chevron_right</span>
          </button>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-gutter-mobile py-xs bg-surface-container-lowest rounded-t-xl shadow-[0_-4px_20px_rgba(0,51,102,0.08)]">
        <a className="flex flex-col items-center justify-center text-primary-container font-bold hover:bg-surface-container-low transition-colors px-md py-xs rounded-xl active:scale-90 transition-transform duration-150" href="#">
          <span className="material-symbols-outlined" data-icon="home" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
          <span className="font-label-sm text-label-sm mt-1">Inicio</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors px-md py-xs rounded-xl active:scale-90 transition-transform duration-150" href="#">
          <span className="material-symbols-outlined" data-icon="map">map</span>
          <span className="font-label-sm text-label-sm mt-1">Mapa</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors px-md py-xs rounded-xl active:scale-90 transition-transform duration-150" href="#">
          <span className="material-symbols-outlined" data-icon="history">history</span>
          <span className="font-label-sm text-label-sm mt-1">Historial</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors px-md py-xs rounded-xl active:scale-90 transition-transform duration-150" href="#">
          <span className="material-symbols-outlined" data-icon="person">person</span>
          <span className="font-label-sm text-label-sm mt-1">Perfil</span>
        </a>
      </nav>
    </>
  );
}

export default App;
