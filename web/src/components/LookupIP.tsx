import { useState } from "react";
import { TextField, Button, Stack, Typography, Alert, Paper } from "@mui/material";
import { LogAnalyzer } from "../models/LogAnalyzer";

// this component is the equivalent of the lookupIPEntry function in main.cpp.
// it searches the hash table through the analyzer and displays the result.
interface Props {
  analyzer: LogAnalyzer;
  refreshKey: number;
}

function LookupIP({ analyzer }: Props) {
  const [searchIp, setSearchIp] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<{
    ip: string;
    riskScore: number;
    attemptCount: number;
  } | null>(null);

  // this function calls lookupIP on the analyzer, same as the c++ version.
  const handleSearch = () => {
    const record = analyzer.lookupIP(searchIp);

    if (record === null) {
      setNotFound(true);
      setResult(null);
      return;
    }

    setNotFound(false);
    setResult({
      ip: record.getIP(),
      riskScore: record.getRiskScore(),
      attemptCount: record.getAttemptCount(),
    });
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="Enter IP address to look up"
        value={searchIp}
        onChange={(e) => setSearchIp(e.target.value)}
        fullWidth
      />
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