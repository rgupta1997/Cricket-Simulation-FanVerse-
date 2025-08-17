import React from 'react';
import { getMatchScorecard, getMatchCommentary } from '../../data/index.js';
import '../../styles/responsive.css';

const CommentaryTab = ({ matchDetail, matchId }) => {
  // Use matchId prop if available, otherwise try to get from matchDetail
  const actualMatchId = matchId || (matchDetail?.matchId ? String(matchDetail.matchId) : "1");
  
  const playersInfo = getMatchScorecard(actualMatchId);
  const commentaryData = getMatchCommentary(actualMatchId);
  
  if (!matchDetail || !playersInfo || !commentaryData) {
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
              {playersInfo.batting.slice(0, 2).map((player, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell" style={{ textAlign: 'left' }}>{player.name}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{player.runs}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{player.balls}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{player.strikeRate}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{player.fours}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{player.sixes}</td>
                </tr>
              ))}
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
              {playersInfo.bowling.slice(0, 1).map((bowler, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell" style={{ textAlign: 'left' }}>{bowler.name}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{bowler.overs}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{bowler.runs}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{bowler.wickets}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{bowler.economy}</td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>{bowler.dots}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="commentary-section">
        <h3 className="commentary-title">
          Key Facts
        </h3>
        <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          <div>Partnership: {matchDetail.keyFacts.partnership}</div>
          <div>Last Wkt: {playersInfo.fallOfWickets[playersInfo.fallOfWickets.length - 1].batsman}</div>
          <div>{matchDetail.keyFacts.tossInfo}</div>
        </div>
      </div>

      <div>
        <h3 className="commentary-title">
          Ball by Ball Commentary
        </h3>
        <div className="ball-commentary">
          {commentaryData.map((ball, index) => (
            <div key={index} className="ball-item">
              <div className={`ball-runs-badge ${
                ball.runs === 6 ? 'ball-runs-six' : 
                ball.runs === 4 ? 'ball-runs-four' : 
                'ball-runs-other'
              }`}>
                {ball.runs}
              </div>
              <div className="ball-content">
                <div className="ball-meta">
                  Over {ball.over}.{ball.ball} • {ball.batsman} vs {ball.bowler}
                </div>
                <div className="ball-commentary-text">
                  {ball.commentary}
                </div>
                <div className="ball-score">
                  Score: {ball.totalRuns}/{ball.wickets}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentaryTab;
