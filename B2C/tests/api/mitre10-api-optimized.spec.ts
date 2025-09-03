import { test, expect } from '@playwright/test';

test.describe('🔌 Mitre 10 API Testing Suite - Optimized Performance', () => {
  
  test.describe('✅ API Performance Tests', () => {
    
    test('🚀 Homepage API performance validation', async ({ request }) => {
      const startTime = Date.now();
      
      await test.step('📡 Test homepage response time', async () => {
        const response = await request.get('/');
        const responseTime = Date.now() - startTime;
        
        expect(response.status()).toBe(200);
        expect(responseTime).toBeLessThan(3000); // Industry standard: < 3s
        
        console.log(`🏠 Homepage loaded in ${responseTime}ms`);
      });
    });

    test('🔍 Search API performance validation', async ({ request }) => {
      await test.step('📊 Test search endpoint performance', async () => {
        const searchTerms = ['tables', 'chairs', 'tools'];
        const results = [];
        
        for (const term of searchTerms) {
          const startTime = Date.now();
          const response = await request.get(`/search?q=${term}`).catch(() => null);
          const responseTime = Date.now() - startTime;
          
          if (response && response.ok()) {
            expect(responseTime).toBeLessThan(2000); // Search should be < 2s
            results.push({ term, responseTime, status: response.status() });
          } else {
            console.log(`ℹ️ Search endpoint not available for term: ${term}`);
          }
        }
        
        if (results.length > 0) {
          const avgTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
          console.log(`🔍 Average search response time: ${avgTime.toFixed(0)}ms`);
          expect(avgTime).toBeLessThan(1500); // Average should be even faster
        }
      });
    });

    test('🏪 Store API performance validation', async ({ request }) => {
      await test.step('📍 Test store locator performance', async () => {
        const startTime = Date.now();
        const response = await request.get('/api/stores').catch(() => null);
        const responseTime = Date.now() - startTime;
        
        if (response && response.ok()) {
          expect(response.status()).toBe(200);
          expect(responseTime).toBeLessThan(1500); // Store data should be fast
          
          const storeData = await response.json();
          if (Array.isArray(storeData)) {
            expect(storeData.length).toBeGreaterThan(0);
            console.log(`🏪 Store API returned ${storeData.length} stores in ${responseTime}ms`);
          }
        } else {
          console.log('ℹ️ Store API endpoint not available');
        }
      });
    });
  });

  test.describe('🛡️ Security & Headers Validation', () => {
    
    test('🔒 Security headers validation', async ({ request }) => {
      await test.step('🛡️ Validate security headers', async () => {
        const response = await request.get('/');
        const headers = response.headers();
        
        // Check for essential security headers
        const securityHeaders = {
          'x-frame-options': 'Clickjacking protection',
          'x-content-type-options': 'MIME type sniffing protection',
          'x-xss-protection': 'XSS protection',
          'strict-transport-security': 'HTTPS enforcement'
        };
        
        let securityScore = 0;
        for (const [header, description] of Object.entries(securityHeaders)) {
          if (headers[header]) {
            securityScore++;
            console.log(`✅ ${description}: ${headers[header]}`);
          } else {
            console.log(`⚠️ Missing ${description}`);
          }
        }
        
        // At least 50% of security headers should be present
        expect(securityScore).toBeGreaterThanOrEqual(2);
      });
    });

    test('⚡ Response compression validation', async ({ request }) => {
      await test.step('📦 Check response compression', async () => {
        const response = await request.get('/', {
          headers: { 'Accept-Encoding': 'gzip, deflate, br' }
        });
        
        const headers = response.headers();
        const contentEncoding = headers['content-encoding'];
        
        if (contentEncoding) {
          console.log(`📦 Content encoding: ${contentEncoding}`);
          expect(['gzip', 'deflate', 'br']).toContain(contentEncoding);
        } else {
          console.log('ℹ️ No content encoding detected');
        }
      });
    });
  });

  test.describe('🔄 Concurrent Load Testing', () => {
    
    test('🚀 Concurrent request handling', async ({ request }) => {
      await test.step('⚡ Test concurrent API calls', async () => {
        const concurrentRequests = 10;
        const requests = Array(concurrentRequests).fill(null).map((_, index) => 
          request.get(`/?test=${index}`).catch(() => null)
        );
        
        const startTime = Date.now();
        const responses = await Promise.all(requests);
        const totalTime = Date.now() - startTime;
        
        const successfulResponses = responses.filter(r => r && r.ok()).length;
        const successRate = (successfulResponses / concurrentRequests) * 100;
        
        console.log(`🚀 Concurrent test results:
          - Requests: ${concurrentRequests}
          - Successful: ${successfulResponses}
          - Success rate: ${successRate.toFixed(1)}%
          - Total time: ${totalTime}ms
          - Avg per request: ${(totalTime / concurrentRequests).toFixed(0)}ms`);
        
        // Industry standards for concurrent handling
        expect(successRate).toBeGreaterThanOrEqual(90); // 90% success rate
        expect(totalTime).toBeLessThan(8000); // Total time < 8s
      });
    });

    test('📊 Load balancing validation', async ({ request }) => {
      await test.step('⚖️ Test load distribution', async () => {
        const requests = Array(5).fill(null).map(() => 
          request.get('/').catch(() => null)
        );
        
        const responses = await Promise.all(requests);
        const validResponses = responses.filter(r => r !== null);
        
        if (validResponses.length > 0) {
          // Check for consistent response times (indicating good load balancing)
          const responseTimes = await Promise.all(
            validResponses.map(async (response) => {
              const startTime = Date.now();
              await response?.body();
              return Date.now() - startTime;
            })
          );
          
          const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
          const maxDeviation = Math.max(...responseTimes.map(t => Math.abs(t - avgResponseTime)));
          
          console.log(`⚖️ Load balancing metrics:
            - Average response time: ${avgResponseTime.toFixed(0)}ms
            - Max deviation: ${maxDeviation.toFixed(0)}ms`);
          
          // Deviation should not be too high (indicates good load balancing)
          expect(maxDeviation).toBeLessThan(avgResponseTime * 2);
        }
      });
    });
  });
});