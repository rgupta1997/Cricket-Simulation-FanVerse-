import express from 'express';
import { generatePingResponse } from '../helpers/responseHelpers.js';
import msgHandler from './msgHandler.js';
import { getListeningMatchesStatus, forcePollMatch } from '../helpers/matchManager.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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

/**
 * Pure function to save a prediction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleSavePrediction = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { userId, firstName, lastName, prediction, ballNumber, timestamp } = req.body;
    
    if (!matchId || !userId || !prediction || ballNumber === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'matchId, userId, prediction, and ballNumber are required'
      });
    }

    // Get the directory path for the current file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const predictionsDir = path.join(__dirname, '..', 'json', 'predictions');
    const predictionsFile = path.join(predictionsDir, `${matchId}_predictions.json`);

    // Ensure predictions directory exists
    try {
      await fs.mkdir(predictionsDir, { recursive: true });
    } catch (error) {
      console.warn('Predictions directory already exists or could not be created:', error);
    }

    // Read existing predictions or create new file
    let predictions = [];
    try {
      const existingData = await fs.readFile(predictionsFile, 'utf8');
      predictions = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
      predictions = [];
    }

    // Check if user already has a prediction for this ball in this match
    const existingPrediction = predictions.find(pred => 
      pred.userId === userId && 
      pred.ballNumber === ballNumber && 
      pred.matchId === matchId
    );

    if (existingPrediction) {
      return res.status(400).json({
        error: 'Duplicate Prediction',
        message: `You have already made a prediction for ball ${ballNumber} in this match. Only one prediction per ball per match is allowed.`,
        existingPrediction: {
          prediction: existingPrediction.prediction,
          timestamp: existingPrediction.timestamp
        }
      });
    }

    // Create new prediction object
    const newPrediction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      firstName,
      lastName,
      prediction,
      ballNumber,
      timestamp: timestamp || new Date().toISOString(),
      matchId
    };

    // Add to predictions array
    predictions.push(newPrediction);

    // Write back to file
    await fs.writeFile(predictionsFile, JSON.stringify(predictions, null, 2), 'utf8');

    console.log(`Prediction saved for match ${matchId}, user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Prediction saved successfully',
      prediction: newPrediction
    });
    
  } catch (error) {
    console.error('Save prediction endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to save prediction'
    });
  }
};

/**
 * Pure function to get predictions for a match
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleGetPredictions = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    if (!matchId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'matchId is required'
      });
    }

    // Get the directory path for the current file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const predictionsDir = path.join(__dirname, '..', 'json', 'predictions');
    const predictionsFile = path.join(predictionsDir, `${matchId}_predictions.json`);

    // Check if predictions file exists
    try {
      const existingData = await fs.readFile(predictionsFile, 'utf8');
      const predictions = JSON.parse(existingData);
      
      res.status(200).json({
        success: true,
        matchId,
        predictions,
        count: predictions.length
      });
    } catch (error) {
      // File doesn't exist, return empty predictions
      res.status(200).json({
        success: true,
        matchId,
        predictions: [],
        count: 0
      });
    }
    
  } catch (error) {
    console.error('Get predictions endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get predictions'
    });
  }
};

/**
 * Pure function to clear predictions for a match
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleClearPredictions = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    if (!matchId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'matchId is required'
      });
    }

    // Get the directory path for the current file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const predictionsDir = path.join(__dirname, '..', 'json', 'predictions');
    const predictionsFile = path.join(predictionsDir, `${matchId}_predictions.json`);

    // Check if predictions file exists and delete it
    try {
      await fs.unlink(predictionsFile);
      console.log(`Predictions cleared for match ${matchId}`);
      
      res.status(200).json({
        success: true,
        message: 'Predictions cleared successfully',
        matchId
      });
    } catch (error) {
      // File doesn't exist, return success anyway
      res.status(200).json({
        success: true,
        message: 'No predictions to clear',
        matchId
      });
    }
    
  } catch (error) {
    console.error('Clear predictions endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to clear predictions'
    });
  }
};

/**
 * Pure function to update leaderboard when a prediction is correct
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleUpdateLeaderboard = async (req, res) => {
  try {
    const { matchId, ballNumber, actualResult, isWicket, batsmanRuns } = req.body;
    
    if (!matchId || ballNumber === undefined || actualResult === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'matchId, ballNumber, and actualResult are required'
      });
    }

    // Get the directory paths
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const predictionsDir = path.join(__dirname, '..', 'json', 'predictions');
    const globalLeaderboardFile = path.join(__dirname, '..', 'json', 'global_leaderboard.json');
    const predictionsFile = path.join(predictionsDir, `${matchId}_predictions.json`);

    // Ensure predictions directory exists
    try {
      await fs.mkdir(predictionsDir, { recursive: true });
    } catch (error) {
      console.warn('Predictions directory already exists or could not be created:', error);
    }

    // Read existing predictions
    let predictions = [];
    try {
      const existingData = await fs.readFile(predictionsFile, 'utf8');
      predictions = JSON.parse(existingData);
    } catch (error) {
      console.warn('No predictions file found for leaderboard update');
      return res.status(200).json({
        success: true,
        message: 'No predictions to check',
        matchId
      });
    }

    // Find correct predictions for this ball
    const correctPredictions = predictions.filter(pred => {
      // Check if this prediction is for the current ball and hasn't been checked
      if (pred.ballNumber.toString() === ballNumber.toString() && !pred.resultChecked) {
        // Handle wicket predictions
        if (pred.prediction === 'W') {
          return isWicket === true;
        }
        // Handle run predictions
        else {
          return pred.prediction.toString() === batsmanRuns.toString();
        }
      }
      return false;
    });

    if (correctPredictions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No correct predictions found for this ball',
        matchId,
        ballNumber,
        correctPredictions: 0,
        pointsAwarded: 0
      });
    }

    // Read existing global leaderboard or create new one
    let globalLeaderboard = [];
    try {
      const existingLeaderboard = await fs.readFile(globalLeaderboardFile, 'utf8');
      globalLeaderboard = JSON.parse(existingLeaderboard);
    } catch (error) {
      // File doesn't exist, start with empty array
      globalLeaderboard = [];
    }

    let pointsAwarded = 0;

    // Update leaderboard for each correct prediction
    correctPredictions.forEach(pred => {
      // Find existing entry for this user-matchId combination
      const existingEntryIndex = globalLeaderboard.findIndex(entry => 
        entry.userId === pred.userId && entry.matchId === matchId
      );

      if (existingEntryIndex !== -1) {
        // Increment existing entry
        globalLeaderboard[existingEntryIndex].points += 1;
        pointsAwarded += 1;
        console.log(`✅ Incremented points for user ${pred.userId} in match ${matchId}: ${globalLeaderboard[existingEntryIndex].points} total`);
      } else {
        // Create new entry
        globalLeaderboard.push({
          userId: pred.userId,
          matchId: matchId,
          points: 1,
          firstName: pred.firstName,
          lastName: pred.lastName,
          firstPredictionAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString()
        });
        pointsAwarded += 1;
        console.log(`✅ Created new leaderboard entry for user ${pred.userId} in match ${matchId}: 1 point`);
      }
    });

    // Sort leaderboard by points (highest first), then by last updated time
    globalLeaderboard.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt);
    });

    // Write updated global leaderboard
    await fs.writeFile(globalLeaderboardFile, JSON.stringify(globalLeaderboard, null, 2), 'utf8');

    // Mark predictions as checked in predictions file
    const updatedPredictions = predictions.map(pred => {
      if (correctPredictions.find(cp => cp.id === pred.id)) {
        return {
          ...pred,
          resultChecked: true,
          isCorrect: true,
          actualResult: actualResult,
          pointsAwarded: 1,
          checkedAt: new Date().toISOString()
        };
      }
      return pred;
    });

    // Write updated predictions
    await fs.writeFile(predictionsFile, JSON.stringify(updatedPredictions, null, 2), 'utf8');

    console.log(`🏆 Global leaderboard updated for match ${matchId}, ball ${ballNumber}: ${correctPredictions.length} correct predictions, ${pointsAwarded} points awarded`);

    res.status(200).json({
      success: true,
      message: 'Global leaderboard updated successfully',
      matchId,
      ballNumber,
      correctPredictions: correctPredictions.length,
      pointsAwarded: pointsAwarded,
      leaderboard: globalLeaderboard
    });
    
  } catch (error) {
    console.error('Update leaderboard endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update leaderboard'
    });
  }
};

/**
 * Pure function to get leaderboard for a match
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleGetLeaderboard = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    if (!matchId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'matchId is required'
      });
    }

    // Get the directory path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const globalLeaderboardFile = path.join(__dirname, '..', 'json', 'global_leaderboard.json');

    // Check if global leaderboard file exists
    try {
      const existingData = await fs.readFile(globalLeaderboardFile, 'utf8');
      const globalLeaderboard = JSON.parse(existingData);
      
      // Filter leaderboard for specific match
      const matchLeaderboard = globalLeaderboard.filter(entry => entry.matchId === matchId);
      
      // Calculate user statistics for this match
      const userStats = {};
      matchLeaderboard.forEach(entry => {
        if (!userStats[entry.userId]) {
          userStats[entry.userId] = {
            userId: entry.userId,
            firstName: entry.firstName,
            lastName: entry.lastName,
            correctPredictions: entry.points,
            totalPoints: entry.points
          };
        }
      });

      // Convert to array and sort by points (highest first)
      const userStatsArray = Object.values(userStats).sort((a, b) => b.totalPoints - a.totalPoints);
      
      res.status(200).json({
        success: true,
        matchId,
        leaderboard: matchLeaderboard,
        userStats: userStatsArray,
        totalEntries: matchLeaderboard.length,
        globalLeaderboard: globalLeaderboard
      });
    } catch (error) {
      // File doesn't exist, return empty leaderboard
      res.status(200).json({
        success: true,
        matchId,
        leaderboard: [],
        userStats: [],
        totalEntries: 0,
        globalLeaderboard: []
      });
    }
    
  } catch (error) {
    console.error('Get leaderboard endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get leaderboard'
    });
  }
};

/**
 * Pure function to get global leaderboard across all matches
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleGetGlobalLeaderboard = async (req, res) => {
  try {
    // Get the directory path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const globalLeaderboardFile = path.join(__dirname, '..', 'json', 'global_leaderboard.json');

    // Check if global leaderboard file exists
    try {
      const existingData = await fs.readFile(globalLeaderboardFile, 'utf8');
      const globalLeaderboard = JSON.parse(existingData);
      
      // Calculate user statistics across all matches
      const userStats = {};
      globalLeaderboard.forEach(entry => {
        if (!userStats[entry.userId]) {
          userStats[entry.userId] = {
            userId: entry.userId,
            firstName: entry.firstName,
            lastName: entry.lastName,
            totalPoints: 0,
            matchesPlayed: 0,
            matchDetails: []
          };
        }
        userStats[entry.userId].totalPoints += entry.points;
        userStats[entry.userId].matchesPlayed += 1;
        userStats[entry.userId].matchDetails.push({
          matchId: entry.matchId,
          points: entry.points,
          lastUpdatedAt: entry.lastUpdatedAt
        });
      });

      // Convert to array and sort by total points (highest first)
      const userStatsArray = Object.values(userStats).sort((a, b) => b.totalPoints - a.totalPoints);
      
      res.status(200).json({
        success: true,
        globalLeaderboard: globalLeaderboard,
        userStats: userStatsArray,
        totalUsers: userStatsArray.length,
        totalEntries: globalLeaderboard.length
      });
    } catch (error) {
      // File doesn't exist, return empty leaderboard
      res.status(200).json({
        success: true,
        globalLeaderboard: [],
        userStats: [],
        totalUsers: 0,
        totalEntries: 0
      });
    }
    
  } catch (error) {
    console.error('Get global leaderboard endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get global leaderboard'
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

// Prediction routes
router.post('/match/:matchId/predictions', handleSavePrediction);
router.get('/match/:matchId/predictions', handleGetPredictions);
router.delete('/match/:matchId/predictions', handleClearPredictions);

// Leaderboard routes
router.post('/match/:matchId/leaderboard', handleUpdateLeaderboard);
router.get('/match/:matchId/leaderboard', handleGetLeaderboard);
router.get('/leaderboard', handleGetGlobalLeaderboard);

export default router;
