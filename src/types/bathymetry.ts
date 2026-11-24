import type * as THREE from "three";

export type Bounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type BathymetryDataset = {
  id: number | string;
  slug: string;
  name: string;
  description: string | null;
  raster_path: string;
  thumbnail_path: string | null;
  source_url: string | null;
  created_at?: string;
};

export type BathymetryData = {
  width: number;
  height: number;
  elevations: Float32Array;
  valid: Uint8Array;
  min: number;
  max: number;
  bounds: Bounds;
  widthMetres: number;
  heightMetres: number;
};

export type TerrainLayout = {
  worldWidth: number;
  worldDepth: number;
  elevationCentre: number;
  verticalScale: number;
  verticalExaggeration: number;
};

export type ContourLine = {
  value: number;
  major: boolean;
  geometry: THREE.BufferGeometry;
  labelPosition?: [number, number, number];
};

