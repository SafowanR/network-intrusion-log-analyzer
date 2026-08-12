// import the real material design components we're using.
// this registers them as real html elements the browser understands.
import "@material/web/tabs/tabs.js";
import "@material/web/tabs/primary-tab.js";
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/button/filled-button.js";
import "@material/web/checkbox/checkbox.js";
import "@material/web/elevation/elevation.js";

// these describe the shape of data coming back from the real c++ code.
interface WasmIPRecord {
  ip: string;
  riskScore: number;
  attemptCount: number;
}

interface WasmTestResult {
  name: string;
  passed: boolean;
  detail: string;
}

interface WasmPerformanceResult {
  operation: string;
  hashTableTime: number;
  avlTreeTime: number;
}

// this holds the real c++ analyzer object once the wasm module finishes loading.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let wasmModule: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let analyzer: any = null;

// this tracks how many flagged connections have been added, for the kpi card.
let flaggedCount = 0;

// this function loads the compiled c++ module into the browser.
// it runs once when the page first loads.
function loadWasmModule(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = import.meta.env.BASE_URL + "app.js";
    script.onload = () => {
      // @ts-expect-error - Module is created globally by the compiled app.js file.
      Module.onRuntimeInitialized = () => {
        // @ts-expect-error - Module is created globally by the compiled app.js file.
        wasmModule = Module;
        analyzer = new wasmModule.WebLogAnalyzer();
        resolve();
      };
    };
    script.onerror = () => reject(new Error("Failed to load app.js"));
    document.body.appendChild(script);
  });
}

// this function switches which panel is visible based on which tab was clicked.
function showPanel(panelId: string) {
  const allPanels = document.querySelectorAll(".panel");
  allPanels.forEach((panel) => {
    (panel as HTMLElement).style.display = "none";
  });
  const target = document.getElementById(panelId);
  if (target) {
    target.style.display = "flex";
  }
}

// this function wires up the tab bar so clicking a tab shows the right panel.
function setupTabs() {
  const tabs = document.getElementById("mainTabs");
  const panelIds = [
    "panel-add",
    "panel-lookup",
    "panel-risk",
    "panel-count",
    "panel-tests",
    "panel-perf",
  ];

  tabs?.addEventListener("change", () => {
    const activeTab = (tabs as unknown as { activeTabIndex: number }).activeTabIndex;
    showPanel(panelIds[activeTab]);

    // refresh data automatically when switching to certain tabs.
    if (panelIds[activeTab] === "panel-risk") {
      renderRiskReport();
    }
    if (panelIds[activeTab] === "panel-count") {
      renderTrackedCount();
    }
  });
}

// this function reads the add connection form and calls the real c++ function.
function setupAddConnection() {
  const submitBtn = document.getElementById("addSubmitBtn");
  const messageDiv = document.getElementById("addMessage") as HTMLDivElement;

  submitBtn?.addEventListener("click", () => {
    const ipField = document.getElementById("addIp") as any;
    const timestampField = document.getElementById("addTimestamp") as any;
    const portField = document.getElementById("addPort") as any;
    const flaggedField = document.getElementById("addFlagged") as any;

    const ip = ipField.value;
    const timestamp = timestampField.value;
    const port = Number(portField.value);
    const flagged = flaggedField.checked;

    if (!ip || ip.trim() === "") {
      messageDiv.textContent = "Please enter an ip address.";
      messageDiv.className = "message error";
      return;
    }

    if (isNaN(port) || portField.value.trim() === "") {
      messageDiv.textContent = "Port must be a number.";
      messageDiv.className = "message error";
      return;
    }

    // this measures how long the real compiled c++ call actually takes.
    const startTime = performance.now();

    // this line runs real, compiled c++ code directly.
    analyzer.processConnection(ip, timestamp, port, flagged);

    const endTime = performance.now();
    const latency = ((endTime - startTime) * 1000).toFixed(2);

    if (flagged) {
      flaggedCount++;
    }

    // update the kpi stat cards with fresh live data.
    document.getElementById("statTrackedIPs")!.textContent = String(analyzer.getTrackedCount());
    document.getElementById("statFlaggedCount")!.textContent = String(flaggedCount);
    document.getElementById("statLatency")!.textContent = latency;

    messageDiv.textContent = "Connection entry added.";
    messageDiv.className = "message visible";

    // hide the toast automatically after 2 seconds.
    setTimeout(() => {
      messageDiv.className = "message";
    }, 2000);

    ipField.value = "";
    timestampField.value = "";
    portField.value = "";
    flaggedField.checked = false;
  });
}

