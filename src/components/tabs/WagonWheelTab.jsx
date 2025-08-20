import React, { useState, useEffect } from 'react';
import webappApiService from '../../services/webappApiService.js';
import '../../styles/responsive.css';

// Wagon Wheel Diagram Component
const WagonWheelDiagram = ({ zones = [], maxRuns = 100 }) => {
  // Map zone names to cricket field positions (in degrees)
  const zonePositions = {
    'Square Leg': 0,
    'Fine Leg': 45, 
    'Third Man': 90,
    'Point': 135,
    'Cover': 180,
    'Long Off': 225,
    'Long On': 270,
    'Mid Wicket': 315,
    'Mid Off': 225, // Fallback to Long Off position
    'Mid On': 270   // Fallback to Long On position
  };

  // Get position for a zone, with fallback handling
  const getZonePosition = (zoneName) => {
    // Try exact match first
    if (zonePositions[zoneName]) {
      return zonePositions[zoneName];
    }
    
    // Try partial matches
    const normalizedName = zoneName.toLowerCase();
    for (const [key, value] of Object.entries(zonePositions)) {
      if (key.toLowerCase().includes(normalizedName) || normalizedName.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // Default fallback
    return 0;
  };

  const centerX = 200;
  const centerY = 200;
  const radius = 150;

  return (
    <svg width="400" height="400" viewBox="0 0 400 400" style={{ maxWidth: '400px', height: 'auto' }}>
      {/* Outer boundary circle */}
      <circle 
        cx={centerX} 
        cy={centerY} 
        r={radius} 
        fill="#22c55e" 
        stroke="#166534" 
        strokeWidth="3"
      />
      
      {/* Inner circles for distance markers */}
      <circle cx={centerX} cy={centerY} r={radius * 0.7} fill="none" stroke="#166534" strokeWidth="2" strokeDasharray="5,5" />
      <circle cx={centerX} cy={centerY} r={radius * 0.4} fill="none" stroke="#166534" strokeWidth="2" strokeDasharray="5,5" />
      
      {/* 8 radial lines for zones */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
        const radian = (angle - 90) * (Math.PI / 180); // Subtract 90 to start from top
        const x2 = centerX + Math.cos(radian) * radius;
        const y2 = centerY + Math.sin(radian) * radius;
        
        return (
          <line
            key={angle}
            x1={centerX}
            y1={centerY}
            x2={x2}
            y2={y2}
            stroke="#166534"
            strokeWidth="2"
            opacity={0.7}
          />
        );
      })}

      {/* Zone labels and data */}
      {zones?.map((zone, index) => {
        const zoneName = zone.name || zone.zone_name;
        const runs = zone.total_runs || 0;
        const angle = getZonePosition(zoneName);
        const radian = (angle - 90) * (Math.PI / 180);
        
        // Position labels at edge of circle
        const labelX = centerX + Math.cos(radian) * (radius + 20);
        const labelY = centerY + Math.sin(radian) * (radius + 20);
        
        // Calculate run bubble size based on runs (min 5px, max 25px)
        const bubbleRadius = Math.max(5, Math.min(25, (runs / maxRuns) * 25));
        const bubbleX = centerX + Math.cos(radian) * (radius * 0.8);
        const bubbleY = centerY + Math.sin(radian) * (radius * 0.8);
        
        // Color based on runs scored
        const getBubbleColor = (runs) => {
          if (runs === 0) return '#9ca3af'; // Gray for no runs
          if (runs <= 5) return '#10b981'; // Green for low runs
          if (runs <= 15) return '#f59e0b'; // Amber for medium runs
          if (runs <= 30) return '#ef4444'; // Red for high runs
          return '#7c3aed'; // Purple for very high runs
        };
        
        return (
          <g key={zoneName || index}>
            {/* Run bubble */}
            <circle
              cx={bubbleX}
              cy={bubbleY}
              r={bubbleRadius}
              fill={getBubbleColor(runs)}
              opacity={0.8}
              stroke="white"
              strokeWidth="1"
            />
            
            {/* Run count text in bubble */}
            <text
              x={bubbleX}
              y={bubbleY}
              textAnchor="middle"
              dy="0.3em"
              fontSize="10"
              fontWeight="bold"
              fill="white"
            >
              {runs}
            </text>
            
            {/* Zone name label background */}
            <rect
              x={labelX - zoneName.length * 2.5}
              y={labelY - 6}
              width={zoneName.length * 5}
              height={12}
              fill="white"
              stroke="#ddd"
              strokeWidth="0.5"
              rx="2"
              opacity={0.8}
            />
            
            {/* Zone name label */}
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="#000"
            >
              {zoneName}
            </text>
          </g>
        );
      })}
      
      {/* Center dot */}
      <circle cx={centerX} cy={centerY} r="4" fill="#8b5a2b" />
      

    </svg>
  );
};

