/**
 * Chat Routes
 * Handles AI conversation endpoints
 */

import express from 'express';
import { handleConversation, clearConversation, getTranscript } from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/chat
 * Handle conversation message
 */
router.post('/', async (req, res, next) => {
  try {
    const { sessionId, message, currentOrder } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        error: { message: 'Session ID is required' }
      });
    }
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: { message: 'Message is required' }
      });
    }
    
    const response = await handleConversation(sessionId, message.trim(), currentOrder);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/chat/:sessionId/transcript
 * Get conversation transcript
 */
router.get('/:sessionId/transcript', (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const transcript = getTranscript(sessionId);
    
    res.json({
      success: true,
      data: {
        sessionId,
        transcript
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/chat/:sessionId
 * Clear conversation context
 */
router.delete('/:sessionId', (req, res, next) => {
  try {
    const { sessionId } = req.params;
    clearConversation(sessionId);
    
    res.json({
      success: true,
      message: 'Conversation cleared'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/chat/greeting
 * Get initial greeting message - waiter-style greeting
 */
router.post('/greeting', (req, res) => {
  const greeting = "Hello and welcome to JAFS Gressvik! I'm your AI ordering assistant. May I have your name please so I can help you better?";
  
  res.json({
    success: true,
    data: {
      message: greeting,
      intent: 'greeting',
      suggestedActions: ["View Our Menu", "See Today's Specials", "Opening Hours", "Our Location"]
    }
  });
});

export default router;
