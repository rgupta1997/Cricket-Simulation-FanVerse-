/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import Navigation from './Navigation';

const BoneControl = ({ bone, skeleton }) => {
  const initialTransformRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (bone && !initialTransformRef.current) {
      initialTransformRef.current = {
        rotation: bone.getRotationQuaternion()?.clone() || BABYLON.Quaternion.Identity(),
        position: bone.position.clone(),
        localMatrix: bone.getLocalMatrix().clone(),
        worldMatrix: bone.getWorldMatrix().clone()
      };
      console.log('Stored initial transform for bone:', bone.name, initialTransformRef.current);
    }
  }, [bone]);

  const updateSkeleton = () => {
    if (skeleton) {
      try {
        // Update the bone's local matrix
        bone.computeWorldMatrix(true);
        
        // Update the skeleton
        skeleton._markAsDirty();
        
        // Force update all bones
        skeleton.bones.forEach(b => {
          if (b.getTransformNode()) {
            b.getTransformNode().computeWorldMatrix(true);
          }
        });
        
        // Compute absolute transforms
        skeleton.computeAbsoluteTransforms();
        
        console.log('Skeleton updated successfully');
      } catch (error) {
        console.error('Error updating skeleton:', error);
      }
    }
  };

  const handleChange = (axis, value) => {
    try {
      const numValue = parseFloat(value) || 0;
      console.log(`Changing ${axis} to ${numValue} for bone ${bone.name}`);
      
      const newRotation = { ...rotation, [axis]: numValue };
      setRotation(newRotation);

      // Convert degrees to radians
      const radians = {
        x: BABYLON.Tools.ToRadians(newRotation.x),
        y: BABYLON.Tools.ToRadians(newRotation.y),
        z: BABYLON.Tools.ToRadians(newRotation.z)
      };

      // Create rotation matrix from euler angles
      const rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(
        radians.y,
        radians.x,
        radians.z
      );

      // Convert to quaternion
      const quaternion = BABYLON.Quaternion.FromRotationMatrix(rotationMatrix);

      // Apply rotation
      bone.setRotationQuaternion(quaternion);

      // Update the skeleton
      updateSkeleton();

      console.log('Updated bone rotation:', {
        boneName: bone.name,
        quaternion: quaternion.toString(),
        radians
      });

    } catch (error) {
      console.error('Error updating bone rotation:', error);
    }
  };

  const handleReset = () => {
    try {
      if (!initialTransformRef.current) {
        console.warn('No initial transform stored for reset');
        return;
      }

      console.log('Resetting bone:', bone.name, 'to initial transform:', initialTransformRef.current);

      // Reset rotation to initial state
      if (initialTransformRef.current.rotation) {
        bone.setRotationQuaternion(initialTransformRef.current.rotation.clone());
      }

      // Reset position
      bone.position.copyFrom(initialTransformRef.current.position);

      // Reset matrices
      bone.getLocalMatrix().copyFrom(initialTransformRef.current.localMatrix);
      bone.getWorldMatrix().copyFrom(initialTransformRef.current.worldMatrix);

      // Reset UI state
      setRotation({ x: 0, y: 0, z: 0 });

      // Update skeleton
      updateSkeleton();

      console.log('Reset complete for bone:', bone.name);
    } catch (error) {
      console.error('Error resetting bone:', error);
    }
  };

  return (
    <div style={{
      marginBottom: '10px',
      padding: '10px',
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: '5px'
    }}>
      <div style={{ color: 'white', marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{bone.name}</span>
        <button 
          onClick={handleReset}
          style={{ padding: '2px 5px' }}
        >
          Reset
        </button>
      </div>
      {['x', 'y', 'z'].map(axis => (
        <div key={axis} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <label style={{ 
            color: axis === 'x' ? '#ff4444' : axis === 'y' ? '#44ff44' : '#4444ff', 
            width: '20px', 
            marginRight: '10px',
            fontWeight: 'bold'
          }}>
            {axis.toUpperCase()}:
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={rotation[axis]}
            onChange={(e) => handleChange(axis, e.target.value)}
            style={{ 
              flex: 1,
              background: axis === 'x' ? 'linear-gradient(to right, #800000, #ff4444)' :
                         axis === 'y' ? 'linear-gradient(to right, #008000, #44ff44)' :
                         'linear-gradient(to right, #000080, #4444ff)'
            }}
          />
          <input
            type="number"
            value={rotation[axis]}
            onChange={(e) => handleChange(axis, e.target.value)}
            style={{ 
              width: '60px', 
              marginLeft: '10px',
              backgroundColor: axis === 'x' ? '#ffeeee' : 
                             axis === 'y' ? '#eeffee' : 
                             '#eeeeff'
            }}
          />
        </div>
      ))}
      <div style={{ color: '#aaa', fontSize: '12px', marginTop: '5px' }}>
        Current Position: X: {bone.position.x.toFixed(2)}, Y: {bone.position.y.toFixed(2)}, Z: {bone.position.z.toFixed(2)}
      </div>
    </div>
  );
};

const PlayerAnimation = () => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sceneRef = useRef(null);
  const characterRef = useRef(null);
  const skeletonRef = useRef(null);
  const [modelLoadError, setModelLoadError] = useState(null);
  const [bones, setBones] = useState([]);
  const [selectedBone, setSelectedBone] = useState(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log("Initializing scene...");

    // Create engine
    engineRef.current = new BABYLON.Engine(canvasRef.current, true);
    
    const createScene = () => {
      const scene = new BABYLON.Scene(engineRef.current);
      
      // Camera
      const camera = new BABYLON.ArcRotateCamera(
        'camera',
        0,
        Math.PI / 3,
        10,
        BABYLON.Vector3.Zero(),
        scene
      );
      camera.setTarget(BABYLON.Vector3.Zero());
      camera.attachControl(canvasRef.current, true);
      
      // Lights
      const light = new BABYLON.HemisphericLight(
        'light',
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      light.intensity = 0.7;

      const dirLight = new BABYLON.DirectionalLight(
        'dirLight',
        new BABYLON.Vector3(1, -1, 1),
        scene
      );
      dirLight.intensity = 0.5;
      
      // Ground
      const ground = BABYLON.MeshBuilder.CreateGround('ground', {
        width: 6,
        height: 6
      }, scene);
      
      const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
      groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      ground.material = groundMaterial;

      // Load the player model
      const loadModel = (modelPath) => {
        BABYLON.SceneLoader.ImportMesh(
          '',
          '/',
          modelPath,
          scene,
          (meshes, particleSystems, skeletons) => {
            console.log(`Model ${modelPath} loaded successfully`, { 
              meshCount: meshes.length, 
              skeletonCount: skeletons.length
            });

            if (meshes.length > 0 && skeletons.length > 0) {
              const character = meshes[0];
              const skeleton = skeletons[0];
              
              // Store references
              characterRef.current = character;
              skeletonRef.current = skeleton;

              // Position the model
              character.position = new BABYLON.Vector3(0, 0, 0);
              character.scaling = new BABYLON.Vector3(1, 1, 1);

              // Initialize bones
              if (skeleton.bones) {
                console.log('Setting up bones:', skeleton.bones.length);
                
                // Store initial state of each bone
                skeleton.bones.forEach(bone => {
                  // Store initial transforms
                  bone._initialPosition = bone.position.clone();
                  bone._initialRotation = bone.getRotationQuaternion()?.clone() || BABYLON.Quaternion.Identity();
                  bone._initialLocalMatrix = bone.getLocalMatrix().clone();
                  bone._initialWorldMatrix = bone.getWorldMatrix().clone();
                });

                setBones(skeleton.bones);
              }

              // Enable skeleton viewer
              scene.showBones = true;

              // Add debug layer
              scene.debugLayer.show({
                embedMode: true,
                overlay: true
              });
            }
          },
          (progressEvent) => {
            console.log('Loading progress:', progressEvent);
          },
          (scene, message) => {
            console.error(`Error loading ${modelPath}:`, message);
            if (modelPath === 'player2.glb') {
              console.log('Trying fallback model player.glb');
              loadModel('player.glb');
            } else {
              setModelLoadError(`Failed to load model: ${message}`);
            }
          }
        );
      };

      // Start with player2.glb
      loadModel('player2.glb');

      return scene;
    };

    // Create and store scene
    const scene = createScene();
    sceneRef.current = scene;
    
    // Start render loop
    engineRef.current.runRenderLoop(() => {
      if (sceneRef.current) {
        sceneRef.current.render();
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (engineRef.current) {
        engineRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex' }}>
      {/* Main canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Navigation />
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            outline: 'none',
            touchAction: 'none'
          }}
          tabIndex={0}
        />
      </div>

      {/* Bone controls panel */}
      <div style={{
        width: '300px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '20px',
        overflowY: 'auto',
        display: showControls ? 'block' : 'none'
      }}>
        <div style={{ 
          color: 'white', 
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0 }}>Bone Controls</h3>
          <button onClick={() => setShowControls(false)}>Hide</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <select 
            value={selectedBone || ''} 
            onChange={(e) => {
              console.log('Selected bone:', e.target.value);
              setSelectedBone(e.target.value);
            }}
            style={{ width: '100%', padding: '5px' }}
          >
            <option value="">Select a bone</option>
            {bones.map(bone => (
              <option key={bone.name} value={bone.name}>
                {bone.name}
              </option>
            ))}
          </select>
        </div>

        {selectedBone && (
          <BoneControl
            bone={bones.find(b => b.name === selectedBone)}
            skeleton={skeletonRef.current}
          />
        )}
      </div>

      {/* Toggle button for controls */}
      {!showControls && (
        <button
          style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            zIndex: 1000
          }}
          onClick={() => setShowControls(true)}
        >
          Show Controls
        </button>
      )}

      {/* Error message */}
      {modelLoadError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'red',
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          {modelLoadError}
        </div>
      )}
    </div>
  );
};

export default PlayerAnimation;