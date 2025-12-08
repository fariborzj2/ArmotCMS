
type CacheDriver = 'file' | 'redis' | 'memcached';

interface CacheItem<T> {
  value: T;
  expiry: number;
}

class CacheManager {
  private driver: CacheDriver;
  private memoryStore: Map<string, CacheItem<any>>;

  constructor(driver: CacheDriver = 'file') {
    this.driver = driver;
    this.memoryStore = new Map();
  }

  setDriver(driver: CacheDriver) {
    console.log(`[CacheSystem] Switching driver to: ${driver}`);
    this.driver = driver;
  }

  // Set with TTL (Time To Live in seconds)
  set<T>(key: string, value: T, ttl: number = 3600): void {
    const expiry = Date.now() + ttl * 1000;
    
    // Always write to memory store as backup/primary
    this.memoryStore.set(key, { value, expiry });

    try {
      if (this.driver === 'redis' || this.driver === 'memcached') {
        // Simulate external service call
        if (Math.random() > 0.9) throw new Error(`${this.driver} connection failed`);
        console.log(`[${this.driver}] Set ${key}`);
      }
      
      // Fallback / Implementation for 'file' (using localStorage)
      // Check if window and localStorage exist to avoid SSR/Security errors
      if (typeof window !== 'undefined') {
          try {
             window.localStorage.setItem(`cache_${key}`, JSON.stringify({ value, expiry }));
          } catch(e) {
             // Ignore SecurityError or QuotaExceededError
          }
      }
    } catch (e) {
      // Silently fail if storage is restricted or unavailable
    }
  }

  get<T>(key: string): T | null {
    const now = Date.now();
    
    // 1. Try Memory Store First (Fastest & Safest)
    const memoryItem = this.memoryStore.get(key);
    if (memoryItem) {
        if (now > memoryItem.expiry) {
            this.memoryStore.delete(key);
            this.safeRemove(`cache_${key}`);
            return null;
        }
        return memoryItem.value;
    }

    // 2. Try Local Storage (Persistence)
    let itemStr: string | null = null;
    try {
        if (typeof window !== 'undefined') {
             // Accessing localStorage might throw
             const storage = window.localStorage;
             itemStr = storage.getItem(`cache_${key}`);
        }
    } catch (e) {
        // Ignore storage errors
    }

    if (!itemStr) return null;

    try {
        const item: CacheItem<T> = JSON.parse(itemStr);
        if (now > item.expiry) {
            this.forget(key);
            return null;
        }
        // Hydrate memory store for next time
        this.memoryStore.set(key, item);
        return item.value;
    } catch (e) {
        return null;
    }
  }

  forget(key: string): void {
    this.memoryStore.delete(key);
    this.safeRemove(`cache_${key}`);
  }

  flush(): void {
    this.memoryStore.clear();
    try {
        if (typeof window !== 'undefined') {
            const storage = window.localStorage;
            Object.keys(storage).forEach(key => {
                if (key.startsWith('cache_')) {
                    storage.removeItem(key);
                }
            });
        }
    } catch (e) {
        // Ignore storage errors
    }
    console.log('[CacheSystem] Cache cleared');
  }

  private safeRemove(key: string) {
      try {
          if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key);
          }
      } catch (e) {
          // Ignore
      }
  }
}

export const cache = new CacheManager();
