import PredictionSection from '../PredictionSection.jsx';

const PredictionTab = ({ matchId, currentUser, onLoginClick, latestBallEvent }) => {
  return (
    <div className="prediction-tab" style={{ 
      padding: '20px',
      height: '100%',
      overflow: 'auto'
    }}>
      <PredictionSection
        currentUser={currentUser}
        onLoginClick={onLoginClick}
        latestBallEvent={latestBallEvent}
        isOpen={true} // Always open when in this tab
        onToggle={() => {}} // No toggle functionality needed in tab
        matchId={matchId}
        showCloseButton={false} // Hide close button in tab view
      />
    </div>
  );
};

export default PredictionTab;
