import { z } from 'zod';

export const DIFFICULTY_CONFIG = {
  easy: {
    suspectCount: 3,
    evidenceCount: 5,
    hintCount: 2,
    basePoints: 100
  },
  medium: {
    suspectCount: 4,
    evidenceCount: 7,
    hintCount: 3,
    basePoints: 150
  },
  hard: {
    suspectCount: 5,
    evidenceCount: 9,
    hintCount: 3,
    basePoints: 200
  }
};

export const createCaseInputSchema = z.object({
  premise: z
    .string({ required_error: 'Premise is required' })
    .trim()
    .min(20, 'Premise must be at least 20 characters')
    .max(1000, 'Premise must not exceed 1000 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    required_error: 'Difficulty is required',
    invalid_type_error: "Difficulty must be 'easy', 'medium', or 'hard'"
  })
});

export const accuseInputSchema = z.object({
  suspectId: z
    .string({ required_error: 'Suspect ID is required' })
    .trim()
    .min(1, 'Suspect ID cannot be empty')
});

const portraitSchema = z.object({
  kind: z.enum(['generated', 'placeholder']).default('placeholder'),
  assetUrl: z.string().nullable().default(null),
  alt: z.string().min(1, 'Alt description is required')
});

const suspectSchema = z.object({
  id: z.string().min(1, 'Suspect ID is required'),
  name: z.string().min(1, 'Suspect name is required'),
  profile: z.string().min(1, 'Suspect profile is required'),
  statement: z.string().min(1, 'Suspect statement is required'),
  motive: z.string().min(1, 'Suspect motive is required'),
  opportunity: z.string().min(1, 'Suspect opportunity is required'),
  portrait: portraitSchema
});

const evidenceSchema = z.object({
  id: z.string().min(1, 'Evidence ID is required'),
  type: z.enum(['chat', 'image', 'camera_record', 'document', 'statement', 'timeline']),
  title: z.string().min(1, 'Evidence title is required'),
  description: z.string().min(1, 'Evidence description is required'),
  source: z.string().min(1, 'Evidence source is required'),
  content: z.string().min(1, 'Evidence content is required'),
  assetUrl: z.string().nullable().default(null),
  timestamp: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  isClue: z.boolean().default(false)
});

const answerKeySchema = z.object({
  culpritSuspectId: z.string().min(1, 'Culprit suspect ID is required'),
  motive: z.string().min(1, 'Culprit motive is required'),
  method: z.string().min(1, 'Culprit method is required'),
  opportunity: z.string().min(1, 'Culprit opportunity is required'),
  explanation: z.string().min(1, 'Explanation is required'),
  supportingEvidenceIds: z.array(z.string()).min(1, 'At least one supporting evidence ID is required')
});

export const generatedCaseSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    briefing: z.string().min(1, 'Briefing is required'),
    setting: z.string().min(1, 'Setting is required'),
    incident: z.string().min(1, 'Incident is required'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    suspects: z.array(suspectSchema),
    evidence: z.array(evidenceSchema),
    hints: z.array(z.string()),
    answerKey: answerKeySchema
  })
  .superRefine((data, ctx) => {
    const config = DIFFICULTY_CONFIG[data.difficulty];
    if (!config) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown difficulty level: ${data.difficulty}`,
        path: ['difficulty']
      });
      return;
    }

    // Verify exact suspect count
    if (data.suspects.length !== config.suspectCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Expected ${config.suspectCount} suspects for ${data.difficulty} difficulty, got ${data.suspects.length}`,
        path: ['suspects']
      });
    }

    // Verify exact evidence count
    if (data.evidence.length !== config.evidenceCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Expected ${config.evidenceCount} evidence items for ${data.difficulty} difficulty, got ${data.evidence.length}`,
        path: ['evidence']
      });
    }

    // Verify exact hints count
    if (data.hints.length !== config.hintCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Expected ${config.hintCount} hints for ${data.difficulty} difficulty, got ${data.hints.length}`,
        path: ['hints']
      });
    }

    // Verify unique suspect IDs
    const suspectIds = new Set();
    for (const suspect of data.suspects) {
      if (suspectIds.has(suspect.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate suspect ID: ${suspect.id}`,
          path: ['suspects']
        });
      }
      suspectIds.add(suspect.id);
    }

    // Verify unique evidence IDs
    const evidenceIds = new Set();
    for (const ev of data.evidence) {
      if (evidenceIds.has(ev.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate evidence ID: ${ev.id}`,
          path: ['evidence']
        });
      }
      evidenceIds.add(ev.id);
    }

    // Verify culprit exists in suspects
    if (!suspectIds.has(data.answerKey.culpritSuspectId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Culprit suspect ID '${data.answerKey.culpritSuspectId}' does not match any suspect`,
        path: ['answerKey', 'culpritSuspectId']
      });
    }

    // Verify supporting evidence IDs exist
    for (const suppId of data.answerKey.supportingEvidenceIds) {
      if (!evidenceIds.has(suppId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Supporting evidence ID '${suppId}' does not match any evidence item`,
          path: ['answerKey', 'supportingEvidenceIds']
        });
      }
    }
  });
