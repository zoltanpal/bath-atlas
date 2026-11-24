import { useState } from "react";

export function useViewerSettings() {
  const [showContours, setShowContours] = useState(true);
  const [showWireframe, setShowWireframe] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [mapOpacity, setMapOpacity] = useState(0.45);

  return {
    showContours,
    setShowContours,
    showWireframe,
    setShowWireframe,
    showMap,
    setShowMap,
    mapOpacity,
    setMapOpacity,
  };
}

