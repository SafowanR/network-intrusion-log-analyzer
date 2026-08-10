#ifndef AVLTREE_HPP
#define AVLTREE_HPP

#include "IPRecord.hpp"

// this struct is a single node in the avl tree.
// it holds a pointer to the ip record instead of copying its data.
struct AVLNode {
    IPRecord* record;
    int height;
    AVLNode* left;
    AVLNode* right;

    // constructor sets up a new node with height one since it starts as a leaf.
    AVLNode(IPRecord* rec)
        : record(rec), height(1), left(nullptr), right(nullptr) {}
};

// this class manages the avl tree that ranks ip addresses by risk score.
class AVLTree {
private:
    AVLNode* root;

    // helper functions used internally for building the tree logic.
    int getHeight(AVLNode* node);
    int getBalance(AVLNode* node);
    void updateHeight(AVLNode* node);

    // rotation functions used to fix balance after insert or remove.
    AVLNode* rotateLL(AVLNode* node);
    AVLNode* rotateRR(AVLNode* node);
    AVLNode* rotateLR(AVLNode* node);
    AVLNode* rotateRL(AVLNode* node);

    // recursive helpers that do the real work behind the public functions.
    AVLNode* insertHelper(AVLNode* node, IPRecord* rec);
    AVLNode* removeHelper(AVLNode* node, int riskScore);
    AVLNode* findMin(AVLNode* node);
    void destroyTree(AVLNode* node);
    void inOrderHelper(AVLNode* node);

    // recursive helper used by contains to search the tree.
    bool containsHelper(AVLNode* node, int riskScore);

public:
    // constructor starts with an empty tree.
    AVLTree();

    // destructor cleans up every node to avoid memory leaks.
    ~AVLTree();

    // this function inserts an ip record into the tree based on its risk score.
    void insert(IPRecord* rec);

    // this function removes a node from the tree based on a risk score.
    void remove(int riskScore);

    // this function prints the tree in order, from lowest to highest risk.
    void inOrderPrint();

    // this function checks if a given risk score exists in the tree.
    bool contains(int riskScore);

    // this function returns the height of the tree, used to confirm balancing.
    int getTreeHeight();
};

#endif