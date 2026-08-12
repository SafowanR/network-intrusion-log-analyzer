import { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel, Stack, Alert } from "@mui/material";
import type { WasmAnalyzer } from "../wasmLoader";

// this component collects the same 4 inputs as the console version's
// addConnectionEntry function, then calls the real c++ function directly.
interface Props {
  analyzer: WasmAnalyzer;
  onAdded: () => void;
}

function AddConnectionForm({ analyzer, onAdded }: Props) {
  const [ip, setIp] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [port, setPort] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // this function validates input, then calls the real compiled
  // c++ processConnection function directly through the wasm module.
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

    // this line runs real c++ code, compiled and executing inside the browser.
    analyzer.processConnection(ip, timestamp, portNumber, flagged);

    setError("");
    setSuccess(true);
    setIp("");
    setTimestamp("");
    setPort("");
    setFlagged(false);

    onAdded();
  };

  return (
    <Stack spacing={2}>
      <TextField label="IP Address" value={ip} onChange={(e) => setIp(e.target.value)} fullWidth />
      <TextField
        label="Timestamp"
        placeholder="2026-08-12 10:00"
        value={timestamp}
        onChange={(e) => setTimestamp(e.target.value)}
        fullWidth
      />
      <TextField label="Port" value={port} onChange={(e) => setPort(e.target.value)} fullWidth />
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