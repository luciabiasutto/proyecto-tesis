import React from 'react';
import './FiltrosDonacion.css';

interface FiltrosDonacionProps {
  filtroActivo: string;
  onFiltroChange: (filtro: string) => void;
}

// Barra de botones para filtrar el mapa por tipo de donación (componente presentacional)
const FiltrosDonacion: React.FC<FiltrosDonacionProps> = ({ filtroActivo, onFiltroChange }) => {
  // Lista fija de filtros con su nombre, ícono y color
  const tiposDonacion = [
    { id: 'todos', nombre: 'Todos', icono: '🗺️', color: '#667eea' },
    { id: 'ropa', nombre: 'Ropa', icono: '👕', color: '#e74c3c', hoverColor: '#9b59b6' },
    { id: 'vidrio', nombre: 'Vidrio', icono: '🍶', color: '#3498db' },
    { id: 'plastico', nombre: 'Plástico', icono: '♻️', color: '#2ecc71' },
    { id: 'papel', nombre: 'Papel', icono: '📄', color: '#f39c12' },
    { id: 'organicos', nombre: 'Orgánicos', icono: '🌱', color: '#27ae60' },
    { id: 'otros', nombre: 'Otros', icono: '📦', color: '#95a5a6' }
  ];

  return (
    <div className="filtros-donacion">
      <h3>🔍 Filtrar por tipo de donación</h3>
      {/* Recorro los tipos y creo un botón por cada filtro */}
      <div className="filtros-grid">
        {tiposDonacion.map((tipo) => (
          <button
            key={tipo.id} // key único por filtro
            className={`filtro-btn ${filtroActivo === tipo.id ? 'activo' : ''} ${tipo.id === 'ropa' ? 'filtro-ropa' : ''}`} // marca el filtro activo
            onClick={() => onFiltroChange(tipo.id)} // aviso al padre (mapa) qué filtro se eligió
            style={{
              '--color-filtro': tipo.color,
              '--hover-color': tipo.hoverColor || tipo.color
            } as React.CSSProperties}
          >
            <span className="filtro-icono">{tipo.icono}</span>
            <span className="filtro-nombre">{tipo.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FiltrosDonacion;
