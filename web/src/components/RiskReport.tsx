import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { LogAnalyzer } from "../models/LogAnalyzer";

// this component is the equivalent of the printRiskReport function in main.cpp.
// it calls getRiskReport, which runs the avl tree's in order traversal.
interface Props {
  analyzer: LogAnalyzer;
  refreshKey: number;
}

function RiskReport({ analyzer, refreshKey }: Props) {
  // refreshKey being read here forces this component to recompute
  // the report whenever the parent app signals that data changed.
  const records = analyzer.getRiskReport();

  return (
    <>
      <Typography variant="body2" sx={{ marginBottom: 2 }}>
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
                <TableRow key={record.getIP()}>
                  <TableCell>{record.getIP()}</TableCell>
                  <TableCell align="right">{record.getRiskScore()}</TableCell>
                  <TableCell align="right">{record.getAttemptCount()}</TableCell>
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