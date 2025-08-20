import React, { useState, useEffect } from 'react';
import './PredictionSection.css';
import { savePrediction, getPredictions, clearPredictions, updateLeaderboard } from '../services/predictionService';

const PredictionSection = ({ currentUser, onLoginClick, latestBallEvent, isOpen, onToggle, matchId, showCloseButton = true }) => {
  const [prediction, setPrediction] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [lastBallNumber, setLastBallNumber] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load predictions from backend API on component mount
  useEffect(() => {
    if (matchId && currentUser) {
      loadPredictions();
    }
  }, [matchId, currentUser]);

  const loadPredictions = async () => {
    if (!matchId) {
      console.warn('🎯 PredictionSection - Cannot load predictions: matchId is missing');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('🎯 PredictionSection - Loading predictions for matchId:', matchId);
      const response = await getPredictions(matchId);
      setPredictions(response.predictions || []);
      console.log('🎯 PredictionSection - Predictions loaded successfully:', response.predictions?.length || 0);
    } catch (error) {
      console.error('🎯 PredictionSection - Error loading predictions:', error);
      setError('Failed to load predictions');
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeaderboardForBall = async (ballNumber, ballEvent) => {
    if (!matchId) {
      console.warn('🎯 PredictionSection - Cannot update leaderboard: matchId is missing');
      return;
    }
    
    try {
      // Extract ball details from the event
      const ballNumberStr = ballEvent.Ball_Number?.toString() || ballNumber?.toString();
      const batsmanRuns = ballEvent.Batsman_Runs?.toString() || '0';
      const isWicket = ballEvent.ballDetails?.isWicket || ballEvent.IsWicket || false;
      
      console.log('🏆 Updating leaderboard for ball', ballNumberStr, 'with result:', {
        runs: batsmanRuns,
        isWicket: isWicket,
        matchId: matchId
      });
      
      // Create leaderboard data with enhanced information
      const leaderboardData = {
        ballNumber: ballNumberStr,
        actualResult: isWicket ? 'W' : batsmanRuns,
        isWicket: isWicket,
        batsmanRuns: batsmanRuns,
        matchId: matchId
      };
      
      const response = await updateLeaderboard(matchId, leaderboardData);
      
      if (response.success) {
        
        // Reload predictions to show updated results
        await loadPredictions();
      }
    } catch (error) {
      console.error('🎯 PredictionSection - Error updating leaderboard:', error);
      // Don't show error to user for leaderboard updates
    }
  };

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
        
        // Automatically update leaderboard for this ball
        updateLeaderboardForBall(lastBallNumber, latestBallEvent);
      }
      
      setLastBallNumber(currentBallNumber);
      
      // Clear prediction form when ball number changes (new ball available)
      if (lastBallNumber !== null && currentBallNumber > lastBallNumber) {
        setPrediction('');
      }
    }
  }, [latestBallEvent, lastBallNumber]);

  // Load predictions when matchId changes
  useEffect(() => {
    if (matchId && currentUser) {
      loadPredictions();
    }
  }, [matchId]);

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

  const handlePredictionSubmit = async (e) => {
    e.preventDefault();
    if (!prediction) return;

    if (!currentUser) {
      onLoginClick();
      return;
    }

    if (!matchId) {
      setError('Match ID is required to save prediction. Please refresh the page and try again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("🎯 PredictionSection - MatchID:", matchId, "Type:", typeof matchId);
      const predictionData = {
        userId: currentUser.userId,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        prediction,
        matchId: matchId,
        ballNumber: lastBallNumber !== null ? lastBallNumber + 1 : 0,
        timestamp: new Date().toISOString()
      };

      console.log('🎯 Saving prediction to backend:', predictionData);

      const response = await savePrediction(matchId, predictionData);
      
      if (response.success) {
        // Add the new prediction to local state
        const newPrediction = {
          ...response.prediction,
          resultChecked: false,
          isCorrect: null,
          actualResult: null,
          ballEvent: null
        };
        
        setPredictions(prev => [newPrediction, ...prev]);
        setPrediction('');
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error saving prediction:', error);
      
      // Handle specific error cases
      if (error.response?.data?.error === 'Duplicate Prediction') {
        const existingPred = error.response.data.existingPrediction;
        setError(`You already predicted "${existingPred.prediction}" for ball ${predictionData.ballNumber}. Only one prediction per ball is allowed.`);
      } else {
        setError('Failed to save prediction. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPredictions = async () => {
    if (!matchId) {
      setError('Match ID is required to clear predictions. Please refresh the page and try again.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎯 PredictionSection - Clearing predictions for matchId:', matchId);
      await clearPredictions(matchId);
      setPredictions([]);
    } catch (error) {
      console.error('🎯 PredictionSection - Error clearing predictions:', error);
      setError('Failed to clear predictions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  // Check if user has already predicted the next ball
  const hasPredictedNextBall = () => {
    if (!lastBallNumber) return false;
    const nextBallNumber = lastBallNumber + 1;
    return predictions.some(pred => 
      pred.ballNumber === nextBallNumber && 
      pred.userId === currentUser?.userId
    );
  };

  // Get the next ball number to predict
  const getNextBallNumber = () => {
    return lastBallNumber !== null ? lastBallNumber + 1 : 1;
  };



  // Debug information
  console.log('🎯 PredictionSection render:', {
    currentUser,
    latestBallEvent,
    lastBallNumber,
    matchId,
    predictions: predictions.length
  });

  if (!isOpen) {
    return null; // Don't render anything when closed - the toggle is handled by parent components
  }

  return (
    <div className="prediction-section">
      <div className="prediction-header">
        <h3>🎯 Ball Prediction</h3>
        {showCloseButton && <button onClick={onToggle} className="close-prediction-btn">✕</button>}
      </div>

      {/* Debug Info */}
      

      {!currentUser ? (
        <div className="login-required">
          <p>Please login to make predictions</p>
          <button onClick={onLoginClick} className="login-btn">
            Login to Continue
          </button>
        </div>
      ) : !matchId ? (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          Match ID is missing. Please refresh the page or navigate to a match.
        </div>
      ) : (
        <>
          {/* {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )} */}
          
          <div className="prediction-form">
            <div className="form-header">
              <h4>🎯 Predict Ball {getNextBallNumber()}</h4>
              <span className="next-ball-info">Next: Last completed + 1</span>
            </div>
            
            {hasPredictedNextBall() ? (
              <div className="already-predicted">
                <span className="prediction-status-icon">✅</span>
                <span className="prediction-status-text">Predicted ball {getNextBallNumber()}</span>
                <span className="waiting-info">Wait for ball {latestBallEvent?.Ball_Number || '?'} to complete</span>
              </div>
            ) : (
              <form onSubmit={handlePredictionSubmit}>
                <div className="prediction-options">
                  <div className="runs-section">
                    <span className="option-label">Runs:</span>
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
                  
                  <div className="wicket-section">
                    <span className="option-label">Wicket:</span>
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
                  disabled={!prediction || isLoading}
                >
                  {isLoading ? 'Saving...' : 'Submit Prediction'}
                </button>
              </form>
            )}
          </div>



          <div className="prediction-history">
            <div className="history-header">
              <h4>📋 Recent Predictions</h4>
              <button 
                onClick={handleClearPredictions} 
                className="clear-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
            
            <div className="predictions-list">
              {predictions.slice(0, 8).map(pred => (
                <div key={pred.id} className={`prediction-item ${pred.resultChecked ? 'checked' : 'pending'}`}>
                  <div className="prediction-row">
                    <div className="prediction-details">
                      <span className="user-name">{pred.firstName} {pred.lastName}</span>
                      <span className="prediction-info">
                        Ball {pred.ballNumber}: {pred.prediction === 'W' ? 'Wicket' : `${pred.prediction} runs`}
                      </span>
                    </div>
                    
                    <div className="prediction-outcome">
                      {pred.resultChecked ? (
                        <div className={`result ${pred.isCorrect ? 'correct' : 'incorrect'}`}>
                          <span className="result-icon">{pred.isCorrect ? '✅' : '❌'}</span>
                          <span className="result-text">{pred.actualResult}</span>
                        </div>
                      ) : (
                        <div className="pending-status">
                          <span className="pending-icon">⏳</span>
                          <span className="pending-text">Waiting...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {predictions.length === 0 && (
                <div className="no-predictions">
                  <span className="no-predictions-icon">📊</span>
                  <span className="no-predictions-text">No predictions yet. Make your first prediction above!</span>
                </div>
              )}
            </div>
          </div>

           {/* Leaderboard Section */}
           <div className="leaderboard-section">
             <div className="leaderboard-header">
               <h4>🏆 Leaderboard</h4>
               <span className="points-info">1 point per correct prediction</span>
             </div>
             <div className="leaderboard-actions">
               {matchId ? (
                 <>
                   <button 
                     onClick={() => window.open(`http://localhost:3001/api/match/${matchId}/leaderboard`, '_blank')}
                     className="view-leaderboard-btn match-board"
                   >
                     Match Board
                   </button>
                   <button 
                     onClick={() => window.open(`http://localhost:3001/api/leaderboard`, '_blank')}
                     className="view-leaderboard-btn global-board"
                   >
                     Global Board
                   </button>
                 </>
               ) : (
                 <span className="error-text">⚠️ Match ID not available</span>
               )}
             </div>
           </div>
         </>
       )}
     </div>
   );
 };

export default PredictionSection;
