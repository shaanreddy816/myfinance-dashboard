/**
 * Financial APIs Test Suite
 * Comprehensive testing for all financial API endpoints
 * Run: node test-financial-apis.js
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test results tracking
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

// Helper function to run tests
async function runTest(name, testFn) {
    try {
        console.log(`\n🧪 Testing: ${name}`);
        await testFn();
        results.passed++;
        results.tests.push({ name, status: 'PASS' });
        console.log(`✅ PASS: ${name}`);
    } catch (error) {
        results.failed++;
        results.tests.push({ name, status: 'FAIL', error: error.message });
        console.error(`❌ FAIL: ${name}`);
        console.error(`   Error: ${error.message}`);
    }
}

// Helper to make API calls
async function apiCall(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    return { response, data };
}

// Assertion helpers
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: Expected ${expected}, got ${actual}`);
    }
}

// ============================================
// STOCK API TESTS
// ============================================

async function testStockApiValidSymbol() {
    const { response, data } = await apiCall('/api/stocks?symbol=AAPL');
    
    assert(response.ok, 'Response should be OK');
    assert(data.success === true, 'Response should be successful');
    assert(data.data.symbol, 'Should return symbol');
    assert(typeof data.data.price === 'number', 'Price should be a number');
    assert(data.data.timestamp, 'Should have timestamp');
}

async function testStockApiInvalidSymbol() {
    const { response, data } = await apiCall('/api/stocks?symbol=INVALID123');
    
    assert(!data.success, 'Should fail for invalid symbol');
    assert(data.error, 'Should return error object');
}

async function testStockApiMissingSymbol() {
    const { response, data } = await apiCall('/api/stocks');
    
    assert(response.status === 400, 'Should return 400 for missing symbol');
    assert(!data.success, 'Should not be successful');
}

async function testStockApiBatchRequest() {
    const { response, data } = await apiCall('/api/stocks?symbols=AAPL,MSFT,GOOGL');
    
    assert(response.ok, 'Response should be OK');
    assert(data.success === true, 'Response should be successful');
    assert(Array.isArray(data.data), 'Should return array');
    assert(data.data.length === 3, 'Should return 3 results');
}

async function testStockApiCaching() {
    // First call
    const start1 = Date.now();
    const { data: data1 } = await apiCall('/api/stocks?symbol=AAPL');
    const time1 = Date.now() - start1;
    
    // Second call (should be cached)
    const start2 = Date.now();
    const { data: data2 } = await apiCall('/api/stocks?symbol=AAPL');
    const time2 = Date.now() - start2;
    
    assert(data2.data.cached === true, 'Second call should be cached');
    assert(time2 < time1, 'Cached call should be faster');
}

// ============================================
// MUTUAL FUND API TESTS
// ============================================

async function testMutualFundApiValidCode() {
    const { response, data } = await apiCall('/api/mutualfund?code=119551');
    
    assert(response.ok, 'Response should be OK');
    assert(data.success === true, 'Response should be successful');
    assert(data.data.schemeCode, 'Should return scheme code');
    assert(data.data.schemeName, 'Should return scheme name');
    assert(typeof data.data.nav === 'number', 'NAV should be a number');
}

async function testMutualFundApiInvalidCode() {
    const { response, data } = await apiCall('/api/mutualfund?code=999999999');
    
    assert(!data.success, 'Should fail for invalid code');
    assert(data.error, 'Should return error object');
}

async function testMutualFundApiNonNumericCode() {
    const { response, data } = await apiCall('/api/mutualfund?code=ABC123');
    
    assert(response.status === 400, 'Should return 400 for non-numeric code');
    assert(!data.success, 'Should not be successful');
}

async function testMutualFundApiBatchRequest() {
    const { response, data } = await apiCall('/api/mutualfund?codes=119551,120503');
    
    assert(response.ok, 'Response should be OK');
    assert(data.success === true, 'Response should be successful');
    assert(Array.isArray(data.data), 'Should return array');
}

// ============================================
// GOLD API TESTS
// ============================================

async function testGoldApiBasicPrice() {
    const { response, data } = await apiCall('/api/gold');
    
    assert(response.ok, 'Response should be OK');
    assert(data.success === true, 'Response should be successful');
    assert(typeof data.data.pricePerGram === 'number', 'Price should be a number');
    assert(data.data.currency === 'INR', 'Currency should be INR');
}

async function testGoldApiWithWeight() {
    const { response, data } = await apiCall('/api/gold?grams=10');
    
    assert(response.ok, 'Response should be OK');
    assert(data.success === true, 'Response should be successful');
    assert(data.data.weight === 10, 'Weight should be 10');
    assert(data.data.totalPrice, 'Should have total price');
}

async function testGoldApiInvalidWeight() {
    const { response, data } = await apiCall('/api/gold?grams=-5');
    
    assert(response.status === 400, 'Should return 400 for negative weight');
    assert(!data.success, 'Should not be successful');
}

async function testGoldApiExcessiveWeight() {
    const { response, data } = await apiCall('/api/gold?grams=20000');
    
    assert(response.status === 400, 'Should return 400 for excessive weight');
    assert(!data.success, 'Should not be successful');
}

// ============================================
// NEWS API TESTS
// ============================================

async function testNewsApiGeneral() {
    const { response, data } = await apiCall('/api/news?category=general&limit=5');
    
    assert(response.ok, 'Response should be OK');
    assert(data.success === true, 'Response should be successful');
    assert(Array.isArray(data.data.articles), 'Should return articles array');
    assert(data.data.articles.length <= 5, 'Should return max 5 articles');
}

async function testNewsApiInvalidCategory() {
    const { response, data } = await apiCall('/api/news?category=invalid');
    
    assert(response.status === 400, 'Should return 400 for invalid category');
    assert(!data.success, 'Should not be successful');
}

async function testNewsApiInvalidLimit() {
    const { response, data } = await apiCall('/api/news?limit=100');
    
    assert(response.status === 400, 'Should return 400 for excessive limit');
    assert(!data.success, 'Should not be successful');
}

async function testNewsApiCompanyNews() {
    const { response, data } = await apiCall('/api/news?symbol=AAPL');
    
    assert(response.ok, 'Response should be OK');
    assert(data.success === true, 'Response should be successful');
    assert(data.data.symbol === 'AAPL', 'Should return correct symbol');
}

// ============================================
// RESPONSE FORMAT TESTS
// ============================================

async function testResponseFormatSuccess() {
    const { data } = await apiCall('/api/gold');
    
    assert(data.hasOwnProperty('success'), 'Should have success field');
    assert(data.hasOwnProperty('message'), 'Should have message field');
    assert(data.hasOwnProperty('data'), 'Should have data field');
    assert(data.hasOwnProperty('timestamp'), 'Should have timestamp field');
}

async function testResponseFormatError() {
    const { data } = await apiCall('/api/stocks');
    
    assert(data.success === false, 'Success should be false');
    assert(data.hasOwnProperty('error'), 'Should have error field');
    assert(data.error.hasOwnProperty('message'), 'Error should have message');
    assert(data.error.hasOwnProperty('statusCode'), 'Error should have statusCode');
}

// ============================================
// PERFORMANCE TESTS
// ============================================

async function testResponseTime() {
    const start = Date.now();
    await apiCall('/api/gold');
    const duration = Date.now() - start;
    
    assert(duration < 5000, `Response time should be under 5s (was ${duration}ms)`);
}

async function testConcurrentRequests() {
    const promises = [
        apiCall('/api/stocks?symbol=AAPL'),
        apiCall('/api/mutualfund?code=119551'),
        apiCall('/api/gold'),
        apiCall('/api/news?category=general&limit=3')
    ];
    
    const results = await Promise.all(promises);
    
    results.forEach((result, index) => {
        assert(result.data.success === true, `Request ${index + 1} should succeed`);
    });
}

// ============================================
// RUN ALL TESTS
// ============================================

async function runAllTests() {
    console.log('🚀 Starting Financial APIs Test Suite\n');
    console.log(`Testing against: ${BASE_URL}\n`);
    console.log('=' .repeat(60));
    
    // Stock API Tests
    console.log('\n📊 STOCK API TESTS');
    console.log('-'.repeat(60));
    await runTest('Stock API - Valid Symbol', testStockApiValidSymbol);
    await runTest('Stock API - Invalid Symbol', testStockApiInvalidSymbol);
    await runTest('Stock API - Missing Symbol', testStockApiMissingSymbol);
    await runTest('Stock API - Batch Request', testStockApiBatchRequest);
    await runTest('Stock API - Caching', testStockApiCaching);
    
    // Mutual Fund API Tests
    console.log('\n📈 MUTUAL FUND API TESTS');
    console.log('-'.repeat(60));
    await runTest('Mutual Fund API - Valid Code', testMutualFundApiValidCode);
    await runTest('Mutual Fund API - Invalid Code', testMutualFundApiInvalidCode);
    await runTest('Mutual Fund API - Non-Numeric Code', testMutualFundApiNonNumericCode);
    await runTest('Mutual Fund API - Batch Request', testMutualFundApiBatchRequest);
    
    // Gold API Tests
    console.log('\n🥇 GOLD API TESTS');
    console.log('-'.repeat(60));
    await runTest('Gold API - Basic Price', testGoldApiBasicPrice);
    await runTest('Gold API - With Weight', testGoldApiWithWeight);
    await runTest('Gold API - Invalid Weight', testGoldApiInvalidWeight);
    await runTest('Gold API - Excessive Weight', testGoldApiExcessiveWeight);
    
    // News API Tests
    console.log('\n📰 NEWS API TESTS');
    console.log('-'.repeat(60));
    await runTest('News API - General News', testNewsApiGeneral);
    await runTest('News API - Invalid Category', testNewsApiInvalidCategory);
    await runTest('News API - Invalid Limit', testNewsApiInvalidLimit);
    await runTest('News API - Company News', testNewsApiCompanyNews);
    
    // Response Format Tests
    console.log('\n📋 RESPONSE FORMAT TESTS');
    console.log('-'.repeat(60));
    await runTest('Response Format - Success', testResponseFormatSuccess);
    await runTest('Response Format - Error', testResponseFormatError);
    
    // Performance Tests
    console.log('\n⚡ PERFORMANCE TESTS');
    console.log('-'.repeat(60));
    await runTest('Response Time', testResponseTime);
    await runTest('Concurrent Requests', testConcurrentRequests);
    
    // Print Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
    
    if (results.failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        results.tests.filter(t => t.status === 'FAIL').forEach(t => {
            console.log(`   - ${t.name}: ${t.error}`);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
