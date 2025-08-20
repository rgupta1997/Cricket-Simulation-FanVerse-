import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CricketGame from './CricketGame';

const SimulatorPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/match/${matchId}`);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      position: 'relative'
    }}>
      {/* Back Button */}
      <button
        onClick={handleBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '2px solid white',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(4px)',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Match
      </button>

      {/* Full Screen Simulator */}
      <div style={{ width: '100%', height: '100%' }}>
        <CricketGame 
          matchId={matchId}
          isEmbedded={false}
        />
      </div>
    </div>
  );
};

export default SimulatorPage;
