import React, { useState } from 'react';
import MapaDonaciones from './MapaDonaciones';
import MisFavoritos from './MisFavoritos';
import donanteLogo from '../assets/donante.png';
import './InicioDonante.css';

interface InicioDonanteProps {
  usuario: any;
}

const InicioDonante: React.FC<InicioDonanteProps> = ({ usuario }) => {
  const [showMapaModal, setShowMapaModal] = useState(false);
  const [showMisFavoritos, setShowMisFavoritos] = useState(false);

  // Si se muestra Mis Favoritos, no mostrar la página de inicio
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
        <MisFavoritos usuario={usuario} />
      </div>
    );
  }

  return (
    <div className="inicio-donante">
      <div className="inicio-hero">
        <div className="hero-logo-container">
          <img src={donanteLogo} alt="Donante" className="hero-logo" />
        </div>
        <h1>¡Hola, {usuario?.nombre || 'Donante'}!</h1>
        <p>Encuentra puntos de donación cerca de ti o gestiona tus propios puntos</p>
      </div>

      <div className="inicio-opciones">
        <button 
          className="opcion-card mapa-card"
          onClick={() => setShowMapaModal(true)}
        >
          <div className="opcion-icon">🗺️</div>
          <h2>Ver Mapa</h2>
          <p>Explora los puntos de donación disponibles en el mapa interactivo</p>
        </button>

        <button 
          className="opcion-card favoritos-card"
          onClick={() => setShowMisFavoritos(true)}
        >
          <div className="opcion-icon">⭐</div>
          <h2>Mis Favoritos</h2>
          <p>Ver y agendar tus puntos de donación favoritos</p>
        </button>
      </div>

      {/* Modal del Mapa */}
      {showMapaModal && (
        <div className="modal-overlay" onClick={() => setShowMapaModal(false)}>
          <div className="modal-content mapa-modal" onClick={(e) => e.stopPropagation()}>
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

