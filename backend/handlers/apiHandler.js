import express from 'express';
import { generatePingResponse } from '../helpers/responseHelpers.js';
import msgHandler from './msgHandler.js';
import { getListeningMatchesStatus, forcePollMatch } from '../helpers/matchManager.js';

const router = express.Router();

/**
 * Pure function to handle ping request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handlePing = (req, res) => {
  try {
    const response = generatePingResponse();
    res.status(200).json(response);
  } catch (error) {
    console.error('Ping endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process ping request'
    });
  }
};

/**
 * Pure function to handle match room creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleCreateMatch = (req, res) => {
  try {
    const { matchId, matchName } = req.body;
    
    if (!matchId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'matchId is required'
      });
    }

    const response = {
      success: true,
      matchId,
      matchName: matchName || `Match ${matchId}`,
      timestamp: new Date().toISOString(),
      message: 'Match room created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create match endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create match room'
    });
  }
};

/**
 * Pure function to get match information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleGetMatch = (req, res) => {
  try {
    const { matchId } = req.params;
    
    if (!matchId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'matchId is required'
      });
    }

    const response = {
      success: true,
      matchId,
      status: 'active',
      timestamp: new Date().toISOString(),
      connectedClients: 0 // This would be populated from socket data in real implementation
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get match endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get match information'
    });
  }
};

/**
 * Pure function to get server and socket statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleGetStats = (req, res) => {
  try {
    const socketStats = msgHandler.getStats();
    
    const response = {
      success: true,
      server: {
        status: 'running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      socket: socketStats
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get stats endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get server statistics'
    });
  }
};

/**
 * Pure function to get match management status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleGetMatchManagement = (req, res) => {
  try {
    const matchStatus = getListeningMatchesStatus();
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      matches: matchStatus
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get match management endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get match management status'
    });
  }
};

/**
 * Pure function to manually trigger match data polling
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handlePollMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    if (!matchId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'matchId is required'
      });
    }

    console.log(`Manual API poll requested for match: ${matchId}`);
    
    const pollResult = await forcePollMatch(matchId);
    
    if (pollResult) {
      res.status(200).json({
        success: true,
        matchId,
        message: 'Match data polled successfully',
        lastUpdated: pollResult.lastUpdated,
        dataKeys: Object.keys(pollResult.data || {})
      });
    } else {
      res.status(500).json({
        success: false,
        matchId,
        message: 'Failed to poll match data'
      });
    }
    
  } catch (error) {
    console.error('Poll match endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to poll match data'
    });
  }
};

// Route definitions
router.get('/ping', handlePing);
router.get('/stats', handleGetStats);
router.get('/matches', handleGetMatchManagement);
router.post('/match', handleCreateMatch);
router.get('/match/:matchId', handleGetMatch);
router.post('/match/:matchId/poll', handlePollMatch);

export default router;
