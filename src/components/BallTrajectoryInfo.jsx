import React from 'react';
import { calculateBallTrajectory } from './CricketGameState';

const BallTrajectoryInfo = ({ bowlingControls }) => {
  const trajectory = calculateBallTrajectory(bowlingControls);
  
  return (
    <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '11px',
        fontFamily: 'monospace',
        border: '1px solid #333',
        minWidth: '200px'
      }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 'bold', 
          color: '#FFD700', 
          marginBottom: '8px',
          borderBottom: '1px solid #333',
          paddingBottom: '3px'
        }}>
          🎯 Ball Trajectory Details
        </div>
        
        <div style={{ display: 'grid', gap: '6px' }}>
          <div style={{ background: 'rgba(0, 102, 255, 0.2)', padding: '4px', borderRadius: '3px' }}>
            <div style={{ color: '#0066FF', fontWeight: 'bold', fontSize: '10px' }}>🔵 RELEASE</div>
            <div>X: {trajectory.initial.position[0].toFixed(2)}m</div>
            <div>Y: {trajectory.initial.position[1].toFixed(2)}m</div>
            <div>Z: {trajectory.initial.position[2].toFixed(2)}m</div>
          </div>

          <div style={{ background: 'rgba(255, 68, 68, 0.2)', padding: '4px', borderRadius: '3px' }}>
            <div style={{ color: '#FF4444', fontWeight: 'bold', fontSize: '10px' }}>🔴 BOUNCE</div>
            <div>X: {trajectory.bounce.position[0].toFixed(2)}m</div>
            <div>Y: {trajectory.bounce.position[1].toFixed(2)}m</div>
            <div>Z: {trajectory.bounce.position[2].toFixed(2)}m</div>
          </div>

          <div style={{ background: 'rgba(68, 255, 68, 0.2)', padding: '4px', borderRadius: '3px' }}>
            <div style={{ color: '#44FF44', fontWeight: 'bold', fontSize: '10px' }}>🟢 FINAL (AT WICKET)</div>
            <div>X: {trajectory.target.position[0].toFixed(2)}m</div>
            <div>Y: {trajectory.target.position[1].toFixed(2)}m (changeable)</div>
            <div>Z: {trajectory.target.position[2].toFixed(2)}m (fixed at wicket)</div>
          </div>
        </div>

        <div style={{ 
          marginTop: '8px', 
          padding: '4px',
          background: trajectory.metadata.useDirectCoordinates 
            ? 'rgba(68, 255, 68, 0.1)' 
            : 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          fontSize: '9px',
          color: '#aaa',
          border: trajectory.metadata.useDirectCoordinates 
            ? '1px solid #44FF44' 
            : '1px solid #333'
        }}>
          <div style={{ color: '#FFD700', fontWeight: 'bold' }}>
            {trajectory.metadata.useDirectCoordinates ? '🎯 Direct Coordinates:' : '⚠️ Trajectory Rules:'}
          </div>
          {trajectory.metadata.useDirectCoordinates ? (
            <>
              <div>• Using direct X,Y,Z world coordinates</div>
              <div>• Full manual control of ball trajectory</div>
              <div>• Coordinates in meters (3D world space)</div>
            </>
          ) : (
            <>
              <div>• Final Z position: Always at wicket (-10m)</div>
              <div>• Final Y position: Controlled by ball_axis_y</div>
              <div>• Final X position: Controlled by ball_axis_x</div>
            </>
          )}
        </div>
      </div>
  );
};

export default BallTrajectoryInfo;
