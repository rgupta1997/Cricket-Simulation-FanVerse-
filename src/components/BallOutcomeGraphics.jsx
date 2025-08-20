import React, { useState, useEffect } from 'react';
import './BallOutcomeGraphics.css';

const BallOutcomeGraphics = ({ 
  isVisible, 
  ballOutcome, 
  onComplete 
}) => {
  console.log('🎮 BallOutcomeGraphics component rendered with props:', { isVisible, ballOutcome });
  const [showGraphic, setShowGraphic] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('enter'); // enter, display, exit

  // Always show a debug element to verify component is rendered
  const debugElement = (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'blue', 
      color: 'white', 
      padding: '5px', 
      zIndex: 99999,
      fontSize: '12px',
      border: '2px solid white'
    }}>
      🎮 BallOutcomeGraphics: isVisible={isVisible ? 'true' : 'false'}, ballOutcome={ballOutcome ? 'exists' : 'null'}
      <br />
      <button 
        onClick={() => {
          console.log('🎮 Manual test button clicked!');
          setShowGraphic(true);
          setAnimationPhase('enter');
        }}
        style={{ 
          background: 'green', 
          color: 'white', 
          border: 'none', 
          padding: '2px 5px', 
          marginTop: '2px',
          cursor: 'pointer'
        }}
      >
        Test Graphics
      </button>
      <button 
        onClick={() => {
          console.log('🎮 Dummy data test button clicked!');
          // Simulate dummy data BallOutcome
          const dummyBallOutcome = {
            type: 'boundary',
            runs: 4,
            description: 'Driven through covers for four'
          };
          console.log('🎮 Simulating dummy BallOutcome:', dummyBallOutcome);
          // This will trigger the graphics with dummy data
        }}
        style={{ 
          background: 'orange', 
          color: 'white', 
          border: 'none', 
          padding: '2px 5px', 
          marginTop: '2px',
          cursor: 'pointer'
        }}
      >
        Test Dummy Data
      </button>
    </div>
  );

  // Add error boundary for the component
  if (!isVisible || !ballOutcome || typeof ballOutcome !== 'object') {
    console.log('🎮 BallOutcomeGraphics: Not rendering because:', { isVisible, ballOutcome });
    return debugElement;
  }

  useEffect(() => {
    console.log('🎮 BallOutcomeGraphics useEffect triggered:', { isVisible, ballOutcome });
    if (isVisible && ballOutcome) {
      console.log('🎮 Starting ball outcome graphics animation');
      setShowGraphic(true);
      setAnimationPhase('enter');
      
      // Force immediate visibility for testing
      console.log('🎮 Graphics should be visible now');
      
      // Phase timing: enter -> display -> exit
      const enterDuration = 300; // 0.3s enter animation
      const displayDuration = 1500; // 1.5s display time (as requested)
      const exitDuration = 300; // 0.3s exit animation
      
      setTimeout(() => {
        setAnimationPhase('display');
      }, enterDuration);
      
      setTimeout(() => {
        setAnimationPhase('exit');
      }, enterDuration + displayDuration);
      
      setTimeout(() => {
        setShowGraphic(false);
        if (onComplete) {
          onComplete();
        }
      }, enterDuration + displayDuration + exitDuration);
    }
  }, [isVisible, ballOutcome, onComplete]);

  // Always show something for testing
  if (!showGraphic || !ballOutcome) {
    console.log('🎮 Graphics not showing:', { showGraphic, ballOutcome });
    // Return a simple test element to see if component renders at all
    if (isVisible) {
      return (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          background: 'red', 
          color: 'white', 
          padding: '20px', 
          zIndex: 99999,
          fontSize: '24px',
          border: '3px solid yellow'
        }}>
          🎮 TEST GRAPHICS - isVisible: {isVisible ? 'true' : 'false'} - ballOutcome: {JSON.stringify(ballOutcome)}
        </div>
      );
    }
    return null;
  }

  // Determine the outcome text and styling based on ball result
  const getOutcomeDisplay = () => {
    const { runs = 0, isBoundary = false, details = "", type = "" } = ballOutcome;
    
    // If details are provided, use them (for special cases)
    if (details && details.trim() !== "") {
      return {
        text: details,
        type: 'special',
        color: '#FFD700', // Gold for special outcomes
        emoji: '✨'
      };
    }
    
    // Use type from BallOutcome if available
    if (type === 'boundary') {
      if (runs === 6) {
        return {
          text: 'SIX!',
          type: 'six',
          color: '#FF6B6B', // Bright red for six
          emoji: '🚀'
        };
      } else if (runs === 4) {
        return {
          text: 'FOUR!',
          type: 'four', 
          color: '#4ECDC4', // Bright cyan for four
          emoji: '🏏'
        };
      }
    }
    
    // Standard outcomes based on runs and boundary status
    if (isBoundary) {
      if (runs === 6) {
        return {
          text: 'SIX!',
          type: 'six',
          color: '#FF6B6B', // Bright red for six
          emoji: '🚀'
        };
      } else if (runs === 4) {
        return {
          text: 'FOUR!',
          type: 'four', 
          color: '#4ECDC4', // Bright cyan for four
          emoji: '🏏'
        };
      }
    }
    
    // Regular runs
    if (runs === 0) {
      return {
        text: 'DOT BALL',
        type: 'dot',
        color: '#95A5A6', // Gray for dot ball
        emoji: '●'
      };
    } else if (runs === 1) {
      return {
        text: '1 RUN',
        type: 'single',
        color: '#3498DB', // Blue for single
        emoji: '1️⃣'
      };
    } else if (runs === 2) {
      return {
        text: '2 RUNS',
        type: 'double',
        color: '#9B59B6', // Purple for double
        emoji: '2️⃣'
      };
    } else if (runs === 3) {
      return {
        text: '3 RUNS',
        type: 'triple',
        color: '#E67E22', // Orange for triple
        emoji: '3️⃣'
      };
    }
    
    // Fallback for other run values
    return {
      text: `${runs} RUNS`,
      type: 'runs',
      color: '#2ECC71', // Green for other runs
      emoji: '🏃'
    };
  };

  const outcome = getOutcomeDisplay();

  return (
    <>
      {debugElement}
      <div className={`ball-outcome-overlay ${animationPhase}`}>
        <div className={`ball-outcome-container ${outcome.type}`}>
          {/* Debug info */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', fontSize: '12px' }}>
            Debug: {animationPhase} - {outcome.text}
          </div>
        
        {/* Main outcome text */}
        <div 
          className="ball-outcome-text"
          style={{ 
            color: outcome.color,
            textShadow: `0 0 20px ${outcome.color}`,
            fontSize: outcome.type === 'six' || outcome.type === 'four' ? '4rem' : '3rem'
          }}
        >
          {outcome.emoji && (
            <span className="outcome-emoji" role="img" aria-label="outcome">{outcome.emoji}</span>
          )}
          <span className="outcome-text">{outcome.text}</span>
        </div>
        
        {/* Animated effects */}
        <div className="outcome-effects">
          {/* Sparkle effects for boundaries */}
          {(outcome.type === 'six' || outcome.type === 'four') && (
            <>
              <div className="sparkle sparkle-1" role="img" aria-label="sparkle">✨</div>
              <div className="sparkle sparkle-2" role="img" aria-label="star">⭐</div>
              <div className="sparkle sparkle-3" role="img" aria-label="sparkle">✨</div>
              <div className="sparkle sparkle-4" role="img" aria-label="star">⭐</div>
              <div className="sparkle sparkle-5" role="img" aria-label="sparkle">✨</div>
              <div className="sparkle sparkle-6" role="img" aria-label="star">⭐</div>
            </>
          )}
          
          {/* Pulse rings for all outcomes */}
          <div className="pulse-ring ring-1" style={{ borderColor: outcome.color }}></div>
          <div className="pulse-ring ring-2" style={{ borderColor: outcome.color }}></div>
          <div className="pulse-ring ring-3" style={{ borderColor: outcome.color }}></div>
        </div>
        
        {/* Background glow */}
        <div 
          className="outcome-glow"
          style={{ 
            background: `radial-gradient(circle, ${outcome.color}15 0%, transparent 70%)`
          }}
        ></div>
      </div>
    </div>
    </>
  );
};

export default BallOutcomeGraphics;
