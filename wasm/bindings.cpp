#include <emscripten/bind.h>
#include "../LogAnalyzer.hpp"
#include <vector>
#include <chrono>

using namespace emscripten;

// this file exposes the real logAnalyzer class to javascript.
// nothing about logAnalyzer, avltree, or iprecord changes at all.
// this just wraps the existing class so a webpage can call it directly.

// plain struct returned to javascript summarizing one ip record.
struct JSIPRecord {
    std::string ip;
    int riskScore;
    int attemptCount;
};

// plain struct returned to javascript for one test result.
struct JSTestResult {
    std::string name;
    bool passed;
    std::string detail;
};

// plain struct returned to javascript for performance timing results.
struct JSPerformanceResult {
    std::string operation;
    double hashTableTime;
    double avlTreeTime;
};

// this function converts an ip record pointer into a plain js friendly struct.
JSIPRecord toJSRecord(IPRecord* record) {
    JSIPRecord result;
    result.ip = record->getIP();
    result.riskScore = record->getRiskScore();
    result.attemptCount = record->getAttemptCount();
    return result;
}

// this class wraps logAnalyzer with javascript friendly return types.
// logAnalyzer itself is never modified, this just adapts its output.
class WebLogAnalyzer {
private:
    LogAnalyzer analyzer;

public:
    void processConnection(std::string ip, std::string timestamp, int port, bool flagged) {
        analyzer.processConnection(ip, timestamp, port, flagged);
    }

    // returns risk score and attempt count, or -1 risk score if not found.
    JSIPRecord lookupIP(std::string ip) {
        IPRecord* record = analyzer.lookupIP(ip);
        if (record == nullptr) {
            JSIPRecord notFound;
            notFound.ip = ip;
            notFound.riskScore = -1;
            notFound.attemptCount = -1;
            return notFound;
        }
        return toJSRecord(record);
    }

    int getTrackedCount() {
        return analyzer.getTrackedCount();
    }

    // this function returns every ip ranked by risk score as a js friendly list.
    std::vector<JSIPRecord> getRiskReport() {
        std::vector<IPRecord*> records = analyzer.getRiskReportList();
        std::vector<JSIPRecord> result;
        for (int i = 0; i < records.size(); i++) {
            result.push_back(toJSRecord(records[i]));
        }
        return result;
    }
};

// this function runs the same 5 tests as the console version's test suite.
// each test uses a fresh, separate logAnalyzer or avlTree so tests don't
// interfere with each other or with the main app's data.
std::vector<JSTestResult> runTestSuite() {
    std::vector<JSTestResult> results;

    // test 1: inserting an ip makes it findable.
    {
        LogAnalyzer testAnalyzer;
        testAnalyzer.processConnection("1.1.1.1", "2026-01-01 09:00", 80, false);
        IPRecord* found = testAnalyzer.lookupIP("1.1.1.1");
        bool passed = (found != nullptr && found->getIP() == "1.1.1.1");
        results.push_back({"testInsert", passed, ""});
    }

    // test 2: removing a risk score from the tree actually removes it.
    {
        AVLTree testTree;
        IPRecord testRecord("2.2.2.2");
        testRecord.increaseRisk(5);
        testTree.insert(&testRecord);
        bool foundBefore = testTree.contains(5);
        testTree.remove(5);
        bool foundAfter = testTree.contains(5);
        bool passed = (foundBefore == true && foundAfter == false);
        results.push_back({"testDelete", passed, ""});
    }

    // test 3: searching for an ip that was never added returns null.
    {
        LogAnalyzer testAnalyzer;
        IPRecord* found = testAnalyzer.lookupIP("9.9.9.9");
        bool passed = (found == nullptr);
        results.push_back({"testSearch", passed, ""});
    }

    // test 4: the tree stays balanced after several inserts.
    {
        AVLTree testTree;
        std::vector<IPRecord*> testRecords;
        for (int i = 0; i < 7; i++) {
            IPRecord* rec = new IPRecord("10.0.0." + std::to_string(i + 1));
            rec->increaseRisk(i + 1);
            testRecords.push_back(rec);
            testTree.insert(rec);
        }
        int height = testTree.getTreeHeight();
        bool passed = (height <= 4);
        results.push_back({"testBalancing", passed, "height " + std::to_string(height)});
        for (int i = 0; i < testRecords.size(); i++) {
            delete testRecords[i];
        }
    }

    // test 5: adding the same ip twice updates instead of duplicating.
    {
        LogAnalyzer testAnalyzer;
        testAnalyzer.processConnection("3.3.3.3", "2026-01-01 09:00", 80, false);
        testAnalyzer.processConnection("3.3.3.3", "2026-01-01 09:05", 22, true);
        int count = testAnalyzer.getTrackedCount();
        IPRecord* found = testAnalyzer.lookupIP("3.3.3.3");
        bool passed = (count == 1 && found != nullptr && found->getAttemptCount() == 2);
        results.push_back({"testCollisionHandling", passed, ""});
    }

    return results;
}

