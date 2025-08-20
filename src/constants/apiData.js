// Sample API data for testing coordinate conversion
export const SAMPLE_API_DATA = {
  release: { x: 0, y: null, z: 0 },
  bounce: { x: 0, y: null, z: 0 },
  final: { x: 0, y: 10, z: null },
  shotData: {
    zone: 5,      // Zone 3 (25-35m)
    angle: 0,    // 45 degrees (towards forward point)
    shotType: "drive"
  }
};

// Alternative API data sets for different scenarios
export const API_DATA_SETS = {
  // Default test data
  default: {
    release: { x: 20, y: null, z: 25 },
    bounce: { x: 15, y: null, z: 40 },
    final: { x: 30, y: 15, z: null },
    shotData: { zone: 3, angle: 45, shotType: "drive" }
  },
  
  // Left-side delivery
  leftSide: {
    release: { x: 10, y: null, z: 20 },
    bounce: { x: 8, y: null, z: 35 },
    final: { x: 5, y: 10, z: null },
    shotData: { zone: 4, angle: 135, shotType: "cut" }
  },
  
  // Right-side delivery
  rightSide: {
    release: { x: 30, y: null, z: 30 },
    bounce: { x: 32, y: null, z: 45 },
    final: { x: 35, y: 20, z: null },
    shotData: { zone: 2, angle: 30, shotType: "off_drive" }
  },
  
  // High bounce
  highBounce: {
    release: { x: 20, y: null, z: 15 },
    bounce: { x: 20, y: null, z: 30 },
    final: { x: 20, y: 25, z: null },
    shotData: { zone: 4, angle: 90, shotType: "pull" }
  },
  
  // Wide delivery
  wide: {
    release: { x: 35, y: null, z: 25 },
    bounce: { x: 38, y: null, z: 50 },
    final: { x: 40, y: 5, z: null },
    shotData: { zone: 5, angle: 180, shotType: "boundary" }
  }
};

// Shot samples with different zones and angles
export const SHOT_SAMPLES = [
  { zone: 2, angle: 0,   name: "Straight drive", shotType: "straight_drive" },
  { zone: 3, angle: 30,  name: "Off drive", shotType: "off_drive" },
  { zone: 4, angle: 90,  name: "Square cut", shotType: "square_cut" },
  { zone: 5, angle: 135, name: "Late cut", shotType: "late_cut" },
  { zone: 4, angle: 180, name: "Third man edge", shotType: "edge" },
  { zone: 3, angle: 225, name: "Fine leg glance", shotType: "glance" },
  { zone: 4, angle: 270, name: "Leg glance", shotType: "leg_glance" },
  { zone: 5, angle: 315, name: "Midwicket pull", shotType: "pull" }
];

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
