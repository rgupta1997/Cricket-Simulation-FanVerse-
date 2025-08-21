import React, { useState, useEffect } from 'react';
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
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(161, 129, 231, 0.2)',
      boxShadow: '0 8px 32px rgba(161, 129, 231, 0.15)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid rgba(161, 129, 231, 0.1)'
      }}>
        <h3 style={{
          margin: 0,
          color: '#a181e7',
          fontSize: '20px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🎯 Ball Prediction
        </h3>
        {showCloseButton && (
          <button 
            onClick={onToggle} 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {!currentUser ? (
        <div style={{
          textAlign: 'center',
          padding: '30px',
          background: 'linear-gradient(135deg, rgba(161, 129, 231, 0.1) 0%, rgba(186, 162, 230, 0.05) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(161, 129, 231, 0.2)'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>🔐</div>
          <p style={{
            marginBottom: '20px',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Please login to make predictions
          </p>
          <button 
            onClick={onLoginClick} 
            style={{
              background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Login to Continue
          </button>
        </div>
      ) : !matchId ? (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(236, 175, 26, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(236, 175, 26, 0.2)',
          color: '#ecaf1a'
        }}>
          <span style={{ fontSize: '24px', marginRight: '8px' }}>⚠️</span>
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
          
          <div style={{
            background: 'rgba(248, 250, 252, 0.8)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h4 style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                🎯 Predict Ball {getNextBallNumber()}
              </h4>
              <span style={{
                color: '#6b7280',
                fontSize: '12px'
              }}>Next: Last completed + 1</span>
            </div>
            
            {hasPredictedNextBall() ? (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(161, 129, 231, 0.1) 0%, rgba(186, 162, 230, 0.05) 100%)',
                borderRadius: '8px',
                border: '1px solid rgba(161, 129, 231, 0.2)'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                <div style={{ color: '#1f2937', fontWeight: '600', marginBottom: '4px' }}>
                  Predicted ball {getNextBallNumber()}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  Wait for ball {latestBallEvent?.Ball_Number || '?'} to complete
                </div>
              </div>
            ) : (
              <form onSubmit={handlePredictionSubmit}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div>
                    <span style={{
                      display: 'block',
                      marginBottom: '12px',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Runs:
                    </span>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {[0, 1, 2, 3, 4, 5, 6].map(run => (
                        <label key={run} style={{
                          position: 'relative',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="radio"
                            name="prediction"
                            value={run.toString()}
                            checked={prediction === run.toString()}
                            onChange={(e) => setPrediction(e.target.value)}
                            style={{ display: 'none' }}
                          />
                          <span style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            border: `2px solid ${prediction === run.toString() ? '#a181e7' : '#d1d5db'}`,
                            backgroundColor: prediction === run.toString() ? '#a181e7' : 'white',
                            color: prediction === run.toString() ? 'white' : '#374151',
                            fontSize: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}>
                            {run}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span style={{
                      display: 'block',
                      marginBottom: '12px',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Wicket:
                    </span>
                    <label style={{
                      position: 'relative',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="prediction"
                        value="W"
                        checked={prediction === 'W'}
                        onChange={(e) => setPrediction(e.target.value)}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        width: '60px',
                        height: '40px',
                        borderRadius: '8px',
                        border: `2px solid ${prediction === 'W' ? '#ecaf1a' : '#d1d5db'}`,
                        backgroundColor: prediction === 'W' ? '#ecaf1a' : 'white',
                        color: prediction === 'W' ? 'white' : '#374151',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}>
                        W
                      </span>
                    </label>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={!prediction || isLoading}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '12px 24px',
                    background: !prediction || isLoading 
                      ? '#d1d5db' 
                      : 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: !prediction || isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!(!prediction || isLoading)) {
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {isLoading ? 'Saving...' : 'Submit Prediction'}
                </button>
              </form>
            )}
          </div>



          <div style={{
            background: 'rgba(248, 250, 252, 0.8)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h4 style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                📋 Recent Predictions
              </h4>
              <button 
                onClick={handleClearPredictions} 
                disabled={isLoading}
                style={{
                  padding: '6px 12px',
                  background: isLoading ? '#d1d5db' : 'linear-gradient(135deg, #e0bda9 0%, #ecaf1a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {isLoading ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {predictions.slice(0, 8).map(pred => (
                <div 
                  key={pred.id} 
                  style={{
                    padding: '12px 16px',
                    background: pred.resultChecked ? 
                      (pred.isCorrect ? 'linear-gradient(135deg, rgba(161, 129, 231, 0.1) 0%, rgba(186, 162, 230, 0.05) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(252, 165, 165, 0.05) 100%)') :
                      'linear-gradient(135deg, rgba(236, 175, 26, 0.1) 0%, rgba(224, 189, 169, 0.05) 100%)',
                    borderRadius: '8px',
                    border: `1px solid ${pred.resultChecked ? 
                      (pred.isCorrect ? 'rgba(161, 129, 231, 0.2)' : 'rgba(239, 68, 68, 0.2)') :
                      'rgba(236, 175, 26, 0.2)'}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <span style={{
                        color: '#1f2937',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {pred.firstName} {pred.lastName}
                      </span>
                      <span style={{
                        color: '#6b7280',
                        fontSize: '12px'
                      }}>
                        Ball {pred.ballNumber}: {pred.prediction === 'W' ? 'Wicket' : `${pred.prediction} runs`}
                      </span>
                    </div>
                    
                    <div>
                      {pred.resultChecked ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '16px' }}>
                            {pred.isCorrect ? '✅' : '❌'}
                          </span>
                          <span style={{
                            color: '#374151',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {pred.actualResult}
                          </span>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '16px' }}>⏳</span>
                          <span style={{
                            color: '#6b7280',
                            fontSize: '12px'
                          }}>
                            Waiting...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {predictions.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                  <span style={{ fontSize: '14px' }}>
                    No predictions yet. Make your first prediction above!
                  </span>
                </div>
              )}
            </div>
          </div>

           {/* Leaderboard Section */}
           <div style={{
            background: 'rgba(248, 250, 252, 0.8)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
             <div style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: '16px'
             }}>
               <h4 style={{
                 margin: 0,
                 color: '#1f2937',
                 fontSize: '16px',
                 fontWeight: '600'
               }}>
                 🏆 Leaderboard
               </h4>
               <span style={{
                 color: '#6b7280',
                 fontSize: '12px'
               }}>
                 1 point per correct prediction
               </span>
             </div>
             <div style={{
               display: 'flex',
               gap: '12px',
               flexWrap: 'wrap'
             }}>
               {matchId ? (
                 <>
                   <button 
                     onClick={() => window.open(`http://localhost:3001/api/match/${matchId}/leaderboard`, '_blank')}
                     style={{
                       padding: '10px 16px',
                       background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
                       color: 'white',
                       border: 'none',
                       borderRadius: '8px',
                       fontSize: '14px',
                       fontWeight: '600',
                       cursor: 'pointer',
                       transition: 'all 0.2s ease',
                       minWidth: '120px'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'translateY(-2px)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'translateY(0)';
                     }}
                   >
                     Match Board
                   </button>
                   <button 
                     onClick={() => window.open(`http://localhost:3001/api/leaderboard`, '_blank')}
                     style={{
                       padding: '10px 16px',
                       background: 'linear-gradient(135deg, #ecaf1a 0%, #e0bda9 100%)',
                       color: 'white',
                       border: 'none',
                       borderRadius: '8px',
                       fontSize: '14px',
                       fontWeight: '600',
                       cursor: 'pointer',
                       transition: 'all 0.2s ease',
                       minWidth: '120px'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'translateY(-2px)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'translateY(0)';
                     }}
                   >
                     Global Board
                   </button>
                 </>
               ) : (
                 <span style={{
                   color: '#ecaf1a',
                   fontSize: '14px',
                   fontWeight: '600'
                 }}>
                   ⚠️ Match ID not available
                 </span>
               )}
             </div>
           </div>
         </>
       )}
     </div>
   );
 };

export default PredictionSection;
