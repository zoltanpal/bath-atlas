import { Billboard, Text } from "@react-three/drei";

import { useContourLines } from "@/hooks/useContourLines";
import { contourColour, contourLabel } from "@/lib/contours";
import type { BathymetryData, TerrainLayout } from "@/types/bathymetry";

type ContourLayerProps = {
  data: BathymetryData;
  layout: TerrainLayout;
};

export function ContourLayer({ data, layout }: ContourLayerProps) {
  const lines = useContourLines(data, layout);

  return (
    <group>
      {lines.map((line) => (
        <group key={line.value}>
          <lineSegments geometry={line.geometry} renderOrder={4}>
            <lineBasicMaterial
              color={contourColour(line.value, line.major)}
              transparent
              opacity={line.major ? 0.95 : 0.55}
              depthWrite={false}
            />
          </lineSegments>

          {line.labelPosition && (
            <Billboard position={line.labelPosition} follow>
              <Text
                color="#ffffff"
                fontSize={0.18}
                anchorX="center"
                anchorY="middle"
                outlineColor="#082f49"
                outlineWidth={0.025}
                renderOrder={8}
              >
                {contourLabel(line.value)}
              </Text>
            </Billboard>
          )}
        </group>
      ))}
    </group>
  );
}

