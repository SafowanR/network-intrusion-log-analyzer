import { IPRecord } from "./IPRecord";

// this class is a single node in the avl tree.
// it holds a reference to the ip record instead of copying its data.
class AVLNode {
  record: IPRecord;
  height: number;
  left: AVLNode | null;
  right: AVLNode | null;

  // constructor sets up a new node with height one since it starts as a leaf.
  constructor(record: IPRecord) {
    this.record = record;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

// this class manages the avl tree that ranks ip addresses by risk score.
export class AVLTree {
  private root: AVLNode | null;

  // constructor starts with an empty tree.
  constructor() {
    this.root = null;
  }

  // this function returns the height of a node, or zero if it is null.
  private getHeight(node: AVLNode | null): number {
    if (node === null) {
      return 0;
    }
    return node.height;
  }

  // this function calculates the balance factor, left height minus right height.
  private getBalance(node: AVLNode | null): number {
    if (node === null) {
      return 0;
    }
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  // this function recalculates a node's height based on its children.
  private updateHeight(node: AVLNode): void {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  // this function performs a right rotation for the left left case.
  private rotateLL(node: AVLNode): AVLNode {
    const newRoot = node.left as AVLNode;
    node.left = newRoot.right;
    newRoot.right = node;
    this.updateHeight(node);
    this.updateHeight(newRoot);
    return newRoot;
  }

  // this function performs a left rotation for the right right case.
  private rotateRR(node: AVLNode): AVLNode {
    const newRoot = node.right as AVLNode;
    node.right = newRoot.left;
    newRoot.left = node;
    this.updateHeight(node);
    this.updateHeight(newRoot);
    return newRoot;
  }

  // this function handles the left right case with two rotations.
  private rotateLR(node: AVLNode): AVLNode {
    node.left = this.rotateRR(node.left as AVLNode);
    return this.rotateLL(node);
  }

  // this function handles the right left case with two rotations.
  private rotateRL(node: AVLNode): AVLNode {
    node.right = this.rotateLL(node.right as AVLNode);
    return this.rotateRR(node);
  }

  // this function recursively inserts a new ip record based on risk score.
  // after inserting it checks balance factor and applies the right rotation case.
  private insertHelper(node: AVLNode | null, record: IPRecord): AVLNode {
    if (node === null) {
      return new AVLNode(record);
    }

    if (record.getRiskScore() < node.record.getRiskScore()) {
      node.left = this.insertHelper(node.left, record);
    } else {
      node.right = this.insertHelper(node.right, record);
    }

    this.updateHeight(node);
    const balance = this.getBalance(node);

    // left left case.
    if (balance > 1 && record.getRiskScore() < (node.left as AVLNode).record.getRiskScore()) {
      return this.rotateLL(node);
    }

    // right right case.
    if (balance < -1 && record.getRiskScore() >= (node.right as AVLNode).record.getRiskScore()) {
      return this.rotateRR(node);
    }

    // left right case.
    if (balance > 1 && record.getRiskScore() >= (node.left as AVLNode).record.getRiskScore()) {
      return this.rotateLR(node);
    }

    // right left case.
    if (balance < -1 && record.getRiskScore() < (node.right as AVLNode).record.getRiskScore()) {
      return this.rotateRL(node);
    }

    return node;
  }

  // public wrapper that starts the recursive insert from the root.
  insert(record: IPRecord): void {
    this.root = this.insertHelper(this.root, record);
  }

  // this function finds the smallest node in a subtree, used during removal.
  private findMin(node: AVLNode): AVLNode {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  // this function recursively removes a node matching the given risk score.
  // after removing it rebalances the tree the same way as insert.
  private removeHelper(node: AVLNode | null, riskScore: number): AVLNode | null {
    if (node === null) {
      return null;
    }

    if (riskScore < node.record.getRiskScore()) {
      node.left = this.removeHelper(node.left, riskScore);
    } else if (riskScore > node.record.getRiskScore()) {
      node.right = this.removeHelper(node.right, riskScore);
    } else {
      // node found, handle the three removal cases.
      if (node.left === null || node.right === null) {
        const temp = node.left ? node.left : node.right;
        return temp;
      } else {
        const successor = this.findMin(node.right);
        node.record = successor.record;
        node.right = this.removeHelper(node.right, successor.record.getRiskScore());
      }
    }

    this.updateHeight(node);
    const balance = this.getBalance(node);

    // left left case.
    if (balance > 1 && this.getBalance(node.left) >= 0) {
      return this.rotateLL(node);
    }

    // left right case.
    if (balance > 1 && this.getBalance(node.left) < 0) {
      return this.rotateLR(node);
    }

    // right right case.
    if (balance < -1 && this.getBalance(node.right) <= 0) {
      return this.rotateRR(node);
    }

    // right left case.
    if (balance < -1 && this.getBalance(node.right) > 0) {
      return this.rotateRL(node);
    }

    return node;
  }

  // public wrapper that starts the recursive remove from the root.
  remove(riskScore: number): void {
    this.root = this.removeHelper(this.root, riskScore);
  }

  // this function collects the tree in order, lowest risk to highest risk.
  private inOrderHelper(node: AVLNode | null, result: IPRecord[]): void {
    if (node === null) {
      return;
    }
    this.inOrderHelper(node.left, result);
    result.push(node.record);
    this.inOrderHelper(node.right, result);
  }

  // public function that returns all records in order, lowest to highest risk.
  // this replaces the console print version since the web ui will render this instead.
  inOrderList(): IPRecord[] {
    const result: IPRecord[] = [];
    this.inOrderHelper(this.root, result);
    return result;
  }

  // this function searches the tree for a node matching the given risk score.
  private containsHelper(node: AVLNode | null, riskScore: number): boolean {
    if (node === null) {
      return false;
    }
    if (riskScore === node.record.getRiskScore()) {
      return true;
    }
    if (riskScore < node.record.getRiskScore()) {
      return this.containsHelper(node.left, riskScore);
    }
    return this.containsHelper(node.right, riskScore);
  }

  // public wrapper that starts the search from the root.
  contains(riskScore: number): boolean {
    return this.containsHelper(this.root, riskScore);
  }

  // public function that returns the tree height starting from the root.
  getTreeHeight(): number {
    return this.getHeight(this.root);
  }
}