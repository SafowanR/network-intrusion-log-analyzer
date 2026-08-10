import { IPRecord } from "./IPRecord";
import { AVLTree } from "./AVLTree";

// this class is the main hub that ties the hash table and avl tree together.
// it owns all the ip record objects, same role as the c++ version.
export class LogAnalyzer {
  private ipTable: Map<string, IPRecord>;
  private riskTree: AVLTree;

  // constructor starts with an empty table and empty tree.
  constructor() {
    this.ipTable = new Map<string, IPRecord>();
    this.riskTree = new AVLTree();
  }

  // this function handles one log entry.
  // if the ip is new it creates a record, otherwise it updates the existing one.
  processConnection(ip: string, timestamp: string, port: number, flagged: boolean): void {
    const isExisting = this.ipTable.has(ip);
    let record: IPRecord;

    if (isExisting) {
      record = this.ipTable.get(ip) as IPRecord;
    } else {
      // ip has not been seen before, make a new record and add it to the table.
      record = new IPRecord(ip);
      this.ipTable.set(ip, record);
    }

    // save the old risk score before any changes happen.
    const oldRisk = record.getRiskScore();

    // remove the old tree position first, while the risk score still matches it.
    if (isExisting) {
      this.riskTree.remove(oldRisk);
    }

    // add this connection attempt to the ip's history.
    record.addConnection(timestamp, port, flagged);

    // flagged connections add more risk than normal ones.
    const riskIncrease = flagged ? 10 : 1;
    record.increaseRisk(riskIncrease);

    // now insert at the new, updated risk score.
    this.riskTree.insert(record);
  }

  // this function looks up an ip in the hash table and returns its record.
  lookupIP(ip: string): IPRecord | null {
    const record = this.ipTable.get(ip);
    if (record === undefined) {
      return null;
    }
    return record;
  }

  // this function returns every ip ranked by risk score using the avl tree.
  // this replaces the console print version since the web ui will render this instead.
  getRiskReport(): IPRecord[] {
    return this.riskTree.inOrderList();
  }

  // this function returns how many unique ips are currently tracked.
  getTrackedCount(): number {
    return this.ipTable.size;
  }
}