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
      <div className="tab-panel">
        <div style={{ textAlign: 'center' }}>
          <div>Loading commentary data...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="tab-panel commentary-container">
      {/* <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>🔴</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>🔵</span>
        </div>
      </div> */}

      <div className="commentary-section">
        <h3 className="commentary-title" style={{marginTop:"10px"}}>
          Batsmen
        </h3>
        <div className="responsive-table-container batsmen-table">
          <table className="stats-table">
            <thead>
              <tr>
                <th className="table-header" style={{ textAlign: 'left', minWidth: '150px' }}>Name</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '60px' }}>Runs</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '60px' }}>Balls</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '70px' }}>SR</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>4S</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>6S</th>
              </tr>
            </thead>
            <tbody>
              {batsmenRows.length > 0 ? batsmenRows.map((player, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell" style={{ textAlign: 'left' }}>{player.name}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{player.runs}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{player.balls}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{player.strikeRate}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{player.fours}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{player.sixes}</td>
                </tr>
              )) : (
                <tr className="table-row">
                  <td className="table-cell" colSpan="6" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No batting data available for this inning
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="commentary-section">
        <h3 className="commentary-title">
          Bowler
        </h3>
        <div className="responsive-table-container bowler-table">
          <table className="stats-table" style={{ minWidth: '400px' }}>
            <thead>
              <tr>
                <th className="table-header" style={{ textAlign: 'left', minWidth: '150px' }}>Name</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '40px' }}>O</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '40px' }}>R</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '40px' }}>W</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '60px' }}>Econ</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>Dots</th>
              </tr>
            </thead>
            <tbody>
              {bowlerRow ? (
                <tr className="table-row">
                  <td className="table-cell" style={{ textAlign: 'left' }}>{bowlerRow.name}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{bowlerRow.overs}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{bowlerRow.runs}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{bowlerRow.wickets}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{bowlerRow.economy}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{bowlerRow.dots}</td>
                </tr>
              ) : (
                <tr className="table-row">
                  <td className="table-cell" colSpan="6" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No bowling data available for this inning
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="commentary-section">
        <h3 className="commentary-title">
          Key Facts
        </h3>
        <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          <div>Partnership: {keyFacts.partnership}</div>
          <div>Last Wkt: {playersInfo.fallOfWickets[playersInfo.fallOfWickets.length - 1]?.batsman || keyFacts.lastWicket || "N/A"}</div>
          <div>{keyFacts.tossInfo}</div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className="commentary-title">
            Ball by Ball Commentary
          </h3>
          {/* Inning Selector */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {availableInnings.map(inning => (
              <button 
                key={inning}
                onClick={() => setSelectedInning(inning)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedInning === inning ? '#3b82f6' : '#f3f4f6',
                  color: selectedInning === inning ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {inning === 1 ? '1st Innings' : inning === 2 ? '2nd Innings' : `${inning}rd Innings`}
              </button>
            ))}
            {availableInnings.length === 0 && (
              <div style={{ color: '#6b7280', fontSize: '14px', padding: '8px' }}>
                No commentary data available
              </div>
            )}
          </div>
        </div>
        <div className="ball-commentary">
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
              <div key={index} className="ball-item">
                <div className={`ball-runs-badge ${
                  runs == 6 ? 'ball-runs-six' : 
                  runs == 4 ? 'ball-runs-four' : 
                  'ball-runs-other'
                }`}>
                  {runs || (ball.Detail === 'W' ? 'W' : '•')}
                </div>
                <div className="ball-content">
                  <div className="ball-meta">
                    {over && ballNumber ? `Over ${over} • ${batsman} vs ${bowler}` : ''}
                  </div>
                  <div className="ball-commentary-text">
                    {commentary}
                  </div>
                  <div className="ball-score">
                    Score: {score}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              No commentary available for this inning
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentaryTab;
