import axios from 'axios';

// Configurar la URL base de axios
const api = axios.create({
  baseURL: '/api', // Vite proxy manejará esto
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests (para debug y limpieza de URLs)
api.interceptors.request.use(
  (config) => {
    // Asegurar que la URL esté limpia y correcta
    // IMPORTANTE: Si hay params en config.params, axios los agregará automáticamente
    // Solo limpiar la URL base, no los query params que vienen en config.params
    if (config.url) {
      // Limpiar la URL de cualquier caracter extraño
      let cleanUrl = config.url.trim();
      
      // Si la URL tiene query params directamente en la URL Y también hay config.params,
      // combinar ambos. Pero normalmente, si usamos config.params, no debería haber params en la URL.
      if (!config.params || Object.keys(config.params).length === 0) {
        // Solo procesar la URL si no hay params configurados
        // Si la URL tiene caracteres codificados incorrectos, limpiarlos
        // PERO preservar los query parameters
        try {
          // Separar la URL base de los query parameters
          const [urlBase, queryParams] = cleanUrl.split('?');
          // Decodificar primero para ver el contenido real
          let cleanBase = decodeURIComponent(urlBase);
          // Eliminar cualquier texto extra después de la ruta
          // Por ejemplo, eliminar " - Listar puntos" o similares
          const urlMatch = cleanBase.match(/^([^?\s]+)/);
          if (urlMatch) {
            cleanBase = urlMatch[1];
          }
          // Re-encodificar solo si es necesario
          cleanBase = encodeURI(cleanBase);
          // Reconstruir la URL con los query parameters
          cleanUrl = queryParams ? `${cleanBase}?${queryParams}` : cleanBase;
        } catch (e) {
          // Si falla la decodificación, usar la URL original pero preservar query params
          const [urlBase, queryParams] = cleanUrl.trim().split('?');
          cleanUrl = queryParams ? `${urlBase}?${queryParams}` : urlBase;
        }
        
        config.url = cleanUrl;
      } else {
        // Si hay params configurados, solo limpiar la URL base sin query params
        try {
          const [urlBase] = cleanUrl.split('?');
          let cleanBase = decodeURIComponent(urlBase);
          const urlMatch = cleanBase.match(/^([^?\s]+)/);
          if (urlMatch) {
            cleanBase = urlMatch[1];
          }
          cleanBase = encodeURI(cleanBase);
          config.url = cleanBase;
        } catch (e) {
          const [urlBase] = cleanUrl.trim().split('?');
          config.url = urlBase;
        }
      }
    }
    
    // Log para debug (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log('Request:', config.method?.toUpperCase(), config.baseURL + config.url);
      if (config.params) {
        console.log('Request Params:', config.params);
      }
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;

