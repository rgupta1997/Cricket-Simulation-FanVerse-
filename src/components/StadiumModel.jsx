import React, { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const StadiumModel = ({ visible = true }) => {
  const gltf = useLoader(GLTFLoader, '/cricket_stadium.glb');

  useEffect(() => {
    if (gltf) {
      // Adjust model scale and position if needed
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.position.set(0, 0, 0);
      
      // Rotate stadium to the right (90 degrees clockwise)
      gltf.scene.rotation.y = -Math.PI / 2;
      
      // Apply shadows
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
    }
  }, [gltf]);

  if (!visible || !gltf) return null;

  return <primitive object={gltf.scene} />;
};

export default StadiumModel;
