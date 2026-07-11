import React, { useState } from 'react';
import MapaDonaciones from './MapaDonaciones';
import MisFavoritos from './MisFavoritos';
import donanteLogo from '../assets/donante.png';
import './InicioDonante.css';

interface InicioDonanteProps {
  usuario: any;
}

// Pantalla de inicio del donante: dos tarjetas grandes (mapa y favoritos)
const InicioDonante: React.FC<InicioDonanteProps> = ({ usuario }) => {
  const [showMapaModal, setShowMapaModal] = useState(false); // controla si el mapa se abre en ventana modal
  const [showMisFavoritos, setShowMisFavoritos] = useState(false); // controla si muestro la vista de favoritos

  // Si el donante entró a "Mis Favoritos", muestro esa vista en lugar del inicio
  if (showMisFavoritos) {
    return (
      <div className="vista-mis-puntos-full">
        <div className="vista-header">
          <button 
            className="back-button"
            onClick={() => setShowMisFavoritos(false)}
          >
            ← Volver al inicio
          </button>
          <h2>⭐ Mis Puntos Favoritos</h2>
        </div>
        <MisFavoritos usuario={usuario} /> {/* le paso el usuario para traer sus favoritos */}
      </div>
    );
  }

  // Vista de inicio por defecto
  return (
    <div className="inicio-donante">
      {/* Saludo con el nombre del donante */}
      <div className="inicio-hero">
        <div className="hero-logo-container">
          <img src={donanteLogo} alt="Donante" className="hero-logo" />
        </div>
        <h1>¡Hola, {usuario?.nombre || 'Donante'}!</h1> {/* si no hay nombre, muestro "Donante" */}
        <p>Encuentra puntos de donación cerca de ti o gestiona tus propios puntos</p>
      </div>

      <div className="inicio-opciones">
        {/* Tarjeta 1: abre el mapa en un modal */}
        <button 
          className="opcion-card mapa-card"
          onClick={() => setShowMapaModal(true)}
        >
          <div className="opcion-icon">🗺️</div>
          <h2>Ver Mapa</h2>
          <p>Explora los puntos de donación disponibles en el mapa interactivo</p>
        </button>

        {/* Tarjeta 2: cambia a la vista de favoritos */}
        <button 
          className="opcion-card favoritos-card"
          onClick={() => setShowMisFavoritos(true)}
        >
          <div className="opcion-icon">⭐</div>
          <h2>Mis Favoritos</h2>
          <p>Ver y agendar tus puntos de donación favoritos</p>
        </button>
      </div>

      {/* Modal del mapa: solo se renderiza si showMapaModal es true */}
      {showMapaModal && (
        <div className="modal-overlay" onClick={() => setShowMapaModal(false)}> {/* clic afuera = cerrar */}
          <div className="modal-content mapa-modal" onClick={(e) => e.stopPropagation()}> {/* evito que el clic adentro cierre */}
            <div className="modal-header">
              <h2>🗺️ Mapa de Puntos de Donación</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowMapaModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <MapaDonaciones />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InicioDonante;

