import React, { useState, useEffect } from 'react';
import Batsman from './Batsman';
import Bowler from './Bowler';
import Fielder from './Fielder';
import Umpire from './Umpire';
import WicketKeeper from './WicketKeeper';
import Runner from './Runner';
import Ball from './Ball';

// Initial player positions for both stadium types (field inverted)
const INITIAL_POSITIONS = {
  basic: {
    striker: [0, 0, -9],      // Centered in front of stumps
    nonStriker: [1.5, 0, 9],   // Swapped position
    bowler: [0, 0, 15],        // Moved to other end
    wicketKeeper: [0, 0, -11], // Behind new striker
    umpire: [3.5, 0, -8],      // Point position adjusted
    bowlingUmpire: [0, 0, 11], // Behind bowler
    ball: [0, 0.5, 15],        // At bowler position
    fielders: [
      [10, 0, -5],     // Mid-off (inverted)
      [-10, 0, -5],    // Mid-on (inverted)
      [15, 0, 0],      // Cover (same)
      [-15, 0, 0],     // Mid-wicket (same)
      [8, 0, 10],      // Third man (inverted)
      [-8, 0, 10],     // Fine leg (inverted)
      [12, 0, -8],     // Point (inverted)
      [-12, 0, -8],    // Square leg (inverted)
      [5, 0, 15],      // Long-off (inverted)
      [-5, 0, 15],     // Long-on (inverted)
      [18, 0, 5],      // Deep cover (inverted)
    ]
  },
  custom: {
    striker: [0, 0, -12],      // Centered in front of stumps
    nonStriker: [2, 0, 12],    // Swapped position
    bowler: [0, 0, 18],        // Moved to other end
    wicketKeeper: [0, 0, -14], // Behind new striker
    umpire: [4, 0, -10],       // Point position adjusted
    bowlingUmpire: [0, 0, 14], // Behind bowler
    ball: [0, 0.5, 18],        // At bowler position
    fielders: [
      [25, 0, -15],    // Mid-off (inverted)
      [-25, 0, -15],   // Mid-on (inverted)
      [35, 0, 0],      // Cover (same)
      [-35, 0, 0],     // Mid-wicket (same)
      [20, 0, 25],     // Third man (inverted)
      [-20, 0, 25],    // Fine leg (inverted)
      [30, 0, -20],    // Point (inverted)
      [-30, 0, -20],   // Square leg (inverted)
      [15, 0, 35],     // Long-off (inverted)
      [-15, 0, 35],    // Long-on (inverted)
      [40, 0, 15],     // Deep cover (inverted)
    ]
  }
};

