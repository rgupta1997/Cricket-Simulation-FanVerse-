import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls } from '@react-three/drei';
import Stadium from './components/Stadium';
import Lighting from './components/Lighting';
import CricketCamera from './components/Camera';
import UI from './components/UI';
import GameUI from './components/GameUI';
import { useCameraControls } from './hooks/useCameraControls';

// Pure component for the 3D scene
const Scene = ({ currentView, onGameStateChange }) => {
  return (
    <>
      {/* Camera with current view */}
      <CricketCamera view={currentView} />
      
      {/* Stadium lighting */}
      <Lighting intensity={1.2} />
      
      {/* Main stadium with game state callback */}
      <Stadium onGameStateChange={onGameStateChange} />
      
      {/* Fog for atmospheric effect */}
      <fog attach="fog" args={['#202020', 40, 80]} />
      
      {/* Performance stats (can be removed in production) */}
      <Stats />
    </>
  );
};

// Main App component following functional programming principles
const App = () => {
  // Use the camera controls hook
  const { currentView, availableViews } = useCameraControls();
  
  // Game state for UI display
  const [gameData, setGameData] = React.useState(null);
  
  // Handle game state changes from the cricket game
  const handleGameStateChange = React.useCallback((newGameData) => {
    setGameData(newGameData);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* UI overlay */}
      <UI 
        currentView={currentView} 
        availableViews={availableViews}
        showGameInstructions={true} 
      />
      
      {/* Game UI overlay - rendered outside Canvas */}
      <GameUI gameData={gameData} />
      
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
        camera={{ position: currentView.position, fov: currentView.fov }}
        onCreated={({ gl }) => {
          gl.setClearColor('#1a1a1a');
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = 2; // PCFSoftShadowMap
        }}
      >
        <Scene 
          currentView={currentView} 
          onGameStateChange={handleGameStateChange}
        />
      </Canvas>
    </div>
  );
};

export default App;