import { ExpandLess, ExpandMore, HelpOutline } from "@mui/icons-material";
import { Paper, Box, Typography, Collapse, IconButton } from "@mui/material";
import { useState } from "react";

export interface Props {
  children?: React.ReactNode;
}

// convenience function to wrap "what is this" helper
export const WhatIsThis = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Paper
      elevation={3}
      sx={{ px: 2, py: 1, backgroundColor: "secondary.main" }}
    >
      <Box
        component={"div"}
        sx={{
          display: "flex",
          flex: 1,
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flex: 1,
            alignItems: "center",
          }}
        >
          <HelpOutline />
          <Typography variant="h6" color="text.primary" sx={{ paddingLeft: 1 }}>
            What is this?
          </Typography>
        </Box>
        <IconButton onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </Paper>
  );
};
