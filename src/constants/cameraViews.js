// Camera view configurations
export const CAMERA_VIEWS = {
  UMPIRE: {
    key: '1',
    name: 'Umpire View',
    position: [0, 2, 15],
    target: [0, 1, 0],
    fov: 75
  },
  TOP: {
    key: '2',
    name: 'Top View',
    position: [0, 50, 0],
    target: [0, 0, 0],
    fov: 60
  },
  BIRD_EYE: {
    key: '3',
    name: 'Bird Eye View',
    position: [30, 40, 30],
    target: [0, 0, 0],
    fov: 70
  },
  LEFT: {
    key: '4',
    name: 'Left View',
    position: [-25, 10, 0],
    target: [0, 1, 0],
    fov: 75
  },
  RIGHT: {
    key: '5',
    name: 'Right View',
    position: [25, 10, 0],
    target: [0, 1, 0],
    fov: 75
  },
  CENTER: {
    key: '6',
    name: 'Center View',
    position: [0, 15, 25],
    target: [0, 0, 0],
    fov: 70
  }
};

// Stadium dimensions and positions
export const STADIUM_CONFIG = {
  field: {
    radius: 20,
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
  boundary: '#FFFFFF',    // Keep white boundary
  stadium: '#A9A9A9',     // Concrete gray
  lights: '#FFF8DC'       // Warm white for floodlights
};