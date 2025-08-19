/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Stadium from './Stadium';

const EmbeddedSimulator = ({ matchId, onExpand }) => {
  const handleExpand = () => {
    if (onExpand) {
      onExpand();
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '40vh',
      minHeight: '300px',
      backgroundColor: '#000',
      marginBottom: '20px'
    }}>
      {/* Simulator Container */}
      <div style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        <Canvas
          camera={{ 
            position: [30, 30, 30], 
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          shadows
        >
          <ambientLight args={[0xffffff, 0.5]} />
          <directionalLight 
            args={[0xffffff, 1]}
            position={[10, 10, 5]} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
          />
          <Stadium 
            isEmbedded={true}
            matchId={matchId}
          />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={100}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </div>

      {/* Expand Button */}
      <button
        onClick={handleExpand}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '2px solid white',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(4px)',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 13V11H13V13H3ZM3 8.5V6.5H13V8.5H3ZM3 4V2H13V4H3Z" fill="currentColor"/>
        </svg>
        Expand Simulator
      </button>
    </div>
  );
};

export default EmbeddedSimulator;
