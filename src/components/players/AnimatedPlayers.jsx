/* eslint-disable react/no-unknown-property */
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

// Enhanced Animated Batsman Component
export const AnimatedBatsman = ({ 
  position = [0, 0, 0], 
  isStrike = true, 
  animation = null,
  gameState = null,
  selectedShotDirection = 'straight',
  selectedShotType = 'drive',
  showBatSwing = false
}) => {
  const meshRef = useRef();
  const batRef = useRef();
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isSwinging, setIsSwinging] = useState(false);

  // Animation keyframes for different batting shots
  const animations = {
    idle: {
      duration: 2000,
      body: { rotation: [0, 0, 0], position: [0, 1.2, 0] },
      bat: { rotation: [0, 0, -0.5], position: [0.4, 1.0, 0] },
      arms: { rotation: [0, 0, 0] }
    },
    ready: {
      duration: 1000,
      body: { rotation: [0, 0, 0], position: [0, 1.1, 0] },
      bat: { rotation: [0, 0, -0.3], position: [0.3, 0.8, 0] },
      arms: { rotation: [0, 0.2, 0] }
    },
    defensive: {
      duration: 800,
      keyframes: [
        { time: 0, body: { rotation: [0, 0, 0] }, bat: { rotation: [0, 0, -0.3] } },
        { time: 0.3, body: { rotation: [-0.1, 0, 0] }, bat: { rotation: [-0.2, 0, 0] } },
        { time: 0.7, body: { rotation: [-0.05, 0, 0] }, bat: { rotation: [-0.1, 0, 0] } },
        { time: 1, body: { rotation: [0, 0, 0] }, bat: { rotation: [0, 0, -0.3] } }
      ]
    },
    drive: {
      duration: 1200,
      keyframes: [
        { time: 0, body: { rotation: [0, 0, 0] }, bat: { rotation: [0, 0, -0.3] } },
        { time: 0.2, body: { rotation: [-0.3, -0.1, 0] }, bat: { rotation: [-0.5, -0.2, 0] } },
        { time: 0.5, body: { rotation: [0.2, 0.1, 0] }, bat: { rotation: [0.3, 0.2, 0] } },
        { time: 0.8, body: { rotation: [0.1, 0.05, 0] }, bat: { rotation: [0.1, 0.1, 0] } },
        { time: 1, body: { rotation: [0, 0, 0] }, bat: { rotation: [0, 0, -0.3] } }
      ]
    },
    pull: {
      duration: 1000,
      keyframes: [
        { time: 0, body: { rotation: [0, 0, 0] }, bat: { rotation: [0, 0, -0.3] } },
        { time: 0.3, body: { rotation: [0, -0.5, 0] }, bat: { rotation: [0, -0.8, 0.5] } },
        { time: 0.6, body: { rotation: [0, 0.3, 0] }, bat: { rotation: [0, 0.5, 0.8] } },
        { time: 1, body: { rotation: [0, 0, 0] }, bat: { rotation: [0, 0, -0.3] } }
      ]
    },
    running: {
      duration: 500,
      keyframes: [
        { time: 0, body: { position: [0, 1.2, 0] }, legs: { rotation: [0, 0, 0] } },
        { time: 0.5, body: { position: [0, 1.1, 0] }, legs: { rotation: [0.5, 0, 0] } },
        { time: 1, body: { position: [0, 1.2, 0] }, legs: { rotation: [-0.5, 0, 0] } }
      ]
    }
  };

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Trigger bat swing animation when showBatSwing is true
    if (showBatSwing && !isSwinging) {
      setIsSwinging(true);
      setCurrentAnimation(selectedShotType || 'drive');
      setAnimationProgress(0);
      console.log('🏏 Starting bat swing animation for:', selectedShotType);
      
      // Auto-reset animation after duration
      setTimeout(() => {
        setIsSwinging(false);
        setCurrentAnimation('idle');
      }, 1000);
    }

    // Update animation based on game state
    if (animation && animation !== currentAnimation && !isSwinging) {
      setCurrentAnimation(animation);
      setAnimationProgress(0);
    }

    // Animate based on current animation
    const anim = animations[currentAnimation] || animations.idle;
    
    if (anim.keyframes) {
      // Keyframe-based animation
      setAnimationProgress(prev => {
        const newProgress = (prev + delta * 1000) % anim.duration;
        const normalizedTime = newProgress / anim.duration;
        
        // Find current keyframe
        let currentFrame = anim.keyframes[0];
        let nextFrame = anim.keyframes[1] || anim.keyframes[0];
        
        for (let i = 0; i < anim.keyframes.length - 1; i++) {
          if (normalizedTime >= anim.keyframes[i].time && normalizedTime <= anim.keyframes[i + 1].time) {
            currentFrame = anim.keyframes[i];
            nextFrame = anim.keyframes[i + 1];
            break;
          }
        }
        
        // Interpolate between keyframes
        const frameProgress = (normalizedTime - currentFrame.time) / (nextFrame.time - currentFrame.time);
        
        // Apply interpolated transformations
        if (currentFrame.body && nextFrame.body && meshRef.current) {
          const bodyRotX = currentFrame.body.rotation[0] + (nextFrame.body.rotation[0] - currentFrame.body.rotation[0]) * frameProgress;
          const bodyRotY = currentFrame.body.rotation[1] + (nextFrame.body.rotation[1] - currentFrame.body.rotation[1]) * frameProgress;
          const bodyRotZ = currentFrame.body.rotation[2] + (nextFrame.body.rotation[2] - currentFrame.body.rotation[2]) * frameProgress;
          
          meshRef.current.rotation.set(bodyRotX, bodyRotY, bodyRotZ);
        }
        
        if (currentFrame.bat && nextFrame.bat && batRef.current) {
          const batRotX = currentFrame.bat.rotation[0] + (nextFrame.bat.rotation[0] - currentFrame.bat.rotation[0]) * frameProgress;
          const batRotY = currentFrame.bat.rotation[1] + (nextFrame.bat.rotation[1] - currentFrame.bat.rotation[1]) * frameProgress;
          const batRotZ = currentFrame.bat.rotation[2] + (nextFrame.bat.rotation[2] - currentFrame.bat.rotation[2]) * frameProgress;
          
          batRef.current.rotation.set(batRotX, batRotY, batRotZ);
        }
        
        return newProgress;
      });
    } else {
      // Simple looping animation
      const time = state.clock.elapsedTime;
      if (currentAnimation === 'idle') {
        meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      }
    }
  });

  return (
    <group position={position}>
      <group ref={meshRef}>
        {/* Head */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Helmet */}
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshLambertMaterial color={isStrike ? "#FF0000" : "#0000FF"} />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.3, 1.3, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        <mesh position={[0.3, 1.3, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.1, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.1, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Pads */}
        <mesh position={[-0.1, 0.4, 0.08]}>
          <boxGeometry args={[0.15, 0.7, 0.1]} />
          <meshLambertMaterial color="#E0E0E0" />
        </mesh>
        <mesh position={[0.1, 0.4, 0.08]}>
          <boxGeometry args={[0.15, 0.7, 0.1]} />
          <meshLambertMaterial color="#E0E0E0" />
        </mesh>
        
        {/* Bat */}
        <group ref={batRef} position={[0.4, 1.0, 0]} rotation={[0, 0, -0.5]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.8, 8]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.15, 0.3, 0.03]} />
            <meshLambertMaterial color="#D2691E" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// Enhanced Realistic Animated Bowler Component
