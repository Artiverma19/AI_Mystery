import express from 'express';
import {
  createCase,
  getCaseById,
  discoverEvidence,
  requestHint,
  accuseSuspect,
  getCaseResult
} from '../controllers/caseController.js';

const router = express.Router();

router.post('/cases', createCase);
router.get('/cases/:id', getCaseById);
router.post('/cases/:id/evidence/:evidenceId/discover', discoverEvidence);
router.post('/cases/:id/hints', requestHint);
router.post('/cases/:id/accuse', accuseSuspect);
router.get('/cases/:id/result', getCaseResult);

export default router;

