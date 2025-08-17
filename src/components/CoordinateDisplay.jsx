import React from 'react';
import { calculateBallTrajectory } from './CricketGameState';

const CoordinateDisplay = ({ bowlingControls, showDetails = true }) => {
  const trajectory = calculateBallTrajectory(bowlingControls);
  
  const releasePos = trajectory.initial.position;
  const bouncePos = trajectory.bounce.position;
  const finalPos = trajectory.target.position;
  const metadata = trajectory.metadata;

  const formatCoord = (coord) => coord.toFixed(2);
  const formatPosition = (pos) => `(${formatCoord(pos[0])}, ${formatCoord(pos[1])}, ${formatCoord(pos[2])})`;

  return (
    <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        minWidth: '350px',
        fontFamily: 'monospace',
        border: '2px solid #333',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#FFD700', textAlign: 'center' }}>
          🎯 Ball Trajectory Coordinates
        </h3>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          {/* Release Position */}
          <div style={{ 
            padding: '8px', 
            background: 'rgba(0, 102, 255, 0.2)', 
            borderLeft: '4px solid #0066FF',
            borderRadius: '4px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#0066FF', marginBottom: '4px' }}>
              🚀 Release Position
            </div>
            <div>Coordinates: {formatPosition(releasePos)}</div>
            <div style={{ fontSize: '10px', color: '#ccc' }}>
              Line Axis: ({formatCoord(bowlingControls.line_axis_x)}, {formatCoord(bowlingControls.line_axis_z)})
            </div>
          </div>

          {/* Bounce Position */}
          <div style={{ 
            padding: '8px', 
            background: 'rgba(255, 68, 68, 0.2)', 
            borderLeft: '4px solid #FF4444',
            borderRadius: '4px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#FF4444', marginBottom: '4px' }}>
              ⚡ Bounce Position
            </div>
            <div>Coordinates: {formatPosition(bouncePos)}</div>
            <div style={{ fontSize: '10px', color: '#ccc' }}>
              Length Axis: ({formatCoord(bowlingControls.length_axis_x)}, {formatCoord(bowlingControls.length_axis_z)})
            </div>
          </div>

          {/* Final Position */}
          <div style={{ 
            padding: '8px', 
            background: 'rgba(68, 255, 68, 0.2)', 
            borderLeft: '4px solid #44FF44',
            borderRadius: '4px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#44FF44', marginBottom: '4px' }}>
              🎯 Final Position
            </div>
            <div>Coordinates: {formatPosition(finalPos)}</div>
            <div style={{ fontSize: '10px', color: '#ccc' }}>
              Ball Axis: ({formatCoord(bowlingControls.ball_axis_x)}, {formatCoord(bowlingControls.ball_axis_y)})
            </div>
          </div>

          {showDetails && (
            <>
              {/* Pitch Analysis Data */}
              <div style={{ 
                padding: '8px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderLeft: '4px solid #FFD700',
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: 'bold', color: '#FFD700', marginBottom: '4px' }}>
                  📊 Pitch Analysis
                </div>
                <div>Velocity: {bowlingControls.velocity} km/h</div>
                <div>Flight Time: {formatCoord(metadata.totalTime)} sec</div>
                <div>Bounce Time: {formatCoord(metadata.bounceTime)} sec</div>
              </div>

              {/* Distance Measurements */}
              <div style={{ 
                padding: '8px', 
                background: 'rgba(128, 128, 128, 0.2)', 
                borderLeft: '4px solid #888',
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: 'bold', color: '#888', marginBottom: '4px' }}>
                  📏 Distances
                </div>
                <div>Release to Bounce: {formatCoord(Math.sqrt(
                  Math.pow(bouncePos[0] - releasePos[0], 2) + 
                  Math.pow(bouncePos[2] - releasePos[2], 2)
                ))} m</div>
                <div>Bounce to Final: {formatCoord(Math.sqrt(
                  Math.pow(finalPos[0] - bouncePos[0], 2) + 
                  Math.pow(finalPos[2] - bouncePos[2], 2)
                ))} m</div>
                <div>Total Distance: {formatCoord(Math.sqrt(
                  Math.pow(finalPos[0] - releasePos[0], 2) + 
                  Math.pow(finalPos[2] - releasePos[2], 2)
                ))} m</div>
              </div>
            </>
          )}
        </div>

        <div style={{ 
          marginTop: '10px', 
          padding: '5px', 
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '3px',
          fontSize: '10px',
          color: '#aaa',
          textAlign: 'center'
        }}>
          🏏 Live trajectory coordinates from pitch analysis
        </div>
      </div>
  );
};

export default CoordinateDisplay;
