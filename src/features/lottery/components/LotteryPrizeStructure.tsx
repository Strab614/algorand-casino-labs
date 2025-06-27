import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function createData(matches: number, odds: string, prize: string) {
  return { matches, odds, prize };
}

const rows = [
  createData(5, "1 in 2,118,760", "prize pool split between winners"),
  createData(4, "1 in 9,417", "25,000 chip"),
  createData(3, "1 in 214.1", "1000 chip"),
  createData(2, "1 in 14.9", "300 chip"),
];

export function LotteryPrizeStructure() {
  return (
    <TableContainer
      component={Paper}
      sx={{ border: "0.5px solid" }}
      elevation={3}
    >
      <Table
        sx={{
          minWidth: "350px",
        }}
        aria-label="simple table"
      >
        <TableHead sx={{ backgroundColor: "#1e1e1e" }}>
          <TableRow>
            <TableCell>Matches</TableCell>
            <TableCell align="right">Odds</TableCell>
            <TableCell align="right">Prize</TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ backgroundColor: "#121212" }}>
          {rows.map((row) => (
            <TableRow
              key={row.matches}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.matches}
              </TableCell>
              <TableCell align="right">{row.odds}</TableCell>
              <TableCell align="right">{row.prize}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
