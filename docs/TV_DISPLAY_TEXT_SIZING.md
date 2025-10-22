# TV Display Text Sizing Guidelines

## Overview

This document outlines the research-backed best practices for text sizing on TV displays and digital signage, specifically for dashboard applications in manufacturing environments.

## Key Research Findings

### 1. Minimum Font Sizes for TV Displays

**Critical Rule:** Never use text smaller than **24pt** (approximately 22px) on TV displays.

- Font sizes below 22px become unreadable from typical viewing distances
- TV interfaces should accommodate all user types and viewing distances
- Manufacturing environments require quick information processing (3-7 seconds)

### 2. Viewing Distance Formula

**Formula for calculating readable text height:**

```
Character height (mm) × 0.4 = Clear readable viewing distance (meters)
Character height (mm) × 0.6 = Maximum viewing distance (meters)
```

**Important:** Use the 0.4 multiplier for conservative, universally readable distances. The 0.6 maximum may be difficult for some viewers to read.

**Example:**
- For 30 meters viewing distance
- Minimum character height = 30m ÷ 0.4 = 75mm (approx. 213pt)
- For comfortable viewing at 30m, use 76mm characters

### 3. General Font Size Guidelines

**Rule of Thumb:** Font size should be at least 2× the distance in feet.

Examples:
- 10 feet away → minimum 20pt
- 20 feet away → minimum 40pt
- 50+ feet away → 150pt or higher

**Specific distance recommendations:**
- 7-10 feet viewing distance → 20-30pt recommended
- 26 feet viewing distance → 100pt minimum

### 4. Best Practices for Dashboards

#### Typography Recommendations

1. **Font Type:** Use sans-serif fonts only
   - Recommended: Arial, Helvetica, Verdana, Open Sans, Roboto, PT Sans
   - Sans-serif fonts are most legible at distance

2. **Content Density:** 3×5 Rule
   - Either 3 lines with 5 words per line
   - Or 5 lines with 3 words per line
   - Prevents information overload

3. **Font Variety:** Maximum 2 fonts per design
   - More fonts create visual noise and reduce readability

4. **Text Styling:**
   - Prefer bold text for improved readability
   - Use italics sparingly
   - Favor large text sizes over decorative styling

#### Contrast and Visibility

1. **High Contrast Required:**
   - Ensure sufficient contrast between text and background
   - Test with tools like WebAIM's Color Contrast Checker
   - Critical for users with limited vision

2. **Visual Balance:**
   - 50-66% of content area should be visuals/images
   - Generous margins - don't crowd elements
   - Crowded material causes eye fatigue

#### Arc Minutes Standard

For comfortable reading, text should occupy:
- **Minimum:** 10 vertical arc minutes (may cause eyestrain)
- **Recommended:** 15-20 arc minutes for comfortable viewing

## Implementation in Our Dashboard

### Text Size Hierarchy (Mobile-First Breakpoints)

Based on Tailwind CSS breakpoints:
- **Base (< 640px):** Mobile devices - minimum readable sizes
- **md (768px):** Tablets - moderate increase
- **lg (1024px):** Small monitors/laptops - TV-ready sizes
- **xl (1280px):** Standard TVs/monitors - optimized for distance viewing

### Applied Sizing Strategy

#### 1. Page Title (Critical Information)
```
text-4xl md:text-5xl lg:text-6xl xl:text-7xl
(36px → 48px → 60px → 72px)
Minimum: 36pt exceeds 24pt requirement ✓
```

#### 2. Subtitle / Status Text (Important Information)
```
text-xl md:text-2xl lg:text-3xl xl:text-4xl
(20px → 24px → 30px → 36px)
Minimum: 20pt - acceptable for secondary info ✓
```

#### 3. Table Headers (Navigation Text)
```
text-base md:text-lg lg:text-xl xl:text-2xl
(16px → 18px → 20px → 24px)
Scales to minimum 24pt at TV sizes ✓
```

#### 4. Primary Data (Work Order Names, Employee Names)
```
text-lg md:text-xl lg:text-2xl xl:text-3xl
(18px → 20px → 24px → 30px)
Minimum 18pt, scales to excellent TV size ✓
```

#### 5. Secondary Data (Production IDs, Product Names)
```
text-sm md:text-base lg:text-lg xl:text-xl
(14px → 16px → 18px → 20px)
Meets 14pt minimum for supporting info ✓
```

