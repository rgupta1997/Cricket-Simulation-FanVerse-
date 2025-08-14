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

// Enhanced Animated Bowler Component
export const AnimatedBowler = ({ 
  position = [0, 0, 0], 
  animation = null,
  bowlingType = 'fast',
  gameState = null 
}) => {
  const meshRef = useRef();
  const armRef = useRef();
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [runUpDistance, setRunUpDistance] = useState(0);

  const bowlingAnimations = {
    idle: {
      duration: 3000,
      arm: { rotation: [0, 0, 0] },
      body: { rotation: [0, 0, 0] }
    },
    runUp: {
      duration: 2000,
      keyframes: [
        { time: 0, body: { position: [0, 1, 0] }, legs: { rotation: [0, 0, 0] } },
        { time: 0.25, body: { position: [0, 0.9, 0] }, legs: { rotation: [0.5, 0, 0] } },
        { time: 0.5, body: { position: [0, 1, 0] }, legs: { rotation: [0, 0, 0] } },
        { time: 0.75, body: { position: [0, 0.9, 0] }, legs: { rotation: [-0.5, 0, 0] } },
        { time: 1, body: { position: [0, 1, 0] }, legs: { rotation: [0, 0, 0] } }
      ]
    },
    bowling: {
      duration: 1500,
      keyframes: [
        { time: 0, arm: { rotation: [0, 0, 0] }, body: { rotation: [0, 0, 0] } },
        { time: 0.2, arm: { rotation: [-1.5, 0, 0] }, body: { rotation: [-0.3, 0, 0] } },
        { time: 0.4, arm: { rotation: [0, 0, 0] }, body: { rotation: [0, 0, 0] } },
        { time: 0.6, arm: { rotation: [1.5, 0, 0] }, body: { rotation: [0.3, 0, 0] } },
        { time: 0.8, arm: { rotation: [0.5, 0, 0] }, body: { rotation: [0.1, 0, 0] } },
        { time: 1, arm: { rotation: [0, 0, 0] }, body: { rotation: [0, 0, 0] } }
      ]
    },
    spin: {
      duration: 1800,
      keyframes: [
        { time: 0, arm: { rotation: [0, 0, 0] }, body: { rotation: [0, 0, 0] } },
        { time: 0.3, arm: { rotation: [-1, 0.5, 0] }, body: { rotation: [-0.2, 0.3, 0] } },
        { time: 0.6, arm: { rotation: [1, -0.5, 0] }, body: { rotation: [0.2, -0.3, 0] } },
        { time: 1, arm: { rotation: [0, 0, 0] }, body: { rotation: [0, 0, 0] } }
      ]
    },
    followThrough: {
      duration: 1000,
      keyframes: [
        { time: 0, arm: { rotation: [1.5, 0, 0] }, body: { rotation: [0.3, 0, 0] } },
        { time: 0.5, arm: { rotation: [0.8, 0, 0] }, body: { rotation: [0.1, 0, 0] } },
        { time: 1, arm: { rotation: [0, 0, 0] }, body: { rotation: [0, 0, 0] } }
      ]
    }
  };

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Handle different bowling phases
    if (animation && animation !== currentAnimation) {
      setCurrentAnimation(animation);
    }

    // Animate run-up movement
    if (currentAnimation === 'runUp') {
      setRunUpDistance(prev => Math.min(prev + delta * 5, 10));
    } else if (currentAnimation === 'idle') {
      setRunUpDistance(0);
    }

    // Apply bowling animation
    const anim = bowlingAnimations[currentAnimation] || bowlingAnimations.idle;
    
    if (anim.keyframes && armRef.current) {
      const time = (state.clock.elapsedTime * 1000) % anim.duration;
      const normalizedTime = time / anim.duration;
      
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
      
      // Interpolate arm rotation
      if (currentFrame.arm && nextFrame.arm) {
        const frameProgress = (normalizedTime - currentFrame.time) / (nextFrame.time - currentFrame.time) || 0;
        const armRotX = currentFrame.arm.rotation[0] + (nextFrame.arm.rotation[0] - currentFrame.arm.rotation[0]) * frameProgress;
        const armRotY = currentFrame.arm.rotation[1] + (nextFrame.arm.rotation[1] - currentFrame.arm.rotation[1]) * frameProgress;
        const armRotZ = currentFrame.arm.rotation[2] + (nextFrame.arm.rotation[2] - currentFrame.arm.rotation[2]) * frameProgress;
        
        armRef.current.rotation.set(armRotX, armRotY, armRotZ);
      }
    }
  });

  return (
    <group position={[position[0], position[1], position[2] + runUpDistance]}>
      <group ref={meshRef}>
        {/* Head */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
          <meshLambertMaterial color="#00FF00" />
        </mesh>
        
        {/* Bowling arm */}
        <group ref={armRef} position={[0.3, 1.4, 0]}>
          <mesh rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
            <meshLambertMaterial color="#FDB5A6" />
          </mesh>
        </group>
        
        {/* Other arm */}
        <mesh position={[-0.3, 1.3, 0]} rotation={[0, 0, -0.3]}>
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