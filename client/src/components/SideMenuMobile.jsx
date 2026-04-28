import Avatar from "@mui/material/Avatar";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useColorScheme } from "@mui/material/styles";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import NotificationPanel from "./NotificationPanel";
import { selectUser } from "../store/slices/userSlice";
import logo from "../assets/logo.png";
import logoBlack from "../assets/logo_black.png";
import api from "../utils/api";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/userSlice";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

function SideMenuMobile({ open, toggleDrawer }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mode, systemMode } = useColorScheme();
  const user = useSelector(selectUser);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);

  // Determine the actual mode being used (system preference or user selection)
  const resolvedMode = (mode === "system" ? systemMode : mode) || "light";

  // Determine which logo to use based on resolved theme mode
  // Use logo.png (white/light logo) for dark mode
  // Use logoBlack.png (dark logo) for light mode
  const currentLogo = resolvedMode === "dark" ? logo : logoBlack;

  // Get user initials for avatar
  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  };

  const displayName = user?.fullName
    || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null)
    || user?.firstName
    || user?.name
    || "User";

  const handleLogout = async () => {
    setOpenLogoutConfirm(false);
    try {
      await api.post("/v2/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none",
          backgroundColor: "background.paper",
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: "70dvw",
          height: "100%",
        }}
      >
        <Stack
          direction="row"
          sx={{ p: 2, pb: 0, gap: 1, alignItems: "center" }}
        >
          <img
            src={currentLogo}
            alt="Logo"
            style={{
              maxHeight: "40px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Stack>
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: "center", flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={displayName}
              sx={{ width: 24, height: 24, bgcolor: "primary.main" }}
            >
              {getInitials(user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim())}
            </Avatar>
            <Typography component="p" variant="h6">
              {displayName}
            </Typography>
          </Stack>
          <NotificationPanel iconSize="small" />
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <CardAlert />
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={() => setOpenLogoutConfirm(true)}
          >
            Logout
          </Button>
        </Stack>

        <Dialog
          open={openLogoutConfirm}
          onClose={() => setOpenLogoutConfirm(false)}
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
        >
          <DialogTitle id="logout-dialog-title">{"Confirm Logout"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="logout-dialog-description">
              Are you sure you want to log out? Any unsaved changes may be lost.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLogoutConfirm(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleLogout} color="error" variant="contained" autoFocus>
              Logout
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};

export default SideMenuMobile;
