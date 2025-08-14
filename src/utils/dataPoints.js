// Pure functions for handling cricket simulation data points

// Ball trajectory calculation (pure function)
export const calculateBallTrajectory = (initialPosition, velocity, gravity = -9.81, timeStep = 0.016) => {
  const trajectory = [];
  let currentPos = { ...initialPosition };
  let currentVel = { ...velocity };
  let time = 0;
  
  while (currentPos.y >= 0 && time < 10) { // Max 10 seconds
    trajectory.push({
      position: { ...currentPos },
      time: time
    });
    
    // Update position
    currentPos.x += currentVel.x * timeStep;
    currentPos.y += currentVel.y * timeStep;
    currentPos.z += currentVel.z * timeStep;
    
    // Update velocity (gravity only affects Y)
    currentVel.y += gravity * timeStep;
    
    time += timeStep;
  }
  
  return trajectory;
};

// Player position calculator (pure function)
export const calculateFieldingPositions = (formation = 'default') => {
  const formations = {
    default: [
      { name: 'Wicket Keeper', position: [0, 0, -12], role: 'keeper' },
      { name: 'First Slip', position: [2, 0, -11], role: 'slip' },
      { name: 'Point', position: [8, 0, -2], role: 'fielder' },
      { name: 'Cover', position: [6, 0, 4], role: 'fielder' },
      { name: 'Mid Off', position: [3, 0, 8], role: 'fielder' },
      { name: 'Mid On', position: [-3, 0, 8], role: 'fielder' },
      { name: 'Square Leg', position: [-8, 0, -2], role: 'fielder' },
      { name: 'Fine Leg', position: [-6, 0, -8], role: 'fielder' },
      { name: 'Third Man', position: [6, 0, -8], role: 'fielder' },
      { name: 'Long Off', position: [5, 0, 15], role: 'boundary' },
      { name: 'Long On', position: [-5, 0, 15], role: 'boundary' }
    ],
    powerplay: [
      { name: 'Wicket Keeper', position: [0, 0, -12], role: 'keeper' },
      { name: 'First Slip', position: [2, 0, -11], role: 'slip' },
      { name: 'Point', position: [8, 0, -2], role: 'fielder' },
      { name: 'Cover', position: [6, 0, 4], role: 'fielder' },
      { name: 'Mid Off', position: [3, 0, 8], role: 'fielder' },
      { name: 'Mid On', position: [-3, 0, 8], role: 'fielder' },
      { name: 'Square Leg', position: [-8, 0, -2], role: 'fielder' }
    ]
  };
  
  return formations[formation] || formations.default;
};

// Shot analysis (pure function)
export const analyzeShotType = (ballSpeed, batAngle, timing) => {
  const shotTypes = {
    defensive: { minSpeed: 0, maxSpeed: 20, angles: [-30, 30] },
    drive: { minSpeed: 40, maxSpeed: 80, angles: [-45, 45] },
    cut: { minSpeed: 30, maxSpeed: 70, angles: [45, 135] },
    pull: { minSpeed: 50, maxSpeed: 90, angles: [-135, -45] },
    sweep: { minSpeed: 30, maxSpeed: 60, angles: [-180, -90, 90, 180] },
    loft: { minSpeed: 60, maxSpeed: 100, angles: [-60, 60] }
  };
  
  for (const [shotName, criteria] of Object.entries(shotTypes)) {
    if (ballSpeed >= criteria.minSpeed && 
        ballSpeed <= criteria.maxSpeed &&
        isAngleInRange(batAngle, criteria.angles)) {
      return {
        type: shotName,
        quality: calculateShotQuality(timing, ballSpeed),
        risk: calculateRiskFactor(shotName, ballSpeed)
      };
    }
  }
  
  return { type: 'miss', quality: 0, risk: 0 };
};

// Helper function to check if angle is in range
const isAngleInRange = (angle, ranges) => {
  if (ranges.length === 2) {
    return angle >= ranges[0] && angle <= ranges[1];
  }
  // Handle wrap-around angles
  return ranges.some((range, index) => {
    if (index % 2 === 0 && ranges[index + 1]) {
      return angle >= range && angle <= ranges[index + 1];
    }
    return false;
  });
};

// Calculate shot quality based on timing
const calculateShotQuality = (timing, speed) => {
  const perfectTiming = 0.5; // 50% of ball travel time
  const timingDifference = Math.abs(timing - perfectTiming);
  const qualityScore = Math.max(0, 1 - (timingDifference * 2));
  const speedBonus = Math.min(0.2, speed / 500); // Bonus for higher speed
  
  return Math.min(1, qualityScore + speedBonus);
};

// Calculate risk factor for different shot types
const calculateRiskFactor = (shotType, speed) => {
  const riskFactors = {
    defensive: 0.1,
    drive: 0.3,
    cut: 0.4,
    pull: 0.6,
    sweep: 0.5,
    loft: 0.8
  };
  
  const baseRisk = riskFactors[shotType] || 0.5;
  const speedRisk = speed > 80 ? 0.2 : 0;
  
  return Math.min(1, baseRisk + speedRisk);
};

// Weather effect on ball behavior (pure function)
export const applyWeatherEffects = (ballTrajectory, weather = 'clear') => {
  const weatherEffects = {
    clear: { windEffect: 0, humidityEffect: 1 },
    windy: { windEffect: 0.3, humidityEffect: 1 },
    humid: { windEffect: 0, humidityEffect: 0.8 },
    rainy: { windEffect: 0.2, humidityEffect: 0.6 }
  };
  
  const effects = weatherEffects[weather] || weatherEffects.clear;
  
  return ballTrajectory.map(point => ({
    ...point,
    position: {
      x: point.position.x + (Math.random() - 0.5) * effects.windEffect,
      y: point.position.y * effects.humidityEffect,
      z: point.position.z
    }
  }));
};