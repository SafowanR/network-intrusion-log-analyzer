#include <iostream>
#include <string>
#include "LogAnalyzer.hpp"
#include "TestSuite.hpp"
#include "PerformanceTest.hpp"

using namespace std;

// this function shows the menu options to the user every loop.
void showMenu() {
    cout << "\n===== Network Intrusion Log Analyzer =====" << endl;
    cout << "1. Add a connection log entry" << endl;
    cout << "2. Look up an ip address" << endl;
    cout << "3. Print risk report" << endl;
    cout << "4. Show tracked ip count" << endl;
    cout << "5. Run test suite" << endl;
    cout << "6. Run performance comparison" << endl;
    cout << "7. Exit" << endl;
    cout << "Enter your choice: ";
}

// this function handles adding a new connection entry from user input.
void addConnectionEntry(LogAnalyzer& analyzer) {
    string ip, timestamp;
    int port;
    string flaggedInput;
    bool flagged;

    cout << "Enter ip address: ";
    cin >> ip;

    cout << "Enter timestamp (example 2026-07-29 10:00): ";
    cin.ignore();
    getline(cin, timestamp);

    cout << "Enter port number: ";
    while (!(cin >> port)) {
        cout << "Invalid input. Enter a number for port: ";
        cin.clear();
        cin.ignore(1000, '\n');
    }

    cout << "Was this connection flagged as suspicious? (y/n): ";
    cin >> flaggedInput;
    flagged = (flaggedInput == "y" || flaggedInput == "Y");

    analyzer.processConnection(ip, timestamp, port, flagged);
    cout << "Connection entry added." << endl;
}

// this function looks up an ip and prints its info if found.
void lookupIPEntry(LogAnalyzer& analyzer) {
    string ip;
    cout << "Enter ip address to look up: ";
    cin >> ip;

    IPRecord* record = analyzer.lookupIP(ip);
    if (record == nullptr) {
        cout << "That ip has not been seen." << endl;
        return;
    }

    cout << "IP: " << record->getIP() << endl;
    cout << "Risk Score: " << record->getRiskScore() << endl;
    cout << "Attempt Count: " << record->getAttemptCount() << endl;
}

// main function runs the menu loop until the user chooses to exit.
int main() {
    LogAnalyzer analyzer;
    int choice = 0;

    while (choice != 7) {
        showMenu();

        // input validation in case the user types something that is not a number.
        while (!(cin >> choice)) {
            cout << "Invalid input. Enter a number from the menu: ";
            cin.clear();
            cin.ignore(1000, '\n');
        }

        // this switch routes the user to the correct function based on their choice.
        switch (choice) {
            case 1:
                addConnectionEntry(analyzer);
                break;
            case 2:
                lookupIPEntry(analyzer);
                break;
            case 3:
                analyzer.printRiskReport();
                break;
            case 4:
                cout << "Tracked ips: " << analyzer.getTrackedCount() << endl;
                break;
            case 5: {
                TestSuite tests;
                tests.runAllTests();
                break;
            }
            case 6: {
                PerformanceTest test;
                test.runComparison();
                break;
            }
            case 7:
                cout << "Exiting program." << endl;
                break;
            default:
                cout << "Invalid choice. Try again." << endl;
        }
    }

    return 0;
}