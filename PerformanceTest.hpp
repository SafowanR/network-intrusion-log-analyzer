#ifndef PERFORMANCETEST_HPP
#define PERFORMANCETEST_HPP

// this class times how long insert and lookup take for the hash table versus the avl tree.
// it uses a large batch of generated fake ip addresses so the timing difference is visible.
class PerformanceTest {
public:
    // this function runs the full performance comparison and prints the results.
    void runComparison();

private:
    // this function generates a batch of fake ip address strings for testing.
    // count controls how many fake ips get created.
    void generateFakeIPs(int count);
};

#endif