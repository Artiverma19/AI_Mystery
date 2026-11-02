export function toPlayerSafeCase(caseDoc) {
  const discoveredSet = new Set(caseDoc.discoveredEvidenceIds || []);
  const totalHints = Array.isArray(caseDoc.hints) ? caseDoc.hints.length : 0;
  const hintsUsed = typeof caseDoc.hintsUsed === 'number' ? caseDoc.hintsUsed : 0;
  const hintsRemaining = Math.max(0, totalHints - hintsUsed);

  return {
    id: caseDoc._id ? caseDoc._id.toString() : caseDoc.id,
    title: caseDoc.title,
    briefing: caseDoc.briefing,
    setting: caseDoc.setting,
    incident: caseDoc.incident,
    difficulty: caseDoc.difficulty,
    suspects: (caseDoc.suspects || []).map((s) => ({
      id: s.id,
      name: s.name,
      profile: s.profile,
      statement: s.statement,
      motive: s.motive,
      opportunity: s.opportunity,
      portrait: {
        kind: s.portrait?.kind || 'placeholder',
        assetUrl: s.portrait?.assetUrl || null,
        alt: s.portrait?.alt || `${s.name} portrait`
      }
    })),
    evidence: (caseDoc.evidence || []).map((e) => {
      const isDiscovered = discoveredSet.has(e.id);
      return {
        id: e.id,
        type: e.type,
        title: e.title,
        description: e.description,
        source: e.source,
        content: isDiscovered ? e.content : (e.isClue ? 'Examine and discover this evidence to analyze details.' : e.content),
        assetUrl: e.assetUrl || null,
        timestamp: e.timestamp || null,
        location: e.location || null,
        isDiscovered,
        isClue: isDiscovered ? e.isClue : undefined
      };
    }),
    discoveredEvidenceIds: Array.from(discoveredSet),
    hintsUsed,
    hintsRemaining,
    status: caseDoc.status
  };
}

export function toCaseResult(caseDoc) {
  if (caseDoc.status !== 'completed') {
    return null;
  }

  const culprit = (caseDoc.suspects || []).find((s) => s.id === caseDoc.answerKey?.culpritSuspectId) || null;
  const supportingIds = new Set(caseDoc.answerKey?.supportingEvidenceIds || []);
  const supportingEvidence = (caseDoc.evidence || [])
    .filter((e) => supportingIds.has(e.id))
    .map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type,
      description: e.description,
      source: e.source
    }));

  return {
    result: {
      isCorrect: Boolean(caseDoc.isCorrect),
      accusedSuspectId: caseDoc.accusationSuspectId,
      culprit,
      explanation: caseDoc.answerKey?.explanation || '',
      motive: caseDoc.answerKey?.motive || '',
      method: caseDoc.answerKey?.method || '',
      opportunity: caseDoc.answerKey?.opportunity || '',
      supportingEvidence,
      discoveredEvidenceCount: (caseDoc.discoveredEvidenceIds || []).length,
      hintsUsed: caseDoc.hintsUsed || 0,
      score: caseDoc.score || 0
    }
  };
}
