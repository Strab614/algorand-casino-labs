import { Box, Typography } from "@mui/material";

export interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => (
  <Box
    sx={{
      display: "flex",
      height: "100px",
      width: "100%",
      background:
        "radial-gradient(circle, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)",
    }}
  >
    <Typography variant="h3" margin={"auto"}>
      {title}
    </Typography>
  </Box>
);

export default Header;
