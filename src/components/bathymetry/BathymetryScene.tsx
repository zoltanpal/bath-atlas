import { OrbitControls } from "@react-three/drei";
import { DoubleSide, type CanvasTexture } from "three";

import { ContourLayer } from "@/components/bathymetry/ContourLayer";
import { useTerrainGeometry } from "@/hooks/useTerrainGeometry";
import type { BathymetryData, TerrainLayout } from "@/types/bathymetry";

type BathymetrySceneProps = {
  data: BathymetryData;
  layout: TerrainLayout;
  showContours: boolean;
  showWireframe: boolean;
  mapTexture: CanvasTexture | null;
  mapOpacity: number;
};

export function BathymetryScene({
  data,
  layout,
  showContours,
  showWireframe,
  mapTexture,
  mapOpacity,
}: BathymetrySceneProps) {
  const geometry = useTerrainGeometry(data, layout);

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 10, 5]} intensity={2.2} />
      <directionalLight position={[-5, 3, -4]} intensity={0.7} />

      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          roughness={0.78}
          metalness={0.02}
          side={DoubleSide}
        />
      </mesh>

      {mapTexture && (
        <mesh geometry={geometry} renderOrder={2}>
          <meshBasicMaterial
            map={mapTexture}
            color="#ffffff"
            transparent
            opacity={mapOpacity}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
            side={DoubleSide}
          />
        </mesh>
      )}

      {showWireframe && (
        <mesh geometry={geometry} renderOrder={3}>
          <meshBasicMaterial
            color="#dbeafe"
            wireframe
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      )}

      {showContours && <ContourLayer data={data} layout={layout} />}

      <OrbitControls
        makeDefault
        target={[0, -0.25, 0]}
        enableDamping
        dampingFactor={0.08}
        zoomToCursor
        enablePan
        screenSpacePanning
        minDistance={0.05}
        maxDistance={60}
        maxPolarAngle={Math.PI * 0.49}
      />
    </>
  );
}
