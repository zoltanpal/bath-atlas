import { useEffect, useState } from "react";

import { loadBathymetry } from "@/lib/loadBathymetry";
import type { BathymetryData } from "@/types/bathymetry";

export function useBathymetry(src: string) {
  const [data, setData] = useState<BathymetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setLoading(true);
    setError(null);

    loadBathymetry(src, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load the bathymetry data.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [src]);

  return { data, loading, error };
}

