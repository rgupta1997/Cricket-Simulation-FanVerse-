/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const RunGraphics = ({ 
  runsScored = null, 
  isVisible = false, 
  onAnimationComplete,
  position = [0, 15, 0] // High above the pitch for visibility
}) => {
  const groupRef = useRef();
  const [animationPhase, setAnimationPhase] = useState('enter'); // enter, peak, exit
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [bounce, setBounce] = useState(0);
  const [sparkles, setSparkles] = useState([]);
  
  // Animation timing
  const animationDuration = 3000; // 3 seconds total
  const enterDuration = 800; // 0.8 seconds to enter
  const peakDuration = 1400; // 1.4 seconds at peak
  const exitDuration = 800; // 0.8 seconds to exit
  
  const startTime = useRef(null);

  // Get run type styling
  const getRunStyling = (runs) => {
    switch(runs) {
      case 0:
        return {
          text: "DOT BALL",
          color: "#ef4444", // Red
          size: 2.5,
          glowColor: "#fee2e2",
          intensity: 0.5,
          sparkleCount: 3,
          effects: ['shake']
        };
      case 1:
        return {
          text: "SINGLE",
          color: "#22c55e", // Green
          size: 3,
          glowColor: "#dcfce7",
          intensity: 0.7,
          sparkleCount: 5,
          effects: ['glow']
        };
      case 2:
        return {
          text: "DOUBLE",
          color: "#3b82f6", // Blue
          size: 3.5,
          glowColor: "#dbeafe",
          intensity: 0.8,
          sparkleCount: 8,
          effects: ['glow', 'pulse']
        };
      case 3:
        return {
          text: "THREE RUNS",
          color: "#f59e0b", // Amber
          size: 4,
          glowColor: "#fef3c7",
          intensity: 0.9,
          sparkleCount: 12,
          effects: ['glow', 'pulse', 'rotate']
        };
      case 4:
        return {
          text: "FOUR!",
          color: "#10b981", // Emerald
          size: 5,
          glowColor: "#d1fae5",
          intensity: 1.2,
          sparkleCount: 20,
          effects: ['glow', 'pulse', 'rotate', 'bounce']
        };
      case 6:
        return {
          text: "SIX!!!",
          color: "#f97316", // Orange
          size: 6,
          glowColor: "#fed7aa",
          intensity: 1.5,
          sparkleCount: 30,
          effects: ['glow', 'pulse', 'rotate', 'bounce', 'explode']
        };
      default:
        return {
          text: `${runs} RUNS`,
          color: "#8b5cf6", // Purple
          size: 4,
          glowColor: "#ede9fe",
          intensity: 1.0,
          sparkleCount: 15,
          effects: ['glow', 'pulse']
        };
    }
  };

  // Create sparkle particles
  const createSparkles = (count) => {
    const newSparkles = [];
    for (let i = 0; i < count; i++) {
      newSparkles.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2
        ],
        velocity: [
          (Math.random() - 0.5) * 0.2,
          Math.random() * 0.1 + 0.05,
          (Math.random() - 0.5) * 0.2
        ],
        life: 1.0,
        size: Math.random() * 0.3 + 0.1
      });
    }
    setSparkles(newSparkles);
  };

  // Reset animation when new run is scored
  useEffect(() => {
    if (isVisible && runsScored !== null) {
      setAnimationPhase('enter');
      setScale(0);
      setOpacity(1);
      setRotation(0);
      setBounce(0);
      startTime.current = Date.now();
      
      const styling = getRunStyling(runsScored);
      createSparkles(styling.sparkleCount);
    }
  }, [isVisible, runsScored]);

  // Main animation loop
  useFrame((state, delta) => {
    if (!isVisible || !startTime.current || !groupRef.current) return;

    const elapsed = Date.now() - startTime.current;
    const styling = getRunStyling(runsScored);
    
    // Update sparkles
    setSparkles(prevSparkles => 
      prevSparkles.map(sparkle => ({
        ...sparkle,
        position: [
          sparkle.position[0] + sparkle.velocity[0],
          sparkle.position[1] + sparkle.velocity[1],
          sparkle.position[2] + sparkle.velocity[2]
        ],
        velocity: [
          sparkle.velocity[0] * 0.98,
          sparkle.velocity[1] - 0.002, // Gravity
          sparkle.velocity[2] * 0.98
        ],
        life: sparkle.life - delta * 0.5
      })).filter(sparkle => sparkle.life > 0)
    );

    // Phase transitions
    if (elapsed < enterDuration) {
      // ENTER PHASE
      setAnimationPhase('enter');
      const progress = elapsed / enterDuration;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setScale(easeOut * 1.2); // Overshoot slightly
      setOpacity(progress);
      
      if (styling.effects.includes('rotate')) {
        setRotation(progress * Math.PI * 4);
      }
      
    } else if (elapsed < enterDuration + peakDuration) {
      // PEAK PHASE
      setAnimationPhase('peak');
      const progress = (elapsed - enterDuration) / peakDuration;
      
      // Settle to normal scale
      setScale(1.2 - (progress * 0.2));
      
      // Pulsing effect
      if (styling.effects.includes('pulse')) {
        const pulse = Math.sin(progress * Math.PI * 8) * 0.1 + 1;
        setScale((1.2 - (progress * 0.2)) * pulse);
      }
      
      // Bouncing effect
      if (styling.effects.includes('bounce')) {
        const bouncePhase = (progress * 6) % 1;
        const bounceHeight = Math.sin(bouncePhase * Math.PI) * 2;
        setBounce(bounceHeight);
      }
      
      // Continuous rotation
      if (styling.effects.includes('rotate')) {
        setRotation(Math.PI * 4 + progress * Math.PI * 4);
      }
      
    } else if (elapsed < animationDuration) {
      // EXIT PHASE
      setAnimationPhase('exit');
      const progress = (elapsed - enterDuration - peakDuration) / exitDuration;
      
      setScale(1 - progress);
      setOpacity(1 - progress);
      
      // Final rotation burst for special shots
      if (styling.effects.includes('explode')) {
        setRotation(Math.PI * 8 + progress * Math.PI * 8);
      }
      
    } else {
      // Animation complete
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }

    // Apply transformations to group
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.z = rotation;
      groupRef.current.position.y = position[1] + bounce;
    }
  });

  if (!isVisible || runsScored === null) return null;

  const styling = getRunStyling(runsScored);

  return (
    <group ref={groupRef} position={position}>
      {/* Main text with glow effect */}
      <Text
        fontSize={styling.size}
        color={styling.color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Arial-Bold.ttf"
        outlineWidth={0.1}
        outlineColor={styling.glowColor}
        material-transparent={true}
        material-opacity={opacity}
      >
        {styling.text}
      </Text>
      
      {/* Background glow */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[styling.size * 2, styling.size * 0.5]} />
        <meshBasicMaterial 
          color={styling.color}
          transparent={true}
          opacity={opacity * 0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Sparkle effects */}
      {sparkles.map(sparkle => (
        <mesh key={sparkle.id} position={sparkle.position}>
          <sphereGeometry args={[sparkle.size, 8, 8]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent={true}
            opacity={sparkle.life * opacity}
            emissive="#ffffff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      {/* Special effects for boundaries */}
      {(runsScored === 4 || runsScored === 6) && (
        <group>
          {/* Radiating lines for FOUR */}
          {runsScored === 4 && Array.from({length: 8}).map((_, i) => (
            <mesh 
              key={i} 
              position={[0, 0, -0.2]}
              rotation={[0, 0, (i * Math.PI * 2) / 8 + rotation]}
            >
              <planeGeometry args={[0.2, 4]} />
              <meshBasicMaterial 
                color={styling.color}
                transparent={true}
                opacity={opacity * 0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
          
          {/* Explosion rings for SIX */}
          {runsScored === 6 && Array.from({length: 3}).map((_, i) => (
            <mesh 
              key={i} 
              position={[0, 0, -0.3]}
              rotation={[0, 0, rotation * (i + 1)]}
            >
              <ringGeometry args={[2 + i, 2.5 + i, 16]} />
              <meshBasicMaterial 
                color={styling.color}
                transparent={true}
                opacity={opacity * (0.4 - i * 0.1)}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Point light for dramatic effect */}
      <pointLight
        position={[0, 0, 2]}
        intensity={styling.intensity * opacity}
        color={styling.color}
        distance={15}
        decay={2}
      />
    </group>
  );
};

export default RunGraphics;
