import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectIsSignTxnOpen, setIsSignTxnOpen } from "../features/appSlice";

const SignTransactionModal = () => {
  const dispatch = useAppDispatch();

  const isModalOpen = useAppSelector(selectIsSignTxnOpen);

  const setIsModalOpen = async (isModalOpen: boolean) => {
    dispatch(setIsSignTxnOpen(isModalOpen));
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={(_event: unknown, reason: unknown) => {
        if (reason && reason === "backdropClick") return;

        setIsModalOpen(false);
      }}
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Sign the transaction
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack
          sx={{ p: 2 }}
          spacing={1}
          justifyContent="center"
          alignItems={"center"}
        >
          <CircularProgress />
        </Stack>
        <DialogContentText>
          Please check your wallet and sign the transaction to proceed.
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

export default SignTransactionModal;
