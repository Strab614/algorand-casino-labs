import { useAppDispatch } from "@/app/hooks";
import { addNotification, clearNotification } from "@/features/appSlice";
import { AlertColor } from "@mui/material";

export const useNotification = () => {
  const dispatch = useAppDispatch();

  const display = (notificationPartial: {
    type: AlertColor;
    message: string;
  }) => {
    dispatch(addNotification(notificationPartial));
  };

  const clear = () => {
    dispatch(clearNotification());
  };

  return { display, clear } as const;
};
