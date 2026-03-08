import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Wardrobe from './3D/Wardrobe';
import TechnicalDrawing2D from './2D/TechnicalDrawing2D';

// ─────────────────────────────────────────────────────────────────────────────
// CameraController — musi być wewnątrz <Canvas> żeby mieć dostęp do useThree.
// Przy każdej zmianie wymiarów szafy oraz na żądanie z zewnątrz (cameraResetToken)
// ustawia kamerę tak żeby cała szafa mieściła się w kadrze.
// ─────────────────────────────────────────────────────────────────────────────
const CameraController = ({ width, height, depth, minZoom, maxZoom, cameraResetToken }) => {
  const { camera, gl } = useThree();
  const controlsRef    = useRef();

  const resetToFront = () => {
    const fovRad = (45 * Math.PI) / 180;
    const aspect = gl.domElement.clientWidth / Math.max(gl.domElement.clientHeight, 1);
    // dystans żeby cała szerokość i wysokość szafy mieściła się w kadrze + 25% zapas
    const dW = (width  / 2) / Math.tan(fovRad / 2) / Math.min(aspect, 1);
    const dH = (height / 2) / Math.tan(fovRad / 2);
    const d  = Math.max(dW, dH) * 1.25;

    camera.position.set(d * 0.35, height * 0.55, d);
    camera.lookAt(0, height / 2, 0);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.set(0, height / 2, 0);
      controlsRef.current.update();
    }
  };

  // reset przy zmianie wymiarów szafy
  useEffect(() => {
    resetToFront();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, depth]);

  // reset na żądanie z zewnątrz (np. mobile → zakładka Funkcja)
  useEffect(() => {
    if (cameraResetToken > 0) resetToFront();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraResetToken]);

  return (
    <OrbitControls
      ref={controlsRef}
      minAzimuthAngle={-Math.PI / 2.2}
      maxAzimuthAngle={Math.PI / 2.2}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 1.8}
      minDistance={minZoom}
      maxDistance={maxZoom}
      target={[0, height / 2, 0]}
      enablePan={true}
      panSpeed={0.5}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const WardrobeViewer = ({
  width, height, depth,
  baseModuleHeight,
  interiorColor, exteriorColor,
  blenda, blendaWidth,

  // blendy
  sideBlendaLeft,
  sideBlendaRight,
  topBlenda,
  benchBlendaLeft,
  benchBlendaRight,

  modules,
  isViewOpen,
  activeModuleIndex,
  onModuleClick,
  wallColor = '#F7F5F2',
  onViewChange,
  handleType,
  hoveredModuleIndex,
  setHoveredModuleIndex,
  viewMode,
  onViewModeChange,

  edgeHandleLength,
  barHandleLength,
  drawerHandleLength,
  handleColor,
  handleHeightMm,
  benchDrawerEdgeLength,
  benchDrawerBarLength,

  // nowe: token do resetu kamery (inkrementowany z zewnątrz)
  cameraResetToken = 0,
}) => {
  if (!width || !height || !depth || width <= 0 || height <= 0 || depth <= 0) {
    return (
      <div className="loading-container">
        <div>⚠️ Podaj prawidłowe wymiary szafy</div>
        <small>Szerokość: {width}mm, Wysokość: {height}mm, Głębokość: {depth}mm</small>
      </div>
    );
  }

  const cameraDistance = Math.max(height * 1.2, width * 0.8, 2000);
  const minZoom = cameraDistance * 0.6;
  const maxZoom = cameraDistance * 2.0;

  return (
    <>
      <div className="view-controls">
        <button
          className={`view-button ${viewMode === '3d' ? 'active' : ''}`}
          onClick={() => onViewModeChange('3d')}
          title="Widok 3D z animacjami"
        >
          🎮 3D
        </button>
        <button
          className={`view-button ${viewMode === '2d' ? 'active' : ''}`}
          onClick={() => onViewModeChange('2d')}
          title="Widok techniczny z wymiarami"
        >
          📐 2D
        </button>
        {viewMode === '3d' && (
          <button
            className="view-button"
            onClick={() => onViewChange(!isViewOpen)}
            title={isViewOpen ? 'Pokaż fronty szafy' : 'Pokaż wnętrze szafy'}
          >
            {isViewOpen ? '🚪 Fronty' : '📦 Wnętrze'}
          </button>
        )}
      </div>

      {viewMode === '2d' ? (
        <div
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            height: '100%',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              maxWidth: '800px',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            <TechnicalDrawing2D
              width={width}
              height={height}
              depth={depth}
              modules={modules}
              blenda={blenda}
              blendaWidth={blendaWidth}
              sideBlendaLeft={sideBlendaLeft}
              sideBlendaRight={sideBlendaRight}
              topBlenda={topBlenda}
              activeModuleIndex={activeModuleIndex}
              onModuleClick={onModuleClick}
            />
          </div>
        </div>
      ) : (
        <Canvas
          shadows
          camera={{
            // pozycja startowa — CameraController nadpisze ją przy mount
            position: [cameraDistance * 0.5, height * 0.6, cameraDistance],
            fov: 45,
            far: 25000,
            near: 1
          }}
          dpr={[1, 2]}
          style={{ background: wallColor }}
        >
          <color attach="background" args={[wallColor]} />
          <fog attach="fog" args={[wallColor, cameraDistance + 2000, 20000]} />

          <Suspense fallback={null}>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[30000, 30000]} />
              <meshStandardMaterial
                color="#e8e8e8"
                roughness={0.8}
                metalness={0.1}
                transparent
                opacity={0.7}
              />
            </mesh>

            <ambientLight intensity={0.6} color="#ffffff" />

            <directionalLight
              castShadow
              position={[-8000, 6000, 8000]}
              intensity={1.4}
              color="#fff8f0"
              shadow-mapSize-width={4096}
              shadow-mapSize-height={4096}
              shadow-camera-left={-width * 2}
              shadow-camera-right={width * 2}
              shadow-camera-top={height * 2}
              shadow-camera-bottom={-height * 2}
              shadow-camera-near={2000}
              shadow-camera-far={20000}
              shadow-bias={-0.0001}
            />

            <directionalLight position={[5000, 3000, 5000]} intensity={0.6} color="#f0f8ff" />
            <directionalLight position={[0, 2000, -8000]} intensity={0.3} color="#ffffff" />

            <Environment preset="apartment" background={false} />

            {/* ← zastępuje statyczny <OrbitControls> */}
            <CameraController
              width={width}
              height={height}
              depth={depth}
              minZoom={minZoom}
              maxZoom={maxZoom}
              cameraResetToken={cameraResetToken}
            />

            <group position={[0, 0, -depth / 2 - 20]}>
              <Wardrobe
                width={width}
                height={height}
                depth={depth}
                baseModuleHeight={baseModuleHeight}
                interiorColor={interiorColor}
                exteriorColor={exteriorColor}
                blenda={blenda}
                blendaWidth={blendaWidth}
                sideBlendaLeft={sideBlendaLeft}
                sideBlendaRight={sideBlendaRight}
                topBlenda={topBlenda}
                benchBlendaLeft={benchBlendaLeft}
                benchBlendaRight={benchBlendaRight}
                modules={modules}
                isViewOpen={isViewOpen}
                activeModuleIndex={activeModuleIndex}
                onModuleClick={onModuleClick}
                handleType={handleType}
                hoveredModuleIndex={hoveredModuleIndex}
                setHoveredModuleIndex={setHoveredModuleIndex}
                viewMode={viewMode}
                edgeHandleLength={edgeHandleLength}
                barHandleLength={barHandleLength}
                drawerHandleLength={drawerHandleLength}
                handleColor={handleColor}
                handleHeightMm={handleHeightMm}
                benchDrawerEdgeLength={benchDrawerEdgeLength}
                benchDrawerBarLength={benchDrawerBarLength}
              />
            </group>

            <mesh position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[width * 1.2, depth * 1.2]} />
              <meshStandardMaterial color="#ddd" transparent opacity={0.3} roughness={0.9} />
            </mesh>

            <lineSegments position={[0, 2, -depth / 2 - 20]}>
              <edgesGeometry args={[new THREE.BoxGeometry(width, 10, depth)]} />
              <lineBasicMaterial color="#ccc" transparent opacity={0.5} />
            </lineSegments>
          </Suspense>
        </Canvas>
      )}

      {viewMode === '3d' && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            fontSize: '11px',
            color: 'rgba(0,0,0,0.5)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '5px 8px',
            borderRadius: '4px',
            backdropFilter: 'blur(5px)'
          }}
        >
          💡 Kliknij na moduł • Przeciągnij aby obrócić • Scroll aby przybliżyć
        </div>
      )}
    </>
  );
};

export default WardrobeViewer;