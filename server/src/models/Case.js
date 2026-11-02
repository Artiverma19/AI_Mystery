import mongoose from 'mongoose';

const PortraitSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ['generated', 'placeholder'],
      default: 'placeholder'
    },
    assetUrl: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const SuspectSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    profile: {
      type: String,
      required: true
    },
    statement: {
      type: String,
      required: true
    },
    motive: {
      type: String,
      required: true
    },
    opportunity: {
      type: String,
      required: true
    },
    portrait: {
      type: PortraitSchema,
      required: true
    }
  },
  { _id: false }
);

const EvidenceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['chat', 'image', 'camera_record', 'document', 'statement', 'timeline'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    assetUrl: {
      type: String,
      default: null
    },
    timestamp: {
      type: String,
      default: null
    },
    location: {
      type: String,
      default: null
    },
    isClue: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const AnswerKeySchema = new mongoose.Schema(
  {
    culpritSuspectId: {
      type: String,
      required: true
    },
    motive: {
      type: String,
      required: true
    },
    method: {
      type: String,
      required: true
    },
    opportunity: {
      type: String,
      required: true
    },
    explanation: {
      type: String,
      required: true
    },
    supportingEvidenceIds: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const CaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    briefing: {
      type: String,
      required: true
    },
    setting: {
      type: String,
      required: true
    },
    incident: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    suspects: {
      type: [SuspectSchema],
      required: true
    },
    evidence: {
      type: [EvidenceSchema],
      required: true
    },
    hints: {
      type: [String],
      default: []
    },
    answerKey: {
      type: AnswerKeySchema,
      required: true,
      select: true // Kept on document, but stripped explicitly by serializers
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active'
    },
    discoveredEvidenceIds: {
      type: [String],
      default: []
    },
    hintsUsed: {
      type: Number,
      default: 0
    },
    accusationSuspectId: {
      type: String,
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: null
    },
    score: {
      type: Number,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: false
  }
);

export const Case = mongoose.model('Case', CaseSchema);
