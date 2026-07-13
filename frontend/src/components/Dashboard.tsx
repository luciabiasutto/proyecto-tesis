import React, { useState } from 'react';
import MapaDonaciones from './MapaDonaciones';
import GestionPuntosDonacion from './GestionPuntosDonacion';
import GestionMisPuntos from './GestionMisPuntos';
import AprobacionPuntos from './AprobacionPuntos';
import InicioDonante from './InicioDonante';
import './Dashboard.css';

interface DashboardProps {
  usuario: any;
  rol: string;
}

// Distribuidor de vistas: según el rol muestra unas pestañas u otras
const Dashboard: React.FC<DashboardProps> = ({ usuario, rol }) => {
  const [activeTab, setActiveTab] = useState('mapa'); // pestaña seleccionada (por defecto el mapa)

  // Normalizo el rol (mayúsculas y sin espacios) para comparar sin errores
  const rolNormalizado = rol?.toUpperCase().trim();
  console.log('Dashboard - Rol recibido:', rol, 'Rol normalizado:', rolNormalizado);
  
  // El donante tiene su propia pantalla de inicio, no las pestañas de gestión
  if (rolNormalizado === 'DONANTE') {
    console.log('Mostrando InicioDonante para donante');
    return <InicioDonante usuario={usuario} />;
  }

  // Devuelve las pestañas disponibles según el rol del usuario
  const getTabsByRole = () => {
    const baseTabs = [
      { id: 'mapa', label: 'Mapa de Donaciones', icon: '🗺️' } // el mapa lo ven todos
    ];

    switch (rol) {
      case 'ADMINISTRADOR': // el admin gestiona y aprueba puntos
        return [
          ...baseTabs,
          { id: 'puntos', label: 'Gestionar Puntos', icon: '📍' },
          { id: 'aprobacion', label: 'Aprobar Puntos', icon: '✅' }
        ];

      case 'ORGANIZACION': // la organización solo gestiona sus propios puntos
        return [
          ...baseTabs,
          { id: 'mis-puntos', label: 'Mis Puntos', icon: '📍' }
        ];

      default:
        return baseTabs;
    }
  };

  const tabs = getTabsByRole(); // calculo las pestañas una vez

  // Devuelve el componente que corresponde a la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case 'mapa':
        return <MapaDonaciones />;
      case 'puntos':
        return <GestionPuntosDonacion />;
      case 'aprobacion':
        return <AprobacionPuntos />;
      case 'mis-puntos':
        return <GestionMisPuntos />;
      default:
        return <MapaDonaciones />;
    }
  };

  // Si la pestaña activa es el mapa, oculto los títulos para que se vea a pantalla completa
  const isMapaView = activeTab === 'mapa';

  return (
    <div className={`dashboard ${isMapaView ? 'dashboard-mapa-view' : ''}`}>
      {!isMapaView && (
        <>
          <header className="dashboard-header">
            <h1>🗺️ Mapa de Puntos de Donación</h1>
            <p>Encuentra y contacta puntos de donación cerca de ti</p>
          </header>
          
          {/* Recorro las pestañas y creo un botón por cada una */}
          <nav className="dashboard-nav">
            {tabs.map(tab => (
              <button
                key={tab.id} // key único para que React identifique cada botón
                className={`nav-button ${activeTab === tab.id ? 'active' : ''}`} // resalta la activa
                onClick={() => setActiveTab(tab.id)} // al hacer clic cambio de pestaña
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </>
      )}
      
      {isMapaView && (
        <nav className="dashboard-nav dashboard-nav-minimal">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
      
      {/* Zona principal, muestra el componente de la pestaña activa */}
      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;


