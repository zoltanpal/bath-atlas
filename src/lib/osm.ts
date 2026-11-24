import * as THREE from "three";

import { clamp, mercatorY } from "@/lib/geography";
import type { Bounds } from "@/types/bathymetry";

function longitudeToTileX(longitude: number, zoom: number) {
  return ((longitude + 180) / 360) * 2 ** zoom;
}

function latitudeToTileY(latitude: number, zoom: number) {
  return mercatorY(latitude) * 2 ** zoom;
}

function chooseTileZoom(bounds: Bounds) {
  for (let zoom = 2; zoom <= 14; zoom += 1) {
    const pixelWidth =
      Math.abs(
        longitudeToTileX(bounds.east, zoom) -
          longitudeToTileX(bounds.west, zoom),
      ) * 256;
    const pixelHeight =
      Math.abs(
        latitudeToTileY(bounds.south, zoom) -
          latitudeToTileY(bounds.north, zoom),
      ) * 256;

    if (Math.max(pixelWidth, pixelHeight) >= 1_000) return zoom;
  }

  return 14;
}

function loadImage(url: string, signal: AbortSignal) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    const abort = () => {
      image.src = "";
      reject(new DOMException("Aborted", "AbortError"));
    };

    image.onload = () => {
      signal.removeEventListener("abort", abort);
      resolve(image);
    };
    image.onerror = () => {
      signal.removeEventListener("abort", abort);
      reject(new Error(`Could not load map tile: ${url}`));
    };

    signal.addEventListener("abort", abort, { once: true });
    image.src = url;
  });
}

export async function createOsmTexture(
  bounds: Bounds,
  signal: AbortSignal,
) {
  const zoom = chooseTileZoom(bounds);
  const tileSize = 256;
  const westX = longitudeToTileX(bounds.west, zoom);
  const eastX = longitudeToTileX(bounds.east, zoom);
  const northY = latitudeToTileY(bounds.north, zoom);
  const southY = latitudeToTileY(bounds.south, zoom);
  const firstX = Math.floor(westX);
  const lastX = Math.floor(eastX);
  const firstY = Math.floor(northY);
  const lastY = Math.floor(southY);
  const columnCount = lastX - firstX + 1;
  const rowCount = lastY - firstY + 1;
  const stitched = document.createElement("canvas");
  stitched.width = columnCount * tileSize;
  stitched.height = rowCount * tileSize;
  const context = stitched.getContext("2d");

  if (!context) throw new Error("Canvas 2D is unavailable.");

  const tileLimit = 2 ** zoom;

  await Promise.all(
    Array.from({ length: rowCount }, (_, row) =>
      Array.from({ length: columnCount }, async (_, column) => {
        const tileX = ((firstX + column) % tileLimit + tileLimit) % tileLimit;
        const tileY = clamp(firstY + row, 0, tileLimit - 1);
        const image = await loadImage(
          `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`,
          signal,
        );

        context.drawImage(
          image,
          column * tileSize,
          row * tileSize,
          tileSize,
          tileSize,
        );
      }),
    ).flat(),
  );

  const sourceX = (westX - firstX) * tileSize;
  const sourceY = (northY - firstY) * tileSize;
  const sourceWidth = Math.max(1, (eastX - westX) * tileSize);
  const sourceHeight = Math.max(1, (southY - northY) * tileSize);
  const cropped = document.createElement("canvas");
  cropped.width = Math.max(1, Math.round(sourceWidth));
  cropped.height = Math.max(1, Math.round(sourceHeight));
  const croppedContext = cropped.getContext("2d");

  if (!croppedContext) throw new Error("Canvas 2D is unavailable.");

  croppedContext.drawImage(
    stitched,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    cropped.width,
    cropped.height,
  );

  const texture = new THREE.CanvasTexture(cropped);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

