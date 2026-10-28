"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ViewMode = "front" | "back";

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isTouchDevice: boolean;
}

const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: "front",
  setViewMode: () => {},
  isTouchDevice: false,
});

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("front");
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch =
        typeof window !== "undefined" &&
        ("ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches ||
          window.innerWidth < 768);
      setIsTouchDevice(Boolean(hasTouch));
    };

    checkTouch();
    window.addEventListener("resize", checkTouch);
    return () => window.removeEventListener("resize", checkTouch);
  }, []);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, isTouchDevice }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
