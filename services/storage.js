import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_API_URL, DEFAULT_QUALITY } from '../constants/platforms';

const HISTORY_KEY = '@video_downloader_history';
const SETTINGS_KEY = '@video_downloader_settings';

// ========================
// DOWNLOAD HISTORY
// ========================

/**
 * Get all download history items
 * @returns {Promise<Array>}
 */
export async function getHistory() {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
}

/**
 * Add a new download to history
 * @param {object} item - Download item
 * @param {string} item.url - Original video URL
 * @param {string} item.platform - Platform ID (tiktok, instagram, facebook)
 * @param {string} item.filename - Downloaded filename
 * @param {string} item.quality - Video quality used
 * @param {number} item.fileSize - File size in bytes
 */
export async function addToHistory(item) {
  try {
    const history = await getHistory();
    const newItem = {
      id: Date.now().toString(),
      ...item,
      downloadedAt: new Date().toISOString(),
    };
    history.unshift(newItem);

    // Keep only last 100 items
    const trimmed = history.slice(0, 100);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    return newItem;
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

/**
 * Remove a download from history
 * @param {string} id - Item ID
 */
export async function removeFromHistory(id) {
  try {
    const history = await getHistory();
    const filtered = history.filter((item) => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from history:', error);
  }
}

/**
 * Clear all download history
 */
export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

// ========================
// SETTINGS
// ========================

const DEFAULT_SETTINGS = {
  apiUrl: DEFAULT_API_URL,
  apiToken: '',
  defaultQuality: DEFAULT_QUALITY,
  saveToAlbum: true,
  hapticFeedback: true,
  theme: 'dark',
};

export async function getSettings() {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update app settings
 * @param {object} updates - Partial settings to update
 */
export async function updateSettings(updates) {
  try {
    const current = await getSettings();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating settings:', error);
  }
}

/**
 * Reset settings to defaults
 */
export async function resetSettings() {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error resetting settings:', error);
    return DEFAULT_SETTINGS;
  }
}
