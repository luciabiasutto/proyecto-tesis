import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../config/axios.config';
import FiltrosDonacion from './FiltrosDonacion';

interface Favorito {
  id: number;
  puntoDonacionId: number;
  etiqueta?: string;
}

// Configurar iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Función para crear iconos personalizados por tipo de donación
// Función helper para parsear tipos de donación (puede ser JSON array o string simple)
const parsearTiposDonacion = (tipoDonacion: string): string[] => {
  try {
    const tipos = JSON.parse(tipoDonacion);
    if (Array.isArray(tipos)) {
      return tipos;
    }
    return [tipoDonacion];
  } catch {
    return [tipoDonacion];
  }
};

// Función helper para formatear horarios (eliminar segundos)
const formatearHorario = (horario: string | null | undefined): string => {
  if (!horario) return '';
  // Si tiene formato HH:mm:ss, eliminar los segundos
  if (horario.includes(':') && horario.split(':').length === 3) {
    return horario.substring(0, 5) + ' hs';
  }
  // Si ya tiene formato HH:mm, solo agregar "hs"
  if (horario.includes(':') && horario.split(':').length === 2) {
    return horario + ' hs';
  }
  return horario;
};

const crearIconoPersonalizado = (tipoDonacion: string) => {
  // Obtener el primer tipo para el color del ícono
  const tipos = parsearTiposDonacion(tipoDonacion);
  const primerTipo = tipos[0] || tipoDonacion;
  const colores = {
    'ropa': '#e74c3c',
    'vidrio': '#3498db', 
    'plastico': '#2ecc71',
    'papel': '#f39c12',
    'organicos': '#27ae60',
    'otros': '#95a5a6'
  };
  
  const color = colores[primerTipo.toLowerCase() as keyof typeof colores] || '#667eea';
  
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 14px;
        font-weight: bold;
      ">${primerTipo.charAt(0).toUpperCase()}</div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });
};

interface PuntoDonacion {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  tipoDonacion: string;
  horarioApertura?: string;
  horarioCierre?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  fechaCreacion: string;
}

