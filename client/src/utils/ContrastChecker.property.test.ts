import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ContrastChecker, WCAG_REQUIREMENTS, BRAND_COLORS } from './ContrastChecker';
import { colorHex, colorRgb, colorRgba, propertyTestConfig } from '@/test/arbitraries';

/**
 * Feature: codebase-improvements, Property 1: Text Contrast Compliance
 * Validates: Requirements 1.1, 1.3, 1.5
 * 
 * This property test verifies that all text meets minimum contrast ratios:
 * - Normal text (under 18pt or 14pt bold): 4.5:1
 * - Large text (18pt+ or 14pt+ bold): 3:1
 */
describe('Feature: codebase-improvements, Property 1: Text Contrast Compliance', () => {
  it('should ensure all text meets minimum contrast ratios', () => {
    fc.assert(
      fc.property(
        fc.record({
          foreground: colorHex,
          background: colorHex,
          fontSize: fc.integer({ min: 12, max: 72 }),
          fontWeight: fc.constantFrom('normal', 'bold', '400', '700'),
        }),
        (config) => {
          const isLargeText = 
            config.fontSize >= 18 || 
            (config.fontSize >= 14 && (config.fontWeight === 'bold' || config.fontWeight === '700'));
          
          const minRatio = isLargeText ? WCAG_REQUIREMENTS.AA_LARGE : WCAG_REQUIREMENTS.AA_NORMAL;
          const { ratio } = ContrastChecker.calculateContrast(
            config.foreground,
            config.background
          );
          
          // If contrast is insufficient, system should be able to provide fallback color
          if (ratio < minRatio) {
            const fallbackColor = ContrastChecker.getAccessibleColor(
              config.background,
              isLargeText
            );
            const fallbackRatio = ContrastChecker.calculateContrast(
              fallbackColor,
              config.background
            );
            
            // Fallback color must meet minimum requirements
            expect(fallbackRatio.ratio).toBeGreaterThanOrEqual(minRatio);
          }
          
          return true;
        }
      ),
      { numRuns: propertyTestConfig.numRuns }
    );
  });

  it('should calculate consistent contrast ratios regardless of color format', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: 0, max: 255 })
        ),
        fc.tuple(
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: 0, max: 255 })
        ),
        ([r1, g1, b1], [r2, g2, b2]) => {
          // Create same color in different formats
          const hex1 = `#${r1.toString(16).padStart(2, '0')}${g1.toString(16).padStart(2, '0')}${b1.toString(16).padStart(2, '0')}`;
          const rgb1 = `rgb(${r1}, ${g1}, ${b1})`;
          const rgba1 = `rgba(${r1}, ${g1}, ${b1}, 1)`;
          
          const hex2 = `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
          const rgb2 = `rgb(${r2}, ${g2}, ${b2})`;
          
          // All formats should produce the same contrast ratio
          const ratioHex = ContrastChecker.calculateContrast(hex1, hex2).ratio;
          const ratioRgb = ContrastChecker.calculateContrast(rgb1, rgb2).ratio;
          const ratioRgba = ContrastChecker.calculateContrast(rgba1, hex2).ratio;
          
          // Allow small floating point differences
          expect(Math.abs(ratioHex - ratioRgb)).toBeLessThan(0.01);
          expect(Math.abs(ratioHex - ratioRgba)).toBeLessThan(0.01);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always return contrast ratio between 1 and 21', () => {
    fc.assert(
      fc.property(
        colorHex,
        colorHex,
        (fg, bg) => {
          const { ratio } = ContrastChecker.calculateContrast(fg, bg);
          
          // Contrast ratio must be between 1:1 (same color) and 21:1 (black on white)
          expect(ratio).toBeGreaterThanOrEqual(1);
          expect(ratio).toBeLessThanOrEqual(21);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return ratio of 1 for identical colors', () => {
    fc.assert(
      fc.property(
        colorHex,
        (color) => {
          const { ratio } = ContrastChecker.calculateContrast(color, color);
          
          // Same color should have contrast ratio of 1:1
          expect(ratio).toBeCloseTo(1, 1);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return same ratio regardless of foreground/background order', () => {
    fc.assert(
      fc.property(
        colorHex,
        colorHex,
        (color1, color2) => {
          const ratio1 = ContrastChecker.calculateContrast(color1, color2).ratio;
          const ratio2 = ContrastChecker.calculateContrast(color2, color1).ratio;
          
          // Contrast ratio should be symmetric
          expect(ratio1).toBeCloseTo(ratio2, 2);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly identify WCAG AA compliance', () => {
    fc.assert(
      fc.property(
        colorHex,
        colorHex,
        (fg, bg) => {
          const { ratio, passes } = ContrastChecker.calculateContrast(fg, bg);
          
          // Verify AA compliance flags match the ratio
          expect(passes.aa).toBe(ratio >= WCAG_REQUIREMENTS.AA_NORMAL);
          expect(passes.aaLarge).toBe(ratio >= WCAG_REQUIREMENTS.AA_LARGE);
          expect(passes.aaa).toBe(ratio >= WCAG_REQUIREMENTS.AAA_NORMAL);
          expect(passes.aaaLarge).toBe(ratio >= WCAG_REQUIREMENTS.AAA_LARGE);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases gracefully', () => {
    // Test with pure black and white
    const blackWhite = ContrastChecker.calculateContrast('#000000', '#FFFFFF');
    expect(blackWhite.ratio).toBeCloseTo(21, 0);
    expect(blackWhite.passes.aaa).toBe(true);
    
    // Test with same color
    const sameColor = ContrastChecker.calculateContrast('#FF0000', '#FF0000');
    expect(sameColor.ratio).toBeCloseTo(1, 1);
    expect(sameColor.passes.aa).toBe(false);
    
    // Test with near-identical colors
    const nearIdentical = ContrastChecker.calculateContrast('#FFFFFF', '#FEFEFE');
    expect(nearIdentical.ratio).toBeCloseTo(1, 0);
  });

  it('should parse all valid color formats correctly', () => {
    // Test hex colors
    const hex3 = ContrastChecker.parseColor('#FFF');
    expect(hex3).toEqual({ r: 255, g: 255, b: 255 });
    
    const hex6 = ContrastChecker.parseColor('#FFFFFF');
    expect(hex6).toEqual({ r: 255, g: 255, b: 255 });
    
    // Test rgb colors
    const rgb = ContrastChecker.parseColor('rgb(255, 0, 128)');
    expect(rgb).toEqual({ r: 255, g: 0, b: 128 });
    
    // Test rgba colors
    const rgba = ContrastChecker.parseColor('rgba(255, 0, 128, 0.5)');
    expect(rgba).toEqual({ r: 255, g: 0, b: 128 });
    
    // Test invalid color (should default to black)
    const invalid = ContrastChecker.parseColor('invalid');
    expect(invalid).toEqual({ r: 0, g: 0, b: 0 });
  });
});

/**
 * Feature: codebase-improvements, Property 3: Contrast Fallback Selection
 * Validates: Requirements 1.4
 * 
 * This property test verifies that the system can always find an accessible
 * color from the brand palette for any background color.
 */
describe('Feature: codebase-improvements, Property 3: Contrast Fallback Selection', () => {
  it('should always find accessible color from brand palette', () => {
    fc.assert(
      fc.property(
        colorHex,
        fc.boolean(),
        (background, isLargeText) => {
          const accessibleColor = ContrastChecker.getAccessibleColor(background, isLargeText);
          
          // Verify the returned color is from the brand palette
          const brandColorValues = Object.values(BRAND_COLORS);
          expect(brandColorValues).toContain(accessibleColor);
          
          // Verify it meets the minimum contrast requirement
          const minRatio = isLargeText ? WCAG_REQUIREMENTS.AA_LARGE : WCAG_REQUIREMENTS.AA_NORMAL;
          const { ratio } = ContrastChecker.calculateContrast(accessibleColor, background);
          expect(ratio).toBeGreaterThanOrEqual(minRatio);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prefer higher contrast when multiple colors meet requirements', () => {
    fc.assert(
      fc.property(
        colorHex,
        (background) => {
          const accessibleColor = ContrastChecker.getAccessibleColor(background, false);
          const { ratio } = ContrastChecker.calculateContrast(accessibleColor, background);
          
          // Check if any other brand color has significantly better contrast
          const brandColors = Object.values(BRAND_COLORS);
          for (const color of brandColors) {
            const { ratio: otherRatio } = ContrastChecker.calculateContrast(color, background);
            
            // If another color meets requirements, it shouldn't be much better
            if (otherRatio >= WCAG_REQUIREMENTS.AA_NORMAL) {
              expect(otherRatio).toBeLessThanOrEqual(ratio + 0.1);
            }
          }
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle different requirements for large vs normal text', () => {
    fc.assert(
      fc.property(
        colorHex,
        (background) => {
          const normalTextColor = ContrastChecker.getAccessibleColor(background, false);
          const largeTextColor = ContrastChecker.getAccessibleColor(background, true);
          
          // Both should meet their respective requirements
          const normalRatio = ContrastChecker.calculateContrast(normalTextColor, background).ratio;
          const largeRatio = ContrastChecker.calculateContrast(largeTextColor, background).ratio;
          
          expect(normalRatio).toBeGreaterThanOrEqual(WCAG_REQUIREMENTS.AA_NORMAL);
          expect(largeRatio).toBeGreaterThanOrEqual(WCAG_REQUIREMENTS.AA_LARGE);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
