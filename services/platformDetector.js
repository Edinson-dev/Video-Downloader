import { PLATFORMS } from '../constants/platforms';

/**
 * Detects the social media platform from a given URL.
 * @param {string} url - The URL to analyze
 * @returns {{ platform: object|null, isValid: boolean }}
 */
export function detectPlatform(url) {
  if (!url || typeof url !== 'string') {
    return { platform: null, isValid: false };
  }

  // 1. Extract the actual URL from the text (in case there is share text around it)
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = url.match(urlRegex);
  let cleanUrl = url.trim();

  if (matches && matches.length > 0) {
    cleanUrl = matches[0].trim();
  } else {
    // Check if it's a URL without protocol (e.g. "vt.tiktok.com/...")
    // We search for a whitespace-delimited word containing one of our platform domains
    const words = url.split(/\s+/);
    const domainWord = words.find(w => /tiktok\.com|instagram\.com|instagr\.am|facebook\.com|fb\.watch|fb\.com/i.test(w));
    if (domainWord) {
      cleanUrl = domainWord.trim();
    }
  }

  // Basic URL validation
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    // Try to detect even without protocol
    for (const [key, platform] of Object.entries(PLATFORMS)) {
      for (const pattern of platform.patterns) {
        if (pattern.test(cleanUrl)) {
          return {
            platform,
            isValid: true,
            normalizedUrl: `https://${cleanUrl}`,
          };
        }
      }
    }
    return { platform: null, isValid: false };
  }

  for (const [key, platform] of Object.entries(PLATFORMS)) {
    for (const pattern of platform.patterns) {
      if (pattern.test(cleanUrl)) {
        return {
          platform,
          isValid: true,
          normalizedUrl: cleanUrl,
        };
      }
    }
  }

  return { platform: null, isValid: false };
}

/**
 * Validates if a URL is a potentially valid video URL for any supported platform.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidVideoUrl(url) {
  const { isValid } = detectPlatform(url);
  return isValid;
}

/**
 * Extracts a clean URL from text (clipboard may contain extra text).
 * @param {string} text
 * @returns {string|null}
 */
export function extractUrlFromText(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);
  if (matches && matches.length > 0) {
    // Return the first URL found that matches a supported platform
    for (const match of matches) {
      if (isValidVideoUrl(match)) {
        return match;
      }
    }
    // If no platform-specific URL found, return first URL
    return matches[0];
  }
  return null;
}
