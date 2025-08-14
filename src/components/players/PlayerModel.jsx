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

  // Always show the debug markers
  const DebugMarkers = () => (
    <>
      {/* Origin marker */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="red" />
      </mesh>
      
      {/* Height marker */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="blue" />
      </mesh>
      
      {/* Forward direction marker */}
      <mesh position={[0, 0.5, 0.5]}>
        <coneGeometry args={[0.1, 0.2]} />
        <meshBasicMaterial color="green" />
      </mesh>
    </>
  );

  if (error) {
    console.error("Failed to load player model:", error);
    return (
      <group position={position}>
        <DebugMarkers />
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="red" wireframe />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      <DebugMarkers />
      
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
          <meshStandardMaterial color="yellow" wireframe />
        </mesh>
      )}
    </group>
  );
};

export default PlayerModel;