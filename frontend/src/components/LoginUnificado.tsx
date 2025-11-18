import React, { useState } from 'react';
import api from '../config/axios.config';
import './LoginUnificado.css';
// Importar el logo - Asegúrate de que el archivo esté en src/assets/
// Cambia 'logo.png' por el nombre de tu archivo (puede ser .png, .jpg, .svg, etc.)
import logo from '../assets/logo.png';

// Componente para el formulario de recuperación de contraseña
const RecuperarPasswordForm: React.FC<{ onBack: () => void; onSuccess: () => void }> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('DONANTE');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/password/solicitar', { email, rol });
      if (response.data.success) {
        setSuccess('Si el email existe, se ha enviado un enlace de recuperación a tu correo.');
        setTimeout(() => onSuccess(), 2000);
      } else {
        setError(response.data.message || 'Error al solicitar recuperación');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Tipo de Usuario *</label>
        <select value={rol} onChange={(e) => setRol(e.target.value)} required>
          <option value="DONANTE">Donante</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="ORGANIZACION">Organización</option>
        </select>
      </div>
      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
      </button>
      <div className="back-to-login">
        <button type="button" onClick={onBack} className="link-button">
          ← Volver al Login
        </button>
      </div>
    </form>
  );
};

interface LoginUnificadoProps {
  onLogin: (usuario: any, rol: string) => void;
}

