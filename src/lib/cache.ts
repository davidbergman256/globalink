// Simple in-memory cache for performance optimization
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttlMinutes: number = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }
}

export const cache = new SimpleCache()

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `profile:${userId}`,
  USER_QUEUE: (userId: string) => `queue:${userId}`,
  USER_GROUPS: (userId: string) => `groups:${userId}`,
  ADMIN_QUEUE: 'admin:queue',
  ADMIN_GROUPS: 'admin:groups'
} as const 