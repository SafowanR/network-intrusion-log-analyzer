import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import type { WasmAnalyzer } from "../wasmLoader";

// this component calls the real c++ getRiskReport function,
// which runs the actual avl tree's in order traversal.
interface Props {
  analyzer: WasmAnalyzer;
  refreshKey: number;
}

function RiskReport({ analyzer, refreshKey }: Props) {
  // refreshKey being read here forces this component to recompute
  // the report whenever the parent app signals that data changed.
  const reportVector = analyzer.getRiskReport();
  const records = [];
  for (let i = 0; i < reportVector.size(); i++) {
    records.push(reportVector.get(i));
  }

  return (
    <>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", marginBottom: 2 }}>
        Refresh count: {refreshKey}
      </Typography>

      {records.length === 0 ? (
        <Typography>No ip addresses tracked yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>IP Address</TableCell>
                <TableCell align="right">Risk Score</TableCell>
                <TableCell align="right">Attempts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.ip}>
                  <TableCell>{record.ip}</TableCell>
                  <TableCell align="right">{record.riskScore}</TableCell>
                  <TableCell align="right">{record.attemptCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

export default RiskReport;