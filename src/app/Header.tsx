import { WhatIsThis } from "@/components/WhatIsThis";
import { Box, Typography } from "@mui/material";

interface HeaderProps {
  title: string;
  whatIsThisContent?: React.ReactNode;
}

export const Header = ({ title, whatIsThisContent }: HeaderProps) => {
  return (
    <Box component="header" paddingBottom={2}>
      <Typography variant="h4" color="text.primary" paddingBottom={2}>
        {title}
      </Typography>
      {whatIsThisContent && <WhatIsThis>{whatIsThisContent}</WhatIsThis>}
    </Box>
  );
};
