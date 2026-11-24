import { fromArrayBuffer } from "geotiff";

import { calculateDimensions } from "@/lib/geography";
import type { BathymetryData, Bounds } from "@/types/bathymetry";

export async function loadBathymetry(
  src: string,
  signal: AbortSignal,
): Promise<BathymetryData> {
  const response = await fetch(src, { signal });

  if (!response.ok) {
    throw new Error(`Could not load ${src} (${response.status})`);
  }

  const tiff = await fromArrayBuffer(await response.arrayBuffer());
  const image = await tiff.getImage();
  const width = image.getWidth();
  const height = image.getHeight();
  const raster = (await image.readRasters({
    interleave: true,
  })) as unknown as ArrayLike<number>;

  const rawBounds = image.getBoundingBox();
  const bounds: Bounds = {
    west: Math.min(rawBounds[0], rawBounds[2]),
    south: Math.min(rawBounds[1], rawBounds[3]),
    east: Math.max(rawBounds[0], rawBounds[2]),
    north: Math.max(rawBounds[1], rawBounds[3]),
  };

  const noData = image.getGDALNoData();
  const elevations = new Float32Array(width * height);
  const valid = new Uint8Array(width * height);
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < elevations.length; index += 1) {
    const value = Number(raster[index]);
    const isNoData =
      noData !== null &&
      noData !== undefined &&
      Math.abs(value - noData) <= Math.max(1e-6, Math.abs(noData) * 1e-7);
    const isValid =
      Number.isFinite(value) && !isNoData && value > -100_000;

    if (isValid) {
      elevations[index] = value;
      valid[index] = 1;
      min = Math.min(min, value);
      max = Math.max(max, value);
    } else {
      elevations[index] = Number.NaN;
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error("The GeoTIFF contains no usable elevation values.");
  }

  const dimensions = calculateDimensions(bounds);

  return {
    width,
    height,
    elevations,
    valid,
    min,
    max,
    bounds,
    ...dimensions,
  };
}

