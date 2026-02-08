import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { propertyTestConfig } from './arbitraries';

/**
 * Feature: codebase-improvements, Property 21: Test runner configuration
 * Validates: Requirements 6.5
 * 
 * This property test verifies that the test infrastructure is properly configured
 * and can execute property-based tests with the required number of iterations.
 */
describe('Feature: codebase-improvements, Property 21: Test runner configuration', () => {
  it('should run property tests with minimum 100 iterations', () => {
    let iterationCount = 0;
    
    fc.assert(
      fc.property(
        fc.integer(),
        (_value) => {
          iterationCount++;
          return true;
        }
      ),
      { numRuns: propertyTestConfig.numRuns }
    );
    
    // Verify that the test ran at least 100 times
    expect(iterationCount).toBeGreaterThanOrEqual(100);
  });

  it('should support arbitrary generators for domain objects', () => {
    // Test that we can generate various types of data
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer(),
        fc.boolean(),
        fc.array(fc.string()),
        (str, num, bool, arr) => {
          // Verify types are correct
          expect(typeof str).toBe('string');
          expect(typeof num).toBe('number');
          expect(typeof bool).toBe('boolean');
          expect(Array.isArray(arr)).toBe(true);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle test failures correctly', () => {
    // This test verifies that property test failures are caught
    expect(() => {
      fc.assert(
        fc.property(
          fc.integer(),
          (n) => {
            // This will fail for negative numbers
            return n >= 0;
          }
        ),
        { numRuns: 100 }
      );
    }).toThrow();
  });

  it('should support custom arbitraries', () => {
    // Create a custom arbitrary for email-like strings
    const emailArbitrary = fc
      .tuple(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z0-9]+$/.test(s)),
        fc.constantFrom('gmail.com', 'yahoo.com', 'example.com')
      )
      .map(([name, domain]) => `${name}@${domain}`);

    fc.assert(
      fc.property(
        emailArbitrary,
        (email) => {
          // Verify email format
          expect(email).toMatch(/@/);
          expect(email.split('@')).toHaveLength(2);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should support shrinking to find minimal failing cases', () => {
    // This test demonstrates shrinking behavior
    // When a property fails, fast-check tries to find the smallest input that fails
    let smallestFailingValue: number | null = null;

    try {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          (n) => {
            if (n > 50) {
              smallestFailingValue = n;
              return false;
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    } catch (error) {
      // The test should fail, and fast-check should shrink to find n=51
      expect(smallestFailingValue).toBeDefined();
      expect(smallestFailingValue).toBeGreaterThan(50);
    }
  });

  it('should support seeded random generation for reproducibility', () => {
    const seed = 42;
    const results1: number[] = [];
    const results2: number[] = [];

    // Run with same seed twice
    fc.assert(
      fc.property(
        fc.integer(),
        (n) => {
          results1.push(n);
          return true;
        }
      ),
      { numRuns: 10, seed }
    );

    fc.assert(
      fc.property(
        fc.integer(),
        (n) => {
          results2.push(n);
          return true;
        }
      ),
      { numRuns: 10, seed }
    );

    // With the same seed, we should get the same sequence
    expect(results1).toEqual(results2);
  });

  it('should integrate with Vitest matchers', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          // Test that Vitest matchers work in property tests
          expect(arr).toBeInstanceOf(Array);
          expect(arr.length).toBeGreaterThanOrEqual(0);
          
          if (arr.length > 0) {
            expect(arr[0]).toBeDefined();
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
