import { Typography, Paper, Box } from "@mui/material";
import type { WasmAnalyzer } from "../wasmLoader";

// this component displays the real c++ getTrackedCount result.
interface Props {
  analyzer: WasmAnalyzer;
  refreshKey: number;
}

function TrackedCount({ analyzer, refreshKey }: Props) {
  const count = analyzer.getTrackedCount();

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        Refresh count: {refreshKey}
      </Typography>
      <Paper elevation={1} sx={{ padding: 3, textAlign: "center" }}>
        <Typography variant="h3">{count}</Typography>
        <Typography variant="body1" color="text.secondary">
          Tracked IP Addresses
        </Typography>
      </Paper>
    </Box>
  );
}

export default TrackedCount;