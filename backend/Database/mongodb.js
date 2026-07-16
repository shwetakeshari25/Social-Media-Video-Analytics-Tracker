import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

export async function connectDB() {
  if (isConnected) return true;
  if (!MONGODB_URI) {
    console.warn('⚠️ No MONGODB_URI found in env variables. Social Tracker is running in Local Database Fallback mode.');
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.warn('⚠️ Social Tracker is falling back to Local Database mode.');
    return false;
  }
}

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

// Connected Social Media Accounts Schema
const SocialAccountSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  platform: { type: String, required: true }, // 'YouTube', 'Instagram', 'Facebook', 'LinkedIn'
  accountId: { type: String, required: true },
  profileName: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  totalPosts: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  accessToken: { type: String, default: '' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Historical Metrics for Growth Charts
const AccountMetricSchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  followers: { type: Number, required: true },
  views: { type: Number, required: true },
  posts: { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now }
});

// Avoid model recompilation errors in dev HMR
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const SocialAccount = mongoose.models.SocialAccount || mongoose.model('SocialAccount', SocialAccountSchema);
export const AccountMetric = mongoose.models.AccountMetric || mongoose.model('AccountMetric', AccountMetricSchema);
