import { useState, useCallback, useEffect } from 'react';
import { CAMERA_VIEWS } from '../constants/cameraViews';

// Pure function to get camera view by key
const getCameraViewByKey = (key) => {
  return Object.values(CAMERA_VIEWS).find(view => view.key === key) || CAMERA_VIEWS.CENTER;
};

// Pure function to handle keyboard event
const handleKeyboardInput = (event, currentView, setCameraView) => {
  const newView = getCameraViewByKey(event.key);
  if (newView && newView !== currentView) {
    setCameraView(newView);
    return true;
  }
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

  // Effect for keyboard handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      handleKeyboardInput(event, currentView, setCameraView);
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentView, setCameraView]);

  return {
    currentView,
    switchToView,
    availableViews: Object.values(CAMERA_VIEWS)
  };
};