const WagonWheelTab = ({ matchDetail, match }) => {
  const [activeTeamTab, setActiveTeamTab] = useState('team1');
  const [selectedPlayer, setSelectedPlayer] = useState('all'); // 'all' for combined data
  const [wagonWheelData, setWagonWheelData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Helper function to get team name
  const getTeamName = (teamId) => {
    if (!teamId || !matchDetail.Teams || !matchDetail.Teams[teamId]) {
      return `Team ${teamId}`;
    }
    return matchDetail.Teams[teamId].Name_Full || matchDetail.Teams[teamId].Name_Short || `Team ${teamId}`;
  };

  // Helper function to get player name
  const getPlayerName = (playerId, teamId = null) => {
    if (!playerId || !matchDetail.Teams) {
      return `Player ${playerId}`;
    }

    // If teamId is provided, search in that specific team
    if (teamId && matchDetail.Teams[teamId] && matchDetail.Teams[teamId].Players && matchDetail.Teams[teamId].Players[playerId]) {
      const player = matchDetail.Teams[teamId].Players[playerId];
      return player.Name_Short || player.name || `Player ${playerId}`;
    }

    // Search across all teams if no specific teamId or not found in specific team
    for (const teamKey in matchDetail.Teams) {
      const team = matchDetail.Teams[teamKey];
      if (team.Players && team.Players[playerId]) {
        const player = team.Players[playerId];
        return player.Name_Short || player.name || `Player ${playerId}`;
      }
    }

    return `Player ${playerId}`;
  };

  // Extract player IDs from innings data (similar to scorecard implementation)
  const getTeamPlayerIds = (teamId) => {
    if (!matchDetail || !matchDetail.Innings) {
      return [];
    }

    const playerIds = new Set();
    
    // Go through all innings and find batsmen from the specified team
    matchDetail.Innings.forEach(innings => {
      if (innings.Battingteam === teamId && innings.Batsmen) {
        innings.Batsmen.forEach(batsman => {
          if (batsman.Batsman && batsman.Runs !== "") {
            playerIds.add(batsman.Batsman);
          }
        });
      }
    });

    return Array.from(playerIds);
  };

  // Get team IDs from match detail
  const getTeamIds = () => {
    if (!matchDetail || !matchDetail.Teams) {
      return { team1: null, team2: null };
    }
    
    const teamIds = Object.keys(matchDetail.Teams);
    return {
      team1: teamIds[0] || null,
      team2: teamIds[1] || null
    };
  };

  const { team1: team1Id, team2: team2Id } = getTeamIds();

  // Fetch wagon wheel data for a team
  const fetchWagonWheelData = async (teamId) => {
    if (!teamId || !match?.matchId) {
      console.warn('Missing teamId or match.matchId for wagon wheel data');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get player IDs for the team
      const playerIds = getTeamPlayerIds(teamId);
      
      if (playerIds.length === 0) {
        console.warn('No player IDs found for team:', teamId);
        setError('No player data available for this team');
        return;
      }

      console.log('🎯 Fetching wagon wheel data for team:', teamId, 'players:', playerIds, 'match.matchId:', match.matchId);

      // Use the match_id from fill events API (stored as match.matchId)
      const data = await webappApiService.getWagonWheelData(match.matchId, playerIds);
      
      // Store data for this team
      setWagonWheelData(prevData => ({
        ...prevData,
        [teamId]: data
      }));

    } catch (err) {
      console.error('Error fetching wagon wheel data:', err);
      setError(`Failed to load wagon wheel data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when team tab changes or component mounts
  useEffect(() => {
    const currentTeamId = activeTeamTab === 'team1' ? team1Id : team2Id;
    if (currentTeamId && !wagonWheelData[currentTeamId]) {
      fetchWagonWheelData(currentTeamId);
    }
  }, [activeTeamTab, team1Id, team2Id, match?.matchId]);

  // Check if we have the required data
  if (!matchDetail || !matchDetail.Innings) {
    return (
      <div className="tab-panel">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>No match data available for wagon wheel analysis.</div>
        </div>
      </div>
    );
  }
  
  // Get current team's data
  const currentTeamId = activeTeamTab === 'team1' ? team1Id : team2Id;
  const currentTeamData = wagonWheelData[currentTeamId];
  const currentTeamPlayers = currentTeamData?.players || [];

  // Get selected player data (or combined data if 'all' is selected)
  const getDisplayData = () => {
    if (!currentTeamData) return null;
    
    if (selectedPlayer === 'all') {
      return {
        ...currentTeamData,
        isTeamData: true
      };
    } else {
      const playerData = currentTeamPlayers.find(p => p.player_id === selectedPlayer);
      return playerData ? { ...playerData, isTeamData: false } : null;
    }
  };

  const displayData = getDisplayData();
  
    return (
    <div className="tab-panel">
      <div style={{ padding: '20px' }}>
        <h3 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px', 
          textAlign: 'center',
          color: '#1f2937'
        }}>
          🎯 Wagon Wheel Analysis
      </h3>
      
        {/* Team Selection Tabs */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
          gap: '10px', 
        marginBottom: '20px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '10px'
      }}>
        <button
            onClick={() => {
              setActiveTeamTab('team1');
              setSelectedPlayer('all'); // Reset player selection when switching teams
            }}
          style={{
              padding: '12px 24px',
              backgroundColor: activeTeamTab === 'team1' ? '#3b82f6' : 'transparent',
              color: activeTeamTab === 'team1' ? 'white' : '#374151',
              border: '2px solid #3b82f6',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
              fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
            {getTeamName(team1Id)}
        </button>
        
        <button
            onClick={() => {
              setActiveTeamTab('team2');
              setSelectedPlayer('all'); // Reset player selection when switching teams
            }}
          style={{
              padding: '12px 24px',
              backgroundColor: activeTeamTab === 'team2' ? '#3b82f6' : 'transparent',
              color: activeTeamTab === 'team2' ? 'white' : '#374151',
              border: '2px solid #3b82f6',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
              fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
            {getTeamName(team2Id)}
        </button>
      </div>
       
        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>Loading wagon wheel data...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Player Selection Dropdown */}
        {currentTeamData && !loading && !error && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#374151'
            }}>
              Select Player:
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{ 
                padding: '8px 12px',
                borderRadius: '6px',
                border: '2px solid #d1d5db',
                fontSize: '14px',
                minWidth: '200px'
              }}
            >
              <option value="all">All Players Combined</option>
              {currentTeamPlayers.map(player => (
                <option key={player.player_id} value={player.player_id}>
                  {player.player_name} ({player.runs} runs, {player.balls_played} balls)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Data Display */}
        {displayData && !loading && (
          <div>
            {/* Visual Wagon Wheel */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                color: '#1e293b'
              }}>
                Wagon Wheel Visualization
              </h4>
              
              <div style={{ 
                display: 'flex', 
                gap: '20px',
                alignItems: 'flex-start',
                justifyContent: 'center',
                marginBottom: '20px' 
              }}>
                {/* Runs by Zone Legend */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  width: '200px',
                  alignSelf: 'flex-start'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    🎯 Runs by Zone
                  </h4>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    Size = runs, Color = range:
                  </div>
                  
                  {/* Color Legend Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af'
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#374151' }}>0 runs</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981'
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#374151' }}>1-5 runs</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#f59e0b'
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#374151' }}>6-15 runs</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444'
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#374151' }}>16-30 runs</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#7c3aed'
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#374151' }}>30+ runs</span>
                    </div>
                  </div>
                </div>
                
                {/* Centered Wagon Wheel */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  flex: '0 0 auto'
                }}>
                  <WagonWheelDiagram 
                    zones={displayData.isTeamData ? displayData.combined_zones : displayData.zones}
                    maxRuns={Math.max(...(displayData.isTeamData ? displayData.combined_zones : displayData.zones)?.map(z => z.total_runs || 0) || [0])}
                  />
                </div>
                
                {/* Placeholder for balance (optional) */}
                <div style={{ width: '200px' }}></div>
              </div>
            </div>

            {/* Zone Data Grid */}
            <div>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                color: '#1e293b'
              }}>
                Zone-wise Breakdown
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '16px',
                marginTop: '20px'
              }}>
                {(displayData.isTeamData ? displayData.combined_zones : displayData.zones)?.map((zone, index) => (
                  <div 
                    key={zone.id || zone.zone_id || index}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    {/* Zone Name */}
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold', 
                      color: '#1f2937',
                      marginBottom: '16px',
                      textAlign: 'center',
                      borderBottom: '2px solid #f3f4f6',
                      paddingBottom: '8px'
                    }}>
                      🎯 {zone.name || zone.zone_name}
                    </div>
                    
                    {/* Stats Container */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', gap: '16px' }}>
                      {/* Runs */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        flex: 1
                      }}>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: '#dc2626',
                          marginBottom: '4px'
                        }}>
                          {zone.total_runs}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          RUNS
                        </div>
                      </div>
                      
                      {/* Balls */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        flex: 1
                      }}>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: '#059669',
                          marginBottom: '4px'
                        }}>
                          {zone.total_balls}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          BALLS
                        </div>
                      </div>
                      
                      {/* Score Percentage (optional) */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        flex: 1
                      }}>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: 'bold', 
                          color: '#7c3aed',
                          marginBottom: '4px'
                        }}>
                          {displayData.isTeamData ? 
                            `${zone.total_score_percentage?.toFixed(1)}%` : 
                            `${zone.score_percentage}%`
                          }
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          SCORE %
                        </div>
                      </div>
                    </div>
                    
                    {/* Player Count for Team Data */}
                    {displayData.isTeamData && (
                      <div style={{ 
                        marginTop: '16px',
                        padding: '8px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          color: '#166534',
                          fontWeight: '500'
                        }}>
                          👥 {zone.player_count} Players
                        </span>
                      </div>
                    )}
                  </div>
                )) || (
                  <div style={{ 
                    gridColumn: '1 / -1',
                    textAlign: 'center', 
                    padding: '40px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{ 
                      fontSize: '48px', 
                      marginBottom: '16px', 
                      color: '#9ca3af' 
                    }}>📊</div>
                    <div style={{ 
                      color: '#6b7280', 
                      fontSize: '16px' 
                    }}>
                      No zone data available
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && !displayData && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>No wagon wheel data available for this team.</div>
          </div>
        )}
       </div>
    </div>
  );
};

export default WagonWheelTab;