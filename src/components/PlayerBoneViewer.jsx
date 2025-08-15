import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Navigation from './Navigation';

// Component to visualize the bone structure
const BoneStructureVisualizer = ({ 
  gltf, 
  showBones, 
  showMesh, 
  animationIndex, 
  selectedBone, 
  boneRotation,
  onBonesFound 
}) => {
  const meshRef = useRef();
  const skeletonHelperRef = useRef();
  const mixerRef = useRef();
  const highlightHelperRef = useRef();
  const originalRotationsRef = useRef({});
  const bonesMapRef = useRef({});
  const bonesDiscoveredRef = useRef(false);
  const { scene } = useThree();
  
  // Effect for discovering bones (runs only when gltf changes)
  useEffect(() => {
    if (!gltf || !gltf.scene || bonesDiscoveredRef.current) return;

    const bones = [];
    const bonesMap = {};
    
    // Find skeleton bones
    gltf.scene.traverse((node) => {
      if (node.isSkinnedMesh && node.skeleton && node.skeleton.bones) {
        node.skeleton.bones.forEach((bone, index) => {
          const boneName = bone.name || `Bone_${index}`;
          bones.push({
            name: boneName,
            bone: bone,
            index: index
          });
          bonesMap[boneName] = bone;
          
          // Store original rotation
          originalRotationsRef.current[boneName] = {
            x: bone.rotation.x,
            y: bone.rotation.y,
            z: bone.rotation.z
          };
        });
      }
    });

    // Store bones reference
    bonesMapRef.current = bonesMap;

    // Pass bones to parent component
    if (onBonesFound && bones.length > 0) {
      onBonesFound(bones);
      bonesDiscoveredRef.current = true;
    }
  }, [gltf, onBonesFound]);

  // Reset bones discovered flag when model changes
  useEffect(() => {
    bonesDiscoveredRef.current = false;
  }, [gltf]);

  // Effect for rendering and visual updates
  useEffect(() => {
    if (!gltf || !gltf.scene) return;

    // Clean up previous helpers
    if (skeletonHelperRef.current) {
      scene.remove(skeletonHelperRef.current);
      skeletonHelperRef.current = null;
    }
    if (highlightHelperRef.current) {
      scene.remove(highlightHelperRef.current);
      highlightHelperRef.current = null;
    }

    // Clone the model
    const clonedScene = gltf.scene.clone();
    
    // Find skeleton and set up animation mixer
    let skinnedMesh = null;
    
    clonedScene.traverse((node) => {
      if (node.isSkinnedMesh) {
        skinnedMesh = node;
        node.castShadow = true;
        node.receiveShadow = true;
        
        // Make material wireframe if mesh is hidden
        if (node.material) {
          node.material = node.material.clone();
          node.material.wireframe = !showMesh;
          node.material.transparent = true;
          node.material.opacity = showMesh ? 1 : 0.3;
        }
      }
    });

    // Set up animation mixer
    if (gltf.animations && gltf.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(clonedScene);
      
      if (animationIndex >= 0 && animationIndex < gltf.animations.length) {
        const action = mixerRef.current.clipAction(gltf.animations[animationIndex]);
        action.play();
      }
    }

    // Create skeleton helper
    if (skinnedMesh && skinnedMesh.skeleton && showBones) {
      const skeletonHelper = new THREE.SkeletonHelper(clonedScene);
      skeletonHelper.material.linewidth = 2;
      skeletonHelper.material.color.setHex(0x00ff00);
      skeletonHelperRef.current = skeletonHelper;
      scene.add(skeletonHelper);
    }

    // Store reference to the mesh
    if (meshRef.current) {
      meshRef.current.clear();
      meshRef.current.add(clonedScene);
    }

    return () => {
      if (skeletonHelperRef.current) {
        scene.remove(skeletonHelperRef.current);
      }
      if (highlightHelperRef.current) {
        scene.remove(highlightHelperRef.current);
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [gltf, showBones, showMesh, animationIndex, scene]);

  // Handle bone highlighting
  useEffect(() => {
    // Remove previous highlight
    if (highlightHelperRef.current) {
      scene.remove(highlightHelperRef.current);
      highlightHelperRef.current = null;
    }

    if (selectedBone && bonesMapRef.current[selectedBone]) {
      const bone = bonesMapRef.current[selectedBone];
      
      // Create a highlight sphere at bone position
      const highlightGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const highlightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        transparent: true, 
        opacity: 0.8 
      });
      const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
      
      // Position the highlight at the bone's world position
      const worldPosition = new THREE.Vector3();
      bone.getWorldPosition(worldPosition);
      highlightMesh.position.copy(worldPosition);
      
      highlightHelperRef.current = highlightMesh;
      scene.add(highlightMesh);
    }
  }, [selectedBone, scene]);

  // Handle bone rotation
  useEffect(() => {
    if (selectedBone && bonesMapRef.current[selectedBone] && boneRotation) {
      const bone = bonesMapRef.current[selectedBone];
      const originalRotation = originalRotationsRef.current[selectedBone];
      
      if (originalRotation) {
        // Apply rotation relative to original rotation
        bone.rotation.x = originalRotation.x + (boneRotation.x * Math.PI / 180);
        bone.rotation.y = originalRotation.y + (boneRotation.y * Math.PI / 180);
        bone.rotation.z = originalRotation.z + (boneRotation.z * Math.PI / 180);
      }
    }
  }, [selectedBone, boneRotation]);

  // Animation loop
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    // Update highlight position if bone is selected
    if (selectedBone && bonesMapRef.current[selectedBone] && highlightHelperRef.current) {
      const bone = bonesMapRef.current[selectedBone];
      const worldPosition = new THREE.Vector3();
      bone.getWorldPosition(worldPosition);
      highlightHelperRef.current.position.copy(worldPosition);
    }
  });

  return <group ref={meshRef} />;
};

