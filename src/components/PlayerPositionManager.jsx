import React, { useState, useEffect, useCallback } from 'react';
import { getAllPlayersArray } from '../constants/playerPositions';
import {
  createInitialPositions,
  movePlayer,
  resetPlayerPosition,
  resetAllPositions,
  savePositionsToStorage,
  loadPositionsFromStorage,
  getPlayerPosition
} from '../utils/functionalPositionManager';

const PlayerPositionManager = ({ 
  isVisible = false, 
  onPositionsChange, 
  onClose,
  initialPositions = null 
}) => {
  // Functional state management instead of class instance
  const [positions, setPositions] = useState(() => {
    return initialPositions || createInitialPositions();
  });
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [players, setPlayers] = useState([]);
  const [currentPosition, setCurrentPosition] = useState([0, 0, 0]);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Initialize players list - run only once on mount
  useEffect(() => {
    const allPlayers = getAllPlayersArray();
    setPlayers(allPlayers);
    
    // Set initial player only on first mount
    if (allPlayers.length > 0) {
      setSelectedPlayerId(prev => prev || allPlayers[0].id);
    }
  }, []); // Empty dependency array - run only on mount

  // Separate effect for initial positions to handle updates properly
  useEffect(() => {
    if (initialPositions) {
      console.log('🔧 Loading initial positions:', initialPositions);
      setPositions(initialPositions);
    }
  }, [initialPositions]);

  // Update current position when selected player changes
  useEffect(() => {
    if (selectedPlayerId && positions) {
      const position = getPlayerPosition(positions, selectedPlayerId);
      if (position) {
        console.log('🔧 Updated current position for', selectedPlayerId, ':', position);
        setCurrentPosition(position);
      }
    }
  }, [selectedPlayerId, positions]);

  // Handle player selection from dropdown
  const handlePlayerSelect = useCallback((playerId) => {
    // Stop editing current player if active
    if (isEditing) {
      setIsEditing(false);
    }
    setSelectedPlayerId(playerId);
    // Don't auto-start editing - user must click "Start Editing"
  }, [isEditing]);

  // Handle arrow key movement - Functional approach
  const handleMove = useCallback((direction) => {
    if (!selectedPlayerId) {
      console.warn('⚠️ No player selected for movement');
      return;
    }

    console.log('🔧 Moving player:', selectedPlayerId, 'direction:', direction);
    
    const result = movePlayer(positions, selectedPlayerId, direction);
    
    if (result.newPosition) {
      console.log('✅ Player moved successfully to:', result.newPosition);
      setCurrentPosition(result.newPosition);
      setPositions(result.positions);
      
      // Notify parent component of position changes
      if (onPositionsChange) {
        onPositionsChange(result.positions);
      }
    } else {
      console.error('❌ Failed to move player:', selectedPlayerId, 'direction:', direction);
    }
  }, [selectedPlayerId, positions, onPositionsChange]);

  // Handle keyboard events for arrow key navigation
  useEffect(() => {
    if (!isVisible || !isEditing) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          event.stopPropagation(); // Prevent event from reaching cricket game
          handleMove('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          event.stopPropagation(); // Prevent event from reaching cricket game
          handleMove('right');
          break;
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation(); // Prevent event from reaching cricket game
          handleMove('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation(); // Prevent event from reaching cricket game
          handleMove('down');
          break;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          setIsEditing(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isEditing, handleMove]);

  // Handle save positions - Functional approach
  const handleSave = useCallback(() => {
    const success = savePositionsToStorage(positions);
    if (success) {
      setSaveMessage('Positions saved successfully!');
      
      // Notify parent component
      if (onPositionsChange) {
        onPositionsChange(positions);
      }
      
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('Error saving positions!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }, [positions, onPositionsChange]);

  // Handle reset single player - Functional approach
  const handleResetPlayer = useCallback(() => {
    if (!selectedPlayerId) {
      console.warn('⚠️ No player selected for reset');
      return;
    }
    
    const updatedPositions = resetPlayerPosition(positions, selectedPlayerId);
    const position = getPlayerPosition(updatedPositions, selectedPlayerId);
    
    if (position) {
      setCurrentPosition(position);
      setPositions(updatedPositions);
      
      if (onPositionsChange) {
        onPositionsChange(updatedPositions);
      }
      
      setSaveMessage(`${selectedPlayerId} position reset!`);
      setTimeout(() => setSaveMessage(''), 2000);
    }
  }, [selectedPlayerId, positions, onPositionsChange]);

  // Handle reset all positions - Functional approach
  const handleResetAll = useCallback(() => {
    const resetPositions = resetAllPositions();
    setPositions(resetPositions);
    
    // Update current position display
    if (selectedPlayerId) {
      const position = getPlayerPosition(resetPositions, selectedPlayerId);
      if (position) {
        setCurrentPosition(position);
      }
    }
    
    if (onPositionsChange) {
      onPositionsChange(resetPositions);
    }
  }, [selectedPlayerId, onPositionsChange]);

  // Handle load positions - Functional approach
  const handleLoad = useCallback(() => {
    const loadedPositions = loadPositionsFromStorage();
    
    if (loadedPositions) {
      setPositions(loadedPositions);
      setSaveMessage('Positions loaded successfully!');
      
      // Update current position display
      if (selectedPlayerId) {
        const position = getPlayerPosition(loadedPositions, selectedPlayerId);
        if (position) {
          setCurrentPosition(position);
        }
      }
      
      if (onPositionsChange) {
        onPositionsChange(loadedPositions);
      }
      
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('No saved positions found!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }, [selectedPlayerId, onPositionsChange]);

  if (!isVisible) return null;

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '320px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid #4CAF50',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #444',
        paddingBottom: '10px'
      }}>
        <h3 style={{ margin: 0, color: '#4CAF50' }}>Player Position Editor</h3>
        <button
          onClick={onClose}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>

      {/* Player Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Select Player:
        </label>
        <select
          value={selectedPlayerId || ''}
          onChange={(e) => {
            if (e.target.value) {
              handlePlayerSelect(e.target.value);
            }
          }}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="" disabled>Select a player...</option>
          {players.map(player => (
            <option key={player.id} value={player.id}>
              {player.name} ({player.role})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Player Info */}
      {selectedPlayer && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#2a2a2a',
          borderRadius: '6px',
          border: '1px solid #555'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#4CAF50' }}>
            {selectedPlayer.name}
          </h4>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#ccc' }}>
            {selectedPlayer.description}
          </p>
          <p style={{ margin: 0, fontSize: '12px' }}>
            Position: [{currentPosition[0].toFixed(1)}, {currentPosition[1].toFixed(1)}, {currentPosition[2].toFixed(1)}]
          </p>
        </div>
      )}

      {/* Movement Controls */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
          Movement Controls:
        </label>
        
        {/* Arrow Key Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <div></div>
          <button
            onClick={() => handleMove('up')}
            style={buttonStyle}
            disabled={!isEditing}
          >
            ↑ Up
          </button>
          <div></div>
          
          <button
            onClick={() => handleMove('left')}
            style={buttonStyle}
            disabled={!isEditing}
          >
            ← Left
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#888'
          }}>
            {isEditing ? 'Editing' : 'Paused'}
          </div>
          <button
            onClick={() => handleMove('right')}
            style={buttonStyle}
            disabled={!isEditing}
          >
            Right →
          </button>
          
          <div></div>
          <button
            onClick={() => handleMove('down')}
            style={buttonStyle}
            disabled={!isEditing}
          >
            ↓ Down
          </button>
          <div></div>
        </div>

        {/* Edit Mode Toggle */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            ...buttonStyle,
            width: '100%',
            backgroundColor: isEditing ? '#f44336' : '#4CAF50',
            marginBottom: '8px'
          }}
        >
          {isEditing ? 'Stop Editing' : 'Start Editing'}
        </button>

        <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>
          {isEditing ? 'Use arrow keys or buttons to move' : 'Click "Start Editing" to enable movement'}
        </div>
      </div>

      {/* Player-specific Actions */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleResetPlayer}
          style={{
            ...buttonStyle,
            width: '100%',
            backgroundColor: '#ff9800',
            marginBottom: '8px'
          }}
        >
          Reset This Player
        </button>
      </div>

      {/* Global Actions */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <button
            onClick={handleSave}
            style={{
              ...buttonStyle,
              backgroundColor: '#4CAF50'
            }}
          >
            Save All
          </button>
          <button
            onClick={handleLoad}
            style={{
              ...buttonStyle,
              backgroundColor: '#2196F3'
            }}
          >
            Load Saved
          </button>
        </div>
        
        <button
          onClick={handleResetAll}
          style={{
            ...buttonStyle,
            width: '100%',
            backgroundColor: '#f44336'
          }}
        >
          Reset All Players
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        fontSize: '11px',
        color: '#888',
        borderTop: '1px solid #444',
        paddingTop: '12px',
        lineHeight: '1.4'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Instructions:</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: '16px' }}>
          <li>Select player from dropdown</li>
          <li>Click "Start Editing" to enable movement</li>
          <li>Use arrow keys or buttons to move</li>
          <li>Click "Save All" to save positions</li>
          <li>Press ESC to stop editing</li>
        </ul>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: saveMessage.includes('Error') ? '#f44336' : '#4CAF50',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {saveMessage}
        </div>
      )}
    </div>
  );
};

// Button style constant
const buttonStyle = {
  padding: '8px 12px',
  backgroundColor: '#555',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#666'
  },
  ':disabled': {
    backgroundColor: '#333',
    cursor: 'not-allowed',
    opacity: 0.6
  }
};

export default PlayerPositionManager;
