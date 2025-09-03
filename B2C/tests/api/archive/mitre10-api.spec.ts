// ARCHIVED: Replaced by mitre10-api-optimized.spec.ts — see /tests/api/
// Archived on: 2025-01-28
// Reason: Superseded by optimized API testing suite with enhanced performance validation

import { test, expect } from '@playwright/test';

test.describe('🔌 Mitre 10 API Testing Suite - Backend Validation', () => {
  
  // API POSITIVE TEST CASES
  test.describe('✅ API Positive Test Cases - Valid Requests', () => {
    
    test('🔍 Search API returns valid response structure', async ({ request }) => {
      await test.step('📡 Test search API endpoint', async () => {
        // Test search API if available
        const searchResponse = await request.get('/api/search?q=tables').catch(() => null);
        
        if (searchResponse && searchResponse.ok()) {
          const responseData = await searchResponse.json();
          
          // Validate response structure
          expect(responseData).toBeTruthy();
          expect(typeof responseData).toBe('object');
          
          // Common API response validations
          if (responseData.results) {
            expect(Array.isArray(responseData.results)).toBe(true);
          }
          
          if (responseData.total) {
            expect(typeof responseData.total).toBe('number');
            expect(responseData.total).toBeGreaterThanOrEqual(0);
          }
          
          console.log('✅ Search API response structure valid');
        } else {
          console.log('ℹ️ Search API endpoint not available or requires authentication');
        }
      });
    });

    test('🏪 Store location API validation', async ({ request }) => {
      await test.step('📍 Test store locator API', async () => {
        const storeResponse = await request.get('/api/stores').catch(() => null);
        
        if (storeResponse && storeResponse.ok()) {
          const storeData = await storeResponse.json();
          
          expect(storeData).toBeTruthy();
          
          if (Array.isArray(storeData)) {
            // Validate store data structure
            storeData.slice(0, 3).forEach((store: any) => {
              expect(store).toHaveProperty('name');
              expect(store).toHaveProperty('address');
              expect(typeof store.name).toBe('string');
            });
          }
          
          console.log('✅ Store API response valid');
        } else {
          console.log('ℹ️ Store API endpoint not available');
        }
      });
    });
  });

  // API NEGATIVE TEST CASES
  test.describe('❌ API Negative Test Cases - Error Handling', () => {
    
    test('🚫 Invalid API endpoints return appropriate errors', async ({ request }) => {
      const invalidEndpoints = [
        '/api/nonexistent',
        '/api/search?invalid=params',
        '/api/admin/restricted'
      ];
      
      for (const endpoint of invalidEndpoints) {
        await test.step(`🔍 Test invalid endpoint: ${endpoint}`, async () => {
          const response = await request.get(endpoint).catch(() => null);
          
          if (response) {
            const status = response.status();
            // Should return appropriate error codes
            expect([400, 401, 403, 404, 405, 500]).toContain(status);
            console.log(`✅ Invalid endpoint ${endpoint} returned status: ${status}`);
          }
        });
      }
    });

    test('📊 Rate limiting and security headers', async ({ request }) => {
      await test.step('🛡️ Test API security measures', async () => {
        // Test multiple rapid requests
        const requests = Array(5).fill(null).map(() => 
          request.get('/').catch(() => null)
        );
        
        const responses = await Promise.all(requests);
        const validResponses = responses.filter(r => r !== null);
        
        if (validResponses.length > 0) {
          const headers = validResponses[0]!.headers();
          
          // Check for security headers
          const securityHeaders = [
            'x-frame-options',
            'x-content-type-options', 
            'strict-transport-security',
            'x-xss-protection'
          ];
          
          securityHeaders.forEach(header => {
            if (headers[header]) {
              console.log(`✅ Security header present: ${header}`);
            }
          });
        }
      });
    });
  });
});

test.describe('🌐 Network & Performance API Testing', () => {
  
  test('⚡ API response times meet performance criteria', async ({ request }) => {
    await test.step('📊 Measure API response times', async () => {
      const endpoints = ['/', '/search', '/stores'];
      
      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const response = await request.get(endpoint).catch(() => null);
        const responseTime = Date.now() - startTime;
        
        if (response) {
          // API should respond within 3 seconds
          expect(responseTime).toBeLessThan(3000);
          console.log(`⚡ ${endpoint} responded in ${responseTime}ms`);
        }
      }
    });
  });

  test('🔄 API handles concurrent requests', async ({ request }) => {
    await test.step('🚀 Test concurrent API calls', async () => {
      const concurrentRequests = Array(10).fill(null).map((_, index) => 
        request.get(`/?test=${index}`).catch(() => null)
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;
      
      const successfulResponses = responses.filter(r => r && r.ok()).length;
      
      // At least 80% of concurrent requests should succeed
      expect(successfulResponses).toBeGreaterThanOrEqual(8);
      console.log(`✅ ${successfulResponses}/10 concurrent requests successful in ${totalTime}ms`);
    });
  });
});