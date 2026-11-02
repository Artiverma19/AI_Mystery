import { getGeminiClient, GEMINI_CASE_RESPONSE_SCHEMA } from './geminiClient.js';
import { generatedCaseSchema, DIFFICULTY_CONFIG } from '../../validators/caseValidator.js';
import { AppError } from '../../middleware/errorHandler.js';

export function buildSystemPrompt(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  return `You are the Master Storyteller and Game Master for AI Mystery Room, a browser-based fictional puzzle and investigation game.

YOUR ROLE:
Turn the user's premise into a self-contained, solvable, fictional mystery challenge.
The difficulty requested is: "${difficulty.toUpperCase()}".

EXACT REQUIREMENTS:
1. Suspects count: EXACTLY ${config.suspectCount} suspects.
2. Evidence count: EXACTLY ${config.evidenceCount} evidence items.
3. Hints count: EXACTLY ${config.hintCount} hints ordered strictly from subtle to more direct.
4. Culprit: EXACTLY ONE culprit among the suspects, designated in answerKey.culpritSuspectId.
5. Evidence types supported: 'chat', 'image', 'camera_record', 'document', 'statement', 'timeline'. Use a diverse mix of these types.
6. Internal consistency: The evidence timeline, statements, and clue details must logically lead to the culprit without contradiction.
7. Fairness: The mystery must be fair and deducible using logical deduction, contradictions, or alibis.
8. Answer isolation: Suspect public statements and public profiles must NOT reveal the culprit.
9. Safety & Boundaries: All characters, places, and events must be completely FICTIONAL. No real living people, no graphic violence, no real crime instructions, and no sexually explicit content. Suitable for a general audience.
10. Portrait & Media: Set portrait.kind to 'placeholder', portrait.assetUrl to null, and portrait.alt to a descriptive visual character summary. For evidence, assetUrl is null (unless an explicit placeholder is used), and isClue is true for key clues.

Output MUST be strictly valid JSON conforming to the requested schema.`;
}

export async function generateMysteryCase({ premise, difficulty }) {
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) {
    throw new AppError('INVALID_INPUT', `Invalid difficulty: ${difficulty}`, 400);
  }

  let lastError = null;
  const maxAttempts = 3; // 1 initial + 2 retries

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const ai = getGeminiClient();
      const prompt = `Fictional Mystery Premise:
"""${premise}"""

Difficulty: ${difficulty}
Required Suspect Count: ${config.suspectCount}
Required Evidence Count: ${config.evidenceCount}
Required Hint Count: ${config.hintCount}

Generate the complete mystery case JSON now.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: buildSystemPrompt(difficulty),
          responseMimeType: 'application/json',
          responseSchema: GEMINI_CASE_RESPONSE_SCHEMA,
          temperature: 0.7
        }
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Gemini returned an empty response');
      }

      let parsedJson;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (parseErr) {
        throw new Error(`Invalid JSON returned from model: ${parseErr.message}`);
      }

      // Ensure difficulty matches
      parsedJson.difficulty = difficulty;

      // Validate with Zod
      const validatedCase = generatedCaseSchema.parse(parsedJson);
      return validatedCase;
    } catch (err) {
      console.warn(`[CaseGenerator] Attempt ${attempt}/${maxAttempts} failed:`, err.message);
      lastError = err;
    }
  }

  throw new AppError(
    'AI_GENERATION_FAILED',
    `Failed to generate a valid mystery case after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`,
    502
  );
}
