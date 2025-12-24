
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const transformImage = async (base64Image: string, prompt: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Strip the prefix (e.g., "data:image/png;base64,") if present
  const base64Data = base64Image.split(',')[1] || base64Image;
  const mimeType = base64Image.match(/data:([^;]+);/)?.[1] || 'image/png';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let transformedBase64 = '';
    
    // Iterate through parts to find the image part
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          transformedBase64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!transformedBase64) {
      throw new Error("The model did not return an edited image. Try a different prompt.");
    }

    return transformedBase64;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "An unexpected error occurred during transformation.");
  }
};
