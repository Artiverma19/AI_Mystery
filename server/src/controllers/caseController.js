import { Case } from '../models/Case.js';
import { createCaseInputSchema, accuseInputSchema } from '../validators/caseValidator.js';
import { generateMysteryCase } from '../services/gemini/caseGenerator.js';
import { calculateScore } from '../services/scoring/scoringService.js';
import { toPlayerSafeCase, toCaseResult } from '../services/case/caseSerializer.js';
import { AppError } from '../middleware/errorHandler.js';

export async function createCase(req, res, next) {
  try {
    const { premise, difficulty } = createCaseInputSchema.parse(req.body);

    const generatedCase = await generateMysteryCase({ premise, difficulty });

    const newCase = new Case({
      title: generatedCase.title,
      briefing: generatedCase.briefing,
      setting: generatedCase.setting,
      incident: generatedCase.incident,
      difficulty: generatedCase.difficulty,
      suspects: generatedCase.suspects,
      evidence: generatedCase.evidence,
      hints: generatedCase.hints,
      answerKey: generatedCase.answerKey,
      status: 'active',
      discoveredEvidenceIds: [],
      hintsUsed: 0,
      accusationSuspectId: null,
      isCorrect: null,
      score: null,
      completedAt: null
    });

    await newCase.save();

    return res.status(201).json({
      case: toPlayerSafeCase(newCase)
    });
  } catch (error) {
    next(error);
  }
}

export async function getCaseById(req, res, next) {
  try {
    const { id } = req.params;
    const caseDoc = await Case.findById(id);

    if (!caseDoc) {
      throw new AppError('CASE_NOT_FOUND', 'Case not found', 404);
    }

    return res.status(200).json({
      case: toPlayerSafeCase(caseDoc)
    });
  } catch (error) {
    next(error);
  }
}

export async function discoverEvidence(req, res, next) {
  try {
    const { id, evidenceId } = req.params;
    const caseDoc = await Case.findById(id);

    if (!caseDoc) {
      throw new AppError('CASE_NOT_FOUND', 'Case not found', 404);
    }

    const evidenceExists = (caseDoc.evidence || []).some((e) => e.id === evidenceId);
    if (!evidenceExists) {
      throw new AppError('INVALID_INPUT', `Evidence item '${evidenceId}' not found in this case`, 400);
    }

    let newlyDiscovered = false;
    if (!caseDoc.discoveredEvidenceIds.includes(evidenceId)) {
      caseDoc.discoveredEvidenceIds.push(evidenceId);
      await caseDoc.save();
      newlyDiscovered = true;
    }

    const scorePreview = calculateScore({
      difficulty: caseDoc.difficulty,
      isCorrect: false,
      discoveredEvidenceCount: caseDoc.discoveredEvidenceIds.length,
      hintsUsed: caseDoc.hintsUsed
    });

    return res.status(200).json({
      discoveredEvidenceIds: caseDoc.discoveredEvidenceIds,
      newlyDiscovered,
      scorePreview
    });
  } catch (error) {
    next(error);
  }
}

export async function requestHint(req, res, next) {
  try {
    const { id } = req.params;
    const caseDoc = await Case.findById(id);

    if (!caseDoc) {
      throw new AppError('CASE_NOT_FOUND', 'Case not found', 404);
    }

    if (caseDoc.status === 'completed') {
      throw new AppError('CASE_ALREADY_COMPLETED', 'Cannot request hints for a completed case', 409);
    }

    const hints = caseDoc.hints || [];
    const hintsUsed = caseDoc.hintsUsed || 0;

    if (hintsUsed >= hints.length) {
      throw new AppError('NO_HINTS_REMAINING', 'No hints remaining for this case', 409);
    }

    const hint = hints[hintsUsed];
    caseDoc.hintsUsed += 1;
    await caseDoc.save();

    const hintsRemaining = hints.length - caseDoc.hintsUsed;

    return res.status(200).json({
      hint,
      hintsUsed: caseDoc.hintsUsed,
      hintsRemaining
    });
  } catch (error) {
    next(error);
  }
}

export async function accuseSuspect(req, res, next) {
  try {
    const { id } = req.params;
    const { suspectId } = accuseInputSchema.parse(req.body);

    const caseDoc = await Case.findById(id);
    if (!caseDoc) {
      throw new AppError('CASE_NOT_FOUND', 'Case not found', 404);
    }

    if (caseDoc.status === 'completed') {
      throw new AppError('CASE_ALREADY_COMPLETED', 'This case has already been resolved', 409);
    }

    const suspectExists = (caseDoc.suspects || []).some((s) => s.id === suspectId);
    if (!suspectExists) {
      throw new AppError('INVALID_SUSPECT', `Suspect '${suspectId}' does not belong to this case`, 400);
    }

    const isCorrect = suspectId === caseDoc.answerKey.culpritSuspectId;
    const score = calculateScore({
      difficulty: caseDoc.difficulty,
      isCorrect,
      discoveredEvidenceCount: caseDoc.discoveredEvidenceIds.length,
      hintsUsed: caseDoc.hintsUsed
    });

    caseDoc.status = 'completed';
    caseDoc.accusationSuspectId = suspectId;
    caseDoc.isCorrect = isCorrect;
    caseDoc.score = score;
    caseDoc.completedAt = new Date();

    await caseDoc.save();

    return res.status(200).json(toCaseResult(caseDoc));
  } catch (error) {
    next(error);
  }
}

export async function getCaseResult(req, res, next) {
  try {
    const { id } = req.params;
    const caseDoc = await Case.findById(id);

    if (!caseDoc) {
      throw new AppError('CASE_NOT_FOUND', 'Case not found', 404);
    }

    if (caseDoc.status !== 'completed') {
      throw new AppError('CASE_NOT_COMPLETED', 'Case has not been resolved yet', 409);
    }

    return res.status(200).json(toCaseResult(caseDoc));
  } catch (error) {
    next(error);
  }
}
