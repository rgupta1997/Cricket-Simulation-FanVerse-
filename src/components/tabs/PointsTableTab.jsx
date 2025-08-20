import React, { useState, useEffect } from 'react';
import '../../styles/responsive.css';

const PointsTableTab = ({ matchDetail, seriesId = '9924' }) => {
  const [pointsTable, setPointsTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seriesInfo, setSeriesInfo] = useState(null);

  // Extract series ID from matchDetail
  const dynamicSeriesId = matchDetail?.Matchdetail?.Series?.Id || 
                          matchDetail?.Matchdetail?.Series?.Series_Id || 
                          seriesId;

  console.log('PointsTableTab - matchDetail:', matchDetail);
  console.log('PointsTableTab - extracted seriesId:', dynamicSeriesId);

  // Function to fetch points table data from API
  const fetchPointsTable = async (currentSeriesId) => {
    if (!currentSeriesId) {
      console.warn('No series ID available to fetch points table');
      setError('Series ID not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching points table for series ID:', currentSeriesId);
      
      const response = await fetch('https://playground-dev.sportz.io/api/pointsTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          series_id: currentSeriesId.toString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.standings?.standings?.stages?.stage?.[0]?.group?.[0]?.entities?.entity) {
        const teams = data.standings.standings.stages.stage[0].group[0].entities.entity;
        const seriesData = data.standings.standings.sport?.series;
        
        setSeriesInfo(seriesData);
        setPointsTable(teams);
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (err) {
      console.error('Error fetching points table:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPointsTable(dynamicSeriesId);
  }, [dynamicSeriesId]);

  if (loading) {
    return (
      <div className="tab-panel">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading points table data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-panel">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>Error loading points table: {error}</div>
          <button 
            onClick={() => fetchPointsTable(dynamicSeriesId)}
            style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!pointsTable || pointsTable.length === 0) {
    return (
      <div className="tab-panel">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>No points table data available</div>
        </div>
      </div>
    );
  }
  
  // Team Logo Component - using team short name as initials
  const TeamLogo = ({ shortName, size = 30 }) => {
    // Generate a color based on team name for consistency
    const getTeamColor = (name) => {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
        '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
        '#FF6348', '#2ED573', '#3742FA', '#5758BB', '#6C5CE7'
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: getTeamColor(shortName),
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: `${size/2.5}px`,
          textTransform: 'uppercase'
        }}
      >
        {shortName.substring(0, 2)}
      </div>
    );
  };

  // Position Status Component
  const PositionIndicator = ({ positionStatus }) => {
    const getIndicatorStyle = (status) => {
      switch (status) {
        case 'Up':
          return { color: '#10B981', symbol: '↑' };
        case 'Down':
          return { color: '#EF4444', symbol: '↓' };
        case 'No Change':
          return { color: '#6B7280', symbol: '−' };
        default:
          return { color: '#6B7280', symbol: '−' };
      }
    };

    const style = getIndicatorStyle(positionStatus);
    
    return (
      <span style={{ color: style.color, fontSize: '14px', marginLeft: '4px' }}>
        {style.symbol}
      </span>
    );
  };
  
  return (
    <div className="tab-panel points-table-container">
      <h2 className="points-table-title">
        {seriesInfo?.name || 'Points Table'}
      </h2>
      
      <div className="responsive-table-container">
        <table className="points-table">
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>Pos</th>
              <th className="table-header" style={{ textAlign: 'left', minWidth: '200px' }}>Teams</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>P</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>W</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>L</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>T</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>NR</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '60px' }}>Pts</th>
              <th className="table-header" style={{ textAlign: 'center', minWidth: '80px' }}>NRR</th>
            </tr>
          </thead>
          <tbody>
            {pointsTable.map((team, index) => {
              const stats = team.sport_specific_keys;
              return (
                <tr key={team.id} className="table-row" style={{ borderBottom: index < pointsTable.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td className="table-cell" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                    {team.position}
                    <PositionIndicator positionStatus={team.position_status} />
                  </td>
                  <td className="team-cell">
                    <div className="team-info-row">
                      <TeamLogo shortName={team.short_name} />
                      <span className="team-name">{team.name}</span>
                    </div>
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{stats.events_played}</td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{stats.wins}</td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{stats.lost}</td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{stats.tied}</td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{stats.no_result}</td>
                  <td className="table-cell" style={{ textAlign: 'center', fontWeight: 'bold' }}>{stats.points}</td>
                  <td className="table-cell" style={{ textAlign: 'center', color: '#6b7280' }}>{stats.net_run_rate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default PointsTableTab;
