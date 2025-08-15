// Player Position Management Utilities
import { FIELD_CONSTRAINTS, MOVEMENT_STEP, ALL_PLAYER_POSITIONS } from '../constants/playerPositions';

/**
 * Position Manager Class - Handles player position modifications
 */
export class PositionManager {
  constructor() {
    // Clone the default positions to allow modifications without affecting constants
    this.currentPositions = JSON.parse(JSON.stringify(ALL_PLAYER_POSITIONS));
    this.originalPositions = JSON.parse(JSON.stringify(ALL_PLAYER_POSITIONS));
  }

  /**
   * Get current position of a player by ID
   * @param {string} playerId - Player ID
   * @returns {Array} [x, y, z] position array
   */
  getPlayerPosition(playerId) {
    const player = this.currentPositions[playerId];
    return player ? [...player.position] : null;
  }

  /**
   * Set position of a player by ID
   * @param {string} playerId - Player ID
   * @param {Array} newPosition - [x, y, z] position array
   * @returns {boolean} Success status
   */
  setPlayerPosition(playerId, newPosition) {
    if (!this.currentPositions[playerId]) {
      console.warn(`Player ${playerId} not found`);
      return false;
    }

    // Validate position within field constraints
    const constrainedPosition = this.constrainPosition(newPosition);
    this.currentPositions[playerId].position = constrainedPosition;
    return true;
  }

  /**
   * Move player position by direction (arrow keys)
   * @param {string} playerId - Player ID
   * @param {string} direction - 'left', 'right', 'up', 'down'
   * @returns {Array|null} New position or null if failed
   */
  movePlayer(playerId, direction) {
    const currentPos = this.getPlayerPosition(playerId);
    if (!currentPos) return null;

    let newPosition = [...currentPos];
    
    switch (direction.toLowerCase()) {
      case 'left':
        newPosition[0] -= MOVEMENT_STEP; // Decrease X
        break;
      case 'right':
        newPosition[0] += MOVEMENT_STEP; // Increase X
        break;
      case 'up':
        newPosition[2] += MOVEMENT_STEP; // Increase Z (towards bowler)
        break;
      case 'down':
        newPosition[2] -= MOVEMENT_STEP; // Decrease Z (towards keeper)
        break;
      default:
        console.warn(`Invalid direction: ${direction}`);
        return null;
    }

    // Apply constraints and update position
    const constrainedPosition = this.constrainPosition(newPosition);
    this.setPlayerPosition(playerId, constrainedPosition);
    return constrainedPosition;
  }

  /**
   * Constrain position within field boundaries
   * @param {Array} position - [x, y, z] position
   * @returns {Array} Constrained position
   */
  constrainPosition(position) {
    const [x, y, z] = position;
    return [
      Math.max(FIELD_CONSTRAINTS.MIN_X, Math.min(FIELD_CONSTRAINTS.MAX_X, x)),
      FIELD_CONSTRAINTS.Y, // Keep Y constant at ground level
      Math.max(FIELD_CONSTRAINTS.MIN_Z, Math.min(FIELD_CONSTRAINTS.MAX_Z, z))
    ];
  }

  /**
   * Reset all positions to original defaults
   */
  resetAllPositions() {
    this.currentPositions = JSON.parse(JSON.stringify(this.originalPositions));
  }

  /**
   * Reset specific player position to default
   * @param {string} playerId - Player ID
   */
  resetPlayerPosition(playerId) {
    if (this.originalPositions[playerId]) {
      this.currentPositions[playerId].position = [...this.originalPositions[playerId].position];
    }
  }

  /**
   * Get all current positions formatted for the game
   * @returns {Object} All current positions
   */
  getAllCurrentPositions() {
    return JSON.parse(JSON.stringify(this.currentPositions));
  }

