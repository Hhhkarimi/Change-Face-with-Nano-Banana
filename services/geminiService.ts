import { GoogleGenAI } from "@google/genai";
import { EditResponse } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string suitable for the API.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Edits an image using the Gemini 2.5 Flash Image model (Nano Banana).
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<EditResponse> => {
  try {
    // According to instructions: use 'gemini-2.5-flash-image' for "nano banana"
    const modelId = 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Do not set responseMimeType or responseSchema for image generation/editing tasks on this model
    });

    let imageUrl: string | undefined;
    let textResponse: string | undefined;

    // Iterate through parts to find image or text
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          // Construct the data URL for display
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
        } else if (part.text) {
          if (!textResponse) textResponse = '';
          textResponse += part.text;
        }
      }
    }

    return { imageUrl, text: textResponse };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};