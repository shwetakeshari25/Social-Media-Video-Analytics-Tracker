import express from 'express';
import { db } from '../Database/db.js';
import { authenticateToken, hashPassword, comparePassword, generateToken } from '../Authentication/auth.js';
import { detectPlatform } from '../PlatformDetector/detector.js';
import { fetchVideoAnalytics } from '../AnalyticsService/service.js';
import { generateScriptService } from '../AIService/service.js';

const router = express.Router();

// --- AUTHENTICATION ROUTES ---

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const existingUser = db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const newUser = db.addUser({
      username,
      passwordHash
    });

    const token = generateToken(newUser);
    res.status(201).json({
      token,
      user: { id: newUser.id, username: newUser.username }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = db.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current User
router.get('/auth/me', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ id: user.id, username: user.username });
});


// --- VIDEO ANALYTICS ROUTES ---

// Get All Saved Videos
router.get('/videos', authenticateToken, (req, res) => {
  try {
    const videos = db.getVideos(req.user.id);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add and Analyze a New Video
router.post('/videos/add', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Video URL is required.' });
    }

    // Detect Platform
    const info = detectPlatform(url);
    if (!info) {
      return res.status(400).json({ error: 'Unsupported or malformed URL.' });
    }

    // Check if video is already added for this user
    const userVideos = db.getVideos(req.user.id);
    const alreadyExists = userVideos.find(v => v.videoId === info.videoId && v.platform === info.platform);
    if (alreadyExists) {
      return res.status(400).json({ error: 'This video has already been added to your dashboard.' });
    }

    // Fetch Analytics (live API or mock)
    const analytics = await fetchVideoAnalytics(info.normalizedUrl, info.platform, info.videoId, req.user.id);

    // Save to Database
    const newVideo = db.addVideo({
      userId: req.user.id,
      url: info.normalizedUrl,
      platform: info.platform,
      videoId: info.videoId,
      ...analytics
    });

    res.status(201).json(newVideo);
  } catch (error) {
    console.error('Error adding video:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a Video
router.delete('/videos/:id', authenticateToken, (req, res) => {
  try {
    const deleted = db.deleteVideo(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Video not found or unauthorized.' });
    }
    res.json({ message: 'Video deleted successfully.', deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Video Metrics
router.put('/videos/:id', authenticateToken, (req, res) => {
  try {
    const { views, likes, comments, shares, title } = req.body;
    const updated = db.updateVideo(req.params.id, req.user.id, {
      views: views !== undefined ? parseInt(views) : undefined,
      likes: likes !== undefined ? parseInt(likes) : undefined,
      comments: comments !== undefined ? parseInt(comments) : undefined,
      shares: shares !== undefined ? parseInt(shares) : undefined,
      title: title || undefined
    });
    if (!updated) {
      return res.status(404).json({ error: 'Video not found or unauthorized.' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- SCRIPT GENERATOR ROUTES ---

// Generate AI Script
router.post('/script/generate', authenticateToken, async (req, res) => {
  try {
    const { videoIds, length } = req.body; // array of video IDs, string length ('30 sec', '1 min', etc)
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ error: 'At least one selected video ID is required.' });
    }
    if (!length) {
      return res.status(400).json({ error: 'Script length is required.' });
    }

    // Generate script (Gemini + fallback)
    const result = await generateScriptService(videoIds, length, req.user.id);

    // Store only the analysis (temporarily if needed), not the generated script permanently.
    // So we do not save the script using db.addScript.
    res.status(201).json({
      scriptData: result.script,
      analysisData: result.analysis
    });
  } catch (error) {
    console.error('Error generating script:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Script History
router.get('/history', authenticateToken, (req, res) => {
  try {
    const scripts = db.getScripts(req.user.id);
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a Script from History
router.delete('/history/:id', authenticateToken, (req, res) => {
  try {
    const deleted = db.deleteScript(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Script not found or unauthorized.' });
    }
    res.json({ message: 'Script removed from history.', deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- SETTINGS ROUTES ---

// Get Settings
router.get('/settings', authenticateToken, (req, res) => {
  try {
    const settings = db.getSettings(req.user.id);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save Settings
router.post('/settings', authenticateToken, (req, res) => {
  try {
    const newSettings = db.saveSettings(req.user.id, req.body);
    res.json(newSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
