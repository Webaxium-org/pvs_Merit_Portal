import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Snackbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";
import HistoryIcon from "@mui/icons-material/History";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import api from "../../utils/api";

const Settings = () => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Form state
  const [meritYear, setMeritYear] = useState(2026);
  const [budgetPercentage, setBudgetPercentage] = useState(3.0);
  const [notes, setNotes] = useState("");

  // Current settings state
  const [currentSettings, setCurrentSettings] = useState(null);

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch current settings on mount
  useEffect(() => {
    fetchCurrentSettings();
    fetchHistory();
  }, []);

  const fetchCurrentSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/v2/merit-settings/current");
      if (response.data.success) {
        const settings = response.data.data;
        setCurrentSettings(settings);
        setMeritYear(settings.meritYear);
        setBudgetPercentage(settings.budgetPercentage);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch current settings";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await api.get("/v2/merit-settings/history");
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch settings history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!meritYear || budgetPercentage === undefined || budgetPercentage === null) {
      setError("Merit year and budget percentage are required");
      return;
    }

    if (meritYear < 2025 || meritYear > 2030) {
      setError("Merit year must be between 2025 and 2030");
      return;
    }

    if (budgetPercentage < 0 || budgetPercentage > 100) {
      setError("Budget percentage must be between 0 and 100");
      return;
    }

    // Check if values have changed
    if (
      currentSettings &&
      meritYear === currentSettings.meritYear &&
      parseFloat(budgetPercentage) === parseFloat(currentSettings.budgetPercentage)
    ) {
      setError("Please change at least one value before saving");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/v2/merit-settings", {
        meritYear: parseInt(meritYear),
        budgetPercentage: parseFloat(budgetPercentage),
        notes: notes.trim() || null,
      });

      if (response.data.success) {
        setSuccess("Settings saved successfully! The application will now use these new values.");
        setSnackbarOpen(true);
        setNotes("");

        // Refresh current settings and history
        await fetchCurrentSettings();
        await fetchHistory();

        // Trigger a global event so other components can refresh their data
        window.dispatchEvent(new CustomEvent('meritSettingsUpdated'));
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to save settings";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const historyColumns = [
    {
      field: "meritYear",
      headerName: "Merit Year",
      width: 120,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "budgetPercentage",
      headerName: "Merit Budget %",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => `${params.value}%`,
    },
    {
      field: "createdByName",
      headerName: "Created By",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      renderCell: (params) =>
        new Date(params.value).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) =>
        params.value ? (
          <Typography
            sx={{
              color: "success.main",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            Active
          </Typography>
        ) : (
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.875rem",
            }}
          >
            Inactive
          </Typography>
        ),
    },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => params.value || "-",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h4" sx={{ mb: 2 }}>
        Merit Settings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure the merit year and merit budget percentage for the merit portal. These
        settings will be used throughout the application for calculations and
        display.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current Settings Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <InfoOutlinedIcon color="primary" />
                <Typography variant="h6">Current Settings</Typography>
              </Box>

              {currentSettings && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Merit Year:
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {currentSettings.meritYear}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Merit Budget Percentage:
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {currentSettings.budgetPercentage}%
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 2 }}
                  >
                    Last updated by {currentSettings.createdByName} on{" "}
                    {new Date(currentSettings.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Update Settings Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Update Settings
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Merit Year"
                  type="number"
                  value={meritYear}
                  onChange={(e) => setMeritYear(parseInt(e.target.value))}
                  fullWidth
                  inputProps={{
                    min: 2025,
                    max: 2030,
                    step: 1,
                  }}
                  helperText="Enter a year between 2025 and 2030"
                />

                <TextField
                  label="Merit Budget Percentage"
                  type="number"
                  value={budgetPercentage}
                  onChange={(e) => setBudgetPercentage(parseFloat(e.target.value))}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  inputProps={{
                    min: 0,
                    max: 100,
                    step: 0.01,
                  }}
                  helperText="Enter a percentage between 0 and 100"
                />

                <TextField
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  placeholder="Add any notes about this configuration change..."
                  helperText="These notes will be saved in the history"
                />

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    mt: 2,
                    fontWeight: 600,
                    py: 1.5,
                  }}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settings History */}
      <Paper
        sx={{
          width: "100%",
          mt: 4,
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6">Settings History</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            View all previous merit settings configurations
          </Typography>
        </Box>

        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={history}
            columns={historyColumns}
            getRowId={(row) => row.id}
            loading={historyLoading}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "background.paper",
                borderBottom: "2px solid",
                borderColor: "divider",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid",
                borderColor: "divider",
              },
            }}
          />
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
