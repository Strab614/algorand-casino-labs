import { Avatar } from "@mui/material";

export interface Props {
  n?: number; // user
  matches?: boolean; // should be marked as a match or not
}

export const SingleLotteryNumber = ({ n, matches }: Props) => {
  return (
    <Avatar
      alt={n?.toString()}
      sx={{ border: `4px solid ${matches ? "gold" : "white"}`, color: "white" }}
    >
      {n ? n.toString() : "?"}
    </Avatar>
  );
};
