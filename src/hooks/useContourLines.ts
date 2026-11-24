import { useEffect, useMemo } from "react";

import { createContourLines } from "@/lib/contours";
import type { BathymetryData, TerrainLayout } from "@/types/bathymetry";

export function useContourLines(
  data: BathymetryData,
  layout: TerrainLayout,
) {
  const lines = useMemo(
    () => createContourLines(data, layout),
    [data, layout],
  );

  useEffect(
    () => () => {
      for (const line of lines) line.geometry.dispose();
    },
    [lines],
  );

  return lines;
}

