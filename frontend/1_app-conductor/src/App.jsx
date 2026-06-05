import React, { useState } from 'react';
import { supabase } from './supabaseClient';

// Eliminamos MOCK_SPOTS ya que usaremos Supabase

function App() {
  // --- ESTADOS DE LA APLICACIÓN ---
  const [currentView, setCurrentView] = useState('dashboard');
  const [parkedSpot, setParkedSpot] = useState(null); 
  const [reservedSpot, setReservedSpot] = useState(null);
  const [selectedSpotForReservation, setSelectedSpotForReservation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isInside, setIsInside] = useState(false);
  
  // Nuevo estado para los espacios desde Supabase
  const [dbSpots, setDbSpots] = useState([]);

  React.useEffect(() => {
    // Carga inicial
    const fetchEspacios = async () => {
      const { data, error } = await supabase.from('espacios').select('*').order('id');
      if (data) setDbSpots(data);
    };
    fetchEspacios();

    // Suscripción en tiempo real
    const channel = supabase.channel('realtime-espacios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'espacios' }, (payload) => {
        setDbSpots(current => {
          const idx = current.findIndex(s => s.id === payload.new.id);
          if (idx !== -1) {
            const updated = [...current];
            updated[idx] = payload.new;
            return updated;
          }
          return [...current, payload.new];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- HANDLERS ---
  const handleSimulateNFC = async () => {
    setIsInside(true);
    if (reservedSpot) {
      // Update Supabase to Ocupado
      await supabase.from('espacios').update({ estado: 'Ocupado' }).eq('id', reservedSpot.id);
      // Si tenía reserva y entró, se le asigna automáticamente
      setParkedSpot(reservedSpot.id);
      setReservedSpot(null);
      alert(`¡Bienvenido! Has ingresado y tu reserva en el cupo ${reservedSpot.id} se ha activado.`);
      setCurrentView('dashboard');
    } else {
      setCurrentView('register_map');
    }
  };

  const handleSelectSpotToPark = async (spotId) => {
    setErrorMsg('');
    const spot = dbSpots.find(s => s.id === spotId);
    
    if (spot && spot.estado === 'Ocupado') {
      setErrorMsg('El espacio ya se encuentra ocupado. Por favor, seleccione el número correcto.');
      return;
    }
    
    // Update Supabase
    await supabase.from('espacios').update({ estado: 'Ocupado' }).eq('id', spotId);
    setParkedSpot(spotId);
    setCurrentView('dashboard');
  };

  const handleSelectSpotToReserve = async (spotId) => {
    setErrorMsg('');
    const spot = dbSpots.find(s => s.id === spotId);
    
    if (spot && (spot.estado === 'Ocupado' || spot.estado === 'Reservado')) {
      setErrorMsg('Este espacio no está disponible para reserva.');
      return;
    }
    
    setSelectedSpotForReservation(spotId);
    setCurrentView('reserve_time');
  };

  const handleConfirmReservation = async (timeSelection) => {
    // Update Supabase
    await supabase.from('espacios').update({ estado: 'Reservado' }).eq('id', selectedSpotForReservation);
    
    setReservedSpot({ id: selectedSpotForReservation, time: timeSelection });
    setSelectedSpotForReservation(null);
    setCurrentView('dashboard');
    alert(`¡Reserva confirmada en el espacio ${selectedSpotForReservation}!`);
  };

  const handleCancelReservation = async () => {
    if (reservedSpot) {
      await supabase.from('espacios').update({ estado: 'Libre' }).eq('id', reservedSpot.id);
    }
    setReservedSpot(null);
    alert('Tu reserva ha sido cancelada.');
  };

  const handleReportBlocked = async (e) => {
    e.preventDefault();
    if (parkedSpot) {
      await supabase.from('incidentes').insert([
        { espacio_id: parkedSpot, estado: 'Pendiente', patente_infractor: 'Doble Fila' }
      ]);
    } else {
      await supabase.from('incidentes').insert([
        { estado: 'Pendiente', patente_infractor: 'Doble Fila' }
      ]);
    }
    alert('Alerta enviada al guardia y al conductor del vehículo que bloquea.');
    setCurrentView('dashboard');
  };

  const handleLeaveParking = async () => {
    if (parkedSpot) {
      await supabase.from('espacios').update({ estado: 'Libre' }).eq('id', parkedSpot);
    }
    setParkedSpot(null);
    setIsInside(false);
    alert('Salida NFC detectada. Espacio liberado automáticamente.');
  };

  // --- COMPONENTE DE MAPA REUTILIZABLE ---
  const MapGrid = ({ onSelectSpot, isForReservation }) => (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sector A & B</span>
        <span className="flex items-center gap-1 text-xs font-bold text-green-600">
          <div className="w-2 h-2 rounded-full bg-green-500"></div> Libres
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {dbSpots.map((spot) => (
          <button
            key={spot.id}
            onClick={() => onSelectSpot(spot.id)}
            className={`relative h-20 rounded-xl border-2 flex items-center justify-center transition-all active:scale-95
              ${(spot.estado === 'Ocupado' || spot.estado === 'Reservado') 
                ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed' 
                : 'bg-white border-blue-200 hover:border-blue-500 hover:bg-blue-50 shadow-sm'}
            `}
          >
            <span className={`text-xl font-black ${(spot.estado === 'Ocupado' || spot.estado === 'Reservado') ? 'text-gray-400' : 'text-[#003366]'}`}>
              {spot.id}
            </span>
            {(spot.estado === 'Ocupado' || spot.estado === 'Reservado') && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-400 text-4xl opacity-20" data-icon="directions_car">directions_car</span>
              </div>
            )}
          </button>
        ))}
      </div>
      {isForReservation && (
        <div className="mt-6 p-3 bg-blue-50 rounded-lg text-xs text-[#003366] text-center font-medium">
          Toca un espacio libre para reservarlo con anticipación.
        </div>
      )}
    </div>
  );

  return (
    <div className="flex justify-center bg-gray-900 min-h-screen">
      <div className="w-full max-w-[400px] bg-[#f8faff] min-h-screen shadow-2xl relative flex flex-col font-sans">
        
        {/* TopAppBar */}
        <header className="w-full top-0 sticky z-50 bg-[#f8faff] flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-[#003366] flex items-center justify-center text-[#003366] font-bold text-lg shadow-sm">
              J
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bienvenido,</span>
              <h1 className="text-xl font-bold text-[#003366] leading-none mt-0.5">José Rivera</h1>
            </div>
          </div>
          <button className="active:scale-95 transition-transform duration-200">
            <span className="material-symbols-outlined text-[#003366] text-3xl" data-icon="notifications">notifications</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
          
          {/* VISTA 1: DASHBOARD PRINCIPAL */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Tarjeta de Estado Condicional */}
              {parkedSpot ? (
                // Ya estacionado
                <section className="bg-[#e7f0fe] rounded-2xl p-6 shadow-sm border border-[#d0e1fd] animate-slideUp">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs text-[#405a8b] font-bold uppercase tracking-wider">Estado Actual</span>
                      <h2 className="text-2xl text-[#003366] font-bold mt-1">Estacionado en <span className="text-blue-600">{parkedSpot}</span></h2>
                    </div>
                    <div className="bg-[#b3d4ff] text-[#003366] px-3 py-1 rounded-full text-xs font-bold animate-pulse">ACTIVO</div>
                  </div>
                  <button onClick={handleLeaveParking} className="mt-4 w-full py-2 bg-white text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-50 transition">
                    Simular Salida NFC (Liberar)
                  </button>
                </section>

              ) : reservedSpot ? (
                // Tiene reserva pero no ha entrado
                <section className="bg-amber-50 rounded-2xl p-6 shadow-sm border border-amber-200 animate-slideUp">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs text-amber-700 font-bold uppercase tracking-wider">Reserva Anticipada</span>
                      <h2 className="text-2xl text-amber-900 font-bold mt-1">Cupo Reservado: <span className="text-amber-600">{reservedSpot.id}</span></h2>
                      <p className="text-sm text-amber-700 mt-1">Tiempo: {reservedSpot.time}</p>
                    </div>
                    <div className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">ESPERANDO</div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={handleSimulateNFC}
                      className="flex-1 py-3 bg-[#003366] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform text-sm"
                    >
                      Llegué (Ingreso NFC)
                    </button>
                    <button 
                      onClick={handleCancelReservation}
                      className="py-3 px-4 bg-white text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-50 transition text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </section>

              ) : (
                // No estacionado ni reservado
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center animate-fadeIn">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-gray-400 text-3xl" data-icon="directions_car">directions_car</span>
                  </div>
                  <h2 className="text-xl text-[#003366] font-bold">Sin estacionamiento activo</h2>
                  <p className="text-sm text-gray-500 mt-2 mb-4">Ingresa al recinto usando tu NFC para iniciar.</p>
                  <button 
                    onClick={handleSimulateNFC}
                    className="w-full bg-[#003366] text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
                  >
                    Simular Ingreso con NFC
                  </button>
                </section>
              )}

              {/* Botón Credencial NFC */}
              <button className="w-full bg-[#003366] text-white rounded-2xl p-6 flex flex-col items-center justify-center active:scale-95 transition-transform shadow-lg relative overflow-hidden group">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-white text-4xl animate-pulse" data-icon="contactless">contactless</span>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold">Credencial NFC Digital</h3>
                  <p className="text-sm text-blue-200 mt-1">Acerca al lector de la barrera</p>
                </div>
              </button>

              {/* Sección de Doble Fila (solo si está estacionado) */}
              {parkedSpot && (
                <section className="pt-4">
                  <button 
                    onClick={() => setCurrentView('report_block')}
                    className="w-full bg-white border-2 border-red-100 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                      <span className="material-symbols-outlined" data-icon="warning">warning</span>
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-base text-red-600 font-bold leading-tight">Reportar Auto Bloqueado</h4>
                      <p className="text-xs text-gray-500 mt-1">Notificar por doble fila</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                  </button>
                </section>
              )}
            </div>
          )}

          {/* VISTA 2: MAPA PARA REGISTRO MANUAL AL ENTRAR (SIN RESERVA) */}
          {currentView === 'register_map' && (
            <div className="space-y-6 animate-slideUp">
              <div>
                <h2 className="text-2xl font-bold text-[#003366]">Registrar Ubicación</h2>
                <p className="text-sm text-gray-600 mt-1">Detectamos tu ingreso. Toca el número del cajón donde estacionaste.</p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3 animate-shake">
                  <span className="material-symbols-outlined text-red-500 mt-0.5" data-icon="error">error</span>
                  <p className="text-sm text-red-800 font-medium">{errorMsg}</p>
                </div>
              )}

              <MapGrid onSelectSpot={handleSelectSpotToPark} isForReservation={false} />

              <button onClick={() => setCurrentView('dashboard')} className="w-full py-3 text-[#003366] font-bold">Cancelar</button>
            </div>
          )}

          {/* VISTA 3: MAPA PARA RESERVA ANTICIPADA */}
          {currentView === 'reserve_map' && (
            <div className="space-y-6 animate-slideUp">
              <div>
                <h2 className="text-2xl font-bold text-[#003366]">Reserva Anticipada</h2>
                <p className="text-sm text-gray-600 mt-1">Visualiza los espacios disponibles y reserva el tuyo antes de llegar.</p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3 animate-shake">
                  <span className="material-symbols-outlined text-red-500 mt-0.5" data-icon="error">error</span>
                  <p className="text-sm text-red-800 font-medium">{errorMsg}</p>
                </div>
              )}

              <MapGrid onSelectSpot={handleSelectSpotToReserve} isForReservation={true} />
            </div>
          )}

          {/* VISTA 4: CONFIGURACIÓN DE TIEMPO DE RESERVA */}
          {currentView === 'reserve_time' && (
            <div className="space-y-6 animate-slideUp">
              <div>
                <h2 className="text-2xl font-bold text-[#003366]">Configurar Reserva</h2>
                <p className="text-sm text-gray-600 mt-1">Estás reservando el espacio <span className="font-bold text-[#003366]">{selectedSpotForReservation}</span>.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#003366] mb-2 uppercase tracking-wide">¿Cuánto tiempo estarás?</h3>
                
                <button onClick={() => handleConfirmReservation('1 Hora')} className="w-full py-4 px-4 bg-gray-50 border border-gray-200 rounded-xl text-left font-bold text-[#003366] hover:bg-blue-50 hover:border-blue-300 transition">
                  ⏱️ Estadía Corta (1 Hora)
                </button>
                <button onClick={() => handleConfirmReservation('4 Horas')} className="w-full py-4 px-4 bg-gray-50 border border-gray-200 rounded-xl text-left font-bold text-[#003366] hover:bg-blue-50 hover:border-blue-300 transition">
                  ⏳ Medio Día (4 Horas)
                </button>
                <button onClick={() => handleConfirmReservation('Toda la jornada')} className="w-full py-4 px-4 bg-gray-50 border border-gray-200 rounded-xl text-left font-bold text-[#003366] hover:bg-blue-50 hover:border-blue-300 transition">
                  🏢 Toda la jornada
                </button>
                <button onClick={() => handleConfirmReservation('Sin horario fijo')} className="w-full py-4 px-4 bg-white border-2 border-dashed border-gray-300 rounded-xl text-left font-bold text-gray-500 hover:border-[#003366] hover:text-[#003366] transition">
                  ❓ Sin horario fijo (No lo sé)
                </button>
              </div>

              <button onClick={() => setCurrentView('reserve_map')} className="w-full py-3 text-gray-500 font-bold hover:text-gray-800">
                Atrás
              </button>
            </div>
          )}

          {/* VISTA 5: REPORTE DE DOBLE FILA */}
          {currentView === 'report_block' && (
            <div className="space-y-6 animate-slideUp">
              <div>
                <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                  <span className="material-symbols-outlined">warning</span> Auto Bloqueado
                </h2>
                <p className="text-sm text-gray-600 mt-2">Ingresa la patente del vehículo que te bloquea para notificarle.</p>
              </div>

              <form onSubmit={handleReportBlocked} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#003366] mb-2">Mi Ubicación</label>
                  <input type="text" value={parkedSpot || ''} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#003366] mb-2">Patente infractor</label>
                  <input type="text" placeholder="Ej: XX-YY-99" required className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 font-bold text-lg uppercase focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg mt-4">
                  Notificar al Conductor
                </button>
              </form>
              <button onClick={() => setCurrentView('dashboard')} className="w-full py-3 text-gray-500 font-bold">Cancelar</button>
            </div>
          )}

        </main>

        {/* BottomNavBar */}
        {(currentView === 'dashboard' || currentView === 'reserve_map') && (
          <nav className="absolute bottom-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-gray-100">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center font-bold p-2 transition-colors ${currentView === 'dashboard' ? 'text-[#003366]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: currentView === 'dashboard' ? "'FILL' 1" : "'FILL' 0"}}>home</span>
              <span className="text-[10px] mt-1">Inicio</span>
            </button>
            <button 
              onClick={() => {
                if(!parkedSpot) setCurrentView('reserve_map'); // Solo deja reservar si no está estacionado
              }}
              className={`flex flex-col items-center font-bold p-2 transition-colors ${currentView === 'reserve_map' ? 'text-[#003366]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: currentView === 'reserve_map' ? "'FILL' 1" : "'FILL' 0"}}>map</span>
              <span className="text-[10px] mt-1">Reservar</span>
            </button>
            <button className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition p-2">
              <span className="material-symbols-outlined text-2xl">history</span>
              <span className="text-[10px] mt-1">Historial</span>
            </button>
            <button className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition p-2">
              <span className="material-symbols-outlined text-2xl">person</span>
              <span className="text-[10px] mt-1">Perfil</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

export default App;
