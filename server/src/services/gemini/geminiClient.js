import { GoogleGenAI } from '@google/genai';

let clientInstance = null;

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  if (!clientInstance) {
    clientInstance = new GoogleGenAI({ apiKey });
  }

  return clientInstance;
}

export const GEMINI_CASE_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    briefing: { type: 'STRING' },
    setting: { type: 'STRING' },
    incident: { type: 'STRING' },
    difficulty: { type: 'STRING', enum: ['easy', 'medium', 'hard'] },
    suspects: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          name: { type: 'STRING' },
          profile: { type: 'STRING' },
          statement: { type: 'STRING' },
          motive: { type: 'STRING' },
          opportunity: { type: 'STRING' },
          portrait: {
            type: 'OBJECT',
            properties: {
              kind: { type: 'STRING', enum: ['placeholder', 'generated'] },
              assetUrl: { type: 'STRING', nullable: true },
              alt: { type: 'STRING' }
            },
            required: ['kind', 'alt']
          }
        },
        required: ['id', 'name', 'profile', 'statement', 'motive', 'opportunity', 'portrait']
      }
    },
    evidence: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          type: {
            type: 'STRING',
            enum: ['chat', 'image', 'camera_record', 'document', 'statement', 'timeline']
          },
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          source: { type: 'STRING' },
          content: { type: 'STRING' },
          assetUrl: { type: 'STRING', nullable: true },
          timestamp: { type: 'STRING', nullable: true },
          location: { type: 'STRING', nullable: true },
          isClue: { type: 'BOOLEAN' }
        },
        required: ['id', 'type', 'title', 'description', 'source', 'content', 'isClue']
      }
    },
    hints: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    },
    answerKey: {
      type: 'OBJECT',
      properties: {
        culpritSuspectId: { type: 'STRING' },
        motive: { type: 'STRING' },
        method: { type: 'STRING' },
        opportunity: { type: 'STRING' },
        explanation: { type: 'STRING' },
        supportingEvidenceIds: {
          type: 'ARRAY',
          items: { type: 'STRING' }
        }
      },
      required: ['culpritSuspectId', 'motive', 'method', 'opportunity', 'explanation', 'supportingEvidenceIds']
    }
  },
  required: ['title', 'briefing', 'setting', 'incident', 'difficulty', 'suspects', 'evidence', 'hints', 'answerKey']
};
