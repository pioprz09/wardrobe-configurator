import React from 'react';
import { useSpring, animated } from '@react-spring/three';

const AnimatedDoor = ({ 
  isHovered = false, 
  isOpen = false,
  hinge = 'left', 
  doorWidth = 500, 
  openAngle = -110,
  children 
}) => {
  const openAngleRadians = (openAngle * Math.PI) / 180;
  
  // Ulepszona animacja drzwi z bardziej naturalnym ruchem
  const { rotation, scale, y } = useSpring({
    rotation: (isHovered || isOpen) ? (hinge === 'left' ? openAngleRadians : -openAngleRadians) : 0,
    scale: (isHovered || isOpen) ? 1.002 : 1,
    y: (isHovered || isOpen) ? 2 : 0, // Lekkie uniesienie dla efektu "oderwania"
    config: { 
      mass: 3, 
      tension: 200, 
      friction: 40 
    }
  });

  // Punkt obrotu (zawias)
  const pivotX = hinge === 'left' ? -doorWidth / 2 : doorWidth / 2;

  return (
    <group position-x={pivotX}>
      <animated.group 
        rotation-y={rotation} 
        scale={scale}
        position-y={y}
      >
        <group position-x={-pivotX}>
          {children}
        </group>
      </animated.group>
    </group>
  );
};

export default AnimatedDoor;
