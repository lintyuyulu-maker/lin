
import { GoogleGenAI, Type, Chat, Content } from "@google/genai";
import { UserProfile, ScheduleResponse, ScheduleItem, ChatMessage, WeatherData, StyleOption, Language, LifestyleData, TimeZone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

// Helper to convert internal ChatMessage format to Gemini Content format
export const mapMessagesToHistory = (messages: ChatMessage[]): Content[] => {
  return messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
};

export const createSchedulerChat = (profile: UserProfile, language: Language, history?: Content[]): Chat => {
  const systemInstruction = `
    You are an elite Personal Assistant. You are professional, rigorous, and reliable.
    
    CORE OBJECTIVE:
    Manage the user's daily schedule AND lifestyle (diet, clothing) through natural dialogue.
    
    LANGUAGE PROTOCOL:
    The user has selected ${language} as the system language.
    You MUST generate the "reply", "title", "description", "rationale", and any "lifestyleUpdate" content in ${language}.
    
    PROTOCOLS:
    1. **Interactive Scheduling**: The user will speak to you naturally. You must update the schedule based on their requests (add, remove, move, edit tasks).
    2. **Lifestyle Management**: You have access to the user's Lifestyle data (Weather, Style, Diet). 
       - If the user asks about clothing, analyzing weather, or diet, provide advice and UPDATE the 'lifestyleUpdate' field in the JSON response.
    3. **Profile Adaptation**: Use their Profession (${profile.profession}) and MBTI (${profile.mbti}) to optimize timing, task grouping, and recommendations.
    4. **Output Format**: You must ALWAYS return a JSON object containing the conversational 'reply', the FULL 'schedule' array, and optional 'lifestyleUpdate'.
    
    STRICT SPEECH & FORMATTING GUIDELINES:
    - **Natural Human Speech**: You must sound like a competent human professional, not a robot.
      - AVOID robotic phrases like "Processing request", "System updated", "I have executed the command".
      - USE natural phrasing like "I've added that to your list", "Consider it done", "I've cleared your afternoon for that."
    - **NO Roleplay/Artifacts**: ABSOLUTELY NO asterisks (*), brackets ([]), or parentheses (()) to describe actions or expressions.
      - INCORRECT: *nods* I will do that.
      - INCORRECT: [Thinking] Let me check...
      - INCORRECT: *smiles* Of course.
      - CORRECT: I'll take care of that right away.
    - **Professional Tone**: Concise, polite, efficient, and warm. Address the user directly.
    
    When the user sends a message, you will receive their text AND the current JSON state of the schedule and lifestyle. Use the JSON state as the baseline to modify.
  `;

  return ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING, description: `Natural conversational response to the user in ${language}. NO asterisks (*), NO roleplay.` },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                time: { type: Type.STRING, description: "HH:MM format 24h" },
                title: { type: Type.STRING, description: `Title of the task in ${language}` },
                description: { type: Type.STRING, description: `Description in ${language}` },
                completed: { type: Type.BOOLEAN },
              },
              required: ["id", "time", "title", "description", "completed"],
            },
          },
          rationale: { type: Type.STRING, description: `Brief logic for the changes made, in ${language}.` },
          lifestyleUpdate: {
            type: Type.OBJECT,
            properties: {
              outfitAdvice: { type: Type.STRING, description: `Outfit recommendation string in ${language}, if relevant to query.` },
              dietAdvice: { type: Type.STRING, description: `Dietary recommendation string in ${language}, if relevant to query.` }
            }
          }
        },
        required: ["reply", "schedule", "rationale"],
      },
    },
    history: history || []
  });
};

export const sendSchedulerMessage = async (
  chat: Chat, 
  userMessage: string, 
  currentSchedule: ScheduleItem[],
  lifestyleData: LifestyleData,
  clockZones: TimeZone[],
  language: Language
): Promise<ScheduleResponse> => {
  const now = new Date().toLocaleTimeString();
  
  const prompt = `
    Current Time: ${now}
    
    CONTEXT DATA:
    - Weather: ${lifestyleData.weather ? `${lifestyleData.weather.temperature}°C, ${lifestyleData.weather.conditionText}` : 'Unknown (Not acquired)'}
    - Current Outfit Advice: ${lifestyleData.outfitAdvice || 'None'}
    - Current Diet Advice: ${lifestyleData.dietAdvice || 'None'}
    - World Clocks: ${clockZones.map(z => z.name).join(', ')}

    CURRENT SCHEDULE STATE (JSON):
    ${JSON.stringify(currentSchedule)}

    USER REQUEST:
    "${userMessage}"

    Instructions:
    - Analyze the User Request.
    - If they want to add/modify tasks, update the Schedule State.
    - If they ask for Outfit/Diet advice, provide it in the 'lifestyleUpdate' field AND the 'reply'.
    - If they just want to chat, keep the Schedule State as is.
    - Return the new full schedule and a polite, natural reply.
    - LANGUAGE CONSTRAINT: Respond in ${language}.
    - REMINDER: DO NOT use asterisks (*) or roleplay actions. Speak naturally.
  `;

  try {
    const response = await chat.sendMessage({
      message: prompt
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI Butler.");
    
    return JSON.parse(text) as ScheduleResponse;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

// --- Lifestyle Modules (Standalone Generation) ---

export const generateOutfitAdvice = async (
  weather: WeatherData, 
  style: StyleOption, 
  profile: UserProfile,
  language: Language
): Promise<string> => {
  const prompt = `
    Role: Professional Stylist.
    Task: Recommend an outfit.
    
    Context:
    - Weather: ${weather.temperature}°C, ${weather.conditionText}.
    - Time of Day: ${weather.isDay ? 'Daytime' : 'Nighttime'}.
    - User Style Preference: ${style}.
    - User Profession: ${profile.profession}.
    
    Constraints:
    - Provide a specific, stylish outfit recommendation suitable for the weather and profession.
    - LANGUAGE CONSTRAINT: Respond in ${language}.
    - Tone: Elegant, concise, professional.
    - STRICTLY NO asterisks (*), NO roleplay symbols.
    - Return plain text only.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
  });

  return response.text || "I was unable to generate a recommendation at this time.";
};

export const generateDietaryAdvice = async (profile: UserProfile, language: Language): Promise<string> => {
  const prompt = `
    Role: Elite Nutritionist.
    Task: Provide a daily dietary recommendation/philosophy.
    
    Context:
    - User Profession: ${profile.profession} (Consider energy needs).
    - User MBTI: ${profile.mbti} (Consider routine vs variety preferences).
    
    Constraints:
    - Provide concise, actionable dietary advice for today.
    - Focus on energy maintenance and cognitive function.
    - LANGUAGE CONSTRAINT: Respond in ${language}.
    - Tone: Rigorous, caring, professional.
    - STRICTLY NO asterisks (*), NO roleplay symbols.
    - Return plain text only.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
  });

  return response.text || "I was unable to generate a nutritional plan at this time.";
};
