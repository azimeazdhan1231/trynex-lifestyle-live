
// Instant cache utility for zero-delay loading
class InstantCache {
  private static instance: InstantCache;
  private cache: Map<string, { data: any; timestamp: number; etag?: string }> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): InstantCache {
    if (!InstantCache.instance) {
      InstantCache.instance = new InstantCache();
    }
    return InstantCache.instance;
  }

  // Get data instantly from cache
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }
    return null;
  }

  // Set data in cache
  set(key: string, data: any, etag?: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag
    });
  }

  // Check if cache has valid data
  has(key: string): boolean {
    const cached = this.cache.get(key);
    return cached !== undefined && Date.now() - cached.timestamp < this.TTL;
  }

  // Get ETag for cache validation
  getETag(key: string): string | undefined {
    const cached = this.cache.get(key);
    return cached?.etag;
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.TTL) {
        this.cache.delete(key);
      }
    }
  }

  // Pre-warm cache with critical data
  preWarm(endpoints: string[]): void {
    endpoints.forEach(async (endpoint) => {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Cache-Control': 'max-age=31536000',
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const etag = response.headers.get('etag') || undefined;
          this.set(endpoint, data, etag);
        }
      } catch (error) {
        console.warn(`Failed to pre-warm cache for ${endpoint}:`, error);
      }
    });
  }
}

// Initialize cache cleanup
setInterval(() => {
  InstantCache.getInstance().cleanup();
}, 5 * 60 * 1000); // Cleanup every 5 minutes

export default InstantCache;
