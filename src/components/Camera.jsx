import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Pure function to smoothly interpolate between two Vector3 objects
const smoothLerp = (current, target, factor) => {
  return current.lerp(target, factor);
};

// Pure function to create target vector from array
const createVector3 = (position) => {
  return new THREE.Vector3(...position);
};

// Enhanced ball following camera logic with dynamic positioning and speed adaptation
const useBallFollowing = (
  cameraRef, 
  controlsRef, 
  ballPosition, 
  isFollowingBall, 
  followConfig = {},
  onDisableFollowing = () => {}
) => {
  const {
    distance = 8.0,
    height = 4.0,
    smoothness = 0.05,
    lookAtBall = true,
    autoFollow = true
  } = followConfig;

  const ballFollowTarget = useRef(new THREE.Vector3());
  const ballLookAtTarget = useRef(new THREE.Vector3());
  const cameraOffset = useRef(new THREE.Vector3(0, height, distance));
  const lastBallPosition = useRef(new THREE.Vector3());
  const ballVelocity = useRef(new THREE.Vector3());
  const currentCameraMode = useRef('default'); // Track camera mode
  const currentCameraAngle = useRef(90); // Track current camera angle (starts at 90°)
  const targetCameraAngle = useRef(90); // Target camera angle for smooth transitions

  // ✅ ENHANCED: Calculate shot angle from striker position
  const calculateShotAngle = (ballPos) => {
    const STRIKER_POS = new THREE.Vector3(0, 0, -9);
    const shotDirection = ballPos.clone().sub(STRIKER_POS);
    // Convert to degrees: 0°=East, 90°=North(keeper), 180°=West, 270°=South(bowler)
    const angle = Math.atan2(-shotDirection.z, shotDirection.x) * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle; // Normalize to 0-360
  };

  // 🎯 DETECT BALL DIRECTION: Check if ball is moving behind current camera
  const isBallMovingBehind = (ballVelocity, currentCameraAngle) => {
    if (ballVelocity.length() < 0.1) return false; // Ball not moving enough
    
    // Calculate ball movement direction in degrees
    const ballDirection = Math.atan2(-ballVelocity.z, ballVelocity.x) * (180 / Math.PI);
    const normalizedBallDirection = ballDirection < 0 ? ballDirection + 360 : ballDirection;
    
    // Calculate angle difference between ball direction and camera position
    const angleDifference = Math.abs(normalizedBallDirection - currentCameraAngle);
    const adjustedDifference = Math.min(angleDifference, 360 - angleDifference);
    
    // If ball is moving more than 90° away from camera view, it's going "behind"
    return adjustedDifference > 90;
  };

  // 📺 CALCULATE OPTIMAL CAMERA ANGLE: Determine best camera position for ball direction
  const calculateOptimalCameraAngle = (ballVelocity, currentAngle) => {
    if (ballVelocity.length() < 0.1) return currentAngle; // Keep current if ball not moving
    
    // Calculate ball movement direction
    const ballDirection = Math.atan2(-ballVelocity.z, ballVelocity.x) * (180 / Math.PI);
    const normalizedBallDirection = ballDirection < 0 ? ballDirection + 360 : ballDirection;
    
    // 🏏 SPECIFIC LEG-SIDE RULE: For shots 225°-330° (leg-side/hook shots), face bowler at 270°
    if (normalizedBallDirection >= 225 && normalizedBallDirection <= 330) {
      console.log(`🏏 Leg-side shot detected (${normalizedBallDirection.toFixed(1)}°) → Camera switching to 270° (facing bowler)`);
      return 270; // Face towards bowler for optimal leg-side shot view
    }
    
    // For other shots, position camera perpendicular to ball movement (90° offset for side-on view)
    // Try both +90° and -90° offsets, choose the one closer to current angle
    const option1 = (normalizedBallDirection + 90) % 360;
    const option2 = (normalizedBallDirection - 90 + 360) % 360;
    
    const diff1 = Math.abs(option1 - currentAngle);
    const diff2 = Math.abs(option2 - currentAngle);
    const adjustedDiff1 = Math.min(diff1, 360 - diff1);
    const adjustedDiff2 = Math.min(diff2, 360 - diff2);
    
    return adjustedDiff1 <= adjustedDiff2 ? option1 : option2;
  };

  // 🏏 CRICKET BROADCAST STYLE: Consistent side-on camera with smart 180° switching
  const getCameraMode = (shotAngle, ballSpeed) => {
    // Always use broadcast-style camera with intelligent angle switching
    return 'broadcast';
  };

  // 🏏 CRICKET BROADCAST CAMERA: Real-world TV-style positioning with smart angle switching
  const calculateCameraPosition = (ballPos, currentAngle, ballSpeed) => {
    const baseDistance = distance;
    const baseHeight = height;
    
    // 📺 BROADCAST STYLE: Use current camera angle for positioning
    const broadcastRad = (currentAngle * Math.PI) / 180;
    
    // Adjust distance slightly based on ball speed for better framing
    const dynamicDistance = baseDistance + (ballSpeed > 10 ? 2 : 0); // Slightly back for fast shots
    
    // Elevated view for better trajectory visibility (like broadcast cameras)
    const elevatedHeight = baseHeight + 3; // Higher position for better coverage
    
    return new THREE.Vector3(
      ballPos.x + Math.cos(broadcastRad) * dynamicDistance, // Dynamic angle positioning
      Math.max(ballPos.y + elevatedHeight, 8), // Elevated view, minimum 8m height
      ballPos.z + Math.sin(broadcastRad) * dynamicDistance  // Side-on positioning
    );
  };

  // Handle manual camera interaction detection - immediately disable following
  useEffect(() => {
    if (!controlsRef.current || !isFollowingBall) return;

    const controls = controlsRef.current;

    const handleStart = () => {
      // Immediately disable ball following when user starts manual interaction
      if (isFollowingBall) {
        onDisableFollowing();
      }
    };

    // Listen for manual camera control start event only
    controls.addEventListener('start', handleStart);

    return () => {
      controls.removeEventListener('start', handleStart);
    };
  }, [isFollowingBall, onDisableFollowing]);

  useFrame(() => {
    // ✅ COMPLETE STOP when ball following is disabled
    if (!isFollowingBall || !ballPosition || !cameraRef.current || !controlsRef.current) {
      return; // Exit immediately - no ball following logic runs
    }

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Convert ball position array to Vector3
    const ballPos = Array.isArray(ballPosition) 
      ? new THREE.Vector3(...ballPosition)
      : new THREE.Vector3(ballPosition.x || 0, ballPosition.y || 0, ballPosition.z || 0);

    // ✅ ENHANCED: Calculate ball velocity and speed for adaptive tracking
    if (lastBallPosition.current.x !== 0 || lastBallPosition.current.z !== 0) {
      ballVelocity.current.subVectors(ballPos, lastBallPosition.current);
    }
    const ballSpeed = ballVelocity.current.length() * 60; // Convert to approximate m/s
    lastBallPosition.current.copy(ballPos);

    // ✅ FIXED: Only use dynamic camera modes when ball is actively moving
    // For stationary ball or start position, always use bowler's angle view
    const isBallMoving = ballSpeed > 0.5; // Only apply dynamic modes when ball is actually moving
    
    let cameraPosition;
    let adaptiveSmoothness = smoothness;
    
    if (isBallMoving) {
      // 📺 CRICKET BROADCAST STYLE with 180° SMART SWITCHING
      currentCameraMode.current = 'broadcast';
      
      // 🎯 CHECK FOR BEHIND BALL MOVEMENT: Implement 180° switch for aesthetic view
      if (isBallMovingBehind(ballVelocity.current, currentCameraAngle.current)) {
        // Calculate optimal camera angle for this ball direction
        const optimalAngle = calculateOptimalCameraAngle(ballVelocity.current, currentCameraAngle.current);
        targetCameraAngle.current = optimalAngle;
        
        console.log(`🔄 Camera 180° switch: ${currentCameraAngle.current.toFixed(1)}° → ${optimalAngle.toFixed(1)}° (Ball behind camera)`);
      }
      
      // 🎥 SMOOTH ANGLE TRANSITION: Aesthetic camera movement like real cricket TV
      const angleDifference = targetCameraAngle.current - currentCameraAngle.current;
      let adjustedDifference = angleDifference;
      
      // Handle 360° wrap-around for smooth transitions
      if (Math.abs(angleDifference) > 180) {
        adjustedDifference = angleDifference > 0 ? angleDifference - 360 : angleDifference + 360;
      }
      
      // Fast angle interpolation for quick, responsive camera switches
      currentCameraAngle.current += adjustedDifference * 0.35; // Much faster camera switching
      
      // Normalize angle to 0-360 range
      if (currentCameraAngle.current < 0) currentCameraAngle.current += 360;
      if (currentCameraAngle.current >= 360) currentCameraAngle.current -= 360;
      
      // Calculate camera position using current smoothly-interpolated angle
      cameraPosition = calculateCameraPosition(ballPos, currentCameraAngle.current, ballSpeed);

      // 🎥 FAST BROADCAST TRACKING: Responsive camera movement for dynamic shots
      adaptiveSmoothness = smoothness * 1.8; // Faster movement for responsive feel
      
    } else {
      // ✅ CONSISTENT START VIEW: Always use bowler's angle view when ball is stationary
      currentCameraMode.current = 'bowler_start';
      
      // Reset camera angles to bowler's position when ball is stationary
      const bowlerAngle = 90; // East direction (behind bowler)
      currentCameraAngle.current = bowlerAngle;
      targetCameraAngle.current = bowlerAngle;
      
      const bowlerRad = (bowlerAngle * Math.PI) / 180;
      
      cameraPosition = new THREE.Vector3(
        ballPos.x + Math.cos(bowlerRad) * distance,
        ballPos.y + height,
        ballPos.z + Math.sin(bowlerRad) * distance
      );
    }

    ballFollowTarget.current.copy(cameraPosition);
    
    // ✅ ENHANCED: Smooth camera movement with adaptive speed
    smoothLerp(camera.position, ballFollowTarget.current, adaptiveSmoothness);
    
    if (lookAtBall) {
      // 📺 BROADCAST LOOK-AT: Smooth ball tracking like real cricket TV
      let lookAtTarget = ballPos.clone();
      
      if (isBallMoving) {
        // 🎥 SLIGHT ANTICIPATION: Look slightly ahead for smooth broadcast feel
        const anticipation = ballVelocity.current.clone().multiplyScalar(0.2);
        lookAtTarget.add(anticipation);
      }
      
      ballLookAtTarget.current.copy(lookAtTarget);
      smoothLerp(controls.target, ballLookAtTarget.current, adaptiveSmoothness);
    }
    
    controls.update();
  });

  // Update camera offset when config changes
  useEffect(() => {
    cameraOffset.current.set(0, height, distance);
  }, [distance, height]);
};

