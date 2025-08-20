const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Save a prediction to the backend
 * @param {string} matchId - The match ID
 * @param {Object} predictionData - The prediction data
 * @param {string} predictionData.userId - User ID
 * @param {string} predictionData.firstName - User's first name
 * @param {string} predictionData.lastName - User's last name
 * @param {string} predictionData.prediction - The prediction (0-6 or 'W')
 * @param {number} predictionData.ballNumber - The ball number
 * @returns {Promise<Object>} - API response
 */
export const savePrediction = async (matchId, predictionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/match/${matchId}/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(predictionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving prediction:', error);
    throw error;
  }
};

/**
 * Get all predictions for a match
 * @param {string} matchId - The match ID
 * @returns {Promise<Object>} - API response with predictions
 */
export const getPredictions = async (matchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/match/${matchId}/predictions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting predictions:', error);
    throw error;
  }
};

/**
 * Clear all predictions for a match
 * @param {string} matchId - The match ID
 * @returns {Promise<Object>} - API response
 */
export const clearPredictions = async (matchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/match/${matchId}/predictions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing predictions:', error);
    throw error;
  }
};

/**
 * Update leaderboard when a prediction is correct
 * @param {string} matchId - The match ID
 * @param {Object} leaderboardData - The leaderboard data
 * @param {number} leaderboardData.ballNumber - The ball number
 * @param {string} leaderboardData.actualResult - The actual result (runs or 'W')
 * @returns {Promise<Object>} - API response
 */
export const updateLeaderboard = async (matchId, leaderboardData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/match/${matchId}/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leaderboardData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    throw error;
  }
};

/**
 * Get leaderboard for a match
 * @param {string} matchId - The match ID
 * @returns {Promise<Object>} - API response with leaderboard data
 */
export const getLeaderboard = async (matchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/match/${matchId}/leaderboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};
