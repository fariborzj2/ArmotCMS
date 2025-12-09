import { GoogleGenAI } from "@google/genai";
import { BlogPost, CommentAnalysis, ScheduleSlot } from "../types";

// Safe initialization to prevent crash in browser if key is missing or process is undefined
let ai: GoogleGenAI | null = null;

try {
  // Safely check for API Key presence
  // @ts-ignore
  const apiKey = typeof process !== "undefined" ? process.env?.API_KEY : undefined;
  
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("ArmotCMS: AI features disabled. API_KEY is missing in process.env");
  }
} catch (e) {
  console.warn("ArmotCMS: Failed to initialize AI SDK", e);
}

// Helper to strip Markdown JSON code blocks and find the JSON object/array
const cleanJSON = (text: string) => {
  try {
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // Find the first '{' or '[' and the last '}' or ']'
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    
    // Determine if it's likely an object or array
    let start = -1;
    let end = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        end = clean.lastIndexOf('}');
    } else if (firstBracket !== -1) {
        start = firstBracket;
        end = clean.lastIndexOf(']');
    }

    if (start !== -1 && end !== -1) {
        clean = clean.substring(start, end + 1);
    }

    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Error on AI response:", text);
    return null;
  }
};

export const aiService = {
  /**
   * Generates a full blog post based on a topic.
   */
  generatePost: async (topic: string, model: string = 'gemini-2.5-flash', existingPosts: {title: string, slug: string}[] = [], availableTags: string[] = []): Promise<Partial<BlogPost>> => {
    if (!ai) throw new Error("AI API Key is missing. Please check your configuration.");

    const internalLinksPrompt = existingPosts.length > 0 ? `
      Internal Linking Context:
      Here is a list of existing articles on the blog:
      ${JSON.stringify(existingPosts)}
      
      Instruction: If the generated content relates to any of these topics, create a hyperlink to the provided URL using the format <a href="/blog/post/{id}-{slug}">{Title}</a>. Do this naturally within the flow of the text.
    ` : '';

    const tagsPrompt = availableTags.length > 0 ? `
      Tags Instruction:
      Select 3-5 tags STRICTLY from this list only: ${JSON.stringify(availableTags)}. 
      Do NOT invent new tags.
    ` : 'Tags: Generate 5 relevant tags in Persian.';

    const prompt = `
      Write a professional, high-quality, and SEO-optimized blog post in Persian about: "${topic}".
      
      Requirements:
      1. Title: Engaging and clickable (Persian).
      2. Excerpt: Short summary for meta description (max 160 chars).
      3. ${tagsPrompt}
      4. Content: Full, RICH HTML article. 
         - Structure: Use proper hierarchy <h2>, <h3>, <h4>.
         - Formatting: Use <strong> for emphasis, <em> for italics.
         - Lists: Use both <ul> and <ol> where appropriate.
         - Quotes: Use <blockquote> for key insights or quotes.
         - Tables: If data or comparisons are suitable, you MUST include a standard HTML <table> with <thead> and <tbody>.
         - Do NOT use markdown (like **bold** or ## header). Use HTML tags only.
         - Minimum 600 words.
      5. Slug: English URL friendly string (kebab-case).
      6. FAQs: Array of 2 items.
      
      ${internalLinksPrompt}
      
      Output JSON strictly:
      {
        "title": "string",
        "slug": "string",
        "excerpt": "string",
        "content": "html_string",
        "tags": ["string"],
        "faqs": [{"question": "string", "answer": "string"}]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
      });
      return cleanJSON(response.text || '{}');
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  },

  /**
   * Simulates a Crawl & Rewrite process. 
   */
  crawlAndRewrite: async (sourceText: string, model: string = 'gemini-2.5-flash', existingPosts: {title: string, slug: string}[] = [], availableTags: string[] = []): Promise<Partial<BlogPost>> => {
    if (!ai) throw new Error("AI API Key is missing.");

    const isUrl = sourceText.startsWith('http');
    const internalLinksPrompt = existingPosts.length > 0 ? `
      Internal Linking:
      Reference existing articles if relevant: ${JSON.stringify(existingPosts)}. Link format: <a href="/blog/post/{slug}">{Title}</a>.
    ` : '';

    const tagsPrompt = availableTags.length > 0 ? `
      Tags Instruction:
      Select 3-5 tags STRICTLY from this list only: ${JSON.stringify(availableTags)}. 
      Do NOT invent new tags.
    ` : 'Tags: Generate 5 relevant tags in Persian.';

    const prompt = `
      Act as a senior editor and journalist.
      ${isUrl ? `I have a target URL: "${sourceText}". Simulate crawling this page and extract its core topic and key points.` : `I have a source text: "${sourceText.substring(0, 4000)}"`}
      
      Task: Rewrite this into a unique, high-quality Persian article with rich formatting.
      
      Guidelines:
      - Tone: Professional, Journalistic, Objective.
      - Structure: Compelling Headline, Lead Paragraph, Body with Subheaders.
      - HTML Format: Use <h2>, <h3>, <p>, <ul>, <li>.
      - Features: 
         - Include a <blockquote> for the main takeaway.
         - Include a <table> if there is comparative data.
         - Use <strong> to highlight keywords.
      - SEO: Optimized for keywords relevant to the topic.
      - Unique: Do not translate word-for-word. Synthesize and rewrite in Persian.
      - FAQs: Generate 2 FAQs relevant to the content in Persian.
      - ${tagsPrompt}
      
      ${internalLinksPrompt}
      
      Output JSON strictly:
      {
        "title": "string (Persian)",
        "slug": "string (English kebab-case)",
        "excerpt": "string (Persian)",
        "content": "html_string (Persian)",
        "tags": ["string"],
        "faqs": [{"question": "string", "answer": "string"}]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return cleanJSON(response.text || '{}');
    } catch (error) {
      console.error("AI Rewrite Error:", error);
      throw error;
    }
  },

  /**
   * Rewrites content to be more engaging or SEO friendly.
   */
  rewriteContent: async (content: string, model: string = 'gemini-2.5-flash') => {
    if (!ai) throw new Error("AI API Key is missing.");

    const prompt = `Rewrite the following Persian text to be more engaging, journalistic, and SEO-friendly. 
    Maintain strict HTML structure. Add <strong> for emphasis and ensure headings are correct.
    Return ONLY the rewritten text. \n\n Text: ${content}`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("AI Rewrite Error:", error);
        throw error;
    }
  },

  /**
   * Analyzes a comment for sentiment, type, and suggests a reply.
   */
  analyzeComment: async (comment: string, tone: 'formal' | 'friendly' | 'humorous', model: string = 'gemini-2.5-flash'): Promise<CommentAnalysis | null> => {
    if (!ai) return null;

    const prompt = `
      Analyze this user comment on a Persian blog: "${comment}"
      
      Tasks:
      1. Sentiment: positive, neutral, or negative.
      2. Type: question, critique, suggestion, or general.
      3. Reply: Write a polite, ${tone} Persian reply. 
         - IMPORTANT: Keep it VERY SHORT and CONCISE (max 2-3 sentences).
         - If 'question', answer helpfully but briefly.
         - If 'critique', acknowledge and thank.
         - If 'spam', suggest "SPAM_DETECTED" as reply.
         
      Output JSON strictly:
      {
        "sentiment": "positive|neutral|negative",
        "type": "question|critique|suggestion|general",
        "suggestedReply": "string"
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanJSON(response.text || '{}');
    } catch (error) {
        console.error("AI Comment Analysis Error:", error);
        return null;
    }
  },

  /**
   * Summarizes a long article for the frontend user.
   */
  summarize: async (content: string, model: string = 'gemini-2.5-flash') => {
    if (!ai) throw new Error("AI API Key is missing.");

    const prompt = `Summarize the following article in Persian into 3 concise bullet points. Return as HTML <ul><li>...</li></ul>. \n\n Article: ${content.substring(0, 5000)}`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("AI Summary Error:", error);
        throw error;
    }
  },

  /**
   * Extracts Key Highlights.
   */
  extractHighlights: async (content: string, model: string = 'gemini-2.5-flash') => {
    if (!ai) return null;

    const prompt = `
      Extract 3-5 specific "Key Highlights" (facts, numbers, or main takeaways) from this text. 
      CRITICAL: The output MUST be in Persian language, regardless of the source text language.
      Format as HTML <ul><li>...</li></ul>. 
      \n\n Text: ${content.substring(0, 5000)}
    `;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        return null;
    }
  },

  /**
   * Smart Scheduler: Suggests posting times.
   */
  optimizeSchedule: async (existingDates: string[], model: string = 'gemini-2.5-flash'): Promise<ScheduleSlot[]> => {
    if (!ai) throw new Error("AI API Key is missing.");

    const prompt = `
      Act as a Content Strategist for a Persian blog.
      Existing Posts Dates: ${JSON.stringify(existingDates)}.
      
      Task: Suggest 3 optimal times for NEW posts next week.
      Consider:
      - Spread content out (don't bunch up).
      - Best engagement times (e.g., 10am, 5pm).
      - Provide a brief reason in Persian.
      - Suggest a trending Tech/Web topic for each slot (in Persian).
      
      Output JSON array strictly:
      [
        { 
          "date": "ISO_Date_String (YYYY-MM-DDTHH:mm:ss.sssZ)", 
          "bestTime": "HH:mm", 
          "reason": "Persian reason", 
          "topic": "Persian topic idea" 
        }
      ]
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanJSON(response.text || '[]');
    } catch (error) {
        console.error("AI Scheduler Error:", error);
        return [];
    }
  },

  /**
   * Generates a Blog Featured Image
   */
  generateBlogImage: async (prompt: string): Promise<string | null> => {
    if (!ai) return null;

    const fullPrompt = `A high quality, professional, minimalist blog header image about: "${prompt}". No text, abstract or photorealistic style.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Using flash-image for speed as requested
            contents: {
                parts: [{ text: fullPrompt }]
            }
        });
        
        // Extract base64
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("AI Image Gen Error:", error);
        return null;
    }
  }
};