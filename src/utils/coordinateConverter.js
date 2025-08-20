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
 * Converts a zone number and angle into a distance value in meters
 * with proper cricket field asymmetry
 * 
 * @param {number} zone - Zone number (1-5)
 * @param {number} degrees - Angle in degrees (0-360)
 * @returns {number} Distance in meters
 */
export function zoneToDistance(zone, degrees) {
  // Define zone ranges (min-max distances in meters)
  const zoneRanges = {
    1: [0, 10],    // 0-10m (from striker to the pitch)
    2: [10, 25],   // 10-25m (1st circle)
    3: [25, 35],   // 25-35m (2nd circle)
    4: [35, 50],   // 35-50m (deep circle)
    5: [50, 75]    // 50-75m (boundary + stands)
  };
  
  // Validate zone
  if (!zoneRanges[zone]) {
    console.warn(`Invalid zone: ${zone}, using zone 3 as default`);
    zone = 3; // Default to middle zone if invalid
  }
  
  // Get min and max for the specified zone
  const [min, max] = zoneRanges[zone];
  
  // Normalize degrees to 0-360
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  
  // Asymmetric oval factor calculation that accounts for cricket field shape:
  // - Longer at 0° (straight down the ground)
  // - Longer at 270° (bowler side) than at 90° (keeper side)
  // - Medium length at 180° (behind batsman)
  
  // Base oval factor still uses cosine for 0/180 axis
  let ovalFactor = 0.8 + 0.4 * Math.abs(Math.cos(normalizedDegrees * Math.PI / 180));
  
  // Adjust for asymmetry between bowler side and keeper side
  // Calculate how much we're toward the bowler side (270°) vs keeper side (90°)
  const sideAngle = Math.abs(((normalizedDegrees + 90) % 360) - 180) / 180; // 0 at 90°, 1 at 270°
  
  // Apply asymmetry adjustment - increase for bowler side (270°)
  if (normalizedDegrees > 180 && normalizedDegrees < 360) {
    ovalFactor += 0.2 * sideAngle; // Boost bowler side distance
  } else if (normalizedDegrees > 0 && normalizedDegrees < 180) {
    ovalFactor -= 0.1 * (1 - sideAngle); // Slightly reduce keeper side
  }
  
  // For zone 5 (boundary), ensure minimum distance is maintained
  if (zone === 5) {
    ovalFactor = Math.max(ovalFactor, 0.9); // Ensure boundaries are at least 90% of min distance
  }
  
  // Generate a random distance within the zone range, adjusted by oval factor
  const randomFactor = Math.random();
  const distance = min + randomFactor * (max - min) * ovalFactor;
  
  return distance;
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
