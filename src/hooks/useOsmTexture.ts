import { useEffect, useMemo, useState } from "react";
import type * as THREE from "three";

import { createOsmTexture } from "@/lib/osm";
import type { Bounds } from "@/types/bathymetry";

type TextureResource = {
  key: string;
  texture: THREE.CanvasTexture;
};

export function useOsmTexture(bounds: Bounds | null, enabled: boolean) {
  const [resource, setResource] = useState<TextureResource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(
    () =>
      bounds
        ? `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`
        : null,
    [bounds],
  );

  useEffect(() => {
    if (!enabled || !bounds || !key || resource?.key === key) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    createOsmTexture(bounds, controller.signal)
      .then((texture) => {
        if (controller.signal.aborted) {
          texture.dispose();
          return;
        }

        setResource({ key, texture });
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            caught instanceof Error ? caught.message : "Could not load map.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [bounds, enabled, key, resource?.key]);

  useEffect(
    () => () => {
      resource?.texture.dispose();
    },
    [resource],
  );

  return {
    texture: resource?.key === key ? resource.texture : null,
    loading,
    error,
  };
}

