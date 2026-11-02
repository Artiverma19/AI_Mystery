import mongoose from 'mongoose';

export async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error.message);
    throw error;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

