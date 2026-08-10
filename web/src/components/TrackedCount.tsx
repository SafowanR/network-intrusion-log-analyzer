import { Typography, Paper, Box } from "@mui/material";
import { LogAnalyzer } from "../models/LogAnalyzer";

// this component is the equivalent of the "Show tracked ip count" menu option in main.cpp.
// it just calls getTrackedCount and displays the number.
interface Props {
  analyzer: LogAnalyzer;
  refreshKey: number;
}

function TrackedCount({ analyzer, refreshKey }: Props) {
  // refreshKey being read here forces this component to recompute
  // the count whenever the parent app signals that data changed.
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