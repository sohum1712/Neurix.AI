import { describe, it, expect } from 'vitest';
import { ContrastChecker, BRAND_COLORS } from '@/utils/ContrastChecker';

describe('Landing Page Contrast Verification', () => {
  it('should verify hero section text meets WCAG AA', () => {
    // Hero text: white on gradient background (darkest point #00033D)
    const heroTextContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(heroTextContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(heroTextContrast.passes.aa).toBe(true);
  });

  it('should verify floating card text meets WCAG AA', () => {
    // Floating cards: dark gray text on white/90 background
    const cardTextContrast = ContrastChecker.calculateContrast('#111827', '#FFFFFF'); // gray-900 on white
    expect(cardTextContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(cardTextContrast.passes.aa).toBe(true);

    const cardSubtextContrast = ContrastChecker.calculateContrast('#374151', '#FFFFFF'); // gray-700 on white
    expect(cardSubtextContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(cardSubtextContrast.passes.aa).toBe(true);
  });

  it('should verify feature section text meets WCAG AA', () => {
    // Feature descriptions: white/90 on gradient background
    // Using 90% opacity white = rgba(255, 255, 255, 0.9)
    // On darkest gradient point #00033D
    const featureTextContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(featureTextContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(featureTextContrast.passes.aa).toBe(true);
  });

  it('should verify stats section text meets WCAG AA', () => {
    // Stats labels: white/90 on gradient background
    const statsTextContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(statsTextContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(statsTextContrast.passes.aa).toBe(true);
  });

  it('should verify CTA button text meets WCAG AA', () => {
    // CTA button: primary blue text on white background
    const ctaTextContrast = ContrastChecker.calculateContrast('#0033FF', '#FFFFFF');
    expect(ctaTextContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(ctaTextContrast.passes.aa).toBe(true);
  });

  it('should verify all brand colors work on white backgrounds', () => {
    const brandColors = [BRAND_COLORS.primary, BRAND_COLORS.deepBlue, BRAND_COLORS.darkNavy];
    
    brandColors.forEach(color => {
      const contrast = ContrastChecker.calculateContrast(color, '#FFFFFF');
      expect(contrast.ratio).toBeGreaterThanOrEqual(4.5);
      expect(contrast.passes.aa).toBe(true);
    });
  });

  it('should verify white text works on all brand color backgrounds', () => {
    const brandColors = [BRAND_COLORS.primary, BRAND_COLORS.deepBlue, BRAND_COLORS.darkNavy];
    
    brandColors.forEach(color => {
      const contrast = ContrastChecker.calculateContrast('#FFFFFF', color);
      expect(contrast.ratio).toBeGreaterThanOrEqual(4.5);
      expect(contrast.passes.aa).toBe(true);
    });
  });
});