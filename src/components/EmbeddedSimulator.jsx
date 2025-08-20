/* eslint-disable react/no-unknown-property */
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Stadium from './Stadium';
import dummyStadiumData from '../data/dummyStadiumData.json';

const EmbeddedSimulator = ({ matchId, onExpand }) => {
  const [isDummyDataLoaded, setIsDummyDataLoaded] = useState(false);
  const [currentGameData, setCurrentGameData] = useState(null);

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
             position: [45, 35, 45], // Adjusted for 60m stadium (was 50,40,50)
             fov: 75, // FOV perfect for 60m stadium
             near: 0.1,
             far: 1200 // Adjusted far plane for 60m stadium
           }}
           shadows
         >
          {/* Backup basic lighting to ensure stadium is always visible */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 20, 10]} intensity={1.0} />
          <Stadium 
            isEmbedded={true}
            matchId={matchId}
            dummyGameData={currentGameData}
            isDummyDataActive={isDummyDataLoaded}
          />
                     <OrbitControls 
             enablePan={true}
             enableZoom={true}
             enableRotate={true}
             minDistance={15} // Adjusted for 60m stadium
             maxDistance={120} // Adjusted for 60m stadium (was 150)
             maxPolarAngle={Math.PI / 2.2}
             enableDamping={true} // Smooth camera controls
             dampingFactor={0.1} // Faster damping for responsiveness
             panSpeed={1.2} // Slightly faster panning
             zoomSpeed={1.0} // Standard zoom speed
             rotateSpeed={0.8} // Slightly slower rotation for precision
           />
        </Canvas>
      </div>

      {/* Control Buttons */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 1000
      }}>
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
