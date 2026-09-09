import { useState, useEffect } from "react";

// pageKey identifie où ces filtres s'appliquent (ex: "tasks", "projects") —
// permet d'avoir des presets différents par page sans qu'ils se mélangent.
export function useSavedFilters(pageKey) {
  const storageKey = `savedFilters:${pageKey}`;
  const [presets, setPresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(presets));
  }, [presets, storageKey]);

  function savePreset(name, filters) {
    setPresets((prev) => [...prev.filter((p) => p.name !== name), { name, filters }]);
  }

  function deletePreset(name) {
    setPresets((prev) => prev.filter((p) => p.name !== name));
  }

  return { presets, savePreset, deletePreset };
}