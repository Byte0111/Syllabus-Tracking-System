import * as dotenv from "dotenv";
dotenv.config();

import { Redis } from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";

interface CacheItem {
  value: any;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheItem>();
  private hits = 0;
  private misses = 0;

  get(key: string): any | null {
    const item = this.store.get(key);
    if (!item) {
      this.misses++;
      return null;
    }
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return item.value;
  }

  set(key: string, value: any, ttlMs: number = 60000): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 100;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: parseFloat(hitRate.toFixed(1)),
      size: this.store.size,
    };
  }
}

interface RedisProvider {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttlSec: number): Promise<void>;
  del(key: string): Promise<void>;
  flushdb(): Promise<void>;
  dbsize(): Promise<number>;
}

class UpstashRedisProvider implements RedisProvider {
  private client: UpstashRedis;
  constructor(url: string, token: string) {
    this.client = new UpstashRedis({ url, token });
  }

  async get(key: string): Promise<any> {
    const val = await this.client.get(key);
    if (val === null || val === undefined) return null;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }

  async set(key: string, value: any, ttlSec: number): Promise<void> {
    const payload = typeof value === "object" ? JSON.stringify(value) : value;
    await this.client.set(key, payload, { ex: ttlSec });
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flushdb(): Promise<void> {
    await this.client.flushdb();
  }

  async dbsize(): Promise<number> {
    return await this.client.dbsize();
  }
}

class IoRedisProvider implements RedisProvider {
  constructor(private client: Redis) {}

  async get(key: string): Promise<any> {
    const val = await this.client.get(key);
    if (val === null) return null;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }

  async set(key: string, value: any, ttlSec: number): Promise<void> {
    const payload = typeof value === "object" ? JSON.stringify(value) : value;
    await this.client.set(key, payload, "EX", ttlSec);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flushdb(): Promise<void> {
    await this.client.flushdb();
  }

  async dbsize(): Promise<number> {
    return await this.client.dbsize();
  }
}

class HybridCache {
  private memoryCache: MemoryCache;
  private provider: RedisProvider | null = null;
  private providerType: "upstash" | "ioredis" | "memory" = "memory";
  private isConnected = false;
  private hits = 0;
  private misses = 0;

  constructor() {
    this.memoryCache = new MemoryCache();
    
    console.log("HybridCache env check:", {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      REDIS_URL: process.env.REDIS_URL,
      REDIS_HOST: process.env.REDIS_HOST
    });
    
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;

    if (upstashUrl && upstashToken) {
      try {
        console.log("Initializing Upstash Redis HTTP Client...");
        this.provider = new UpstashRedisProvider(upstashUrl, upstashToken);
        this.providerType = "upstash";
        this.isConnected = true; // HTTP is stateless/always connected
        console.log("Upstash Redis HTTP Client ready!");
      } catch (err) {
        console.error("Failed to setup Upstash Redis HTTP Client:", err);
      }
    } else if (redisUrl || redisHost) {
      try {
        console.log("Initializing ioredis Client...");
        let client: Redis;
        if (redisUrl) {
          client = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            connectTimeout: 5000,
          });
        } else {
          client = new Redis({
            host: redisHost,
            port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: 1,
            connectTimeout: 5000,
          });
        }

        this.provider = new IoRedisProvider(client);
        this.providerType = "ioredis";

        client.on("connect", () => {
          console.log("ioredis Client connecting...");
        });

        client.on("ready", () => {
          console.log("ioredis Client connected and ready!");
          this.isConnected = true;
        });

        client.on("error", (err: any) => {
          console.error("ioredis Client connection error:", err.message || err);
          this.isConnected = false;
        });

        client.on("close", () => {
          console.log("ioredis Client connection closed.");
          this.isConnected = false;
        });
      } catch (err) {
        console.error("Failed to setup ioredis Client:", err);
      }
    } else {
      console.log("No Redis configuration provided. Defaulting to in-memory Cache.");
    }
  }

  async get(key: string): Promise<any | null> {
    if (this.provider && this.isConnected) {
      try {
        const data = await this.provider.get(key);
        if (data !== null) {
          this.hits++;
          return data;
        } else {
          this.misses++;
          return null;
        }
      } catch (err) {
        console.error(`Redis get error for key "${key}", falling back to in-memory:`, err);
        return this.memoryCache.get(key);
      }
    }
    return this.memoryCache.get(key);
  }

  async set(key: string, value: any, ttlMs: number = 60000): Promise<void> {
    if (this.provider && this.isConnected) {
      try {
        const ttlSec = Math.max(1, Math.round(ttlMs / 1000));
        await this.provider.set(key, value, ttlSec);
        return;
      } catch (err) {
        console.error(`Redis set error for key "${key}", falling back to in-memory:`, err);
        this.memoryCache.set(key, value, ttlMs);
      }
    } else {
      this.memoryCache.set(key, value, ttlMs);
    }
  }

  async delete(key: string): Promise<void> {
    if (this.provider && this.isConnected) {
      try {
        await this.provider.del(key);
        return;
      } catch (err) {
        console.error(`Redis delete error for key "${key}", falling back to in-memory:`, err);
        this.memoryCache.delete(key);
      }
    } else {
      this.memoryCache.delete(key);
    }
  }

  async clear(): Promise<void> {
    if (this.provider && this.isConnected) {
      try {
        await this.provider.flushdb();
        return;
      } catch (err) {
        console.error("Redis flushdb error, falling back to in-memory:", err);
        this.memoryCache.clear();
      }
    } else {
      this.memoryCache.clear();
    }
  }

  async getStats() {
    if (this.provider && this.isConnected) {
      try {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total) * 100 : 100;
        let dbsize = 0;
        try {
          dbsize = await this.provider.dbsize();
        } catch {}
        return {
          provider: this.providerType === "upstash" ? "Upstash Redis (HTTP)" : "Redis (TCP)",
          hits: this.hits,
          misses: this.misses,
          hitRate: parseFloat(hitRate.toFixed(1)),
          size: dbsize,
          status: "connected",
        };
      } catch {
        return {
          provider: `${this.providerType === "upstash" ? "Upstash Redis" : "Redis"} (degraded)`,
          ...this.memoryCache.getStats(),
          status: "error",
        };
      }
    }
    return {
      provider: "In-Memory",
      ...this.memoryCache.getStats(),
      status: "fallback",
    };
  }
}

export const apiCache = new HybridCache();
