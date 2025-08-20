// Dynamic Field Positioning Utility for Cricket Simulation
// Handles format-based field restrictions and random positioning

/**
 * Cricket format configurations for field restrictions
 */
const CRICKET_FORMATS = {
  T20_FORMATS: [3, 78, 73, 88], // Special T20 format IDs
  POWERPLAY_RESTRICTIONS: {
    T20: 6,     // Till 6th over for T20 formats
    OTHER: 10   // Till 10th over for other formats
  },
  FIELD_RESTRICTIONS: {
    MAX_FIELDERS_OUTSIDE_30M: 2  // Maximum fielders outside 30m circle during powerplay
  },
  FIELD_DIMENSIONS: {
    INNER_CIRCLE_RADIUS: 30,     // 30m circle radius
    MIN_DISTANCE_BETWEEN_FIELDERS: 20, // Minimum 20m apart
    BOUNDARY_RADIUS: 50,         // Maximum field boundary (playing area)
    PITCH_LENGTH: 22,            // Cricket pitch length
    MIN_FIELDERS_INSIDE_30M: 4   // Minimum fielders inside 30m circle always
  }
};

/**
 * Essential fielding positions that should always be maintained
 */
const ESSENTIAL_POSITIONS = {
  WICKET_KEEPER: { position: [0, 0, -11], role: 'keeper', fixed: true },
  SLIP: { position: [2, 0, -10], role: 'slip', fixed: true },
  MID_OFF: { position: [8, 0, 5], role: 'fielder', fixed: false },
  MID_ON: { position: [-8, 0, 5], role: 'fielder', fixed: false }
};

/**
 * Calculate distance between two 3D points (ignoring Y for field positioning)
 */
function calculateDistance(pos1, pos2) {
  const dx = pos1[0] - pos2[0];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Check if a position is outside the 30m circle
 */
function isOutside30mCircle(position) {
  const distanceFromCenter = calculateDistance(position, [0, 0, 0]);
  return distanceFromCenter > CRICKET_FORMATS.FIELD_DIMENSIONS.INNER_CIRCLE_RADIUS;
}

/**
 * Generate a random position within field boundaries
 */
function generateRandomFieldPosition(existingPositions = [], forceInside30m = false, forceOutside30m = false) {
  const maxAttempts = 100;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // Generate random angle and distance
    const angle = Math.random() * 2 * Math.PI;
    
    let minRadius, maxRadius;
    if (forceInside30m) {
      minRadius = 12; // Stay away from pitch area
      maxRadius = CRICKET_FORMATS.FIELD_DIMENSIONS.INNER_CIRCLE_RADIUS - 2; // Stay inside 30m
    } else if (forceOutside30m) {
      minRadius = CRICKET_FORMATS.FIELD_DIMENSIONS.INNER_CIRCLE_RADIUS + 2; // Stay outside 30m
      maxRadius = CRICKET_FORMATS.FIELD_DIMENSIONS.BOUNDARY_RADIUS - 3; // Stay inside boundary
    } else {
      minRadius = 12; // Minimum distance from center (avoid pitch)
      maxRadius = CRICKET_FORMATS.FIELD_DIMENSIONS.BOUNDARY_RADIUS - 3; // Stay inside boundary
    }
    
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const position = [Math.round(x), 0, Math.round(z)];
    
    // Ensure position is within the field boundary
    const distanceFromCenter = calculateDistance(position, [0, 0, 0]);
    if (distanceFromCenter > CRICKET_FORMATS.FIELD_DIMENSIONS.BOUNDARY_RADIUS) {
      continue;
    }
    
    // Check minimum distance from existing fielders
    let validPosition = true;
    for (const existingPos of existingPositions) {
      if (calculateDistance(position, existingPos) < CRICKET_FORMATS.FIELD_DIMENSIONS.MIN_DISTANCE_BETWEEN_FIELDERS) {
        validPosition = false;
        break;
      }
    }
    
    if (validPosition) {
      return position;
    }
    
    attempts++;
  }
  
  // Fallback: return a default position if no valid position found
  console.warn('Could not find valid random position, using fallback');
  const fallbackRadius = forceInside30m ? 25 : 35;
  return [fallbackRadius, 0, 0];
}

/**
 * Check if current over is in powerplay/restricted field period
 */
function isRestrictedFieldPeriod(formatId, overs) {
  const isT20Format = CRICKET_FORMATS.T20_FORMATS.includes(formatId);
  const restrictionLimit = isT20Format ? 
    CRICKET_FORMATS.POWERPLAY_RESTRICTIONS.T20 : 
    CRICKET_FORMATS.POWERPLAY_RESTRICTIONS.OTHER;
  
  return overs < restrictionLimit;
}

/**
 * Generate fielding positions based on game state and format rules
 */
