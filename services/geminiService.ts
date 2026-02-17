
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartSubdivision = async (taskTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert project manager. Break down the following task or event into a series of 3 to 6 logical, highly actionable, and concrete sub-tasks. 
      The breakdown should be sequential if possible. 
      Input: "${taskTitle}"`,
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

    const data = JSON.parse(response.text || '{}');
    return data.subtasks || [];
  } catch (error) {
    console.error("Error with Gemini AI subdivision:", error);
    return [];
  }
};

export const processSmartInput = async (input: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this user input and convert it into a structured application entry: "${input}". 
      
      Guidelines:
      - If it's a 'task', look for a title, priority, due date, and any mentioned sub-steps.
      - If it's an 'event', look for start/end times and location.
      - If it's a 'finance' entry, determine if it's 'spending' or 'earning', the amount, and category.
      - If it's a 'note', extract the title and content.
      
      Current year is ${new Date().getFullYear()}. Today's date is ${new Date().toISOString().split('T')[0]}.
      
      Return a clean JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['task', 'event', 'note', 'finance'] },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING, description: "ISO format YYYY-MM-DD" },
            startTime: { type: Type.STRING, description: "HH:mm format" },
            endTime: { type: Type.STRING, description: "HH:mm format" },
            amount: { type: Type.NUMBER },
            financeType: { type: Type.STRING, enum: ['spending', 'earning'] },
            priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
            subtasks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Optional list of sub-tasks if mentioned in the input"
            }
          },
          required: ["type", "title"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error with Gemini AI smart input:", error);
    return null;
  }
};
