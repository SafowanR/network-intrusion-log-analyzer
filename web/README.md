# Network Intrusion Log Analyzer — Web Version

A React + TypeScript reimplementation of the CISC 220 final project. Same hash table, AVL tree, and connection tracking logic, rebuilt for the browser with a Material UI interface instead of a console menu.

This version is a personal expansion built after the graded C++ submission (tagged `submission-v1` on the `main` branch). All core logic was translated feature for feature, not simplified.

## Stack

- React + TypeScript
- Vite
- Material UI (MUI)

## Features

- Add a connection log entry
- Look up an IP address
- View the risk report (AVL tree in order traversal)
- View tracked IP count
- Run the automated test suite
- Run the hash table vs AVL tree performance comparison

## Architecture

- `src/models/IPRecord.ts` — per IP data and connection history
- `src/models/AVLTree.ts` — custom AVL tree, same rotation logic as the C++ version
- `src/models/LogAnalyzer.ts` — owns the hash table (`Map`) and the AVL tree, keeps both in sync
- `src/utils/testSuite.ts` — automated tests, insert, delete, search, balancing, collision handling
- `src/utils/performanceTest.ts` — timing comparison between the hash table and AVL tree
- `src/components/` — one component per feature, replacing the console menu options

## Challenges solved

- **Interface import crashing the app at runtime.** TypeScript interfaces like `TestResult` and `PerformanceResult` only exist at compile time. Importing them as regular values worked fine in the editor but threw a runtime error in the browser, since the interface does not exist in the compiled JavaScript. Fixed by switching to type only imports (`import type { ... }`), which tells TypeScript to strip the import out before the code ever reaches the browser.
- **Performance results reading zero.** `performance.now()` has limited precision in the browser, so a single pass over 1,000 records was too fast to register for quick operations like hash table lookups. Solved by repeating each timed operation 100 times and averaging the result, a standard benchmarking technique that produces stable, accurate numbers instead of noisy single-run readings.
- **Stale editor errors after adding new files.** VS Code's TypeScript language server occasionally caches an outdated view of the project, showing "module not found" errors for files that already exist. Resolved by restarting the TS server directly from the command palette instead of second guessing the file structure.

## Known limitations

- No backend or persistence, all data resets on page refresh since everything runs in memory in the browser
- Styling is functional, visual polish is still in progress

## Running locally

\`\`\`
npm install
npm run dev
\`\`\`
