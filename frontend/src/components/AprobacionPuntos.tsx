import React, { useEffect, useState } from 'react';
import api from '../config/axios.config';
import './AprobacionPuntos.css';

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
  estado?: string;
  motivoRechazo?: string;
  usuarioCreadorId?: number;
  tipoCreador?: string;
}

const AprobacionPuntos: React.FC = () => {
  const [puntos, setPuntos] = useState<PuntoDonacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rechazoModal, setRechazoModal] = useState<{ show: boolean; puntoId: number | null; motivo: string }>({
    show: false,
    puntoId: null,
    motivo: ''
  });

  useEffect(() => {
    fetchPuntosPendientes();
  }, []);

  const fetchPuntosPendientes = async () => {
    try {
      const response = await api.get('/puntos-donacion/pendientes');
      setPuntos(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los puntos pendientes');
      setLoading(false);
    }
  };

  const handleAprobar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres aprobar este punto? Se publicará en el mapa.')) {
      return;
    }

    try {
      await api.post(`/puntos-donacion/${id}/aprobar`);
      setError(null);
      fetchPuntosPendientes();
    } catch (err: any) {
      console.error('Error:', err);
      setError('Error al aprobar el punto');
    }
  };

  const handleRechazar = async () => {
    if (!rechazoModal.puntoId || !rechazoModal.motivo.trim()) {
      setError('Debes ingresar un motivo de rechazo');
      return;
    }

    try {
      await api.post(`/puntos-donacion/${rechazoModal.puntoId}/rechazar`, {
        motivoRechazo: rechazoModal.motivo
      });
      setError(null);
      setRechazoModal({ show: false, puntoId: null, motivo: '' });
      fetchPuntosPendientes();
    } catch (err: any) {
      console.error('Error:', err);
      setError('Error al rechazar el punto');
    }
  };

  if (loading) {
    return <div className="loading">Cargando puntos pendientes...</div>;
  }

  return (
    <div className="aprobacion-puntos">
      <div className="header-section">
        <h2>✅ Aprobar Puntos de Donación</h2>
        <div className="contador">
          {puntos.length} punto{puntos.length !== 1 ? 's' : ''} pendiente{puntos.length !== 1 ? 's' : ''}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {puntos.length === 0 ? (
        <div className="empty-state">
          <p>🎉 ¡No hay puntos pendientes de aprobación!</p>
          <p>Todos los puntos han sido revisados.</p>
        </div>
      ) : (
        <div className="puntos-list">
          {puntos.map((punto) => (
            <div key={punto.id} className="punto-card">
              <div className="punto-header">
                <h3>{punto.nombre}</h3>
                <span className="estado-badge pendiente">⏳ Pendiente</span>
              </div>
              
              <div className="punto-info">
                <div className="info-grid">
                  <div>
                    <p><strong>Tipos:</strong> {
                      (() => {
                        try {
                          const tipos = JSON.parse(punto.tipoDonacion);
                          if (Array.isArray(tipos)) {
                            return tipos.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
                          }
                        } catch {
                          // Si no es JSON, mostrar como string simple
                        }
                        return punto.tipoDonacion.charAt(0).toUpperCase() + punto.tipoDonacion.slice(1);
                      })()
                    }</p>
                    <p><strong>Dirección:</strong> {punto.direccion}</p>
                    <p><strong>Coordenadas:</strong> {punto.latitud}, {punto.longitud}</p>
                  </div>
                  <div>
                    {punto.horarioApertura && punto.horarioCierre && (
                      <p><strong>Horario:</strong> {formatearHorario(punto.horarioApertura)} - {formatearHorario(punto.horarioCierre)}</p>
                    )}
                    {punto.telefono && <p><strong>Teléfono:</strong> {punto.telefono}</p>}
                    {punto.email && <p><strong>Email:</strong> {punto.email}</p>}
                  </div>
                </div>
                
                {punto.usuarioCreadorId && (
                  <div className="creador-info">
                    <p><strong>Creado por:</strong> Organización ID #{punto.usuarioCreadorId}</p>
                  </div>
                )}
              </div>

              <div className="punto-actions">
                <button 
                  onClick={() => handleAprobar(punto.id)} 
                  className="btn-approve"
                >
                  ✅ Aprobar
                </button>
                <button 
                  onClick={() => setRechazoModal({ show: true, puntoId: punto.id, motivo: '' })}
                  className="btn-reject"
                >
                  ❌ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rechazoModal.show && (
        <div className="modal-overlay" onClick={() => setRechazoModal({ show: false, puntoId: null, motivo: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Rechazar Punto de Donación</h3>
            <p>Ingresa el motivo del rechazo (será visible para la organización):</p>
            <textarea
              value={rechazoModal.motivo}
              onChange={(e) => setRechazoModal({ ...rechazoModal, motivo: e.target.value })}
              placeholder="Ej: Información incompleta, dirección incorrecta, etc."
              rows={4}
              className="motivo-input"
            />
            <div className="modal-actions">
              <button onClick={handleRechazar} className="btn-reject">
                Confirmar Rechazo
              </button>
              <button 
                onClick={() => setRechazoModal({ show: false, puntoId: null, motivo: '' })}
                className="btn-cancel"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AprobacionPuntos;


