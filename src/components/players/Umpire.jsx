import React from 'react';

const Umpire = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Head */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshLambertMaterial color="#FDB5A6" />
      </mesh>
      
      {/* Hat */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.15, 16]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      
      {/* Body - white shirt */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.25, 0.28, 0.8, 16]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Arms - holding position */}
      <mesh position={[-0.3, 1.1, 0.2]} rotation={[-0.3, 0, -0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshLambertMaterial color="#FDB5A6" />
      </mesh>
      <mesh position={[0.3, 1.1, 0.2]} rotation={[-0.3, 0, 0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshLambertMaterial color="#FDB5A6" />
      </mesh>
      
      {/* Legs - black pants */}
      <mesh position={[-0.12, 0.4, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[0.12, 0.4, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      
      {/* Shoes */}
      <mesh position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.2]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[0.12, 0, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.2]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
    </group>
  );
};

export default Umpire;
