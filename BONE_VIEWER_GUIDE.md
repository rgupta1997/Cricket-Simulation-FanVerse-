# Player Bone Structure Viewer

## Overview
The Player Bone Structure Viewer is a specialized endpoint that allows you to visualize and analyze the skeletal structure of GLB player models used in the cricket simulation.

## Access
Navigate to `/bones` endpoint in your browser when the development server is running.

Example: `http://localhost:5173/bones`

## Features

### Model Visualization
- **Bone Structure Display**: Green wireframe showing the complete skeletal hierarchy
- **Mesh Visibility Toggle**: Show/hide the 3D mesh while keeping bones visible
- **Model Selection**: Switch between `player.glb` and `player2.glb` models
- **Real-time Rendering**: Interactive 3D environment with camera controls

### Animation System
- **Animation Playback**: Play available animations from the GLB file
- **Animation Selection**: Dropdown to choose specific animations
- **Real-time Bone Movement**: Watch how bones move during animations

### Interactive Controls
- **Camera Controls**:
  - Left click + drag: Rotate view
  - Right click + drag: Pan
  - Mouse wheel: Zoom in/out
- **Visual Toggles**:
  - Bone structure visibility
  - Mesh visibility
  - Animation playback
- **Bone Manipulation**:
  - Bone selection dropdown
  - Individual bone highlighting (red sphere)
  - X, Y, Z rotation sliders (-360° to +360°)
  - Real-time bone rotation
  - Reset rotation button

### Visual Aids
- **Grid Helper**: Reference grid for spatial orientation
- **Axis Helper**: XYZ coordinate system
- **Ground Plane**: Reference ground for model positioning
- **Performance Stats**: FPS and rendering performance metrics

## Technical Implementation

### Core Components
- `PlayerBoneViewer.jsx`: Main component managing the viewer
- `BoneStructureVisualizer`: Handles bone rendering and animation
- `ControlPanel`: UI controls for toggling features
- `Navigation`: Route navigation between different views

### Three.js Features Used
- `SkeletonHelper`: Visualizes bone hierarchy
- `AnimationMixer`: Handles GLB animations
- `useGLTF`: Efficient GLB model loading
- Custom lighting setup optimized for bone visualization

### Routing
The bone viewer is accessible via the `/bones` route, integrated with the existing React Router setup.

## Development Notes

### Model Requirements
- Models must be in GLB format
- Skeletal animation data should be embedded in the GLB file
- Models should be placed in the `/public` directory

### Performance Considerations
- Uses efficient THREE.js rendering
- Implements proper cleanup for skeleton helpers
- Optimized lighting for bone structure visibility

### Browser Compatibility
- Requires WebGL support
- Tested with modern browsers (Chrome, Firefox, Safari, Edge)

## Navigation
Use the navigation panel in the top-right corner to switch between:
- **Cricket Game**: Main simulation
- **Player Test**: Basic model testing
- **Bone Viewer**: Skeletal structure analysis

## Troubleshooting

### Model Not Loading
- Check that GLB files exist in `/public` directory
- Verify model file permissions
- Check browser console for loading errors

### Bones Not Visible
- Ensure the model has skeletal data
- Toggle "Show Bone Structure" checkbox
- Try different models from the dropdown

### Animation Issues
- Verify animations are embedded in GLB file
- Check animation names in browser console
- Ensure proper GLB export settings from modeling software

### Bone Manipulation Issues
- If bones don't appear in dropdown, check model has proper skeleton
- If selected bone doesn't highlight, ensure bone structure is visible
- If rotation doesn't work, try resetting rotation and selecting bone again
- Red highlight sphere follows the bone's world position in real-time
