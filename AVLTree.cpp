#include "AVLTree.hpp"
#include <iostream>
#include <algorithm>

// constructor starts with an empty tree, root is null.
AVLTree::AVLTree() {
    root = nullptr;
}

// destructor calls the recursive helper to delete every node.
AVLTree::~AVLTree() {
    destroyTree(root);
}

// this function recursively deletes every node in the tree.
// note this only deletes the avl node itself, not the ip record it points to.
void AVLTree::destroyTree(AVLNode* node) {
    if (node == nullptr) {
        return;
    }
    destroyTree(node->left);
    destroyTree(node->right);
    delete node;
}

// this function returns the height of a node, or zero if it is null.
int AVLTree::getHeight(AVLNode* node) {
    if (node == nullptr) {
        return 0;
    }
    return node->height;
}

// this function calculates the balance factor, left height minus right height.
// this matches the professor's slide method for detecting rotation cases.
int AVLTree::getBalance(AVLNode* node) {
    if (node == nullptr) {
        return 0;
    }
    return getHeight(node->left) - getHeight(node->right);
}

// this function recalculates a node's height based on its children.
void AVLTree::updateHeight(AVLNode* node) {
    node->height = 1 + std::max(getHeight(node->left), getHeight(node->right));
}

// this function performs a right rotation for the left left case.
AVLNode* AVLTree::rotateLL(AVLNode* node) {
    AVLNode* newRoot = node->left;
    node->left = newRoot->right;
    newRoot->right = node;
    updateHeight(node);
    updateHeight(newRoot);
    return newRoot;
}

// this function performs a left rotation for the right right case.
AVLNode* AVLTree::rotateRR(AVLNode* node) {
    AVLNode* newRoot = node->right;
    node->right = newRoot->left;
    newRoot->left = node;
    updateHeight(node);
    updateHeight(newRoot);
    return newRoot;
}

// this function handles the left right case with two rotations.
AVLNode* AVLTree::rotateLR(AVLNode* node) {
    node->left = rotateRR(node->left);
    return rotateLL(node);
}

// this function handles the right left case with two rotations.
AVLNode* AVLTree::rotateRL(AVLNode* node) {
    node->right = rotateLL(node->right);
    return rotateRR(node);
}

// this function recursively inserts a new ip record based on risk score.
// after inserting it checks balance factor and applies the right rotation case.
AVLNode* AVLTree::insertHelper(AVLNode* node, IPRecord* rec) {
    if (node == nullptr) {
        return new AVLNode(rec);
    }

    if (rec->getRiskScore() < node->record->getRiskScore()) {
        node->left = insertHelper(node->left, rec);
    } else {
        node->right = insertHelper(node->right, rec);
    }

    updateHeight(node);
    int balance = getBalance(node);

    // left left case.
    if (balance > 1 && rec->getRiskScore() < node->left->record->getRiskScore()) {
        return rotateLL(node);
    }

    // right right case.
    if (balance < -1 && rec->getRiskScore() >= node->right->record->getRiskScore()) {
        return rotateRR(node);
    }

    // left right case.
    if (balance > 1 && rec->getRiskScore() >= node->left->record->getRiskScore()) {
        return rotateLR(node);
    }

    // right left case.
    if (balance < -1 && rec->getRiskScore() < node->right->record->getRiskScore()) {
        return rotateRL(node);
    }

    return node;
}

// public wrapper that starts the recursive insert from the root.
void AVLTree::insert(IPRecord* rec) {
    root = insertHelper(root, rec);
}

// this function finds the smallest node in a subtree, used during removal.
AVLNode* AVLTree::findMin(AVLNode* node) {
    while (node->left != nullptr) {
        node = node->left;
    }
    return node;
}

// this function recursively removes a node matching the given risk score.
// after removing it rebalances the tree the same way as insert.
AVLNode* AVLTree::removeHelper(AVLNode* node, int riskScore) {
    if (node == nullptr) {
        return nullptr;
    }

    if (riskScore < node->record->getRiskScore()) {
        node->left = removeHelper(node->left, riskScore);
    } else if (riskScore > node->record->getRiskScore()) {
        node->right = removeHelper(node->right, riskScore);
    } else {
        // node found, handle the three removal cases.
        if (node->left == nullptr || node->right == nullptr) {
            AVLNode* temp = node->left ? node->left : node->right;
            delete node;
            return temp;
        } else {
            AVLNode* successor = findMin(node->right);
            node->record = successor->record;
            node->right = removeHelper(node->right, successor->record->getRiskScore());
        }
    }

    updateHeight(node);
    int balance = getBalance(node);

    // left left case.
    if (balance > 1 && getBalance(node->left) >= 0) {
        return rotateLL(node);
    }

    // left right case.
    if (balance > 1 && getBalance(node->left) < 0) {
        return rotateLR(node);
    }

    // right right case.
    if (balance < -1 && getBalance(node->right) <= 0) {
        return rotateRR(node);
    }

    // right left case.
    if (balance < -1 && getBalance(node->right) > 0) {
        return rotateRL(node);
    }

    return node;
}

// public wrapper that starts the recursive remove from the root.
void AVLTree::remove(int riskScore) {
    root = removeHelper(root, riskScore);
}

// this function prints the tree in order, lowest risk to highest risk.
void AVLTree::inOrderHelper(AVLNode* node) {
    if (node == nullptr) {
        return;
    }
    inOrderHelper(node->left);
    std::cout << node->record->getIP() << " - risk: " << node->record->getRiskScore() << std::endl;
    inOrderHelper(node->right);
}

// public wrapper that starts the in order print from the root.
void AVLTree::inOrderPrint() {
    inOrderHelper(root);
}

// this function walks the tree in order and adds each record to a list.
// this is the same idea as inOrderHelper, but instead of printing,
// it saves the results so they can be used elsewhere, like in a web page.
void AVLTree::inOrderCollectHelper(AVLNode* node, std::vector<IPRecord*>& result) {
    if (node == nullptr) {
        return;
    }
    inOrderCollectHelper(node->left, result);
    result.push_back(node->record);
    inOrderCollectHelper(node->right, result);
}

// public function that returns every record in order, lowest to highest risk.
std::vector<IPRecord*> AVLTree::inOrderList() {
    std::vector<IPRecord*> result;
    inOrderCollectHelper(root, result);
    return result;
}

// this function searches the tree for a node matching the given risk score.
bool AVLTree::containsHelper(AVLNode* node, int riskScore) {
    if (node == nullptr) {
        return false;
    }
    if (riskScore == node->record->getRiskScore()) {
        return true;
    }
    if (riskScore < node->record->getRiskScore()) {
        return containsHelper(node->left, riskScore);
    }
    return containsHelper(node->right, riskScore);
}

// public wrapper that starts the search from the root.
bool AVLTree::contains(int riskScore) {
    return containsHelper(root, riskScore);
}

// public function that returns the tree height starting from the root.
// used to confirm the tree stays balanced instead of growing in a straight line.
int AVLTree::getTreeHeight() {
    return getHeight(root);
}