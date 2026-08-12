# NILA — Network Intrusion Log Analyzer

**CISC 220 — Data Structures | Final Project | Safowan Raiyean**

## Overview

NILA models a simplified network intrusion detection log. It ingests IP connection events, tracks each source IP's history, and ranks IPs by a risk score so the most dangerous traffic surfaces immediately. The project was built entirely in C++20, compiled with g++ via MSYS2 on Windows, and satisfies the course's core data structure requirements — a hash table, a custom AVL tree, and a custom linked list — applied to a real, self-contained use case rather than a synthetic exercise.

An extra-credit web version also exists, running the same compiled C++ logic in the browser via WebAssembly. See [Web Version](#web-version-extra-credit) below.

## Main Features

- **Add Connection** — logs a new connection attempt for an IP (timestamp, port, flagged status), creating a new tracked IP or updating an existing one
- **Look Up IP** — retrieves a specific IP's current risk score and attempt count
- **Risk Report** — lists every tracked IP ranked by risk score, lowest to highest
- **Tracked Count** — reports how many unique IPs are currently being tracked
- **Automated Test Suite** *(bonus feature)* — runs 5 correctness checks against the real logic and prints PASS/FAIL results
- **Performance Comparison** *(bonus feature)* — benchmarks the hash table against the AVL tree on 1,000 records, averaged over 100 repetitions per timing
- **Menu-driven console interface** *(bonus feature)* — input validation on all numeric and required fields

## How the Hash Table and AVL Tree Are Used

Two structures track the same underlying IP data for two different purposes:

- **Hash table** (`std::unordered_map<string, IPRecord*>`, inside `LogAnalyzer`) — keyed by **IP address**. This is the fast path for "does this IP exist, and what's its record?" — average O(1) lookup and insert, regardless of how many IPs are tracked.
- **AVL tree** (custom-built, `AVLTree`) — keyed by **risk score**, not IP address. This keeps every tracked IP sorted and balanced by how dangerous it is, so the Risk Report (an in-order traversal) returns every IP in ascending risk order for free, and top-risk lookups stay O(log n) even as the dataset grows.

Both structures stay in sync on every connection: a new or updated connection updates the `IPRecord` in the hash table, then the AVL tree is updated to reflect the new risk score (see [Design Decisions](#important-classes-functions-and-design-decisions) for how this update is sequenced).

A third structure, a hand-built **singly linked list** inside each `IPRecord`, stores that IP's full connection history in chronological order (newest inserted at the head). It uses `next` pointers only — no `prev` — since nothing in the project ever needs to walk the history backward.

## Hashing Function and Collision-Handling Strategy

The hash table uses C++'s standard `std::unordered_map`, which the professor approved in place of a hand-built hash table for this project. Internally, it converts each IP address string to a bucket index via a hash-and-modulo strategy, and resolves collisions with **separate chaining** — colliding keys are linked together within the same bucket rather than overwriting one another. Because this is the standard library implementation, NILA's own code never manages load factor or rehashing directly; `unordered_map` handles that internally.

## Important Classes, Functions, and Design Decisions

| File | Role |
|---|---|
| `IPRecord.hpp/cpp` | Per-IP data: risk score, attempt count, and a singly linked list of that IP's connection history |
| `AVLTree.hpp/cpp` | Custom self-balancing BST keyed by risk score — insertion, search, deletion, and all four rotation cases (LL, RR, LR, RL) |
| `LogAnalyzer.hpp/cpp` | Hub class — owns the hash table and the AVL tree, and coordinates updates between them |
| `main.cpp` | Console menu and input validation |
| `TestSuite.hpp/cpp` | Five automated correctness tests (bonus feature) |
| `PerformanceTest.hpp/cpp` | Hash table vs. AVL tree timing comparison using `std::chrono` (bonus feature) |

**Rotation logic:** which rotation applies (single vs. double) is determined by checking the **balance factor of the heavier child** — `getBalance(current->left)` / `getBalance(current->right)` — not by comparing the value that was just inserted. This matches the course's taught methodology.

**Design decision — remove-before-mutate:** because the AVL tree is keyed by a value (risk score) that changes over time, updating an IP's risk requires removing its old tree entry, updating the score, then reinserting at the new position — in that exact order. See [Known Limitations](#known-limitations-and-unresolved-issues) and the bug writeup below for why the order matters.

**Memory ownership:** each class frees only what it directly owns, with no shared ownership between layers:
- `LogAnalyzer` allocates and owns every `IPRecord` (`new`/`delete`)
- `AVLTree` frees only its own tree nodes on destruction — never touches `IPRecord` memory
- `IPRecord` owns and frees its own connection-history linked list

Memory is managed manually throughout (no smart pointers), matching what the course has covered, and was verified leak-free via the automated test suite.

## Instructions for Compiling and Running

Requires a C++20-capable compiler (developed and tested with `g++` via MSYS2 UCRT64 on Windows).

```
g++ main.cpp LogAnalyzer.cpp AVLTree.cpp IPRecord.cpp TestSuite.cpp PerformanceTest.cpp -o nila
```

Then run the produced executable (`nila` on Linux/macOS, `nila.exe` on Windows) and use the console menu to add connections, look up IPs, generate the risk report, check the tracked count, or run the bonus test suite / performance comparison.

## Testing Performed and Sample Results

The bonus automated test suite (`TestSuite`) runs five isolated correctness checks against the real logic, each using fresh test data so it doesn't interfere with actual tracked records:

| Test | What it verifies | Result |
|---|---|---|
| `testInsert` | An inserted IP can be found afterward | PASS |
| `testDelete` | A risk score can be found via `contains()`, removed, and is then correctly reported as gone | PASS |
| `testSearch` | Looking up an IP that was never added correctly returns "not found" | PASS |
| `testBalancing` | Inserting 7 steadily-increasing risk scores (the worst case for an unbalanced tree — a plain BST would degrade to height 7) leaves the AVL tree's real height properly balanced | PASS |
| `testCollisionHandling` | Adding the same IP twice updates the existing record instead of creating a duplicate, with attempt count reflecting both entries | PASS |

All five tests pass on every run.

The bonus performance comparison benchmarks the hash table against the AVL tree by generating 1,000 unique fake IP records, then timing insert and lookup for both structures, each timing averaged over 100 repetitions for stable microsecond-level readings. Results consistently show the hash table outperforming the AVL tree on raw insert/lookup speed (expected — O(1) vs. O(log n)), while the AVL tree provides sorted, ranked access that the hash table cannot offer at all.

## Known Limitations and Unresolved Issues

- **Single-session, single-user data only.** All tracked IPs live in memory for the current run and reset when the program closes — there's no file or database persistence. This was an intentional scope decision (see below), but it also means the AVL tree's balancing behavior is only ever demonstrated against whatever data one person types into a single session. In a live demo with only a handful of manually entered connections, the tree ends up small and the risk scores cluster around the same few values (since the current scoring formula is a simple +1 / +10 accumulator), which can make the tree look "basic" even though the underlying balancing logic is fully general and is proven at scale by `testBalancing` and the 1,000-record performance test. **A meaningful improvement would be to support multiple users or data sources feeding into the same tracked dataset** — e.g. persisting records to a file or lightweight database — so the hash table and AVL tree are working against a larger, more varied, and more realistic dataset than a single demo session can produce.
- **No IP format validation.** The IP address field accepts any string as-is; there's no check that it's a well-formed IPv4/IPv6 address. Numeric fields (like port) are validated, but the IP itself is not.
- **File persistence and graph-based features were explicitly out of scope** for this project and were not attempted.
- A real bug was found and fixed during development: updating an IP's risk score originally mutated the score *before* removing the old AVL tree entry, so the removal search looked for a value that no longer existed anywhere, leaving stale duplicate entries in the tree. The fix — remove the old entry first, then mutate, then reinsert — is now the standing pattern for any code that updates a value used as both a search key and mutable state.

## Web Version (Extra Credit)

Beyond the core console requirements, the same compiled C++ logic (not a rewrite) was compiled to WebAssembly via Emscripten and Embind, and wrapped in a plain HTML/TypeScript frontend using Google's Material Web components. It's deployed live on GitHub Pages: `safowanr.github.io/network-intrusion-log-analyzer`. Every button in the web UI calls directly into the same `.wasm` binary built from the graded C++ source.