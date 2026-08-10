import { useState } from "react";
import { Button, Stack, Typography, Chip, Paper } from "@mui/material";
import { runAllTests } from "../utils/testSuite";
import type { TestResult } from "../utils/testSuite";
// this component is the equivalent of case 5 in main.cpp's switch statement.
// it calls runAllTests and displays each result with a pass or fail chip.
function TestSuitePanel() {
  const [results, setResults] = useState<TestResult[] | null>(null);

  // this function runs the test suite, same as creating a TestSuite object
  // and calling runAllTests in the c++ version.
  const handleRunTests = () => {
    const testResults = runAllTests();
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
            <Paper key={result.name} elevation={1} sx={{ padding: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography>
                {result.name}
                {result.detail && ` (${result.detail})`}
              </Typography>
              <Chip
                label={result.passed ? "PASS" : "FAIL"}
                color={result.passed ? "success" : "error"}
              />
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default TestSuitePanel;