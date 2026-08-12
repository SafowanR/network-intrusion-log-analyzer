import { useState } from "react";
import { Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { runWasmPerformanceComparison } from "../wasmLoader";
import type { WasmPerformanceResult } from "../wasmLoader";

// this component runs the real c++ performance comparison through the wasm module.
function PerformancePanel() {
  const [results, setResults] = useState<WasmPerformanceResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunComparison = () => {
    setRunning(true);
    setTimeout(() => {
      const comparisonResults = runWasmPerformanceComparison();
      setResults(comparisonResults);
      setRunning(false);
    }, 50);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Times inserting and looking up 1,000 ip addresses in both structures, using the real compiled C++ code.
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