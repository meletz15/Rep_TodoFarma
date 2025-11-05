export interface BackendConfig {
  development: {
    baseUrl: string;
    port: number;
    apiUrl: string;
  };
  production: {
    baseUrl: string;
    port: number;
    apiUrl: string;
  };
  staging?: {
    baseUrl: string;
    port: number;
    apiUrl: string;
  };
}

export const BACKEND_CONFIG: BackendConfig = {
  development: {
    baseUrl: 'http://localhost',
    port: 3002,
    apiUrl: 'http://localhost:3002/api'
  },
  production: {
    baseUrl: 'https://api.todofarma.com', // Cambiar por tu dominio de producción
    port: 443,
    apiUrl: 'https://api.todofarma.com/api'
  }
  // Puedes agregar más entornos aquí
  // staging: {
  //   baseUrl: 'https://staging-api.todofarma.com',
  //   port: 443,
  //   apiUrl: 'https://staging-api.todofarma.com/api'
  // }
};

// Función para obtener la configuración según el entorno
export function getBackendConfig(environment: 'development' | 'production' | 'staging' = 'development') {
  return BACKEND_CONFIG[environment] || BACKEND_CONFIG.development;
}

// Función para obtener la URL completa del backend
export function getBackendUrl(environment: 'development' | 'production' | 'staging' = 'development'): string {
  const config = getBackendConfig(environment);
  return config.apiUrl;
}

// Función para obtener la URL base del backend
export function getBackendBaseUrl(environment: 'development' | 'production' | 'staging' = 'development'): string {
  const config = getBackendConfig(environment);
  return `${config.baseUrl}:${config.port}`;
}
