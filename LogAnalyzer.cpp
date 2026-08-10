#include "LogAnalyzer.hpp"
#include <iostream>

// constructor does not need to do anything extra since the map and tree start empty on their own.
LogAnalyzer::LogAnalyzer() {
}

// destructor loops through the hash table and deletes every ip record.
// this is the one place ip record memory actually gets freed.
LogAnalyzer::~LogAnalyzer() {
    for (auto& pair : ipTable) {
        delete pair.second;
    }
}

// this function handles one log entry.
// if the ip is new it creates a record, otherwise it updates the existing one.
void LogAnalyzer::processConnection(std::string ip, std::string timestamp, int port, bool flagged) {
    auto it = ipTable.find(ip);
    IPRecord* record;
    bool isExisting = (it != ipTable.end());

    if (!isExisting) {
        // ip has not been seen before, make a new record and add it to the table.
        record = new IPRecord(ip);
        ipTable[ip] = record;
    } else {
        record = it->second;
    }

    // save the old risk score before any changes happen.
    int oldRisk = record->getRiskScore();

    // remove the old tree position first, while the risk score still matches it.
    if (isExisting) {
        riskTree.remove(oldRisk);
    }

    // add this connection attempt to the ip's history.
    record->addConnection(timestamp, port, flagged);

    // flagged connections add more risk than normal ones.
    int riskIncrease = flagged ? 10 : 1;
    record->increaseRisk(riskIncrease);

    // now insert at the new, updated risk score.
    riskTree.insert(record);
}

// this function looks up an ip in the hash table and returns its record.
IPRecord* LogAnalyzer::lookupIP(std::string ip) {
    auto it = ipTable.find(ip);
    if (it == ipTable.end()) {
        return nullptr;
    }
    return it->second;
}

// this function prints every ip ranked by risk score using the avl tree.
void LogAnalyzer::printRiskReport() {
    riskTree.inOrderPrint();
}

// this function returns how many unique ips are currently tracked.
int LogAnalyzer::getTrackedCount() {
    return ipTable.size();
}