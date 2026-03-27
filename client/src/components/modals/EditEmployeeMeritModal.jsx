import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Slide,
  Grid,
  Autocomplete,
  Typography,
} from "@mui/material";
import api from "../../utils/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditEmployeeMeritModal = ({ open, onClose, onEmployeeUpdated, employee }) => {
  const [formData, setFormData] = useState({
    meritAmount: "",
    level1Approver: "",
    level2Approver: "",
    level3Approver: "",
    level4Approver: "",
    level5Approver: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);

  // Fetch all employees and populate form when modal opens
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/v2/employees");
        setEmployees(response.data.data || []);

        // Populate form after employees are loaded
        if (employee) {
          // Determine merit amount based on employee type
          let meritValue = "";
          if (employee.salaryType === "Hourly") {
            meritValue = employee.meritIncreaseDollar || "";
          } else {
            meritValue = employee.meritIncreasePercentage || "";
          }

          setFormData({
            meritAmount: meritValue,
            level1Approver: employee.level1ApproverId || "",
            level2Approver: employee.level2ApproverId || "",
            level3Approver: employee.level3ApproverId || "",
            level4Approver: employee.level4ApproverId || "",
            level5Approver: employee.level5ApproverId || "",
          });
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    if (open && employee) {
      fetchEmployees();
      setError("");
    }
  }, [open, employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      // Build payload based on employee type
      const payload = {
        level1Approver: formData.level1Approver || undefined,
        level2Approver: formData.level2Approver || undefined,
        level3Approver: formData.level3Approver || undefined,
        level4Approver: formData.level4Approver || undefined,
        level5Approver: formData.level5Approver || undefined,
      };

      // Add merit field based on employee type
      if (formData.meritAmount) {
        if (employee.salaryType === "Hourly") {
          payload.meritIncreaseDollar = parseFloat(formData.meritAmount);
        } else {
          payload.meritIncreasePercentage = parseFloat(formData.meritAmount);
        }
      }

      await api.put(`/v2/employees/${employee.id}`, payload);

      // Reset form
      setFormData({
        meritAmount: "",
        level1Approver: "",
        level2Approver: "",
        level3Approver: "",
        level4Approver: "",
        level5Approver: "",
      });

      onEmployeeUpdated();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while updating employee"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        meritAmount: "",
        level1Approver: "",
        level2Approver: "",
        level3Approver: "",
        level4Approver: "",
        level5Approver: "",
      });
      setError("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slots={{
        transition: Transition,
      }}
      keepMounted
    >
      <DialogTitle>
        Edit Employee Merit & Approvers
        {employee && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {employee.fullName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {employee && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Salary Type:</strong> {employee.salaryType || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Current {employee.salaryType === "Hourly" ? "Hourly Rate" : "Annual Salary"}:</strong>{" "}
                {employee.salaryType === "Hourly"
                  ? `$${(employee.hourlyPayRate || 0).toFixed(2)}/hr`
                  : `$${(employee.annualSalary || 0).toLocaleString()}`}
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            {/* Merit Increase */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="meritAmount"
                label={
                  employee?.salaryType === "Hourly"
                    ? "Merit Increase ($/hour)"
                    : "Merit Increase (%)"
                }
                type="number"
                value={formData.meritAmount}
                onChange={(e) =>
                  setFormData({ ...formData, meritAmount: e.target.value })
                }
                disabled={loading}
                placeholder={
                  employee?.salaryType === "Hourly"
                    ? "Enter dollar increase per hour (e.g., 0.50)"
                    : "Enter percentage increase (e.g., 2.5 for 2.5%)"
                }
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ mr: 1 }}>
                      {employee?.salaryType === "Hourly" ? "$" : ""}
                    </Typography>
                  ),
                  endAdornment: (
                    <Typography sx={{ ml: 1 }}>
                      {employee?.salaryType === "Hourly" ? "/hr" : "%"}
                    </Typography>
                  ),
                }}
                helperText={
                  employee?.salaryType === "Hourly"
                    ? "Enter the dollar amount increase per hour. Target: 3% average across team."
                    : "Enter the percentage increase. Target: 3% average across team."
                }
              />
            </Grid>

            {/* Level 1 Approver */}
            <Grid item xs={12} sm={6} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={
                  employees.find((emp) => emp.id === formData.level1Approver) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    level1Approver: newValue?.id || "",
                  });
                }}
                disabled={loading}
                sx={{ width: '100%' }}
                renderInput={(params) => {
                  const isEmpty = !formData.level1Approver;
                  return (
                    <TextField
                      {...params}
                      label="Level 1 Approver"
                      placeholder={isEmpty ? "None" : ""}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                ListboxProps={{
                  style: { maxHeight: 200 },
                }}
              />
            </Grid>

            {/* Level 2 Approver */}
            <Grid item xs={12} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={
                  employees.find((emp) => emp.id === formData.level2Approver) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    level2Approver: newValue?.id || "",
                  });
                }}
                disabled={loading}
                sx={{ width: '100%' }}
                renderInput={(params) => {
                  const isEmpty = !formData.level2Approver;
                  return (
                    <TextField
                      {...params}
                      label="Level 2 Approver"
                      placeholder={isEmpty ? "None" : ""}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                ListboxProps={{
                  style: { maxHeight: 200 },
                }}
              />
            </Grid>

            {/* Level 3 Approver */}
            <Grid item xs={12} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={
                  employees.find((emp) => emp.id === formData.level3Approver) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    level3Approver: newValue?.id || "",
                  });
                }}
                disabled={loading}
                sx={{ width: '100%' }}
                renderInput={(params) => {
                  const isEmpty = !formData.level3Approver;
                  return (
                    <TextField
                      {...params}
                      label="Level 3 Approver"
                      placeholder={isEmpty ? "None" : ""}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                ListboxProps={{
                  style: { maxHeight: 200 },
                }}
              />
            </Grid>

            {/* Level 4 Approver */}
            <Grid item xs={12} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={
                  employees.find((emp) => emp.id === formData.level4Approver) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    level4Approver: newValue?.id || "",
                  });
                }}
                disabled={loading}
                sx={{ width: '100%' }}
                renderInput={(params) => {
                  const isEmpty = !formData.level4Approver;
                  return (
                    <TextField
                      {...params}
                      label="Level 4 Approver"
                      placeholder={isEmpty ? "None" : ""}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                ListboxProps={{
                  style: { maxHeight: 200 },
                }}
              />
            </Grid>

            {/* Level 5 Approver */}
            <Grid item xs={12} width={'250px'}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={
                  employees.find((emp) => emp.id === formData.level5Approver) ||
                  null
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    level5Approver: newValue?.id || "",
                  });
                }}
                disabled={loading}
                sx={{ width: '100%' }}
                renderInput={(params) => {
                  const isEmpty = !formData.level5Approver;
                  return (
                    <TextField
                      {...params}
                      label="Level 5 Approver"
                      placeholder={isEmpty ? "None" : ""}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                ListboxProps={{
                  style: { maxHeight: 200 },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployeeMeritModal;
