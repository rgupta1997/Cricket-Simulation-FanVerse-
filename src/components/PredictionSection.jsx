import React, { useState, useEffect } from 'react';
import './PredictionSection.css';

const PredictionSection = ({ currentUser, onLoginClick, latestBallEvent, isOpen, onToggle }) => {
  const [prediction, setPrediction] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [lastBallNumber, setLastBallNumber] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Load predictions from localStorage on component mount
  useEffect(() => {
    const savedPredictions = localStorage.getItem('cricketPredictions');
    if (savedPredictions) {
      setPredictions(JSON.parse(savedPredictions));
    }
  }, []);

  // Check for new ball events and compare with predictions
  useEffect(() => {
    if (latestBallEvent && latestBallEvent.Ball_Number) {
      const currentBallNumber = parseInt(latestBallEvent.Ball_Number);
      console.log('🎯 Ball event received:', latestBallEvent);
      console.log('🎯 Current ball number:', currentBallNumber);
      console.log('🎯 Last ball number:', lastBallNumber);
      
      // Check if this is a new ball (increment from last ball)
      if (lastBallNumber !== null && currentBallNumber === lastBallNumber + 1) {
        console.log('🎯 Checking prediction for ball:', lastBallNumber);
        checkPredictionResult(latestBallEvent);
      }
      
      setLastBallNumber(currentBallNumber);
    }
  }, [latestBallEvent, lastBallNumber]);

  // Save predictions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cricketPredictions', JSON.stringify(predictions));
  }, [predictions]);

  const checkPredictionResult = (ballEvent) => {
    const pendingPrediction = predictions.find(p => 
      p.ballNumber === ballEvent.Ball_Number - 1 && !p.resultChecked
    );

    if (pendingPrediction) {
      let isCorrect = false;
      let actualResult = '';

      if (pendingPrediction.prediction === 'W') {
        // User predicted wicket
        isCorrect = ballEvent.IsWicket === true;
        actualResult = ballEvent.IsWicket ? 'W' : `Runs: ${ballEvent.Batsman_Runs || 0}`;
      } else {
        // User predicted runs
        const predictedRuns = parseInt(pendingPrediction.prediction);
        const actualRuns = parseInt(ballEvent.Batsman_Runs || 0);
        isCorrect = predictedRuns === actualRuns;
        actualResult = ballEvent.IsWicket ? 'W' : `Runs: ${actualRuns}`;
      }

      // Update prediction with result
      setPredictions(prev => prev.map(p => 
        p.id === pendingPrediction.id 
          ? { ...p, resultChecked: true, isCorrect, actualResult, ballEvent }
          : p
      ));
    }
  };

  const handlePredictionSubmit = (e) => {
    e.preventDefault();
    if (!prediction) return;

    if (!currentUser) {
      onLoginClick();
      return;
    }

    const newPrediction = {
      id: Date.now(),
      userId: currentUser.userId,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      prediction,
      ballNumber: lastBallNumber !== null ? lastBallNumber : 0,
      timestamp: new Date().toISOString(),
      resultChecked: false,
      isCorrect: null,
      actualResult: null,
      ballEvent: null
    };
    
    console.log('🎯 Creating prediction:', newPrediction);

    setPredictions(prev => [newPrediction, ...prev]);
    setPrediction('');
    setShowResults(true);
  };

  const clearPredictions = () => {
    setPredictions([]);
    localStorage.removeItem('cricketPredictions');
  };

  const getPredictionStats = () => {
    const checked = predictions.filter(p => p.resultChecked);
    const correct = checked.filter(p => p.isCorrect);
    return {
      total: checked.length,
      correct: correct.length,
      accuracy: checked.length > 0 ? Math.round((correct.length / checked.length) * 100) : 0
    };
  };

  const stats = getPredictionStats();

  // Debug information
  console.log('🎯 PredictionSection render:', {
    currentUser,
    latestBallEvent,
    lastBallNumber,
    predictions: predictions.length
  });

  if (!isOpen) {
    return (
      <div className="prediction-toggle">
        <button onClick={onToggle} className="prediction-toggle-btn">
          🎯 Predictions
        </button>
      </div>
    );
  }

  return (
    <div className="prediction-section">
      <div className="prediction-header">
        <h3>🎯 Ball Prediction</h3>
        <button onClick={onToggle} className="close-prediction-btn">✕</button>
      </div>

      {!currentUser ? (
        <div className="login-required">
          <p>Please login to make predictions</p>
          <button onClick={onLoginClick} className="login-btn">
            Login to Continue
          </button>
        </div>
      ) : (
        <>
          <div className="prediction-form">
            <h4>Predict the next ball:</h4>
            <form onSubmit={handlePredictionSubmit}>
              <div className="prediction-options">
                <div className="runs-predictions">
                  <label>Runs:</label>
                  <div className="runs-buttons">
                    {[0, 1, 2, 3, 4, 5, 6].map(run => (
                      <label key={run} className="radio-option">
                        <input
                          type="radio"
                          name="prediction"
                          value={run.toString()}
                          checked={prediction === run.toString()}
                          onChange={(e) => setPrediction(e.target.value)}
                        />
                        <span className="radio-custom">{run}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="wicket-prediction">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="prediction"
                      value="W"
                      checked={prediction === 'W'}
                      onChange={(e) => setPrediction(e.target.value)}
                    />
                    <span className="radio-custom wicket">W</span>
                  </label>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="submit-prediction-btn"
                disabled={!prediction}
              >
                Submit Prediction
              </button>
            </form>
          </div>

          <div className="prediction-stats">
            <h4>Your Stats:</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Predictions:</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Correct:</span>
                <span className="stat-value correct">{stats.correct}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accuracy:</span>
                <span className="stat-value">{stats.accuracy}%</span>
              </div>
            </div>
          </div>

          <div className="prediction-history">
            <div className="history-header">
              <h4>Recent Predictions</h4>
              <button onClick={clearPredictions} className="clear-btn">
                Clear All
              </button>
            </div>
            
            <div className="predictions-list">
              {predictions.slice(0, 10).map(pred => (
                <div key={pred.id} className={`prediction-item ${pred.resultChecked ? 'checked' : 'pending'}`}>
                  <div className="prediction-info">
                    <span className="user-name">{pred.userName}</span>
                    <span className="prediction-value">
                      Predicted: {pred.prediction === 'W' ? 'Wicket' : `${pred.prediction} runs`}
                    </span>
                    <span className="ball-number">Ball: {pred.ballNumber}</span>
                  </div>
                  
                  {pred.resultChecked && (
                    <div className={`prediction-result ${pred.isCorrect ? 'correct' : 'incorrect'}`}>
                      <span className="result-icon">
                        {pred.isCorrect ? '✅' : '❌'}
                      </span>
                      <span className="actual-result">
                        Actual: {pred.actualResult}
                      </span>
                    </div>
                  )}
                  
                  {!pred.resultChecked && (
                    <div className="prediction-status">
                      <span className="status-pending">⏳ Waiting for result...</span>
                    </div>
                  )}
                </div>
              ))}
              
              {predictions.length === 0 && (
                <div className="no-predictions">
                  <p>No predictions yet. Make your first prediction above!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionSection;
