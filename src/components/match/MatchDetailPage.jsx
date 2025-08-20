import React, { useState } from 'react';
import cricketData from '../../data/cricketData.json';
import EmbeddedSimulator from '../EmbeddedSimulator';
import PredictionSection from '../PredictionSection';

const MatchDetailPage = ({ matchId, onBackClick, currentUser, onLoginClick, latestBallEvent }) => {
  const [activeTab, setActiveTab] = useState('scorecard');
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);
  
  const match = cricketData.matches.find(m => m.matchId === parseInt(matchId));
  const matchDetail = cricketData.matchDetails[matchId];
  const playerStats = cricketData.players[matchId];
  const commentary = cricketData.commentary[matchId];

  if (!match || !matchDetail) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#1e3c72',
        color: 'white'
      }}>
        <div>Match not found</div>
      </div>
    );
  }

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      style={{
        padding: '12px 20px',
        backgroundColor: active ? 'white' : 'transparent',
        color: active ? '#1e3c72' : 'white',
        border: '2px solid white',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        margin: '0 5px'
      }}
    >
      {label}
    </button>
  );

  const ScorecardView = () => (
    <div style={{ padding: '20px' }}>
      {/* Match Info */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#1e3c72', marginBottom: '15px' }}>Match Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div><strong>Tournament:</strong> {matchDetail.matchInfo.tournament}</div>
          <div><strong>Date:</strong> {matchDetail.matchInfo.date}</div>
          <div><strong>Venue:</strong> {matchDetail.matchInfo.venue}</div>
          <div><strong>Toss:</strong> {matchDetail.matchInfo.toss}</div>
          <div><strong>Man of the Match:</strong> {matchDetail.matchInfo.manOfTheMatch}</div>
          <div><strong>Umpires:</strong> {matchDetail.matchInfo.umpires}</div>
        </div>
      </div>

      {/* Batting Stats */}
      {playerStats && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#1e3c72', marginBottom: '15px' }}>
            {match.team1.name} - {match.team1.score}
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Batsman</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Runs</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Balls</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>SR</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>4s</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>6s</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Dismissal</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.batting.map((player, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{player.name}</td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{player.runs}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{player.balls}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{player.strikeRate}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{player.fours}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{player.sixes}</td>
                    <td style={{ padding: '10px', fontSize: '0.8rem', color: '#666' }}>{player.dismissal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
            <strong>Extras:</strong> {playerStats.extras} | <strong>Total:</strong> {playerStats.total}
          </div>
        </div>
      )}

      {/* Bowling Stats */}
      {playerStats && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#1e3c72', marginBottom: '15px' }}>
            {match.team2.name} Bowling
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Bowler</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Overs</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Runs</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Wickets</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Economy</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Dots</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.bowling.map((bowler, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{bowler.name}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{bowler.overs}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{bowler.runs}</td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{bowler.wickets}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{bowler.economy}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{bowler.dots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const WagonWheelView = () => (
    <div style={{ padding: '20px' }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3 style={{ color: '#1e3c72', marginBottom: '20px', textAlign: 'center' }}>
          Wagon Wheel - Run Distribution
        </h3>
        
        {/* Overall Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          marginBottom: '30px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3c72' }}>
              {matchDetail.wagonWheel.offSide.runs}
            </div>
            <div style={{ color: '#666' }}>Off Side ({matchDetail.wagonWheel.offSide.percentage}%)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3c72' }}>
              {matchDetail.wagonWheel.onSide.runs}
            </div>
            <div style={{ color: '#666' }}>On Side ({matchDetail.wagonWheel.onSide.percentage}%)</div>
          </div>
        </div>

        {/* Field Regions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {Object.entries(matchDetail.wagonWheel.runsByArea).map(([key, area]) => (
            <div
              key={key}
              style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1e3c72',
                marginBottom: '5px'
              }}>
                {area.runs}
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '5px'
              }}>
                {area.region}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#666'
              }}>
                {area.boundaries} boundaries | {area.angle}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CommentaryView = () => (
    <div style={{ padding: '20px' }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3 style={{ color: '#1e3c72', marginBottom: '20px' }}>Ball-by-Ball Commentary</h3>
        
        {commentary && commentary.length > 0 ? (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {commentary.map((ball, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #eee',
                  marginBottom: '10px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#1e3c72'
                  }}>
                    {ball.over}.{ball.ball}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    <span>Runs: <strong style={{ color: ball.runs >= 4 ? '#28a745' : '#333' }}>{ball.runs}</strong></span>
                    <span>Total: <strong>{ball.totalRuns}/{ball.wickets}</strong></span>
                  </div>
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#333',
                  lineHeight: '1.4'
                }}>
                  <strong>{ball.bowler}</strong> to <strong>{ball.batsman}</strong>: {ball.commentary}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '1.1rem',
            padding: '40px'
          }}>
            Commentary not available for this match
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <button
            onClick={onBackClick}
            style={{
              backgroundColor: 'transparent',
              border: '2px solid white',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#1e3c72';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'white';
            }}
          >
            ← Back to Fixtures
          </button>


        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            color: 'white',
            fontSize: '2rem',
            margin: '0 0 10px 0'
          }}>
            {match.team1.shortName} vs {match.team2.shortName}
          </h1>
          <div style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.1rem',
            marginBottom: '10px'
          }}>
            {matchDetail.matchInfo.venue} • {matchDetail.matchInfo.date}
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1rem'
          }}>
            {match.result}
          </div>
        </div>
      </div>

      {/* Prediction Section Toggle */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <button
          onClick={() => setIsPredictionOpen(!isPredictionOpen)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🎯</span>
          {isPredictionOpen ? 'Hide Predictions' : 'Show Predictions'}
        </button>
      </div>

      {/* Prediction Section */}
      <div style={{ padding: '0 20px' }}>
        <PredictionSection
          currentUser={currentUser}
          onLoginClick={onLoginClick}
          latestBallEvent={latestBallEvent}
          isOpen={isPredictionOpen}
          onToggle={() => setIsPredictionOpen(!isPredictionOpen)}
          matchId={matchId}
        />
        
        {/* Debug Info */}
        <div style={{ 
          padding: '10px', 
          marginTop: '10px', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '8px',
          fontSize: '12px',
          color: 'white'
        }}>
          <strong>Debug Info:</strong><br/>
          Latest Ball Event: {latestBallEvent ? JSON.stringify(latestBallEvent) : 'None'}<br/>
          Current User: {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Not logged in'}
        </div>

        {/* User Actions */}
        {currentUser && (
          <div style={{ 
            padding: '10px', 
            marginTop: '10px', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '8px',
            fontSize: '12px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Logged in as: <strong>{currentUser.firstName} {currentUser.lastName}</strong></span>
            <button
              onClick={() => window.location.reload()} // Simple logout by refreshing
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        padding: '20px',
        textAlign: 'center'
      }}>
        <TabButton
          id="scorecard"
          label="📊 Scorecard"
          active={activeTab === 'scorecard'}
          onClick={setActiveTab}
        />
        <TabButton
          id="wagon-wheel"
          label="🎯 Wagon Wheel"
          active={activeTab === 'wagon-wheel'}
          onClick={setActiveTab}
        />
        <TabButton
          id="commentary"
          label="🎤 Commentary"
          active={activeTab === 'commentary'}
          onClick={setActiveTab}
        />
      </div>

      {/* Simulator Section */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <EmbeddedSimulator matchId={matchId} />
      </div>

             {/* Content */}
       <div style={{ minHeight: '400px' }}>
         {activeTab === 'scorecard' && <ScorecardView />}
         {activeTab === 'wagon-wheel' && <WagonWheelView />}
         {activeTab === 'commentary' && <CommentaryView />}
       </div>
     </div>
   );
 };

export default MatchDetailPage;
