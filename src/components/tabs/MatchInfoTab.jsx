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
      <div className="tab-panel">
        <div style={{ textAlign: 'center' }}>
          <div>Loading match info...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      // backgroundColor: '#1e293b',
      color: 'white',
      padding: '30px 20px',
      minHeight: '400px',
      borderRadius: '8px'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Match</h3>
        <div style={{ fontSize: '16px' }}>{matchName}</div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Date & Time</h3>
        <div style={{ fontSize: '16px' }}>
          {date} {time && `• ${time}`} IST
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Venue</h3>
        <div style={{ fontSize: '16px' }}>{venueName}</div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Match Type</h3>
        <div style={{ fontSize: '16px' }}>{matchType}</div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Status</h3>
        <div style={{ fontSize: '16px' }}>{matchStatus}</div>
      </div>

      {venueData?.Venue_Weather && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Weather</h3>
          <div style={{ fontSize: '16px' }}>
            {venueData.Venue_Weather.Weather || 'N/A'} - {venueData.Venue_Weather.Temperature || 'N/A'}, {venueData.Venue_Weather.Description || 'N/A'}
            {venueData.Venue_Weather.Humidity && ` • Humidity: ${venueData.Venue_Weather.Humidity}`}
            {venueData.Venue_Weather.Wind_Speed && ` • Wind: ${venueData.Venue_Weather.Wind_Speed}`}
          </div>
        </div>
      )}

      {venueData?.Pitch_Detail && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Pitch Conditions</h3>
          <div style={{ fontSize: '16px' }}>
            {pitchInfo}
            {venueData.Pitch_Detail.Pitch_Surface && ` • Surface: ${venueData.Pitch_Detail.Pitch_Surface}`}
          </div>
        </div>
      )}

      {toss && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Toss</h3>
          <div style={{ fontSize: '16px' }}>{toss}</div>
        </div>
      )}

      {umpires && umpires !== 'Umpires TBD' && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Umpires</h3>
          <div style={{ fontSize: '16px' }}>{umpires}</div>
        </div>
      )}

      {referee && referee !== 'Referee TBD' && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Referee</h3>
          <div style={{ fontSize: '16px' }}>{referee}</div>
        </div>
      )}

      {manOfMatch && manOfMatch !== 'TBD' && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Man of the Match</h3>
          <div style={{ fontSize: '16px' }}>{manOfMatch}</div>
        </div>
      )}

      {result && result !== 'TBD' && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Result</h3>
          <div style={{ fontSize: '16px' }}>{result}</div>
        </div>
      )}

      {matchDetailData?.Awards && matchDetailData.Awards.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Awards</h3>
          <div style={{ fontSize: '16px' }}>
            {matchDetailData.Awards.map((award, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <strong>{award.Player_Name}</strong> ({award.Team_Name})
                {award.Award_Type === 1 && ' - Player of the Match'}
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                  {award.Runs && `${award.Runs} runs (${award.Balls} balls, ${award.Fours} fours, ${award.Sixes} sixes)`}
                  {award.Runs && award.Wickets && ' • '}
                  {award.Wickets && `${award.Wickets} wickets (${award.Overs_Bowled} overs, ${award.Runs_Conceded} runs)`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default MatchInfoTab;
