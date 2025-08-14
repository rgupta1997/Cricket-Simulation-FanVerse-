import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
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

  // Update target positions when view changes
  useEffect(() => {
    targetPosition.current = createVector3(view.position);
    targetLookAt.current = createVector3(view.target);
  }, [view]);

  // Smooth camera animation
  useFrame(() => {
    if (cameraRef.current) {
      const camera = cameraRef.current;
      
      // Smoothly move camera position
      smoothLerp(camera.position, targetPosition.current, transitionSpeed);
      
      // Smoothly change camera look-at target
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.add(camera.position);
      
      smoothLerp(currentLookAt, targetLookAt.current, transitionSpeed);
      camera.lookAt(currentLookAt);
      
      // Update camera fov smoothly
      const targetFov = view.fov;
      if (Math.abs(camera.fov - targetFov) > 0.1) {
        camera.fov += (targetFov - camera.fov) * transitionSpeed;
        camera.updateProjectionMatrix();
      }
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={view.position}
      fov={view.fov}
      near={0.1}
      far={100}
    />
  );
};

export default CricketCamera;