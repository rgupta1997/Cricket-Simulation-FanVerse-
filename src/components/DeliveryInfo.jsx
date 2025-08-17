import React from 'react';
import { calculateBallTrajectory } from './CricketGameState';

const DeliveryInfo = ({ bowlingControls }) => {
  const trajectory = calculateBallTrajectory(bowlingControls);
  
  const releasePos = trajectory.initial.position;
  const bouncePos = trajectory.bounce.position;
  const finalPos = trajectory.target.position;
  
  // Calculate delivery type based on bounce position
  const bounceDistanceFromBatsman = Math.abs(bouncePos[2] - (-10)); // Distance from striker's end (wicket)
  let deliveryType = '';
  if (bounceDistanceFromBatsman < 2) {
    deliveryType = 'Yorker';
  } else if (bounceDistanceFromBatsman < 6) {
    deliveryType = 'Full Length';
  } else if (bounceDistanceFromBatsman < 10) {
    deliveryType = 'Good Length';
  } else if (bounceDistanceFromBatsman < 15) {
    deliveryType = 'Short of Length';
  } else {
    deliveryType = 'Short Ball';
  }
  
  // Calculate line (wide/straight)
  const linePosition = Math.abs(bouncePos[0]);
  let lineType = '';
  if (linePosition < 0.5) {
    lineType = 'On Stumps';
  } else if (linePosition < 1.0) {
    lineType = linePosition > 0 ? 'Off Stump' : 'Leg Stump';
  } else {
    lineType = linePosition > 0 ? 'Wide (Off)' : 'Wide (Leg)';
  }

  return (
    <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,20,0.9))',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        minWidth: '300px',
        fontFamily: 'Arial, sans-serif',
        border: '2px solid #FFD700',
        boxShadow: '0 4px 15px rgba(255,215,0,0.3)',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: '#FFD700', 
          marginBottom: '8px',
          borderBottom: '1px solid #333',
          paddingBottom: '5px'
        }}>
          🏏 Current Delivery Analysis
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px' }}>
            <div style={{ color: '#FFD700', fontSize: '12px' }}>VELOCITY</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{bowlingControls.velocity} km/h</div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px' }}>
            <div style={{ color: '#FFD700', fontSize: '12px' }}>LENGTH</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#44FF44' }}>{deliveryType}</div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px' }}>
            <div style={{ color: '#FFD700', fontSize: '12px' }}>LINE</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#44AAFF' }}>{lineType}</div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px' }}>
            <div style={{ color: '#FFD700', fontSize: '12px' }}>BOUNCE DISTANCE</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{bounceDistanceFromBatsman.toFixed(1)}m</div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,215,0,0.1)', 
          padding: '8px', 
          borderRadius: '4px',
          border: '1px solid #FFD700'
        }}>
          <div style={{ color: '#FFD700', fontSize: '12px', marginBottom: '4px' }}>TRAJECTORY SUMMARY</div>
          <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>🔵 Release: ({releasePos[0].toFixed(1)}, {releasePos[2].toFixed(1)})</span>
            <span>🔴 Bounce: ({bouncePos[0].toFixed(1)}, {bouncePos[2].toFixed(1)})</span>
            <span>🟢 Final: ({finalPos[0].toFixed(1)}, {finalPos[2].toFixed(1)})</span>
          </div>
        </div>
      </div>
  );
};

export default DeliveryInfo;
