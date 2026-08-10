// this class represents one single connection attempt from an ip.
// this is the entry used in the connection history array.
export interface ConnectionRecord {
  timestamp: string;
  port: number;
  flagged: boolean;
}

// this class holds all the info tracked for a single ip address.
// it stores the ip itself, a risk score, and a history of its connections.
export class IPRecord {
  private ipAddress: string;
  private riskScore: number;
  private attemptCount: number;
  private history: ConnectionRecord[];

  // constructor sets up a new ip record with starting values.
  constructor(ip: string) {
    this.ipAddress = ip;
    this.riskScore = 0;
    this.attemptCount = 0;
    this.history = [];
  }

  // this function adds a new connection attempt to the history array.
  // adding to the front keeps the newest connection easy to find first.
  addConnection(timestamp: string, port: number, flagged: boolean): void {
    const record: ConnectionRecord = { timestamp, port, flagged };
    this.history.unshift(record);
    this.attemptCount++;
  }

  // this function raises the risk score by the given amount.
  // used whenever a connection looks suspicious or repeated too often.
  increaseRisk(amount: number): void {
    this.riskScore += amount;
  }

  // getters below just return the private data so other classes can read it.
  getIP(): string {
    return this.ipAddress;
  }

  getRiskScore(): number {
    return this.riskScore;
  }

  getAttemptCount(): number {
    return this.attemptCount;
  }

  getHistory(): ConnectionRecord[] {
    return this.history;
  }
}