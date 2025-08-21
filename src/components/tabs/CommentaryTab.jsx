import { useState, useEffect } from 'react';
import { extractPlayersInfo, extractKeyFacts } from '../../utils/webapp.util.js';
import '../../styles/responsive.css';

const CommentaryTab = ({ matchDetail, matchId, commentary }) => {
  console.log('matchDetails:', matchDetail, matchId, commentary)
  const [selectedInning, setSelectedInning] = useState(1);
  const [currentBallDetails, setCurrentBallDetails] = useState(null);

  const playersInfo = extractPlayersInfo(matchDetail, selectedInning);
  console.log('playersInfo', playersInfo, currentBallDetails);

  // Extract batsmen and bowler details from currentBallDetails
  let batsmenRows = [];
  let bowlerRow = null;
  if (currentBallDetails) {
    // Striker
    let striker = {
      name: currentBallDetails.Batsman_Name || '-',
      runs: currentBallDetails.Batsman_Details?.Runs || currentBallDetails.Batsman_Runs || '-',
      balls: currentBallDetails.Batsman_Details?.Balls || '-',
      strikeRate: currentBallDetails.Batsman_Details?.Runs && currentBallDetails.Batsman_Details?.Balls ? ((parseInt(currentBallDetails.Batsman_Details.Runs) / parseInt(currentBallDetails.Batsman_Details.Balls) * 100).toFixed(2)) : '-',
      fours: currentBallDetails.Batsman_Details?.Fours || '-',
      sixes: currentBallDetails.Batsman_Details?.Sixes || '-'
    };
    // Non-striker
    let nonStriker = {
      name: currentBallDetails.Non_Striker_Name || '-',
      runs: currentBallDetails.Non_Striker_Details?.Runs || '-',
      balls: currentBallDetails.Non_Striker_Details?.Balls || '-',
      strikeRate: currentBallDetails.Non_Striker_Details?.Runs && currentBallDetails.Non_Striker_Details?.Balls ? ((parseInt(currentBallDetails.Non_Striker_Details.Runs) / parseInt(currentBallDetails.Non_Striker_Details.Balls) * 100).toFixed(2)) : '-',
      fours: currentBallDetails.Non_Striker_Details?.Fours || '-',
      sixes: currentBallDetails.Non_Striker_Details?.Sixes || '-'
    };
    batsmenRows = [striker, nonStriker];

    // Bowler
    let bowlerDetails = currentBallDetails.Bowler_Details || {};
    let bowler = {
      name: currentBallDetails.Bowler_Name || '-',
      overs: bowlerDetails.Overs || '-',
      runs: bowlerDetails.Runs || currentBallDetails.Bowler_Conceded_Runs || '-',
      wickets: bowlerDetails.Wickets || '-',
      economy: bowlerDetails.Runs && bowlerDetails.Overs ? (parseInt(bowlerDetails.Runs) / (parseFloat(bowlerDetails.Overs) || 1)).toFixed(2) : '-',
      dots: bowlerDetails.Dot_balls || '-'
    };
    bowlerRow = bowler;
  }

  // Use the new commentary prop if available, otherwise fall back to old data
  const commentaryData = commentary || {};
  const currentInningCommentary = commentaryData[selectedInning] || [];
  
  // Determine available innings from commentary data
  const availableInnings = Object.keys(commentaryData).map(key => parseInt(key)).filter(key => !isNaN(key)).sort();
  
  // Debug logging
  console.log('🏏 CommentaryTab received data:', {
    hasCommentary: !!commentary,
    commentaryKeys: Object.keys(commentaryData),
    availableInnings,
    selectedInning,
    currentInningCount: currentInningCommentary.length
  });
  
  // Auto-select first available inning if current selection doesn't exist
  useEffect(() => {
    if (availableInnings.length > 0 && !availableInnings.includes(selectedInning)) {
      setSelectedInning(availableInnings[0]);
    }
  }, [availableInnings, selectedInning]);

  useEffect(() => {
    if (commentaryData && Object.keys(commentaryData).length > 0) {
      // create a for loop on commentaryData and check if
      for (let i = Object.keys(commentaryData).length - 1; i >= 0; i--) {
        const currentInnings = commentaryData[Object.keys(commentaryData)[i]];
        // find the first isBall true in currentInnings
        const ballDetails = currentInnings.find(ball => ball.Isball === true);
        // if not found try to find in previous innings
        if (ballDetails) {
          setCurrentBallDetails(ballDetails);
          break;
        }
      }
    }
  }, [commentaryData]);         

  let keyFacts = extractKeyFacts(matchDetail);
  keyFacts = matchDetail?.keyFacts || {};
  console.log('keyFacts', keyFacts, matchDetail, currentBallDetails)
  
  if (!matchDetail) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(161, 129, 231, 0.1) 0%, rgba(186, 162, 230, 0.05) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(161, 129, 231, 0.2)',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div>Loading commentary data...</div>
      </div>
    );
  }
  
  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>

      <div style={{
        background: 'rgba(248, 250, 252, 0.8)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          color: '#1f2937',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          ⚾ Batsmen
        </h3>
        <div style={{
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white'
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)'
              }}>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  minWidth: '150px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>Name</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  minWidth: '60px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>Runs</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  minWidth: '60px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>Balls</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  minWidth: '70px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>SR</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  minWidth: '50px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>4S</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  minWidth: '50px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>6S</th>
              </tr>
            </thead>
            <tbody>
              {batsmenRows.length > 0 ? batsmenRows.map((player, index) => (
                <tr key={index} style={{
                  borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                  backgroundColor: index % 2 === 0 ? 'rgba(248, 250, 252, 0.5)' : 'white'
                }}>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: '#1f2937', 
                    fontSize: '14px', 
                    fontWeight: '500' 
                  }}>{player.name}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: '14px' 
                  }}>{player.runs}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: '14px' 
                  }}>{player.balls}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: '14px' 
                  }}>{player.strikeRate}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: '14px' 
                  }}>{player.fours}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: '14px' 
                  }}>{player.sixes}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#6b7280', 
                    fontSize: '14px' 
                  }}>
                    No batting data available for this inning
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{
        background: 'rgba(248, 250, 252, 0.8)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          color: '#1f2937',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          🎾 Bowler
        </h3>
        <div style={{
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            minWidth: '400px'
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, #ecaf1a 0%, #e0bda9 100%)'
              }}>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  minWidth: '150px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>Name</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  minWidth: '40px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>O</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  minWidth: '40px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>R</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  minWidth: '40px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>W</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  minWidth: '60px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>Econ</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  minWidth: '50px', 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>Dots</th>
              </tr>
            </thead>
            <tbody>
              {bowlerRow ? (
                <tr style={{
                  backgroundColor: 'rgba(248, 250, 252, 0.5)'
                }}>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: '#1f2937', 
                    fontSize: '14px', 
                    fontWeight: '500' 
                  }}>{bowlerRow.name}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: '14px' 
                  }}>{bowlerRow.overs}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: '14px' 
                  }}>{bowlerRow.runs}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: '14px' 
                  }}>{bowlerRow.wickets}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: '14px' 
                  }}>{bowlerRow.economy}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: '14px' 
                  }}>{bowlerRow.dots}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="6" style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#6b7280', 
                    fontSize: '14px' 
                  }}>
                    No bowling data available for this inning
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{
        background: 'rgba(248, 250, 252, 0.8)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          color: '#1f2937',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          📊 Key Facts
        </h3>
        <div style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          lineHeight: '1.6',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            padding: '8px 12px',
            background: 'linear-gradient(135deg, rgba(161, 129, 231, 0.1) 0%, rgba(186, 162, 230, 0.05) 100%)',
            borderRadius: '6px',
            border: '1px solid rgba(161, 129, 231, 0.2)'
          }}>
            <strong>Partnership:</strong> {keyFacts.partnership}
          </div>
          <div style={{
            padding: '8px 12px',
            background: 'linear-gradient(135deg, rgba(236, 175, 26, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)',
            borderRadius: '6px',
            border: '1px solid rgba(236, 175, 26, 0.2)'
          }}>
            <strong>Last Wkt:</strong> {playersInfo.fallOfWickets[playersInfo.fallOfWickets.length - 1]?.batsman || keyFacts.lastWicket || "N/A"}
          </div>
          <div style={{
            padding: '8px 12px',
            background: 'linear-gradient(135deg, rgba(186, 162, 230, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)',
            borderRadius: '6px',
            border: '1px solid rgba(186, 162, 230, 0.2)'
          }}>
            <strong>Toss:</strong> {keyFacts.tossInfo}
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(248, 250, 252, 0.8)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h3 style={{
            margin: 0,
            color: '#1f2937',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            🎙️ Ball by Ball Commentary
          </h3>
          {/* Inning Selector */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {availableInnings.map(inning => (
              <button 
                key={inning}
                onClick={() => setSelectedInning(inning)}
                style={{
                  padding: '8px 16px',
                  background: selectedInning === inning 
                    ? 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)' 
                    : 'rgba(248, 250, 252, 0.8)',
                  color: selectedInning === inning ? 'white' : '#374151',
                  border: `1px solid ${selectedInning === inning ? '#a181e7' : 'rgba(226, 232, 240, 0.8)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedInning !== inning) {
                    e.target.style.backgroundColor = 'rgba(161, 129, 231, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedInning !== inning) {
                    e.target.style.backgroundColor = 'rgba(248, 250, 252, 0.8)';
                  }
                }}
              >
                {inning === 1 ? '1st Innings' : inning === 2 ? '2nd Innings' : `${inning}rd Innings`}
              </button>
            ))}
            {availableInnings.length === 0 && (
              <div style={{ 
                color: '#6b7280', 
                fontSize: '14px', 
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                No commentary data available
              </div>
            )}
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '12px',
          background: 'white',
          borderRadius: '8px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          {currentInningCommentary.length > 0 ? currentInningCommentary.map((ball, index) => {
            // Handle different data structures - check if it's new API format or old format
            const runs = ball.Runs || ball.runs || 0;
            const over = ball.Over || ball.over || 0;
            const ballNumber = ball.Ball_Number || ball.Ball || ball.ball || 0;
            const batsman = ball.Batsman_Name || ball.batsman || null;
            const bowler = ball.Bowler_Name || ball.bowler || null;
            const commentary = ball.Commentary || ball.commentary || 'No commentary available';
            const score = ball.Score || `${ball.totalRuns || 0}/${ball.wickets || 0}`;
            const isball = ball.Isball !== undefined ? ball.Isball : true;
            
            // Only show actual ball deliveries, skip text-only commentary
            if (!isball && !ball.Commentary) return null;
            
            return (
              <div key={index} style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                background: index % 2 === 0 ? 'rgba(248, 250, 252, 0.5)' : 'white',
                borderRadius: '8px',
                border: '1px solid rgba(226, 232, 240, 0.5)'
              }}>
                <div style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  background: runs == 6 ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 
                             runs == 4 ? 'linear-gradient(135deg, #ecaf1a 0%, #f59e0b 100%)' : 
                             'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                }}>
                  {runs || (ball.Detail === 'W' ? 'W' : '•')}
                </div>
                <div style={{ flex: 1 }}>
                  {over && ballNumber ? (
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      Over {over} • {batsman} vs {bowler}
                    </div>
                  ) : null}
                  <div style={{
                    fontSize: '14px',
                    color: '#1f2937',
                    lineHeight: '1.5',
                    marginBottom: '4px'
                  }}>
                    {commentary}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    Score: {score}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#6b7280',
              background: 'linear-gradient(135deg, rgba(236, 175, 26, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)',
              borderRadius: '8px',
              border: '1px solid rgba(236, 175, 26, 0.2)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
              No commentary available for this inning
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentaryTab;
