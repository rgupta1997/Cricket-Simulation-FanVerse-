import React, { useState, useEffect } from 'react';
import './SeasonalLeaderboard.css';

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
      <div className="seasonal-leaderboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seasonal-leaderboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Leaderboard</h3>
          <p>{error}</p>
          <button 
            onClick={() => fetchLeaderboard(currentUser?.userId || '')}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seasonal-leaderboard">
      {/* Top 10 Leaderboard - Left Side */}
      <div className="top-leaderboard-section">
        <h2>Top 10 Players</h2>
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="rank-col">Rank</div>
            <div className="name-col">Player Name</div>
            <div className="score-col">Score</div>
          </div>
          
          <div className="table-body">
            {leaderboardData?.top_10?.map((player, index) => (
              <div 
                key={player.user_id} 
                className={`table-row ${index < 3 ? 'top-three' : ''} ${currentUser?.userId === player.user_id ? 'current-user' : ''}`}
              >
                <div className="rank-col">
                  {index < 3 ? (
                    <span className="medal">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    <span className="rank-number">#{player.rank}</span>
                  )}
                </div>
                <div className="name-col">{player.name}</div>
                <div className="score-col">{player.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Rank Section - Right Side */}
      {currentUser && leaderboardData?.user_rank ? (
        <div className="user-rank-section">
          <h2>Your Ranking</h2>
          <div className="user-rank-card">
            <div className="rank-badge">#{leaderboardData.user_rank.rank}</div>
            <div className="user-info">
              <h3>{leaderboardData.user_rank.name}</h3>
              <p>Score: {leaderboardData.user_rank.score}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-prompt-section">
          <h2>Know Your Ranking</h2>
          <p>Login to see where you stand on the leaderboard!</p>
          <button 
            onClick={onLoginClick}
            className="login-button"
          >
            🔐 Login to See Your Rank
          </button>
        </div>
      )}
    </div>
  );
};

export default SeasonalLeaderboard;
