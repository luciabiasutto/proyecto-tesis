import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  email: string;
  direccion: string;
  password: string;
}

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState<RegisterData>({
    nombre: '',
    apellido: '',
    documento: '',
    telefono: '',
    email: '',
    direccion: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', loginData);
      if (response.data.success) {
        localStorage.setItem('beneficiario', JSON.stringify(response.data.beneficiario));
        setSuccess('¡Inicio de sesión exitoso!');
        setError(null);
        // Aquí podrías redirigir al dashboard
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data || 'Error al iniciar sesión');
      setSuccess(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', registerData);
      if (response.data.success) {
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setError(null);
        setIsLogin(true);
        setRegisterData({
          nombre: '',
          apellido: '',
          documento: '',
          telefono: '',
          email: '',
          direccion: '',
          password: ''
        });
      }
    } catch (err: any) {
      setError(err.response?.data || 'Error al registrar');
      setSuccess(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isLogin: boolean) => {
    if (isLogin) {
      setLoginData({ ...loginData, [e.target.name]: e.target.value });
    } else {
      setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginData.email}
                onChange={(e) => handleInputChange(e, true)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={(e) => handleInputChange(e, true)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Iniciar Sesión
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={registerData.nombre}
                onChange={(e) => handleInputChange(e, false)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellido">Apellido:</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={registerData.apellido}
                onChange={(e) => handleInputChange(e, false)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="documento">Documento:</label>
              <input
                type="text"
                id="documento"
                name="documento"
                value={registerData.documento}
                onChange={(e) => handleInputChange(e, false)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Teléfono:</label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={registerData.telefono}
                onChange={(e) => handleInputChange(e, false)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={registerData.email}
                onChange={(e) => handleInputChange(e, false)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="direccion">Dirección:</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={registerData.direccion}
                onChange={(e) => handleInputChange(e, false)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={registerData.password}
                onChange={(e) => handleInputChange(e, false)}
                required
              />
            </div>
            <button type="submit" className="register-button">
              Registrarse
            </button>
          </form>
        )}

        <div className="toggle-form">
          <p>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="toggle-button"
            >
              {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;