const Players = ({ use3DModel = false }) => {
  console.log("Players component rendering, use3DModel:", use3DModel);
  const [positions, setPositions] = useState(use3DModel ? INITIAL_POSITIONS.custom : INITIAL_POSITIONS.basic);
  
  // Update positions when use3DModel changes
  useEffect(() => {
    console.log("Updating player positions for model type:", use3DModel ? "3D" : "basic");
    setPositions(use3DModel ? INITIAL_POSITIONS.custom : INITIAL_POSITIONS.basic);
  }, [use3DModel]);
  const [selectedPlayer, setSelectedPlayer] = useState('bowler');

  // DISABLED: Event handler disabled to prevent conflicts with CricketGame
  useEffect(() => {
    // Commenting out to prevent conflicts with CricketGame component
    /*
    const handleKeyPress = (event) => {
      console.log('OLD Players: Key pressed:', event.key);
      const moveAmount = 0.5;
      
      switch (event.key) {
        // Arrow keys for movement
        case 'ArrowUp':
          event.preventDefault();
          if (selectedPlayer === 'bowler') {
            setPositions(prev => ({
              ...prev,
              bowler: [prev.bowler[0], prev.bowler[1], prev.bowler[2] - moveAmount]
            }));
          }
          break;
          
        case 'ArrowDown':
          event.preventDefault();
          if (selectedPlayer === 'bowler') {
            setPositions(prev => ({
              ...prev,
              bowler: [prev.bowler[0], prev.bowler[1], prev.bowler[2] + moveAmount]
            }));
          }
          break;
          
        case 'ArrowLeft':
          event.preventDefault();
          if (selectedPlayer === 'striker') {
            setPositions(prev => ({
              ...prev,
              striker: [prev.striker[0] - moveAmount, prev.striker[1], prev.striker[2]]
            }));
          } else if (selectedPlayer === 'nonStriker') {
            setPositions(prev => ({
              ...prev,
              nonStriker: [prev.nonStriker[0] - moveAmount, prev.nonStriker[1], prev.nonStriker[2]]
            }));
          }
          break;
          
        case 'ArrowRight':
          event.preventDefault();
          if (selectedPlayer === 'striker') {
            setPositions(prev => ({
              ...prev,
              striker: [prev.striker[0] + moveAmount, prev.striker[1], prev.striker[2]]
            }));
          } else if (selectedPlayer === 'nonStriker') {
            setPositions(prev => ({
              ...prev,
              nonStriker: [prev.nonStriker[0] + moveAmount, prev.nonStriker[1], prev.nonStriker[2]]
            }));
          }
          break;
          
        // Player selection keys
        case 'b':
        case 'B':
          setSelectedPlayer('bowler');
          console.log('Selected: Bowler (use up/down arrows)');
          break;
          
        case 's':
        case 'S':
          setSelectedPlayer('striker');
          console.log('Selected: Striker (use left/right arrows)');
          break;
          
        case 'n':
        case 'N':
          setSelectedPlayer('nonStriker');
          console.log('Selected: Non-Striker (use left/right arrows)');
          break;
          
        // Reset positions
        case 'r':
        case 'R':
          setPositions(use3DModel ? INITIAL_POSITIONS.custom : INITIAL_POSITIONS.basic);
          console.log('Reset all positions');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    // Display controls info
    console.log('Player Controls:');
    console.log('B - Select Bowler (up/down arrows to move)');
    console.log('S - Select Striker (left/right arrows to move)');
    console.log('N - Select Non-Striker (left/right arrows to move)');
    console.log('R - Reset all positions');
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
    */
   
    // OLD CONTROLS DISABLED - Using CricketGame component controls instead
    console.log('OLD Players controls disabled. Use CricketGame controls:');
    console.log('SPACEBAR - Bowl | D/F/G/H/V - Batting | T - Throw to keeper');
    
    return () => {}; // No cleanup needed since no event listener
  }, [selectedPlayer]);

  return (
    <group>
      {/* Batsmen */}
      <Batsman position={positions.striker} isStrike={true} />
      <Runner position={positions.nonStriker} />
      
      {/* Bowler */}
      <Bowler position={positions.bowler} />
      
      {/* Wicket Keeper */}
      <WicketKeeper position={positions.wicketKeeper} />
      
      {/* Umpires */}
      <Umpire position={positions.umpire} />
      <Umpire position={positions.bowlingUmpire} />
      
      {/* Ball */}
      <Ball position={positions.ball} />
      
      {/* Fielders */}
      {positions.fielders.map((pos, index) => (
        <Fielder 
          key={`fielder-${index}`} 
          position={pos} 
          teamColor="#0000FF"
          use3DModel={use3DModel}
        />
      ))}
      
      {/* Visual indicator for selected player */}
      {selectedPlayer === 'bowler' && (
        <mesh position={[positions.bowler[0], 2.5, positions.bowler[2]]}>
          <coneGeometry args={[0.2, 0.4, 8]} />
          <meshBasicMaterial color="#00FF00" />
        </mesh>
      )}
      {selectedPlayer === 'striker' && (
        <mesh position={[positions.striker[0], 2.5, positions.striker[2]]}>
          <coneGeometry args={[0.2, 0.4, 8]} />
          <meshBasicMaterial color="#00FF00" />
        </mesh>
      )}
      {selectedPlayer === 'nonStriker' && (
        <mesh position={[positions.nonStriker[0], 2.5, positions.nonStriker[2]]}>
          <coneGeometry args={[0.2, 0.4, 8]} />
          <meshBasicMaterial color="#00FF00" />
        </mesh>
      )}
    </group>
  );
};

export default Players;
