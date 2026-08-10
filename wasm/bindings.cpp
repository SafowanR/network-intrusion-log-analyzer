#include <emscripten/bind.h>
#include "../LogAnalyzer.hpp"

using namespace emscripten;

// this file exposes the real logAnalyzer class to javascript.
// nothing about logAnalyzer, avltree, or iprecord changes at all.
// this just wraps the existing class so a webpage can call it directly.

// wrapper struct returned to javascript for a single connection history entry.
struct JSConnectionRecord {
    std::string timestamp;
    int port;
    bool flagged;
};

// wrapper struct returned to javascript summarizing one ip record.
struct JSIPRecord {
    std::string ip;
    int riskScore;
    int attemptCount;
};

// this function converts an ip record into a plain js friendly struct.
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
};

// this block registers the class and its functions so javascript can see them.
EMSCRIPTEN_BINDINGS(log_analyzer_module) {
    value_object<JSIPRecord>("JSIPRecord")
        .field("ip", &JSIPRecord::ip)
        .field("riskScore", &JSIPRecord::riskScore)
        .field("attemptCount", &JSIPRecord::attemptCount);

    class_<WebLogAnalyzer>("WebLogAnalyzer")
        .constructor<>()
        .function("processConnection", &WebLogAnalyzer::processConnection)
        .function("lookupIP", &WebLogAnalyzer::lookupIP)
        .function("getTrackedCount", &WebLogAnalyzer::getTrackedCount);
}