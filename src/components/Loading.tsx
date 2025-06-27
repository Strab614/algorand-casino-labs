import { Box, CircularProgress, Typography } from "@mui/material";

const Loading = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "200px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          alignItems: "center",
          backgroundColor: "#1e1e1e",
          width: "355px",
          height: "100%",
          borderRadius: "4px",
        }}
      >
        <Typography variant="h6">Loading...</Typography>
        <CircularProgress />
      </Box>
    </Box>
  );
};

export default Loading;
