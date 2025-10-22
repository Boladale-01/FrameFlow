import { GoogleGenAI, Type } from "@google/genai";
import { Strategy, ContentType, Platform, Shot } from '../types';

if (!process.env.API_KEY) {
    console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const baseSystemInstruction = `You are FrameFlow’s production strategist. You are helpful, creative, and concise. Prefer low-budget, phone-friendly setups. For TikTok/IG Reels, suggest vertical framing (9:16); for YouTube, 16:9. You MUST structure scripts using these exact headings (without markdown hashes): HOOK, SELLING THE SOLUTION, GIVING THE PRINCIPLE, MAKING IT APPLICABLE, CTA. The content should be SEO-friendly and engaging.`;

const strategySchema = {
  type: Type.OBJECT,
  properties: {
    script: { type: Type.STRING, description: "A beat-by-beat script in concise Markdown format, following the required 5-part structure." },
    shots: {
      type: Type.ARRAY, description: "A detailed list of shots required for the video.",
      items: {
        type: Type.OBJECT,
        properties: {
          scene: { type: Type.STRING }, angle: { type: Type.STRING }, location: { type: Type.STRING },
          gear: { type: Type.ARRAY, items: { type: Type.STRING } }, notes: { type: Type.STRING },
        },
        required: ["scene", "angle", "location", "gear", "notes"],
      },
    },
    editingPlan: {
      type: Type.ARRAY, description: "A step-by-step plan for editing the video.",
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.STRING }, tools: { type: Type.ARRAY, items: { type: Type.STRING } }, notes: { type: Type.STRING },
        },
        required: ["step", "tools", "notes"],
      },
    },
  },
  required: ["script", "shots", "editingPlan"],
};

export const generateStrategy = async (
  title: string, idea: string, contentType: ContentType, platform: Platform
): Promise<Strategy> => {
  try {
    const userPrompt = `Generate a full production strategy for the following video idea:\n\nTitle: ${title}\nIdea: ${idea}\nContent Type: ${contentType}\nPlatform: ${platform}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', contents: userPrompt,
      config: {
        systemInstruction: baseSystemInstruction,
        responseMimeType: "application/json", responseSchema: strategySchema,
      },
    });
    const parsedResult = JSON.parse(response.text.trim());
    return {
      ...parsedResult,
      shots: parsedResult.shots.map((shot: any, i: number) => ({ ...shot, id: `shot_${Date.now()}_${i}` })),
      editingPlan: parsedResult.editingPlan.map((step: any, i: number) => ({ ...step, id: `edit_${Date.now()}_${i}` })),
    };
  } catch (error) {
    console.error("Error generating strategy with Gemini:", error);
    throw new Error("Failed to generate AI strategy. Please check your API key and try again.");
  }
};

export const refineScript = async (existingScript: string, prompt: string, formType: 'short' | 'long'): Promise<string> => {
    try {
        const fullPrompt = `You are a script doctor. The user wants to refine their script. \n\nUSER'S GOAL: "${prompt}"\n\nSCRIPT FORM: "${formType}"\n\nEXISTING SCRIPT:\n---\n${existingScript}\n---\n\nReturn the complete, revised script. If generating a long-form script, expand on each of the 5 sections to create a more detailed narrative. If editing, apply the user's goal to the entire script. Ensure the output is only the new script text, following the required 5-part structure.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: fullPrompt,
            config: { systemInstruction: baseSystemInstruction }
        });
        return response.text;
    } catch (error) {
        console.error("Error refining script:", error);
        throw new Error("Failed to refine script.");
    }
};

export const analyzeScriptForShots = async (script: string): Promise<Shot[]> => {
    try {
        const fullPrompt = `You are a Director of Photography. Analyze the following video script and generate a comprehensive shot list. For each shot, suggest a scene name (linked to the script part), camera angle, location, necessary gear, and brief notes. The script provides the narrative context. Return ONLY a JSON array of shot objects.\n\n---\n\nSCRIPT:\n${script}\n\n---\n\nNew shots (JSON Array):`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: fullPrompt,
            config: {
                systemInstruction: baseSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: strategySchema.properties.shots.items }
            }
        });
        const parsedResult = JSON.parse(response.text.trim());
        return parsedResult.map((shot: any, i: number) => ({ ...shot, id: `shot_${Date.now()}_${i}` }));
    } catch (error) {
        console.error("Error generating shot segment:", error);
        throw new Error("Failed to generate new shots from script.");
    }
};

export const generateTitles = async (topic: string): Promise<string[]> => {
    try {
        const fullPrompt = `Generate 5 catchy, SEO-friendly video titles for the following topic: "${topic}". Return a simple JSON array of strings.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: fullPrompt,
            config: {
                systemInstruction: "You are a viral marketing expert specializing in video titles.",
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating titles:", error);
        throw new Error("Failed to generate titles.");
    }
};

export const generateHashtags = async (topic: string): Promise<string[]> => {
    try {
        const fullPrompt = `Generate a list of 10-15 relevant and trending hashtags for a video about "${topic}". Include a mix of broad and niche tags. Return a simple JSON array of strings, each starting with '#'.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: fullPrompt,
            config: {
                systemInstruction: "You are a social media expert who knows all about trending hashtags.",
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating hashtags:", error);
        throw new Error("Failed to generate hashtags.");
    }
};

export const generatePromptIdeas = async (topic: string): Promise<string[]> => {
    try {
        const fullPrompt = `Generate 5 unique and engaging video script prompts based on the user's topic: "${topic}". The prompts should be actionable ideas for a creator. Return a JSON array of strings.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: fullPrompt,
            config: {
                systemInstruction: "You are a creative assistant for video creators, specializing in brainstorming viral video ideas.",
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating prompt ideas:", error);
        throw new Error("Failed to generate prompt ideas.");
    }
};