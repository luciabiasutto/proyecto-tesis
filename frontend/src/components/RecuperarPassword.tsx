import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../config/axios.config';
import './RecuperarPassword.css';

const RecuperarPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [step, setStep] = useState<'solicitar' | 'resetear'>('solicitar');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('DONANTE');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });

  useEffect(() => {
    if (token) {
      setStep('resetear');
    }
  }, [token]);

  const validatePassword = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    });
  };

  const handleSolicitarRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/password/solicitar', {
        email,
        rol
      });

      if (response.data.success) {
        setSuccess('Si el email existe, se ha enviado un enlace de recuperación a tu correo.');
        setEmail('');
      } else {
        setError(response.data.message || 'Error al solicitar recuperación');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  const handleResetearPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const tokenParam = token || '';
    if (!tokenParam) {
      setError('Token inválido');
      return;
    }

    // Validar contraseña
    const allValid = Object.values(passwordStrength).every(v => v);
    if (!allValid) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/password/resetear', {
        token: tokenParam,
        nuevaPassword
      });

      if (response.data.success) {
        setSuccess('Contraseña actualizada exitosamente. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Error al actualizar la contraseña');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'resetear') {
    return (
      <div className="recuperar-password-container">
        <div className="recuperar-password-card">
          <h2>Restablecer Contraseña</h2>
          
          <form onSubmit={handleResetearPassword}>
            <div className="form-group">
              <label>Nueva Contraseña *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={nuevaPassword}
                  onChange={(e) => {
                    setNuevaPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              {nuevaPassword && (
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
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña *</label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirmarPassword && nuevaPassword !== confirmarPassword && (
                <small className="error-text">Las contraseñas no coinciden</small>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="recuperar-password-container">
      <div className="recuperar-password-card">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu email y tipo de usuario para recibir un enlace de recuperación</p>
        
        <form onSubmit={handleSolicitarRecuperacion}>
          <div className="form-group">
            <label>Tipo de Usuario *</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              required
            >
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
        </form>

        <div className="back-to-login">
          <button type="button" onClick={() => navigate('/login')} className="link-button">
            ← Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;

