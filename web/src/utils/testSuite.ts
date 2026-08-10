import { LogAnalyzer } from "../models/LogAnalyzer";
import { AVLTree } from "../models/AVLTree";
import { IPRecord } from "../models/IPRecord";

// this type represents the result of a single test.
// the ui will use this to show pass or fail with a label.
export interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

// this function tests that inserting an ip makes it findable through the hash table.
function testInsert(): TestResult {
  const analyzer = new LogAnalyzer();
  analyzer.processConnection("1.1.1.1", "2026-07-29 09:00", 80, false);

  const result = analyzer.lookupIP("1.1.1.1");
  const passed = result !== null && result.getIP() === "1.1.1.1";

  return { name: "testInsert", passed, detail: "" };
}

// this function tests that removing a risk score from the tree actually removes it.
function testDelete(): TestResult {
  const tree = new AVLTree();
  const record = new IPRecord("2.2.2.2");
  record.increaseRisk(5);
  tree.insert(record);

  const foundBefore = tree.contains(5);
  tree.remove(5);
  const foundAfter = tree.contains(5);

  const passed = foundBefore === true && foundAfter === false;

  return { name: "testDelete", passed, detail: "" };
}

// this function tests that searching for an ip that was never added returns null.
function testSearch(): TestResult {
  const analyzer = new LogAnalyzer();
  const result = analyzer.lookupIP("9.9.9.9");

  const passed = result === null;

  return { name: "testSearch", passed, detail: "" };
}

// this function tests that the tree stays balanced after several inserts.
// a balanced tree with n nodes should have a height close to log base two of n.
function testBalancing(): TestResult {
  const tree = new AVLTree();
  const records: IPRecord[] = [];

  for (let i = 0; i < 7; i++) {
    const record = new IPRecord(`10.0.0.${i + 1}`);
    record.increaseRisk(i + 1);
    records.push(record);
    tree.insert(record);
  }

  const height = tree.getTreeHeight();
  const expectedMaxHeight = Math.floor(Math.log2(7)) + 2;
  const passed = height <= expectedMaxHeight;

  return { name: "testBalancing", passed, detail: `height ${height}` };
}

// this function tests that adding the same ip twice updates the existing record
// instead of creating a duplicate entry in the hash table.
function testCollisionHandling(): TestResult {
  const analyzer = new LogAnalyzer();
  analyzer.processConnection("3.3.3.3", "2026-07-29 09:00", 80, false);
  analyzer.processConnection("3.3.3.3", "2026-07-29 09:05", 22, true);

  const count = analyzer.getTrackedCount();
  const result = analyzer.lookupIP("3.3.3.3");

  const passed = count === 1 && result !== null && result.getAttemptCount() === 2;

  return { name: "testCollisionHandling", passed, detail: "" };
}

// this function runs every test in order and returns all the results.
// the ui calls this and renders the results list instead of printing to console.
export function runAllTests(): TestResult[] {
  return [
    testInsert(),
    testDelete(),
    testSearch(),
    testBalancing(),
    testCollisionHandling(),
  ];
}