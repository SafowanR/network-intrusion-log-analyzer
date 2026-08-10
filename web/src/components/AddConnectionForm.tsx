import { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel, Stack, Alert } from "@mui/material";
import { LogAnalyzer } from "../models/LogAnalyzer";

// this component is the equivalent of the addConnectionEntry function in main.cpp.
// it collects the same four inputs: ip, timestamp, port, and flagged status.
interface Props {
  analyzer: LogAnalyzer;
  onAdded: () => void;
}

function AddConnectionForm({ analyzer, onAdded }: Props) {
  const [ip, setIp] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [port, setPort] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // this function validates the port field before calling processConnection.
  // same idea as the while loop in main.cpp that rejected non number input.
  const handleSubmit = () => {
    setSuccess(false);

    if (ip.trim() === "") {
      setError("Please enter an ip address.");
      return;
    }

    const portNumber = Number(port);
    if (isNaN(portNumber) || port.trim() === "") {
      setError("Port must be a number.");
      return;
    }

    analyzer.processConnection(ip, timestamp, portNumber, flagged);

    setError("");
    setSuccess(true);
    setIp("");
    setTimestamp("");
    setPort("");
    setFlagged(false);

    // tells the parent app to refresh other tabs since data changed.
    onAdded();
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="IP Address"
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        fullWidth
      />
      <TextField
        label="Timestamp"
        placeholder="2026-07-29 10:00"
        value={timestamp}
        onChange={(e) => setTimestamp(e.target.value)}
        fullWidth
      />
      <TextField
        label="Port"
        value={port}
        onChange={(e) => setPort(e.target.value)}
        fullWidth
      />
      <FormControlLabel
        control={<Checkbox checked={flagged} onChange={(e) => setFlagged(e.target.checked)} />}
        label="Flagged as suspicious"
      />
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Connection entry added.</Alert>}
      <Button variant="contained" onClick={handleSubmit}>
        Add Connection
      </Button>
    </Stack>
  );
}

export default AddConnectionForm;