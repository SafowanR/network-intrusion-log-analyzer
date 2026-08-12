// this file loads the compiled c++ webassembly module one time.
// everything else in the app asks this file for the module instead
// of loading it themselves, so we never load it twice by accident.

// this describes the shape of the risk report entries returned by c++.
export interface WasmIPRecord {
  ip: string;
  riskScore: number;
  attemptCount: number;
}

// this describes the shape of a single test result returned by c++.
export interface WasmTestResult {
  name: string;
  passed: boolean;
  detail: string;
}

// this describes the shape of a single performance timing result.
export interface WasmPerformanceResult {
  operation: string;
  hashTableTime: number;
  avlTreeTime: number;
}

// this describes the real c++ analyzer object once loaded into javascript.
export interface WasmAnalyzer {
  processConnection: (ip: string, timestamp: string, port: number, flagged: boolean) => void;
  lookupIP: (ip: string) => WasmIPRecord;
  getTrackedCount: () => number;
  getRiskReport: () => { size: () => number; get: (i: number) => WasmIPRecord };
}

// this holds the loaded module and the one shared analyzer instance,
// once they're ready. starts as null until loading finishes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let wasmModule: any = null;
let analyzerInstance: WasmAnalyzer | null = null;

// this function loads the compiled c++ module and creates one analyzer.
// it only actually loads once, even if called multiple times, since
// the browser caches the script after the first load.
export function loadWasmModule(): Promise<WasmAnalyzer> {
  return new Promise((resolve, reject) => {
    if (analyzerInstance !== null) {
      resolve(analyzerInstance);
      return;
    }

    const script = document.createElement("script");
    script.src = "/app.js";
    script.onload = () => {
        // @ts-expect-error - Module is created globally by the compiled app.js file.
      Module.onRuntimeInitialized = () => {
        // @ts-expect-error - Module is created globally by the compiled app.js file.
        wasmModule = Module;
        analyzerInstance = new wasmModule.WebLogAnalyzer();
        resolve(analyzerInstance as WasmAnalyzer);
      };
    };
    script.onerror = () => reject(new Error("Failed to load app.js"));
    document.body.appendChild(script);
  });
}

// this function runs the real c++ test suite and returns the results.
export function runWasmTestSuite(): WasmTestResult[] {
  if (!wasmModule) {
    throw new Error("Wasm module not loaded yet");
  }
  const resultsVector = wasmModule.runTestSuite();
  const results: WasmTestResult[] = [];
  for (let i = 0; i < resultsVector.size(); i++) {
    results.push(resultsVector.get(i));
  }
  return results;
}

// this function runs the real c++ performance comparison and returns the results.
export function runWasmPerformanceComparison(): WasmPerformanceResult[] {
  if (!wasmModule) {
    throw new Error("Wasm module not loaded yet");
  }
  const resultsVector = wasmModule.runPerformanceComparison();
  const results: WasmPerformanceResult[] = [];
  for (let i = 0; i < resultsVector.size(); i++) {
    results.push(resultsVector.get(i));
  }
  return results;
}