// this function times inserting and looking up 1000 records in both
// structures, same idea as the console version's performance test.
std::vector<JSPerformanceResult> runPerformanceComparison() {
    const int datasetSize = 1000;
    const int repeatCount = 100;

    std::vector<IPRecord*> records;
    for (int i = 0; i < datasetSize; i++) {
        std::string fakeIP = "10.0." + std::to_string(i / 256) + "." + std::to_string(i % 256);
        IPRecord* record = new IPRecord(fakeIP);
        record->increaseRisk(i);
        records.push_back(record);
    }

    // build one filled structure of each kind for the lookup timing tests.
    std::unordered_map<std::string, IPRecord*> filledTable;
    AVLTree filledTree;
    for (int i = 0; i < datasetSize; i++) {
        filledTable[records[i]->getIP()] = records[i];
        filledTree.insert(records[i]);
    }

    // time inserting into a hash table, repeated for a more accurate reading.
    auto hashInsertStart = std::chrono::high_resolution_clock::now();
    for (int r = 0; r < repeatCount; r++) {
        std::unordered_map<std::string, IPRecord*> tempTable;
        for (int i = 0; i < datasetSize; i++) {
            tempTable[records[i]->getIP()] = records[i];
        }
    }
    auto hashInsertEnd = std::chrono::high_resolution_clock::now();

    // time inserting into the avl tree, same repeated approach.
    auto treeInsertStart = std::chrono::high_resolution_clock::now();
    for (int r = 0; r < repeatCount; r++) {
        AVLTree tempTree;
        for (int i = 0; i < datasetSize; i++) {
            tempTree.insert(records[i]);
        }
    }
    auto treeInsertEnd = std::chrono::high_resolution_clock::now();

    // time looking up every ip in the hash table.
    auto hashLookupStart = std::chrono::high_resolution_clock::now();
    for (int r = 0; r < repeatCount; r++) {
        for (int i = 0; i < datasetSize; i++) {
            filledTable.find(records[i]->getIP());
        }
    }
    auto hashLookupEnd = std::chrono::high_resolution_clock::now();

    // time looking up every risk score in the avl tree.
    auto treeLookupStart = std::chrono::high_resolution_clock::now();
    for (int r = 0; r < repeatCount; r++) {
        for (int i = 0; i < datasetSize; i++) {
            filledTree.contains(records[i]->getRiskScore());
        }
    }
    auto treeLookupEnd = std::chrono::high_resolution_clock::now();

    // convert the timing into microseconds, averaged over the repeat count.
    double hashInsertTime = std::chrono::duration_cast<std::chrono::microseconds>(hashInsertEnd - hashInsertStart).count() / (double)repeatCount;
    double treeInsertTime = std::chrono::duration_cast<std::chrono::microseconds>(treeInsertEnd - treeInsertStart).count() / (double)repeatCount;
    double hashLookupTime = std::chrono::duration_cast<std::chrono::microseconds>(hashLookupEnd - hashLookupStart).count() / (double)repeatCount;
    double treeLookupTime = std::chrono::duration_cast<std::chrono::microseconds>(treeLookupEnd - treeLookupStart).count() / (double)repeatCount;

    std::vector<JSPerformanceResult> results;
    results.push_back({"Insert", hashInsertTime, treeInsertTime});
    results.push_back({"Lookup", hashLookupTime, treeLookupTime});

    // clean up the dynamically allocated test records.
    for (int i = 0; i < records.size(); i++) {
        delete records[i];
    }

    return results;
}

// this block registers everything so javascript can see and call it.
EMSCRIPTEN_BINDINGS(log_analyzer_module) {
    value_object<JSIPRecord>("JSIPRecord")
        .field("ip", &JSIPRecord::ip)
        .field("riskScore", &JSIPRecord::riskScore)
        .field("attemptCount", &JSIPRecord::attemptCount);

    value_object<JSTestResult>("JSTestResult")
        .field("name", &JSTestResult::name)
        .field("passed", &JSTestResult::passed)
        .field("detail", &JSTestResult::detail);

    value_object<JSPerformanceResult>("JSPerformanceResult")
        .field("operation", &JSPerformanceResult::operation)
        .field("hashTableTime", &JSPerformanceResult::hashTableTime)
        .field("avlTreeTime", &JSPerformanceResult::avlTreeTime);

    register_vector<JSIPRecord>("JSIPRecordList");
    register_vector<JSTestResult>("JSTestResultList");
    register_vector<JSPerformanceResult>("JSPerformanceResultList");

    class_<WebLogAnalyzer>("WebLogAnalyzer")
        .constructor<>()
        .function("processConnection", &WebLogAnalyzer::processConnection)
        .function("lookupIP", &WebLogAnalyzer::lookupIP)
        .function("getTrackedCount", &WebLogAnalyzer::getTrackedCount)
        .function("getRiskReport", &WebLogAnalyzer::getRiskReport);

    function("runTestSuite", &runTestSuite);
    function("runPerformanceComparison", &runPerformanceComparison);
}