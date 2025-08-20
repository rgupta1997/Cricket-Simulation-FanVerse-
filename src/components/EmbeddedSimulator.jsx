/* eslint-disable react/no-unknown-property */
import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import CricketCamera from './Camera';
import Lighting from './Lighting';
import Stadium from './Stadium';
import dummyStadiumData from '../data/dummyStadiumData.json';

const EmbeddedSimulator = ({ matchId, onExpand }) => {
  const [isDummyDataLoaded, setIsDummyDataLoaded] = useState(false);
  const [currentGameData, setCurrentGameData] = useState(null);
  
  // Ball Following Camera State for embedded simulator
  const [ballPosition, setBallPosition] = useState(null);
  const [isFollowingBall, setIsFollowingBall] = useState(false);
  const [ballFollowConfig, setBallFollowConfig] = useState({
    distance: 12.0, // Slightly further for embedded view
    height: 6.0,    // Higher for better overview
    smoothness: 0.08,
    lookAtBall: true,
    autoFollow: false,  // ✅ DEFAULT OFF - Only follow when manually enabled
    legSideMode: true,  // ✅ ENHANCED: Enable leg-side special view by default
    fastTracking: true  // ✅ ENHANCED: Enable fast shot tracking by default
  });

  // Default camera view for embedded simulator
  const defaultCameraView = {
    position: [45, 35, 45],
    target: [0, 0, 0],
    fov: 75
  };

  const handleExpand = () => {
    if (onExpand) {
      onExpand();
    }
  };

  const handleLoadDummyData = () => {
    try {
      setCurrentGameData(dummyStadiumData.stadiumSimulation);
      setIsDummyDataLoaded(true);
      console.log('Dummy stadium data loaded:', dummyStadiumData.stadiumSimulation);
    } catch (error) {
      console.error('Error loading dummy data:', error);
    }
  };

  const handleClearData = () => {
    setCurrentGameData(null);
    setIsDummyDataLoaded(false);
    console.log('Dummy data cleared, back to default simulation');
  };

  // Handle ball position updates for camera following
  const handleBallPositionUpdate = useCallback((position) => {
    setBallPosition(position);
    
    // Auto-enable following when ball starts moving if autoFollow is enabled
    if (ballFollowConfig.autoFollow && position && !isFollowingBall) {
      // Check if ball is actually moving (not at default position)
      const isMoving = position[0] !== 0 || position[2] !== 0;
      if (isMoving) {
        setIsFollowingBall(true);
      }
    }
  }, [ballFollowConfig.autoFollow, isFollowingBall]);

  // Handle disabling ball following when user manually interacts with camera
  const handleDisableFollowing = useCallback(() => {
    setIsFollowingBall(false);
  }, []);

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
          {/* Custom Cricket Camera with Ball Following */}
          <CricketCamera 
            view={defaultCameraView}
            ballPosition={ballPosition}
            ballFollowConfig={ballFollowConfig}
            isFollowingBall={isFollowingBall}
            onDisableFollowing={handleDisableFollowing}
          />
          
          {/* Stadium lighting */}
          <Lighting intensity={1.2} />
          
          {/* Stadium with ball position updates */}
          <Stadium 
            isEmbedded={true}
            matchId={matchId}
            dummyGameData={currentGameData}
            isDummyDataActive={isDummyDataLoaded}
            onBallPositionUpdate={handleBallPositionUpdate}
          />
        </Canvas>
      </div>

      {/* Control Buttons */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000
      }}>
        {/* Ball Following Toggle */}
        <button
          onClick={() => setIsFollowingBall(!isFollowingBall)}
          style={{
            padding: '8px 12px',
            background: isFollowingBall ? 'rgba(0, 170, 0, 0.9)' : 'rgba(170, 0, 0, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: isFollowingBall ? '0 0 12px rgba(0, 170, 0, 0.5)' : 'none'
          }}
          title="Toggle Ball Following Camera"
        >
          <span>🎬</span>
          {isFollowingBall ? '✅ Following' : '❌ Stopped'}
        </button>
        
        {/* Dummy Data Button */}
        {!isDummyDataLoaded ? (
          <button
            onClick={handleLoadDummyData}
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              border: '2px solid #22c55e',
              color: '#22c55e',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(4px)',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Load Demo
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                console.log('🎮 Testing BallOutcome from dummy data...');
                // This will trigger the graphics if BallOutcome is present
                if (currentGameData?.gameState?.BallOutcome) {
                  console.log('🎮 Found BallOutcome in dummy data:', currentGameData.gameState.BallOutcome);
                } else {
                  console.log('🎮 No BallOutcome found in dummy data');
                }
              }}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                border: '2px solid #3b82f6',
                color: '#3b82f6',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(4px)',
                fontWeight: '500'
              }}
            >
              🎮 Test BallOutcome
            </button>
            <button
              onClick={handleClearData}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid #ef4444',
              color: '#ef4444',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(4px)',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Clear Demo
          </button>
          </>
        )}

        {/* Expand Button */}
        <button
          onClick={handleExpand}
          style={{
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
            backdropFilter: 'blur(4px)'
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
          Expand
        </button>
      </div>

             {/* Demo Data Indicator */}
       {isDummyDataLoaded && (
         <div style={{
           position: 'absolute',
           top: '70px',
           right: '20px',
           backgroundColor: 'rgba(34, 197, 94, 0.9)',
           color: 'white',
           padding: '4px 12px',
           borderRadius: '12px',
           fontSize: '0.8rem',
           fontWeight: '500',
           backdropFilter: 'blur(4px)',
           zIndex: 1000,
           display: 'flex',
           alignItems: 'center',
           gap: '6px'
         }}>
           <div style={{
             width: '8px',
             height: '8px',
             backgroundColor: '#22c55e',
             borderRadius: '50%',
             animation: 'pulse 2s infinite'
           }}></div>
           Demo Mode Active
         </div>
       )}

       {/* Stadium Atmosphere Indicator */}
       <div style={{
         position: 'absolute',
         bottom: '20px',
         left: '20px',
         backgroundColor: 'rgba(255, 165, 0, 0.9)',
         color: 'white',
         padding: '6px 12px',
         borderRadius: '12px',
         fontSize: '0.8rem',
         fontWeight: '500',
         backdropFilter: 'blur(4px)',
         zIndex: 1000,
         display: 'flex',
         alignItems: 'center',
         gap: '8px'
       }}>
         <div style={{
           width: '10px',
           height: '10px',
           backgroundColor: '#FFA500',
           borderRadius: '50%',
           animation: 'pulse 1.5s infinite'
         }}></div>
         <span>🏟️ Packed Stadium: 15,250 fans</span>
       </div>
    </div>
  );
};

export default EmbeddedSimulator;
