// Cricket Player Position Constants
// Coordinate system: [x, y, z] where x=left/right, y=height, z=forward/backward
// Positive Z = towards bowler end, Negative Z = towards keeper end

// Core Player Positions
export const CORE_PLAYER_POSITIONS = {
  STRIKER: {
    id: 'striker',
    name: 'Striker (Batsman)',
    position: [0, 0, -9],
    role: 'batting',
    description: 'Batsman on strike'
  },
  NON_STRIKER: {
    id: 'non_striker', 
    name: 'Non-Striker (Batsman)',
    position: [0, 0, 9],
    role: 'batting',
    description: 'Batsman at bowler end'
  },
  BOWLER: {
    id: 'bowler',
    name: 'Bowler',
    position: [0, 0, 15],
    role: 'bowling',
    description: 'Fast/Spin bowler'
  },
  WICKET_KEEPER: {
    id: 'wicket_keeper',
    name: 'Wicket Keeper',
    position: [0, 0, -11],
    role: 'fielding',
    description: 'Behind the stumps'
  }
};

// Fielder Positions (Traditional field setup)
export const FIELDER_POSITIONS = {
  MID_OFF: {
    id: 'mid_off',
    name: 'Mid Off',
    position: [10, 0, -5],
    role: 'fielding',
    description: 'Straight drive coverage'
  },
  MID_ON: {
    id: 'mid_on',
    name: 'Mid On', 
    position: [-10, 0, -5],
    role: 'fielding',
    description: 'On side straight drive coverage'
  },
  COVER: {
    id: 'cover',
    name: 'Cover',
    position: [15, 0, 0],
    role: 'fielding',
    description: 'Cover drive region'
  },
  MID_WICKET: {
    id: 'mid_wicket',
    name: 'Mid Wicket',
    position: [-15, 0, 0],
    role: 'fielding', 
    description: 'Leg side coverage'
  },
  THIRD_MAN: {
    id: 'third_man',
    name: 'Third Man',
    position: [8, 0, 10],
    role: 'fielding',
    description: 'Behind keeper, off side'
  },
  FINE_LEG: {
    id: 'fine_leg',
    name: 'Fine Leg',
    position: [-8, 0, 10],
    role: 'fielding',
    description: 'Behind keeper, leg side'
  },
  POINT: {
    id: 'point',
    name: 'Point',
    position: [12, 0, -8],
    role: 'fielding',
    description: 'Square cut coverage'
  },
  SQUARE_LEG: {
    id: 'square_leg',
    name: 'Square Leg',
    position: [-12, 0, -8],
    role: 'fielding',
    description: 'Square leg region'
  },
  LONG_OFF: {
    id: 'long_off',
    name: 'Long Off',
    position: [5, 0, 15],
    role: 'fielding',
    description: 'Boundary, straight off side'
  },
  LONG_ON: {
    id: 'long_on',
    name: 'Long On',
    position: [-5, 0, 15],
    role: 'fielding',
    description: 'Boundary, straight on side'
  }
};

// Umpire Positions
export const UMPIRE_POSITIONS = {
  BOWLERS_END: {
    id: 'umpire_bowlers_end',
    name: 'Umpire (Bowlers End)',
    position: [0, 0, 11],
    role: 'officiating',
    description: 'Behind bowlers wicket'
  },
  SQUARE_LEG_UMPIRE: {
    id: 'umpire_square_leg', 
    name: 'Umpire (Square Leg)',
    position: [12, 0, -8],
    role: 'officiating',
    description: 'Square leg position'
  }
};

// Helper function to create positions object with id as key
const createPositionsById = (positionsObject) => {
  const result = {};
  Object.values(positionsObject).forEach(player => {
    result[player.id] = player;
  });
  return result;
};

// Combined all player positions with proper id-based keys
export const ALL_PLAYER_POSITIONS = {
  ...createPositionsById(CORE_PLAYER_POSITIONS),
  ...createPositionsById(FIELDER_POSITIONS),
  ...createPositionsById(UMPIRE_POSITIONS)
};

// Helper function to get all player positions as array
export const getAllPlayersArray = () => {
  return Object.values(ALL_PLAYER_POSITIONS);
};

// Helper function to get players by role
export const getPlayersByRole = (role) => {
  return Object.values(ALL_PLAYER_POSITIONS).filter(player => player.role === role);
};

// Helper function to get fielders only (excluding core players and umpires)
export const getFieldersArray = () => {
  return Object.values(FIELDER_POSITIONS);
};

// Position constraints (field boundaries)
export const FIELD_CONSTRAINTS = {
  MIN_X: -30,
  MAX_X: 30,
  MIN_Z: -15,
  MAX_Z: 20,
  Y: 0 // Keep all players on ground level
};

// Movement step size for arrow key controls
export const MOVEMENT_STEP = 1;

export default {
  CORE_PLAYER_POSITIONS,
  FIELDER_POSITIONS, 
  UMPIRE_POSITIONS,
  ALL_PLAYER_POSITIONS,
  getAllPlayersArray,
  getPlayersByRole,
  getFieldersArray,
  FIELD_CONSTRAINTS,
  MOVEMENT_STEP
};
