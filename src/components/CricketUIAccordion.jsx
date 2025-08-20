import React, { useState } from 'react';
import BallShotControl from './BallShotControl';
import CoordinateDisplay from './CoordinateDisplay';
import DeliveryInfo from './DeliveryInfo';
import CameraControlsDisabled from './CameraControlsDisabled';
import { calculateBallTrajectory } from './CricketGameState';
import dummyStadiumData from '../data/dummyStadiumData.json';
import { convertApiToGameCoordinates } from '../utils/coordinateConverter';
import { SAMPLE_API_DATA } from '../constants/apiData';

const AccordionSection = ({ title, children, isOpen, onToggle, icon, color = '#FFD700' }) => {
  return (
    <div style={{
      border: `1px solid ${color}`,
      borderRadius: '8px',
      marginBottom: '8px',
      background: 'rgba(0, 0, 0, 0.9)',
      overflow: 'hidden'
    }}>
      <div 
        onClick={onToggle}
        style={{
          padding: '12px 15px',
          background: `linear-gradient(135deg, rgba(0,0,0,0.8), ${color}20)`,
          color: color,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
          borderBottom: isOpen ? `1px solid ${color}40` : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span style={{ 
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          fontSize: '12px'
        }}>
          ▶
        </span>
      </div>
      {isOpen && (
        <div style={{
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.95)',
          animation: 'slideDown 0.3s ease',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

const CricketUIAccordion = ({ 
  gameState, 
  onBallShotConfigUpdate,
  showPitchMarkers,
  setShowPitchMarkers,
  showCoordinateDisplay,
  setShowCoordinateDisplay,
  showPitchGrid,
  setShowPitchGrid,
  currentCameraView,
  onCameraViewChange,
  playShot, // Add playShot function prop
  isFollowingBall = false,
  ballFollowConfig = {},
  onBallFollowToggle = () => {},
  onBallFollowConfigUpdate = () => {},
  isDummyDataActive = false,
  onLoadDummyData = () => {},
  onClearDummyData = () => {}
}) => {
  const [openSections, setOpenSections] = useState({
    playBall: true,  // New section, open by default
    analysis: false,
    coordinates: false,
    camera: false,
    ballFollow: false,
    demo: false,
    guides: false,
    ballTrajectory: false,
    ballShot: false
  });

  // Form state for ball delivery
  const [ballDelivery, setBallDelivery] = useState({
    releasePosition: [0, 2, 15],
    bouncePosition: [0, 0, 0],
    finalPosition: [0, 0.5, -9],
    shotDegree: 0,
    shotDistance: 0,
    isLofted: false,
    useApiData: false
  });

  // Handle API data conversion and auto-fill
  const handleApiDataToggle = (checked) => {
    setBallDelivery(prev => ({
      ...prev,
      useApiData: checked
    }));

    if (checked) {
      // Convert API data to our coordinate system and auto-fill
      const convertedRelease = convertApiToGameCoordinates(SAMPLE_API_DATA.release, 'release');
      const convertedBounce = convertApiToGameCoordinates(SAMPLE_API_DATA.bounce, 'bounce');
      const convertedFinal = convertApiToGameCoordinates(SAMPLE_API_DATA.final, 'final');

      setBallDelivery(prev => ({
        ...prev,
        releasePosition: convertedRelease,
        bouncePosition: convertedBounce,
        finalPosition: convertedFinal
      }));
    }
  };

  // Reset function
  const resetBallDelivery = () => {
    setBallDelivery({
      releasePosition: [0, 2, 15],
      bouncePosition: [0, 0, 0],
      finalPosition: [0, 0.5, -9],
      shotDegree: 0,
      shotDistance: 0,
      isLofted: false,
      useApiData: false
    });
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const trajectory = calculateBallTrajectory(gameState.controls.bowling);

  return (
    <div style={{
        width: '350px',
        maxHeight: '600px',
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.95)',
        border: '2px solid #FFD700',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
        fontFamily: 'Arial, sans-serif',
        color: 'white',
        fontSize: '12px'
      }}>
        {/* Header */}
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          color: '#000',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '16px',
          borderRadius: '10px 10px 0 0'
        }}>
          🏏 Cricket Simulator Control Panel
        </div>

        <div style={{ padding: '10px' }}>
          {/* Play Ball Section */}
          <AccordionSection
            title="Play Ball"
            icon="🎯"
            color="#4CAF50"
            isOpen={openSections.playBall}
            onToggle={() => toggleSection('playBall')}
          >
            <div style={{ display: 'grid', gap: '12px' }}>
              {/* API Data Toggle */}
              <div style={{ 
                padding: '8px', 
                background: 'rgba(33, 150, 243, 0.1)', 
                borderRadius: '6px',
                border: '1px solid #2196F3'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ballDelivery.useApiData}
                    onChange={(e) => handleApiDataToggle(e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontSize: '12px', color: '#2196F3', fontWeight: 'bold' }}>
                    🔄 Use API Sample Data
                  </span>
                </label>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#aaa', 
                  marginTop: '4px',
                  marginLeft: '28px'
                }}>
                  Auto-fills coordinates from API sample data
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetBallDelivery}
                style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, #757575, #616161)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>🔄</span>
                Reset to Default
              </button>
              {/* Release Position */}
              <div>
                <div style={{ color: '#0066FF', marginBottom: '4px', fontWeight: 'bold' }}>Release Position</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <div key={axis}>
                      <label style={{ fontSize: '10px', color: '#aaa' }}>{axis}</label>
                      <input
                        type="number"
                        value={ballDelivery.releasePosition[i]}
                        onChange={(e) => {
                          const newPos = [...ballDelivery.releasePosition];
                          newPos[i] = parseFloat(e.target.value);
                          setBallDelivery(prev => ({ ...prev, releasePosition: newPos }));
                        }}
                        style={{
                          width: '100%',
                          padding: '4px',
                          background: 'rgba(0, 102, 255, 0.1)',
                          border: '1px solid #0066FF',
                          borderRadius: '4px',
                          color: 'white'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bounce Position */}
              <div>
                <div style={{ color: '#FF4444', marginBottom: '4px', fontWeight: 'bold' }}>Bounce Position</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <div key={axis}>
                      <label style={{ fontSize: '10px', color: '#aaa' }}>{axis}</label>
                      <input
                        type="number"
                        value={ballDelivery.bouncePosition[i]}
                        onChange={(e) => {
                          const newPos = [...ballDelivery.bouncePosition];
                          newPos[i] = parseFloat(e.target.value);
                          setBallDelivery(prev => ({ ...prev, bouncePosition: newPos }));
                        }}
                        style={{
                          width: '100%',
                          padding: '4px',
                          background: 'rgba(255, 68, 68, 0.1)',
                          border: '1px solid #FF4444',
                          borderRadius: '4px',
                          color: 'white'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Position */}
              <div>
                <div style={{ color: '#44FF44', marginBottom: '4px', fontWeight: 'bold' }}>Final Position</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <div key={axis}>
                      <label style={{ fontSize: '10px', color: '#aaa' }}>{axis}</label>
                      <input
                        type="number"
                        value={ballDelivery.finalPosition[i]}
                        onChange={(e) => {
                          const newPos = [...ballDelivery.finalPosition];
                          newPos[i] = parseFloat(e.target.value);
                          setBallDelivery(prev => ({ ...prev, finalPosition: newPos }));
                        }}
                        style={{
                          width: '100%',
                          padding: '4px',
                          background: 'rgba(68, 255, 68, 0.1)',
                          border: '1px solid #44FF44',
                          borderRadius: '4px',
                          color: 'white'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Shot Controls */}
              <div>
                <div style={{ color: '#FF9800', marginBottom: '4px', fontWeight: 'bold' }}>Shot Controls</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#aaa' }}>Degree</label>
                    <input
                      type="number"
                      value={ballDelivery.shotDegree}
                      onChange={(e) => setBallDelivery(prev => ({ ...prev, shotDegree: parseFloat(e.target.value) }))}
                      style={{
                        width: '100%',
                        padding: '4px',
                        background: 'rgba(255, 152, 0, 0.1)',
                        border: '1px solid #FF9800',
                        borderRadius: '4px',
                        color: 'white'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#aaa' }}>Distance</label>
                    <input
                      type="number"
                      value={ballDelivery.shotDistance}
                      onChange={(e) => setBallDelivery(prev => ({ ...prev, shotDistance: parseFloat(e.target.value) }))}
                      style={{
                        width: '100%',
                        padding: '4px',
                        background: 'rgba(255, 152, 0, 0.1)',
                        border: '1px solid #FF9800',
                        borderRadius: '4px',
                        color: 'white'
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={ballDelivery.isLofted}
                      onChange={(e) => setBallDelivery(prev => ({ ...prev, isLofted: e.target.checked }))}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    <span style={{ fontSize: '12px', color: '#FF9800' }}>Lofted Shot</span>
                  </label>
                </div>
              </div>

              {/* Play Ball Button */}
              <button
                onClick={() => {
                  if (playShot) {
                    playShot(ballDelivery);
                  }
                }}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <span>🎯</span>
                Play Ball
              </button>
            </div>
          </AccordionSection>

          {/* Delivery Analysis Section */}
          <AccordionSection
            title="Delivery Analysis"
            icon="📊"
            color="#FF4444"
            isOpen={openSections.analysis}
            onToggle={() => toggleSection('analysis')}
          >
            <div style={{ 
              background: 'rgba(255,68,68,0.1)', 
              padding: '10px', 
              borderRadius: '6px',
              border: '1px solid #FF4444'
            }}>
              <div style={{ fontWeight: 'bold', color: '#FF4444', marginBottom: '8px', fontSize: '13px' }}>
                📊 Current Delivery Analysis
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '4px' }}>
                  <div style={{ color: '#FFD700', fontSize: '10px' }}>VELOCITY</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{gameState.controls.bowling.velocity} km/h</div>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '4px' }}>
                  <div style={{ color: '#FFD700', fontSize: '10px' }}>FLIGHT TIME</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{trajectory.metadata.totalTime.toFixed(2)}s</div>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(255,215,0,0.1)', 
                padding: '6px', 
                borderRadius: '4px',
                border: '1px solid #FFD700'
              }}>
                <div style={{ color: '#FFD700', fontSize: '10px', marginBottom: '4px' }}>TRAJECTORY SUMMARY</div>
                <div style={{ fontSize: '10px', display: 'grid', gap: '2px' }}>
                  <div>🔵 Release: ({trajectory.initial.position[0].toFixed(1)}, {trajectory.initial.position[2].toFixed(1)})</div>
                  <div>🔴 Bounce: ({trajectory.bounce.position[0].toFixed(1)}, {trajectory.bounce.position[2].toFixed(1)})</div>
                  <div>🟢 Final: ({trajectory.target.position[0].toFixed(1)}, {trajectory.target.position[2].toFixed(1)})</div>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Ball Trajectory Details */}
          <AccordionSection
            title="Ball Trajectory Details"
            icon="⚾"
            color="#44FF44"
            isOpen={openSections.ballTrajectory}
            onToggle={() => toggleSection('ballTrajectory')}
          >
            <div style={{ 
              display: 'grid', 
              gap: '8px',
              fontSize: '11px'
            }}>
              <div style={{ 
                padding: '8px', 
                background: 'rgba(0, 102, 255, 0.2)', 
                borderRadius: '4px',
                border: '1px solid #0066FF'
              }}>
                <div style={{ fontWeight: 'bold', color: '#0066FF', marginBottom: '4px' }}>
                  🚀 Release Position
                </div>
                <div>X: {trajectory.initial.position[0].toFixed(2)}m</div>
                <div>Y: {trajectory.initial.position[1].toFixed(2)}m</div>
                <div>Z: {trajectory.initial.position[2].toFixed(2)}m</div>
                <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                  Velocity: [{trajectory.initial.velocity.map(v => v.toFixed(1)).join(', ')}] m/s
                </div>
              </div>

              <div style={{ 
                padding: '8px', 
                background: 'rgba(255, 68, 68, 0.2)', 
                borderRadius: '4px',
                border: '1px solid #FF4444'
              }}>
                <div style={{ fontWeight: 'bold', color: '#FF4444', marginBottom: '4px' }}>
                  ⚡ Bounce Position
                </div>
                <div>X: {trajectory.bounce.position[0].toFixed(2)}m</div>
                <div>Y: {trajectory.bounce.position[1].toFixed(2)}m</div>
                <div>Z: {trajectory.bounce.position[2].toFixed(2)}m</div>
                <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                  Bounce Time: {trajectory.metadata.bounceTime.toFixed(2)}s
                </div>
              </div>

              <div style={{ 
                padding: '8px', 
                background: 'rgba(68, 255, 68, 0.2)', 
                borderRadius: '4px',
                border: '1px solid #44FF44'
              }}>
                <div style={{ fontWeight: 'bold', color: '#44FF44', marginBottom: '4px' }}>
                  🎯 Final Position
                </div>
                <div>X: {trajectory.target.position[0].toFixed(2)}m</div>
                <div>Y: {trajectory.target.position[1].toFixed(2)}m</div>
                <div>Z: {trajectory.target.position[2].toFixed(2)}m</div>
                <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                  Total Time: {trajectory.metadata.totalTime.toFixed(2)}s
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Ball Shot Control Section */}
          <AccordionSection
            title="Ball Shot Control"
            icon="🏏"
            color="#FF6B35"
            isOpen={openSections.ballShot}
            onToggle={() => toggleSection('ballShot')}
          >
            <BallShotControl 
              onUpdateConfig={onBallShotConfigUpdate}
              currentConfig={gameState.controls.ballShot}
              gameState={gameState}
            />
          </AccordionSection>

          {/* Camera Controls Section */}
          <AccordionSection
            title="Camera Views"
            icon="📹"
            color="#9B59B6"
            isOpen={openSections.camera}
            onToggle={() => toggleSection('camera')}
          >
            <CameraControlsDisabled 
              currentView={currentCameraView}
              onViewChange={onCameraViewChange}
            />
          </AccordionSection>

          {/* Ball Following Section */}
          <AccordionSection
            title="Ball Following Camera"
            icon="🎬"
            color="#E91E63"
            isOpen={openSections.ballFollow}
            onToggle={() => toggleSection('ballFollow')}
          >
            <div style={{ display: 'grid', gap: '15px' }}>
              {/* Ball Following Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: isFollowingBall ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                border: `2px solid ${isFollowingBall ? '#00AA00' : 'rgba(255, 255, 255, 0.1)'}`
              }}>
                <span style={{ color: '#FFD700', fontSize: '14px', fontWeight: 'bold' }}>
                  🎬 Follow Ball Camera
                </span>
                <button
                  onClick={onBallFollowToggle}
                  style={{
                    background: isFollowingBall ? '#00AA00' : '#AA0000',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    boxShadow: isFollowingBall ? '0 0 10px rgba(0, 170, 0, 0.5)' : 'none'
                  }}
                >
                  {isFollowingBall ? '✅ FOLLOWING' : '❌ STOPPED'}
                </button>
              </div>

              {/* Distance Control */}
              <div>
                <label style={{ 
                  color: '#FFD700', 
                  fontSize: '13px', 
                  fontWeight: 'bold',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  📏 Camera Distance: {(ballFollowConfig.distance || 8.0).toFixed(1)}m
                </label>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="0.5"
                  value={ballFollowConfig.distance || 8}
                  onChange={(e) => onBallFollowConfigUpdate({ distance: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '6px',
                    background: '#333',
                    borderRadius: '3px',
                    outline: 'none',
                    WebkitAppearance: 'none'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '10px', 
                  color: '#999',
                  marginTop: '4px'
                }}>
                  <span>3m (Close)</span>
                  <span>20m (Wide)</span>
                </div>
              </div>

              {/* Height Control */}
              <div>
                <label style={{ 
                  color: '#FFD700', 
                  fontSize: '13px', 
                  fontWeight: 'bold',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  📐 Camera Height: {(ballFollowConfig.height || 4.0).toFixed(1)}m
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.2"
                  value={ballFollowConfig.height || 4}
                  onChange={(e) => onBallFollowConfigUpdate({ height: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '6px',
                    background: '#333',
                    borderRadius: '3px',
                    outline: 'none',
                    WebkitAppearance: 'none'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '10px', 
                  color: '#999',
                  marginTop: '4px'
                }}>
                  <span>1m (Low)</span>
                  <span>10m (High)</span>
                </div>
              </div>

              {/* Smoothness Control */}
              <div>
                <label style={{ 
                  color: '#FFD700', 
                  fontSize: '13px', 
                  fontWeight: 'bold',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  🌊 Camera Smoothness: {((ballFollowConfig.smoothness || 0.05) * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.2"
                  step="0.01"
                  value={ballFollowConfig.smoothness || 0.05}
                  onChange={(e) => onBallFollowConfigUpdate({ smoothness: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '6px',
                    background: '#333',
                    borderRadius: '3px',
                    outline: 'none',
                    WebkitAppearance: 'none'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '10px', 
                  color: '#999',
                  marginTop: '4px'
                }}>
                  <span>1% (Instant)</span>
                  <span>20% (Very Smooth)</span>
                </div>
              </div>

              {/* Auto Follow Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>
                  <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 'bold', display: 'block' }}>
                    🚀 Auto Follow Ball
                  </span>
                  <span style={{ color: '#999', fontSize: '11px' }}>
                    Automatically follow when ball moves
                  </span>
                </div>
                <button
                  onClick={() => onBallFollowConfigUpdate({ autoFollow: !(ballFollowConfig.autoFollow ?? false) })}
                  style={{
                    background: (ballFollowConfig.autoFollow ?? false) ? '#00AA00' : '#666',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {(ballFollowConfig.autoFollow ?? false) ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Cricket Broadcast Camera Info */}
              <div style={{ 
                padding: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>
                  📺 Cricket Broadcast Style Camera
                </div>
                
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ color: '#999', fontSize: '11px', lineHeight: '1.4' }}>
                    🏏 <strong>Smart Side-On View</strong> - 90° for normal shots, like real cricket TV
                  </div>
                  <div style={{ color: '#999', fontSize: '11px', lineHeight: '1.4' }}>
                    🎯 <strong>Leg-Side Specialist</strong> - 270° facing bowler for shots 225°-330°
                  </div>
                  <div style={{ color: '#999', fontSize: '11px', lineHeight: '1.4' }}>
                    🔄 <strong>Fast Intelligent Switching</strong> - Quick aesthetic camera positioning
                  </div>
                  <div style={{ color: '#999', fontSize: '11px', lineHeight: '1.4' }}>
                    🎥 <strong>Responsive Ball Following</strong> - Fast, professional broadcast transitions
                  </div>
                  <div style={{ color: '#999', fontSize: '11px', lineHeight: '1.4' }}>
                    📡 <strong>Elevated Position</strong> - Perfect trajectory visibility
                  </div>
                  
                  <div style={{
                    padding: '6px 8px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#22c55e',
                    fontWeight: 'bold',
                    marginTop: '4px'
                  }}>
                    ✨ Professional cricket broadcast with leg-side specialist camera switching
                  </div>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Demo Data Section */}
          <AccordionSection
            title="Demo Data Controls"
            icon="🎮"
            color="#22c55e"
            isOpen={openSections.demo}
            onToggle={() => toggleSection('demo')}
          >
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ 
                padding: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>
                  🎮 Load Realistic Match Data
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '12px' }}>
                  Load pre-configured match scenario with realistic player positions, scores, and game state for testing and demonstration purposes.
                </div>
                
                {!isDummyDataActive ? (
                  <button
                    onClick={() => onLoadDummyData(dummyStadiumData.stadiumSimulation)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      border: '2px solid #22c55e',
                      color: '#22c55e',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <span>+</span>
                    Load Demo Data
                  </button>
                ) : (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{
                      fontSize: '11px',
                      color: '#22c55e',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '4px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#22c55e',
                        borderRadius: '50%'
                      }}></div>
                      Demo Mode Active
                    </div>
                    <button
                      onClick={onClearDummyData}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        border: '2px solid #ef4444',
                        color: '#ef4444',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <span>×</span>
                      Clear Demo Data
                    </button>
                  </div>
                )}
              </div>
            </div>
          </AccordionSection>

          {/* Coordinate Display Section */}
          <AccordionSection
            title="Detailed Coordinates"
            icon="📐"
            color="#FFAA00"
            isOpen={openSections.coordinates}
            onToggle={() => toggleSection('coordinates')}
          >
            <div style={{ display: 'grid', gap: '8px' }}>
              {[
                { 
                  label: '🚀 Release Position', 
                  pos: trajectory.initial.position, 
                  vel: trajectory.initial.velocity,
                  color: '#0066FF' 
                },
                { 
                  label: '⚡ Bounce Position', 
                  pos: trajectory.bounce.position, 
                  vel: trajectory.bounce.velocity,
                  color: '#FF4444' 
                },
                { 
                  label: '🎯 Final Position', 
                  pos: trajectory.target.position, 
                  vel: null,
                  color: '#44FF44' 
                }
              ].map((point, i) => (
                <div key={i} style={{ 
                  padding: '8px', 
                  background: `${point.color}20`, 
                  borderLeft: `4px solid ${point.color}`,
                  borderRadius: '4px'
                }}>
                  <div style={{ fontWeight: 'bold', color: point.color, marginBottom: '4px', fontSize: '11px' }}>
                    {point.label}
                  </div>
                  <div style={{ fontSize: '10px' }}>
                    <div>Coordinates: ({point.pos[0].toFixed(2)}, {point.pos[1].toFixed(2)}, {point.pos[2].toFixed(2)})</div>
                    {point.vel && (
                      <div style={{ color: '#ccc', marginTop: '2px' }}>
                        Velocity: [{point.vel.map(v => v.toFixed(1)).join(', ')}] m/s
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div style={{ 
                padding: '8px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderLeft: '4px solid #FFD700',
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: 'bold', color: '#FFD700', marginBottom: '4px', fontSize: '11px' }}>
                  📊 Distance Measurements
                </div>
                <div style={{ fontSize: '10px' }}>
                  <div>Release to Bounce: {Math.sqrt(
                    Math.pow(trajectory.bounce.position[0] - trajectory.initial.position[0], 2) + 
                    Math.pow(trajectory.bounce.position[2] - trajectory.initial.position[2], 2)
                  ).toFixed(2)} m</div>
                  <div>Bounce to Final: {Math.sqrt(
                    Math.pow(trajectory.target.position[0] - trajectory.bounce.position[0], 2) + 
                    Math.pow(trajectory.target.position[2] - trajectory.bounce.position[2], 2)
                  ).toFixed(2)} m</div>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Visual Guides Section */}
          <AccordionSection
            title="Visual Guide Controls"
            icon="👁️"
            color="#AA44FF"
            isOpen={openSections.guides}
            onToggle={() => toggleSection('guides')}
          >
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#AA44FF' }}>
                Toggle Visualization Elements
              </div>
              
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={showPitchMarkers}
                  onChange={(e) => setShowPitchMarkers(e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span>🔵🔴🟢 Position Markers</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={showCoordinateDisplay}
                  onChange={(e) => setShowCoordinateDisplay(e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span>📊 Coordinate Panel</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={showPitchGrid}
                  onChange={(e) => setShowPitchGrid(e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span>📏 Pitch Grid Lines</span>
              </label>

              <div style={{ 
                marginTop: '10px', 
                padding: '8px',
                background: 'rgba(170, 68, 255, 0.1)',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#ccc',
                border: '1px solid #AA44FF'
              }}>
                <div style={{ fontWeight: 'bold', color: '#AA44FF', marginBottom: '4px' }}>
                  Marker Legend:
                </div>
                <div>🔵 Release Point (Bowler)</div>
                <div>🔴 Bounce Point (Pitch)</div>
                <div>🟢 Final Point (Batsman)</div>
                <div>📏 Grid = 5m spacing</div>
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 15px',
          background: 'rgba(255, 215, 0, 0.1)',
          borderTop: '1px solid #FFD700',
          textAlign: 'center',
          fontSize: '10px',
          color: '#FFD700'
        }}>
          🏏 Real-time Pitch Analysis & Trajectory Control
        </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CricketUIAccordion;
