import { useState, useCallback, useEffect } from 'react';
import { CAMERA_VIEWS } from '../constants/cameraViews';

// Pure function to get camera view by key
const getCameraViewByKey = (key) => {
  return Object.values(CAMERA_VIEWS).find(view => view.key === key) || CAMERA_VIEWS.CENTER;
};

// Pure function to handle keyboard event - DISABLED for camera hotkeys
const handleKeyboardInput = (event, currentView, setCameraView) => {
  // Camera hotkeys (1-6) are now disabled - use buttons instead
  return false;
};

export const useCameraControls = () => {
  const [currentView, setCurrentView] = useState(CAMERA_VIEWS.CENTER);

  // Pure function wrapped in useCallback for performance
  const setCameraView = useCallback((view) => {
    setCurrentView(view);
  }, []);

  // Pure function for switching to specific view
  const switchToView = useCallback((viewName) => {
    const view = CAMERA_VIEWS[viewName];
    if (view) {
      setCameraView(view);
    }
  }, [setCameraView]);

  // Effect for keyboard handling - DISABLED
  // Camera hotkeys (1-6) have been removed - use visual buttons instead
  useEffect(() => {
    // No keyboard event listeners for camera controls
    // Users should use the camera control buttons in the accordion interface
  }, [currentView, setCameraView]);

  return {
    currentView,
    switchToView,
    availableViews: Object.values(CAMERA_VIEWS)
  };
};