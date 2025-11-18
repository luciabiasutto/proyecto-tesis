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

const Dashboard: React.FC<DashboardProps> = ({ usuario, rol }) => {
  const [activeTab, setActiveTab] = useState('mapa');

  // Si es donante, mostrar la página de inicio
  const rolNormalizado = rol?.toUpperCase().trim();
  console.log('Dashboard - Rol recibido:', rol, 'Rol normalizado:', rolNormalizado);
  
  if (rolNormalizado === 'DONANTE') {
    console.log('Mostrando InicioDonante para donante');
    return <InicioDonante usuario={usuario} />;
  }

  // Definir tabs según el rol del usuario
  const getTabsByRole = () => {
    const baseTabs = [
      { id: 'mapa', label: 'Mapa de Donaciones', icon: '🗺️' }
    ];

    switch (rol) {
      case 'ADMINISTRADOR':
        return [
          ...baseTabs,
          { id: 'puntos', label: 'Gestionar Puntos', icon: '📍' },
          { id: 'aprobacion', label: 'Aprobar Puntos', icon: '✅' }
        ];

      case 'ORGANIZACION':
        return [
          ...baseTabs,
          { id: 'mis-puntos', label: 'Mis Puntos', icon: '📍' }
        ];

      default:
        return baseTabs;
    }
  };

  const tabs = getTabsByRole();

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

  // Si estamos mostrando el mapa, ocultar headers para que se vea igual que en donante
  const isMapaView = activeTab === 'mapa';

  return (
    <div className={`dashboard ${isMapaView ? 'dashboard-mapa-view' : ''}`}>
      {!isMapaView && (
        <>
          <header className="dashboard-header">
            <h1>🗺️ Mapa de Puntos de Donación</h1>
            <p>Encuentra y contacta puntos de donación cerca de ti</p>
          </header>
          
          <nav className="dashboard-nav">
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
      
      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;