// this function looks up an ip using the real c++ lookupIP function.
function setupLookup() {
  const lookupBtn = document.getElementById("lookupBtn");
  const resultDiv = document.getElementById("lookupResult") as HTMLDivElement;

  lookupBtn?.addEventListener("click", () => {
    const ipField = document.getElementById("lookupIp") as any;
    const ip = ipField.value;

    const record: WasmIPRecord = analyzer.lookupIP(ip);

    if (record.riskScore === -1) {
      resultDiv.innerHTML = "<p>That ip has not been seen.</p>";
      return;
    }

    resultDiv.innerHTML = `
      <p>IP: ${record.ip}</p>
      <p>Risk Score: ${record.riskScore}</p>
      <p>Attempt Count: ${record.attemptCount}</p>
    `;
  });
}

// this function calls the real c++ getRiskReport function and builds the table.
function renderRiskReport() {
  const tbody = document.getElementById("riskTableBody") as HTMLTableSectionElement;
  const reportVector = analyzer.getRiskReport();

  let rowsHTML = "";
  for (let i = 0; i < reportVector.size(); i++) {
    const record: WasmIPRecord = reportVector.get(i);
    rowsHTML += `<tr><td>${record.ip}</td><td>${record.riskScore}</td><td>${record.attemptCount}</td></tr>`;
  }

  tbody.innerHTML = rowsHTML || "<tr><td colspan='3'>No ip addresses tracked yet.</td></tr>";
}

// this function calls the real c++ getTrackedCount function.
function renderTrackedCount() {
  const countDiv = document.getElementById("countNumber") as HTMLDivElement;
  countDiv.textContent = String(analyzer.getTrackedCount());
}

// this function runs the real c++ test suite and displays the results.
function setupTestSuite() {
  const runBtn = document.getElementById("runTestsBtn");
  const table = document.getElementById("testTable") as HTMLTableElement;
  const tbody = document.getElementById("testResultsBody") as HTMLTableSectionElement;

  runBtn?.addEventListener("click", () => {
    const resultsVector = wasmModule.runTestSuite();
    let rowsHTML = "";
    for (let i = 0; i < resultsVector.size(); i++) {
      const result: WasmTestResult = resultsVector.get(i);
      const label = result.detail ? `${result.name} (${result.detail})` : result.name;
      const chipClass = result.passed ? "pass" : "fail";
      const chipText = result.passed ? "PASS" : "FAIL";
      rowsHTML += `<tr><td>${label}</td><td><span class="chip ${chipClass}">${chipText}</span></td></tr>`;
    }
    tbody.innerHTML = rowsHTML;
    table.style.display = "table";
  });
}

// this function runs the real c++ performance comparison and displays the table.
function setupPerformance() {
  const runBtn = document.getElementById("runPerfBtn");
  const table = document.getElementById("perfTable") as HTMLTableElement;
  const tbody = document.getElementById("perfTableBody") as HTMLTableSectionElement;

  runBtn?.addEventListener("click", () => {
    const resultsVector = wasmModule.runPerformanceComparison();
    let rowsHTML = "";
    for (let i = 0; i < resultsVector.size(); i++) {
      const result: WasmPerformanceResult = resultsVector.get(i);
      rowsHTML += `<tr><td>${result.operation}</td><td>${result.hashTableTime.toFixed(2)}</td><td>${result.avlTreeTime.toFixed(2)}</td></tr>`;
    }
    tbody.innerHTML = rowsHTML;
    table.style.display = "table";
  });
}

// this runs once the page and the wasm module are both ready.
async function init() {
  setupMatrixBackground();
  try {
    await loadWasmModule();
  } catch (error) {
    document.body.innerHTML = '<div style="padding: 40px; text-align: center; color: #F2B8B5; font-family: sans-serif;"><h2>Failed to load the application engine.</h2><p>Please refresh the page. If this keeps happening, check the browser console for details.</p></div>';
    console.error(error);
    return;
  }
  setupTabs();
  setupAddConnection();
  setupLookup();
  setupTestSuite();
  setupPerformance();
}

// this function draws an animated matrix style falling code effect
// on a canvas that sits behind everything else on the page.
function setupMatrixBackground() {
  const canvas = document.getElementById("matrixCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const katakana = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
  const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const characters = katakana + latin + nums;
  const fontSize = 16;
  let columns = Math.floor(canvas.width / fontSize);
  let drops: number[] = new Array(columns).fill(1);

  // give each column a random starting height so the effect looks
  // already in progress instead of starting from a blank screen.
  for (let i = 0; i < drops.length; i++) {
    drops[i] = Math.floor(Math.random() * (canvas.height / fontSize));
  }

  function draw() {
    // this semi transparent fill creates the fading trail effect behind each character.
    ctx.fillStyle = "rgba(28, 27, 31, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#D0BCFF";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt(Math.floor(Math.random() * characters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  // run several frames immediately so the screen starts already full
  // instead of slowly fading in from blank over the first few seconds.
  for (let i = 0; i < 40; i++) {
    draw();
  }

  setInterval(draw, 50);
}

init();