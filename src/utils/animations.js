// Pure functions for animation utilities in cricket simulation

// Easing functions (pure functions)
export const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t) => t * t * t;
export const linear = (t) => t;

// Animation state calculator (pure function)
export const calculateAnimationFrame = (startTime, duration, currentTime, easingFunction = easeInOut) => {
  const elapsed = currentTime - startTime;
  const progress = Math.min(1, Math.max(0, elapsed / duration));
  return easingFunction(progress);
};

// Interpolate between two positions (pure function)
export const interpolatePosition = (start, end, progress) => ({
  x: start.x + (end.x - start.x) * progress,
  y: start.y + (end.y - start.y) * progress,
  z: start.z + (end.z - start.z) * progress
});

// Interpolate between two rotations (pure function)
export const interpolateRotation = (start, end, progress) => ({
  x: start.x + (end.x - start.x) * progress,
  y: start.y + (end.y - start.y) * progress,
  z: start.z + (end.z - start.z) * progress
});

// Ball bounce calculation (pure function)
export const calculateBounce = (position, velocity, surface = 'pitch') => {
  const bounceFactors = {
    pitch: { dampening: 0.7, friction: 0.9 },
    grass: { dampening: 0.6, friction: 0.8 },
    boundary: { dampening: 0.8, friction: 0.95 }
  };
  
  const factors = bounceFactors[surface] || bounceFactors.pitch;
  
  return {
    position: { ...position, y: Math.abs(position.y) },
    velocity: {
      x: velocity.x * factors.friction,
      y: Math.abs(velocity.y) * factors.dampening,
      z: velocity.z * factors.friction
    }
  };
};

// Batting animation keyframes (pure function)
export const generateBattingAnimation = (shotType, timing) => {
  const animations = {
    defensive: [
      { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: 0 } },
      { time: 0.3, rotation: { x: -10, y: 5, z: 0 }, position: { x: 0, y: 1, z: -0.2 } },
      { time: 0.6, rotation: { x: -5, y: 0, z: 0 }, position: { x: 0, y: 1, z: 0 } },
      { time: 1, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: 0 } }
    ],
    drive: [
      { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: 0 } },
      { time: 0.2, rotation: { x: -20, y: -10, z: 0 }, position: { x: 0, y: 1, z: -0.3 } },
      { time: 0.5, rotation: { x: 30, y: 10, z: 0 }, position: { x: 0, y: 1, z: 0.3 } },
      { time: 0.8, rotation: { x: 10, y: 5, z: 0 }, position: { x: 0, y: 1, z: 0.2 } },
      { time: 1, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: 0 } }
    ],
    loft: [
      { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: 0 } },
      { time: 0.3, rotation: { x: -30, y: -15, z: 0 }, position: { x: 0, y: 0.8, z: -0.4 } },
      { time: 0.6, rotation: { x: 45, y: 15, z: 0 }, position: { x: 0, y: 1.2, z: 0.3 } },
      { time: 0.9, rotation: { x: 20, y: 10, z: 0 }, position: { x: 0, y: 1.1, z: 0.2 } },
      { time: 1, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: 0 } }
    ]
  };
  
  const baseAnimation = animations[shotType] || animations.defensive;
  
  // Adjust timing based on shot timing quality
  return baseAnimation.map(keyframe => ({
    ...keyframe,
    time: keyframe.time * (timing * 0.5 + 0.75) // Adjust timing based on shot quality
  }));
};

// Bowling animation keyframes (pure function)
export const generateBowlingAnimation = (bowlingType, speed) => {
  const baseAnimations = {
    fast: [
      { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: -5 } },
      { time: 0.3, rotation: { x: -45, y: 0, z: 0 }, position: { x: 0, y: 1.5, z: -3 } },
      { time: 0.6, rotation: { x: 90, y: 0, z: 0 }, position: { x: 0, y: 1.8, z: -1 } },
      { time: 0.8, rotation: { x: 45, y: 0, z: 0 }, position: { x: 0, y: 1.2, z: 1 } },
      { time: 1, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: 2 } }
    ],
    spin: [
      { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: -3 } },
      { time: 0.4, rotation: { x: -30, y: 45, z: 0 }, position: { x: 0.5, y: 1.3, z: -1 } },
      { time: 0.7, rotation: { x: 60, y: -30, z: 0 }, position: { x: -0.3, y: 1.5, z: 0 } },
      { time: 1, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: 1 } }
    ]
  };
  
  const animation = baseAnimations[bowlingType] || baseAnimations.fast;
  const speedMultiplier = speed / 100; // Normalize speed
  
  return animation.map(keyframe => ({
    ...keyframe,
    time: keyframe.time / speedMultiplier // Faster animations for higher speed
  }));
};

// Camera shake effect for impact moments (pure function)
export const calculateCameraShake = (intensity, duration, currentTime, startTime) => {
  const elapsed = currentTime - startTime;
  if (elapsed > duration) return { x: 0, y: 0, z: 0 };
  
  const progress = elapsed / duration;
  const dampening = 1 - progress; // Reduce shake over time
  const shakeIntensity = intensity * dampening;
  
  return {
    x: (Math.random() - 0.5) * shakeIntensity,
    y: (Math.random() - 0.5) * shakeIntensity * 0.5, // Less vertical shake
    z: (Math.random() - 0.5) * shakeIntensity * 0.3  // Even less depth shake
  };
};

// Particle effect parameters (pure function)
export const generateParticleEffect = (effectType, position, intensity = 1) => {
  const effects = {
    ballImpact: {
      count: Math.floor(10 * intensity),
      spread: 0.5,
      velocity: { min: 2, max: 8 },
      life: 1000,
      color: '#8B4513'
    },
    boundary: {
      count: Math.floor(20 * intensity),
      spread: 1,
      velocity: { min: 1, max: 5 },
      life: 2000,
      color: '#FFD700'
    },
    wicket: {
      count: Math.floor(15 * intensity),
      spread: 0.8,
      velocity: { min: 3, max: 10 },
      life: 1500,
      color: '#FF4444'
    }
  };
  
  const effect = effects[effectType] || effects.ballImpact;
  
  return {
    ...effect,
    position: { ...position },
    particles: Array.from({ length: effect.count }, (_, i) => ({
      id: i,
      position: {
        x: position.x + (Math.random() - 0.5) * effect.spread,
        y: position.y + Math.random() * effect.spread,
        z: position.z + (Math.random() - 0.5) * effect.spread
      },
      velocity: {
        x: (Math.random() - 0.5) * effect.velocity.max,
        y: Math.random() * effect.velocity.max,
        z: (Math.random() - 0.5) * effect.velocity.max
      }
    }))
  };
};