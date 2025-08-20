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
import LeftDockedPanel from './components/LeftDockedPanel';
import { useCameraControls } from './hooks/useCameraControls';
import { createInitialPositions } from './utils/functionalPositionManager';

// Pure component for the 3D scene
const Scene = ({ 
  currentView, 
  onGameStateChange, 
  currentPlayerPositions, 
  isPositionEditorActive,
  ballFollowConfig = {},
  isFollowingBall = false,
  onBallPositionUpdate,
  onDisableFollowing
}) => {
  const [ballPosition, setBallPosition] = React.useState(null);

  // Handle ball position updates from Stadium
  const handleBallPositionUpdate = React.useCallback((position) => {
    setBallPosition(position);
    if (onBallPositionUpdate) {
      onBallPositionUpdate(position);
    }
  }, [onBallPositionUpdate]);

  return (
    <>
      {/* Camera with current view and ball following */}
      <CricketCamera 
        view={currentView} 
        ballPosition={ballPosition}
        ballFollowConfig={ballFollowConfig}
        isFollowingBall={isFollowingBall}
        onDisableFollowing={onDisableFollowing}
      />
      
      {/* Stadium lighting */}
      <Lighting intensity={1.2} />
      
      {/* Main stadium with game state callback */}
      <Stadium 
        onGameStateChange={onGameStateChange} 
        currentPlayerPositions={currentPlayerPositions}
        isPositionEditorActive={isPositionEditorActive}
        onBallPositionUpdate={handleBallPositionUpdate}
      />
      
      {/* Fog for atmospheric effect */}
      {/* <fog attach="fog" args={['#202020', 40, 80]} /> */}
      
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

  // Ball Following Camera State
  const [isFollowingBall, setIsFollowingBall] = React.useState(false);
  const [ballFollowConfig, setBallFollowConfig] = React.useState({
    distance: 8.0,
    height: 4.0,
    smoothness: 0.05,
    lookAtBall: true,
    autoFollow: false,  // ✅ DEFAULT OFF - Only follow when manually enabled
    legSideMode: true,  // ✅ ENHANCED: Enable leg-side special view by default
    fastTracking: true  // ✅ ENHANCED: Enable fast shot tracking by default
  });
  const [currentBallPosition, setCurrentBallPosition] = React.useState(null);

  // Demo Data State
  const [isDummyDataActive, setIsDummyDataActive] = React.useState(false);

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

  // Ball Following Callbacks
  const handleBallFollowToggle = React.useCallback(() => {
    setIsFollowingBall(!isFollowingBall);
  }, [isFollowingBall]);

  const handleBallFollowConfigUpdate = React.useCallback((newConfig) => {
    setBallFollowConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const handleDisableFollowing = React.useCallback(() => {
    setIsFollowingBall(false);
  }, []);

  const handleBallPositionUpdate = React.useCallback((position) => {
    setCurrentBallPosition(position);
    
    // Auto-enable following when ball starts moving if autoFollow is enabled
    if (ballFollowConfig.autoFollow && position && !isFollowingBall) {
      // Check if ball is actually moving (not at default position)
      const isMoving = position[0] !== 0 || position[2] !== 0;
      if (isMoving) {
        setIsFollowingBall(true);
      }
    }
  }, [ballFollowConfig.autoFollow, isFollowingBall]);

  // Demo Data Callbacks
  const handleLoadDummyData = React.useCallback((dummyData) => {
    setIsDummyDataActive(true);
    // Trigger the demo data loading through game state change
    if (gameData?.applyDummyData) {
      gameData.applyDummyData(dummyData);
    }
  }, [gameData]);

  const handleClearDummyData = React.useCallback(() => {
    setIsDummyDataActive(false);
    // The CricketGame component will handle clearing the state
  }, []);

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
    // Merge position editor state and ball following state with game data
    const enhancedGameData = {
      ...newGameData,
      showPositionEditor,
      togglePositionEditor,
      currentPlayerPositions,
      // Ball following state
      isFollowingBall,
      ballFollowConfig,
      handleBallFollowToggle,
      handleBallFollowConfigUpdate,
      currentBallPosition,
      isDummyDataActive,
      handleLoadDummyData,
      handleClearDummyData
    };
    setGameData(enhancedGameData);
    
    // Extract cricket UI controls if present
    if (newGameData && newGameData.useCompactUI !== undefined) {
      setCricketUIData(newGameData);
    }
  }, [
    showPositionEditor, 
    togglePositionEditor, 
    currentPlayerPositions,
    isFollowingBall,
    ballFollowConfig,
    handleBallFollowToggle,
    handleBallFollowConfigUpdate,
    currentBallPosition,
    isDummyDataActive,
    handleLoadDummyData,
    handleClearDummyData
  ]);

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
          handleBallShotConfigUpdate={cricketUIData.handleBallShotConfigUpdate}
          resetBallToBowler={cricketUIData.resetBallToBowler}
          showPitchMarkers={cricketUIData.showPitchMarkers}
          setShowPitchMarkers={cricketUIData.setShowPitchMarkers}
          showCoordinateDisplay={cricketUIData.showCoordinateDisplay}
          setShowCoordinateDisplay={cricketUIData.setShowCoordinateDisplay}
          showPitchGrid={cricketUIData.showPitchGrid}
          setShowPitchGrid={cricketUIData.setShowPitchGrid}
          currentView={cricketUIData.currentView}
          switchToView={cricketUIData.switchToView}
          isFollowingBall={cricketUIData.isFollowingBall}
          ballFollowConfig={cricketUIData.ballFollowConfig}
          handleBallFollowToggle={cricketUIData.handleBallFollowToggle}
          handleBallFollowConfigUpdate={cricketUIData.handleBallFollowConfigUpdate}
          isDummyDataActive={cricketUIData.isDummyDataActive}
          onLoadDummyData={cricketUIData.handleLoadDummyData}
          onClearDummyData={cricketUIData.handleClearDummyData}
        />
      )}

      {/* Ball Position Panel - rendered outside Canvas */}
      {cricketUIData && (
        <LeftDockedPanel
          gameState={cricketUIData.gameState}
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
          ballFollowConfig={ballFollowConfig}
          isFollowingBall={isFollowingBall}
          onBallPositionUpdate={handleBallPositionUpdate}
          onDisableFollowing={handleDisableFollowing}
        />
      </Canvas>
    </div>
  );
};

export default App;