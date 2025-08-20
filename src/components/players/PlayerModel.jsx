import React, { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const PlayerModel = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const [error, setError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  console.log("PlayerModel rendering at position:", position);
  
  const gltf = useLoader(
    GLTFLoader, 
    '/player2.glb',
    (loader) => {
      console.log("Loading player model...");
    },
    (error) => {
      console.error("Error loading player model:", error);
      setError(error);
    }
  );

  useEffect(() => {
    if (gltf) {
      console.log("Player model loaded successfully");
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          console.log("Found mesh in model:", {
            name: node.name,
            geometry: node.geometry ? 'present' : 'missing',
            material: node.material ? 'present' : 'missing',
            visible: node.visible
          });
          
          node.castShadow = true;
          node.receiveShadow = true;
          
          if (node.material) {
            node.material.transparent = false;
            node.material.opacity = 1;
            node.material.needsUpdate = true;
            node.material.visible = true;
          }
        }
      });
      setModelLoaded(true);
    }
  }, [gltf]);

  // Debug markers - Hidden in production
  const DebugMarkers = () => (
    <>
      {/* Debug markers removed for clean visual */}
    </>
  );

  if (error) {
    console.error("Failed to load player model:", error);
    return (
      <group position={position}>
        {/* Clean fallback - no debug markers */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#8B4513" wireframe />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      {/* Clean player model - no debug markers */}
      
      {modelLoaded && gltf && (
        <primitive 
          object={gltf.scene.clone()} 
          scale={[scale, scale, scale]}
          rotation={rotation}
          position={[0, 0, 0]}
        />
      )}
      
      {!modelLoaded && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.5]} />
          <meshStandardMaterial color="#8B4513" wireframe />
        </mesh>
      )}
    </group>
  );
};

export default PlayerModel;