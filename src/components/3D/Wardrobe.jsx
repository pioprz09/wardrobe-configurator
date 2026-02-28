import React, { useMemo } from 'react';
import * as THREE from 'three';
import Plank from './Plank';
import Drawer from './Drawer';
import Handle from './Handle';
import AnimatedDoor from './AnimatedDoor';
import { WARDROBE_CONSTANTS } from '../../data/constants';
import { getBlendThicknessMm, getSideBlendDepthMm, getTopBlendDepthMm } from '../../utils/blendaUtils';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const Wardrobe = ({
  width = 2200,
  height = 2400,
  depth = 600,
  interiorColor = '#F8F8FF',
  exteriorColor = '#D2B48C',

  // legacy (zostawiamy dla kompatybilności)
  blenda = 'none',
  blendaWidth = 18,

  // ✅ nowe blendy
  sideBlendaLeft = undefined,
  sideBlendaRight = undefined,
  topBlenda = undefined,

  modules = [],
  isViewOpen = false,
  activeModuleIndex = 0,
  onModuleClick = () => {},
  handleType = 'none',
  hoveredModuleIndex = null,
  setHoveredModuleIndex = () => {},
  viewMode = '3d',
  baseModuleHeight = 2000,

  edgeHandleLength = 800,
  barHandleLength = 800,

  handleColor = 'black'
}) => {
  const {
    THICKNESS,
    PLINTH_HEIGHT,
    FRONT_GAP,
    FRONT_DOOR_GAP,
    DRAWER_SIDE_GAP,
    RAIL_OFFSET_FROM_TOP,
    DOUBLE_DOOR_THRESHOLD
  } = WARDROBE_CONSTANTS;

  const CORPUS_DEPTH = depth - THICKNESS - FRONT_GAP;

  const interiorMaterialProps = useMemo(
    () => ({
      color: interiorColor,
      side: THREE.FrontSide,
      transparent: false,
      opacity: 1,
      roughness: 0.9,
      metalness: 0.1
    }),
    [interiorColor]
  );

  const exteriorMaterialProps = useMemo(
    () => ({
      color: exteriorColor,
      side: THREE.FrontSide,
      transparent: false,
      opacity: 1,
      roughness: 0.7,
      metalness: 0.1
    }),
    [exteriorColor]
  );

  // ======== BLENDY ========
  // fallback na legacy blenda/blendaWidth (gdy nowe niepodane)
  const resolveLegacySide = (side) => {
    if (blenda === 'both') return `full-${blendaWidth}`;
    if (blenda === side) return `full-${blendaWidth}`;
    return 'none';
  };

  const leftValue = sideBlendaLeft ?? resolveLegacySide('left');
  const rightValue = sideBlendaRight ?? resolveLegacySide('right');
  const topValue = topBlenda ?? 'none';

  const leftThickness = getBlendThicknessMm(leftValue);
  const rightThickness = getBlendThicknessMm(rightValue);
  const topThickness = getBlendThicknessMm(topValue);

  const leftDepth = getSideBlendDepthMm(leftValue, depth);
  const rightDepth = getSideBlendDepthMm(rightValue, depth);
  const topDepth = getTopBlendDepthMm(topValue, depth);

  // front jest po stronie +Z
  const zFromFront = (panelDepth) => depth / 2 - panelDepth / 2;

  ///topic: kluczowe: gabaryt zewnętrzny stały, korpus mniejszy
  const carcassWidth = width - leftThickness - rightThickness;
  const carcassHeight = height - topThickness;

  // przesunięcie korpusu w dół (odejmujemy z góry, dół zostaje)
  const carcassYOffset = -topThickness / 2;

  const carcassStartX = -width / 2 + leftThickness;

  const totalInternalWidth = modules.reduce((sum, m) => sum + m.width, 0);
  const hasNadstawka = carcassHeight > baseModuleHeight;

  // ======== Uchwyty (Twoje wymagania) ========
  const EDGE_TOP_MM = 1200;
  const BAR_TOP_MM = 1250;

  const edgeLen = clamp(Number(edgeHandleLength) || 800, 60, 1200);
  const barLen = clamp(Number(barHandleLength) || 800, 60, 1200);

  const INSET_TOWARD_HINGE_MM = 30;

  const handleCenterYFromTop = (topMm, lengthMm) => {
    const topYWorld = topMm - carcassHeight / 2;
    return topYWorld - lengthMm / 2;
  };

  const getHandleY = () => {
    if (handleType === 'edge') return handleCenterYFromTop(EDGE_TOP_MM, edgeLen);
    if (handleType === 'bar') return handleCenterYFromTop(BAR_TOP_MM, barLen);
    return 1000 - carcassHeight / 2;
  };

  const getHandleLength = () => {
    if (handleType === 'edge') return edgeLen;
    if (handleType === 'bar') return barLen;
    return 200;
  };

  const handleXOnFreeEdge = (hingeSide, doorLeafWidth) =>
    hingeSide === 'left' ? doorLeafWidth / 2 : -(doorLeafWidth / 2);

  const insetTowardHinge = (hingeSide) =>
    hingeSide === 'left' ? -INSET_TOWARD_HINGE_MM : INSET_TOWARD_HINGE_MM;

  const getHandleZ = () => THICKNESS / 2;

  // ======== Wnętrza (Twoje bez zmian, tylko height -> carcassHeight) ========
  const render3DInternals = (module, moduleWidth, isHovered) => {
    const baseModuleBottomY = PLINTH_HEIGHT + THICKNESS;
    const baseModuleTopY = baseModuleHeight;
    const shelfDepth = CORPUS_DEPTH - 8;
    const shelfArgs = [moduleWidth, THICKNESS, shelfDepth];

    const drawDrawerStack = (heights, startY = baseModuleBottomY) => {
      let drawers = [],
        cumulativeHeight = 0,
        drawerVerticalGap = 40;

      heights.forEach((h, i) => {
        const drawerY = startY + cumulativeHeight + h / 2;
        drawers.push(
          <Drawer
            key={`drawer-${i}`}
            position={[0, drawerY, 0]}
            height={h}
            width={moduleWidth - DRAWER_SIDE_GAP * 2}
            depth={CORPUS_DEPTH - 50}
            materialProps={interiorMaterialProps}
            isHovered={isHovered && i === heights.length - 1}
          />
        );
        cumulativeHeight += h;
        if (i < heights.length - 1) cumulativeHeight += drawerVerticalGap;
      });

      return { drawers: <>{drawers}</>, totalHeight: cumulativeHeight };
    };

    switch (module.id) {
      // ... ZOSTAWIAMY TWOJE CASE'Y BEZ ZMIAN ...
      // (tu nie wklejam ponownie Twoich switchy, bo w Twoim pliku jest ich dużo)
      // WAŻNE: w dalszej części pliku wszystkie użycia `height` zamieniliśmy na `carcassHeight`
      default:
        return null;
    }
  };

  // ======== Render ========
  return (
    <group position={[0, height / 2, 0]}>
      {/* ✅ BLENDA LEWA */}
      {leftThickness > 0 && leftDepth > 0 && (
        <Plank
          position={[-width / 2 + leftThickness / 2, 0, zFromFront(leftDepth)]}
          args={[leftThickness, height, leftDepth]}
          materialProps={exteriorMaterialProps}
        />
      )}

      {/* ✅ BLENDA PRAWA */}
      {rightThickness > 0 && rightDepth > 0 && (
        <Plank
          position={[width / 2 - rightThickness / 2, 0, zFromFront(rightDepth)]}
          args={[rightThickness, height, rightDepth]}
          materialProps={exteriorMaterialProps}
        />
      )}

      {/* ✅ BLENDA GÓRNA (grubość 18/36/50) */}
      {topThickness > 0 && topDepth > 0 && (
        <Plank
          position={[0, height / 2 - topThickness / 2, zFromFront(topDepth)]}
          args={[width, topThickness, topDepth]}
          materialProps={exteriorMaterialProps}
        />
      )}

      {/* Korpus + wnętrze: mniejszy o blendy */}
      <group position={[carcassStartX, carcassYOffset, -(THICKNESS + FRONT_GAP) / 2]}>
        {/* Ścianki boczne */}
        <Plank
          position={[THICKNESS / 2, 0, 0]}
          args={[THICKNESS, carcassHeight, CORPUS_DEPTH]}
          materialProps={interiorMaterialProps}
        />
        <Plank
          position={[carcassWidth - THICKNESS / 2, 0, 0]}
          args={[THICKNESS, carcassHeight, CORPUS_DEPTH]}
          materialProps={interiorMaterialProps}
        />

        {/* Plecy */}
        <Plank
          position={[carcassWidth / 2, 0, -CORPUS_DEPTH / 2 + 4.5]}
          args={[carcassWidth - THICKNESS * 2, carcassHeight, 8]}
          materialProps={interiorMaterialProps}
        />

        {/* Moduły */}
        {(() => {
          let cumulativeX = THICKNESS;

          return modules.map((module, index) => {
            const clickHandler = (e) => {
              e.stopPropagation();
              onModuleClick(index);
            };

            const slotOuterWidth = module.width;
            const isHovered = hoveredModuleIndex === index && !isViewOpen;

            const moduleGroup = (
              <group key={index} position={[cumulativeX, 0, 0]}>
                <mesh
                  onClick={clickHandler}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredModuleIndex(index);
                  }}
                  onPointerOut={() => setHoveredModuleIndex(null)}
                  visible={false}
                  position={[slotOuterWidth / 2, 0, 0]}
                >
                  <boxGeometry args={[slotOuterWidth, carcassHeight, CORPUS_DEPTH]} />
                  <meshBasicMaterial transparent opacity={0} />
                </mesh>

                <group position={[slotOuterWidth / 2, -carcassHeight / 2, 0]}>
                  {render3DInternals(module, slotOuterWidth, isHovered)}

                  <Plank
                    position={[0, PLINTH_HEIGHT + THICKNESS / 2, 0]}
                    args={[slotOuterWidth, THICKNESS, CORPUS_DEPTH]}
                    materialProps={interiorMaterialProps}
                  />
                  <Plank
                    position={[0, baseModuleHeight - THICKNESS / 2, 0]}
                    args={[slotOuterWidth, THICKNESS, CORPUS_DEPTH]}
                    materialProps={interiorMaterialProps}
                  />
                  <Plank
                    position={[0, carcassHeight - THICKNESS / 2, 0]}
                    args={[slotOuterWidth, THICKNESS, CORPUS_DEPTH]}
                    materialProps={interiorMaterialProps}
                  />
                </group>

                {isViewOpen && activeModuleIndex === index && (
                  <mesh position={[slotOuterWidth / 2, 0, 1]}>
                    <boxGeometry args={[slotOuterWidth, carcassHeight, depth]} />
                    <meshStandardMaterial
                      color="#E17C4F"
                      emissive="#E17C4F"
                      emissiveIntensity={0.3}
                      transparent
                      opacity={0.12}
                    />
                  </mesh>
                )}

                {index < modules.length - 1 && (
                  <Plank
                    position={[slotOuterWidth + THICKNESS / 2, 0, 0]}
                    args={[THICKNESS, carcassHeight, CORPUS_DEPTH]}
                    materialProps={interiorMaterialProps}
                  />
                )}
              </group>
            );

            cumulativeX += slotOuterWidth + THICKNESS;
            return moduleGroup;
          });
        })()}
      </group>

      {/* FRONTY – też na carcassHeight i przesunięte */}
      {!isViewOpen && (
        <group position={[carcassStartX, carcassYOffset, depth / 2 - THICKNESS / 2 - 4]}>
          {/* cokół */}
          <Plank
            position={[carcassWidth / 2, -carcassHeight / 2 + PLINTH_HEIGHT / 2, 0]}
            args={[carcassWidth, PLINTH_HEIGHT, THICKNESS]}
            materialProps={exteriorMaterialProps}
          />

          {(() => {
            let cumulativeX = 0;

            const placeHandleX = (hingeSide, leafW) => {
              const freeEdgeX = handleXOnFreeEdge(hingeSide, leafW);
              if (handleType === 'edge') return freeEdgeX;
              if (handleType === 'bar' || handleType === 'knob') return freeEdgeX + insetTowardHinge(hingeSide);
              return freeEdgeX;
            };

            return modules.map((module, index) => {
              const doorWidth = totalInternalWidth > 0 ? (module.width / totalInternalWidth) * carcassWidth : 0;
              if (doorWidth <= 0) return null;

              const mainDoorHeight = (hasNadstawka ? baseModuleHeight : carcassHeight) - PLINTH_HEIGHT - FRONT_DOOR_GAP;
              const nadstawkaDoorHeight = hasNadstawka ? carcassHeight - baseModuleHeight - FRONT_DOOR_GAP : 0;

              const mainDoorY =
                -carcassHeight / 2 + PLINTH_HEIGHT + FRONT_DOOR_GAP / 2 + mainDoorHeight / 2;
              const nadstawkaDoorY =
                -carcassHeight / 2 + baseModuleHeight + FRONT_DOOR_GAP / 2 + nadstawkaDoorHeight / 2;

              const isHovered = hoveredModuleIndex === index && !isViewOpen;

              const moduleGroup = (
                <group key={`front-group-${index}`} position={[cumulativeX, 0, 0]}>
                  {doorWidth > DOUBLE_DOOR_THRESHOLD ? (
                    <>
                      {/* LEWE skrzydło */}
                      <group position={[doorWidth / 4, 0, 0]}>
                        <AnimatedDoor isHovered={isHovered} hinge="left" doorWidth={doorWidth / 2 - FRONT_DOOR_GAP / 2}>
                          <Plank
                            position={[0, mainDoorY, 0]}
                            args={[doorWidth / 2 - FRONT_DOOR_GAP / 2, mainDoorHeight, THICKNESS]}
                            materialProps={exteriorMaterialProps}
                          />
                          {hasNadstawka && (
                            <Plank
                              position={[0, nadstawkaDoorY, 0]}
                              args={[doorWidth / 2 - FRONT_DOOR_GAP / 2, nadstawkaDoorHeight, THICKNESS]}
                              materialProps={exteriorMaterialProps}
                            />
                          )}

                          {handleType !== 'none' && (
                            <Handle
                              type={handleType}
                              handleColor={handleColor}
                              isHovered={isHovered}
                              lengthMm={getHandleLength()}
                              position={[
                                placeHandleX('left', doorWidth / 2 - FRONT_DOOR_GAP / 2),
                                getHandleY(),
                                getHandleZ()
                              ]}
                            />
                          )}
                        </AnimatedDoor>
                      </group>

                      {/* PRAWE skrzydło */}
                      <group position={[doorWidth * 0.75 + FRONT_DOOR_GAP, 0, 0]}>
                        <AnimatedDoor isHovered={isHovered} hinge="right" doorWidth={doorWidth / 2 - FRONT_DOOR_GAP / 2}>
                          <Plank
                            position={[0, mainDoorY, 0]}
                            args={[doorWidth / 2 - FRONT_DOOR_GAP / 2, mainDoorHeight, THICKNESS]}
                            materialProps={exteriorMaterialProps}
                          />
                          {hasNadstawka && (
                            <Plank
                              position={[0, nadstawkaDoorY, 0]}
                              args={[doorWidth / 2 - FRONT_DOOR_GAP / 2, nadstawkaDoorHeight, THICKNESS]}
                              materialProps={exteriorMaterialProps}
                            />
                          )}

                          {handleType !== 'none' && (
                            <Handle
                              type={handleType}
                              handleColor={handleColor}
                              isHovered={isHovered}
                              lengthMm={getHandleLength()}
                              position={[
                                placeHandleX('right', doorWidth / 2 - FRONT_DOOR_GAP / 2),
                                getHandleY(),
                                getHandleZ()
                              ]}
                            />
                          )}
                        </AnimatedDoor>
                      </group>
                    </>
                  ) : (
                    <group position={[doorWidth / 2, 0, 0]}>
                      <AnimatedDoor isHovered={isHovered} hinge={module.hinge || 'left'} doorWidth={doorWidth - FRONT_DOOR_GAP}>
                        <Plank
                          position={[0, mainDoorY, 0]}
                          args={[doorWidth - FRONT_DOOR_GAP, mainDoorHeight, THICKNESS]}
                          materialProps={exteriorMaterialProps}
                        />
                        {hasNadstawka && (
                          <Plank
                            position={[0, nadstawkaDoorY, 0]}
                            args={[doorWidth - FRONT_DOOR_GAP, nadstawkaDoorHeight, THICKNESS]}
                            materialProps={exteriorMaterialProps}
                          />
                        )}

                        {handleType !== 'none' && (
                          <Handle
                            type={handleType}
                            handleColor={handleColor}
                            isHovered={isHovered}
                            lengthMm={getHandleLength()}
                            position={[
                              placeHandleX(module.hinge || 'left', doorWidth - FRONT_DOOR_GAP),
                              getHandleY(),
                              getHandleZ()
                            ]}
                          />
                        )}
                      </AnimatedDoor>
                    </group>
                  )}
                </group>
              );

              cumulativeX += doorWidth + FRONT_DOOR_GAP;
              return moduleGroup;
            });
          })()}
        </group>
      )}
    </group>
  );
};

export default Wardrobe;
