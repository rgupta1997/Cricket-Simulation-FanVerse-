import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PlayerModel from './players/PlayerModel';
import Lighting from './Lighting';

const PlayerTest = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Ground plane for reference */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#2d5016" />
        </mesh>

        {/* Grid helper */}
        <gridHelper args={[20, 20, '#666666', '#444444']} />

        {/* Test player model */}
        <PlayerModel 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]} 
          scale={0.5}
        />

        {/* Camera controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 1, 0]}
        />
      </Canvas>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <h3>Player Model Test</h3>
        <p>- Left click + drag to rotate</p>
        <p>- Right click + drag to pan</p>
        <p>- Scroll to zoom</p>
      </div>
    </div>
  );
};

export default PlayerTest;
