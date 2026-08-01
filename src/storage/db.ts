import mongoose from 'mongoose';
import { CONFIG } from '../shared/config';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer?: any;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || CONFIG.MONGODB_URI;

    cached.promise = (async () => {
      try {
        const m = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        return m;
      } catch (err) {
        // Fallback for automated test environments / dev fallback to MongoMemoryServer
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          if (!cached.memoryServer) {
            cached.memoryServer = await MongoMemoryServer.create();
          }
          const memUri = cached.memoryServer.getUri();
          const m = await mongoose.connect(memUri);
          return m;
        } catch (memErr) {
          throw err;
        }
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (cached.memoryServer) {
    await cached.memoryServer.stop();
    cached.memoryServer = undefined;
  }
  cached.conn = null;
  cached.promise = null;
}

/**
 * Backward compatible getDatabase check / initialization for CLI or scripts.
 */
export async function getDatabase(): Promise<typeof mongoose> {
  return connectDB();
}

if (require.main === module) {
  connectDB().then(() => {
    console.log(`Database connected successfully to MongoDB`);
    return disconnectDB();
  }).catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
}
