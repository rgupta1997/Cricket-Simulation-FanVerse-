import '../../styles/responsive.css';

const LiveMatchDetailsTab = ({ match, matchDetail, TeamLogo, formatDate }) => {
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
  
  // Extract toss information
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

  if (!match) {
    return (
      <div className="tab-panel">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div>Loading match details...</div>
        </div>
      </div>
    );
  }

    return (
      <div style={{
        padding: '10px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        // Remove the fixed maxHeight that's preventing full scroll
        // maxHeight: 'calc(100vh - 410px)',
        // overflowY: 'auto'
        minHeight: 'calc(100vh - 410px)', // Use minHeight instead to allow expansion
        overflowY: 'visible' // Allow natural overflow
      
      }}>
        {/* Match Summary Section - Optimized for width */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(161, 129, 231, 0.1) 0%, rgba(186, 162, 230, 0.05) 100%)',
          border: '1px solid rgba(161, 129, 231, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          {/* Header Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#a181e7',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span>📅</span>
              {formatDate ? formatDate(match.date).shortDate : match.date}
            </div>
            <div style={{
              color: '#a181e7',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {match.matchName} • {match.matchType} Match
            </div>
            {match.status === 'live' && (
              <div style={{
                background: 'linear-gradient(135deg, #ecaf1a 0%, #e0bda9 100%)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🔴 LIVE NOW
            </div>
          )}
        </div>

        {/* Teams and Scores Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {/* Team 1 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: '1 1 300px',
            minWidth: '250px'
          }}>
            <TeamLogo team={match.team1} size={45} />
            <div>
              {matchDetail?.scores?.team1 ? (
                <>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1f2937',
                    lineHeight: '1.2'
                  }}>
                    {matchDetail.scores.team1.runs}/{matchDetail.scores.team1.wickets}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {matchDetail.scores.team1.overs} overs
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1f2937',
                    lineHeight: '1.2'
                  }}>
                    {match.team1.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {match.team1.shortName}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* VS */}
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#dc2626',
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '2px solid #fecaca'
          }}>
            VS
          </div>

          {/* Team 2 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: '1 1 300px',
            minWidth: '250px',
            justifyContent: 'flex-end'
          }}>
            <div style={{ textAlign: 'right' }}>
              {matchDetail?.scores?.team2 ? (
                <>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1f2937',
                    lineHeight: '1.2'
                  }}>
                    {matchDetail.scores.team2.runs}/{matchDetail.scores.team2.wickets}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {matchDetail.scores.team2.overs} overs
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1f2937',
                    lineHeight: '1.2'
                  }}>
                    {match.team2.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {match.team2.shortName}
                  </div>
                </>
              )}
            </div>
            <TeamLogo team={match.team2} size={45} />
          </div>
        </div>

        {/* Result Row */}
        {match.result && (
          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {match.result.resultText}
          </div>
        )}
      </div>

      {/* Match Info Section - Grid Layout for Width Optimization */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        color: '#1f2937'
      }}>
        {/* Basic Match Info */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(236, 175, 26, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(236, 175, 26, 0.2)'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '12px',
            color: '#1f2937',
            borderBottom: '2px solid #ecaf1a',
            paddingBottom: '4px'
          }}>
            Match Details
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Tournament:</span>
              <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>{tournament}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Date & Time:</span>
              <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>{date} {time && `• ${time}`} IST</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Venue:</span>
              <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>{venueName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Match Type:</span>
              <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>{matchType}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Status:</span>
              <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>{matchStatus}</span>
            </div>
          </div>
        </div>

        {/* Match Conditions */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(186, 162, 230, 0.1) 0%, rgba(161, 129, 231, 0.05) 100%)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(186, 162, 230, 0.2)'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '12px',
            color: '#1f2937',
            borderBottom: '2px solid #baa2e6',
            paddingBottom: '4px'
          }}>
            Match Conditions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {toss && toss !== 'Toss details not available' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Toss:</span>
                <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '70%' }}>{toss}</span>
              </div>
            )}
            {venueData?.Venue_Weather && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Weather:</span>
                <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '70%' }}>
                  {venueData.Venue_Weather.Weather || 'N/A'} - {venueData.Venue_Weather.Temperature || 'N/A'}
                  {venueData.Venue_Weather.Humidity && `, Humidity: ${venueData.Venue_Weather.Humidity}`}
                </span>
              </div>
            )}
            {venueData?.Pitch_Detail && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Pitch:</span>
                <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '70%' }}>
                  {pitchInfo}
                  {venueData.Pitch_Detail.Pitch_Surface && ` • ${venueData.Pitch_Detail.Pitch_Surface}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Officials */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '12px',
            color: '#475569',
            borderBottom: '2px solid #dc2626',
            paddingBottom: '4px'
          }}>
            Match Officials
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {umpires && umpires !== 'Umpires TBD' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Umpires:</span>
                <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '70%' }}>{umpires}</span>
              </div>
            )}
            {referee && referee !== 'Referee TBD' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Referee:</span>
                <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '70%' }}>{referee}</span>
              </div>
            )}
            {result && result !== 'TBD' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Result:</span>
                <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '70%' }}>{result}</span>
              </div>
            )}
          </div>
        </div>

        {/* Awards & Recognition */}
        {(matchDetailData?.Awards && matchDetailData.Awards.length > 0) || (manOfMatch && manOfMatch !== 'TBD') ? (
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              marginBottom: '12px',
              color: '#475569',
              borderBottom: '2px solid #dc2626',
              paddingBottom: '4px'
            }}>
              Awards & Recognition
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {manOfMatch && manOfMatch !== 'TBD' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Man of Match:</span>
                  <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'right', maxWidth: '70%' }}>{manOfMatch}</span>
                </div>
              )}
              {matchDetailData?.Awards && matchDetailData.Awards.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {matchDetailData.Awards.map((award, index) => (
                    <div key={index} style={{
                      backgroundColor: '#ffffff',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '2px'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                          {award.Player_Name}
                        </span>
                        {award.Award_Type === 1 && (
                          <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: '600' }}>
                            🏆 POTM
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                        {award.Team_Name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        {award.Runs && `${award.Runs} runs (${award.Balls} balls, ${award.Fours} fours, ${award.Sixes} sixes)`}
                        {award.Runs && award.Wickets && ' • '}
                        {award.Wickets && `${award.Wickets} wickets (${award.Overs_Bowled} overs, ${award.Runs_Conceded} runs)`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LiveMatchDetailsTab;
