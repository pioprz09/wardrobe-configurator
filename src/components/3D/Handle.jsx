import React, { useMemo } from 'react';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const Handle = ({
  type = 'knob',
  position = [0, 0, 0],
  lengthMm = 800,
  isHovered = false,
  handleColor = 'black'
}) => {
  const t = type === 'long' ? 'bar' : type;

  const { scale } = useSpring({
    scale: isHovered ? 1.03 : 1,
    config: { mass: 1, tension: 300, friction: 40 }
  });

  const mat = useMemo(() => {
    switch (handleColor) {
      case 'silver':
        return { color: '#C8CDD3', metalness: 0.95, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.15 };
      case 'gold_matte':
        return { color: '#C8B89A', metalness: 0.9, roughness: 0.45, clearcoat: 0.25, clearcoatRoughness: 0.35 };
      case 'gold_gloss':
        return { color: '#D6C07A', metalness: 0.95, roughness: 0.18, clearcoat: 0.9, clearcoatRoughness: 0.08 };
      case 'rose':
        return { color: '#D7A6A1', metalness: 0.85, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.12 };
      case 'white':
        return { color: '#F2F2F2', metalness: 0.15, roughness: 0.4, clearcoat: 0.35, clearcoatRoughness: 0.25 };
      case 'black':
      default:
        return { color: '#1f1f1f', metalness: 0.85, roughness: 0.35, clearcoat: 0.4, clearcoatRoughness: 0.2 };
    }
  }, [handleColor]);

  const knobGeo = useMemo(() => new THREE.SphereGeometry(15, 16, 12), []);
  const knobScrewGeo = useMemo(() => new THREE.CylinderGeometry(3, 3, 16, 8), []);

  // EDGE – profil pionowy
  const edgeThickness = 6;
  const edgeDepth = 8;
  const edgeGeo = useMemo(() => new THREE.BoxGeometry(edgeThickness, 1, edgeDepth), []);

  // BAR – „U” jak na zdjęciu: mostek + 2 nogi, stopki dotykają frontu (z=0)
  const r = 8;              // promień pręta
  const standOff = 28;      // odsunięcie mostka w głąb (geometria uchwytu)
  const seg = 18;

  // oś: cylinder domyślnie w osi Y
  const tubeY = useMemo(() => new THREE.CylinderGeometry(r, r, 1, seg), []);
  const legZ = useMemo(() => new THREE.CylinderGeometry(r, r, 1, seg), []); // obrócimy w Z
  const footCap = useMemo(() => new THREE.SphereGeometry(r, seg, 12), []);

  if (t === 'none') return null;

  const L = clamp(Number(lengthMm) || 800, 60, 1200);

  return (
    <animated.group position={position} scale={scale}>
      {t === 'knob' && (
        <>
          <mesh geometry={knobGeo} castShadow receiveShadow>
            <meshStandardMaterial {...mat} />
          </mesh>
          <mesh geometry={knobScrewGeo} position={[0, 0, -8]} castShadow receiveShadow>
            <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}

      {t === 'edge' && (
        <>
          <mesh geometry={edgeGeo} scale={[1, L, 1]} castShadow receiveShadow>
            <meshStandardMaterial {...mat} />
          </mesh>

          <mesh position={[0, L * 0.35, -3]} castShadow receiveShadow>
            <cylinderGeometry args={[2, 2, 6, 8]} />
            <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -L * 0.35, -3]} castShadow receiveShadow>
            <cylinderGeometry args={[2, 2, 6, 8]} />
            <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}

      {t === 'bar' && (
        <group>
          {/* MOSTEK (w głąb), pionowy (oś Y) */}
          <mesh geometry={tubeY} scale={[1, L - 2 * r, 1]} position={[0, 0, standOff]} castShadow receiveShadow>
            <meshStandardMaterial {...mat} />
          </mesh>

          {/* NÓŻKA GÓRNA: w osi Z od frontu (z=0) do mostka (z=standOff) */}
          <mesh
            geometry={legZ}
            rotation={[Math.PI / 2, 0, 0]}          // cylinder oś Y -> oś Z
            scale={[1, standOff, 1]}                 // długość wzdłuż Z
            position={[0, (L / 2) - r, standOff / 2]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial {...mat} />
          </mesh>

          {/* NÓŻKA DOLNA */}
          <mesh
            geometry={legZ}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1, standOff, 1]}
            position={[0, -(L / 2 - r), standOff / 2]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial {...mat} />
          </mesh>

          {/* STOPKI: okrągłe i DOTYKAJĄ FRONTU (z=0) */}
          <mesh geometry={footCap} position={[0, (L / 2) - r, 0]} castShadow receiveShadow>
            <meshStandardMaterial {...mat} />
          </mesh>
          <mesh geometry={footCap} position={[0, -(L / 2 - r), 0]} castShadow receiveShadow>
            <meshStandardMaterial {...mat} />
          </mesh>
        </group>
      )}
    </animated.group>
  );
};

export default Handle;
