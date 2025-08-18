import React, { useState } from 'react';
import BowlingConfigPanel from './BowlingConfigPanel';
import BallShotControl from './BallShotControl';
import CoordinateDisplay from './CoordinateDisplay';
import DeliveryInfo from './DeliveryInfo';
import CameraControlsDisabled from './CameraControlsDisabled';
import DirectCoordinateControls from './DirectCoordinateControls';
import { calculateBallTrajectory } from './CricketGameState';

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
  onBowlingConfigUpdate,
  onBallShotConfigUpdate,
  showPitchMarkers,
  setShowPitchMarkers,
  showCoordinateDisplay,
  setShowCoordinateDisplay,
  showPitchGrid,
  setShowPitchGrid,
  currentCameraView,
  onCameraViewChange
}) => {
  const [openSections, setOpenSections] = useState({
    config: true,
    xyz: false,
    analysis: false,
    coordinates: false,
    camera: false,
    guides: false,
    ballTrajectory: false,
    ballShot: true  // Set to true to show by default
  });

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
          {/* Bowling Configuration Section */}
          <AccordionSection
            title="Bowling Configuration"
            icon="🎯"
            color="#0066FF"
            isOpen={openSections.config}
            onToggle={() => toggleSection('config')}
          >
            <div>
              <button 
                onClick={() => {
                  const analysisConfig = {
                    velocity: 133.5,
                    ball_axis_x: 35.74,
                    ball_axis_y: 18.40,
                    length_axis_x: 55.89,
                    length_axis_z: 8.07,
                    line_axis_x: 39.04,
                    line_axis_z: 23.93
                  };
                  onBowlingConfigUpdate(analysisConfig);
                }}
                style={{
                  width: '100%',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              >
                🎯 Load Pitch Analysis Data
              </button>

              <div style={{ display: 'grid', gap: '8px' }}>
                {[
                  { key: 'velocity', label: 'Velocity (km/h)', step: '1' },
                  { key: 'ball_axis_x', label: 'Ball Axis X', step: '1' },
                  { key: 'ball_axis_y', label: 'Ball Axis Y', step: '1' },
                  { key: 'length_axis_x', label: 'Length Axis X', step: '1' },
                  { key: 'length_axis_z', label: 'Length Axis Z', step: '1' },
                  { key: 'line_axis_x', label: 'Line Axis X', step: '1' },
                  { key: 'line_axis_z', label: 'Line Axis Z', step: '1' }
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ flex: 1, fontSize: '11px' }}>{field.label}:</label>
                    <input
                      type="number"
                      step={field.step}
                      value={gameState.controls.bowling[field.key]}
                      onChange={(e) => {
                        const newConfig = { ...gameState.controls.bowling, [field.key]: parseFloat(e.target.value) };
                        onBowlingConfigUpdate(newConfig);
                      }}
                      style={{
                        width: '70px',
                        padding: '4px',
                        border: '1px solid #333',
                        borderRadius: '3px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        fontSize: '10px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </AccordionSection>

          {/* Direct X,Y,Z Coordinate Controls */}
          <AccordionSection
            title="Direct X,Y,Z Controls"
            icon="🎯"
            color="#00FF88"
            isOpen={openSections.xyz}
            onToggle={() => toggleSection('xyz')}
          >
            <DirectCoordinateControls 
              bowlingControls={gameState.controls.bowling}
              onUpdate={onBowlingConfigUpdate}
            />
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

      <style jsx>{`
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
