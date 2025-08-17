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

// Custom camera component with smooth transitions
const CricketCamera = ({ view, transitionSpeed = 0.05 }) => {
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

  // Update target positions when view changes
  useEffect(() => {
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
  }, [view]);

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

  // Smooth camera animation
  useFrame(() => {
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