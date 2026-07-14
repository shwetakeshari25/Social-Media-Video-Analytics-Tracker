import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Initialize database with default structure if it doesn't exist
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      users: [],
      videos: [],
      scripts: [],
      settings: {}
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

// Read database file
function readDB() {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file:', error);
    return { users: [], videos: [], scripts: [], settings: {} };
  }
}

// Write to database file
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to database file:', error);
    return false;
  }
}

export const db = {
  // User Operations
  getUsers: () => readDB().users,
  getUserById: (id) => readDB().users.find(u => u.id === id),
  getUserByUsername: (username) => readDB().users.find(u => u.username.toLowerCase() === username.toLowerCase()),
  addUser: (user) => {
    const data = readDB();
    const newUser = { id: Date.now().toString(), ...user };
    data.users.push(newUser);
    writeDB(data);
    return newUser;
  },

  // Video Operations
  getVideos: (userId) => readDB().videos.filter(v => v.userId === userId),
  getVideoById: (id) => readDB().videos.find(v => v.id === id),
  addVideo: (video) => {
    const data = readDB();
    const newVideo = { id: Date.now().toString(), addedAt: new Date().toISOString(), ...video };
    data.videos.push(newVideo);
    writeDB(data);
    return newVideo;
  },
  deleteVideo: (id, userId) => {
    const data = readDB();
    const index = data.videos.findIndex(v => v.id === id && v.userId === userId);
    if (index !== -1) {
      const deleted = data.videos.splice(index, 1)[0];
      writeDB(data);
      return deleted;
    }
    return null;
  },

  // Script History Operations
  getScripts: (userId) => readDB().scripts.filter(s => s.userId === userId),
  getScriptById: (id) => readDB().scripts.find(s => s.id === id),
  addScript: (script) => {
    const data = readDB();
    const newScript = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...script };
    data.scripts.push(newScript);
    writeDB(data);
    return newScript;
  },
  deleteScript: (id, userId) => {
    const data = readDB();
    const index = data.scripts.findIndex(s => s.id === id && s.userId === userId);
    if (index !== -1) {
      const deleted = data.scripts.splice(index, 1)[0];
      writeDB(data);
      return deleted;
    }
    return null;
  },

  // Settings Operations
  getSettings: (userId) => {
    const settings = readDB().settings;
    return settings[userId] || { apiKeys: { gemini: '', youtube: '' }, darkMode: false };
  },
  saveSettings: (userId, userSettings) => {
    const data = readDB();
    data.settings[userId] = {
      apiKeys: {
        gemini: userSettings?.apiKeys?.gemini || '',
        youtube: userSettings?.apiKeys?.youtube || ''
      },
      darkMode: !!userSettings?.darkMode
    };
    writeDB(data);
    return data.settings[userId];
  }
};
