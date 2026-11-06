/**
 * StorageManager - Capa de Persistencia Defensiva para Callejeros Río IV
 * Cumple con ADR-004 de docs/contexto/decisiones.md
 */

class SafeStorageManager {
  constructor() {
    this.memoryFallback = new Map();
    this.isLocalStorageAvailable = this.checkAvailability();
  }

  checkAvailability() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__callejeros_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('[StorageManager] LocalStorage no disponible. Activando memoria volátil:', e.message);
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      let raw = null;
      if (this.isLocalStorageAvailable) {
        raw = window.localStorage.getItem(key);
      } else {
        raw = this.memoryFallback.get(key) || null;
      }

      if (raw === null || raw === undefined) {
        return defaultValue;
      }

      return JSON.parse(raw);
    } catch (error) {
      console.error(`[StorageManager] Error parseando la clave "${key}". Restableciendo valor por defecto:`, error);
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (this.isLocalStorageAvailable) {
        window.localStorage.setItem(key, serialized);
      }
      this.memoryFallback.set(key, serialized);
      return true;
    } catch (error) {
      console.warn(`[StorageManager] Fallo persistiendo "${key}":`, error.message);
      try {
        this.memoryFallback.set(key, JSON.stringify(value));
      } catch (e) {}
      return false;
    }
  }

  remove(key) {
    try {
      if (this.isLocalStorageAvailable) {
        window.localStorage.removeItem(key);
      }
      this.memoryFallback.delete(key);
    } catch (error) {
      console.warn(`[StorageManager] Error removiendo "${key}":`, error);
    }
  }

  clear() {
    try {
      if (this.isLocalStorageAvailable) {
        window.localStorage.clear();
      }
      this.memoryFallback.clear();
    } catch (error) {
      console.warn('[StorageManager] Error limpiando almacenamiento:', error);
    }
  }
}

export const StorageManager = new SafeStorageManager();
