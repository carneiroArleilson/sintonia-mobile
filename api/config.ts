/**
 * Configuração da API do backend.
 * Defina EXPO_PUBLIC_API_URL no .env.
 * Em simulador/dispositivo: localhost não funciona — use o IP da sua máquina (ex: http://192.168.1.10:3001).
 * Android emulador: pode usar http://10.0.2.2:3001 para apontar para o host.
 */
import { Platform } from 'react-native';

function getDefaultApiUrl(): string {
  if (__DEV__ && Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }
  return 'http://localhost:3001';
}

export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL?.trim()) ||
  getDefaultApiUrl();
