import { contours } from "d3-contour"
import * as THREE from "three"

import { clamp } from "@/lib/geography"
import { elevationToY } from "@/lib/terrain"
import type {
  BathymetryData,
  ContourLine,
  TerrainLayout,
} from "@/types/bathymetry"

export const MINOR_CONTOUR_METRES = 50
export const MAJOR_CONTOUR_METRES = 100

function isArtificialBoundarySegment(
  a: number[],
  b: number[],
  width: number,
  height: number
) {
  const epsilon = 1e-6

  return (
    (Math.abs(a[0]) < epsilon && Math.abs(b[0]) < epsilon) ||
    (Math.abs(a[0] - width) < epsilon && Math.abs(b[0] - width) < epsilon) ||
    (Math.abs(a[1]) < epsilon && Math.abs(b[1]) < epsilon) ||
    (Math.abs(a[1] - height) < epsilon && Math.abs(b[1] - height) < epsilon)
  )
}

function contourSegmentHasData(a: number[], b: number[], data: BathymetryData) {
  const gridX = (a[0] + b[0]) / 2 - 0.5
  const gridY = (a[1] + b[1]) / 2 - 0.5
  const left = clamp(Math.floor(gridX), 0, data.width - 1)
  const right = clamp(left + 1, 0, data.width - 1)
  const top = clamp(Math.floor(gridY), 0, data.height - 1)
  const bottom = clamp(top + 1, 0, data.height - 1)

  return Boolean(
    data.valid[top * data.width + left] &&
    data.valid[top * data.width + right] &&
    data.valid[bottom * data.width + left] &&
    data.valid[bottom * data.width + right]
  )
}

function contourPointToWorld(
  point: number[],
  elevation: number,
  data: BathymetryData,
  layout: TerrainLayout
) {
  const column = clamp(point[0] - 0.5, 0, data.width - 1)
  const row = clamp(point[1] - 0.5, 0, data.height - 1)

  return new THREE.Vector3(
    (column / Math.max(1, data.width - 1) - 0.5) * layout.worldWidth,
    elevationToY(elevation, layout) + 0.025,
    (row / Math.max(1, data.height - 1) - 0.5) * layout.worldDepth
  )
}

function pathLength(points: THREE.Vector3[]) {
  let length = 0

  for (let index = 1; index < points.length; index += 1) {
    length += points[index - 1].distanceTo(points[index])
  }

  return length
}

function midpointAlongPath(points: THREE.Vector3[]) {
  if (points.length === 0) return undefined
  if (points.length === 1) return points[0].clone()

  const totalLength = pathLength(points)
  const target = totalLength / 2
  let travelled = 0

  for (let index = 1; index < points.length; index += 1) {
    const segmentLength = points[index - 1].distanceTo(points[index])

    if (travelled + segmentLength >= target) {
      const amount = (target - travelled) / Math.max(segmentLength, 1e-9)
      return points[index - 1].clone().lerp(points[index], amount)
    }

    travelled += segmentLength
  }

  return points[points.length - 1].clone()
}

export function createContourLines(
  data: BathymetryData,
  layout: TerrainLayout
): ContourLine[] {
  const firstContour =
    Math.ceil(data.min / MINOR_CONTOUR_METRES) * MINOR_CONTOUR_METRES
  const lastContour =
    Math.floor(data.max / MINOR_CONTOUR_METRES) * MINOR_CONTOUR_METRES

  if (firstContour > lastContour) return []

  const thresholds: number[] = []

  for (
    let elevation = firstContour;
    elevation <= lastContour;
    elevation += MINOR_CONTOUR_METRES
  ) {
    thresholds.push(elevation)
  }

  const values = new Float64Array(data.elevations.length)

  for (let index = 0; index < values.length; index += 1) {
    values[index] = data.valid[index] ? data.elevations[index] : Number.NaN
  }

  const generated = contours()
    .size([data.width, data.height])
    .smooth(true)
    .thresholds(thresholds)(Array.from(values))

  return generated.map((contour) => {
    const linePositions: number[] = []
    let longestPath: THREE.Vector3[] = []
    let currentPath: THREE.Vector3[] = []

    const finishPath = () => {
      if (pathLength(currentPath) > pathLength(longestPath)) {
        longestPath = currentPath
      }

      currentPath = []
    }

    for (const polygon of contour.coordinates) {
      for (const ring of polygon) {
        currentPath = []

        for (let index = 1; index < ring.length; index += 1) {
          const a = ring[index - 1]
          const b = ring[index]
          const keepSegment =
            !isArtificialBoundarySegment(a, b, data.width, data.height) &&
            contourSegmentHasData(a, b, data)

          if (!keepSegment) {
            finishPath()
            continue
          }

          const worldA = contourPointToWorld(a, contour.value, data, layout)
          const worldB = contourPointToWorld(b, contour.value, data, layout)

          linePositions.push(
            worldA.x,
            worldA.y,
            worldA.z,
            worldB.x,
            worldB.y,
            worldB.z
          )

          if (currentPath.length === 0) currentPath.push(worldA)
          currentPath.push(worldB)
        }

        finishPath()
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    )

    const major = Math.abs(contour.value) % MAJOR_CONTOUR_METRES === 0
    const labelPoint = major ? midpointAlongPath(longestPath) : undefined

    return {
      value: contour.value,
      major,
      geometry,
      labelPosition:
        labelPoint && pathLength(longestPath) >= 0.7
          ? [labelPoint.x, labelPoint.y + 0.09, labelPoint.z]
          : undefined,
    }
  })
}

export function contourLabel(value: number) {
  if (value === 0) return "Sea level"

  return value < 0
    ? `${Math.abs(Math.round(value))} m depth`
    : `${Math.round(value)} m elevation`
}

export function contourColour(value: number, major: boolean) {
  if (value > 0) return major ? "#fde68a" : "#fef3c7"
  if (value === 0) return "#22d3ee"
  return major ? "#f8fafc" : "#bae6fd"
}