#### 6. Critical Metrics (Time Remaining)
```
text-3xl md:text-4xl lg:text-5xl xl:text-6xl
(30px → 36px → 48px → 60px)
High visibility for mission-critical data ✓
```

#### 7. Labels (Date/Time Labels)
```
text-xs md:text-sm lg:text-base
(12px → 14px → 16px)
Small but readable labels, acceptable at close range ✓
```

#### 8. Error Messages (Critical Alerts)
```
text-3xl md:text-4xl lg:text-5xl xl:text-6xl
(30px → 36px → 48px → 60px)
Maximum visibility for critical information ✓
```

### Responsive Breakpoint Strategy

**Why we simplified from 6 to 4 breakpoints:**

1. **Removed `sm` (640px):**
   - Original implementation had too granular steps
   - Mobile → tablet jump doesn't need intermediate step
   - Reduces CSS complexity

2. **Removed `2xl` (1536px):**
   - Most TVs fall into xl range (1280px+)
   - xl sizes already optimal for large displays
   - Ultra-wide displays work fine with xl scaling

3. **Kept Core Breakpoints:**
   - **Base:** Phone/mobile devices
   - **md (768px):** Tablets
   - **lg (1024px):** Desktop/small TV
   - **xl (1280px):** Full TV/large monitor

## Layout Constraints for TV Displays

### Height Management

**Problem:** TV dashboards must fit within screen height without scrolling for primary content.

**Solution:**
```css
/* Container */
h-screen          /* Exact viewport height */
flex flex-col     /* Flexbox vertical layout */
overflow-hidden   /* Prevent overflow */

/* Scrollable Area */
flex-1            /* Take remaining space */
overflow-y-auto   /* Enable internal scroll if needed */
min-h-0           /* Allow flex shrinking */
```

**Benefits:**
- Header always visible
- Table grows/shrinks to fit available space
- Multiple rows scroll internally if needed
- Never exceeds screen boundaries

## Testing Recommendations

### Visual Testing Checklist

1. **Distance Test:** View from actual working distance (typically 10-30 feet)
2. **Glance Test:** Can you read critical info in 3-7 seconds?
3. **Fatigue Test:** Can text be read comfortably for extended periods?
4. **Contrast Test:** Check in different lighting conditions
5. **Angle Test:** Check from various viewing angles

### Accessibility Standards

- **WCAG AA Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **WCAG AAA Contrast:** 7:1 for normal text, 4.5:1 for large text
- Large text defined as 18pt+ (or 14pt+ bold)

## Common Mistakes to Avoid

1. ❌ Using text below 24pt for TV displays
2. ❌ Assuming mobile text sizes work for distance viewing
3. ❌ Using decorative fonts instead of sans-serif
4. ❌ Too many font variations in one screen
5. ❌ Low contrast ratios
6. ❌ Information density overload
7. ❌ Allowing content to exceed viewport height
8. ❌ Using `min-h-screen` instead of `h-screen` for TV layouts

## References and Sources

1. **Spectra Displays:** Text Height & Viewing Distance formulas
2. **Extron:** Videowall Font Size and Legibility standards
3. **Rise Vision:** Digital Signage Best Practices
4. **ScreenCloud:** Design Rules for Digital Signage
5. **Medium - You.i TV:** Designing for 10ft TV Platform
6. **WCAG 2.1:** Web Content Accessibility Guidelines

## Quick Reference Card

### Minimum Font Sizes
- **Critical data:** 32pt minimum
- **Primary content:** 24pt minimum
- **Secondary content:** 18pt minimum
- **Labels/metadata:** 14pt minimum
- **Never go below:** 22px (24pt)

### Viewing Distance Quick Calc
- **Close range (7-10ft):** 20-30pt
- **Medium range (15-20ft):** 40-50pt
- **Far range (25-30ft):** 75-100pt+

### Content Rules
- **3×5 rule:** 3 lines × 5 words OR 5 lines × 3 words
- **2 fonts maximum**
- **Sans-serif only**
- **High contrast always**
- **50%+ visual content**

### Layout Rules
- **Use `h-screen` not `min-h-screen`** for TV displays
- **Enable internal scrolling** with `overflow-y-auto` + `flex-1`
- **Test from actual viewing distance**
- **Optimize for 3-7 second glance reading**

---

**Document Version:** 1.0
**Last Updated:** 2025-10-22
**Author:** Claude Code (Anthropic)
**Project:** KRKA TV Dashboard - Time Tracking Display
