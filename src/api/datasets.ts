import { apiFetch } from "@/api/client";
import type { BathymetryDataset } from "@/types/bathymetry";

const requestCache = new Map<string, Promise<BathymetryDataset[]>>();

function readDatasetArray(payload: unknown): BathymetryDataset[] {
  if (Array.isArray(payload)) return payload as BathymetryDataset[];

  if (payload && typeof payload === "object") {
    const response = payload as {
      datasets?: unknown;
      items?: unknown;
    };

    if (Array.isArray(response.datasets)) {
      return response.datasets as BathymetryDataset[];
    }

    if (Array.isArray(response.items)) {
      return response.items as BathymetryDataset[];
    }
  }

  throw new Error("The datasets endpoint returned an unexpected response.");
}

async function requestDatasets(endpoint: string) {
  return readDatasetArray(await apiFetch<unknown>(endpoint));
}

export function fetchDatasets(endpoint: string, force = false) {
  if (force) requestCache.delete(endpoint);

  const cached = requestCache.get(endpoint);
  if (cached) return cached;

  const request = requestDatasets(endpoint).catch((error: unknown) => {
    requestCache.delete(endpoint);
    throw error;
  });

  requestCache.set(endpoint, request);
  return request;
}
