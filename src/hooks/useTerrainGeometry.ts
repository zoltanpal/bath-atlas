import { useEffect, useMemo } from "react";

import { createTerrainGeometry } from "@/lib/terrain";
import type { BathymetryData, TerrainLayout } from "@/types/bathymetry";

export function useTerrainGeometry(
  data: BathymetryData,
  layout: TerrainLayout,
) {
  const geometry = useMemo(
    () => createTerrainGeometry(data, layout),
    [data, layout],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return geometry;
}

