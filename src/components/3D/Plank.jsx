import React, { useMemo } from 'react';
import * as THREE from 'three';

const Plank = ({ position = [0, 0, 0], args = [100, 18, 600], materialProps = {}, ...rest }) => {
  // Memoizuj geometrię dla wydajności
  const geometry = useMemo(() => new THREE.BoxGeometry(...args), [JSON.stringify(args)]);
  
  // Ulepszone właściwości materiału z lepszym renderowaniem
  const enhancedMaterialProps = useMemo(() => ({
    transparent: false,
    opacity: 1,
    depthWrite: true,
    depthTest: true,
    roughness: 0.8,
    metalness: 0.1,
    ...materialProps,
  }), [materialProps]);
  
  return (
    <group position={position}>
      <mesh geometry={geometry} castShadow receiveShadow {...rest}>
        <meshStandardMaterial {...enhancedMaterialProps} />
      </mesh>
    </group>
  );
};

export default Plank;
