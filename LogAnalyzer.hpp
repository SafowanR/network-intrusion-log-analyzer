#ifndef LOGANALYZER_HPP
#define LOGANALYZER_HPP

#include <unordered_map>
#include <string>
#include "IPRecord.hpp"
#include "AVLTree.hpp"
#include <vector>

// this class is the main hub that ties the hash table and avl tree together.
// it owns all the ip record objects and manages their lifetime.
class LogAnalyzer {
private:
    std::unordered_map<std::string, IPRecord*> ipTable;
    AVLTree riskTree;

public:
    // constructor starts with an empty table and empty tree.
    LogAnalyzer();

    // destructor deletes every ip record to avoid memory leaks.
    ~LogAnalyzer();

    // this function processes one log entry, creating a new ip record if needed.
    void processConnection(std::string ip, std::string timestamp, int port, bool flagged);

    // this function looks up an ip and returns its record, or null if not found.
    IPRecord* lookupIP(std::string ip);

    // this function prints all ips ranked by risk score using the avl tree.
    void printRiskReport();

    // this function returns every ip ranked by risk score as a list.
    // this is what the web version calls instead of printing to a console.
    std::vector<IPRecord*> getRiskReportList();

    // this function returns how many unique ips are being tracked.
    int getTrackedCount();
};

#endif