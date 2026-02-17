
import { GoogleGenAI, Type } from "@google/genai";

// Correctly initialize GoogleGenAI using a named parameter and process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartSubdivision = async (taskTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Break down the following task or event into 3 to 5 logical, actionable sub-tasks: "${taskTitle}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["subtasks"]
        }
      }
    });

    // Directly access .text property from GenerateContentResponse as per guidelines
    const data = JSON.parse(response.text || '{}');
    return data.subtasks || [];
  } catch (error) {
    console.error("Error with Gemini AI:", error);
    return [];
  }
};
