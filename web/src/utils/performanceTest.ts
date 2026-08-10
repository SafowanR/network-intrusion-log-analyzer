import { IPRecord } from "../models/IPRecord";
import { AVLTree } from "../models/AVLTree";

// this type holds the timing results for one operation, comparing both structures.
export interface PerformanceResult {
  operation: string;
  hashTableTime: number;
  avlTreeTime: number;
}

// this function runs the full performance comparison and returns the results.
// the ui calls this and renders a table instead of printing to console.
export function runComparison(): PerformanceResult[] {
  const datasetSize = 1000;
  // repeating each timed operation many times and averaging gives a more
  // accurate reading, since a single pass can be too fast for the browser's
  // timer to measure precisely for very quick operations like hash lookups.
  const repeatCount = 100;

  // build the dataset of fake ip records first, outside the timed sections.
  // each record gets a unique risk score based on its index.
  const records: IPRecord[] = [];
  for (let i = 0; i < datasetSize; i++) {
    const fakeIP = `10.0.${Math.floor(i / 256)}.${i % 256}`;
    const record = new IPRecord(fakeIP);
    record.increaseRisk(i);
    records.push(record);
  }

  // build one shared hash table and tree for the lookup timing sections,
  // since lookups need something already filled to search through.
  const filledHashTable = new Map<string, IPRecord>();
  const filledTree = new AVLTree();
  for (let i = 0; i < datasetSize; i++) {
    filledHashTable.set(records[i].getIP(), records[i]);
    filledTree.insert(records[i]);
  }

  // time inserting every record into a hash table equivalent (js map),
  // repeated multiple times and averaged for a more precise reading.
  const hashInsertStart = performance.now();
  for (let r = 0; r < repeatCount; r++) {
    const tempTable = new Map<string, IPRecord>();
    for (let i = 0; i < datasetSize; i++) {
      tempTable.set(records[i].getIP(), records[i]);
    }
  }
  const hashInsertEnd = performance.now();

  // time inserting every record into the avl tree, same repeated approach.
  const treeInsertStart = performance.now();
  for (let r = 0; r < repeatCount; r++) {
    const tempTree = new AVLTree();
    for (let i = 0; i < datasetSize; i++) {
      tempTree.insert(records[i]);
    }
  }
  const treeInsertEnd = performance.now();

  // time looking up every ip in the hash table, repeated for precision.
  const hashLookupStart = performance.now();
  for (let r = 0; r < repeatCount; r++) {
    for (let i = 0; i < datasetSize; i++) {
      filledHashTable.has(records[i].getIP());
    }
  }
  const hashLookupEnd = performance.now();

  // time looking up every risk score in the avl tree, repeated for precision.
  const treeLookupStart = performance.now();
  for (let r = 0; r < repeatCount; r++) {
    for (let i = 0; i < datasetSize; i++) {
      filledTree.contains(records[i].getRiskScore());
    }
  }
  const treeLookupEnd = performance.now();

  // divide by repeatCount to get the average time for one full pass,
  // then convert milliseconds to microseconds to match the c++ output units.
  const hashInsertTime = ((hashInsertEnd - hashInsertStart) / repeatCount) * 1000;
  const treeInsertTime = ((treeInsertEnd - treeInsertStart) / repeatCount) * 1000;
  const hashLookupTime = ((hashLookupEnd - hashLookupStart) / repeatCount) * 1000;
  const treeLookupTime = ((treeLookupEnd - treeLookupStart) / repeatCount) * 1000;

  return [
    { operation: "Insert", hashTableTime: hashInsertTime, avlTreeTime: treeInsertTime },
    { operation: "Lookup", hashTableTime: hashLookupTime, avlTreeTime: treeLookupTime },
  ];
}