import React from 'react';
import { getMatchScorecard } from '../../data/index.js';
import '../../styles/responsive.css';

const ScorecardTab = ({ matchDetail, matchId }) => {
  // Use matchId prop if available, otherwise try to get from matchDetail
  const actualMatchId = matchId || (matchDetail?.matchId ? String(matchDetail.matchId) : "1");
  
  const playersInfo = getMatchScorecard(actualMatchId);
  
  if (!matchDetail || !playersInfo) {
    return (
      <div className="tab-panel">
        <div style={{ textAlign: 'center' }}>
          <div>Loading scorecard data...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="tab-panel">
      {/* Team Score Summary */}
      {/* <div style={{
        textAlign: 'center', 
        marginBottom: '24px', 
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#000000', marginBottom: '8px' }}>
          {playersInfo.total}
        </div>
        <div style={{ fontSize: '16px', color: '#000000', fontWeight: '600' }}>
          Royal Challengers Bengaluru Innings
        </div>
      </div> */}

      {/* Batsmen Table */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '12px', 
          color: '#000000',
          padding: '12px 16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          border: '2px solid #374151'
        }}>
          🏏 Batting Performance
        </h3>
        <div className="responsive-table-container">
          <table className="stats-table" style={{ minWidth: '650px' }}>
            <thead>
              <tr>
                <th className="table-header" style={{ textAlign: 'left', minWidth: '180px' }}>Batsman</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '60px' }}>Runs</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '60px' }}>Balls</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '80px' }}>Strike Rate</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>4s</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '50px' }}>6s</th>
                <th className="table-header" style={{ textAlign: 'left', minWidth: '140px' }}>Dismissal</th>
              </tr>
            </thead>
            <tbody>
              {playersInfo.batting.map((player, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell" style={{ fontWeight: 'bold', textAlign: 'left' }}>
                    {player.name}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                    {player.runs}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>
                    {player.balls}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>
                    {player.strikeRate}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center', backgroundColor: '#d1fae5' }}>
                    {player.fours}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center', backgroundColor: '#e0e7ff' }}>
                    {player.sixes}
                  </td>
                  <td className="table-cell" style={{ fontSize: '13px', fontStyle: 'italic' }}>
                    {player.dismissal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Extras and Total */}
        {/* <div style={{
          marginTop: '16px', 
          padding: '12px 16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '15px', color: '#000000', marginBottom: '8px', fontWeight: '600' }}>
            <strong>Extras:</strong> {playersInfo.extras}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px' }}>
            <strong>Total:</strong> {playersInfo.total}
          </div>
          {playersInfo.didNotBat && playersInfo.didNotBat.length > 0 && (
            <div style={{ fontSize: '15px', color: '#000000', fontWeight: '500' }}>
              <strong>Did Not Bat:</strong> {playersInfo.didNotBat.join(', ')}
            </div>
          )}
        </div>
      </div> */}

      {/* Fall of Wickets */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '12px', 
          color: '#000000',
          padding: '12px 16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          border: '2px solid #374151'
        }}>
          📊 Fall of Wickets
        </h3>
        <div style={{
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '15px', color: '#000000', lineHeight: '1.8', fontWeight: '500' }}>
            {playersInfo.fallOfWickets.map((wicket, index) => (
              <span key={index} style={{ marginRight: '16px', display: 'inline-block', marginBottom: '8px' }}>
                <strong style={{ color: '#000000', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>{wicket.score}/{wicket.wicket}</strong>
                <span style={{ color: '#000000' }}> ({wicket.over} ov) {wicket.batsman}</span>
                {index < playersInfo.fallOfWickets.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bowling Table */}
      <div>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '12px', 
          color: '#000000',
          padding: '12px 16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          border: '2px solid #374151'
        }}>
          ⚾ Bowling Performance
        </h3>
        <div className="responsive-table-container">
          <table className="stats-table" style={{ minWidth: '550px' }}>
            <thead>
              <tr>
                <th className="table-header" style={{ textAlign: 'left', minWidth: '180px' }}>Bowler</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '60px' }}>Overs</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '60px' }}>Runs</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '70px' }}>Wickets</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '80px' }}>Economy</th>
                <th className="table-header" style={{ textAlign: 'center', minWidth: '60px' }}>Dots</th>
              </tr>
            </thead>
            <tbody>
              {playersInfo.bowling.map((bowler, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell" style={{ fontWeight: 'bold', textAlign: 'left' }}>
                    {bowler.name}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>
                    {bowler.overs}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                    {bowler.runs}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#d1fae5' }}>
                    {bowler.wickets}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>
                    {bowler.economy}
                  </td>
                  <td className="table-cell" style={{ textAlign: 'center' }}>
                    {bowler.dots}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ScorecardTab;
