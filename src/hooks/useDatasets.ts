import { useCallback, useEffect, useState } from "react";

import { fetchDatasets } from "@/api/datasets";
import type { BathymetryDataset } from "@/types/bathymetry";

export function useDatasets(endpoint = "/datasets") {
  const [datasets, setDatasets] = useState<BathymetryDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchDatasets(endpoint, reloadVersion > 0)
      .then((result) => {
        if (active) setDatasets(result);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load datasets.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [endpoint, reloadVersion]);

  const reload = useCallback(() => {
    setReloadVersion((version) => version + 1);
  }, []);

  return { datasets, loading, error, reload };
}
