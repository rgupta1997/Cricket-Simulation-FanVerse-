import React from 'react';
import { getVenueById } from '../../data/index.js';
import '../../styles/responsive.css';

const MatchInfoTab = ({ matchDetail, match }) => {
  const venue = match ? getVenueById(match.venueId) : null;
  
  // Use match data if available, fallback to matchDetail
  const tournament = match?.tournamentId === 'ipl2025' ? 'TATA IPL 2025' : matchDetail?.matchInfo?.tournament;
  const date = match?.date || matchDetail?.matchInfo?.date;
  const time = match?.time || '';
  const venueName = venue ? `${venue.name}, ${venue.city}` : matchDetail?.matchInfo?.venue;
  const toss = match?.toss ? 
    `${match.toss.winnerId} Won The Toss And Elected To ${match.toss.decision === 'bat' ? 'Bat' : 'Bowl'}` : 
    matchDetail?.matchInfo?.toss;
  const officials = match?.officials || matchDetail?.matchInfo;
  const manOfMatch = match?.manOfTheMatch?.playerName || matchDetail?.matchInfo?.manOfTheMatch;
  
  if (!match && (!matchDetail || !matchDetail.matchInfo)) {
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
          {date} {time && `• ${time}`} {match?.timezone || 'IST'}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Venue</h3>
        <div style={{ fontSize: '16px' }}>{venueName}</div>
      </div>

      {toss && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Toss</h3>
          <div style={{ fontSize: '16px' }}>{toss}</div>
        </div>
      )}

      {officials?.umpires && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Umpires</h3>
          <div style={{ fontSize: '16px' }}>
            {Array.isArray(officials.umpires) ? officials.umpires.join(', ') : officials.umpires}
          </div>
        </div>
      )}

      {officials?.referee && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Referee</h3>
          <div style={{ fontSize: '16px' }}>{officials.referee}</div>
        </div>
      )}

      {manOfMatch && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Man of the Match</h3>
          <div style={{ fontSize: '16px' }}>{manOfMatch}</div>
        </div>
      )}

      {match?.broadcast && (
        <>
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>TV Broadcast</h3>
            <div style={{ fontSize: '16px' }}>{match.broadcast.tv.join(', ')}</div>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>Live Streaming</h3>
            <div style={{ fontSize: '16px' }}>{match.broadcast.digital.join(', ')}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default MatchInfoTab;
