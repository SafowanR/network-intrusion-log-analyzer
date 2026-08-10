import { useState } from "react";
import { Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { runComparison } from "../utils/performanceTest";
import type { PerformanceResult } from "../utils/performanceTest";
// this component is the equivalent of case 6 in main.cpp's switch statement.
// it calls runComparison and displays timing results in a table.
function PerformancePanel() {
  const [results, setResults] = useState<PerformanceResult[] | null>(null);
  const [running, setRunning] = useState(false);

  // this function runs the performance comparison, same as creating a
  // PerformanceTest object and calling runComparison in the c++ version.
  const handleRunComparison = () => {
    setRunning(true);
    // settimeout lets the "running" message render before the heavy loop blocks the browser.
    setTimeout(() => {
      const comparisonResults = runComparison();
      setResults(comparisonResults);
      setRunning(false);
    }, 50);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Times inserting and looking up 1,000 ip addresses in both structures.
      </Typography>

      <Button variant="contained" onClick={handleRunComparison} disabled={running}>
        {running ? "Running..." : "Run Performance Comparison"}
      </Button>

      {results && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Operation</TableCell>
                <TableCell align="right">Hash Table (us)</TableCell>
                <TableCell align="right">AVL Tree (us)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.operation}>
                  <TableCell>{result.operation}</TableCell>
                  <TableCell align="right">{result.hashTableTime.toFixed(2)}</TableCell>
                  <TableCell align="right">{result.avlTreeTime.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}

export default PerformancePanel;