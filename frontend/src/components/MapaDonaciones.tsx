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

// Arreglo estándar de Leaflet: le indico de dónde sacar las imágenes de los marcadores
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Convierte el campo tipoDonacion en un array (puede venir como JSON ["ropa","papel"] o como texto simple)
const parsearTiposDonacion = (tipoDonacion: string): string[] => {
  try {
    const tipos = JSON.parse(tipoDonacion); // intento leerlo como JSON
    if (Array.isArray(tipos)) {
      return tipos; // si era un array, lo devuelvo tal cual
    }
    return [tipoDonacion];
  } catch {
    return [tipoDonacion]; // si no es JSON, lo devuelvo como array de un solo elemento
  }
};

// Formatea la hora: de "09:00:00" a "09:00 hs" (le quita los segundos)
const formatearHorario = (horario: string | null | undefined): string => {
  if (!horario) return ''; // si no hay horario, devuelvo vacío
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

// Crea un marcador de color distinto según el tipo de donación
const crearIconoPersonalizado = (tipoDonacion: string) => {
  // Uso el primer tipo para decidir el color del pin
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

// Componente del mapa interactivo con todos los puntos de donación
const MapaDonaciones: React.FC = () => {
  const [puntosDonacion, setPuntosDonacion] = useState<PuntoDonacion[]>([]); // todos los puntos traídos del backend
  const [puntosFiltrados, setPuntosFiltrados] = useState<PuntoDonacion[]>([]); // los que se muestran según el filtro
  const [loading, setLoading] = useState(true); // true mientras cargan los datos
  const [error, setError] = useState<string | null>(null); // guarda el mensaje si algo falla
  const [filtroActivo, setFiltroActivo] = useState<string>('todos'); // filtro seleccionado
  const [favoritos, setFavoritos] = useState<number[]>([]); // IDs de puntos favoritos
  const [usuario, setUsuario] = useState<any>(null); // usuario logueado

  // Pide al backend la lista de puntos de donación
  const fetchPuntosDonacion = async () => {
    try {
      const response = await api.get('/puntos-donacion'); // GET a la API
      setPuntosDonacion(response.data || []); // guardo la lista completa
      setPuntosFiltrados(response.data || []); // al inicio muestro todos
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar puntos:', err);
      setError('Error al cargar los puntos de donación'); // guardo el error para mostrarlo
      setLoading(false);
    }
  };

  // Al montar el mapa: cargo usuario, sus favoritos y los puntos
  useEffect(() => {
    // Leo el usuario guardado en el navegador
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuarioData = JSON.parse(usuarioGuardado);
      setUsuario(usuarioData);
      
      // Los favoritos solo aplican al donante
      if (usuarioData.rol === 'DONANTE' || localStorage.getItem('rol') === 'DONANTE') {
        fetchFavoritos(usuarioData.id);
      }
    }

    // Traigo los puntos apenas se abre el mapa
    fetchPuntosDonacion();

    // Si otra pantalla borra un punto, dispara este evento y recargo el mapa
    const handlePuntoEliminado = () => {
      fetchPuntosDonacion();
    };

    window.addEventListener('puntoEliminado', handlePuntoEliminado); // me suscribo al evento

    // Al desmontar el componente, quito el listener para no dejar basura
    return () => {
      window.removeEventListener('puntoEliminado', handlePuntoEliminado);
    };
  }, []); // [] = solo una vez al montar

  // Trae los favoritos del donante y guarda solo los IDs de los puntos
  const fetchFavoritos = async (usuarioId: number) => {
    try {
      const response = await api.get(`/favoritos/usuario/${usuarioId}`);
      const idsFavoritos = response.data.map((f: Favorito) => f.puntoDonacionId); // extraigo los IDs
      setFavoritos(idsFavoritos);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error al cargar favoritos:', err);
      }
    }
  };

  // Agrega o quita un punto de favoritos (según si ya estaba o no)
  const handleToggleFavorito = async (puntoId: number) => {
    if (!usuario?.id) {
      alert('Debes estar logueado para agregar favoritos'); // sin sesión no se puede
      return;
    }

    const esFavorito = favoritos.includes(puntoId); // ¿ya estaba en favoritos?

    try {
      if (esFavorito) {
        // Si ya era favorito, lo busco y lo borro
        const favorito = await api.get(`/favoritos/usuario/${usuario.id}`);
        const favoritoEncontrado = favorito.data.find((f: Favorito) => f.puntoDonacionId === puntoId);
        if (favoritoEncontrado) {
          await api.delete(`/favoritos/${favoritoEncontrado.id}`); // DELETE en la API
          setFavoritos(favoritos.filter(id => id !== puntoId)); // lo saco del estado
        }
      } else {
        // Si no era favorito, lo agrego
        await api.post('/favoritos', {
          usuarioId: usuario.id,
          puntoDonacionId: puntoId
        });
        setFavoritos([...favoritos, puntoId]); // lo sumo al estado
      }
    } catch (err: any) {
      console.error('Error al gestionar favorito:', err);
      alert('Error al gestionar el favorito');
    }
  };

  // Cada vez que cambia el filtro (o la lista), recalculo qué puntos mostrar
  useEffect(() => {
    if (filtroActivo === 'todos') {
      setPuntosFiltrados(puntosDonacion); // muestro todos
    } else {
      // dejo solo los puntos cuyo tipo coincide con el filtro
      const filtrados = puntosDonacion.filter(punto => {
        const tipos = parsearTiposDonacion(punto.tipoDonacion);
        return tipos.some(tipo => tipo.toLowerCase() === filtroActivo.toLowerCase());
      });
      setPuntosFiltrados(filtrados);
    }
  }, [filtroActivo, puntosDonacion]); // se re-ejecuta si cambia el filtro o los puntos

  // El componente FiltrosDonacion llama a esto al elegir un filtro
  const handleFiltroChange = (filtro: string) => {
    setFiltroActivo(filtro);
  };

  // Mientras carga, muestro un cartel
  if (loading) {
    return <div className="loading">Cargando puntos de donación...</div>;
  }

  // Si hubo error, lo muestro
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
          {/* MapContainer: el mapa de Leaflet, centrado en Córdoba */}
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
        {/* TileLayer: las imágenes del mapa (mapa base gratuito de OpenStreetMap) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Recorro los puntos filtrados y dibujo un marcador por cada uno */}
        {puntosFiltrados.map((punto) => (
          <Marker
            key={punto.id} // key único por punto
            position={[punto.latitud, punto.longitud]} // coordenadas del marcador
            icon={crearIconoPersonalizado(punto.tipoDonacion)} // color según el tipo
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
                  {/* El botón de favorito solo se muestra si el usuario es donante */}
                  {usuario && (usuario.rol === 'DONANTE' || localStorage.getItem('rol') === 'DONANTE') && (
                    <div className="favorito-section">
                      <button
                        className={`favorito-btn ${favoritos.includes(punto.id) ? 'es-favorito' : ''}`} // marca si ya es favorito
                        onClick={() => handleToggleFavorito(punto.id)} // agrega o quita el favorito
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
