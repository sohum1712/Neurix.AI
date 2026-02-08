# Neurix.ai Rebrand: Visual Design System

## 1. High-Level Visual Direction
**Concept:** "Raw & Grounded Wellness"
We are stripping away the clinical, sterile, and over-softened aesthetic typical of mental health platforms. No more gradient blobs. No more corporate Memojis.
Neurix will feel like a high-end editorial magazine or a brutalist architectural portfolio. The design relies on high-contrast typography, raw material textures (grain, noise), and a strict, visible grid system. It communicates stability, clarity, and directness—traits essential for mental clarity. The interface is not just a container; it is a grounded environment.

**Core Pillars:**
- **Editorial over SaaS:** Layouts that prioritize reading rhythm and typographic hierarchy over efficient card packing.
- **Architectural Structure:** Visible structural lines, purposeful negative space, and asymmetric compositions that guide the eye.
- **Digital Tactility:** Subtle grain, noise, and sharp borders to give the interface a "physical" presence.

## 2. Typography System
User Interface fonts are banished. We use typefaces with distinct personality.

**Display / Headings:**
- **Typeface:** **Clash Display** (Variable) or **Syne**
- **Characteristics:** High contrast, sharp terminals, structural.
- **Usage:** Massive hero headers, section titles using 80px+ scale. Tracking tightened (-2%).

**Body Copy:**
- **Typeface:** **General Sans** or **Satoshi**
- **Characteristics:** Grotesque with open apertures, distinct from Inter/Roboto.
- **Usage:** Long-form content, UI labels. Readable but geometric.

**Code / Technical Details:**
- **Typeface:** **JetBrains Mono** or **Space Mono**
- **Characteristics:** Humanist monospace.
- **Usage:** Metadata, timestamps, tags, small technical readouts.

## 3. Color System
**Palette Name:** "Obsidian & Ember"
A decided dark mode. Not just "dark grey", but a rich, warm charcoal black.

**CSS Variables:**
```css
:root {
  /* Base - The Void */
  --bg-primary: #0a0a09;
  --bg-secondary: #141412;
  --bg-tertiary: #1f1f1d;

  /* Typography */
  --text-primary: #ededec;
  --text-secondary: #a1a1aa;
  --text-muted: #52525b;

  /* Accents - The Spark */
  --color-accent-main: #ff3e00; /* International Orange */
  --color-accent-soft: #ff8c00;
  --color-acid: #ccff00;        /* Acid Lime (for status/alerts) */

  /* Structural */
  --border-strong: #333330;
  --border-subtle: #222220;
}
```

**Usage Rules:**
- Backgrounds are primarily `bg-primary`.
- Panels/Cards are `bg-secondary` with `border-strong`.
- `color-accent-main` is used sparingly for primary actions and focus states.
- **NO** gradients. Flat, solid colors only.

## 4. Layout & Composition
We reject the 12-column symmetrical grid for main sections.

**Philosophy:**
- **Asymmetry:** Offset headlines against body copy.
- **Sticky Headers/Sidebars:** Technical, dashboard-like persistent navigation frames.
- **Whitespace as Tension:** Massive margins to create breathing room, followed by dense information clusters.
- **Borders:** Thin, 1px borders separating sections, reminiscent of blueprint lines.

**Section Structure:**
- **Hero:** Full height, massive typography left-aligned, abstract geometric 3D element or dithered photography right-aligned.
- **Content:** Single-column reading width (60ch) for readability, flanked by sticky metadata rails.

## 5. Motion & Interaction
Motion is structural, not decorative.

**Entry Animations:**
- **Staggered Reveal:** Text slides up from a clip-path (100% -> 0%).
- **Duration:** 0.6s - 0.8s (Slow, deliberate).
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (The "Expo" ease).

**Micro-interactions:**
- **Hover:** Sharp color inversion (Black on White -> White on Orange). No "fades" or "glows".
- **Scroll:** Parallax effect on large typography vs images.

## 6. Backgrounds & Depth
- **Texture:** A global CSS overlay of SVG noise at 3% opacity to kill color banding and add tactility.
- **Depth:** Achieved through strict layering (z-index) and borders, not drop-shadows. Shadows are hard-edge (box-shadow: 4px 4px 0px 0px black) if used at all.

## 7. Before vs After
| Feature | Old Design (Neurix Legacy) | New Design (Anti-Slop) |
| :--- | :--- | :--- |
| **Vibe** | Generic SaaS, "Friendly" Blue | High-Fashion Editorial, Strong |
| **Type** | Inter/System Fonts | Clash Display & General Sans |
| **Color** | Blue/Purple Gradients | Charcoal, Off-White, Neon Orange |
| **Layout** | Centered Cards, 3-column grid | Asymmetric splint-screen, visible borders |
| **Motion** | Default Fades | Staggered Mask Reveals |
| **Shadows**| Soft Blur Drop Shadows | Hard Edges or No Shadows |
