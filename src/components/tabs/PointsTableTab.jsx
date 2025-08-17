import React from 'react';
import { getPointsTable, getTeamById } from '../../data/index.js';
import '../../styles/responsive.css';

const PointsTableTab = ({ tournamentId = 'ipl2025' }) => {
  const pointsTable = getPointsTable(tournamentId);
  
  if (!pointsTable || pointsTable.length === 0) {
    return (
      <div className="tab-panel">
        <div style={{ textAlign: 'center' }}>
          <div>Loading points table data...</div>
        </div>
      </div>
    );
  }
  
  // Team Logo Component
  const TeamLogo = ({ teamId, size = 30 }) => {
    const team = getTeamById(teamId);
    
    if (!team) return null;
    
    return (
      <img 
        src={team.logoUrl} 
        alt={`${team.name} logo`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover'
        }}
        onError={(e) => {
          // Fallback to colored circle with initials if image fails
          e.target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.style.width = `${size}px`;
          fallback.style.height = `${size}px`;
          fallback.style.borderRadius = '50%';
          fallback.style.backgroundColor = team.primaryColor;
          fallback.style.color = '#ffffff';
          fallback.style.display = 'flex';
          fallback.style.alignItems = 'center';
          fallback.style.justifyContent = 'center';
          fallback.style.fontWeight = 'bold';
          fallback.style.fontSize = `${size/3}px`;
          fallback.textContent = team.shortName.substring(0, 2);
          e.target.parentNode.appendChild(fallback);
        }}
      />
    );
  };
  
  return (
    <div className="tab-panel points-table-container">
      <h2 className="points-table-title">
        TATA IPL 2025 Points Table
      </h2>
      
      <div className="responsive-table-container">
        <table className="points-table">
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th className="table-header" style={{ textAlign: 'left', minWidth: '200px' }}>Teams</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>P</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>W</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>L</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>NR</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '60px' }}>Pts</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '80px' }}>NRR</th>
            </tr>
          </thead>
          <tbody>
            {pointsTable.map((teamData, index) => {
              const team = getTeamById(teamData.teamId);
              return (
                <tr key={teamData.rank} className="table-row" style={{ borderBottom: index < pointsTable.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td className="team-cell">
                    <div className="team-info-row">
                      <TeamLogo teamId={teamData.teamId} />
                      <span className="team-name">{team?.name || teamData.teamId}</span>
                    </div>
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{teamData.played}</td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{teamData.won}</td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{teamData.lost}</td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{teamData.noResult}</td>
                  <td className="table-cell" style={{ textAlign: 'center', fontWeight: 'bold' }}>{teamData.points}</td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{teamData.nrr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PointsTableTab;
