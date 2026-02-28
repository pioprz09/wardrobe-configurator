import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import Plank from './Plank';

const Drawer = ({ 
  position = [0, 0, 0], 
  width = 500, 
  depth = 500, 
  height = 150, 
  materialProps = {}, 
  isHovered = false,
  isOpen = false
}) => {
  const thickness = 18;
  const frontHeight = height - 10;
  const innerWidth = width - thickness * 2;
  const innerDepth = depth - thickness * 2;
  
  // Ulepszona animacja z bardziej płynnym ruchem i subtelną rotacją
  const { z, rotationY, scale } = useSpring({ 
    z: (isHovered || isOpen) ? depth / 2 : 0,
    rotationY: (isHovered || isOpen) ? Math.sin(Date.now() * 0.001) * 0.01 : 0,
    scale: (isHovered || isOpen) ? 1.002 : 1,
    config: { 
      mass: 2, 
      tension: 280, 
      friction: 60 
    } 
  });

  return (
    <animated.group position-z={z} rotation-y={rotationY} scale={scale}>
      <group position={position}>
        {/* Front szuflady */}
        <Plank 
          position={[0, 0, depth / 2 - thickness / 2]} 
          args={[width, frontHeight, thickness]} 
          materialProps={materialProps} 
        />
        
        {/* Tył szuflady */}
        <Plank 
          position={[0, 0, -depth / 2 + thickness / 2]} 
          args={[width, height - thickness, thickness]} 
          materialProps={materialProps} 
        />
        
        {/* Lewa ścianka */}
        <Plank 
          position={[-width / 2 + thickness / 2, 0, 0]} 
          args={[thickness, height - thickness, innerDepth]} 
          materialProps={materialProps} 
        />
        
        {/* Prawa ścianka */}
        <Plank 
          position={[width / 2 - thickness / 2, 0, 0]} 
          args={[thickness, height - thickness, innerDepth]} 
          materialProps={materialProps} 
        />
        
        {/* Dno szuflady */}
        <Plank 
          position={[0, -(height - thickness) / 2 + thickness / 2, 0]} 
          args={[innerWidth, thickness, innerDepth]} 
          materialProps={materialProps} 
        />
        
        {/* Prowadnice (opcjonalne, dla realizmu) */}
        <Plank 
          position={[-width / 2 - 5, -height / 2 + 10, 0]} 
          args={[10, 5, depth]} 
          materialProps={{ 
            color: '#888', 
            metalness: 0.8, 
            roughness: 0.2 
          }} 
        />
        <Plank 
          position={[width / 2 + 5, -height / 2 + 10, 0]} 
          args={[10, 5, depth]} 
          materialProps={{ 
            color: '#888', 
            metalness: 0.8, 
            roughness: 0.2 
          }} 
        />
      </group>
    </animated.group>
  );
};

export default Drawer;
