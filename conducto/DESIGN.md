---
name: Duoc UC Parking Management
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#43474f'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#3a5f94'
  primary: '#001e40'
  on-primary: '#ffffff'
  primary-container: '#003366'
  on-primary-container: '#799dd6'
  inverse-primary: '#a7c8ff'
  secondary: '#745b00'
  on-secondary: '#ffffff'
  secondary-container: '#fecb00'
  on-secondary-container: '#6e5700'
  tertiary: '#381300'
  on-tertiary: '#ffffff'
  tertiary-container: '#592300'
  on-tertiary-container: '#d8885c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#1f477b'
  secondary-fixed: '#ffe08b'
  secondary-fixed-dim: '#f1c100'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#723610'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 20px
  gutter-mobile: 16px
---

## Brand & Style
The brand personality for the design system is professional, efficient, and highly accessible. It is tailored for students, faculty, and administrative staff within an educational environment, requiring a UI that feels authoritative yet effortless to navigate.

The design style is **Corporate / Modern** with strong influences from the **Apple Human Interface Guidelines (HIG)**. It emphasizes clarity through generous white space, a structured layout, and a focus on high-legibility typography. The aesthetic is "premium utility"—functional enough for high-frequency use in a parking context, but polished enough to represent an institutional brand. Visual hierarchy is established through subtle depth, soft shadows, and a restricted, meaningful color palette.

## Colors
This design system utilizes a high-contrast palette to ensure visibility in outdoor or bright environments typical for parking management.

- **Primary (Institutional Navy):** Used for navigation bars, primary actions, and brand identification. It conveys trust and stability.
- **Secondary (Mustard Yellow):** Reserved for high-importance highlights, warnings, or specific "active" states like a reserved parking spot. Use sparingly to maintain its impact.
- **Surface (Light Gray):** The neutral `#F5F7FA` is used for container backgrounds and card fills to separate content from the pure white background.
- **Typography:** Deep charcoal is used for primary text to avoid the harshness of pure black, while slate grays are used for secondary labels and hints.

## Typography
**Inter** is the core typeface for the design system. Its neutral, systematic nature ensures that information density remains manageable on mobile screens.

- **Headlines:** Use Bold or Semi-Bold weights with tighter letter spacing for a modern, compact look.
- **Body:** Standardized at 16px for readability. Use the `body-md` (14px) for secondary information or metadata within lists.
- **Labels:** Use Medium or Semi-Bold weights for interactive elements like button text and chip labels to distinguish them from static body copy.

## Layout & Spacing
The layout follows a **fluid grid** model optimized for mobile-first interaction. 

- **Safe Zones:** A standard 20px margin is maintained on the left and right edges of the screen.
- **Vertical Rhythm:** Elements are spaced using an 8pt grid system. Components within a card use `sm` (12px) spacing, while sections are separated by `lg` (24px) or `xl` (32px) to provide maximum white space.
- **Touch Targets:** Interactive elements must maintain a minimum height of 44px to ensure accessibility, even if the visual element (like a small toggle) appears smaller.

## Elevation & Depth
Depth is created using **Ambient Shadows** and **Tonal Layers**. 

- **Level 0 (Background):** Pure White (#FFFFFF).
- **Level 1 (Containers):** The neutral light gray (#F5F7FA) fill with no shadow, used for secondary groupings.
- **Level 2 (Cards):** White background with a soft, diffused shadow. Shadow specs: `Y: 4, Blur: 20, Color: rgba(0, 51, 102, 0.08)`. The slight navy tint in the shadow creates a more integrated, sophisticated look than pure gray.
- **Level 3 (Modals/Overlays):** Stronger elevation for items that require immediate focus. Shadow specs: `Y: 8, Blur: 32, Color: rgba(0, 0, 0, 0.12)`.

## Shapes
The shape language is friendly and approachable, utilizing large corner radii to soften the institutional feel of the Navy Blue.

- **Cards & Primary Containers:** Use a 24px radius to create a distinct, modern mobile aesthetic.
- **Buttons & Large Controls:** Use a 16px radius.
- **Input Fields & Small Components:** Use a 12px radius to maintain consistency while allowing for tighter layouts.
- **Icons:** Icons should feature rounded caps and joins to match the soft UI geometry.

## Components

- **Buttons:** 
  - **Primary:** Navy Blue background, White text, 16px radius, Medium weight.
  - **Secondary:** Mustard Yellow background, Navy text (for high-priority alerts or "Park Now").
  - **Ghost:** Transparent background with Navy text, used for less prominent actions.
- **Cards:** White background, 24px radius, soft navy-tinted shadow. Used for parking spot details, permit info, and user profile summaries.
- **Input Fields:** Filled style using the `#F5F7FA` surface color, 12px radius, with a subtle 1px border appearing only on focus (#003366).
- **Chips/Status Indicators:** Small, rounded badges used for "Available" (Green tint), "Occupied" (Gray tint), or "Reserved" (Yellow tint).
- **Lists:** Clean rows separated by thin `#E2E8F0` dividers, using 16px horizontal padding to align with the grid.
- **Icons:** Use thin-line icons (1.5px stroke) from a library like Phosphor or SF Symbols. Avoid solid icons unless used for the "Active" state in the Bottom Navigation Bar.
- **Progress Indicators:** Use the Mustard Yellow for progress bars or status rings to signify active processes (e.g., "Time remaining in spot").