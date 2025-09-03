import { BACKEND_CONFIG, getBackendConfig } from './backend.config';

export interface AppConfig {
  backend: {
    baseUrl: string;
    apiUrl: string;
    port: number;
  };
  app: {
    name: string;
    version: string;
  };
}

// Configuración centralizada del backend
export const APP_CONFIG: AppConfig = {
  backend: {
    baseUrl: BACKEND_CONFIG.development.baseUrl,
    port: BACKEND_CONFIG.development.port,
    apiUrl: BACKEND_CONFIG.development.apiUrl
  },
  app: {
    name: 'TodoFarma',
    version: '1.0.0'
  }
};

// Función helper para obtener la URL completa del backend
export function getBackendUrl(): string {
  return getBackendConfig().apiUrl;
}

// Función helper para obtener la URL base del backend
export function getBackendBaseUrl(): string {
  const config = getBackendConfig();
  return `${config.baseUrl}:${config.port}`;
}

// Función para cambiar la configuración del backend en tiempo de ejecución
export function updateBackendConfig(environment: 'development' | 'production' | 'staging' = 'development') {
  const config = getBackendConfig(environment);
  APP_CONFIG.backend.baseUrl = config.baseUrl;
  APP_CONFIG.backend.port = config.port;
  APP_CONFIG.backend.apiUrl = config.apiUrl;
}
