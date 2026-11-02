import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { Case } from '../../src/models/Case.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Case.deleteMany({});
});

describe('Case API Integration Tests', () => {
  const sampleCaseData = {
    title: 'The Clocktower Disappearance',
    briefing: 'The town clockmaker vanished at midnight.',
    setting: 'Old Town Clocktower',
    incident: 'Clock chimed 13 times and the clockmaker was gone.',
    difficulty: 'easy',
    suspects: [
      {
        id: 's_apprentice',
        name: 'Finnian Cole',
        profile: 'Ambitious clockmaker apprentice.',
        statement: 'I was oiling the gears on the 2nd floor.',
        motive: 'Wanted the shop for himself.',
        opportunity: 'Had the only spare keys.',
        portrait: { kind: 'placeholder', assetUrl: null, alt: 'Finnian portrait' }
      },
      {
        id: 's_rival',
        name: 'Silas Vance',
        profile: 'Rival craftsman from across town.',
        statement: 'I was at the tavern until 1 AM.',
        motive: 'Stole the master blueprints.',
        opportunity: 'Seen nearby before midnight.',
        portrait: { kind: 'placeholder', assetUrl: null, alt: 'Silas portrait' }
      },
      {
        id: 's_mayor',
        name: 'Mayor Higgins',
        profile: 'Owed large sums to the clockmaker.',
        statement: 'I was reviewing town budgets at home.',
        motive: 'Eliminate debts.',
        opportunity: 'Townhall connects to the clocktower via tunnel.',
        portrait: { kind: 'placeholder', assetUrl: null, alt: 'Mayor portrait' }
      }
    ],
    evidence: [
      {
        id: 'ev_oil_rag',
        type: 'document',
        title: 'Work Order Schedule',
        description: 'Apprentice logbook showing assigned maintenance.',
        source: 'Workshop workbench',
        content: 'Apprentice was scheduled to lock the 4th floor door.',
        assetUrl: null,
        timestamp: '11:30 PM',
        location: 'Workshop floor',
        isClue: false
      },
      {
        id: 'ev_brass_gear',
        type: 'image',
        title: 'Broken Gear Fragment',
        description: 'A cog stamped with apprentice initials found jammed in the 13th chime mechanism.',
        source: 'Gearbox room',
        content: 'Initials F.C. engraved on brass teeth.',
        assetUrl: null,
        timestamp: '12:05 AM',
        location: 'Bell tower',
        isClue: true
      },
      {
        id: 'ev_chat_record',
        type: 'chat',
        title: 'Telegraph Transcript',
        description: 'Telegraph messages intercepted at the station.',
        source: 'Telegraph office',
        content: 'Will take over the shop by Monday.',
        assetUrl: null,
        timestamp: '10:00 PM',
        location: 'Station',
        isClue: true
      },
      {
        id: 'ev_tavern_receipt',
        type: 'document',
        title: 'Tavern Tab',
        description: 'Itemized receipt confirming Silas paid at 12:45 AM.',
        source: 'The Rusty Nail Tavern',
        content: 'Silas was seated with the tavern keeper.',
        assetUrl: null,
        timestamp: '12:45 AM',
        location: 'Tavern',
        isClue: false
      },
      {
        id: 'ev_cctv_storyboard',
        type: 'camera_record',
        title: 'Town Square Camera Frame',
        description: 'Single frame capture of clocktower door opening at 11:58 PM.',
        source: 'Square surveillance lamp',
        content: 'Silhouette holding apprentice tool kit slips inside.',
        assetUrl: null,
        timestamp: '11:58 PM',
        location: 'Square',
        isClue: true
      }
    ],
    hints: [
      'Look for physical items tied specifically to a craft or tools.',
      'Examine the 13th chime mechanism fragment.'
    ],
    answerKey: {
      culpritSuspectId: 's_apprentice',
      motive: 'Finnian wanted to take over the master clockmaking shop.',
      method: 'Jammed the mechanism with his own gear and locked the master in the lower vault.',
      opportunity: 'Was alone in the tower servicing gears.',
      explanation: 'The engraved gear fragment and telegraph logs prove Finnian executed the plan.',
      supportingEvidenceIds: ['ev_brass_gear', 'ev_chat_record', 'ev_cctv_storyboard']
    },
    status: 'active',
    discoveredEvidenceIds: [],
    hintsUsed: 0
  };

  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('POST /api/cases rejects input with short premise', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send({ premise: 'Too short', difficulty: 'easy' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('GET /api/cases/:id returns player-safe case with no answerKey', async () => {
    const doc = await Case.create(sampleCaseData);

    const res = await request(app).get(`/api/cases/${doc._id}`);
    expect(res.status).toBe(200);
    expect(res.body.case).toBeDefined();
    expect(res.body.case.id).toBe(doc._id.toString());
    expect(res.body.case.title).toBe(sampleCaseData.title);
    expect(res.body.case.hintsRemaining).toBe(2);

    // CRITICAL: Answer key isolation check
    expect(res.body.case.answerKey).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('answerKey');
    expect(JSON.stringify(res.body)).not.toContain('culpritSuspectId');
    expect(res.body.case).not.toHaveProperty('culprit');

    // Undiscovered evidence has clue content hidden
    const gearEvidence = res.body.case.evidence.find((e) => e.id === 'ev_brass_gear');
    expect(gearEvidence.isDiscovered).toBe(false);
    expect(gearEvidence.isClue).toBeUndefined();
    expect(gearEvidence.content).toContain('Examine and discover');
  });

  it('GET /api/cases/:id returns 404 for unknown case', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/cases/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CASE_NOT_FOUND');
  });

  it('POST /api/cases/:id/evidence/:evidenceId/discover is idempotent and awards once', async () => {
    const doc = await Case.create(sampleCaseData);

    // First discovery
    const res1 = await request(app)
      .post(`/api/cases/${doc._id}/evidence/ev_brass_gear/discover`)
      .send({});
    expect(res1.status).toBe(200);
    expect(res1.body.newlyDiscovered).toBe(true);
    expect(res1.body.discoveredEvidenceIds).toContain('ev_brass_gear');
    expect(res1.body.scorePreview).toBe(5); // 1 evidence * 5

    // Second discovery of SAME evidence
    const res2 = await request(app)
      .post(`/api/cases/${doc._id}/evidence/ev_brass_gear/discover`)
      .send({});
    expect(res2.status).toBe(200);
    expect(res2.body.newlyDiscovered).toBe(false);
    expect(res2.body.discoveredEvidenceIds).toHaveLength(1);
    expect(res2.body.scorePreview).toBe(5); // Still 5 points, not doubled
  });

  it('POST /api/cases/:id/hints reveals hints sequentially and stops at limit', async () => {
    const doc = await Case.create(sampleCaseData);

    // Request hint 1
    const res1 = await request(app).post(`/api/cases/${doc._id}/hints`).send({});
    expect(res1.status).toBe(200);
    expect(res1.body.hint).toBe(sampleCaseData.hints[0]);
    expect(res1.body.hintsUsed).toBe(1);
    expect(res1.body.hintsRemaining).toBe(1);

    // Request hint 2
    const res2 = await request(app).post(`/api/cases/${doc._id}/hints`).send({});
    expect(res2.status).toBe(200);
    expect(res2.body.hint).toBe(sampleCaseData.hints[1]);
    expect(res2.body.hintsUsed).toBe(2);
    expect(res2.body.hintsRemaining).toBe(0);

    // Request hint 3 (should fail with 409 NO_HINTS_REMAINING)
    const res3 = await request(app).post(`/api/cases/${doc._id}/hints`).send({});
    expect(res3.status).toBe(409);
    expect(res3.body.error.code).toBe('NO_HINTS_REMAINING');
  });

  it('GET /api/cases/:id/result blocks active cases', async () => {
    const doc = await Case.create(sampleCaseData);

    const res = await request(app).get(`/api/cases/${doc._id}/result`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CASE_NOT_COMPLETED');
  });

  it('POST /api/cases/:id/accuse handles incorrect accusation and finalizes case', async () => {
    const doc = await Case.create(sampleCaseData);

    // Discover 1 evidence first
    await request(app).post(`/api/cases/${doc._id}/evidence/ev_oil_rag/discover`).send({});

    // Accuse the wrong suspect (Silas)
    const res = await request(app)
      .post(`/api/cases/${doc._id}/accuse`)
      .send({ suspectId: 's_rival' });

    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
    expect(res.body.result.isCorrect).toBe(false);
    expect(res.body.result.accusedSuspectId).toBe('s_rival');
    expect(res.body.result.culprit.id).toBe('s_apprentice');
    expect(res.body.result.score).toBe(5); // 0 base + 5 evidence = 5

    // Second accusation attempt must be rejected
    const repeatRes = await request(app)
      .post(`/api/cases/${doc._id}/accuse`)
      .send({ suspectId: 's_apprentice' });

    expect(repeatRes.status).toBe(409);
    expect(repeatRes.body.error.code).toBe('CASE_ALREADY_COMPLETED');
  });

  it('POST /api/cases/:id/accuse handles correct accusation and reveals full result', async () => {
    const doc = await Case.create(sampleCaseData);

    // Discover 2 evidence (+10) and use 1 hint (-10)
    await request(app).post(`/api/cases/${doc._id}/evidence/ev_brass_gear/discover`).send({});
    await request(app).post(`/api/cases/${doc._id}/evidence/ev_chat_record/discover`).send({});
    await request(app).post(`/api/cases/${doc._id}/hints`).send({});

    // Accuse the correct suspect (Finnian)
    const res = await request(app)
      .post(`/api/cases/${doc._id}/accuse`)
      .send({ suspectId: 's_apprentice' });

    expect(res.status).toBe(200);
    expect(res.body.result.isCorrect).toBe(true);
    expect(res.body.result.culprit.id).toBe('s_apprentice');
    expect(res.body.result.culprit.name).toBe('Finnian Cole');
    expect(res.body.result.explanation).toContain('Finnian executed the plan');
    expect(res.body.result.supportingEvidence.length).toBe(3);
    // Score: 100 base (easy) + 2*5 (10) - 1*10 (10) = 100
    expect(res.body.result.score).toBe(100);

    // Now GET /api/cases/:id/result succeeds with the same result
    const resultRes = await request(app).get(`/api/cases/${doc._id}/result`);
    expect(resultRes.status).toBe(200);
    expect(resultRes.body.result.score).toBe(100);
  });
});
