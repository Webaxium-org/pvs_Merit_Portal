import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

// Create the context
const MeritSettingsContext = createContext({
  meritYear: 2026,
  budgetPercentage: 3.0,
  loading: true,
  error: null,
  refetch: () => {},
});

// Provider component
export const MeritSettingsProvider = ({ children }) => {
  const [meritYear, setMeritYear] = useState(2026);
  const [budgetPercentage, setBudgetPercentage] = useState(3.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/v2/merit-settings/current");

      if (response.data.success) {
        const { meritYear: year, budgetPercentage: percentage } = response.data.data;
        setMeritYear(year);
        setBudgetPercentage(parseFloat(percentage));
      }
    } catch (err) {
      console.error("Failed to fetch merit settings:", err);
      setError(err.message || "Failed to load merit settings");
      // Keep default values on error
      setMeritYear(2026);
      setBudgetPercentage(3.0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Listen for settings updates (triggered from Settings page)
  useEffect(() => {
    const handleSettingsUpdate = () => {
      console.log("Merit settings updated - refetching...");
      fetchSettings();
    };

    window.addEventListener("meritSettingsUpdated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("meritSettingsUpdated", handleSettingsUpdate);
    };
  }, []);

  const value = {
    meritYear,
    budgetPercentage,
    loading,
    error,
    refetch: fetchSettings,
  };

  return (
    <MeritSettingsContext.Provider value={value}>
      {children}
    </MeritSettingsContext.Provider>
  );
};

// Custom hook to use the merit settings
export const useMeritSettings = () => {
  const context = useContext(MeritSettingsContext);

  if (context === undefined) {
    throw new Error("useMeritSettings must be used within a MeritSettingsProvider");
  }

  return context;
};

export default MeritSettingsContext;
