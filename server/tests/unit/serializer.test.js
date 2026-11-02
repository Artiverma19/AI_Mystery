import { describe, it, expect } from 'vitest';
import { toPlayerSafeCase, toCaseResult } from '../../src/services/case/caseSerializer.js';

describe('Case Serializer & Answer-Key Isolation', () => {
  const mockCaseDoc = {
    _id: '67c514800000000000000001',
    title: 'The Gallery Heist',
    briefing: 'A masterpiece vanished.',
    setting: 'Grand Gallery',
    incident: 'Frame found empty.',
    difficulty: 'easy',
    suspects: [
      {
        id: 's1',
        name: 'Victor Vance',
        profile: 'Art restorer',
        statement: 'I was varnishing a frame.',
        motive: 'Revenge against gallery owner.',
        opportunity: 'Had keycard access.',
        portrait: { kind: 'placeholder', assetUrl: null, alt: 'Victor portrait' }
      },
      {
        id: 's2',
        name: 'Clara Oswald',
        profile: 'Curator',
        statement: 'I locked up at 9 PM.',
        motive: 'Insurance payout.',
        opportunity: 'Alarm bypass codes.',
        portrait: { kind: 'placeholder', assetUrl: null, alt: 'Clara portrait' }
      }
    ],
    evidence: [
      {
        id: 'e1',
        type: 'chat',
        title: 'SMS Record',
        description: 'Text log between curator and dealer.',
        source: 'Phone record',
        content: 'Meet me behind the warehouse.',
        assetUrl: null,
        timestamp: '9:15 PM',
        location: 'Warehouse alley',
        isClue: true
      },
      {
        id: 'e2',
        type: 'document',
        title: 'Visitor Log',
        description: 'Standard sign in sheet.',
        source: 'Security desk',
        content: '20 visitors recorded.',
        assetUrl: null,
        timestamp: 'All day',
        location: 'Lobby',
        isClue: false
      }
    ],
    hints: ['Look at phone timestamps', 'Examine alibis'],
    answerKey: {
      culpritSuspectId: 's1',
      motive: 'Revenge',
      method: 'Swapped painting with copy',
      opportunity: 'Keycard access after hours',
      explanation: 'Victor used his restorer keycard and sent SMS.',
      supportingEvidenceIds: ['e1']
    },
    status: 'active',
    discoveredEvidenceIds: [],
    hintsUsed: 0
  };

  it('guarantees answerKey is omitted from player-safe response', () => {
    const safeCase = toPlayerSafeCase(mockCaseDoc);
    expect(safeCase).not.toHaveProperty('answerKey');
    expect(JSON.stringify(safeCase)).not.toContain('culpritSuspectId');
    expect(JSON.stringify(safeCase)).not.toContain('Swapped painting with copy');
  });

  it('hides clue details on undiscovered evidence items', () => {
    const safeCase = toPlayerSafeCase(mockCaseDoc);
    const e1 = safeCase.evidence.find((e) => e.id === 'e1');
    expect(e1.isDiscovered).toBe(false);
    expect(e1.isClue).toBeUndefined();
    expect(e1.content).toContain('Examine and discover');
  });

  it('reveals clue details on discovered evidence items', () => {
    const caseWithDiscovery = {
      ...mockCaseDoc,
      discoveredEvidenceIds: ['e1']
    };
    const safeCase = toPlayerSafeCase(caseWithDiscovery);
    const e1 = safeCase.evidence.find((e) => e.id === 'e1');
    expect(e1.isDiscovered).toBe(true);
    expect(e1.isClue).toBe(true);
    expect(e1.content).toBe('Meet me behind the warehouse.');
  });

  it('toCaseResult returns null if case is not completed', () => {
    const result = toCaseResult(mockCaseDoc);
    expect(result).toBeNull();
  });

  it('toCaseResult returns full verdict and explanation when completed', () => {
    const completedDoc = {
      ...mockCaseDoc,
      status: 'completed',
      accusationSuspectId: 's1',
      isCorrect: true,
      score: 115,
      discoveredEvidenceIds: ['e1'],
      hintsUsed: 0
    };
    const result = toCaseResult(completedDoc);
    expect(result).not.toBeNull();
    expect(result.result.isCorrect).toBe(true);
    expect(result.result.culprit.id).toBe('s1');
    expect(result.result.culprit.name).toBe('Victor Vance');
    expect(result.result.explanation).toContain('Victor used his restorer');
    expect(result.result.supportingEvidence).toHaveLength(1);
    expect(result.result.supportingEvidence[0].id).toBe('e1');
    expect(result.result.score).toBe(115);
  });
});

