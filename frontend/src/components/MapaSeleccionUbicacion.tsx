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

// Subcomponente invisible: detecta el clic en el mapa y devuelve las coordenadas
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng; // saco latitud y longitud del punto clickeado
      onLocationSelect(lat, lng); // se las paso al padre
    },
  });
  return null; // no dibuja nada, solo escucha
}

// Mapa para elegir la ubicación de un punto al crearlo o editarlo
const MapaSeleccionUbicacion: React.FC<MapaSeleccionUbicacionProps> = ({
  latitud,
  longitud,
  onLocationSelect,
  height = '400px'
}) => {
  const [position, setPosition] = useState<[number, number]>([-31.4201, -64.1888]); // marcador inicial en Córdoba

  // Si llegan coordenadas por props (modo edición), muevo el marcador ahí
  useEffect(() => {
    // Las coordenadas pueden venir como texto, así que las convierto a número
    const lat = typeof latitud === 'string' ? parseFloat(latitud) : latitud;
    const lng = typeof longitud === 'string' ? parseFloat(longitud) : longitud;
    
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      setPosition([lat, lng]); // solo si son válidas
    }
  }, [latitud, longitud]);

  // Cuando el usuario hace clic: muevo el marcador y aviso al formulario
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
        <MapClickHandler onLocationSelect={handleMapClick} /> {/* escucha los clics en el mapa */}
        {position && (
          <Marker position={position} /> // muestra el marcador en la ubicación elegida
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




