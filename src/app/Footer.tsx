import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      style={{
        backgroundColor: "#1e1e1e",
        height: "56px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <Typography>
        Copyright © 2022 Algorand Casino. All Rights Reserved.
      </Typography> */}
      <img
        src="/images/logo.png"
        alt="Algorand Casino Logo"
        // width="100%"
        height="48px"
      />
    </Box>
  );
};

export default Footer;
