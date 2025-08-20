// Camera view configurations
export const CAMERA_VIEWS = {
  UMPIRE: {
    key: '1',
    name: 'Umpire View',
    position: [0, 2, 15],
    target: [0, 1, 0],
    fov: 75 // Wider FOV for zoomed out view
  },
  TOP: {
    key: '2',
    name: 'Top View',
    position: [0, 70, 0], // Adjusted for 60m stadium (was 80 for 65m)
    target: [0, 0, 0],
    fov: 80 // Adjusted FOV for 60m stadium
  },
  BIRD_EYE: {
    key: '3',
    name: 'Bird Eye View',
    position: [45, 45, 45], // Moved closer for 60m stadium (was 50,50,50)
    target: [0, 0, 0],
    fov: 85 // Adjusted FOV for smaller stadium
  },
  LEFT: {
    key: '4',
    name: 'Left View',
    position: [-40, 18, 0], // Moved closer from boundary (was -45)
    target: [0, 1, 0],
    fov: 75 // Adjusted FOV for closer stadium
  },
  RIGHT: {
    key: '5',
    name: 'Right View',
    position: [40, 18, 0], // Moved closer from boundary (was 45)
    target: [0, 1, 0],
    fov: 75 // Adjusted FOV for closer stadium
  },
  CENTER: {
    key: '6',
    name: 'Center View',
    position: [0, 22, 35], // Closer for 60m stadium (was 25,40)
    target: [0, 0, 0],
    fov: 75 // Adjusted FOV for smaller stadium
  }
};

// Stadium dimensions and positions
export const STADIUM_CONFIG = {
  field: {
    radius: 50, // ✅ CORRECTED: Green playing field - back to 50m radius to match boundary
    height: 0.1
  },
  boundaries: {
    innerRadius: 50, // ✅ CORRECTED: Inner advertising boundary - back to 50m
    outerRadius: 60, // ✅ CORRECTED: Outer boundary wall - back to 60m  
    playingRadius: 50 // ✅ CORRECTED: Actual playing boundary for simulation - 50m
  },
  pitch: {
    width: 3,
    length: 22,
    height: 0.15
  },
  lights: {
    height: 30, // Adjusted height for 60m stadium
    positions: [
      [20, 30, 20], // Adjusted positions for 60m stadium coverage
      [-20, 30, 20],
      [20, 30, -20],
      [-20, 30, -20]
    ]
  }
};

// Material colors
export const COLORS = {
  grass: '#2D5A2D',      // Darker, more realistic grass green
  pitch: '#C4A57B',      // Clay/sand color for pitch
  boundary: {
    main: '#1a237e',     // Dark blue for main board
    support: '#9fa8da',  // Lighter blue for supports
    wall: '#e0e0e0'      // Light gray for outer wall
  },
  stadium: {
    seats: '#4a90e2',    // Stadium blue
    support: '#808080',  // Support structure gray
    divider: '#a0a0a0'   // Section divider gray
  },
  lights: '#FFF8DC'       // Warm white for floodlights
};