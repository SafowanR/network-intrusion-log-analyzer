#include "IPRecord.hpp"

// constructor sets starting values for a new ip record.
// risk score and attempt count start at zero since no connections have happened yet.
IPRecord::IPRecord(std::string ip) {
    ipAddress = ip;
    riskScore = 0;
    attemptCount = 0;
    historyHead = nullptr;
}

// destructor walks the linked list and deletes every node.
// this prevents memory leaks since each node was allocated with new.
IPRecord::~IPRecord() {
    ConnectionRecord* current = historyHead;
    while (current != nullptr) {
        ConnectionRecord* temp = current;
        current = current->next;
        delete temp;
    }
}

// this function adds a new connection attempt to the front of the history list.
// adding to the front keeps insertion at constant time instead of walking the list.
void IPRecord::addConnection(std::string timestamp, int port, bool flagged) {
    ConnectionRecord* newRecord = new ConnectionRecord(timestamp, port, flagged);
    newRecord->next = historyHead;
    historyHead = newRecord;
    attemptCount++;
}

// this function raises the risk score by the given amount.
// used whenever a connection looks suspicious or repeated too often.
void IPRecord::increaseRisk(int amount) {
    riskScore += amount;
}

// getters below just return the private data so other classes can read it.
std::string IPRecord::getIP() const {
    return ipAddress;
}

int IPRecord::getRiskScore() const {
    return riskScore;
}

int IPRecord::getAttemptCount() const {
    return attemptCount;
}

ConnectionRecord* IPRecord::getHistory() const {
    return historyHead;
}