export const AnimatedBowler = ({ 
  position = [0, 0, 0], 
  animation = null,
  bowlingType = 'fast',
  gameState = null,
  onBallRelease = null // Callback for when ball should be released
}) => {
  // 🎯 STATE DECLARATIONS - Must come before useEffect hooks
  const meshRef = useRef();
  const armRef = useRef();
  const bodyRef = useRef();
  const legLeftRef = useRef();
  const legRightRef = useRef();
  const ballRef = useRef();
  
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [runUpDistance, setRunUpDistance] = useState(0);
  const [bowlerPosition, setBowlerPosition] = useState(position);
  const [ballReleased, setBallReleased] = useState(false);
  const [animationStartTime, setAnimationStartTime] = useState(0);
  const [isAtReleasePoint, setIsAtReleasePoint] = useState(false);
  const [originalPosition, setOriginalPosition] = useState(position);
  const [sequenceStarted, setSequenceStarted] = useState(false);

  // 🚨 DEBUG: Log callback availability and bowling sequence state
  React.useEffect(() => {
    console.log('🏏 AnimatedBowler initialized with callback:', onBallRelease ? '✅ Available' : '❌ Missing');
    console.log('🎮 Game state bowling sequence active:', gameState?.bowlingSequenceActive);
  }, [onBallRelease, gameState?.bowlingSequenceActive]);

  // 🎬 ANIMATION SEQUENCE LOGGING
  React.useEffect(() => {
    if (currentAnimation !== 'idle') {
      console.log(`🎬 Animation phase: ${currentAnimation} (Progress: ${(animationProgress * 100).toFixed(1)}%)`);
    }
  }, [currentAnimation, Math.floor(animationProgress * 10)]); // Log every 10% progress

  // 🏏 REALISTIC BOWLING ANIMATIONS - Like real cricket
  const bowlingAnimations = {
    idle: {
      duration: 3000,
      arm: { rotation: [0, 0, 0.3] },
      body: { rotation: [0, 0, 0], position: [0, 1.2, 0] },
      ball: { position: [0.35, 1.5, 0], visible: true }
    },
    
    // 🏃‍♂️ REALISTIC RUN-UP SEQUENCE - Dynamic distance based on release position
    runUp: {
      duration: 2500, // 2.5 seconds for realistic run-up
      phases: [
        // Phase 1: Start running (0-25%)
        { time: 0, distance: 0, pace: 0.5, body: { rotation: [0, 0, 0], lean: 0 } },
        { time: 0.25, distance: 0.25, pace: 1.0, body: { rotation: [0.1, 0, 0], lean: 0.1 } },
        // Phase 2: Acceleration (25-60%)
        { time: 0.6, distance: 0.6, pace: 1.8, body: { rotation: [0.2, 0, 0], lean: 0.2 } },
        // Phase 3: Final approach (60-90%)
        { time: 0.9, distance: 0.9, pace: 2.2, body: { rotation: [0.3, 0, 0], lean: 0.3 } },
        // Phase 4: Delivery stride (90-100%) - STOP AT RELEASE POINT
        { time: 1, distance: 1.0, pace: 0, body: { rotation: [0.4, 0, 0], lean: 0.4 } }
      ],
      stepFrequency: 8, // Steps per second during run-up
      ball: { position: [0.35, 1.5, 0], visible: true },
      releasePoint: 'dynamic' // Will be calculated from release position
    },
    
    // 🛑 AT RELEASE POINT - Bowler stops and IMMEDIATELY releases ball
    atReleasePoint: {
      duration: 100, // 0.1 seconds - just long enough to trigger ball release
      ball: { position: [0.35, 1.5, 0], visible: true },
      body: { rotation: [0.4, 0, 0], lean: 0.4 }
    },
    
    // 🎯 REALISTIC BOWLING ACTION
    fastBowling: {
      duration: 1200, // 1.2 seconds for realistic fast bowling action
      releasePoint: 0.4, // Ball released at 40% of animation (0.48 seconds)
      keyframes: [
        // Wind-up (0-20%)
        { time: 0, arm: { rotation: [-2.0, 0.2, 0] }, body: { rotation: [0.4, 0, 0], lean: 0.4 }, ball: { visible: true } },
        // Pre-delivery (20-40%) - Ball still in hand
        { time: 0.3, arm: { rotation: [-0.5, 0.1, 0] }, body: { rotation: [0.2, 0, 0], lean: 0.2 }, ball: { visible: true } },
        // RELEASE POINT (40%) - Ball released here!
        { time: 0.4, arm: { rotation: [0, 0, 0] }, body: { rotation: [0, 0, 0], lean: 0 }, ball: { visible: false } },
        // Follow-through (40-70%)
        { time: 0.7, arm: { rotation: [2.0, -0.1, 0] }, body: { rotation: [-0.2, 0, 0], lean: -0.1 }, ball: { visible: false } },
        // Recovery (70-100%)
        { time: 1, arm: { rotation: [0.5, 0, 0.3] }, body: { rotation: [0, 0, 0], lean: 0 }, ball: { visible: false } }
      ]
    },
    
    // 🌀 SPIN BOWLING ACTION
    spinBowling: {
      duration: 1800, // Slower action for spin bowling
      releasePoint: 0.45,
      keyframes: [
        { time: 0, arm: { rotation: [-1.5, 0.5, 0] }, body: { rotation: [0.3, 0.2, 0] }, ball: { visible: true } },
        { time: 0.35, arm: { rotation: [-0.3, 0.3, 0] }, body: { rotation: [0.1, 0.1, 0] }, ball: { visible: true } },
        { time: 0.45, arm: { rotation: [0.2, 0, 0] }, body: { rotation: [0, 0, 0] }, ball: { visible: false } },
        { time: 0.75, arm: { rotation: [1.8, -0.3, 0] }, body: { rotation: [-0.1, -0.1, 0] }, ball: { visible: false } },
        { time: 1, arm: { rotation: [0.3, 0, 0.3] }, body: { rotation: [0, 0, 0] }, ball: { visible: false } }
      ]
    },
    
    // 🏃‍♂️ FOLLOW THROUGH AND FINISH
    followThrough: {
      duration: 1000,
      keyframes: [
        { time: 0, arm: { rotation: [0.5, 0, 0.3] }, body: { rotation: [0, 0, 0] } },
        { time: 0.4, arm: { rotation: [0.2, 0, 0.2] }, body: { rotation: [-0.1, 0, 0] } },
        { time: 1, arm: { rotation: [0, 0, 0.3] }, body: { rotation: [0, 0, 0] } }
      ]
    },
    
    // 🏃‍♂️ RETURN TO ORIGINAL POSITION - Dynamic distance based on actual run-up
    returnToPosition: {
      duration: 2000, // 2 seconds to walk back
      fromDistance: 'dynamic', // Will be calculated from actual follow-through distance
      toDistance: 0 // Back to original position
    }
  };

  // 🏏 REALISTIC BOWLING ANIMATION SYSTEM
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // 🎬 ANIMATION STATE MANAGEMENT - Start sequence only ONCE per bowling action
    const shouldStartBowlingSequence = gameState?.bowlingSequenceActive && !sequenceStarted && currentAnimation === 'idle';
    
    if (shouldStartBowlingSequence) {
      console.log(`🏏 🏏 🏏 STARTING COMPLETE BOWLING SEQUENCE (ONCE ONLY) 🏏 🏏 🏏`);
      setCurrentAnimation('runUp');
      setAnimationStartTime(state.clock.elapsedTime);
      setAnimationProgress(0);
      setBallReleased(false);
      setIsAtReleasePoint(false);
      setRunUpDistance(0);
      setOriginalPosition(position);
      setSequenceStarted(true); // 🚨 CRITICAL: Mark sequence as started
    }

    const currentTime = state.clock.elapsedTime;
    const animationElapsed = currentTime - animationStartTime;
    const anim = bowlingAnimations[currentAnimation] || bowlingAnimations.idle;
    const progress = Math.min(animationElapsed / (anim.duration / 1000), 1);
    setAnimationProgress(progress);

    // 😴 IDLE STATE - Ball always visible and positioned
    if (currentAnimation === 'idle') {
      if (ballRef.current) {
        ballRef.current.visible = true;
      }
      // Reset body and arm positions
      if (bodyRef.current) {
        bodyRef.current.rotation.x = 0;
      }
      if (armRef.current) {
        armRef.current.rotation.set(0, 0, 0.3);
      }
      
      // 🚨 CRITICAL: Reset sequence flag if bowling sequence is no longer active
      if (!gameState?.bowlingSequenceActive && sequenceStarted) {
        console.log('🔄 Resetting sequence flag - bowling sequence deactivated');
        setSequenceStarted(false);
      }
    }

    // 🏃‍♂️ REALISTIC RUN-UP ANIMATION - Dynamic distance to actual release position
    if (currentAnimation === 'runUp' && anim.phases) {
      // 🎯 CALCULATE DYNAMIC RUN-UP DISTANCE based on actual release position
      const releaseZ = gameState?.pendingBallData?.pitchAnalysis?.line_axis?.z || 
                       gameState?.controls?.bowling?.release_z || 11.5;
      const originalBowlerZ = 15; // Bowler's starting position
      const targetRunDistance = originalBowlerZ - releaseZ; // Distance to run (e.g., 15 - 11.5 = 3.5m)
      
      console.log(`🏃‍♂️ Dynamic run-up: ${targetRunDistance.toFixed(1)}m to release position Z=${releaseZ}`);
      
      // Find current phase
      let currentPhase = anim.phases[0];
      let nextPhase = anim.phases[1] || anim.phases[0];
      
      for (let i = 0; i < anim.phases.length - 1; i++) {
        if (progress >= anim.phases[i].time && progress <= anim.phases[i + 1].time) {
          currentPhase = anim.phases[i];
          nextPhase = anim.phases[i + 1];
          break;
        }
      }
      
      // Interpolate run-up distance and body lean
      const phaseProgress = (progress - currentPhase.time) / (nextPhase.time - currentPhase.time) || 0;
      
      // 🎯 DYNAMIC DISTANCE: Scale phase distances by actual required distance
      const phaseDistance = currentPhase.distance + (nextPhase.distance - currentPhase.distance) * phaseProgress;
      const actualDistance = phaseDistance * targetRunDistance; // Scale by target distance
      
      const lean = currentPhase.body.lean + (nextPhase.body.lean - currentPhase.body.lean) * phaseProgress;
      
      setRunUpDistance(actualDistance);
      
      // Apply body lean during run-up
      if (bodyRef.current) {
        bodyRef.current.rotation.x = lean;
      }
      
      // Realistic leg movement during run-up
      const stepTime = animationElapsed * anim.stepFrequency;
      const leftLegRotation = Math.sin(stepTime) * 0.8;
      const rightLegRotation = Math.sin(stepTime + Math.PI) * 0.8;
      
      if (legLeftRef.current) legLeftRef.current.rotation.x = leftLegRotation;
      if (legRightRef.current) legRightRef.current.rotation.x = rightLegRotation;
    }

    // 🛑 AT RELEASE POINT - Bowler stops and prepares for IMMEDIATE ball release
    if (currentAnimation === 'atReleasePoint') {
      // Stop all leg movement
      if (legLeftRef.current) legLeftRef.current.rotation.x = 0;
      if (legRightRef.current) legRightRef.current.rotation.x = 0;
      
      // Maintain delivery position
      if (bodyRef.current) {
        bodyRef.current.rotation.x = 0.4;
      }
      
      // 🏏 CRITICAL: Ball at ACTUAL release point - ready for immediate release
      if (ballRef.current && !ballReleased) {
        ballRef.current.visible = true;
        // Ball is at the actual release point based on data
        const releaseZ = gameState?.pendingBallData?.pitchAnalysis?.line_axis?.z || 
                         gameState?.controls?.bowling?.release_z || 11.5;
        const actualRunDistance = 15 - releaseZ;
        ballRef.current.position.z = -actualRunDistance;
        
        console.log(`🎯 Ball positioned at ACTUAL release point: Z = -${actualRunDistance.toFixed(1)}m (Release Z=${releaseZ})`);
      } else if (ballRef.current && ballReleased) {
        // Ball already released, hide it
        ballRef.current.visible = false;
      }
    }

    // 🎯 REALISTIC BOWLING ACTION ANIMATION
    const bowlingActionAnim = bowlingType === 'spin' ? bowlingAnimations.spinBowling : bowlingAnimations.fastBowling;
    if ((currentAnimation === 'bowling' || currentAnimation === 'fastBowling' || currentAnimation === 'spinBowling') && armRef.current) {
      
      // Find current keyframe
      let currentFrame = bowlingActionAnim.keyframes[0];
      let nextFrame = bowlingActionAnim.keyframes[1] || bowlingActionAnim.keyframes[0];
      
      for (let i = 0; i < bowlingActionAnim.keyframes.length - 1; i++) {
        if (progress >= bowlingActionAnim.keyframes[i].time && progress <= bowlingActionAnim.keyframes[i + 1].time) {
          currentFrame = bowlingActionAnim.keyframes[i];
          nextFrame = bowlingActionAnim.keyframes[i + 1];
          break;
        }
      }
      
      // Interpolate bowling action
      const frameProgress = (progress - currentFrame.time) / (nextFrame.time - currentFrame.time) || 0;
      
      // Arm rotation
      if (currentFrame.arm && nextFrame.arm) {
        const armRotX = currentFrame.arm.rotation[0] + (nextFrame.arm.rotation[0] - currentFrame.arm.rotation[0]) * frameProgress;
        const armRotY = currentFrame.arm.rotation[1] + (nextFrame.arm.rotation[1] - currentFrame.arm.rotation[1]) * frameProgress;
        const armRotZ = currentFrame.arm.rotation[2] + (nextFrame.arm.rotation[2] - currentFrame.arm.rotation[2]) * frameProgress;
        armRef.current.rotation.set(armRotX, armRotY, armRotZ);
      }
      
      // Body rotation
      if (currentFrame.body && nextFrame.body && bodyRef.current) {
        const bodyRotX = currentFrame.body.rotation[0] + (nextFrame.body.rotation[0] - currentFrame.body.rotation[0]) * frameProgress;
        const bodyRotY = currentFrame.body.rotation[1] + (nextFrame.body.rotation[1] - currentFrame.body.rotation[1]) * frameProgress;
        const bodyRotZ = currentFrame.body.rotation[2] + (nextFrame.body.rotation[2] - currentFrame.body.rotation[2]) * frameProgress;
        bodyRef.current.rotation.set(bodyRotX, bodyRotY, bodyRotZ);
      }
      
      // 🎯 BALL RELEASE TIMING - Realistic release point
      // 🎯 BALL ALREADY RELEASED AT RELEASE POINT - No action needed during bowling animation
      // This is just the arm follow-through animation, ball was released earlier
      
      // Control ball visibility based on release state
      if (ballRef.current) {
        ballRef.current.visible = !ballReleased;
      }
    }

    // 🏃‍♂️ FOLLOW THROUGH ANIMATION
    if (currentAnimation === 'followThrough' && anim.keyframes && armRef.current) {
      const keyframes = anim.keyframes;
      let currentFrame = keyframes[0];
      let nextFrame = keyframes[1] || keyframes[0];
      
      for (let i = 0; i < keyframes.length - 1; i++) {
        if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
          currentFrame = keyframes[i];
          nextFrame = keyframes[i + 1];
          break;
        }
      }
      
      const frameProgress = (progress - currentFrame.time) / (nextFrame.time - currentFrame.time) || 0;
      
      if (currentFrame.arm && nextFrame.arm) {
        const armRotX = currentFrame.arm.rotation[0] + (nextFrame.arm.rotation[0] - currentFrame.arm.rotation[0]) * frameProgress;
        const armRotY = currentFrame.arm.rotation[1] + (nextFrame.arm.rotation[1] - currentFrame.arm.rotation[1]) * frameProgress;
        const armRotZ = currentFrame.arm.rotation[2] + (nextFrame.arm.rotation[2] - currentFrame.arm.rotation[2]) * frameProgress;
        armRef.current.rotation.set(armRotX, armRotY, armRotZ);
      }
      
      // 🏏 CRITICAL: Bowler continues past release point during follow-through
      const releaseZ = gameState?.pendingBallData?.pitchAnalysis?.line_axis?.z || 
                       gameState?.controls?.bowling?.release_z || 11.5;
      const releaseDistance = 15 - releaseZ; // Distance to release point
      const followThroughDistance = releaseDistance + (progress * 3); // Continue 3m past release point
      setRunUpDistance(followThroughDistance);
      
      console.log(`🏃‍♂️ Follow-through: Bowler at ${followThroughDistance.toFixed(1)}m (past release point Z=${releaseZ})`);
      
      // Update ball position if still visible (shouldn't be, but safety check)
      if (ballRef.current && ballRef.current.visible) {
        ballRef.current.position.z = 0 - followThroughDistance;
      }
    }

    // 🔄 PROPER BOWLING SEQUENCE TRANSITIONS
    if (progress >= 1) {
      if (currentAnimation === 'runUp') {
        // 🛑 STOP AT RELEASE POINT
        console.log('🛑 Bowler reached release point - stopping for delivery');
        setCurrentAnimation('atReleasePoint');
        setAnimationStartTime(currentTime);
        setAnimationProgress(0);
        setIsAtReleasePoint(true);
      } else if (currentAnimation === 'atReleasePoint') {
        // 🎯 BALL RELEASE AT RELEASE POINT - IMMEDIATE!
        console.log('🎯🎯🎯 RELEASING BALL NOW - AT RELEASE POINT! 🎯🎯🎯');
        
        if (!ballReleased && onBallRelease) {
          setBallReleased(true);
          console.log('🚨 Calling onBallRelease callback FROM RELEASE POINT');
          
          // 🚨 CRITICAL: Hide visual ball IMMEDIATELY before releasing game ball
          if (ballRef.current) {
            ballRef.current.visible = false;
            console.log('👻 Visual ball hidden - game ball will appear');
          }
          
          onBallRelease();
        }
        
        // Now continue to bowling action
        console.log('🎯 Starting bowling action AFTER ball release');
        setCurrentAnimation(bowlingType === 'spin' ? 'spinBowling' : 'fastBowling');
        setAnimationStartTime(currentTime);
        setAnimationProgress(0);
      } else if (currentAnimation === 'fastBowling' || currentAnimation === 'spinBowling') {
        // 🏃‍♂️ FOLLOW THROUGH
        console.log('🏃‍♂️ Starting follow-through');
        setCurrentAnimation('followThrough');
        setAnimationStartTime(currentTime);
        setAnimationProgress(0);
      } else if (currentAnimation === 'followThrough') {
        // 🔙 RETURN TO ORIGINAL POSITION
        console.log('🔙 Returning to original position');
        setCurrentAnimation('returnToPosition');
        setAnimationStartTime(currentTime);
        setAnimationProgress(0);
      } else if (currentAnimation === 'returnToPosition') {
        // 😴 BACK TO IDLE - Complete reset
        console.log('😴 🏏 BOWLING SEQUENCE COMPLETE - Bowler back to idle position');
        setCurrentAnimation('idle');
        setAnimationStartTime(currentTime);
        setAnimationProgress(0);
        setBallReleased(false);
        setIsAtReleasePoint(false);
        setRunUpDistance(0);
        setSequenceStarted(false); // 🚨 CRITICAL: Reset sequence flag for next delivery
        
        // Show ball again for next delivery
        if (ballRef.current) {
          ballRef.current.visible = true;
        }
      }
    }

    // 🔙 RETURN TO POSITION ANIMATION - Dynamic distance based on actual release point
    if (currentAnimation === 'returnToPosition') {
      const returnAnim = bowlingAnimations.returnToPosition;
      
      // Calculate actual distances based on release position
      const releaseZ = gameState?.pendingBallData?.pitchAnalysis?.line_axis?.z || 
                       gameState?.controls?.bowling?.release_z || 11.5;
      const releaseDistance = 15 - releaseZ; // Distance to release point
      const maxFollowThroughDistance = releaseDistance + 3; // Max distance after follow-through
      
      const returnProgress = progress;
      const newDistance = maxFollowThroughDistance - (maxFollowThroughDistance * returnProgress);
      setRunUpDistance(newDistance);
      
      console.log(`🚶‍♂️ Walking back: ${newDistance.toFixed(1)}m remaining (to original position)`);
      
      // Slow walking animation during return
      const walkTime = animationElapsed * 3; // Slower pace for walking back
      const leftLegRotation = Math.sin(walkTime) * 0.3;
      const rightLegRotation = Math.sin(walkTime + Math.PI) * 0.3;
      
      if (legLeftRef.current) legLeftRef.current.rotation.x = leftLegRotation;
      if (legRightRef.current) legRightRef.current.rotation.x = rightLegRotation;
    }
  });

  return (
    <group position={[position[0], position[1], position[2] - runUpDistance]}>
      <group ref={meshRef}>
        {/* Head */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Cap */}
        <mesh position={[0, 1.78, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.1, 16]} />
          <meshLambertMaterial color="#00AA00" />
        </mesh>
        
        {/* Body with ref for animation */}
        <group ref={bodyRef} position={[0, 1.2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
            <meshLambertMaterial color="#00AA00" />
          </mesh>
        </group>
        
        {/* Bowling arm (right arm) */}
        <group ref={armRef} position={[0.3, 1.4, 0]}>
          <mesh rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
            <meshLambertMaterial color="#FDB5A6" />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.35, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshLambertMaterial color="#FDB5A6" />
          </mesh>
        </group>
        
        {/* Other arm (left arm) */}
        <mesh position={[-0.3, 1.3, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Left Leg with animation ref */}
        <group ref={legLeftRef} position={[-0.1, 0.4, 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
        </group>
        
        {/* Right Leg with animation ref */}
        <group ref={legRightRef} position={[0.1, 0.4, 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
        </group>
        
        {/* Ball in hand - follows bowler during run-up */}
        <mesh ref={ballRef} position={[0.35, 1.5, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshLambertMaterial color="#CC0000" />
        </mesh>
        
        {/* Shoes */}
        <mesh position={[-0.1, 0.02, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.25]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
        <mesh position={[0.1, 0.02, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.25]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
      </group>
    </group>
  );
};

// Enhanced Wicket Keeper Component
export const AnimatedWicketKeeper = ({ 
  position = [0, 0, 0], 
  animation = null,
  gameState = null 
}) => {
  const meshRef = useRef();
  const glovesRef = useRef();
  const [currentAnimation, setCurrentAnimation] = useState('ready');

  const keeperAnimations = {
    ready: {
      duration: 2000,
      body: { position: [0, 0.8, 0], rotation: [0, 0, 0] },
      gloves: { position: [0, 1.2, 0] }
    },
    diving: {
      duration: 800,
      keyframes: [
        { time: 0, body: { position: [0, 0.8, 0], rotation: [0, 0, 0] } },
        { time: 0.3, body: { position: [0.5, 0.4, 0], rotation: [0, 0, 0.5] } },
        { time: 0.7, body: { position: [1, 0.2, 0], rotation: [0, 0, 1] } },
        { time: 1, body: { position: [0, 0.8, 0], rotation: [0, 0, 0] } }
      ]
    },
    collecting: {
      duration: 600,
      keyframes: [
        { time: 0, gloves: { position: [0, 1.2, 0] } },
        { time: 0.5, gloves: { position: [0, 0.8, -0.3] } },
        { time: 1, gloves: { position: [0, 1.2, 0] } }
      ]
    }
  };

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (animation && animation !== currentAnimation) {
      setCurrentAnimation(animation);
    }

    // Simple ready stance animation
    if (currentAnimation === 'ready') {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = 0.8 + Math.sin(time * 2) * 0.05;
    }
  });

  return (
    <group position={position}>
      <group ref={meshRef} position={[0, 0.8, 0]}>
        {/* Head */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
          <meshLambertMaterial color="#FFFF00" />
        </mesh>
        
        {/* Gloves */}
        <group ref={glovesRef}>
          <mesh position={[-0.35, 1.3, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0.35, 1.3, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
        </group>
        
        {/* Legs (in ready position) */}
        <mesh position={[-0.15, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.15, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Pads */}
        <mesh position={[-0.15, 0.4, 0.08]}>
          <boxGeometry args={[0.15, 0.7, 0.1]} />
          <meshLambertMaterial color="#E0E0E0" />
        </mesh>
        <mesh position={[0.15, 0.4, 0.08]}>
          <boxGeometry args={[0.15, 0.7, 0.1]} />
          <meshLambertMaterial color="#E0E0E0" />
        </mesh>
      </group>
    </group>
  );
};

// Enhanced Fielder Component
export const AnimatedFielder = ({ 
  position = [0, 0, 0], 
  animation = null,
  teamColor = "#0000FF",
  gameState = null 
}) => {
  const meshRef = useRef();
  const [currentAnimation, setCurrentAnimation] = useState('idle');

  const fielderAnimations = {
    idle: { body: { rotation: [0, 0, 0] } },
    running: { body: { rotation: [0.1, 0, 0] } },
    catching: {
      duration: 800,
      keyframes: [
        { time: 0, arms: { rotation: [0, 0, 0] } },
        { time: 0.3, arms: { rotation: [-0.5, 0.5, 0] } },
        { time: 0.6, arms: { rotation: [0.2, -0.2, 0] } },
        { time: 1, arms: { rotation: [0, 0, 0] } }
      ]
    },
    throwing: {
      duration: 1000,
      keyframes: [
        { time: 0, arm: { rotation: [0, 0, 0] } },
        { time: 0.3, arm: { rotation: [-1.2, 0, 0] } },
        { time: 0.6, arm: { rotation: [1.5, 0, 0] } },
        { time: 1, arm: { rotation: [0, 0, 0] } }
      ]
    }
  };

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (animation && animation !== currentAnimation) {
      setCurrentAnimation(animation);
    }

    // Simple idle animation
    if (currentAnimation === 'idle') {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
    }
  });

  return (
    <group position={position}>
      <group ref={meshRef}>
        {/* Head */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
          <meshLambertMaterial color={teamColor} />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.3, 1.3, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        <mesh position={[0.3, 1.3, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.1, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshLambertMaterial color={teamColor} />
        </mesh>
        <mesh position={[0.1, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshLambertMaterial color={teamColor} />
        </mesh>
      </group>
    </group>
  );
};