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
    position: [0, 45, 0],
    target: [0, 0, 0],
    fov: 70 // Wider FOV for zoomed out view
  },
  BIRD_EYE: {
    key: '3',
    name: 'Bird Eye View',
    position: [30, 35, 30],
    target: [0, 0, 0],
    fov: 80 // Wider FOV for full stadium view
  },
  LEFT: {
    key: '4',
    name: 'Left View',
    position: [-25, 12, 0],
    target: [0, 1, 0],
    fov: 75 // Wider FOV for zoomed out view
  },
  RIGHT: {
    key: '5',
    name: 'Right View',
    position: [25, 12, 0],
    target: [0, 1, 0],
    fov: 75 // Wider FOV for zoomed out view
  },
  CENTER: {
    key: '6',
    name: 'Center View',
    position: [0, 15, 25],
    target: [0, 0, 0],
    fov: 75 // Wider FOV for zoomed out view
  }
};

// Stadium dimensions and positions
export const STADIUM_CONFIG = {
  field: {
    radius: 30, // Increased from 20 to 30 for larger ground area
    height: 0.1
  },
  pitch: {
    width: 3,
    length: 22,
    height: 0.15
  },
  lights: {
    height: 25,
    positions: [
      [15, 25, 15],
      [-15, 25, 15],
      [15, 25, -15],
      [-15, 25, -15]
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