// Custom camera component with smooth transitions and ball following
const CricketCamera = ({ 
  view, 
  transitionSpeed = 0.05, 
  ballPosition = null,
  ballFollowConfig = {},
  isFollowingBall = false,
  onDisableFollowing = () => {}
}) => {
  const cameraRef = useRef();
  const targetPosition = useRef(createVector3(view.position));
  const targetLookAt = useRef(createVector3(view.target));
  const { set } = useThree();

  // Update camera as the default camera
  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
    }
  }, [set]);

  const controlsRef = useRef();
  const isTransitioning = useRef(false);
  const lastManualPosition = useRef(null);
  const lastManualTarget = useRef(null);

  // Initialize ball following functionality
  useBallFollowing(
    cameraRef, 
    controlsRef, 
    ballPosition, 
    isFollowingBall, 
    ballFollowConfig,
    onDisableFollowing
  );

  // Update target positions when view changes (disabled when following ball)
  useEffect(() => {
    // Don't transition to preset views when following ball
    if (isFollowingBall) return;
    
    // Only transition if it's a preset view change (not manual camera movement)
    if (!lastManualPosition.current || !lastManualTarget.current) {
      targetPosition.current = createVector3(view.position);
      targetLookAt.current = createVector3(view.target);
      isTransitioning.current = true;

      // Reset transition after animation completes
      const timeout = setTimeout(() => {
        isTransitioning.current = false;
      }, 1000); // Adjust based on your transition speed

      return () => clearTimeout(timeout);
    }
  }, [view, isFollowingBall]);

  // Handle manual camera movement
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      const handleChange = () => {
        if (!isTransitioning.current && controls.object) {
          lastManualPosition.current = controls.object.position.clone();
          lastManualTarget.current = controls.target.clone();
        }
      };

      controls.addEventListener('change', handleChange);
      return () => controls.removeEventListener('change', handleChange);
    }
  }, []);

  // Smooth camera animation (disabled when following ball)
  useFrame(() => {
    // Skip manual transitions when following ball
    if (isFollowingBall) return;
    
    if (cameraRef.current && controlsRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      
      if (isTransitioning.current) {
        // Smoothly move camera position during transitions
        smoothLerp(camera.position, targetPosition.current, transitionSpeed);
        smoothLerp(controls.target, targetLookAt.current, transitionSpeed);
        controls.update();
        
        // Update camera fov smoothly
        const targetFov = view.fov;
        if (Math.abs(camera.fov - targetFov) > 0.1) {
          camera.fov += (targetFov - camera.fov) * transitionSpeed;
          camera.updateProjectionMatrix();
        }
      }
    }
  });

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={view.position}
        fov={view.fov}
        near={0.1}
        far={100}
      />
      <OrbitControls
        ref={controlsRef}
        camera={cameraRef.current}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        target={view.target}
      />
    </>
  );
};

export default CricketCamera;