export function detectPlatform(url) {
  if (!url) return null;
  const cleanUrl = url.trim();

  // YouTube Patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\s]{11})/i;
  // Instagram Patterns
  const instagramRegex = /instagram\.com\/(?:[a-zA-Z0-9_\.]+\/)?(?:p|reel|tv)\/([a-zA-Z0-9_\-]+)/i;
  // LinkedIn Patterns
  const linkedinRegex = /linkedin\.com\/(?:posts|feed\/update\/urn:li:activity|video\/urn:li:ugcPost):?([0-9]+)/i;
  const linkedinFallback = /linkedin\.com\/[^\/]+\/([a-zA-Z0-9_\-]+)/i;

  let platform = '';
  let id = '';

  if (youtubeRegex.test(cleanUrl)) {
    platform = 'YouTube';
    id = cleanUrl.match(youtubeRegex)[1];
  } else if (instagramRegex.test(cleanUrl)) {
    platform = 'Instagram';
    id = cleanUrl.match(instagramRegex)[1];
  } else if (linkedinRegex.test(cleanUrl)) {
    platform = 'LinkedIn';
    id = cleanUrl.match(linkedinRegex)[1];
  } else if (linkedinFallback.test(cleanUrl) && cleanUrl.includes('linkedin.com')) {
    platform = 'LinkedIn';
    id = cleanUrl.match(linkedinFallback)[1];
  } else if (cleanUrl.includes('tiktok.com')) {
    platform = 'TikTok';
    const tiktokRegex = /tiktok\.com\/@[^\/]+\/video\/([0-9]+)/i;
    id = tiktokRegex.test(cleanUrl) ? cleanUrl.match(tiktokRegex)[1] : 'tiktok-' + Math.random().toString(36).substring(2, 9);
  } else {
    // General website link fallback
    platform = 'Web';
    id = 'web-' + Math.random().toString(36).substring(2, 9);
  }

  return {
    platform,
    videoId: id,
    normalizedUrl: cleanUrl
  };
}
