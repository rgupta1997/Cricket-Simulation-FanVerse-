import '../../styles/responsive.css';

const ScorecardTab = ({ matchDetail }) => {
  console.log('matchDetail:', matchDetail);

  if (!matchDetail || !matchDetail.Innings) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(161, 129, 231, 0.1) 0%, rgba(186, 162, 230, 0.05) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(161, 129, 231, 0.2)',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>📊</div>
        <div>No scorecard data available</div>
      </div>
    );
  }

  // Helper function to get player names from Teams data
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

  // Helper function to get team name
  const getTeamName = (teamId) => {
    if (!teamId || !matchDetail.Teams || !matchDetail.Teams[teamId]) {
      return `Team ${teamId}`;
    }
    return matchDetail.Teams[teamId].Name_Full || matchDetail.Teams[teamId].Name_Short || `Team ${teamId}`;
  };

  // Helper function to calculate extras for an innings
  const calculateExtras = (innings) => {
    const byes = parseInt(innings.Byes) || 0;
    const legByes = parseInt(innings.Legbyes) || 0;
    const wides = parseInt(innings.Wides) || 0;
    const noBalls = parseInt(innings.Noballs) || 0;
    const penalty = parseInt(innings.Penalty) || 0;
    return byes + legByes + wides + noBalls + penalty;
  };

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {matchDetail.Innings && matchDetail.Innings.map((innings, inningsIndex) => (
        <div key={inningsIndex} style={{
          background: 'rgba(248, 250, 252, 0.8)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          {/* Innings Header */}
          <div style={{
            textAlign: 'center', 
            marginBottom: '24px', 
            padding: '20px',
            background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              {innings.Number} Innings - {getTeamName(innings.Battingteam)}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              {innings.Total}/{innings.Wickets} ({innings.Overs} overs)
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Run Rate: {innings.Runrate} | Required Rate: {innings.Target ? ((innings.Target - parseInt(innings.Total)) / ((20 - parseFloat(innings.Overs)) || 1)).toFixed(2) : 'N/A'}
            </div>
          </div>

          {/* Batsmen Table */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '16px', 
              color: '#1f2937',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(236, 175, 26, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)',
              borderRadius: '8px',
              border: '1px solid rgba(236, 175, 26, 0.2)'
            }}>
              🏏 Batting Performance - {innings.Number} Innings
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
                minWidth: '650px'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)'
                  }}>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      minWidth: '180px', 
                      color: 'white', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>Batsman</th>
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
                      minWidth: '80px', 
                      color: 'white', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>Strike Rate</th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center', 
                      minWidth: '50px', 
                      color: 'white', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>4s</th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center', 
                      minWidth: '50px', 
                      color: 'white', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>6s</th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      minWidth: '140px', 
                      color: 'white', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>Dismissal</th>
                  </tr>
                </thead>
                <tbody>
                  {innings.Batsmen && innings.Batsmen.filter(batsman => batsman.Batsman && batsman.Runs !== "").map((batsman, index) => (
                    <tr key={index} style={{
                      borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                      backgroundColor: index % 2 === 0 ? 'rgba(248, 250, 252, 0.5)' : 'white'
                    }}>
                      <td style={{ 
                        padding: '12px 16px', 
                        fontWeight: '600', 
                        textAlign: 'left', 
                        color: '#1f2937', 
                        fontSize: '14px' 
                      }}>
                        {getPlayerName(batsman.Batsman, innings.Battingteam)}
                      </td>
                      <td style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        background: 'linear-gradient(135deg, rgba(236, 175, 26, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)',
                        color: '#1f2937',
                        fontSize: '14px'
                      }}>
                        {batsman.Runs}
                      </td>
                      <td style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        color: '#374151', 
                        fontSize: '14px' 
                      }}>
                        {batsman.Balls}
                      </td>
                      <td style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        color: '#374151', 
                        fontSize: '14px' 
                      }}>
                        {batsman.Strikerate}
                      </td>
                      <td style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(134, 239, 172, 0.05) 100%)',
                        color: '#374151', 
                        fontSize: '14px' 
                      }}>
                        {batsman.Fours}
                      </td>
                      <td style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)',
                        color: '#374151', 
                        fontSize: '14px' 
                      }}>
                        {batsman.Sixes}
                      </td>
                      <td style={{ 
                        padding: '12px 16px', 
                        fontSize: '13px', 
                        fontStyle: 'italic', 
                        color: '#6b7280' 
                      }}>
                        {batsman.Howout_short || batsman.Dismissal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Extras and Total */}
            <div style={{
              marginTop: '16px', 
              padding: '12px 16px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '15px', color: '#000000', marginBottom: '8px', fontWeight: '600' }}>
                <strong>Extras:</strong> {calculateExtras(innings)} (b {innings.Byes}, lb {innings.Legbyes}, w {innings.Wides}, nb {innings.Noballs})
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px' }}>
                <strong>Total:</strong> {innings.Total}/{innings.Wickets} ({innings.Overs} overs)
              </div>
            </div>
          </div>

          {/* Fall of Wickets */}
          {innings.FallofWickets && innings.FallofWickets.length > 0 && (
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
                📊 Fall of Wickets - {innings.Number} Innings
              </h3>
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '15px', color: '#000000', lineHeight: '1.8', fontWeight: '500' }}>
                  {innings.FallofWickets.map((wicket, index) => (
                    <span key={index} style={{ marginRight: '16px', display: 'inline-block', marginBottom: '8px' }}>
                      <strong style={{ color: '#000000', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                        {wicket.Score}/{wicket.Wicket_No}
                      </strong>
                      <span style={{ color: '#000000' }}> ({wicket.Overs} ov) {getPlayerName(wicket.Batsman, innings.Battingteam)}</span>
                      {index < innings.FallofWickets.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bowling Table */}
          {innings.Bowlers && (
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
                ⚾ Bowling Performance - {innings.Number} Innings
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
                    {innings.Bowlers.map((bowler, index) => (
                      <tr key={index} className="table-row">
                        <td className="table-cell" style={{ fontWeight: 'bold', textAlign: 'left' }}>
                          {getPlayerName(bowler.Bowler, innings.Bowlingteam)}
                        </td>
                        <td className="table-cell" style={{ textAlign: 'center' }}>
                          {bowler.Overs}
                        </td>
                        <td className="table-cell" style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                          {bowler.Runs}
                        </td>
                        <td className="table-cell" style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#d1fae5' }}>
                          {bowler.Wickets}
                        </td>
                        <td className="table-cell" style={{ textAlign: 'center' }}>
                          {bowler.Economyrate}
                        </td>
                        <td className="table-cell" style={{ textAlign: 'center' }}>
                          {bowler.Dots}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScorecardTab;
