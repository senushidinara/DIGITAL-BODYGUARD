
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize GoogleGenAI strictly using process.env.API_KEY as the only parameter in the configuration object
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const lockAccountDeclaration: FunctionDeclaration = {
  name: 'lock_user_account',
  parameters: {
    type: Type.OBJECT,
    description: 'Temporarily disables account access to prevent unauthorized data exfiltration.',
    properties: {
      user_id: { type: Type.STRING, description: 'The unique identifier for the user account.' },
      reason: { type: Type.STRING, description: 'The reason for locking the account.' }
    },
    required: ['user_id', 'reason']
  }
};

const rotateKeysDeclaration: FunctionDeclaration = {
  name: 'rotate_security_keys',
  parameters: {
    type: Type.OBJECT,
    description: 'Automatically generates new API keys if a leak is detected.',
    properties: {
      account_id: { type: Type.STRING, description: 'The account ID associated with the keys.' },
      scope: { type: Type.STRING, description: 'The scope of keys to rotate (e.g., "all", "api_only").' }
    },
    required: ['account_id']
  }
};

const triggerVoiceCallDeclaration: FunctionDeclaration = {
  name: 'trigger_elevenlabs_call',
  parameters: {
    type: Type.OBJECT,
    description: 'Initiates a voice call via ElevenLabs to explain the situation to the user.',
    properties: {
      phone: { type: Type.STRING, description: 'The phone number to call.' },
      script: { type: Type.STRING, description: 'The exact script for the AI voice to speak.' }
    },
    required: ['phone', 'script']
  }
};

export const analyzeThreat = async (alertJson: any) => {
  const model = 'gemini-3-flash-preview';
  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: JSON.stringify(alertJson) }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{
        functionDeclarations: [
          lockAccountDeclaration,
          rotateKeysDeclaration,
          triggerVoiceCallDeclaration
        ]
      }],
      temperature: 0.1, // Low temperature for deterministic security reasoning
    }
  });

  return {
    text: response.text || '',
    functionCalls: response.functionCalls || []
  };
};