const MapaDonaciones: React.FC = () => {
  const [puntosDonacion, setPuntosDonacion] = useState<PuntoDonacion[]>([]);
  const [puntosFiltrados, setPuntosFiltrados] = useState<PuntoDonacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  const [favoritos, setFavoritos] = useState<number[]>([]); // IDs de puntos favoritos
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // Obtener usuario del localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuarioData = JSON.parse(usuarioGuardado);
      setUsuario(usuarioData);
      
      // Solo cargar favoritos si es donante
      if (usuarioData.rol === 'DONANTE' || localStorage.getItem('rol') === 'DONANTE') {
        fetchFavoritos(usuarioData.id);
      }
    }

    const fetchPuntosDonacion = async () => {
      try {
        const response = await api.get('/puntos-donacion');
        setPuntosDonacion(response.data || []);
        setPuntosFiltrados(response.data || []);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('Error al cargar puntos:', err);
        setError('Error al cargar los puntos de donación');
        setLoading(false);
      }
    };

    fetchPuntosDonacion();
  }, []);

  const fetchFavoritos = async (usuarioId: number) => {
    try {
      const response = await api.get(`/favoritos/usuario/${usuarioId}`);
      const idsFavoritos = response.data.map((f: Favorito) => f.puntoDonacionId);
      setFavoritos(idsFavoritos);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error al cargar favoritos:', err);
      }
    }
  };

  const handleToggleFavorito = async (puntoId: number) => {
    if (!usuario?.id) {
      alert('Debes estar logueado para agregar favoritos');
      return;
    }

    const esFavorito = favoritos.includes(puntoId);

    try {
      if (esFavorito) {
        // Eliminar favorito
        const favorito = await api.get(`/favoritos/usuario/${usuario.id}`);
        const favoritoEncontrado = favorito.data.find((f: Favorito) => f.puntoDonacionId === puntoId);
        if (favoritoEncontrado) {
          await api.delete(`/favoritos/${favoritoEncontrado.id}`);
          setFavoritos(favoritos.filter(id => id !== puntoId));
        }
      } else {
        // Agregar favorito
        await api.post('/favoritos', {
          usuarioId: usuario.id,
          puntoDonacionId: puntoId
        });
        setFavoritos([...favoritos, puntoId]);
      }
    } catch (err: any) {
      console.error('Error al gestionar favorito:', err);
      alert('Error al gestionar el favorito');
    }
  };

  // Filtrar puntos cuando cambia el filtro
  useEffect(() => {
    if (filtroActivo === 'todos') {
      setPuntosFiltrados(puntosDonacion);
    } else {
      const filtrados = puntosDonacion.filter(punto => {
        const tipos = parsearTiposDonacion(punto.tipoDonacion);
        return tipos.some(tipo => tipo.toLowerCase() === filtroActivo.toLowerCase());
      });
      setPuntosFiltrados(filtrados);
    }
  }, [filtroActivo, puntosDonacion]);

  const handleFiltroChange = (filtro: string) => {
    setFiltroActivo(filtro);
  };

  if (loading) {
    return <div className="loading">Cargando puntos de donación...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="mapa-container-mejorado">
      <div className="mapa-header-fixed">
        <div className="mapa-header-content">
          <h1>🗺️ Puntos de Donación</h1>
          <div className="contador-resultados">
            {filtroActivo === 'todos' ? (
              <span>Mostrando todos los puntos ({puntosFiltrados.length})</span>
            ) : (
              <span>
                Mostrando puntos de <strong>{filtroActivo}</strong> ({puntosFiltrados.length})
              </span>
            )}
          </div>
        </div>
        <div className="filtros-section-fixed">
          <FiltrosDonacion 
            filtroActivo={filtroActivo} 
            onFiltroChange={handleFiltroChange} 
          />
        </div>
      </div>
      
      <div className="mapa-content-wrapper">
        <div className="mapa-wrapper-mejorado">
          <MapContainer
            center={[-31.4201, -64.1888]} // Córdoba, Argentina
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            touchZoom={true}
            boxZoom={true}
            keyboard={true}
            dragging={true}
          >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {puntosFiltrados.map((punto) => (
          <Marker
            key={punto.id}
            position={[punto.latitud, punto.longitud]}
            icon={crearIconoPersonalizado(punto.tipoDonacion)}
          >
            <Popup
              closeButton={true}
              autoClose={false}
              closeOnClick={false}
              className="custom-popup"
            >
              <div className="popup-content">
                <div className="popup-header">
                  <h3>{punto.nombre}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginRight: '0' }}>
                    {parsearTiposDonacion(punto.tipoDonacion).map((tipo, idx) => (
                      <span key={idx} className={`tipo-badge ${tipo.toLowerCase()}`}>
                        {tipo.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="popup-info">
                  <div className="info-section">
                    <h4>📍 Ubicación</h4>
                    <p>{punto.direccion}</p>
                  </div>
                  
                  <div className="info-section">
                    <h4>🕒 Horarios de Atención</h4>
                    {punto.horarioApertura && punto.horarioCierre ? (
                      <p><strong>{formatearHorario(punto.horarioApertura)}</strong> - <strong>{formatearHorario(punto.horarioCierre)}</strong></p>
                    ) : (
                      <p>Horarios no especificados</p>
                    )}
                  </div>
                  
                  <div className="info-section">
                    <h4>📞 Contacto</h4>
                    {punto.telefono && (
                      <div className="contact-item">
                        <span className="contact-icon">📞</span>
                        <a href={`tel:${punto.telefono}`} className="contact-link">
                          {punto.telefono}
                        </a>
                      </div>
                    )}
                    {punto.email && (
                      <div className="contact-item">
                        <span className="contact-icon">✉️</span>
                        <a href={`mailto:${punto.email}`} className="contact-link">
                          {punto.email}
                        </a>
                      </div>
                    )}
                    {!punto.telefono && !punto.email && (
                      <p>Información de contacto no disponible</p>
                    )}
                  </div>
                  
                  <div className="info-section">
                    <h4>ℹ️ Estado</h4>
                    <span className={`estado-badge ${punto.activo ? 'activo' : 'inactivo'}`}>
                      {punto.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </div>
                  
                  <div className="info-section">
                    <h4>📅 Información del Punto</h4>
                    <p><strong>ID:</strong> #{punto.id}</p>
                    <p><strong>Registrado:</strong> {new Date(punto.fechaCreacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
                
                <div className="popup-footer">
                  {usuario && (usuario.rol === 'DONANTE' || localStorage.getItem('rol') === 'DONANTE') && (
                    <div className="favorito-section">
                      <button
                        className={`favorito-btn ${favoritos.includes(punto.id) ? 'es-favorito' : ''}`}
                        onClick={() => handleToggleFavorito(punto.id)}
                        title={favoritos.includes(punto.id) ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
                      >
                        {favoritos.includes(punto.id) ? '⭐ En favoritos' : '☆ Agregar a favoritos'}
                      </button>
                    </div>
                  )}
                  <div className="popup-actions">
                    {punto.telefono && (
                      <a href={`tel:${punto.telefono}`} className="action-btn call-btn">
                        📞 Llamar
                      </a>
                    )}
                    {punto.email && (
                      <a href={`mailto:${punto.email}`} className="action-btn email-btn">
                        ✉️ Email
                      </a>
                    )}
                    <button 
                      className="action-btn directions-btn"
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${punto.latitud},${punto.longitud}`;
                        window.open(url, '_blank');
                      }}
                    >
                      🗺️ Cómo llegar
                    </button>
                  </div>
                  
                  <div className="consejo-box">
                    <span className="consejo-icon">💡</span>
                    <span className="consejo-text">
                      <strong>Consejo:</strong> Contacta directamente con el punto para coordinar tu donación
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapaDonaciones;
