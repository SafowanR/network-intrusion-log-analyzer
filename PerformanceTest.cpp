#include "PerformanceTest.hpp"
#include "LogAnalyzer.hpp"
#include "AVLTree.hpp"
#include "IPRecord.hpp"
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <chrono>

using namespace std;
using namespace std::chrono;

// this function builds a batch of fake ip record objects for testing.
// each one gets a unique risk score so the avl tree has no duplicate keys.
void PerformanceTest::generateFakeIPs(int count) {
    // this function is a placeholder since the actual generation happens
    // directly inside runComparison to keep the dataset in scope for timing.
}

// this function runs the full performance comparison and prints the results.
void PerformanceTest::runComparison() {
    const int datasetSize = 1000;

    cout << "\n===== Performance Comparison =====" << endl;
    cout << "Dataset size: " << datasetSize << " ip addresses" << endl;

    // build the dataset of fake ip records first, outside the timed sections.
    // each record gets a unique risk score based on its index.
    vector<IPRecord*> records;
    for (int i = 0; i < datasetSize; i++) {
        string fakeIP = "10.0." + to_string(i / 256) + "." + to_string(i % 256);
        IPRecord* record = new IPRecord(fakeIP);
        record->increaseRisk(i);
        records.push_back(record);
    }

    // time inserting every record into a hash table.
    unordered_map<string, IPRecord*> hashTable;
    auto hashInsertStart = high_resolution_clock::now();
    for (int i = 0; i < datasetSize; i++) {
        hashTable[records[i]->getIP()] = records[i];
    }
    auto hashInsertEnd = high_resolution_clock::now();

    // time inserting every record into the avl tree.
    AVLTree tree;
    auto treeInsertStart = high_resolution_clock::now();
    for (int i = 0; i < datasetSize; i++) {
        tree.insert(records[i]);
    }
    auto treeInsertEnd = high_resolution_clock::now();

    // time looking up every ip in the hash table.
    auto hashLookupStart = high_resolution_clock::now();
    for (int i = 0; i < datasetSize; i++) {
        hashTable.find(records[i]->getIP());
    }
    auto hashLookupEnd = high_resolution_clock::now();

    // time looking up every risk score in the avl tree.
    auto treeLookupStart = high_resolution_clock::now();
    for (int i = 0; i < datasetSize; i++) {
        tree.contains(records[i]->getRiskScore());
    }
    auto treeLookupEnd = high_resolution_clock::now();

    // calculate durations in microseconds for all four timed sections.
    auto hashInsertTime = duration_cast<microseconds>(hashInsertEnd - hashInsertStart).count();
    auto treeInsertTime = duration_cast<microseconds>(treeInsertEnd - treeInsertStart).count();
    auto hashLookupTime = duration_cast<microseconds>(hashLookupEnd - hashLookupStart).count();
    auto treeLookupTime = duration_cast<microseconds>(treeLookupEnd - treeLookupStart).count();

    // print results in a simple table format.
    cout << "\nOperation         Hash Table (us)   AVL Tree (us)" << endl;
    cout << "Insert            " << hashInsertTime << "\t\t  " << treeInsertTime << endl;
    cout << "Lookup            " << hashLookupTime << "\t\t  " << treeLookupTime << endl;

    // clean up all dynamically allocated records to avoid memory leaks.
    for (int i = 0; i < datasetSize; i++) {
        delete records[i];
    }

    cout << "\n===== Comparison Complete =====" << endl;
}