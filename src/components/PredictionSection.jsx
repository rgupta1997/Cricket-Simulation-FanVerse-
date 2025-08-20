import React, { useState, useEffect } from 'react';
import './PredictionSection.css';
import { savePrediction, getPredictions, clearPredictions, updateLeaderboard } from '../services/predictionService';

const PredictionSection = ({ currentUser, onLoginClick, latestBallEvent, isOpen, onToggle, matchId }) => {
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
        console.log('✅ Leaderboard updated successfully:', response.message);
        console.log('🏆 Correct predictions found:', response.correctPredictions);
        console.log('🏆 Points awarded:', response.pointsAwarded);
        
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
        <button onClick={onToggle} className="close-prediction-btn">✕</button>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          padding: '8px', 
          marginBottom: '10px', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '4px',
          fontSize: '11px',
          color: 'white',
          fontFamily: 'monospace'
        }}>
          <strong>Debug:</strong> matchId={matchId || 'undefined'} | 
          currentUser={currentUser ? 'logged in' : 'not logged in'} |
          lastBallNumber={lastBallNumber || 'null'}
        </div>
      )}

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
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
                     <div className="prediction-form">
             <h4>Predict Ball {getNextBallNumber()}:</h4>
             <p style={{ fontSize: '12px', color: '#999', marginBottom: '12px', fontStyle: 'italic' }}>
               Next ball is calculated as: Last completed ball + 1
             </p>
             
             {/* Debug info for ball number logic */}
             {process.env.NODE_ENV === 'development' && (
               <div style={{ 
                 padding: '6px', 
                 marginBottom: '8px', 
                 backgroundColor: 'rgba(255,255,255,0.1)', 
                 borderRadius: '4px',
                 fontSize: '10px',
                 color: '#ccc',
                 fontFamily: 'monospace'
               }}>
                 <strong>Ball Logic:</strong> Last ball: {lastBallNumber || 'null'} | 
                 Next ball: {getNextBallNumber()} | 
                 Latest event: {latestBallEvent?.Ball_Number || 'none'}
               </div>
             )}
             
             {hasPredictedNextBall() ? (
               <div className="already-predicted">
                 <p>✅ You have predicted ball {getNextBallNumber()}</p>
                 <p style={{ fontSize: '14px', color: '#ccc' }}>
                   Wait for the next ball to make another prediction
                 </p>
                 <p style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                   Next ball will be available when ball {latestBallEvent?.Ball_Number || '?'} is completed
                 </p>
               </div>
             ) : (
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
                   disabled={!prediction || isLoading}
                 >
                   {isLoading ? 'Saving...' : 'Submit Prediction'}
                 </button>
               </form>
             )}
           </div>



          <div className="prediction-history">
            <div className="history-header">
              <h4>Recent Predictions</h4>
                        <button 
                          onClick={handleClearPredictions} 
                          className="clear-btn"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Clearing...' : 'Clear All'}
                        </button>
            </div>
            
                         <div className="predictions-list">
               {predictions.slice(0, 10).map(pred => (
                 <div key={pred.id} className={`prediction-item ${pred.resultChecked ? 'checked' : 'pending'}`}>
                   <div className="prediction-info">
                     <span className="user-name">{pred.firstName} {pred.lastName}</span>
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

           {/* Leaderboard Section */}
           <div className="leaderboard-section">
             <h4>🏆 Leaderboard</h4>
             <div className="leaderboard-content">
               <p className="leaderboard-info">
                 Points are awarded for correct predictions. Each correct prediction earns <strong>1 point</strong>.
               </p>
                               {matchId ? (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => window.open(`http://localhost:3001/api/match/${matchId}/leaderboard`, '_blank')}
                      className="view-leaderboard-btn"
                    >
                      Match Leaderboard
                    </button>
                    <button 
                      onClick={() => window.open(`http://localhost:3001/api/leaderboard`, '_blank')}
                      className="view-leaderboard-btn"
                      style={{ backgroundColor: '#059669' }}
                    >
                      Global Leaderboard
                    </button>
                  </div>
                ) : (
                  <p className="error-message" style={{color: 'orange'}}>
                    ⚠️ Match ID not available for leaderboard
                  </p>
                )}
             </div>
           </div>
         </>
       )}
     </div>
   );
 };

export default PredictionSection;
