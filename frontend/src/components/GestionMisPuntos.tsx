import React, { useEffect, useState } from 'react';
import api from '../config/axios.config';
import './GestionMisPuntos.css';

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
}

const GestionMisPuntos: React.FC = () => {
  const [puntos, setPuntos] = useState<PuntoDonacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPunto, setEditingPunto] = useState<PuntoDonacion | null>(null);
  const [usuario, setUsuario] = useState<any>(null);

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

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuarioData = JSON.parse(usuarioGuardado);
      setUsuario(usuarioData);
      fetchPuntos(usuarioData.id);
    }
  }, []);

  const fetchPuntos = async (organizacionId: number) => {
    try {
      const response = await api.get(`/puntos-donacion/organizacion/${organizacionId}`);
      setPuntos(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar tus puntos de donación');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que al menos un tipo de donación esté seleccionado
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
        activo: true,
        usuarioCreadorId: usuario?.id,
        tipoCreador: 'ORGANIZACION'
      };
      // Eliminar tiposDonacion del objeto que se envía
      delete (puntoData as any).tiposDonacion;

      let response;
      if (editingPunto) {
        // Al editar, incluir el usuarioCreadorId para validación de permisos
        const puntoDataEdit = {
          ...puntoData,
          usuarioCreadorId: usuario?.id
        };
        response = await api.put(`/puntos-donacion/${editingPunto.id}`, puntoDataEdit);
      } else {
        response = await api.post('/puntos-donacion', puntoData);
      }

      if (response.status === 200 || response.status === 201) {
        fetchPuntos(usuario.id);
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
    // Solo permitir editar si está pendiente o rechazado
    if (punto.estado === 'ACTIVO') {
      setError('No puedes editar un punto que ya fue aprobado. Contacta al administrador.');
      return;
    }
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

  const handleDelete = async (id: number) => {
    if (!usuario?.id) {
      setError('Error: No se pudo identificar tu usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar este punto de donación?\n\nEsta acción no se puede deshacer.')) {
      try {
        await api.delete(`/puntos-donacion/${id}`, {
          params: { usuarioId: usuario.id }
        });
        
        await fetchPuntos(usuario.id);
        setError(null);
        alert('Punto eliminado correctamente');
      } catch (err: any) {
        console.error('Error al eliminar:', err);
        if (err.response?.status === 403) {
          setError('No tienes permisos para eliminar este punto');
          alert('No tienes permisos para eliminar este punto');
        } else if (err.response?.status === 400) {
          setError('Error: Falta información del usuario');
          alert('Error: Falta información del usuario. Por favor, inicia sesión nuevamente.');
        } else if (err.response?.status === 404) {
          setError('El punto no fue encontrado');
          alert('El punto no fue encontrado');
        } else if (err.response?.data) {
          const errorMsg = typeof err.response.data === 'string' 
            ? err.response.data 
            : err.response.data.message || JSON.stringify(err.response.data);
          setError(`Error: ${errorMsg}`);
          alert(`Error: ${errorMsg}`);
        } else {
          setError('Error al eliminar el punto de donación');
          alert('Error al eliminar el punto de donación');
        }
      }
    }
  };

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <span className="estado-badge pendiente">⏳ Pendiente</span>;
      case 'ACTIVO':
        return <span className="estado-badge activo">✅ Aprobado</span>;
      case 'RECHAZADO':
        return <span className="estado-badge rechazado">❌ Rechazado</span>;
      default:
        return <span className="estado-badge activo">✅ Activo</span>;
    }
  };

  if (loading) {
    return <div className="loading">Cargando tus puntos de donación...</div>;
  }

  return (
    <div className="gestion-mis-puntos">
      <div className="header-section">
        <h2>📍 Mis Puntos de Donación</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Crear Nuevo Punto'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>{editingPunto ? 'Editar Punto' : 'Crear Nuevo Punto'}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del Punto *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, latitud: e.target.value })}
                placeholder="-31.4201"
                required
              />
            </div>
            <div className="form-group">
              <label>Longitud *</label>
              <input
                type="number"
                step="any"
                value={formData.longitud}
                onChange={(e) => setFormData({ ...formData, longitud: e.target.value })}
                placeholder="-64.1888"
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
                onChange={(e) => setFormData({ ...formData, horarioApertura: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Horario de Cierre</label>
              <input
                type="time"
                value={formData.horarioCierre}
                onChange={(e) => setFormData({ ...formData, horarioCierre: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingPunto ? 'Actualizar' : 'Crear Punto'}
            </button>
            <button type="button" onClick={() => {
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
            }} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="info-box">
        <p>ℹ️ Los puntos que crees quedarán en estado <strong>"Pendiente"</strong> hasta que un administrador los apruebe.</p>
        <p>Una vez aprobados, aparecerán en el mapa público.</p>
      </div>

      <div className="puntos-list">
        {puntos.length === 0 ? (
          <div className="empty-state">
            <p>No has creado ningún punto de donación aún.</p>
            <p>¡Crea tu primer punto usando el botón de arriba!</p>
          </div>
        ) : (
          puntos.map((punto) => (
            <div key={punto.id} className="punto-card">
              <div className="punto-header">
                <h3>{punto.nombre}</h3>
                {getEstadoBadge(punto.estado)}
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
                {punto.horarioApertura && punto.horarioCierre && (
                  <p><strong>Horario:</strong> {formatearHorario(punto.horarioApertura)} - {formatearHorario(punto.horarioCierre)}</p>
                )}
                {punto.telefono && <p><strong>Teléfono:</strong> {punto.telefono}</p>}
                {punto.email && <p><strong>Email:</strong> {punto.email}</p>}
                {punto.motivoRechazo && (
                  <div className="rechazo-box">
                    <p><strong>Motivo de rechazo:</strong></p>
                    <p>{punto.motivoRechazo}</p>
                  </div>
                )}
              </div>
              <div className="punto-actions">
                {punto.estado !== 'ACTIVO' && (
                  <button onClick={() => handleEdit(punto)} className="btn-edit">
                    ✏️ Editar
                  </button>
                )}
                <button onClick={() => handleDelete(punto.id)} className="btn-delete">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GestionMisPuntos;

