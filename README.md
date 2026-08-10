# Network Intrusion Log Analyzer

CISC 220 Final Project by Safowan Raiyean. Tracks IP connection attempts, ranks them by risk using a custom AVL tree, and stores connection history using a hash table and linked list.

## Roadmap

- Core requirements
  - [x] Hash table (`std::unordered_map`) for IP lookup
  - [x] Custom AVL tree for risk ranking
    - [x] Insert with rotations (LL, RR, LR, RL)
    - [x] Remove with rebalancing
    - [x] In order print
  - [x] Linked list for per IP connection history
  - [x] Dynamic memory management
    - [x] `LogAnalyzer` owns and frees all `IPRecord` objects
    - [x] `AVLTree` frees its own nodes
    - [x] `IPRecord` frees its own linked list
- Console interface
  - [x] Menu with input validation
  - [x] Add connection entry
  - [x] Look up IP
  - [x] Print risk report
  - [x] Show tracked IP count
- Bonus features
  - [x] Menu driven interface with input validation
  - [x] Test suite
    - [x] Insert test
    - [x] Delete test
    - [x] Search test
    - [x] Balancing test
    - [x] Collision handling test
  - [x] Performance comparison
    - [x] Hash table vs AVL tree insert timing
    - [x] Hash table vs AVL tree lookup timing
- Documentation
  - [ ] Project overview
  - [ ] Hash table and AVL tree explanation
  - [ ] Hashing function and collision strategy explanation
  - [ ] Design decisions
  - [ ] Compile and run instructions
  - [ ] Testing performed and sample results
  - [ ] Known limitations
- Presentation
  - [ ] Slides covering all checklist items above
  - [ ] Practice explaining `auto` and `chrono` usage
  - [ ] Practice live demo flow

## How to compile

```
g++ main.cpp LogAnalyzer.cpp AVLTree.cpp IPRecord.cpp TestSuite.cpp PerformanceTest.cpp -o intrusion_analyzer
```

## How to run

```
intrusion_analyzer
```
