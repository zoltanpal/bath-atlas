import type { Bounds } from "@/types/bathymetry";

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function haversineMetres(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const radius = 6_371_008.8;
  const toRadians = Math.PI / 180;
  const phiA = latitudeA * toRadians;
  const phiB = latitudeB * toRadians;
  const deltaPhi = (latitudeB - latitudeA) * toRadians;
  const deltaLambda = (longitudeB - longitudeA) * toRadians;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phiA) * Math.cos(phiB) * Math.sin(deltaLambda / 2) ** 2;

  return 2 * radius * Math.asin(Math.sqrt(a));
}

export function calculateDimensions(bounds: Bounds) {
  const middleLatitude = (bounds.south + bounds.north) / 2;
  const middleLongitude = (bounds.west + bounds.east) / 2;

  return {
    widthMetres: haversineMetres(
      middleLatitude,
      bounds.west,
      middleLatitude,
      bounds.east,
    ),
    heightMetres: haversineMetres(
      bounds.south,
      middleLongitude,
      bounds.north,
      middleLongitude,
    ),
  };
}

export function formatDistance(metres: number) {
  return metres >= 1_000
    ? `${(metres / 1_000).toFixed(1)} km`
    : `${Math.round(metres)} m`;
}

export function mercatorY(latitude: number) {
  const safeLatitude = clamp(latitude, -85.05112878, 85.05112878);
  const radians = (safeLatitude * Math.PI) / 180;

  return (
    (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) /
    2
  );
}

export function createGoogleMapsUrl(bounds: Bounds) {
  const latitude = (bounds.south + bounds.north) / 2;
  const longitude = (bounds.west + bounds.east) / 2;

  const search = new URLSearchParams({
    api: "1",
    map_action: "map",
    center: `${latitude.toFixed(6)},${longitude.toFixed(6)}`,
    zoom: "11",
    basemap: "satellite",
  });

  return `https://www.google.com/maps/@?${search.toString()}`;
}

