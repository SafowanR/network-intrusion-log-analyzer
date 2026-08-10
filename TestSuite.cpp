#include "TestSuite.hpp"
#include "AVLTree.hpp"
#include <iostream>
#include <cmath>

using namespace std;

// this function runs every test in order and prints the results.
void TestSuite::runAllTests() {
    cout << "\n===== Running Test Suite =====" << endl;
    testInsert();
    testDelete();
    testSearch();
    testBalancing();
    testCollisionHandling();
    cout << "===== Test Suite Complete =====" << endl;
}

// this function tests that inserting an ip makes it findable through the hash table.
void TestSuite::testInsert() {
    LogAnalyzer analyzer;
    analyzer.processConnection("1.1.1.1", "2026-07-29 09:00", 80, false);

    IPRecord* result = analyzer.lookupIP("1.1.1.1");
    if (result != nullptr && result->getIP() == "1.1.1.1") {
        cout << "testInsert: PASS" << endl;
    } else {
        cout << "testInsert: FAIL" << endl;
    }
}

// this function tests that removing a risk score from the tree actually removes it.
void TestSuite::testDelete() {
    AVLTree tree;
    IPRecord record("2.2.2.2");
    record.increaseRisk(5);
    tree.insert(&record);

    bool foundBefore = tree.contains(5);
    tree.remove(5);
    bool foundAfter = tree.contains(5);

    if (foundBefore == true && foundAfter == false) {
        cout << "testDelete: PASS" << endl;
    } else {
        cout << "testDelete: FAIL" << endl;
    }
}

// this function tests that searching for an ip that was never added returns null.
void TestSuite::testSearch() {
    LogAnalyzer analyzer;
    IPRecord* result = analyzer.lookupIP("9.9.9.9");

    if (result == nullptr) {
        cout << "testSearch: PASS" << endl;
    } else {
        cout << "testSearch: FAIL" << endl;
    }
}

// this function tests that the tree stays balanced after several inserts.
// a balanced tree with n nodes should have a height close to log base two of n.
void TestSuite::testBalancing() {
    AVLTree tree;
    IPRecord records[7] = {
        IPRecord("10.0.0.1"), IPRecord("10.0.0.2"), IPRecord("10.0.0.3"),
        IPRecord("10.0.0.4"), IPRecord("10.0.0.5"), IPRecord("10.0.0.6"),
        IPRecord("10.0.0.7")
    };

    // give each record an increasing risk score before inserting.
    for (int i = 0; i < 7; i++) {
        records[i].increaseRisk(i + 1);
        tree.insert(&records[i]);
    }

    int height = tree.getTreeHeight();
    int expectedMaxHeight = static_cast<int>(log2(7)) + 2;

    if (height <= expectedMaxHeight) {
        cout << "testBalancing: PASS (height " << height << ")" << endl;
    } else {
        cout << "testBalancing: FAIL (height " << height << " too tall)" << endl;
    }
}

// this function tests that adding the same ip twice updates the existing record
// instead of creating a duplicate entry in the hash table.
void TestSuite::testCollisionHandling() {
    LogAnalyzer analyzer;
    analyzer.processConnection("3.3.3.3", "2026-07-29 09:00", 80, false);
    analyzer.processConnection("3.3.3.3", "2026-07-29 09:05", 22, true);

    int count = analyzer.getTrackedCount();
    IPRecord* result = analyzer.lookupIP("3.3.3.3");

    if (count == 1 && result != nullptr && result->getAttemptCount() == 2) {
        cout << "testCollisionHandling: PASS" << endl;
    } else {
        cout << "testCollisionHandling: FAIL" << endl;
    }
}