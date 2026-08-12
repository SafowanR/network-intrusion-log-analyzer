import { useEffect, useState } from "react";
import { Box, Tabs, Tab, Typography, Container, Paper, CircularProgress } from "@mui/material";
import { loadWasmModule } from "./wasmLoader";
import type { WasmAnalyzer } from "./wasmLoader";
import AddConnectionForm from "./components/AddConnectionForm";
import LookupIP from "./components/LookupIP";
import RiskReport from "./components/RiskReport";
import TrackedCount from "./components/TrackedCount";
import TestSuitePanel from "./components/TestSuitePanel";
import PerformancePanel from "./components/PerformancePanel";

// this is the main app component.
// it waits for the real c++ module to finish loading before showing the ui.
function App() {
  const [analyzer, setAnalyzer] = useState<WasmAnalyzer | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // this runs once when the app first starts, loading the compiled c++ module.
  useEffect(() => {
    loadWasmModule().then((loadedAnalyzer) => {
      setAnalyzer(loadedAnalyzer);
    });
  }, []);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // while the module is still loading, show a spinner instead of the app.
  if (analyzer === null) {
    return (
      <Container maxWidth="sm" sx={{ paddingTop: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ marginTop: 2 }}>Loading real C++ engine...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ paddingTop: 4, paddingBottom: 4 }}>
      <Typography variant="h4" gutterBottom>
        Network Intrusion Log Analyzer
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Powered by real, compiled C++ running as WebAssembly
      </Typography>

      <Paper elevation={2} sx={{ marginTop: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Add Connection" />
          <Tab label="Look Up IP" />
          <Tab label="Risk Report" />
          <Tab label="Tracked Count" />
          <Tab label="Test Suite" />
          <Tab label="Performance" />
        </Tabs>

        <Box sx={{ padding: 3 }}>
          {activeTab === 0 && (
            <AddConnectionForm analyzer={analyzer} onAdded={triggerRefresh} />
          )}
          {activeTab === 1 && <LookupIP analyzer={analyzer} />}
          {activeTab === 2 && <RiskReport analyzer={analyzer} refreshKey={refreshKey} />}
          {activeTab === 3 && <TrackedCount analyzer={analyzer} refreshKey={refreshKey} />}
          {activeTab === 4 && <TestSuitePanel />}
          {activeTab === 5 && <PerformancePanel />}
        </Box>
      </Paper>
    </Container>
  );
}

export default App;