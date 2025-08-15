// Functional Player Position Management Utilities
import { FIELD_CONSTRAINTS, MOVEMENT_STEP, ALL_PLAYER_POSITIONS } from '../constants/playerPositions';

// Pure function to create initial position state
export const createInitialPositions = () => {
  return JSON.parse(JSON.stringify(ALL_PLAYER_POSITIONS));
};

// Pure function to get player position by ID
export const getPlayerPosition = (positions, playerId) => {
  const player = positions[playerId];
  if (!player) {
    console.warn(`Player ${playerId} not found in positions:`, Object.keys(positions));
    return null;
  }
  const [x, , z] = player.position; // y is not used but included for completeness
  return [x, FIELD_CONSTRAINTS.Y, z]; // Always use ground level Y
};

// Pure function to constrain position within field boundaries
export const constrainPosition = (position) => {
  const [x, , z] = position; // Y is not used, always set to ground level
  return [
    Math.max(FIELD_CONSTRAINTS.MIN_X, Math.min(FIELD_CONSTRAINTS.MAX_X, x)),
    FIELD_CONSTRAINTS.Y, // Keep Y constant at ground level
    Math.max(FIELD_CONSTRAINTS.MIN_Z, Math.min(FIELD_CONSTRAINTS.MAX_Z, z))
  ];
};

// Pure function to set player position
export const setPlayerPosition = (positions, playerId, newPosition) => {
  if (!positions[playerId]) {
    console.warn(`Player ${playerId} not found`);
    return positions; // Return unchanged positions
  }

  // Validate position within field constraints
  const constrainedPosition = constrainPosition(newPosition);
  
  // Return new positions object with updated player position
  return {
    ...positions,
    [playerId]: {
      ...positions[playerId],
      position: constrainedPosition
    }
  };
};

// Pure function to move player by direction
export const movePlayer = (positions, playerId, direction) => {
  console.log('🔧 movePlayer called:', { 
    playerId, 
    direction, 
    hasPlayer: !!positions[playerId],
    availableKeys: Object.keys(positions)
  });
  
  const currentPos = getPlayerPosition(positions, playerId);
  if (!currentPos) {
    console.error('❌ Failed to get current position for player:', playerId);
    console.error('Available players:', Object.keys(positions));
    return { positions, newPosition: null };
  }

  console.log('✅ Current position found:', currentPos);

  const newPosition = [...currentPos];
  
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
      return { positions, newPosition: null };
  }

  // Apply constraints and update positions
  const constrainedPosition = constrainPosition(newPosition);
  const updatedPositions = setPlayerPosition(positions, playerId, constrainedPosition);
  
  console.log('✅ Player moved successfully:', { 
    from: currentPos, 
    to: constrainedPosition, 
    direction 
  });
  
  return { 
    positions: updatedPositions, 
    newPosition: constrainedPosition 
  };
};

// Pure function to reset player position to default
export const resetPlayerPosition = (positions, playerId) => {
  const originalPositions = createInitialPositions();
  if (!originalPositions[playerId]) {
    console.warn(`Player ${playerId} not found in original positions`);
    return positions;
  }

  return setPlayerPosition(positions, playerId, originalPositions[playerId].position);
};

// Pure function to reset all positions to defaults
export const resetAllPositions = () => {
  return createInitialPositions();
};

// Pure function to validate position (check for overlaps)
export const isValidPosition = (positions, playerId, newPosition, minDistance = 2) => {
  const [newX, , newZ] = newPosition; // Y is not used for distance calculation
  
  for (const [otherId, otherPlayer] of Object.entries(positions)) {
    if (otherId === playerId) continue;
    
    const [otherX, , otherZ] = otherPlayer.position; // Y is not used for distance calculation
    const distance = Math.sqrt(
      Math.pow(newX - otherX, 2) + 
      Math.pow(newZ - otherZ, 2)
    );
    
    if (distance < minDistance) {
      return false;
    }
  }
  return true;
};

// Pure function to find nearest valid position
export const findNearestValidPosition = (positions, playerId, desiredPosition) => {
  let [x, , z] = desiredPosition;
  const y = FIELD_CONSTRAINTS.Y; // Always use ground level
  let attempts = 0;
  const maxAttempts = 20;
  
  while (!isValidPosition(positions, playerId, [x, y, z]) && attempts < maxAttempts) {
    // Try small random offsets to find valid position
    x += (Math.random() - 0.5) * 2;
    z += (Math.random() - 0.5) * 2;
    
    // Constrain to field boundaries
    x = Math.max(FIELD_CONSTRAINTS.MIN_X, Math.min(FIELD_CONSTRAINTS.MAX_X, x));
    z = Math.max(FIELD_CONSTRAINTS.MIN_Z, Math.min(FIELD_CONSTRAINTS.MAX_Z, z));
    
    attempts++;
  }
  
  return [x, y, z];
};

// Pure function to export positions for saving
export const exportPositions = (positions) => {
  return {
    positions,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
};

// Pure function to import positions from saved data
export const importPositions = (positionsData) => {
  if (positionsData && positionsData.positions) {
    return positionsData.positions;
  }
  console.warn('Invalid positions data provided');
  return createInitialPositions();
};

// LocalStorage utilities (side effects contained)
export const savePositionsToStorage = (positions, saveSlot = 'default') => {
  try {
    const data = exportPositions(positions);
    localStorage.setItem(`cricket_positions_${saveSlot}`, JSON.stringify(data));
    console.log(`Positions saved to slot: ${saveSlot}`);
    return true;
  } catch (error) {
    console.error('Error saving positions:', error);
    return false;
  }
};

export const loadPositionsFromStorage = (saveSlot = 'default') => {
  try {
    const data = localStorage.getItem(`cricket_positions_${saveSlot}`);
    if (data) {
      const positionsData = JSON.parse(data);
      console.log(`Positions loaded from slot: ${saveSlot}`);
      return importPositions(positionsData);
    }
    console.log(`No saved positions found in slot: ${saveSlot}`);
    return null;
  } catch (error) {
    console.error('Error loading positions:', error);
    return null;
  }
};

// Pure function to get player info by ID
export const getPlayerInfo = (positions, playerId) => {
  return positions[playerId] || null;
};

// Pure function to get all positions
export const getAllPositions = (positions) => {
  return JSON.parse(JSON.stringify(positions));
};

// Helper function to create position manager hook state
export const createPositionManagerState = () => {
  return {
    positions: createInitialPositions(),
    originalPositions: createInitialPositions()
  };
};

export default {
  createInitialPositions,
  getPlayerPosition,
  constrainPosition,
  setPlayerPosition,
  movePlayer,
  resetPlayerPosition,
  resetAllPositions,
  isValidPosition,
  findNearestValidPosition,
  exportPositions,
  importPositions,
  savePositionsToStorage,
  loadPositionsFromStorage,
  getPlayerInfo,
  getAllPositions,
  createPositionManagerState
};
