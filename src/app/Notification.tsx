import { useNotification } from "@/hooks/useNotification";
import { useAppSelector } from "./hooks";
import { selectNotification } from "@/features/appSlice";
import { Snackbar, Alert, SnackbarCloseReason } from "@mui/material";

export const Notification = () => {
  const { clear } = useNotification();
  const notification = useAppSelector(selectNotification);

  const handleClose = (_: unknown, reason?: SnackbarCloseReason) =>
    reason !== "clickaway" && clear();

  /* Fixed an issue where notification was empty and flickered */
  if (notification.message === "") {
    return null;
  }

  return (
    <Snackbar
      open={notification.open}
      onClose={handleClose}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        variant="filled"
        onClose={handleClose}
        severity={notification.type}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};
