import { useState } from "react";
import { TextField, Button, Stack, Typography, Alert, Paper } from "@mui/material";
import type { WasmAnalyzer } from "../wasmLoader";

// this component searches for an ip using the real c++ lookupIP function.
interface Props {
  analyzer: WasmAnalyzer;
}

function LookupIP({ analyzer }: Props) {
  const [searchIp, setSearchIp] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<{ ip: string; riskScore: number; attemptCount: number } | null>(null);

  // this function calls the real compiled c++ lookupIP function.
  // the c++ side returns riskScore of -1 when the ip was never seen.
  const handleSearch = () => {
    const record = analyzer.lookupIP(searchIp);

    if (record.riskScore === -1) {
      setNotFound(true);
      setResult(null);
      return;
    }

    setNotFound(false);
    setResult(record);
  };

  return (
    <Stack spacing={2}>
      <TextField label="Enter IP address to look up" value={searchIp} onChange={(e) => setSearchIp(e.target.value)} fullWidth />
      <Button variant="contained" onClick={handleSearch}>
        Look Up
      </Button>

      {notFound && <Alert severity="warning">That ip has not been seen.</Alert>}

      {result && (
        <Paper elevation={1} sx={{ padding: 2 }}>
          <Typography>IP: {result.ip}</Typography>
          <Typography>Risk Score: {result.riskScore}</Typography>
          <Typography>Attempt Count: {result.attemptCount}</Typography>
        </Paper>
      )}
    </Stack>
  );
}

export default LookupIP;