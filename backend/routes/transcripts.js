/**
 * Transcript Routes
 * Handles conversation transcript retrieval for admin
 */

import express from 'express';
import { getActiveSessions, getTranscript } from '../services/aiService.js';

const router = express.Router();

/**
 * GET /api/transcripts
 * Get all active conversation sessions
 */
router.get('/', (req, res) => {
  try {
    const sessions = getActiveSessions();
    
    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      error: { message: error.message }
    });
  }
});

/**
 * GET /api/transcripts/:sessionId
 * Get transcript for specific session
 */
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const transcript = getTranscript(sessionId);
    
    if (!transcript || transcript.length === 0) {
      return res.status(404).json({
        error: { message: 'Transcript not found' }
      });
    }
    
    res.json({
      success: true,
      data: {
        sessionId,
        transcript,
        messageCount: transcript.length
      }
    });
  } catch (error) {
    res.status(500).json({
      error: { message: error.message }
    });
  }
});

export default router;