const LoginUnificado: React.FC<LoginUnificadoProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showRecuperarPassword, setShowRecuperarPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    documento: '',
    rol: 'DONANTE',
    codigoSeguridad: '', // Código de seguridad para administradores
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCodigoSeguridad, setShowCodigoSeguridad] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validar contraseña en tiempo real si es el campo de contraseña
    if (name === 'password' && !isLogin) {
      validatePassword(value);
    }
  };
  
  const validatePassword = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validación básica del formulario HTML5
    const form = e.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
          rol: formData.rol
        });

        if (response.data.success) {
          localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
          localStorage.setItem('rol', response.data.rol);
          onLogin(response.data.usuario, response.data.rol);
        } else {
          setError('Credenciales incorrectas');
        }
      } else {
        // Registro
        // Validar código de seguridad si es administrador u organización
        if (formData.rol === 'ADMINISTRADOR' || formData.rol === 'ORGANIZACION') {
          if (!formData.codigoSeguridad || formData.codigoSeguridad.trim() === '') {
            setError('El código de seguridad es requerido');
            setLoading(false);
            return;
          }
          // Códigos de seguridad
          const codigoAdmin = 'ADMIN2024'; // Código para administradores
          const codigoOrg = 'ORG2024'; // Código para organizaciones
          
          if (formData.rol === 'ADMINISTRADOR' && formData.codigoSeguridad !== codigoAdmin) {
            setError('Código de seguridad incorrecto para administrador');
            setLoading(false);
            return;
          }
          
          if (formData.rol === 'ORGANIZACION' && formData.codigoSeguridad !== codigoOrg) {
            setError('Código de seguridad incorrecto para organización');
            setLoading(false);
            return;
          }
        }

        // Asegurar que el rol esté presente y en mayúsculas
        let rolNormalizado = (formData.rol || 'DONANTE').toString().toUpperCase().trim();
        
        // Validar que el rol sea válido
        const rolesValidos = ['DONANTE', 'ADMINISTRADOR', 'ORGANIZACION'];
        if (!rolesValidos.includes(rolNormalizado)) {
          setError(`Rol inválido: ${rolNormalizado}. Debe ser uno de: ${rolesValidos.join(', ')}`);
          setLoading(false);
          return;
        }
        
        // Construir el objeto de datos a enviar - EXPLÍCITAMENTE con el rol
        const registerData: any = {};
        
        // Campos básicos requeridos para todos
        registerData.nombre = formData.nombre || '';
        registerData.email = formData.email || '';
        registerData.password = formData.password || '';
        registerData.rol = rolNormalizado; // SIEMPRE incluir el rol
        
        // Agregar campos según el rol
        if (rolNormalizado === 'DONANTE') {
          registerData.apellido = formData.apellido || '';
        } else if (rolNormalizado === 'ADMINISTRADOR') {
          registerData.apellido = formData.apellido || '';
        }
        // Para ORGANIZACION no agregamos apellido
        
        // Verificación final antes de enviar
        if (!registerData.rol || registerData.rol.trim() === '') {
          setError('Error: El rol no está definido. Por favor, selecciona un tipo de usuario.');
          setLoading(false);
          return;
        }
        
        console.log('=== DEBUG REGISTRO ===');
        console.log('formData.rol:', formData.rol);
        console.log('rolNormalizado:', rolNormalizado);
        console.log('registerData completo:', registerData);
        console.log('registerData.rol existe?', registerData.hasOwnProperty('rol'));
        console.log('registerData.rol valor:', registerData.rol);
        console.log('registerData JSON:', JSON.stringify(registerData));
        console.log('====================');
        
        // ÚLTIMA VERIFICACIÓN: asegurar que el rol esté presente
        if (!registerData.rol) {
          console.error('ERROR CRÍTICO: registerData.rol es undefined/null!');
          console.error('registerData completo:', registerData);
          setError('Error crítico: El rol no está definido. Por favor, recarga la página.');
          setLoading(false);
          return;
        }
        
        // Crear una copia final del objeto para asegurar que el rol esté presente
        const finalData = {
          ...registerData,
          rol: registerData.rol // Forzar que el rol esté presente
        };
        
        
        const response = await api.post('/auth/register', finalData);

        if (response.data.success) {
          localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
          localStorage.setItem('rol', response.data.rol);
          onLogin(response.data.usuario, response.data.rol);
        } else {
          setError('Error al registrar usuario');
        }
      }
    } catch (err: any) {
      console.error('Error:', err);
      if (err.response?.data) {
        // Si el error es un string, mostrarlo directamente
        // Si es un objeto, intentar extraer el mensaje
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.message) {
          setError(errorData.message);
        } else if (errorData.error) {
          setError(errorData.error);
        } else {
          setError('Error al procesar la solicitud');
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error de conexión. Por favor, verifica tu conexión a internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFieldsByRole = () => {
    const baseFields = (
      <>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label>Contraseña *</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {!isLogin && formData.password && (
            <div className="password-strength">
              <div className={`strength-item ${passwordStrength.length ? 'valid' : ''}`}>
                {passwordStrength.length ? '✓' : '○'} Al menos 8 caracteres
              </div>
              <div className={`strength-item ${passwordStrength.uppercase ? 'valid' : ''}`}>
                {passwordStrength.uppercase ? '✓' : '○'} Una mayúscula
              </div>
              <div className={`strength-item ${passwordStrength.lowercase ? 'valid' : ''}`}>
                {passwordStrength.lowercase ? '✓' : '○'} Una minúscula
              </div>
              <div className={`strength-item ${passwordStrength.number ? 'valid' : ''}`}>
                {passwordStrength.number ? '✓' : '○'} Un número
              </div>
            </div>
          )}
          {isLogin && (
            <div className="forgot-password-link">
              <button
                type="button"
                onClick={() => setShowRecuperarPassword(true)}
                className="link-button"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
        </div>
      </>
    );

    if (isLogin) {
      return (
        <>
          {baseFields}
          <div className="form-group">
            <label>Tipo de Usuario *</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              required
            >
              <option value="DONANTE">Donante</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="ORGANIZACION">Organización</option>
            </select>
          </div>
        </>
      );
    }

    // Campos de registro
    const commonFields = (
      <>
        <div className="form-row">
          <div className="form-group form-group-half">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group form-group-half">
            <label>Apellido *</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        {baseFields}
      </>
    );

    // Campos solo para organizaciones (sin apellido)
    const organizacionFields = (
      <>
        <div className="form-group">
          <label>Nombre de la Organización *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />
        </div>
        {baseFields}
      </>
    );

    switch (formData.rol) {
      case 'DONANTE':
        return (
          <>
            {commonFields}
          </>
        );

      case 'ADMINISTRADOR':
        return commonFields;

      case 'ORGANIZACION':
        return organizacionFields;

      default:
        return commonFields;
    }
  };

  // Si está en modo recuperar contraseña, mostrar ese formulario
  if (showRecuperarPassword) {
    return (
      <div className="login-unificado-container">
        <div className="login-unificado-card">
          <h2>Recuperar Contraseña</h2>
          <p>Ingresa tu email y tipo de usuario para recibir un enlace de recuperación</p>
          
          <RecuperarPasswordForm
            onBack={() => setShowRecuperarPassword(false)}
            onSuccess={() => {
              setShowRecuperarPassword(false);
              setError(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="login-unificado-container">
      <div className="login-unificado-card">
        <div className="login-header-section">
          <div className="logo-container">
            <img src={logo} alt="Logo Sistema de Donaciones" className="login-logo" />
          </div>
          <h1>Sistema de Donaciones</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="form-title">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
          {!isLogin && (
            <div className="form-group">
              <label>Tipo de Usuario *</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleInputChange}
                required
              >
                <option value="DONANTE">Donante</option>
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="ORGANIZACION">Organización</option>
              </select>
            </div>
          )}
          
          {renderFieldsByRole()}
          
          {!isLogin && (formData.rol === 'ADMINISTRADOR' || formData.rol === 'ORGANIZACION') && (
            <div className="form-group">
              <label>Código de Seguridad *</label>
              <div className="password-input-wrapper">
                <input
                  type={showCodigoSeguridad ? "text" : "password"}
                  name="codigoSeguridad"
                  value={formData.codigoSeguridad}
                  onChange={handleInputChange}
                  placeholder="Ingresa el código de seguridad"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCodigoSeguridad(!showCodigoSeguridad)}
                  tabIndex={-1}
                  aria-label={showCodigoSeguridad ? "Ocultar código" : "Mostrar código"}
                >
                  {showCodigoSeguridad ? '🙈' : '👁️'}
                </button>
              </div>
              <small className="codigo-hint">
                {formData.rol === 'ADMINISTRADOR' 
                  ? 'Código requerido para administradores' 
                  : 'Código requerido para organizaciones'}
              </small>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
        </form>

        <div className="toggle-form">
          <p>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setShowPassword(false);
                setShowCodigoSeguridad(false);
                setFormData({
                  nombre: '',
                  apellido: '',
                  email: '',
                  password: '',
                  documento: '',
                  rol: 'DONANTE',
                  codigoSeguridad: '',
                });
              }}
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

export default LoginUnificado;

