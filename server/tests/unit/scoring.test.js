import { describe, it, expect } from 'vitest';
import { calculateScore } from '../../src/services/scoring/scoringService.js';

describe('Scoring Service', () => {
  it('calculates score correctly for easy difficulty with correct accusation', () => {
    // Easy base: 100, 3 evidence discovered (+15), 1 hint used (-10) = 105
    const score = calculateScore({
      difficulty: 'easy',
      isCorrect: true,
      discoveredEvidenceCount: 3,
      hintsUsed: 1
    });
    expect(score).toBe(105);
  });

  it('calculates score correctly for medium difficulty with correct accusation', () => {
    // Medium base: 150, 5 evidence discovered (+25), 2 hints used (-20) = 155
    const score = calculateScore({
      difficulty: 'medium',
      isCorrect: true,
      discoveredEvidenceCount: 5,
      hintsUsed: 2
    });
    expect(score).toBe(155);
  });

  it('calculates score correctly for hard difficulty with correct accusation', () => {
    // Hard base: 200, 9 evidence discovered (+45), 0 hints used (0) = 245
    const score = calculateScore({
      difficulty: 'hard',
      isCorrect: true,
      discoveredEvidenceCount: 9,
      hintsUsed: 0
    });
    expect(score).toBe(245);
  });

  it('calculates score correctly for incorrect accusation (0 base points)', () => {
    // Incorrect: 0 base, 4 evidence (+20), 1 hint (-10) = 10
    const score = calculateScore({
      difficulty: 'medium',
      isCorrect: false,
      discoveredEvidenceCount: 4,
      hintsUsed: 1
    });
    expect(score).toBe(10);
  });

  it('enforces a minimum score floor of 0', () => {
    // Incorrect: 0 base, 0 evidence (0), 3 hints (-30) = -30 -> clamped to 0
    const score = calculateScore({
      difficulty: 'easy',
      isCorrect: false,
      discoveredEvidenceCount: 0,
      hintsUsed: 3
    });
    expect(score).toBe(0);
  });

  it('handles negative or missing inputs gracefully', () => {
    const score = calculateScore({
      difficulty: 'easy',
      isCorrect: false
    });
    expect(score).toBe(0);
  });
});

