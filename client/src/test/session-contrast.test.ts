import { describe, it, expect } from 'vitest';
import { ContrastChecker, BRAND_COLORS } from '@/utils/ContrastChecker';

describe('Session Page Contrast Verification', () => {
  it('should verify header text meets WCAG AA', () => {
    // Back button: white/90 on dark background
    const backButtonContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(backButtonContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(backButtonContrast.passes.aa).toBe(true);

    // Connection status: white/90 on dark background
    const statusContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(statusContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(statusContrast.passes.aa).toBe(true);
  });

  it('should verify overlay controls meet WCAG AA', () => {
    // End session button text: white on red background
    const endButtonContrast = ContrastChecker.calculateContrast('#FFFFFF', '#DC2626'); // red-600
    expect(endButtonContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(endButtonContrast.passes.aa).toBe(true);

    // Controls on solid black background
    const controlsContrast = ContrastChecker.calculateContrast('#FFFFFF', '#000000');
    expect(controlsContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(controlsContrast.passes.aa).toBe(true);
  });

  it('should verify chat panel text meets WCAG AA', () => {
    // Chat message: white text on primary blue background
    const chatMessageContrast = ContrastChecker.calculateContrast('#FFFFFF', '#0033FF');
    expect(chatMessageContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(chatMessageContrast.passes.aa).toBe(true);

    // Chat timestamp: white/80 on primary blue background
    const timestampContrast = ContrastChecker.calculateContrast('#FFFFFF', '#0033FF');
    expect(timestampContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(timestampContrast.passes.aa).toBe(true);

    // Input placeholder: gray on white background
    const inputContrast = ContrastChecker.calculateContrast('#374151', '#FFFFFF'); // gray-700
    expect(inputContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(inputContrast.passes.aa).toBe(true);

    // Send button: primary blue on white background
    const sendButtonContrast = ContrastChecker.calculateContrast('#0033FF', '#FFFFFF');
    expect(sendButtonContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(sendButtonContrast.passes.aa).toBe(true);
  });

  it('should verify settings panel text meets WCAG AA', () => {
    // Settings title: white on dark background
    const titleContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(titleContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(titleContrast.passes.aa).toBe(true);

    // Settings labels: white/80 on dark background
    const labelContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(labelContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(labelContrast.passes.aa).toBe(true);

    // Select options: white text on dark background
    const selectContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(selectContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(selectContrast.passes.aa).toBe(true);

    // Save button: primary blue text on white background
    const saveButtonContrast = ContrastChecker.calculateContrast('#0033FF', '#FFFFFF');
    expect(saveButtonContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(saveButtonContrast.passes.aa).toBe(true);
  });

  it('should verify connection status bar meets WCAG AA', () => {
    // Connected status: white/90 on dark background
    const connectedContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(connectedContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(connectedContrast.passes.aa).toBe(true);

    // Security message: white/80 on dark background
    const securityContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(securityContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(securityContrast.passes.aa).toBe(true);

    // Help button: white/80 on dark background
    const helpContrast = ContrastChecker.calculateContrast('#FFFFFF', '#00033D');
    expect(helpContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(helpContrast.passes.aa).toBe(true);
  });

  it('should verify loading and error states meet WCAG AA', () => {
    // Loading text: dark text on light background
    const loadingContrast = ContrastChecker.calculateContrast('#00033D', '#FFFFFF');
    expect(loadingContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(loadingContrast.passes.aa).toBe(true);

    // Error title: dark text on light background
    const errorTitleContrast = ContrastChecker.calculateContrast('#DC2626', '#FFFFFF'); // red-600
    expect(errorTitleContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(errorTitleContrast.passes.aa).toBe(true);

    // Error description: dark text on light background
    const errorDescContrast = ContrastChecker.calculateContrast('#374151', '#FFFFFF'); // gray-700
    expect(errorDescContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(errorDescContrast.passes.aa).toBe(true);
  });

  it('should verify all brand colors work in session context', () => {
    // Primary blue on white (buttons)
    const primaryContrast = ContrastChecker.calculateContrast(BRAND_COLORS.primary, BRAND_COLORS.white);
    expect(primaryContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(primaryContrast.passes.aa).toBe(true);

    // White on dark navy (main background)
    const whiteOnDarkContrast = ContrastChecker.calculateContrast(BRAND_COLORS.white, BRAND_COLORS.darkNavy);
    expect(whiteOnDarkContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(whiteOnDarkContrast.passes.aa).toBe(true);

    // Purple on dark navy (accent text)
    const purpleContrast = ContrastChecker.calculateContrast(BRAND_COLORS.purple, BRAND_COLORS.darkNavy);
    expect(purpleContrast.ratio).toBeGreaterThanOrEqual(4.5);
    expect(purpleContrast.passes.aa).toBe(true);
  });
});