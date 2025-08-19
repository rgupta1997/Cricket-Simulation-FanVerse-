import '../../styles/responsive.css';

const MatchInfoTab = ({ matchDetail }) => {
  // Extract data from the new matchDetail structure
  const matchDetailData = matchDetail?.Matchdetail || {};
  const seriesData = matchDetail?.Series || {};
  const venueData = matchDetail?.Venue || {};
  const officialsData = matchDetail?.Officials || {};
  const matchData = matchDetailData?.Match || {};
  const teamsData = matchDetail?.Teams || {};
  
  // Use new data structure
  const tournament = seriesData.Name || seriesData.Series_short_display_name || 'Cricket Match';
  const date = matchData.Date || matchData.StartDate?.split('T')[0] || 'TBD';
  const time = matchData.Time || '';
  const venueName = venueData.Name ? `${venueData.Name}, ${venueData.City}` : 'Venue TBD';
  
  // Extract toss information using team names
  const tossWinningTeamId = matchDetailData.Tosswonby;
  const tossWinningTeam = teamsData[tossWinningTeamId];
  const tossDecision = matchDetailData.Toss_elected_to;
  const toss = tossWinningTeam && tossDecision 
    ? `${tossWinningTeam.Name_Full} won the toss and elected to ${tossDecision}` 
    : 'Toss details not available';
  
  const umpires = officialsData.Umpires || 'Umpires TBD';
  const referee = officialsData.Referee || 'Referee TBD';
  const manOfMatch = matchDetailData.Player_Match || 'TBD';
  
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
      backgroundColor: '#1e293b',
      color: 'white',
      padding: '30px 20px',
      minHeight: '400px',
      borderRadius: '8px'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Match</h3>
        <div style={{ fontSize: '16px' }}>{tournament}</div>
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

      {venueData.Venue_Weather && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Weather</h3>
          <div style={{ fontSize: '16px' }}>
            {venueData.Venue_Weather.Weather || 'N/A'} - {venueData.Venue_Weather.Temperature || 'N/A'}, {venueData.Venue_Weather.Description || 'N/A'}
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

      {matchData.Type && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Match Type</h3>
          <div style={{ fontSize: '16px' }}>{matchData.Type}</div>
        </div>
      )}

      {matchDetailData.Result && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Result</h3>
          <div style={{ fontSize: '16px' }}>{matchDetailData.Result}</div>
        </div>
      )}

    </div>
  );
};

export default MatchInfoTab;
