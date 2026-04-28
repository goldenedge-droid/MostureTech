
import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are 'TechTutor', an elite professional moisture technician (Fukttekniker) and educator. 
Your goal is to guide students through the complex science of dehumidification, building physics, and psychrometrics.

Tone: Professional, expert, encouraging, and technical.
Language: Use industry standard terms (Psychrometrics, Desiccant, GPP, Mixing Ratio, Vapor Pressure).

Guidelines:
1. Explain complex math using real-world site examples (e.g., basement floods, industrial drying).
2. If a user asks for a calculation, explain the steps clearly.
3. Keep answers concise for a mobile screen.
4. When asked about moisture history, discuss the evolution of hygrometers and drying technologies from early chemical desiccation to modern heat-pump dehumidifiers.
`;

export const getTutorResponse = async (userPrompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my knowledge base right now.";
  }
};

export interface WeatherCondition {
  temp: number;
  rh: number;
}

export interface OutdoorWeatherData {
  current: WeatherCondition;
  peakDesign: WeatherCondition;
  sourceUrl: string;
  locationName: string;
}

export const getOutdoorMoistureData = async (location: string): Promise<OutdoorWeatherData | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Find two sets of data for ${location}:
    1. CURRENT outdoor temperature (°C) and relative humidity (%).
    2. PEAK SUMMER DESIGN conditions (The typical highest moisture load/mixing ratio day in summer for engineering calculations).
    
    Return ONLY a JSON object with keys: 
    "current": {"temp": number, "rh": number}, 
    "peakDesign": {"temp": number, "rh": number}, 
    "locationName": "City, Country"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    const data = JSON.parse(response.text);
    const source = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web?.uri || "https://weather.com";
    
    return {
      current: data.current,
      peakDesign: data.peakDesign,
      locationName: data.locationName,
      sourceUrl: source
    };
  } catch (error) {
    console.error("Weather Grounding Error:", error);
    return null;
  }
};

/**
 * TTS Audio Generation
 */

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateLessonSpeech = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this technical chapter professionally and clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Professional expert voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBytes = decodeBase64(base64Audio);
    return await decodeAudioData(audioBytes, audioCtx, 24000, 1);
  } catch (error) {
    console.error("TTS Generation Error:", error);
    return null;
  }
};
