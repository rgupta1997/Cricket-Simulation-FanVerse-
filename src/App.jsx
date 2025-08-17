/* eslint-disable react/no-unknown-property */
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import Stadium from './components/Stadium';
import Lighting from './components/Lighting';
import CricketCamera from './components/Camera';
import UI from './components/UI';
import GameUI from './components/GameUI';
import Navigation from './components/Navigation';
import PlayerPositionManager from './components/PlayerPositionManager';
import RightDockedPanel from './components/RightDockedPanel';
import { useCameraControls } from './hooks/useCameraControls';
import { createInitialPositions } from './utils/functionalPositionManager';

// Pure component for the 3D scene
const Scene = ({ currentView, onGameStateChange, currentPlayerPositions, isPositionEditorActive }) => {
  return (
    <>
      {/* Camera with current view */}
      <CricketCamera view={currentView} />
      
      {/* Stadium lighting */}
      <Lighting intensity={1.2} />
      
      {/* Main stadium with game state callback */}
      <Stadium 
        onGameStateChange={onGameStateChange} 
        currentPlayerPositions={currentPlayerPositions}
        isPositionEditorActive={isPositionEditorActive}
      />
      
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
  
  // Cricket UI Controls State
  const [cricketUIData, setCricketUIData] = React.useState(null);
  
  // Position Editor State
  const [showPositionEditor, setShowPositionEditor] = React.useState(false);
  const [currentPlayerPositions, setCurrentPlayerPositions] = React.useState(() => {
    return createInitialPositions();
  });

  // Position Editor Callbacks
  const handlePositionsChange = React.useCallback((newPositions) => {
    setCurrentPlayerPositions(newPositions);
  }, []);

  const handleClosePositionEditor = React.useCallback(() => {
    setShowPositionEditor(false);
  }, []);

  const togglePositionEditor = React.useCallback(() => {
    setShowPositionEditor(!showPositionEditor);
  }, [showPositionEditor]);

  // Handle keyboard shortcut for position editor (Shift+E)
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === 'e' && event.shiftKey) {
        event.preventDefault();
        togglePositionEditor();
        console.log('🔧 Position Editor toggled from App:', !showPositionEditor);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePositionEditor, showPositionEditor]);
  
  // Handle game state changes from the cricket game
  const handleGameStateChange = React.useCallback((newGameData) => {
    // Merge position editor state with game data
    const enhancedGameData = {
      ...newGameData,
      showPositionEditor,
      togglePositionEditor,
      currentPlayerPositions
    };
    setGameData(enhancedGameData);
    
    // Extract cricket UI controls if present
    if (newGameData && newGameData.useCompactUI !== undefined) {
      setCricketUIData(newGameData);
    }
  }, [showPositionEditor, togglePositionEditor, currentPlayerPositions]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Navigation */}
      <Navigation />
      
      {/* UI overlay */}
      <UI 
        currentView={currentView} 
        availableViews={availableViews}
        showGameInstructions={true} 
      />
      
      {/* Game UI overlay - rendered outside Canvas */}
      <GameUI gameData={gameData} />
      
      {/* Player Position Manager - rendered outside Canvas */}
      <PlayerPositionManager
        isVisible={showPositionEditor}
        onPositionsChange={handlePositionsChange}
        onClose={handleClosePositionEditor}
        initialPositions={currentPlayerPositions}
      />

      {/* Cricket Controls Panel - rendered outside Canvas */}
      {cricketUIData && (
        <RightDockedPanel
          useCompactUI={cricketUIData.useCompactUI}
          setUseCompactUI={cricketUIData.setUseCompactUI}
          gameState={cricketUIData.gameState}
          handleBowlingConfigUpdate={cricketUIData.handleBowlingConfigUpdate}
          showPitchMarkers={cricketUIData.showPitchMarkers}
          setShowPitchMarkers={cricketUIData.setShowPitchMarkers}
          showCoordinateDisplay={cricketUIData.showCoordinateDisplay}
          setShowCoordinateDisplay={cricketUIData.setShowCoordinateDisplay}
          showPitchGrid={cricketUIData.showPitchGrid}
          setShowPitchGrid={cricketUIData.setShowPitchGrid}
          currentView={cricketUIData.currentView}
          switchToView={cricketUIData.switchToView}
        />
      )}
      
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#1a1a1a');
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = 2; // PCFSoftShadowMap
        }}
      >
        <Scene 
          currentView={currentView} 
          onGameStateChange={handleGameStateChange}
          currentPlayerPositions={currentPlayerPositions}
          isPositionEditorActive={showPositionEditor}
        />
      </Canvas>
    </div>
  );
};

export default App;