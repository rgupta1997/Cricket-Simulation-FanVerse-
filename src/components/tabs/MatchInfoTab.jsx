import '../../styles/responsive.css';

const MatchInfoTab = ({ matchDetail, matchName }) => {
  console.log('matchDetails', matchDetail)
  // Extract data from the new matchDetail structure
  const matchDetailData = matchDetail?.Matchdetail || {};
  const seriesData = matchDetailData?.Series || {};
  const venueData = matchDetailData?.Venue || {};
  const officialsData = matchDetailData?.Officials || {};
  const matchData = matchDetailData?.Match || {};
  const teamsData = matchDetail?.Teams || {};
  
  // Use new data structure
  const tournament = seriesData.Name || seriesData.Series_short_display_name || 'Cricket Match';
  const date = matchData.Date || matchData.StartDate?.split('T')[0] || 'TBD';
  const time = matchData.Time || '';
  const venueName = venueData.Name ? `${venueData.Name}, ${venueData.City}` : 'Venue TBD';
  
  // Extract toss information - now we need to get team names from Teams data
  const tossWinningTeamId = matchDetailData.Tosswonby;
  const tossWinningTeam = teamsData?.[tossWinningTeamId];
  const tossDecision = matchDetailData.Toss_elected_to;
  const toss = tossWinningTeam && tossDecision 
    ? `${tossWinningTeam.Name_Full || tossWinningTeam.Name || 'Team'} won the toss and elected to ${tossDecision}` 
    : matchDetailData.Tosswonby && matchDetailData.Toss_elected_to
    ? `Team ${matchDetailData.Tosswonby} won the toss and elected to ${matchDetailData.Toss_elected_to}`
    : 'Toss details not available';
  
  const umpires = officialsData.Umpires || 'Umpires TBD';
  const referee = officialsData.Referee || 'Referee TBD';
  const manOfMatch = matchDetailData.Player_Match || 'TBD';
  
  // Additional data points from the new structure
  const matchType = matchData.Type || 'Cricket Match';
  const matchStatus = matchDetailData.Status || matchDetailData.Match_display_status || 'TBD';
  const result = matchDetailData.Result || matchDetailData.Equation || 'TBD';
  const pitchInfo = venueData?.Pitch_Detail?.Pitch_Suited_For || 'N/A';
  
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
        <div>Loading match info...</div>
      </div>
    );
  }
  
  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '16px'
    }}>
      <div style={{
        background: 'rgba(248, 250, 252, 0.8)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px', 
          color: '#a181e7',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>🏏 Match</h3>
        <div style={{ 
          fontSize: '16px', 
          color: '#1f2937', 
          fontWeight: '500',
          lineHeight: '1.4'
        }}>{matchName}</div>
      </div>

      <div style={{
        background: 'rgba(248, 250, 252, 0.8)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px', 
          color: '#a181e7',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>📅 Date & Time</h3>
        <div style={{ 
          fontSize: '16px', 
          color: '#1f2937', 
          fontWeight: '500',
          lineHeight: '1.4'
        }}>
          {date} {time && `• ${time}`} IST
        </div>
      </div>

      <div style={{
        background: 'rgba(248, 250, 252, 0.8)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px', 
          color: '#a181e7',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>🏟️ Venue</h3>
        <div style={{ 
          fontSize: '16px', 
          color: '#1f2937', 
          fontWeight: '500',
          lineHeight: '1.4'
        }}>{venueName}</div>
      </div>

      <div style={{
        background: 'rgba(248, 250, 252, 0.8)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px', 
          color: '#a181e7',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>🎯 Match Type</h3>
        <div style={{ 
          fontSize: '16px', 
          color: '#1f2937', 
          fontWeight: '500',
          lineHeight: '1.4'
        }}>{matchType}</div>
      </div>

      <div style={{
        background: 'rgba(248, 250, 252, 0.8)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px', 
          color: '#a181e7',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>📊 Status</h3>
        <div style={{ 
          fontSize: '16px', 
          color: '#1f2937', 
          fontWeight: '500',
          lineHeight: '1.4'
        }}>{matchStatus}</div>
      </div>

      {venueData?.Venue_Weather && (
        <div style={{
          background: 'rgba(248, 250, 252, 0.8)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '8px', 
            color: '#a181e7',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>🌤️ Weather</h3>
          <div style={{ 
            fontSize: '16px', 
            color: '#1f2937', 
            fontWeight: '500',
            lineHeight: '1.4'
          }}>
            {venueData.Venue_Weather.Weather || 'N/A'} - {venueData.Venue_Weather.Temperature || 'N/A'}, {venueData.Venue_Weather.Description || 'N/A'}
            {venueData.Venue_Weather.Humidity && (
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                Humidity: {venueData.Venue_Weather.Humidity}
              </div>
            )}
            {venueData.Venue_Weather.Wind_Speed && (
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                Wind: {venueData.Venue_Weather.Wind_Speed}
              </div>
            )}
          </div>
        </div>
      )}

      {venueData?.Pitch_Detail && (
        <div style={{
          background: 'rgba(248, 250, 252, 0.8)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '8px', 
            color: '#a181e7',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>🏑 Pitch Conditions</h3>
          <div style={{ 
            fontSize: '16px', 
            color: '#1f2937', 
            fontWeight: '500',
            lineHeight: '1.4'
          }}>
            {pitchInfo}
            {venueData.Pitch_Detail.Pitch_Surface && (
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                Surface: {venueData.Pitch_Detail.Pitch_Surface}
              </div>
            )}
          </div>
        </div>
      )}

      {toss && (
        <div style={{
          background: 'rgba(248, 250, 252, 0.8)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '8px', 
            color: '#a181e7',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>🪙 Toss</h3>
          <div style={{ 
            fontSize: '16px', 
            color: '#1f2937', 
            fontWeight: '500',
            lineHeight: '1.4'
          }}>{toss}</div>
        </div>
      )}

      {umpires && umpires !== 'Umpires TBD' && (
        <div style={{
          background: 'rgba(248, 250, 252, 0.8)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '8px', 
            color: '#a181e7',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>👨‍⚖️ Umpires</h3>
          <div style={{ 
            fontSize: '16px', 
            color: '#1f2937', 
            fontWeight: '500',
            lineHeight: '1.4'
          }}>{umpires}</div>
        </div>
      )}

      {referee && referee !== 'Referee TBD' && (
        <div style={{
          background: 'rgba(248, 250, 252, 0.8)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '8px', 
            color: '#a181e7',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>🏛️ Referee</h3>
          <div style={{ 
            fontSize: '16px', 
            color: '#1f2937', 
            fontWeight: '500',
            lineHeight: '1.4'
          }}>{referee}</div>
        </div>
      )}

      {manOfMatch && manOfMatch !== 'TBD' && (
        <div style={{
          background: 'rgba(248, 250, 252, 0.8)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '8px', 
            color: '#a181e7',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>🏆 Man of the Match</h3>
          <div style={{ 
            fontSize: '16px', 
            color: '#1f2937', 
            fontWeight: '500',
            lineHeight: '1.4'
          }}>{manOfMatch}</div>
        </div>
      )}

      {result && result !== 'TBD' && (
        <div style={{
          background: 'rgba(248, 250, 252, 0.8)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '8px', 
            color: '#a181e7',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>📊 Result</h3>
          <div style={{ 
            fontSize: '16px', 
            color: '#1f2937', 
            fontWeight: '500',
            lineHeight: '1.4'
          }}>{result}</div>
        </div>
      )}

      {matchDetailData?.Awards && matchDetailData.Awards.length > 0 && (
        <div style={{
          background: 'rgba(248, 250, 252, 0.8)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '12px', 
            color: '#a181e7',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>🏅 Awards</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {matchDetailData.Awards.map((award, index) => (
              <div key={index} style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(236, 175, 26, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)',
                borderRadius: '8px',
                border: '1px solid rgba(236, 175, 26, 0.2)'
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#1f2937', 
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {award.Player_Name} ({award.Team_Name})
                  {award.Award_Type === 1 && ' - Player of the Match'}
                </div>
                {(award.Runs || award.Wickets) && (
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    {award.Runs && `${award.Runs} runs (${award.Balls} balls, ${award.Fours} fours, ${award.Sixes} sixes)`}
                    {award.Runs && award.Wickets && ' • '}
                    {award.Wickets && `${award.Wickets} wickets (${award.Overs_Bowled} overs, ${award.Runs_Conceded} runs)`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default MatchInfoTab;
