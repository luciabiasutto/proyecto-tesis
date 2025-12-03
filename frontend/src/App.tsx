import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginUnificado from './components/LoginUnificado';
import donanteLogo from './assets/donante.png';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [rol, setRol] = useState<string>('');

  useEffect(() => {
    // Verificar si hay un usuario logueado
    const usuarioGuardado = localStorage.getItem('usuario');
    const rolGuardado = localStorage.getItem('rol');
    if (usuarioGuardado && rolGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
      setRol(rolGuardado);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (usuarioData: any, rolData: string) => {
    setUsuario(usuarioData);
    setRol(rolData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    setUsuario(null);
    setRol('');
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!isLoggedIn) {
    return <LoginUnificado onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <div className="app-header">
        <div className="header-info">
          <h1>Sistema de Donaciones</h1>
          <div className="user-info">
            <span className="user-name">
              {usuario?.nombre} {usuario?.apellido}
            </span>
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
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
      <Dashboard usuario={usuario} rol={rol} />
    </div>
  );
}

export default App;