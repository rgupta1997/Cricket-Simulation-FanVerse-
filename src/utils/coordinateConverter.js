/**
 * Converts API coordinates to our game's coordinate system
 * @param {Object} apiCoords - The coordinates from the API
 * @param {string} positionType - 'release', 'bounce', or 'final'
 * @returns {Array} Coordinates for our game system [x, y, z]
 */
export function convertApiToGameCoordinates(apiCoords, positionType) {
  // Default values when API provides null
  const defaults = {
    release: { x: 0, y: 2, z: 10 },
    bounce: { x: 0, y: 0, z: 0 },
    final: { x: 0, y: 0.5, z: -9 }
  };

  // Define the mapping ranges for each position type
  const ranges = {
    release: {
      api: { x: [0, 40], y: [null, null], z: [0, 50] },
      game: { x: [-1.5, 1.5], y: [2, 2], z: [9, 11] }
    },
    bounce: {
      api: { x: [0, 40], y: [null, null], z: [16, 67] },
      game: { x: [-1.5, 1.5], y: [0, 0], z: [-10, 10] }
    },
    final: {
      api: { x: [0, 40], y: [0, 30], z: [null, null] },
      game: { x: [-1.5, 1.5], y: [0, 2.5], z: [-9, -9] }
    }
  };

  // Make sure we have a valid position type
  if (!ranges[positionType]) {
    console.error(`Invalid position type: ${positionType}`);
    return [defaults[positionType].x, defaults[positionType].y, defaults[positionType].z];
  }

  // Extract ranges for this position type
  const range = ranges[positionType];
  
  // Initialize the result with defaults
  const result = { ...defaults[positionType] };

  // Convert each coordinate
  ['x', 'y', 'z'].forEach(key => {
    // Skip if API doesn't provide this coordinate
    if (apiCoords[key] === null || apiCoords[key] === undefined) {
      return;
    }
    
    // Skip if API range isn't defined
    if (range.api[key][0] === null || range.api[key][1] === null) {
      return;
    }
    
    // Calculate the percentage in API range
    const apiMin = range.api[key][0];
    const apiMax = range.api[key][1];
    const apiRange = apiMax - apiMin;
    
    // Avoid division by zero
    if (apiRange === 0) {
      return;
    }
    
    const percentage = (apiCoords[key] - apiMin) / apiRange;
    
    // Apply percentage to our game range
    const gameMin = range.game[key][0];
    const gameMax = range.game[key][1];
    const gameRange = gameMax - gameMin;
    
    result[key] = gameMin + (percentage * gameRange);
  });
  
  // Return as array for Three.js compatibility
  return [result.x, result.y, result.z];
}

/**
 * Helper function to convert an entire trajectory
 * @param {Object} apiTrajectory - Trajectory data from API
 * @returns {Object} Converted trajectory for game system
 */
export function convertTrajectory(apiTrajectory) {
  if (!apiTrajectory) return null;
  
  return {
    initial: {
      position: convertApiToGameCoordinates(apiTrajectory.release || {}, 'release'),
      velocity: apiTrajectory.release?.velocity || [0, 0, -10] // Default velocity if missing
    },
    bounce: {
      position: convertApiToGameCoordinates(apiTrajectory.bounce || {}, 'bounce'),
      velocity: apiTrajectory.bounce?.velocity || [0, 5, -8] // Default velocity if missing
    },
    target: {
      position: convertApiToGameCoordinates(apiTrajectory.final || {}, 'final'),
      velocity: apiTrajectory.final?.velocity || [0, 0, 0] // Default velocity if missing
    },
    metadata: {
      useDirectCoordinates: true,
      source: 'api_conversion'
    }
  };
}
