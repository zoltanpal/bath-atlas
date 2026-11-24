import * as THREE from "three";

import {
  clamp,
  mercatorY,
} from "@/lib/geography";

import type {
  BathymetryData,
  TerrainLayout,
} from "@/types/bathymetry";

const TERRAIN_LONG_SIDE = 10;

function calculateVerticalExaggeration(
  data: BathymetryData,
) {
  const maximumDepth = Math.max(
    0,
    -data.min,
  );

  if (maximumDepth >= 8_000) {
    return 18;
  }

  if (maximumDepth >= 4_000) {
    return 12;
  }

  if (maximumDepth >= 1_500) {
    return 8;
  }

  return 5;
}

export function createTerrainLayout(
  data: BathymetryData,
): TerrainLayout {
  const longestSide = Math.max(
    data.widthMetres,
    data.heightMetres,
  );

  const horizontalScale =
    TERRAIN_LONG_SIDE / longestSide;

  const verticalExaggeration =
    calculateVerticalExaggeration(data);

  return {
    worldWidth:
      data.widthMetres *
      horizontalScale,

    worldDepth:
      data.heightMetres *
      horizontalScale,

    elevationCentre:
      (data.min + data.max) / 2,

    verticalScale:
      horizontalScale *
      verticalExaggeration,

    verticalExaggeration,
  };
}

export function elevationToY(elevation: number, layout: TerrainLayout) {
  return (elevation - layout.elevationCentre) * layout.verticalScale;
}

export function createTerrainGeometry(
  data: BathymetryData,
  layout: TerrainLayout,
) {
  const positions = new Float32Array(data.width * data.height * 3);
  const colours = new Float32Array(data.width * data.height * 3);
  const uvs = new Float32Array(data.width * data.height * 2);
  const indices: number[] = [];
  const colour = new THREE.Color();
  const deep = new THREE.Color("#082f49");
  const middle = new THREE.Color("#0e7490");
  const shallow = new THREE.Color("#67e8f9");
  const land = new THREE.Color("#d6d3a9");
  const maximumDepth = Math.max(1, -data.min);
  const mercatorNorth = mercatorY(data.bounds.north);
  const mercatorSouth = mercatorY(data.bounds.south);

  for (let row = 0; row < data.height; row += 1) {
    const rowFraction = row / Math.max(1, data.height - 1);
    const latitude =
      data.bounds.north -
      rowFraction * (data.bounds.north - data.bounds.south);
    const textureV =
      1 -
      (mercatorY(latitude) - mercatorNorth) /
        Math.max(1e-12, mercatorSouth - mercatorNorth);

    for (let column = 0; column < data.width; column += 1) {
      const index = row * data.width + column;
      const positionOffset = index * 3;
      const uvOffset = index * 2;
      const columnFraction = column / Math.max(1, data.width - 1);
      const elevation = data.valid[index] ? data.elevations[index] : data.min;

      positions[positionOffset] =
        (columnFraction - 0.5) * layout.worldWidth;
      positions[positionOffset + 1] = elevationToY(elevation, layout);
      positions[positionOffset + 2] =
        (rowFraction - 0.5) * layout.worldDepth;

      if (elevation >= 0) {
        colour.copy(land);
      } else {
        const depthFraction = clamp(-elevation / maximumDepth, 0, 1);

        if (depthFraction < 0.35) {
          colour.lerpColors(shallow, middle, depthFraction / 0.35);
        } else {
          colour.lerpColors(middle, deep, (depthFraction - 0.35) / 0.65);
        }
      }

      colours[positionOffset] = colour.r;
      colours[positionOffset + 1] = colour.g;
      colours[positionOffset + 2] = colour.b;
      uvs[uvOffset] = columnFraction;
      uvs[uvOffset + 1] = textureV;
    }
  }

  for (let row = 0; row < data.height - 1; row += 1) {
    for (let column = 0; column < data.width - 1; column += 1) {
      const topLeft = row * data.width + column;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + data.width;
      const bottomRight = bottomLeft + 1;

      if (
        data.valid[topLeft] &&
        data.valid[topRight] &&
        data.valid[bottomLeft]
      ) {
        indices.push(topLeft, bottomLeft, topRight);
      }

      if (
        data.valid[topRight] &&
        data.valid[bottomLeft] &&
        data.valid[bottomRight]
      ) {
        indices.push(topRight, bottomLeft, bottomRight);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}