export function generateDynamicFieldPositions(gameState) {
  const { formatId, score } = gameState;
  const currentOvers = score.overs;
  
  const isRestricted = isRestrictedFieldPeriod(formatId, currentOvers);
  const fielderPositions = [];
  const allPositions = []; // Track all positions to maintain minimum distance
  
  // Start with essential fixed positions (wicket keeper, etc.)
  Object.values(ESSENTIAL_POSITIONS).forEach(pos => {
    if (pos.fixed) {
      allPositions.push(pos.position);
    }
  });
  
  // Generate 11 fielders (standard field setup)
  const totalFielders = 11;
  let fieldersInside30m = 0;
  let fieldersOutside30m = 0;
  
  // Always ensure minimum fielders inside 30m circle
  const minFieldersInside30m = CRICKET_FORMATS.FIELD_DIMENSIONS.MIN_FIELDERS_INSIDE_30M;
  const maxFieldersOutside30mDuringRestriction = isRestricted ? 
    CRICKET_FORMATS.FIELD_RESTRICTIONS.MAX_FIELDERS_OUTSIDE_30M : 
    totalFielders;
  
  for (let i = 0; i < totalFielders; i++) {
    let position;
    let attempts = 0;
    const maxAttempts = 50;
    
    // Determine placement strategy
    const remainingFielders = totalFielders - i;
    const needMoreInside30m = fieldersInside30m < minFieldersInside30m && 
                              (remainingFielders <= (minFieldersInside30m - fieldersInside30m));
    const forceInside30m = needMoreInside30m || 
                          (isRestricted && fieldersOutside30m >= maxFieldersOutside30mDuringRestriction);
    
    while (attempts < maxAttempts) {
      if (forceInside30m) {
        position = generateRandomFieldPosition(allPositions, true, false); // Force inside 30m
      } else {
        position = generateRandomFieldPosition(allPositions, false, false); // Anywhere within boundary
      }
      
      // Validate minimum distance
      let validDistance = true;
      for (const existingPos of allPositions) {
        if (calculateDistance(position, existingPos) < CRICKET_FORMATS.FIELD_DIMENSIONS.MIN_DISTANCE_BETWEEN_FIELDERS) {
          validDistance = false;
          break;
        }
      }
      
      if (validDistance) {
        break;
      }
      
      attempts++;
    }
    
    // Count fielders by position
    const isOutside30m = isOutside30mCircle(position);
    if (isOutside30m) {
      fieldersOutside30m++;
    } else {
      fieldersInside30m++;
    }
    
    allPositions.push(position);
    fielderPositions.push({
      id: `fielder_${i + 1}`,
      name: `Fielder ${i + 1}`,
      position: position,
      role: 'fielding',
      state: 'ready',
      isOutside30m: isOutside30m
    });
  }
  
  return {
    fielders: fielderPositions,
    metadata: {
      formatId,
      currentOvers,
      isRestrictedPeriod: isRestricted,
      fieldersInside30m,
      fieldersOutside30m,
      minFieldersInside30m,
      maxAllowedOutside30m: maxFieldersOutside30mDuringRestriction,
      boundaryRadius: CRICKET_FORMATS.FIELD_DIMENSIONS.BOUNDARY_RADIUS
    }
  };
}

/**
 * Get field positioning rules explanation for current game state
 */
export function getFieldPositioningRules(formatId, overs) {
  const isT20Format = CRICKET_FORMATS.T20_FORMATS.includes(formatId);
  const restrictionLimit = isT20Format ? 
    CRICKET_FORMATS.POWERPLAY_RESTRICTIONS.T20 : 
    CRICKET_FORMATS.POWERPLAY_RESTRICTIONS.OTHER;
  
  const isRestricted = overs < restrictionLimit;
  
  return {
    formatType: isT20Format ? 'T20' : 'Other',
    restrictionLimit,
    currentOvers: overs,
    isRestrictedPeriod: isRestricted,
    maxFieldersOutside30m: isRestricted ? CRICKET_FORMATS.FIELD_RESTRICTIONS.MAX_FIELDERS_OUTSIDE_30M : 'unlimited',
    description: isRestricted 
      ? `Powerplay restrictions: Only ${CRICKET_FORMATS.FIELD_RESTRICTIONS.MAX_FIELDERS_OUTSIDE_30M} fielders allowed outside 30m circle until over ${restrictionLimit}`
      : 'No field restrictions: Fielders can be positioned anywhere'
  };
}

/**
 * Update existing fielder positions dynamically (for over changes)
 */
export function updateFieldPositionsForNewOver(currentFielders, gameState) {
  // Generate completely new positions for each over to keep it dynamic
  const newPositions = generateDynamicFieldPositions(gameState);
  
  // Map existing fielder IDs to new positions to maintain consistency
  return currentFielders.map((fielder, index) => ({
    ...fielder,
    position: newPositions.fielders[index]?.position || fielder.position,
    isOutside30m: isOutside30mCircle(newPositions.fielders[index]?.position || fielder.position)
  }));
}

export default {
  generateDynamicFieldPositions,
  getFieldPositioningRules,
  updateFieldPositionsForNewOver,
  CRICKET_FORMATS
};
