// @ts-nocheck
import express from 'express';
import { WorkflowManager } from '../../core/WorkflowManager';
import { ICPGeneratorWorkflow } from '../../core/ICPGeneratorWorkflow';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const workflowManager = new WorkflowManager();
workflowManager.registerWorkflow('icp-generator', () => new ICPGeneratorWorkflow());

// Start a workflow
router.post('/start', authenticateToken, async (req, res) => {
  const { workflowName, params } = req.body;
  const sessionId = req.user.id + '-' + Date.now(); // Example session key
  params.userId = req.user.id;
  const instance = workflowManager.startWorkflow(workflowName, params, sessionId);
  if (!instance) {
    return res.status(400).json({ error: 'Workflow not found' });
  }
  res.json({ success: true, sessionId });
});

// Get workflow state
router.get('/state', authenticateToken, (req, res) => {
  const { workflowName, sessionId } = req.query;
  const state = workflowManager.getWorkflowState(workflowName as string, sessionId as string);
  if (!state) {
    return res.status(404).json({ error: 'Workflow instance not found' });
  }
  res.json({ success: true, state });
});

export default router; 