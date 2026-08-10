#ifndef IPRECORD_HPP
#define IPRECORD_HPP

#include <string>

// this struct represents one single connection attempt from an ip.
// this is the node used in the linked list for connection history.
struct ConnectionRecord {
    std::string timestamp;
    int port;
    bool flagged;
    ConnectionRecord* next;

    // constructor sets up a new connection record with default next pointer.
    ConnectionRecord(std::string time, int p, bool f)
        : timestamp(time), port(p), flagged(f), next(nullptr) {}
};

// this class holds all the info tracked for a single ip address.
// it stores the ip itself, a risk score, and a linked list of its connection history.
class IPRecord {
private:
    std::string ipAddress;
    int riskScore;
    int attemptCount;
    ConnectionRecord* historyHead;

public:
    // constructor sets up a new ip record with starting values.
    IPRecord(std::string ip);

    // destructor cleans up the linked list to avoid memory leaks.
    ~IPRecord();

    // this function adds a new connection attempt to the history list.
    void addConnection(std::string timestamp, int port, bool flagged);

    // this function increases the risk score by a given amount.
    void increaseRisk(int amount);

    // getters so other classes can read this ip's data.
    std::string getIP() const;
    int getRiskScore() const;
    int getAttemptCount() const;
    ConnectionRecord* getHistory() const;
};

#endif