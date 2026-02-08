/**
 * ContrastChecker - Utility for calculating color contrast ratios and ensuring WCAG compliance
 * 
 * This utility helps ensure all text meets WCAG AA accessibility standards by:
 * - Calculating contrast ratios between foreground and background colors
 * - Determining WCAG compliance levels (AA, AAA)
 * - Suggesting accessible color alternatives from the brand palette
 * - Auditing pages for contrast violations
 */

export interface ContrastRatio {
  ratio: number;
  passes: {
    aa: boolean;
    aaa: boolean;
    aaLarge: boolean;
    aaaLarge: boolean;
  };
}

export interface ColorPair {
  foreground: string;
  background: string;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Brand color palette with guaranteed accessible combinations
 */
export const BRAND_COLORS = {
  primary: '#0033FF',
  deepBlue: '#0600AB',
  darkNavy: '#00033D',
  purple: '#977DFF',
  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * WCAG contrast ratio requirements
 */
export const WCAG_REQUIREMENTS = {
  AA_NORMAL: 4.5,      // Normal text (under 18pt or 14pt bold)
  AA_LARGE: 3.0,       // Large text (18pt+ or 14pt+ bold)
  AAA_NORMAL: 7.0,     // Enhanced normal text
  AAA_LARGE: 4.5,      // Enhanced large text
} as const;

export class ContrastChecker {
  /**
   * Parse a color string (hex, rgb, rgba) into RGB values
   * @param color - Color string in hex, rgb, or rgba format
   * @returns RGB object with r, g, b values (0-255)
   */
  static parseColor(color: string): RGB {
    // Remove whitespace
    color = color.trim();

    // Handle hex colors (#RGB or #RRGGBB)
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      
      // Short hex (#RGB)
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16),
        };
      }
      
      // Full hex (#RRGGBB)
      if (hex.length === 6) {
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
        };
      }
    }

    // Handle rgb() and rgba()
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3]),
      };
    }

    // Default to black if parsing fails
    console.warn(`Failed to parse color: ${color}, defaulting to black`);
    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Calculate relative luminance of a color
   * Formula from WCAG 2.0: https://www.w3.org/TR/WCAG20/#relativeluminancedef
   * @param rgb - RGB color object
   * @returns Relative luminance (0-1)
   */
  static getRelativeLuminance(rgb: RGB): number {
    // Convert RGB values to sRGB
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    // Apply gamma correction
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    // Calculate relative luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors
   * Formula from WCAG 2.0: (L1 + 0.05) / (L2 + 0.05)
   * where L1 is the lighter color and L2 is the darker color
   * @param foreground - Foreground color (hex, rgb, or rgba)
   * @param background - Background color (hex, rgb, or rgba)
   * @returns Contrast ratio and WCAG compliance status
   */
  static calculateContrast(foreground: string, background: string): ContrastRatio {
    const fgRgb = this.parseColor(foreground);
    const bgRgb = this.parseColor(background);

    const fgLuminance = this.getRelativeLuminance(fgRgb);
    const bgLuminance = this.getRelativeLuminance(bgRgb);

    // Ensure L1 is the lighter color
    const l1 = Math.max(fgLuminance, bgLuminance);
    const l2 = Math.min(fgLuminance, bgLuminance);

    const ratio = (l1 + 0.05) / (l2 + 0.05);

    return {
      ratio,
      passes: {
        aa: ratio >= WCAG_REQUIREMENTS.AA_NORMAL,
        aaa: ratio >= WCAG_REQUIREMENTS.AAA_NORMAL,
        aaLarge: ratio >= WCAG_REQUIREMENTS.AA_LARGE,
        aaaLarge: ratio >= WCAG_REQUIREMENTS.AAA_LARGE,
      },
    };
  }

  /**
   * Get accessible color from brand palette
   * @param background - Background color
   * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
   * @returns Accessible foreground color from brand palette
   */
  static getAccessibleColor(background: string, isLargeText: boolean = false): string {
    const minRatio = isLargeText ? WCAG_REQUIREMENTS.AA_LARGE : WCAG_REQUIREMENTS.AA_NORMAL;
    
    // Try each brand color and find the one with best contrast
    const colors = Object.values(BRAND_COLORS);
    let bestColor = BRAND_COLORS.white;
    let bestRatio = 0;

    for (const color of colors) {
      const { ratio } = this.calculateContrast(color, background);
      if (ratio >= minRatio && ratio > bestRatio) {
        bestColor = color;
        bestRatio = ratio;
      }
    }

    return bestColor;
  }

  /**
   * Validate all text elements on a page meet WCAG AA
   * @returns Array of elements failing contrast requirements
   */
  static auditPage(): HTMLElement[] {
    const failingElements: HTMLElement[] = [];
    
    // Get all text-containing elements
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label, li, td, th');
    
    textElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Skip if element has no text content
      if (!htmlElement.textContent?.trim()) {
        return;
      }

      // Get computed styles
      const styles = window.getComputedStyle(htmlElement);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Skip if background is transparent - need to check parent
      if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        return;
      }

      // Determine if text is large
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));

      // Calculate contrast
      const { ratio, passes } = this.calculateContrast(color, backgroundColor);
      const meetsRequirement = isLargeText ? passes.aaLarge : passes.aa;

      if (!meetsRequirement) {
        failingElements.push(htmlElement);
        console.warn(
          `Contrast violation: ${ratio.toFixed(2)}:1 (required: ${isLargeText ? WCAG_REQUIREMENTS.AA_LARGE : WCAG_REQUIREMENTS.AA_NORMAL}:1)`,
          {
            element: htmlElement,
            color,
            backgroundColor,
            isLargeText,
          }
        );
      }
    });

    return failingElements;
  }

  /**
   * Check if a specific color pair meets WCAG requirements
   * @param foreground - Foreground color
   * @param background - Background color
   * @param isLargeText - Whether text is large
   * @returns Whether the color pair meets WCAG AA requirements
   */
  static meetsWCAG(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const { passes } = this.calculateContrast(foreground, background);
    return isLargeText ? passes.aaLarge : passes.aa;
  }

  /**
   * Get contrast ratio as a formatted string
   * @param foreground - Foreground color
   * @param background - Background color
   * @returns Formatted contrast ratio string (e.g., "4.5:1")
   */
  static getContrastRatioString(foreground: string, background: string): string {
    const { ratio } = this.calculateContrast(foreground, background);
    return `${ratio.toFixed(2)}:1`;
  }
}
