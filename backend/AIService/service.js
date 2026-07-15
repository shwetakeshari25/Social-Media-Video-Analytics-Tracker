import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../Database/db.js';

// Temporary analysis cache stored in memory
// Keys: userId, Values: { videoIds: [], individualAnalyses: [], combinedAnalysis: {} }
export const temporaryAnalysisCache = new Map();

function isSameVideoSelection(userCachedData, newVideoIds) {
  if (!userCachedData || !userCachedData.videoIds) return false;
  const cachedIds = userCachedData.videoIds;
  if (cachedIds.length !== newVideoIds.length) return false;
  
  const sortedCached = [...cachedIds].sort();
  const sortedNew = [...newVideoIds].sort();
  return sortedNew.every((val, index) => val === sortedCached[index]);
}

function cleanVideoTitle(title) {
  if (!title) return '';
  // Remove platform tags like [Instagram], [YouTube], [Web]
  let clean = title.replace(/^\[.*?\]\s*/i, '');
  // Remove hashtags
  clean = clean.replace(/#\S+/g, '');
  // Remove numbers at the end like #1, #2, #10
  clean = clean.replace(/#\d+\s*$/g, '');
  // Remove symbols
  clean = clean.replace(/[^\w\s]/g, ' ');
  return clean.trim();
}

function getKeywordsFromTitle(title) {
  const clean = cleanVideoTitle(title);
  const words = clean.split(/\s+/).map(w => w.toLowerCase().trim()).filter(w => w.length > 2);
  
  const stopWords = new Set(['how', 'why', 'what', 'who', 'when', 'where', 'to', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'and', 'or', 'but', 'if', 'then', 'else', 'most', 'some', 'any', 'all', 'both', 'each', 'few', 'more', 'other', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'should', 'now', 'this', 'that', 'these', 'those', 'here', 'there', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

  const keywords = words.filter(w => !stopWords.has(w));
  
  // Capitalize first letter of each keyword
  return keywords.map(w => w.charAt(0).toUpperCase() + w.slice(1));
}

// Programmatic fallback to analyze and generate simulated script
function generateSimulatedScript(selectedVideos, length) {
  // 1. Analyze every selected video individually
  const individualAnalyses = selectedVideos.map((v, i) => {
    const keywords = getKeywordsFromTitle(v.title);
    const mainTopic = keywords[0] || 'Content Strategy';
    const speakingStyle = i % 2 === 0 ? 'Energetic & Conversational' : 'Educational & Structured';
    const tone = i % 2 === 0 ? 'Inspiring' : 'Informative';
    const structure = 'Hook -> Introduction -> Value Delivery -> Examples -> Call to Action';
    const keyPoints = [
      `Key aspects of ${keywords[1] || 'performance'}`,
      `Optimal ${keywords[2] || 'engagement'} strategies`,
      `Leveraging ${keywords[3] || 'analytics'}`
    ];
    const audienceType = 'Content Creators, Social Media Marketers, and Business Owners';

    return {
      title: v.title,
      description: v.description || 'Not specified',
      transcript: v.transcript || 'Transcript not available',
      tags: v.tags || keywords.slice(0, 3),
      views: v.views,
      likes: v.likes,
      comments: v.comments,
      shares: v.shares,
      mainTopic,
      speakingStyle,
      tone,
      structure,
      keyPoints,
      audienceType
    };
  });

  // 2. Combine individual analyses
  const commonTopics = [...new Set(individualAnalyses.map(a => a.mainTopic))];
  const combinedTopic = commonTopics.join(' & ');
  const commonStyle = [...new Set(individualAnalyses.map(a => a.speakingStyle))].join(', ');
  const commonAudience = individualAnalyses[0]?.audienceType || 'Digital Creators';
  const totalViews = selectedVideos.reduce((sum, v) => sum + v.views, 0);

  // 3. Generate a completely unique script based on currently selected videos (ensuring uniqueness via timestamp/random)
  const randomSeed = Math.floor(Math.random() * 100);
  const cleanFirstTitle = cleanVideoTitle(selectedVideos[0]?.title);
  
  const scriptOptions = [
    {
      title: `AI Masterclass: ${combinedTopic} (${length})`,
      bestHook: `🚀 "If you're still creating content about ${combinedTopic} the same way in 2026, stop. This framework behind ${Math.floor(totalViews / 1000)}K combined views will change your metrics immediately..."`,
      introduction: `Most creators rely on guesses. But looking at top content like "${cleanFirstTitle}", there's a strict blueprint. Over the next ${length}, I'm going to give you that exact script layout.`,
      mainContent: `Here are the 3 pillars of viral retention:
1. Scroll Stopping Hooks: Visually interrupt patterns in the first 2 seconds.
2. Value Compression: Deliver the core of "${combinedTopic}" without fluff.
3. The Curiosity Gap: Keep them listening by asking questions you answer at the end.`,
      story: `For example, in "${cleanVideoTitle(selectedVideos[1]?.title || selectedVideos[0]?.title)}", the creator starts with a major struggle in ${combinedTopic}, shows a step-by-step resolution, and backs it up with real social proof.`,
      callToAction: `Comment the word 'GUIDE' below, and I will DM you my private checklist for ${combinedTopic}!`,
      ending: `Apply these 3 pillars to your next script and watch your analytics grow. Sign-off!`
    },
    {
      title: `The ${combinedTopic} Blueprint (${length})`,
      bestHook: `💡 "The single biggest mistake creators make with ${combinedTopic} is simple... they explain instead of hook. Here's how to hold attention for ${length}..."`,
      introduction: `We reviewed top-performing metrics from "${cleanFirstTitle}" and found a shocking detail. It's not about algorithm tricks; it's about the speaking style and structured points.`,
      mainContent: `Here is how you format your message:
1. Setup the Problem: Focus on the struggle with ${combinedTopic}.
2. Share the Method: Give them the clear key points we found in "${cleanFirstTitle}".
3. Provide Proof: Use visual comparisons and metrics to show it works.`,
      story: `In the video "${cleanVideoTitle(selectedVideos[1]?.title || selectedVideos[0]?.title)}", this exact structure was used to keep the viewer hooked, leading to massive engagement and shares.`,
      callToAction: `If you want to scale your engagement in the ${combinedTopic} niche, hit that follow button right now!`,
      ending: `Stop posting without structure. Put this into action today. See you in the next one!`
    }
  ];

  const script = scriptOptions[randomSeed % scriptOptions.length];
  const caption = `🔥 The ultimate blueprint for ${combinedTopic}!

I analyzed top videos with over ${Math.floor(totalViews / 1000)}k combined views (including "${cleanFirstTitle}"). Here is the exact structure:

✅ Scroll-stopping hook
✅ Value compression on ${combinedTopic}
✅ Dynamic examples

👇 What's your biggest struggle with ${combinedTopic}? Let's chat!`;

  const hashtags = `#${combinedTopic.toLowerCase().replace(/[^a-z0-9]/g, '')} #contentcreation #socialmedia #creators #strategy #growth #viral`;

  return {
    analysis: {
      individual: individualAnalyses,
      combined: {
        commonIdeas: `Combining concepts of ${combinedTopic} to deliver high-value content.`,
        contentStyle: `Speaking style ranges from ${commonStyle}.`,
        audienceInterest: `Targeting ${commonAudience} interested in optimization.`
      }
    },
    script: {
      title: script.title,
      bestHook: script.bestHook,
      introduction: script.introduction,
      mainContent: script.mainContent,
      story: script.story,
      callToAction: script.callToAction,
      ending: script.ending,
      caption,
      hashtags
    }
  };
}

export async function generateScriptService(videoIds, length, userId) {
  // Fetch selected video objects
  const allVideos = db.getVideos(userId);
  const selectedVideos = allVideos.filter(v => videoIds.includes(v.id));

  if (selectedVideos.length === 0) {
    throw new Error('No videos found matching the selected IDs.');
  }

  // Check cache for this user's selection
  const userCachedData = temporaryAnalysisCache.get(userId);
  const sameSelection = isSameVideoSelection(userCachedData, videoIds);

  let individualAnalyses = [];
  let combinedAnalysis = null;

  const userSettings = db.getSettings(userId);
  const geminiKey = userSettings?.apiKeys?.gemini || process.env.GEMINI_API_KEY;

  if (!geminiKey || geminiKey.trim() === '') {
    // If same selection, reuse cached analysis but build a fresh script
    if (sameSelection && userCachedData) {
      individualAnalyses = userCachedData.individualAnalyses;
      combinedAnalysis = userCachedData.combinedAnalysis;
      const result = generateSimulatedScript(selectedVideos, length);
      result.analysis.individual = individualAnalyses;
      result.analysis.combined = combinedAnalysis;
      return result;
    } else {
      // Clean old and make fresh
      const result = generateSimulatedScript(selectedVideos, length);
      temporaryAnalysisCache.set(userId, {
        videoIds,
        individualAnalyses: result.analysis.individual,
        combinedAnalysis: result.analysis.combined
      });
      return result;
    }
  }

  // Use Gemini API
  try {
    const videosContext = selectedVideos.map((v, i) => `
Video #${i+1}:
- Platform: ${v.platform}
- Title: ${v.title}
- Description: ${v.description || 'Not available'}
- Transcript: ${v.transcript || 'Not available'}
- Tags/Keywords: ${(v.tags || []).join(', ') || 'None'}
- Views: ${v.views}
- Likes: ${v.likes}
- Comments: ${v.comments}
- Shares: ${v.shares}
- Link: ${v.url}
`).join('\n');

    let cacheInstructionsPrompt = '';
    if (sameSelection && userCachedData) {
      individualAnalyses = userCachedData.individualAnalyses;
      combinedAnalysis = userCachedData.combinedAnalysis;
      
      cacheInstructionsPrompt = `
We are reusing the following analysis of these videos:
Individual Video Analysis:
${JSON.stringify(individualAnalyses, null, 2)}
Combined Video Analysis:
${JSON.stringify(combinedAnalysis, null, 2)}

Please bypass the analysis step and only generate a brand-new, unique script based on this analysis. Ensure the generated script is completely different in hook, main points, and phrasing compared to any script you have generated before for these videos. It must still match the target audience and niche.
`;
    } else {
      cacheInstructionsPrompt = `
Please perform a completely fresh individual analysis on each of the selected videos, and then combine the analysis.
Discard any previous assumptions or cache.
`;
    }

    const prompt = `
You are an expert Social Media Copywriter, Video Strategist, and Analytics Expert.
I want you to analyze the following videos (their titles, descriptions, transcripts, tags/keywords, and engagement metrics):
${videosContext}
${cacheInstructionsPrompt}

Your task is to:
1. Analyze every selected video individually and extract/determine:
   - Title
   - Description
   - Transcript (if available, or infer from context)
   - Tags/Keywords
   - Likes, Comments, Shares, Views
   - Main Topic
   - Speaking Style
   - Tone
   - Structure
   - Key Points
   - Audience Type

2. Combine the analysis to summarize:
   - Common Ideas
   - Content Style
   - Audience Interest

3. Generate a completely new, unique script based ONLY on these selected videos and the combined analysis. 
The script must be optimized for a total reading length of: ${length}.
The script must match the topic, language, and style of the selected videos.
The script should summarize the common ideas, content style, and audience interest from all selected videos instead of copying any single video.
The script must include:
- Hook (with strong attention-grabbing emojis)
- Introduction (explaining the value proposition)
- Main Content (actionable educational or entertaining points, formatted as bullet points/numbers)
- Examples / Case Study (specific references or practical applications)
- Call to Action (e.g., comment for DM, follow, subscribe)
- Sign-off Ending

Do not write a generic script about social media growth or how to go viral, unless the selected videos themselves are about social media growth. For example, if the selected videos are about "Full Stack Mock Interviews" or "Ponytails", the entire generated script must be about that exact topic.

Please format your entire response as a single valid JSON object. The JSON keys MUST be exactly:
{
  "analysis": {
    "individual": [
      {
        "title": "Video title",
        "description": "Video description",
        "transcript": "Transcript summary or text",
        "tags": ["tag1", "tag2"],
        "views": 1000,
        "likes": 100,
        "comments": 10,
        "shares": 5,
        "mainTopic": "Main topic of this video",
        "speakingStyle": "Speaking style of this video",
        "tone": "Tone of this video",
        "structure": "Structure of this video",
        "keyPoints": ["Key point 1", "Key point 2"],
        "audienceType": "Target audience of this video"
      }
    ],
    "combined": {
      "commonIdeas": "Summary of common ideas",
      "contentStyle": "Summary of common content style",
      "audienceInterest": "Summary of audience interest"
    }
  },
  "script": {
    "title": "A catchy title for the script",
    "bestHook": "Hook (opening 1-3 sentences with emojis)",
    "introduction": "Introduction and value proposition",
    "mainContent": "Main educational/entertaining content",
    "story": "Examples and practical case study based on these videos",
    "callToAction": "Call to action",
    "ending": "Strong, punchy sign-off sentence",
    "caption": "Fully written social media description",
    "hashtags": "8-10 relevant trending hashtags"
  }
}

Ensure the response contains ONLY the raw JSON object, with no markdown code block wrapper (\`\`\`json) or external text, so it can be parsed immediately. Do not write text outside the JSON object.
`;

    const responseText = await callGeminiAPI(geminiKey, prompt);
    const parsedResult = parseJSONResponse(responseText);
    
    if (parsedResult && parsedResult.script && parsedResult.analysis) {
      if (!sameSelection) {
        // Cache the fresh analysis
        temporaryAnalysisCache.set(userId, {
          videoIds,
          individualAnalyses: parsedResult.analysis.individual,
          combinedAnalysis: parsedResult.analysis.combined
        });
      } else {
        // Preserve the cached analysis but use the new script
        parsedResult.analysis.individual = individualAnalyses;
        parsedResult.analysis.combined = combinedAnalysis;
      }
      return parsedResult;
    }
    
    // Fallback to simulated if parsing fails
    return generateSimulatedScript(selectedVideos, length);
  } catch (error) {
    console.error('Error generating script with Gemini API:', error);
    return generateSimulatedScript(selectedVideos, length);
  }
}

async function callGeminiAPI(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API HTTP Error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.candidates[0].content.parts[0].text;
}

function parseJSONResponse(text) {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/i, '');
      cleanText = cleanText.replace(/```$/, '');
    }
    return JSON.parse(cleanText.trim());
  } catch (e) {
    console.error('Failed to parse Gemini JSON output, raw text was:', text);
    return null;
  }
}
