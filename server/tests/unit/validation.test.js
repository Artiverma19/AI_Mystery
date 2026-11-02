import { describe, it, expect } from 'vitest';
import {
  createCaseInputSchema,
  accuseInputSchema,
  generatedCaseSchema
} from '../../src/validators/caseValidator.js';

describe('Validation Schemas', () => {
  describe('createCaseInputSchema', () => {
    it('accepts valid premise and difficulty', () => {
      const input = {
        premise: 'A priceless sapphire vanishes from the locked museum vault during the gala.',
        difficulty: 'medium'
      };
      const result = createCaseInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects premise shorter than 20 characters', () => {
      const input = {
        premise: 'Too short',
        difficulty: 'easy'
      };
      const result = createCaseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('at least 20 characters');
    });

    it('rejects premise longer than 1000 characters', () => {
      const input = {
        premise: 'a'.repeat(1001),
        difficulty: 'hard'
      };
      const result = createCaseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('not exceed 1000 characters');
    });

    it('rejects invalid difficulty level', () => {
      const input = {
        premise: 'A priceless sapphire vanishes from the locked museum vault during the gala.',
        difficulty: 'extreme'
      };
      const result = createCaseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('accuseInputSchema', () => {
    it('accepts valid suspect ID', () => {
      const result = accuseInputSchema.safeParse({ suspectId: 'suspect_1' });
      expect(result.success).toBe(true);
    });

    it('rejects empty suspect ID', () => {
      const result = accuseInputSchema.safeParse({ suspectId: '   ' });
      expect(result.success).toBe(false);
    });
  });

  describe('generatedCaseSchema (Counts and Integrity)', () => {
    const validEasyCase = {
      title: 'The Stolen Sapphire',
      briefing: 'Investigate the disappearance of the Grand Sapphire.',
      setting: 'City Museum of History',
      incident: 'The display case was shattered at midnight.',
      difficulty: 'easy',
      suspects: [
        {
          id: 's1',
          name: 'Arthur Pendelton',
          profile: 'Museum curator with heavy debts.',
          statement: 'I was checking the inventory in room B.',
          motive: 'Financial distress.',
          opportunity: 'Master key access.',
          portrait: { kind: 'placeholder', assetUrl: null, alt: 'Arthur portrait' }
        },
        {
          id: 's2',
          name: 'Brenda Vance',
          profile: 'Night security guard on duty.',
          statement: 'I heard glass breaking but saw no one.',
          motive: 'Dissatisfied with work.',
          opportunity: 'On patrol at midnight.',
          portrait: { kind: 'placeholder', assetUrl: null, alt: 'Brenda portrait' }
        },
        {
          id: 's3',
          name: 'Cedric Wells',
          profile: 'Visiting gem collector.',
          statement: 'I was in the lounge until 12:30 AM.',
          motive: 'Obsession with the sapphire.',
          opportunity: 'Lingered after closing.',
          portrait: { kind: 'placeholder', assetUrl: null, alt: 'Cedric portrait' }
        }
      ],
      evidence: [
        {
          id: 'e1',
          type: 'chat',
          title: 'Encrypted Text Messages',
          description: 'A text message thread discussing pawn values.',
          source: 'Arthur phone logs',
          content: 'Can you guarantee 50k before sunrise?',
          assetUrl: null,
          timestamp: '11:45 PM',
          location: 'Museum office',
          isClue: true
        },
        {
          id: 'e2',
          type: 'camera_record',
          title: 'East Corridor Camera',
          description: 'Footage transcript of a shadowy figure at 11:58 PM.',
          source: 'Security DVR',
          content: 'Figure wearing a brown tweed coat enters vault.',
          assetUrl: null,
          timestamp: '11:58 PM',
          location: 'Vault corridor',
          isClue: true
        },
        {
          id: 'e3',
          type: 'document',
          title: 'Security Logbook',
          description: 'Paper logbook with sign-in signatures.',
          source: 'Front desk',
          content: 'Cedric Wells signed out at 11:30 PM.',
          assetUrl: null,
          timestamp: '11:30 PM',
          location: 'Front desk',
          isClue: false
        },
        {
          id: 'e4',
          type: 'statement',
          title: 'Janitor Testimony',
          description: 'Summary statement from cleaning staff.',
          source: 'Police interview',
          content: 'Saw Arthur wearing a tweed coat earlier in the day.',
          assetUrl: null,
          timestamp: 'Next morning',
          location: 'Police precinct',
          isClue: true
        },
        {
          id: 'e5',
          type: 'timeline',
          title: 'Alarm System Incident Log',
          description: 'Automated timestamp readout of sensor trips.',
          source: 'Alarm server',
          content: 'Motion detected in vault: 11:55 PM.',
          assetUrl: null,
          timestamp: '11:55 PM',
          location: 'System server',
          isClue: false
        }
      ],
      hints: [
        'Pay close attention to clothing descriptions across evidence.',
        'Check who has financial pressure matching the chat records.'
      ],
      answerKey: {
        culpritSuspectId: 's1',
        motive: 'Arthur needed money to pay debts.',
        method: 'Used curator master key and wore a tweed coat.',
        opportunity: 'Inside museum after hours.',
        explanation: 'Arthur matched the tweed coat in camera footage and pawn chat logs.',
        supportingEvidenceIds: ['e1', 'e2', 'e4']
      }
    };

    it('accepts a fully compliant case for easy difficulty', () => {
      const result = generatedCaseSchema.safeParse(validEasyCase);
      expect(result.success).toBe(true);
    });

    it('rejects easy case if suspect count is not 3', () => {
      const invalidCase = {
        ...validEasyCase,
        suspects: validEasyCase.suspects.slice(0, 2)
      };
      const result = generatedCaseSchema.safeParse(invalidCase);
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.message.includes('Expected 3 suspects'))).toBe(true);
    });

    it('rejects easy case if evidence count is not 5', () => {
      const invalidCase = {
        ...validEasyCase,
        evidence: validEasyCase.evidence.slice(0, 4)
      };
      const result = generatedCaseSchema.safeParse(invalidCase);
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.message.includes('Expected 5 evidence'))).toBe(true);
    });

    it('rejects easy case if hint count is not 2', () => {
      const invalidCase = {
        ...validEasyCase,
        hints: ['Only one hint']
      };
      const result = generatedCaseSchema.safeParse(invalidCase);
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.message.includes('Expected 2 hints'))).toBe(true);
    });

    it('rejects case if culprit ID is not in suspects', () => {
      const invalidCase = {
        ...validEasyCase,
        answerKey: {
          ...validEasyCase.answerKey,
          culpritSuspectId: 'unknown_suspect_99'
        }
      };
      const result = generatedCaseSchema.safeParse(invalidCase);
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.message.includes('does not match any suspect'))).toBe(true);
    });

    it('rejects case if supporting evidence IDs do not exist in evidence', () => {
      const invalidCase = {
        ...validEasyCase,
        answerKey: {
          ...validEasyCase.answerKey,
          supportingEvidenceIds: ['e1', 'non_existent_e99']
        }
      };
      const result = generatedCaseSchema.safeParse(invalidCase);
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.message.includes('does not match any evidence item'))).toBe(true);
    });

    it('rejects case with duplicate suspect IDs', () => {
      const invalidCase = {
        ...validEasyCase,
        suspects: [
          validEasyCase.suspects[0],
          { ...validEasyCase.suspects[1], id: 's1' },
          validEasyCase.suspects[2]
        ]
      };
      const result = generatedCaseSchema.safeParse(invalidCase);
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.message.includes('Duplicate suspect ID'))).toBe(true);
    });
  });
});
