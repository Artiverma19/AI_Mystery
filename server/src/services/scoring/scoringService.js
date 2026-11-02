import { DIFFICULTY_CONFIG } from '../../validators/caseValidator.js';

export function calculateScore({ difficulty, isCorrect, discoveredEvidenceCount = 0, hintsUsed = 0 }) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const basePoints = config ? config.basePoints : 100;

  const accusationPoints = isCorrect ? basePoints : 0;
  const evidencePoints = Math.max(0, discoveredEvidenceCount) * 5;
  const hintPenalty = Math.max(0, hintsUsed) * 10;

  const rawScore = accusationPoints + evidencePoints - hintPenalty;
  return Math.max(0, rawScore);
}