// Preload the models to avoid loading issues
useGLTF.preload('/player.glb');
useGLTF.preload('/player2.glb');

// Main component for loading and displaying the player with bone structure
const PlayerWithBones = ({ 
  modelPath, 
  showBones, 
  showMesh, 
  animationIndex, 
  onAnimationsLoaded,
  selectedBone,
  boneRotation,
  onBonesFound
}) => {
  const { nodes, materials, animations, scene } = useGLTF(modelPath);
  
  const gltf = { nodes, materials, animations, scene };

  console.log('Player model loaded:', {
    nodes: Object.keys(nodes),
    materials: Object.keys(materials),
    animations: animations?.length || 0,
    hasScene: !!scene
  });

  // Pass animations to parent component
  useEffect(() => {
    if (animations && onAnimationsLoaded) {
      onAnimationsLoaded(animations);
    }
  }, [animations, onAnimationsLoaded]);

  return (
    <BoneStructureVisualizer 
      gltf={gltf} 
      showBones={showBones}
      showMesh={showMesh}
      animationIndex={animationIndex}
      selectedBone={selectedBone}
      boneRotation={boneRotation}
      onBonesFound={onBonesFound}
    />
  );
};

// Control panel component
const ControlPanel = ({ 
  showBones, 
  setShowBones, 
  showMesh, 
  setShowMesh,
  animationIndex,
  setAnimationIndex,
  animations,
  modelPath,
  setModelPath,
  bones,
  selectedBone,
  setSelectedBone,
  boneRotation,
  setBoneRotation
}) => {
  const modelOptions = [
    { path: '/player.glb', name: 'Player 1' },
    { path: '/player2.glb', name: 'Player 2' }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      color: 'white',
      background: 'rgba(0,0,0,0.8)',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'Arial, sans-serif',
      minWidth: '300px',
      maxWidth: '350px',
      maxHeight: '90vh',
      overflowY: 'auto',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4CAF50' }}>Player Bone Structure Viewer</h3>
      
      {/* Model Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          Select Model:
        </label>
        <select 
          value={modelPath} 
          onChange={(e) => setModelPath(e.target.value)}
          style={{
            width: '100%',
            padding: '5px',
            borderRadius: '3px',
            border: 'none',
            background: '#333',
            color: 'white'
          }}
        >
          {modelOptions.map((option) => (
            <option key={option.path} value={option.path}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* Visibility Controls */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px' }}>
          <input 
            type="checkbox" 
            checked={showBones} 
            onChange={(e) => setShowBones(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Show Bone Structure
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px' }}>
          <input 
            type="checkbox" 
            checked={showMesh} 
            onChange={(e) => setShowMesh(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Show Mesh
        </label>
      </div>

      {/* Animation Controls */}
      {animations && animations.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Animation:
          </label>
          <select 
            value={animationIndex} 
            onChange={(e) => setAnimationIndex(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '5px',
              borderRadius: '3px',
              border: 'none',
              background: '#333',
              color: 'white'
            }}
          >
            <option value={-1}>None</option>
            {animations.map((anim, index) => (
              <option key={index} value={index}>
                {anim.name || `Animation ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bone Selection */}
      {bones && bones.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Select Bone:
          </label>
          <select 
            value={selectedBone || ''} 
            onChange={(e) => setSelectedBone(e.target.value || null)}
            style={{
              width: '100%',
              padding: '5px',
              borderRadius: '3px',
              border: 'none',
              background: '#333',
              color: 'white'
            }}
          >
            <option value="">None</option>
            {bones.map((bone, index) => (
              <option key={index} value={bone.name}>
                {bone.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bone Rotation Controls */}
      {selectedBone && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ff6b6b', fontSize: '14px' }}>
            Bone Rotation: {selectedBone}
          </h4>
          
          {/* X Rotation */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px' }}>
              X Rotation: {boneRotation.x}°
            </label>
            <input 
              type="range"
              min="-360"
              max="360"
              value={boneRotation.x}
              onChange={(e) => setBoneRotation(prev => ({ ...prev, x: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                height: '20px',
                background: '#333',
                outline: 'none',
                borderRadius: '3px'
              }}
            />
          </div>

          {/* Y Rotation */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px' }}>
              Y Rotation: {boneRotation.y}°
            </label>
            <input 
              type="range"
              min="-360"
              max="360"
              value={boneRotation.y}
              onChange={(e) => setBoneRotation(prev => ({ ...prev, y: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                height: '20px',
                background: '#333',
                outline: 'none',
                borderRadius: '3px'
              }}
            />
          </div>

          {/* Z Rotation */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px' }}>
              Z Rotation: {boneRotation.z}°
            </label>
            <input 
              type="range"
              min="-360"
              max="360"
              value={boneRotation.z}
              onChange={(e) => setBoneRotation(prev => ({ ...prev, z: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                height: '20px',
                background: '#333',
                outline: 'none',
                borderRadius: '3px'
              }}
            />
          </div>

          {/* Reset Button */}
          <button 
            onClick={() => setBoneRotation({ x: 0, y: 0, z: 0 })}
            style={{
              width: '100%',
              padding: '5px',
              marginTop: '5px',
              border: 'none',
              borderRadius: '3px',
              background: '#ff6b6b',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Reset Rotation
          </button>
        </div>
      )}

      {/* Instructions */}
      <div style={{ fontSize: '12px', color: '#ccc', marginTop: '15px' }}>
        <p style={{ margin: '0 0 5px 0' }}><strong>Controls:</strong></p>
        <p style={{ margin: '0 0 3px 0' }}>• Left click + drag: Rotate</p>
        <p style={{ margin: '0 0 3px 0' }}>• Right click + drag: Pan</p>
        <p style={{ margin: '0 0 3px 0' }}>• Scroll: Zoom</p>
        <p style={{ margin: '0 0 3px 0', color: '#4CAF50' }}>• Green lines: Bone structure</p>
        <p style={{ margin: '0 0 3px 0', color: '#ff6b6b' }}>• Red sphere: Selected bone</p>
        <p style={{ margin: '0', fontSize: '11px' }}>Use sliders to rotate selected bone</p>
      </div>
    </div>
  );
};

// Main PlayerBoneViewer component
const PlayerBoneViewer = () => {
  const [showBones, setShowBones] = useState(true);
  const [showMesh, setShowMesh] = useState(true);
  const [animationIndex, setAnimationIndex] = useState(-1);
  const [modelPath, setModelPath] = useState('/player2.glb');
  const [animations, setAnimations] = useState([]);
  const [bones, setBones] = useState([]);
  const [selectedBone, setSelectedBone] = useState(null);
  const [boneRotation, setBoneRotation] = useState({ x: 0, y: 0, z: 0 });

  // Handle animations loaded from PlayerWithBones component
  const handleAnimationsLoaded = useCallback((loadedAnimations) => {
    setAnimations(loadedAnimations || []);
    console.log('Available animations:', loadedAnimations?.map(a => a.name) || []);
  }, []);

  // Handle bones discovered from the model
  const handleBonesFound = useCallback((foundBones) => {
    setBones(foundBones || []);
    console.log('Available bones:', foundBones?.map(b => b.name) || []);
  }, []);

  // Reset bone selection only when model path changes
  useEffect(() => {
    setSelectedBone(null);
    setBoneRotation({ x: 0, y: 0, z: 0 });
    setBones([]); // Clear bones when model changes
  }, [modelPath]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      {/* Navigation */}
      <Navigation />
      
      {/* Control Panel */}
      <ControlPanel 
        showBones={showBones}
        setShowBones={setShowBones}
        showMesh={showMesh}
        setShowMesh={setShowMesh}
        animationIndex={animationIndex}
        setAnimationIndex={setAnimationIndex}
        animations={animations}
        modelPath={modelPath}
        setModelPath={setModelPath}
        bones={bones}
        selectedBone={selectedBone}
        setSelectedBone={setSelectedBone}
        boneRotation={boneRotation}
        setBoneRotation={setBoneRotation}
      />

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [3, 2, 3], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#1a1a1a');
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        {/* Lighting setup for good bone visualization */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} />

        {/* Ground plane for reference */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#2d4a16" />
        </mesh>

        {/* Grid helper */}
        <gridHelper args={[10, 20, '#4CAF50', '#2d4a16']} />

        {/* Axis helper */}
        <primitive object={new THREE.AxesHelper(1)} />

        {/* Player model with bone structure */}
        <PlayerWithBones 
          modelPath={modelPath}
          showBones={showBones}
          showMesh={showMesh}
          animationIndex={animationIndex}
          onAnimationsLoaded={handleAnimationsLoaded}
          selectedBone={selectedBone}
          boneRotation={boneRotation}
          onBonesFound={handleBonesFound}
        />

        {/* Camera controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 1, 0]}
          maxDistance={20}
          minDistance={1}
        />

        {/* Performance stats */}
        <Stats />
      </Canvas>
    </div>
  );
};

export default PlayerBoneViewer;
