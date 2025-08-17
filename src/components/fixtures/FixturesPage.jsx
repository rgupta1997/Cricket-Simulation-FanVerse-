import React from 'react';
import cricketData from '../../data/cricketData.json';

const FixturesPage = ({ onMatchClick }) => {
  const { matches, pointsTable } = cricketData;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '2.5rem',
          margin: '0 0 10px 0',
          fontWeight: 'bold'
        }}>
          🏏 IPL 2025
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '1.1rem',
          margin: 0
        }}>
          Indian Premier League
        </p>
      </div>

      {/* Recent Matches */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          color: 'white',
          fontSize: '1.8rem',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Recent Matches
        </h2>
        
        <div style={{
          display: 'grid',
          gap: '20px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {matches.map((match) => (
            <div
              key={match.matchId}
              onClick={() => onMatchClick(match.matchId)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Match Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {match.tournament}
                </span>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {formatDate(match.date)}
                </span>
              </div>

              {/* Teams */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {match.team1.shortName}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {match.team1.name}
                    </div>
                    <div style={{
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      color: '#1e3c72'
                    }}>
                      {match.team1.score}
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '1.5rem',
                  color: '#666',
                  margin: '0 20px'
                }}>
                  vs
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  justifyContent: 'flex-end'
                }}>
                  <div style={{ textAlign: 'right', marginRight: '12px' }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {match.team2.name}
                    </div>
                    <div style={{
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      color: '#1e3c72'
                    }}>
                      {match.team2.score}
                    </div>
                  </div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {match.team2.shortName}
                  </div>
                </div>
              </div>

              {/* Result */}
              <div style={{
                textAlign: 'center',
                padding: '10px',
                backgroundColor: '#e8f5e8',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2d5a2d'
              }}>
                {match.result}
              </div>

              {/* Venue */}
              <div style={{
                textAlign: 'center',
                marginTop: '10px',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                📍 {match.venue}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points Table */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '25px',
        maxWidth: '900px',
        margin: '0 auto',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '25px',
          color: '#1e3c72',
          fontSize: '1.8rem'
        }}>
          🏆 Points Table
        </h2>

        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.95rem'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#1e3c72',
                color: 'white'
              }}>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Rank</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Team</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Played</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Won</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Lost</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>NR</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Points</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>NRR</th>
              </tr>
            </thead>
            <tbody>
              {pointsTable.map((team, index) => (
                <tr
                  key={team.rank}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                    borderBottom: '1px solid #e0e0e0'
                  }}
                >
                  <td style={{
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    color: team.rank <= 4 ? '#28a745' : '#6c757d'
                  }}>
                    {team.rank}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '10px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: '#333'
                      }}>
                        {team.shortName}
                      </div>
                      <span style={{ fontWeight: '500' }}>{team.team}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>{team.played}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#28a745', fontWeight: '500' }}>{team.won}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#dc3545', fontWeight: '500' }}>{team.lost}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>{team.noResult}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', color: '#1e3c72' }}>{team.points}</td>
                  <td style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    color: team.nrr >= 0 ? '#28a745' : '#dc3545',
                    fontWeight: '500'
                  }}>
                    {team.nrr > 0 ? '+' : ''}{team.nrr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.9rem'
      }}>
        Click on any match to view detailed statistics
      </div>
    </div>
  );
};

export default FixturesPage;
