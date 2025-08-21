import React, { useState, useEffect } from 'react';

const SeasonalLeaderboard = ({ currentUser, onLoginClick }) => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async (userId = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://playground-dev.sportz.io/api/GetLeaderBoard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // If no data from API, use test data for demonstration
      if (!data.top_10 || data.top_10.length === 0) {
        console.log('No data from API, using test data for scrolling demo');
        setLeaderboardData({
          top_10: [
            { user_id: '1', name: 'Test Player 1', score: 1000, rank: 1 },
            { user_id: '2', name: 'Test Player 2', score: 950, rank: 2 },
            { user_id: '3', name: 'Test Player 3', score: 900, rank: 3 },
            { user_id: '4', name: 'Test Player 4', score: 850, rank: 4 },
            { user_id: '5', name: 'Test Player 5', score: 800, rank: 5 },
            { user_id: '6', name: 'Test Player 6', score: 750, rank: 6 },
            { user_id: '7', name: 'Test Player 7', score: 700, rank: 7 },
            { user_id: '8', name: 'Test Player 8', score: 650, rank: 8 },
            { user_id: '9', name: 'Test Player 9', score: 600, rank: 9 },
            { user_id: '10', name: 'Test Player 10', score: 550, rank: 10 },
            { user_id: '11', name: 'Test Player 11', score: 500, rank: 11 },
            { user_id: '12', name: 'Test Player 12', score: 450, rank: 12 },
            { user_id: '13', name: 'Test Player 13', score: 400, rank: 13 },
            { user_id: '14', name: 'Test Player 14', score: 350, rank: 14 },
            { user_id: '15', name: 'Test Player 15', score: 300, rank: 15 }
          ]
        });
      } else {
        setLeaderboardData(data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
      
      // Use test data on error for demonstration
      setLeaderboardData({
        top_10: [
          { user_id: '1', name: 'Test Player 1', score: 1000, rank: 1 },
          { user_id: '2', name: 'Test Player 2', score: 950, rank: 2 },
          { user_id: '3', name: 'Test Player 3', score: 900, rank: 3 },
          { user_id: '4', name: 'Test Player 4', score: 850, rank: 4 },
          { user_id: '5', name: 'Test Player 5', score: 800, rank: 5 },
          { user_id: '6', name: 'Test Player 6', score: 750, rank: 6 },
          { user_id: '7', name: 'Test Player 7', score: 700, rank: 7 },
          { user_id: '8', name: 'Test Player 8', score: 650, rank: 8 },
          { user_id: '9', name: 'Test Player 9', score: 600, rank: 9 },
          { user_id: '10', name: 'Test Player 10', score: 550, rank: 10 },
          { user_id: '11', name: 'Test Player 11', score: 500, rank: 11 },
          { user_id: '12', name: 'Test Player 12', score: 450, rank: 12 },
          { user_id: '13', name: 'Test Player 13', score: 400, rank: 13 },
          { user_id: '14', name: 'Test Player 14', score: 350, rank: 14 },
          { user_id: '15', name: 'Test Player 15', score: 300, rank: 15 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch leaderboard on component mount
    if (currentUser) {
      fetchLeaderboard(currentUser.userId);
    } else {
      fetchLeaderboard('');
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f1ecfa 0%, #ede6fa 50%, #dacdf6 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(161, 129, 231, 0.15)',
          border: '1px solid rgba(161, 129, 231, 0.2)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(161, 129, 231, 0.2)',
            borderTop: '4px solid #a181e7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <div style={{
            color: '#a181e7',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Loading leaderboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f1ecfa 0%, #ede6fa 50%, #dacdf6 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(161, 129, 231, 0.15)',
          border: '1px solid rgba(161, 129, 231, 0.2)',
          maxWidth: '400px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            color: '#e0bda9'
          }}>⚠️</div>
          <h3 style={{
            color: '#a181e7',
            marginBottom: '16px',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Error Loading Leaderboard
          </h3>
          <p style={{
            color: '#6b7280',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            {error}
          </p>
          <button
            onClick={() => fetchLeaderboard(currentUser?.userId || '')}
            style={{
              background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 16px rgba(161, 129, 231, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f1ecfa 0%, #ede6fa 50%, #dacdf6 100%)',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: currentUser && leaderboardData?.user_rank ? '2fr 1fr' : '1fr',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Top 10 Leaderboard - Left Side */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(161, 129, 231, 0.2)',
          boxShadow: '0 8px 32px rgba(161, 129, 231, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid rgba(161, 129, 231, 0.1)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ecaf1a 0%, #e0bda9 100%)',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              marginRight: '16px'
            }}>
              🏆
            </div>
            <h2 style={{
              color: '#a181e7',
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>
              Top 10 Players
            </h2>
          </div>

          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 100px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(161, 129, 231, 0.1) 0%, rgba(186, 162, 230, 0.05) 100%)',
            borderRadius: '12px',
            marginBottom: '12px',
            border: '1px solid rgba(161, 129, 231, 0.15)'
          }}>
            <div style={{
              color: '#a181e7',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              Rank
            </div>
            <div style={{
              color: '#a181e7',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              Player Name
            </div>
            <div style={{
              color: '#a181e7',
              fontSize: '14px',
              fontWeight: '700',
              textAlign: 'right'
            }}>
              Score
            </div>
          </div>

          {/* Table Body */}
          <div style={{
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
            {leaderboardData?.top_10?.map((player, index) => (
              <div
                key={player.user_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 100px',
                  padding: '16px',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  background: currentUser?.userId === player.user_id
                    ? 'linear-gradient(135deg, rgba(236, 175, 26, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)'
                    : index < 3
                      ? 'linear-gradient(135deg, rgba(161, 129, 231, 0.05) 0%, rgba(186, 162, 230, 0.02) 100%)'
                      : 'rgba(248, 250, 252, 0.8)',
                  border: currentUser?.userId === player.user_id
                    ? '2px solid rgba(236, 175, 26, 0.3)'
                    : index < 3
                      ? '1px solid rgba(161, 129, 231, 0.1)'
                      : '1px solid rgba(226, 232, 240, 0.8)',
                  transition: 'all 0.2s ease',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  if (currentUser?.userId !== player.user_id) {
                    e.currentTarget.style.background = 'rgba(161, 129, 231, 0.05)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentUser?.userId !== player.user_id) {
                    e.currentTarget.style.background = index < 3
                      ? 'linear-gradient(135deg, rgba(161, 129, 231, 0.05) 0%, rgba(186, 162, 230, 0.02) 100%)'
                      : 'rgba(248, 250, 252, 0.8)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {index < 3 ? (
                    <span style={{
                      fontSize: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    <span style={{
                      color: '#6b7280',
                      fontSize: '16px',
                      fontWeight: '600',
                      background: 'rgba(107, 114, 128, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '8px'
                    }}>
                      #{player.rank}
                    </span>
                  )}
                </div>
                <div style={{
                  color: currentUser?.userId === player.user_id ? '#ecaf1a' : '#1f2937',
                  fontSize: '16px',
                  fontWeight: currentUser?.userId === player.user_id ? '700' : '600'
                }}>
                  {player.name}
                  {currentUser?.userId === player.user_id && (
                    <span style={{
                      color: '#ecaf1a',
                      fontSize: '12px',
                      fontWeight: '500',
                      marginLeft: '8px'
                    }}>
                      (You)
                    </span>
                  )}
                </div>
                <div style={{
                  color: index < 3 ? '#a181e7' : '#1f2937',
                  fontSize: '16px',
                  fontWeight: '700',
                  textAlign: 'right'
                }}>
                  {player.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Rank Section - Right Side */}
        {currentUser && leaderboardData?.user_rank ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(161, 129, 231, 0.2)',
            boxShadow: '0 8px 32px rgba(161, 129, 231, 0.15)',
            height: 'fit-content'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid rgba(236, 175, 26, 0.1)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginRight: '16px'
              }}>
                👤
              </div>
              <h2 style={{
                color: '#a181e7',
                fontSize: '20px',
                fontWeight: '700',
                margin: 0
              }}>
                Your Ranking
              </h2>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 175, 26, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid rgba(236, 175, 26, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ecaf1a 0%, #e0bda9 100%)',
                color: 'white',
                fontSize: '32px',
                fontWeight: '800',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 8px 24px rgba(236, 175, 26, 0.3)'
              }}>
                #{leaderboardData.user_rank.rank}
              </div>
              <h3 style={{
                color: '#1f2937',
                fontSize: '18px',
                fontWeight: '700',
                margin: '0 0 8px 0'
              }}>
                {leaderboardData.user_rank.name}
              </h3>
              <p style={{
                color: '#ecaf1a',
                fontSize: '24px',
                fontWeight: '700',
                margin: 0
              }}>
                {leaderboardData.user_rank.score} Points
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(161, 129, 231, 0.2)',
            boxShadow: '0 8px 32px rgba(161, 129, 231, 0.15)',
            height: 'fit-content',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 24px rgba(161, 129, 231, 0.3)'
            }}>
              🔐
            </div>
            <h2 style={{
              color: '#a181e7',
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '12px'
            }}>
              Know Your Ranking
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Login to see where you stand on the leaderboard and compete with other players!
            </p>
            <button
              onClick={onLoginClick}
              style={{
                background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 16px rgba(161, 129, 231, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span>🔐</span>
              Login to See Your Rank
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SeasonalLeaderboard;
