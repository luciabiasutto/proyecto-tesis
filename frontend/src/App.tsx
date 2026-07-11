import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginUnificado from './components/LoginUnificado';
import donanteLogo from './assets/donante.png';
import './App.css';

// Componente raíz: controla la sesión y decide si mostrar el login o el dashboard
function App() {
  // Estados de la sesión: si está logueado, el usuario, su rol y si aún está cargando
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [rol, setRol] = useState<string>('');

  // Al cargar la app, reviso si ya había una sesión guardada en el navegador
  useEffect(() => {
    // Leo usuario y rol del localStorage (persisten aunque recargue la página)
    const usuarioGuardado = localStorage.getItem('usuario');
    const rolGuardado = localStorage.getItem('rol');
    // Si existen, restauro la sesión sin pedir login de nuevo
    if (usuarioGuardado && rolGuardado) {
      setUsuario(JSON.parse(usuarioGuardado)); // parseo el texto a objeto
      setRol(rolGuardado);
      setIsLoggedIn(true);
    }
    setLoading(false); // termino la carga inicial
  }, []); // [] = se ejecuta una sola vez al montar

  // Se ejecuta cuando el login es exitoso: guarda el usuario en el estado
  const handleLogin = (usuarioData: any, rolData: string) => {
    setUsuario(usuarioData);
    setRol(rolData);
    setIsLoggedIn(true);
  };

  // Cierra sesión: limpia el localStorage y resetea el estado
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    setUsuario(null);
    setRol('');
    setIsLoggedIn(false);
  };

  // Mientras verifico la sesión muestro un cartel de carga
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // Si no hay sesión, muestro la pantalla de login
  if (!isLoggedIn) {
    return <LoginUnificado onLogin={handleLogin} />;
  }

  // Si hay sesión, muestro el encabezado con datos del usuario y el dashboard
  return (
    <div className="App">
      <div className="app-header">
        <div className="header-info">
          <h1>Sistema de Donaciones</h1>
          <div className="user-info">
            {/* Muestro nombre y apellido del usuario logueado */}
            <span className="user-name">
              {usuario?.nombre} {usuario?.apellido}
            </span>
            {/* Muestro una insignia distinta según el rol */}
            <span className="user-role">
              {rol === 'DONANTE' && (
                <span className="role-badge-donante">
                  <img src={donanteLogo} alt="Donante" className="role-logo" />
                  <span>Donante</span>
                </span>
              )}
              {rol === 'ADMINISTRADOR' && '⚙️ Administrador'}
              {rol === 'ORGANIZACION' && '🏢 Organización'}
            </span>
          </div>
        </div>
        {/* Botón que dispara el cierre de sesión */}
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
      {/* Le paso usuario y rol al Dashboard para que muestre las vistas correctas */}
      <Dashboard usuario={usuario} rol={rol} />
    </div>
  );
}

export default App;