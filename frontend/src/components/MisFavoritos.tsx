import React, { useEffect, useState } from 'react';
import api from '../config/axios.config';
import './MisFavoritos.css';

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
}

interface Favorito {
  id: number;
  puntoDonacion?: PuntoDonacion;
  puntoDonacionId?: number;
  etiqueta?: string;
  fechaAgregado: string;
  fechaAgendada?: string;
}

interface MisFavoritosProps {
  usuario: any;
}

const MisFavoritos: React.FC<MisFavoritosProps> = ({ usuario }) => {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEtiqueta, setEditingEtiqueta] = useState<number | null>(null);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [filtroEtiqueta, setFiltroEtiqueta] = useState<string>('todos');

  useEffect(() => {
    if (usuario?.id) {
      fetchFavoritos();
    }
  }, [usuario]);

  const fetchFavoritos = async () => {
    try {
      const response = await api.get(`/favoritos/usuario/${usuario.id}`);
      // Si el backend no incluye el puntoDonacion completo, necesitamos cargarlo
      const favoritosConPuntos = await Promise.all(
        response.data.map(async (favorito: Favorito) => {
          if (!favorito.puntoDonacion && favorito.puntoDonacionId) {
            try {
              const puntoResponse = await api.get(`/puntos-donacion/${favorito.puntoDonacionId}`);
              return { ...favorito, puntoDonacion: puntoResponse.data };
            } catch {
              return favorito;
            }
          }
          return favorito;
        })
      );
      setFavoritos(favoritosConPuntos);
      setLoading(false);
    } catch (err: any) {
      console.error('Error:', err);
      if (err.response?.status === 404) {
        // No hay favoritos aún
        setFavoritos([]);
      } else {
        setError('Error al cargar tus favoritos');
      }
      setLoading(false);
    }
  };

  const handleEliminarFavorito = async (favoritoId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este favorito?')) {
      try {
        await api.delete(`/favoritos/${favoritoId}`);
        fetchFavoritos();
        setError(null);
      } catch (err: any) {
        console.error('Error:', err);
        setError('Error al eliminar el favorito');
      }
    }
  };

  const handleGuardarEtiqueta = async (favoritoId: number) => {
    try {
      await api.put(`/favoritos/${favoritoId}/etiqueta`, { etiqueta: nuevaEtiqueta });
      setEditingEtiqueta(null);
      setNuevaEtiqueta('');
      fetchFavoritos();
      setError(null);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Error al guardar la etiqueta');
    }
  };

  const handleAgendar = async (favoritoId: number, fecha: string) => {
    try {
      await api.put(`/favoritos/${favoritoId}/agendar`, { fechaAgendada: fecha });
      fetchFavoritos();
      setError(null);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Error al agendar el punto');
    }
  };

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

  const formatearHorario = (horario: string | null | undefined): string => {
    if (!horario) return '';
    if (horario.includes(':') && horario.split(':').length === 3) {
      return horario.substring(0, 5) + ' hs';
    }
    if (horario.includes(':') && horario.split(':').length === 2) {
      return horario + ' hs';
    }
    return horario;
  };

  const etiquetasUnicas = Array.from(new Set(favoritos.map(f => f.etiqueta).filter(Boolean)));

  const favoritosFiltrados = filtroEtiqueta === 'todos' 
    ? favoritos 
    : favoritos.filter(f => f.etiqueta === filtroEtiqueta);

  if (loading) {
    return <div className="loading">Cargando tus favoritos...</div>;
  }

  return (
    <div className="mis-favoritos">
      {error && <div className="error-message">{error}</div>}

      {favoritos.length > 0 && (
        <div className="filtros-etiquetas">
          <label>Filtrar por etiqueta:</label>
          <select 
            value={filtroEtiqueta} 
            onChange={(e) => setFiltroEtiqueta(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">Todos</option>
            {etiquetasUnicas.map(etiqueta => (
              <option key={etiqueta} value={etiqueta}>{etiqueta}</option>
            ))}
          </select>
        </div>
      )}

      <div className="favoritos-grid">
        {favoritosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>⭐ No tienes puntos favoritos aún</p>
            <p>Agrega puntos a favoritos desde el mapa para verlos aquí</p>
          </div>
        ) : (
          favoritosFiltrados.map((favorito) => {
            if (!favorito.puntoDonacion) return null;
            return (
            <div key={favorito.id} className="favorito-card">
              <div className="favorito-header">
                <h3>{favorito.puntoDonacion.nombre}</h3>
                <button
                  className="eliminar-favorito-btn"
                  onClick={() => handleEliminarFavorito(favorito.id)}
                  title="Eliminar de favoritos"
                  aria-label="Eliminar de favoritos"
                >
                </button>
              </div>

              <div className="favorito-info">
                <div className="tipos-favorito">
                  {parsearTiposDonacion(favorito.puntoDonacion.tipoDonacion).map((tipo, idx) => (
                    <span key={idx} className={`tipo-badge ${tipo.toLowerCase()}`}>
                      {tipo.toUpperCase()}
                    </span>
                  ))}
                </div>

                <p><strong>📍 Dirección:</strong> {favorito.puntoDonacion.direccion}</p>
                
                {favorito.puntoDonacion.horarioApertura && favorito.puntoDonacion.horarioCierre && (
                  <p><strong>🕒 Horario:</strong> {formatearHorario(favorito.puntoDonacion.horarioApertura)} - {formatearHorario(favorito.puntoDonacion.horarioCierre)}</p>
                )}

                {favorito.puntoDonacion.telefono && (
                  <p><strong>📞 Teléfono:</strong> 
                    <a href={`tel:${favorito.puntoDonacion.telefono}`} className="contact-link">
                      {favorito.puntoDonacion.telefono}
                    </a>
                  </p>
                )}

                {favorito.puntoDonacion.email && (
                  <p><strong>✉️ Email:</strong> 
                    <a href={`mailto:${favorito.puntoDonacion.email}`} className="contact-link">
                      {favorito.puntoDonacion.email}
                    </a>
                  </p>
                )}

                <div className="etiqueta-section">
                  {editingEtiqueta === favorito.id ? (
                    <div className="etiqueta-editor">
                      <input
                        type="text"
                        value={nuevaEtiqueta}
                        onChange={(e) => setNuevaEtiqueta(e.target.value)}
                        placeholder="Ej: Urgente, Semana próxima, etc."
                        className="etiqueta-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleGuardarEtiqueta(favorito.id);
                          }
                        }}
                      />
                      <button 
                        className="btn-guardar"
                        onClick={() => handleGuardarEtiqueta(favorito.id)}
                      >
                        Guardar
                      </button>
                      <button 
                        className="btn-cancelar"
                        onClick={() => {
                          setEditingEtiqueta(null);
                          setNuevaEtiqueta('');
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="etiqueta-display">
                      <span className="etiqueta-label">
                        🏷️ Etiqueta: {favorito.etiqueta || 'Sin etiqueta'}
                      </span>
                      <button
                        className="btn-editar-etiqueta"
                        onClick={() => {
                          setEditingEtiqueta(favorito.id);
                          setNuevaEtiqueta(favorito.etiqueta || '');
                        }}
                      >
                        {favorito.etiqueta ? '✏️ Editar' : '➕ Agregar'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="agendar-section">
                  <label><strong>📅 Agendar visita:</strong></label>
                  <input
                    type="date"
                    min="2025-01-01"
                    max="2025-12-31"
                    value={favorito.fechaAgendada ? favorito.fechaAgendada.split('T')[0] : ''}
                    onChange={(e) => {
                      const fechaSeleccionada = e.target.value;
                      // Solo actualizar cuando se seleccione una fecha completa válida
                      if (fechaSeleccionada && fechaSeleccionada.length === 10) {
                        // El input de fecha devuelve formato YYYY-MM-DD
                        // Asegurarnos de que el año sea 2025
                        const partes = fechaSeleccionada.split('-');
                        if (partes.length === 3) {
                          const año = parseInt(partes[0]);
                          const mes = partes[1];
                          const dia = partes[2];
                          // Si el año no es 2025, corregirlo
                          const fechaFinal = año === 2025 
                            ? fechaSeleccionada 
                            : `2025-${mes}-${dia}`;
                          handleAgendar(favorito.id, fechaFinal);
                        }
                      } else if (!fechaSeleccionada) {
                        // Si se borra la fecha
                        handleAgendar(favorito.id, '');
                      }
                    }}
                    onBlur={(e) => {
                      // Asegurar que se guarde cuando se pierde el foco
                      const fechaSeleccionada = e.target.value;
                      if (fechaSeleccionada && fechaSeleccionada.length === 10) {
                        const partes = fechaSeleccionada.split('-');
                        if (partes.length === 3) {
                          const año = parseInt(partes[0]);
                          const mes = partes[1];
                          const dia = partes[2];
                          const fechaFinal = año === 2025 
                            ? fechaSeleccionada 
                            : `2025-${mes}-${dia}`;
                          if (fechaFinal !== (favorito.fechaAgendada ? favorito.fechaAgendada.split('T')[0] : '')) {
                            handleAgendar(favorito.id, fechaFinal);
                          }
                        }
                      }
                    }}
                    className="fecha-input"
                  />
                  {favorito.fechaAgendada && (
                    <p className="fecha-agendada">
                      Agendado para: {new Date(favorito.fechaAgendada).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>

                <div className="favorito-actions">
                  <a 
                    href={`tel:${favorito.puntoDonacion.telefono}`}
                    className="action-btn call-btn"
                    style={{ display: favorito.puntoDonacion.telefono ? 'inline-flex' : 'none' }}
                  >
                    📞 Llamar
                  </a>
                  <a 
                    href={`mailto:${favorito.puntoDonacion.email}`}
                    className="action-btn email-btn"
                    style={{ display: favorito.puntoDonacion.email ? 'inline-flex' : 'none' }}
                  >
                    ✉️ Email
                  </a>
                  <button
                    className="action-btn directions-btn"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${favorito.puntoDonacion.latitud},${favorito.puntoDonacion.longitud}`;
                      window.open(url, '_blank');
                    }}
                  >
                    🗺️ Cómo llegar
                  </button>
                </div>
              </div>
            </div>
          );
          })
        )}
      </div>
    </div>
  );
};

export default MisFavoritos;

