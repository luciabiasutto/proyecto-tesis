import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configurar iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapaSeleccionUbicacionProps {
  latitud: number | string;
  longitud: number | string;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

// Componente que escucha los clics en el mapa
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

const MapaSeleccionUbicacion: React.FC<MapaSeleccionUbicacionProps> = ({
  latitud,
  longitud,
  onLocationSelect,
  height = '400px'
}) => {
  const [position, setPosition] = useState<[number, number]>([-31.4201, -64.1888]); // Córdoba por defecto

  useEffect(() => {
    // Si hay coordenadas válidas, usarlas
    const lat = typeof latitud === 'string' ? parseFloat(latitud) : latitud;
    const lng = typeof longitud === 'string' ? parseFloat(longitud) : longitud;
    
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      setPosition([lat, lng]);
    }
  }, [latitud, longitud]);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  return (
    <div style={{ width: '100%', height, marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #ddd' }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler onLocationSelect={handleMapClick} />
        {position && (
          <Marker position={position} />
        )}
      </MapContainer>
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderTop: '1px solid #ddd',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        💡 Haz clic en el mapa para seleccionar la ubicación del punto de donación
        {position && (
          <div style={{ marginTop: '5px', fontWeight: 'bold' }}>
            Coordenadas: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapaSeleccionUbicacion;

