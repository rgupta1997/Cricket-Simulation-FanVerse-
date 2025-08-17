import React, { useState } from 'react';
import { getTeamById } from '../../data/index.js';
import '../../styles/responsive.css';

const WagonWheelTab = ({ matchDetail, match }) => {
  const [selectedTeam, setSelectedTeam] = useState('team1');
  
  if (!matchDetail || !matchDetail.wagonWheel) {
    return (
      <div className="tab-panel">
        <div style={{ textAlign: 'center' }}>
          <div>No wagon wheel data available for this match.</div>
        </div>
      </div>
    );
  }
  
  // Get team data
  const team1 = getTeamById(match.team1Id);
  const team2 = getTeamById(match.team2Id);
  
  // Get wagon wheel data for selected team
  const wagonWheelData = matchDetail.wagonWheel[selectedTeam] || matchDetail.wagonWheel.team1 || matchDetail.wagonWheel;
  
  // Standardized field positions with angles (rotated so Square Leg is at Long On position)
  // Rotated by 270° clockwise: Square Leg moves from 0° to 270° (Long On position)
  // Each zone is 45° wide, so labels are positioned at center of each zone (22.5° intervals)
  const fieldPositions = [
    { name: 'SQUARE LEG', angle: 292.5, angleRad: 5.1051 }, // Center of 270-315° zone
    { name: 'FINE LEG', angle: 337.5, angleRad: 5.8905 },   // Center of 315-360° zone
    { name: 'THIRD MAN', angle: 22.5, angleRad: 0.3927 },   // Center of 0-45° zone
    { name: 'POINT', angle: 67.5, angleRad: 1.1781 },       // Center of 45-90° zone
    { name: 'COVER', angle: 112.5, angleRad: 1.9635 },      // Center of 90-135° zone
    { name: 'LONG OFF', angle: 157.5, angleRad: 2.7489 },   // Center of 135-180° zone
    { name: 'LONG ON', angle: 202.5, angleRad: 3.5343 },    // Center of 180-225° zone
    { name: 'MID WICKET', angle: 247.5, angleRad: 4.3197 }  // Center of 225-270° zone
  ];
  
  // Helper function to match field positions
  const matchFieldPosition = (key) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
    
    // Direct matches
    const directMatch = fieldPositions.find(pos => 
      pos.name.toLowerCase().replace(/[^a-z]/g, '') === normalizedKey
    );
    if (directMatch) return directMatch;
    
    // Partial matches
    const partialMatch = fieldPositions.find(pos => 
      normalizedKey.includes(pos.name.toLowerCase().replace(/[^a-z]/g, '')) ||
      pos.name.toLowerCase().replace(/[^a-z]/g, '').includes(normalizedKey)
    );
    if (partialMatch) return partialMatch;
    
    // Special cases - map to center positions
    if (normalizedKey.includes('squareleg') || normalizedKey.includes('square')) return fieldPositions[0]; // 292.5°
    if (normalizedKey.includes('fineleg') || normalizedKey.includes('fine')) return fieldPositions[1];     // 337.5°
    if (normalizedKey.includes('thirdman') || normalizedKey.includes('third')) return fieldPositions[2];   // 22.5°
    if (normalizedKey.includes('point')) return fieldPositions[3];                                         // 67.5°
    if (normalizedKey.includes('cover')) return fieldPositions[4];                                         // 112.5°
    if (normalizedKey.includes('longoff') || normalizedKey.includes('longoff')) return fieldPositions[5]; // 157.5°
    if (normalizedKey.includes('longon') || normalizedKey.includes('longon')) return fieldPositions[6];   // 202.5°
    if (normalizedKey.includes('midwicket') || normalizedKey.includes('mid')) return fieldPositions[7];   // 247.5°
    
    // Default to square leg center
    return fieldPositions[0];
  };

  // Convert runsByArea object to array and map to standardized positions
  const runsByAreaArray = wagonWheelData.runsByArea ? 
    Object.entries(wagonWheelData.runsByArea).map(([key, area]) => {
      const position = matchFieldPosition(key);
      
      return {
        key,
        ...area,
        position,
        angle: position.angle,
        angleRad: position.angleRad
      };
    }) : [];
  
    return (
    <div className="tab-panel wagon-wheel-container">
      <h3 className="wagon-wheel-title">
        Wagon Wheel - Run Distribution
      </h3>
      
      {/* Team Selection */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '20px',
        padding: '10px'
      }}>
        <button
          onClick={() => setSelectedTeam('team1')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 20px',
            backgroundColor: selectedTeam === 'team1' ? '#3b82f6' : '#f3f4f6',
            color: selectedTeam === 'team1' ? 'white' : '#374151',
            border: '2px solid',
            borderColor: selectedTeam === 'team1' ? '#3b82f6' : '#d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          <img 
            src={team1?.logoUrl || '/logos/default.png'} 
            alt={team1?.name || 'Team 1'}
            style={{ width: '30px', height: '30px', borderRadius: '50%' }}
            onError={(e) => {
              e.target.src = '/logos/default.png';
            }}
          />
          {team1?.name || 'Team 1'}
        </button>
        
        <button
          onClick={() => setSelectedTeam('team2')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 20px',
            backgroundColor: selectedTeam === 'team2' ? '#3b82f6' : '#f3f4f6',
            color: selectedTeam === 'team2' ? 'white' : '#374151',
            border: '2px solid',
            borderColor: selectedTeam === 'team2' ? '#3b82f6' : '#d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          <img 
            src={team2?.logoUrl || '/logos/default.png'} 
            alt={team2?.name || 'Team 2'}
            style={{ width: '30px', height: '30px', borderRadius: '50%' }}
            onError={(e) => {
              e.target.src = '/logos/default.png';
            }}
          />
          {team2?.name || 'Team 2'}
        </button>
      </div>
       
               {/* Debug info - can be removed later */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '10px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            <strong>Debug Info:</strong>
            <div>Selected Team: {selectedTeam} ({selectedTeam === 'team1' ? team1?.name : team2?.name})</div>
            <div>Original data keys: {Object.keys(wagonWheelData.runsByArea || {}).join(', ')}</div>
            <div>Mapped positions: {runsByAreaArray.map(area => `${area.key} → ${area.position.name} (${area.position.angle}°)`).join(', ')}</div>
          </div>
        )}

      {/* Cricket Field Diagram */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px',
        padding: '20px' 
      }}>
        <svg 
          className="cricket-field"
          viewBox="0 0 400 400" 
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            height: 'auto' 
          }}
        >
          {/* Outer field circle - green */}
          <circle 
            cx="200" 
            cy="200" 
            r="180" 
            fill="#22c55e" 
            stroke="#166534" 
            strokeWidth="3"
          />
          
          {/* Inner circle */}
          <circle 
            cx="200" 
            cy="200" 
            r="120" 
            fill="none" 
            stroke="#166534" 
            strokeWidth="2" 
            strokeDasharray="5,5"
          />
          
          {/* 30-yard circle */}
          <circle 
            cx="200" 
            cy="200" 
            r="80" 
            fill="none" 
            stroke="#166534" 
            strokeWidth="2"
          />
          
          {/* Center dot for perspective */}
          <circle 
            cx="200" 
            cy="200" 
            r="3" 
            fill="#8b5a2b"
          />
          
                     {/* Direction labels on circular path using standardized positions */}
           {fieldPositions.map((position) => {
             const radius = 185;
             // Convert cricket field angle to SVG coordinate system (subtract 90° to align with cricket field)
             const svgAngle = position.angle - 90;
             const x = 200 + Math.cos(svgAngle * Math.PI / 180) * radius;
             const y = 200 + Math.sin(svgAngle * Math.PI / 180) * radius;
             
             return (
               <text
                 key={position.angle}
                 x={x}
                 y={y}
                 textAnchor="middle"
                 fontSize="10"
                 fontWeight="bold"
                 fill="#000"
                 transform={`rotate(${svgAngle+88}, ${x}, ${y})`}
               >
                 {position.name}
               </text>
             );
           })}
          
                     {/* Run visualization based on standardized positions */}
           {runsByAreaArray.map((area, index) => {
             const runs = area.runs || 0;
             
             // Position run count just before the zone name (slightly closer to center)
             const labelRadius = 165; // Same as zone name labels
             const runRadius = labelRadius - 20; // Slightly closer to center than zone names
             
             // Use the standardized angle from the mapped position
             const svgAngle = area.angle - 90; // Convert to SVG coordinate system
             const x = 200 + Math.cos(svgAngle * Math.PI / 180) * runRadius;
             const y = 200 + Math.sin(svgAngle * Math.PI / 180) * runRadius;
             
             return (
               <g key={area.key || index}>
                 {/* Run count positioned just before zone name */}
                 <text
                   x={x}
                   y={y}
                   textAnchor="middle"
                   fontSize="12"
                   fontWeight="bold"
                   fill="#000"
                   dy="0.3em"
                 >
                   {runs}
                 </text>
               </g>
             );
           })}
        </svg>
      </div>

      <div className="wagon-wheel-stats">
        <div className="stat-item">
          <div className="stat-value">
            {wagonWheelData.offSide.runs}
          </div>
          <div className="stat-label">Off Side ({wagonWheelData.offSide.percentage}%)</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {wagonWheelData.onSide.runs}
          </div>
          <div className="stat-label">On Side ({wagonWheelData.onSide.percentage}%)</div>
        </div>
      </div>

             <div className="field-regions">
         {runsByAreaArray.map((area, index) => (
           <div key={area.key || index} className="region-stat">
             <div className="region-runs">
               {area.runs}
             </div>
             <div className="region-name">
               {area.position.name}
             </div>
             <div className="region-details">
               {area.boundaries || 0} boundaries | {area.position.angle}°
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};

export default WagonWheelTab;