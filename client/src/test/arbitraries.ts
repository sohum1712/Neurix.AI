import fc from 'fast-check';

/**
 * Arbitrary generators for domain objects used in property-based testing
 */

/**
 * Generate random hex color strings
 */
export const colorHex = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  )
  .map(([r, g, b]) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  });

/**
 * Generate random RGB color strings
 */
export const colorRgb = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  )
  .map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`);

/**
 * Generate random RGBA color strings
 */
export const colorRgba = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.double({ min: 0, max: 1 })
  )
  .map(([r, g, b, a]) => `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`);

/**
 * Generate any valid color format
 */
export const color = fc.oneof(colorHex, colorRgb, colorRgba);

/**
 * Generate user objects
 */
export const user = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  fullName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
  avatarUrl: fc.option(fc.webUrl()),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

/**
 * Generate session configuration objects
 */
export const sessionConfig = fc.record({
  duration: fc.integer({ min: 300, max: 3600 }), // 5 min to 1 hour
  replicaId: fc.uuid(),
  conversationId: fc.uuid(),
});

/**
 * Generate session state objects
 */
export const sessionState = fc.record({
  status: fc.constantFrom('idle', 'connecting', 'active', 'ended', 'error'),
  startTime: fc.option(fc.date()),
  endTime: fc.option(fc.date()),
  error: fc.option(fc.string()),
});

/**
 * Generate error objects
 */
export const error = fc.record({
  message: fc.string({ minLength: 1 }),
  code: fc.option(fc.string()),
  stack: fc.option(fc.string()),
});

/**
 * Generate API error objects
 */
export const apiError = fc.record({
  code: fc.string({ minLength: 1 }),
  message: fc.string({ minLength: 1 }),
  details: fc.option(fc.dictionary(fc.string(), fc.anything())),
});

/**
 * Generate form data objects
 */
export const formData = fc.dictionary(
  fc.string({ minLength: 1 }),
  fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.constant(null),
    fc.constant(undefined)
  )
);

/**
 * Generate email addresses
 */
export const email = fc.emailAddress();

/**
 * Generate passwords (various strengths)
 */
export const password = fc.oneof(
  fc.string({ minLength: 8, maxLength: 20 }), // Simple password
  fc.string({ minLength: 12, maxLength: 30 }), // Medium password
  fc
    .tuple(
      fc.string({ minLength: 8 }),
      fc.integer({ min: 0, max: 9 }),
      fc.constantFrom('!', '@', '#', '$', '%', '^', '&', '*')
    )
    .map(([str, num, special]) => `${str}${num}${special}`) // Strong password
);

/**
 * Property test configuration
 */
export const propertyTestConfig = {
  numRuns: 100,
  verbose: true,
  seed: Date.now(),
};
