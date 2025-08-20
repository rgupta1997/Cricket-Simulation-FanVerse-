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
    position: [0, -0.7, -12],
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
    position: [12, 0, 30], // Moved back to boundary (30m+)
    role: 'fielding',
    description: 'Boundary, straight off side'
  },
  LONG_ON: {
    id: 'long_on',
    name: 'Long On',
    position: [-12, 0, 30], // Moved back to boundary (30m+)
    role: 'fielding',
    description: 'Boundary, straight on side'
  },
  // Additional boundary fielders for larger ground
  DEEP_COVER: {
    id: 'deep_cover',
    name: 'Deep Cover',
    position: [35, 0, 5], // Deep cover position
    role: 'fielding',
    description: 'Deep cover drive boundary'
  },
  DEEP_MID_WICKET: {
    id: 'deep_mid_wicket',
    name: 'Deep Mid Wicket',
    position: [-35, 0, 5], // Deep mid-wicket position
    role: 'fielding',
    description: 'Deep leg side boundary'
  },
  DEEP_POINT: {
    id: 'deep_point',
    name: 'Deep Point',
    position: [30, 0, -15], // Deep point position
    role: 'fielding',
    description: 'Deep square cut boundary'
  },
  DEEP_SQUARE_LEG: {
    id: 'deep_square_leg',
    name: 'Deep Square Leg',
    position: [-30, 0, -15], // Deep square leg position
    role: 'fielding',
    description: 'Deep square leg boundary'
  },
  THIRD_MAN_DEEP: {
    id: 'third_man_deep',
    name: 'Deep Third Man',
    position: [25, 0, 20], // Deep third man boundary
    role: 'fielding',
    description: 'Deep third man boundary'
  },
  FINE_LEG_DEEP: {
    id: 'fine_leg_deep',
    name: 'Deep Fine Leg',
    position: [-25, 0, 20], // Deep fine leg boundary
    role: 'fielding',
    description: 'Deep fine leg boundary'
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

// Position constraints (field boundaries) - Updated for larger 50m playing area
export const FIELD_CONSTRAINTS = {
  MIN_X: -50, // Extended to 50m for larger ground
  MAX_X: 50,  // Extended to 50m for larger ground
  MIN_Z: -25, // Extended backward range
  MAX_Z: 35,  // Extended forward range
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
