import { useRef, useState } from "react";
import { Box, Tabs, Tab, Typography, Container, Paper } from "@mui/material";
import { LogAnalyzer } from "./models/LogAnalyzer";
import AddConnectionForm from "./components/AddConnectionForm";
import LookupIP from "./components/LookupIP";
import RiskReport from "./components/RiskReport";
import TrackedCount from "./components/TrackedCount";
import TestSuitePanel from "./components/TestSuitePanel";
import PerformancePanel from "./components/PerformancePanel";

// this is the main app component, same role as main.cpp's menu loop.
// it holds one shared logAnalyzer instance, same as the c++ version holding one analyzer object.
function App() {
  // useRef keeps the same logAnalyzer instance alive across renders
  // without triggering a re-render every time it changes internally.
  const analyzerRef = useRef(new LogAnalyzer());

  // this tracks which tab the user currently has open, same idea as
  // the menu choice number in the c++ console version.
  const [activeTab, setActiveTab] = useState(0);

  // this forces a re-render whenever the analyzer's data changes,
  // since react does not automatically detect changes inside a plain class instance.
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ paddingTop: 4, paddingBottom: 4 }}>
      <Typography variant="h4" gutterBottom>
        Network Intrusion Log Analyzer
      </Typography>

      <Paper elevation={2}>
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
            <AddConnectionForm analyzer={analyzerRef.current} onAdded={triggerRefresh} />
          )}
          {activeTab === 1 && <LookupIP analyzer={analyzerRef.current} refreshKey={refreshKey} />}
          {activeTab === 2 && <RiskReport analyzer={analyzerRef.current} refreshKey={refreshKey} />}
          {activeTab === 3 && <TrackedCount analyzer={analyzerRef.current} refreshKey={refreshKey} />}
          {activeTab === 4 && <TestSuitePanel />}
          {activeTab === 5 && <PerformancePanel />}
        </Box>
      </Paper>
    </Container>
  );
}

export default App;