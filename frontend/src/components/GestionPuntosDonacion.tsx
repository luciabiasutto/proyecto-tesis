import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../config/axios.config';
import './GestionPuntosDonacion.css';

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
}

/**
 * Componente para gestionar los puntos de donación
 * Permite al administrador ver todos los puntos (activos e inactivos),
 * crear nuevos, editar y desactivar puntos existentes
 */
const GestionPuntosDonacion: React.FC = () => {
  const [puntos, setPuntos] = useState<PuntoDonacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // Controla si se muestra el formulario en modal
  const [editingPunto, setEditingPunto] = useState<PuntoDonacion | null>(null); // Punto que se está editando

  // Tipos de donación disponibles en el sistema
  const tiposDonacionDisponibles = ['ropa', 'vidrio', 'plastico', 'papel', 'organicos', 'otros'];
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    latitud: '',
    longitud: '',
    tiposDonacion: [] as string[],
    horarioApertura: '',
    horarioCierre: '',
    telefono: '',
    email: ''
  });

  // Cargo los puntos al montar el componente
  useEffect(() => {
    fetchPuntos();
  }, []);

  /**
   * Obtiene todos los puntos de donación del servidor
   * Uso el parámetro "todos=true" para obtener también los puntos desactivados
   * Normalizo el campo "activo" porque puede venir en diferentes formatos desde el backend
   */
  const fetchPuntos = async () => {
    try {
      const response = await api.get('/puntos-donacion', {
        params: { todos: 'true' } // Solicito todos los puntos, no solo los activos
      });
      
      // Normalizo el campo "activo" porque puede venir como boolean, number o string
      // Esto me ayuda a evitar errores de tipo
      const puntosConActivo = (response.data || []).map((p: any) => {
        let activoNormalizado: boolean;
        if (p.activo === undefined || p.activo === null) {
          activoNormalizado = true; // Por defecto, si no tiene activo, asumo que está activo
        } else if (typeof p.activo === 'boolean') {
          activoNormalizado = p.activo;
        } else if (typeof p.activo === 'number') {
          activoNormalizado = p.activo !== 0; // 0 = false, cualquier otro = true
        } else if (typeof p.activo === 'string') {
          activoNormalizado = p.activo.toLowerCase() === 'true' || p.activo === '1';
        } else {
          activoNormalizado = true; // Por defecto
        }
        
        return {
          ...p,
          activo: activoNormalizado
        };
      });
      
      setPuntos(puntosConActivo);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar puntos:', err);
      setError('Error al cargar los puntos de donación');
      setLoading(false);
    }
  };

  /**
   * Maneja el envío del formulario (crear o editar punto)
   * Valida los datos antes de enviarlos al servidor
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación: debe haber al menos un tipo de donación seleccionado
    if (formData.tiposDonacion.length === 0) {
      setError('Debes seleccionar al menos un tipo de donación');
      return;
    }
    
    try {
      const puntoData = {
        ...formData,
        tipoDonacion: JSON.stringify(formData.tiposDonacion), // Convertir array a JSON string
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        activo: true
      };
      // Eliminar tiposDonacion del objeto que se envía
      delete (puntoData as any).tiposDonacion;

      let response;
      if (editingPunto) {
        response = await api.put(`/puntos-donacion/${editingPunto.id}`, puntoData);
      } else {
        response = await api.post('/puntos-donacion', puntoData);
      }

      if (response.status === 200) {
        fetchPuntos();
        setShowForm(false);
        setEditingPunto(null);
        setFormData({
          nombre: '',
          direccion: '',
          latitud: '',
          longitud: '',
          tiposDonacion: [],
          horarioApertura: '',
          horarioCierre: '',
          telefono: '',
          email: ''
        });
        setError(null);
      }
    } catch (err: any) {
      console.error('Error:', err);
      if (err.response?.data) {
        setError(`Error: ${err.response.data}`);
      } else {
        setError('Error al guardar el punto de donación');
      }
    }
  };

  const handleEdit = (punto: PuntoDonacion) => {
    setEditingPunto(punto);
    
    // Parsear tipoDonacion (puede ser JSON string o string simple)
    let tiposDonacion: string[] = [];
    try {
      tiposDonacion = JSON.parse(punto.tipoDonacion);
      if (!Array.isArray(tiposDonacion)) {
        tiposDonacion = [punto.tipoDonacion];
      }
    } catch {
      // Si no es JSON, es un string simple
      tiposDonacion = [punto.tipoDonacion];
    }
    
    setFormData({
      nombre: punto.nombre,
      direccion: punto.direccion,
      latitud: punto.latitud.toString(),
      longitud: punto.longitud.toString(),
      tiposDonacion: tiposDonacion,
      horarioApertura: punto.horarioApertura || '',
      horarioCierre: punto.horarioCierre || '',
      telefono: punto.telefono || '',
      email: punto.email || ''
    });
    setShowForm(true);
  };

  /**
   * Elimina un punto de donación
   * Pido doble confirmación porque es una acción irreversible
   * Para puntos de admin, solo los desactiva (soft delete)
   * Para puntos de organizaciones, los elimina físicamente (hard delete)
   */
  const handleDelete = async (id: number) => {
    const confirmar = window.confirm('¿Estás seguro de que quieres eliminar este punto de donación?\n\nEsta acción no se puede deshacer.');
    if (confirmar) {
      const confirmar2 = window.confirm('Última confirmación:\n\n¿Realmente quieres eliminar este punto?');
      if (confirmar2) {
        try {
          await api.delete(`/puntos-donacion/${id}`);
          // Actualizo el estado local marcando el punto como desactivado
          setPuntos(prevPuntos => 
            prevPuntos.map(p => 
              p.id === id ? { ...p, activo: false } : p
            )
          );
          // Recargo los puntos después de un pequeño delay para asegurar que se actualizó en el servidor
          setTimeout(async () => {
            await fetchPuntos();
          }, 300);
          setError(null);
          alert('Punto eliminado correctamente.');
        } catch (err: any) {
          console.error('Error al eliminar:', err);
          if (err.response?.data) {
            setError(`Error: ${err.response.data}`);
            alert(`Error: ${err.response.data}`);
          } else {
            setError('Error al eliminar el punto de donación');
            alert('Error al eliminar el punto de donación');
          }
        }
      }
    }
  };

  /**
   * Cambia el estado activo/inactivo de un punto
   * No elimina el punto, solo lo desactiva para que no aparezca en el mapa público
   * Actualizo el estado local inmediatamente para mejor UX (optimistic update)
   */
  const toggleActivo = async (id: number, activo: boolean) => {
    try {
      const nuevoEstado = !activo;
      const puntoActual = puntos.find(p => p.id === id);
      if (!puntoActual) {
        alert('Error: No se encontró el punto en la lista');
        return;
      }
      
      // Envío la actualización al servidor
      await api.put(`/puntos-donacion/${id}`, { activo: nuevoEstado });
      
      // Actualizo el estado local inmediatamente (optimistic update)
      // Esto hace que la UI responda más rápido sin esperar la respuesta del servidor
      setPuntos(prevPuntos => 
        prevPuntos.map(p => 
          p.id === id ? { ...p, activo: nuevoEstado } : p
        )
      );
      
      setError(null);
      alert(`Punto ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);
    } catch (err: any) {
      console.error('Error al cambiar estado:', err);
      if (err.response?.data) {
        const errorMessage = typeof err.response.data === 'string' 
          ? err.response.data 
          : err.response.data.message || JSON.stringify(err.response.data);
        setError(`Error: ${errorMessage}`);
        alert(`Error: ${errorMessage}`);
      } else {
        setError('Error al actualizar el estado del punto');
        alert('Error al actualizar el estado del punto');
      }
    }
  };

  if (loading) return <div className="loading">Cargando puntos de donación...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="gestion-puntos-donacion">
      {!showForm && (
        <div className="header">
          <h2>📍 Gestión de Puntos de Donación</h2>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setEditingPunto(null);
              setFormData({
                nombre: '',
                direccion: '',
                latitud: '',
                longitud: '',
                tiposDonacion: [],
                horarioApertura: '',
                horarioCierre: '',
                telefono: '',
                email: ''
              });
            }}
          >
            Nuevo Punto
          </button>
        </div>
      )}

      {showForm && createPortal(
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingPunto ? 'Editar Punto' : 'Nuevo Punto de Donación'}</h3>
              <button 
                type="button"
                className="form-modal-close"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>
            <form className="punto-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Centro *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipos de Donación * (puedes seleccionar varios)</label>
                  <div className="checkbox-group">
                    {tiposDonacionDisponibles.map((tipo) => (
                      <label key={tipo} className="checkbox-label">
                        <div className="checkbox-wrapper">
                          <input
                            type="checkbox"
                            checked={formData.tiposDonacion.includes(tipo)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  tiposDonacion: [...formData.tiposDonacion, tipo]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  tiposDonacion: formData.tiposDonacion.filter(t => t !== tipo)
                                });
                              }
                            }}
                          />
                          {formData.tiposDonacion.includes(tipo) && (
                            <span className="checkmark">✓</span>
                          )}
                        </div>
                        <span>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                  {formData.tiposDonacion.length === 0 && (
                    <p className="error-text" style={{ fontSize: '0.85rem', color: '#e74c3c', marginTop: '5px' }}>
                      Selecciona al menos un tipo de donación
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Dirección *</label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitud *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitud}
                    onChange={(e) => setFormData({...formData, latitud: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Longitud *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitud}
                    onChange={(e) => setFormData({...formData, longitud: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Horario de Apertura</label>
                  <input
                    type="time"
                    value={formData.horarioApertura}
                    onChange={(e) => setFormData({...formData, horarioApertura: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Horario de Cierre</label>
                  <input
                    type="time"
                    value={formData.horarioCierre}
                    onChange={(e) => setFormData({...formData, horarioCierre: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingPunto ? 'Actualizar' : 'Crear'} Punto
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {!showForm && (
      <div className="puntos-grid">
        <h3>Puntos de Donación ({puntos.length})</h3>
        {puntos.length === 0 ? (
          <div className="no-data">No hay puntos de donación registrados</div>
        ) : (
          puntos.map(punto => (
            <div key={punto.id} className={`punto-card ${!punto.activo ? 'inactivo' : ''}`}>
                <div className="punto-header">
                  <h4>{punto.nombre}</h4>
                  <span className={`estado ${punto.activo ? 'activo' : 'inactivo'}`}>
                    {punto.activo ? 'Activo' : 'Desactivado'}
                  </span>
                </div>
                
                <div className="punto-info">
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
                  
                  {punto.horarioApertura && punto.horarioCierre && (
                    <p><strong>Horario:</strong> {formatearHorario(punto.horarioApertura)} - {formatearHorario(punto.horarioCierre)}</p>
                  )}
                  
                  {punto.telefono && (
                    <p><strong>Teléfono:</strong> {punto.telefono}</p>
                  )}
                  
                  {punto.email && (
                    <p><strong>Email:</strong> {punto.email}</p>
                  )}
                </div>

                <div className="punto-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(punto)}
                  >
                    Editar
                  </button>
                  <button 
                    type="button"
                    className={`btn btn-sm ${punto.activo ? 'btn-warning' : 'btn-success'}`}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        await toggleActivo(punto.id, punto.activo);
                      } catch (error) {
                        console.error('Error en onClick:', error);
                        alert('Error al cambiar el estado del punto.');
                      }
                    }}
                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                  >
                    {punto.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button 
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      handleDelete(punto.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
      )}
    </div>
  );
};

export default GestionPuntosDonacion;

