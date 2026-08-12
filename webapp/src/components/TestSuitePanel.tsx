import { useState } from "react";
import { Button, Stack, Typography, Chip, Paper } from "@mui/material";
import { runWasmTestSuite } from "../wasmLoader";
import type { WasmTestResult } from "../wasmLoader";

// this component runs the real c++ test suite through the wasm module.
function TestSuitePanel() {
  const [results, setResults] = useState<WasmTestResult[] | null>(null);

  const handleRunTests = () => {
    const testResults = runWasmTestSuite();
    setResults(testResults);
  };

  return (
    <Stack spacing={2}>
      <Button variant="contained" onClick={handleRunTests}>
        Run Test Suite
      </Button>

      {results && (
        <Stack spacing={1}>
          {results.map((result) => (
            <Paper
              key={result.name}
              elevation={1}
              sx={{ padding: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography>
                {result.name}
                {result.detail && ` (${result.detail})`}
              </Typography>
              <Chip label={result.passed ? "PASS" : "FAIL"} color={result.passed ? "success" : "error"} />
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default TestSuitePanel;