  /**
   * Export current positions for saving
   * @returns {Object} Exportable positions data
   */
  exportPositions() {
    return {
      positions: this.currentPositions,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import positions from saved data
   * @param {Object} positionsData - Saved positions data
   * @returns {boolean} Success status
   */
  importPositions(positionsData) {
    try {
      if (positionsData && positionsData.positions) {
        this.currentPositions = JSON.parse(JSON.stringify(positionsData.positions));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing positions:', error);
      return false;
    }
  }

  /**
   * Save positions to localStorage
   * @param {string} saveSlot - Save slot name (optional)
   */
  saveToLocalStorage(saveSlot = 'default') {
    try {
      const data = this.exportPositions();
      localStorage.setItem(`cricket_positions_${saveSlot}`, JSON.stringify(data));
      console.log(`Positions saved to slot: ${saveSlot}`);
      return true;
    } catch (error) {
      console.error('Error saving positions:', error);
      return false;
    }
  }

  /**
   * Load positions from localStorage
   * @param {string} saveSlot - Save slot name (optional)
   */
  loadFromLocalStorage(saveSlot = 'default') {
    try {
      const data = localStorage.getItem(`cricket_positions_${saveSlot}`);
      if (data) {
        const positionsData = JSON.parse(data);
        this.importPositions(positionsData);
        console.log(`Positions loaded from slot: ${saveSlot}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading positions:', error);
      return false;
    }
  }

  /**
   * Get player info by ID
   * @param {string} playerId - Player ID
   * @returns {Object|null} Player info
   */
  getPlayerInfo(playerId) {
    return this.currentPositions[playerId] || null;
  }

  /**
   * Check if position is valid for a player (not overlapping with others)
   * @param {string} playerId - Player ID
   * @param {Array} newPosition - [x, y, z] position
   * @param {number} minDistance - Minimum distance between players
   * @returns {boolean} Is position valid
   */
  isValidPosition(playerId, newPosition, minDistance = 2) {
    const [newX, newY, newZ] = newPosition;
    
    for (const [otherId, otherPlayer] of Object.entries(this.currentPositions)) {
      if (otherId === playerId) continue;
      
      const [otherX, otherY, otherZ] = otherPlayer.position;
      const distance = Math.sqrt(
        Math.pow(newX - otherX, 2) + 
        Math.pow(newZ - otherZ, 2)
      );
      
      if (distance < minDistance) {
        return false;
      }
    }
    return true;
  }

  /**
   * Find nearest valid position to avoid overlap
   * @param {string} playerId - Player ID
   * @param {Array} desiredPosition - [x, y, z] desired position
   * @returns {Array} Nearest valid position
   */
  findNearestValidPosition(playerId, desiredPosition) {
    let [x, y, z] = desiredPosition;
    let attempts = 0;
    const maxAttempts = 20;
    
    while (!this.isValidPosition(playerId, [x, y, z]) && attempts < maxAttempts) {
      // Try small random offsets to find valid position
      x += (Math.random() - 0.5) * 2;
      z += (Math.random() - 0.5) * 2;
      
      // Constrain to field boundaries
      x = Math.max(FIELD_CONSTRAINTS.MIN_X, Math.min(FIELD_CONSTRAINTS.MAX_X, x));
      z = Math.max(FIELD_CONSTRAINTS.MIN_Z, Math.min(FIELD_CONSTRAINTS.MAX_Z, z));
      
      attempts++;
    }
    
    return [x, y, z];
  }
}

// Helper functions for direct use without class instantiation
export const movePlayerPosition = (currentPosition, direction, step = MOVEMENT_STEP) => {
  let newPosition = [...currentPosition];
  
  switch (direction.toLowerCase()) {
    case 'left':
      newPosition[0] -= step;
      break;
    case 'right':
      newPosition[0] += step;
      break;
    case 'up':
      newPosition[2] += step;
      break;
    case 'down':
      newPosition[2] -= step;
      break;
  }
  
  return constrainPosition(newPosition);
};

export const constrainPosition = (position) => {
  const [x, y, z] = position;
  return [
    Math.max(FIELD_CONSTRAINTS.MIN_X, Math.min(FIELD_CONSTRAINTS.MAX_X, x)),
    FIELD_CONSTRAINTS.Y,
    Math.max(FIELD_CONSTRAINTS.MIN_Z, Math.min(FIELD_CONSTRAINTS.MAX_Z, z))
  ];
};

// Create and export a default instance
export const defaultPositionManager = new PositionManager();

export default PositionManager;
