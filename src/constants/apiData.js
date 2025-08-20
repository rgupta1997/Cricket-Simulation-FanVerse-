// Sample API data for testing coordinate conversion
export const SAMPLE_API_DATA = {
  release: { x: 0, y: null, z: 0 },
  bounce: { x: 0, y: null, z: 16 },
  final: { x: 0, y: 0, z: null }
};

// Alternative API data sets for different scenarios
export const API_DATA_SETS = {
  // Default test data
  default: {
    release: { x: 20, y: null, z: 25 },
    bounce: { x: 15, y: null, z: 40 },
    final: { x: 30, y: 15, z: null }
  },
  
  // Left-side delivery
  leftSide: {
    release: { x: 10, y: null, z: 20 },
    bounce: { x: 8, y: null, z: 35 },
    final: { x: 5, y: 10, z: null }
  },
  
  // Right-side delivery
  rightSide: {
    release: { x: 30, y: null, z: 30 },
    bounce: { x: 32, y: null, z: 45 },
    final: { x: 35, y: 20, z: null }
  },
  
  // High bounce
  highBounce: {
    release: { x: 20, y: null, z: 15 },
    bounce: { x: 20, y: null, z: 30 },
    final: { x: 20, y: 25, z: null }
  },
  
  // Wide delivery
  wide: {
    release: { x: 35, y: null, z: 25 },
    bounce: { x: 38, y: null, z: 50 },
    final: { x: 40, y: 5, z: null }
  }
};

// Velocity presets for different delivery types
export const VELOCITY_PRESETS = {
  fast: {
    release: [0, 0, -15],
    bounce: [0, 8, -12],
    final: [0, 0, 0]
  },
  medium: {
    release: [0, 0, -10],
    bounce: [0, 5, -8],
    final: [0, 0, 0]
  },
  slow: {
    release: [0, 0, -6],
    bounce: [0, 3, -5],
    final: [0, 0, 0]
  },
  spin: {
    release: [2, 0, -8],
    bounce: [3, 4, -6],
    final: [1, 0, 0]
  }
};
