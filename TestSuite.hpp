#ifndef TESTSUITE_HPP
#define TESTSUITE_HPP

#include "LogAnalyzer.hpp"

// this class runs a series of checks against the core data structures.
// each test prints pass or fail so you can confirm everything works correctly.
class TestSuite {
public:
    // this function runs every test in order and prints the results.
    void runAllTests();

private:
    // this function tests that inserting an ip makes it findable.
    void testInsert();

    // this function tests that removing an ip from the tree actually removes it.
    void testDelete();

    // this function tests that searching for an unknown ip returns null.
    void testSearch();

    // this function tests that the avl tree stays balanced after many inserts.
    void testBalancing();

    // this function tests that adding the same ip twice does not create a duplicate.
    void testCollisionHandling();
};

#endif