---
name: Industrial Security
colors:
  surface: '#121319'
  surface-dim: '#121319'
  surface-bright: '#38393f'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2ea'
  on-surface-variant: '#c4c6d4'
  inverse-surface: '#e2e2ea'
  inverse-on-surface: '#2f3037'
  outline: '#8e909e'
  outline-variant: '#444652'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#003594'
  on-primary-container: '#87a4ff'
  inverse-primary: '#3559b7'
  secondary: '#fff0c9'
  on-secondary: '#3c2f00'
  secondary-container: '#fed000'
  on-secondary-container: '#6f5900'
  tertiary: '#ffb59e'
  on-tertiary: '#5e1700'
  tertiary-container: '#741f00'
  on-tertiary-container: '#ff865f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#15409e'
  secondary-fixed: '#ffe07f'
  secondary-fixed-dim: '#edc200'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#564500'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#812807'
  background: '#121319'
  on-background: '#e2e2ea'
  surface-variant: '#33343b'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-xl:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  touch-target-min: 48px
  gutter: 16px
  margin-mobile: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style
The design system is engineered for high-stakes, low-light environments typical of security and administrative monitoring. The brand personality is authoritative, reliable, and utilitarian, prioritizing split-second recognition over aesthetic flourish. 

The visual style is a fusion of **Corporate Modern** and **Industrial Minimalism**. It utilizes a "Deep Dark" foundation to reduce eye strain during night shifts while employing high-contrast accents to draw immediate attention to critical status changes. Every element is designed to feel rugged and intentional, evoking the precision of professional security equipment.

## Colors
The palette is built on a "Deep Dark" foundation to ensure the device does not become a light pollutant in dark environments. 

- **Institutional Blue & Yellow**: Used for primary actions and brand identification, providing a sense of established authority.
- **Status Colors**: These are highly saturated. **Success Green** indicates "Libre" (Available/Secure), **Vibrant Red** indicates "Ocupado" (Occupied/Alert), and **Vivid Orange** handles non-critical warnings.
- **Contrast**: Text must maintain a minimum 7:1 contrast ratio against background surfaces to ensure readability under high-stress conditions or glare.

## Typography
The design system exclusively uses **Inter** for its neutral, systematic, and highly legible characteristics. 

- **Weight Strategy**: Headings and labels use Semi-Bold (600) to Bold (700) weights to ensure they remain legible even when the screen brightness is lowered.
- **Scalability**: For mobile views, headline sizes are slightly capped to prevent awkward text wrapping, ensuring that critical data (like zone names or alert types) remains on a single line.
- **Labels**: Small labels use uppercase styling with increased letter spacing to differentiate "Meta-data" from actionable content.

## Layout & Spacing
This design system utilizes a **Fluid Grid** optimized for single-handed mobile use. 

- **Touch Targets**: A strict minimum of 48px is enforced for all interactive elements to accommodate gloved hands or rapid movement.
- **Rhythm**: An 8px linear scale governs all spacing.
- **Padding**: Cards and containers use a standard 16px internal padding (gutter) to keep information dense but organized. 
- **Margins**: A 16px safe area is maintained on the left and right edges of the mobile viewport.

## Elevation & Depth
In this dark environment, depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows, which can appear muddy on OLED screens.

- **Level 0 (Background)**: #0A0A0A - The base floor.
- **Level 1 (Surface)**: #1A1A1A - Cards and main UI containers.
- **Level 2 (Raised)**: #2A2A2A - Hover states or active input fields.
- **Borders**: All surface elements feature a 1px border (#333333). For high-priority items, this border inherits the status color (e.g., a Red border for an active Alert card).

## Shapes
The shape language is **Soft (0.25rem)**. This slight rounding provides a modern feel while maintaining the "Hard-edged" industrial aesthetic required for a security application. 

- **Standard Elements**: 4px radius.
- **Large Containers/Cards**: 8px radius (`rounded-lg`).
- **Interactive Pill Components**: Used only for status badges (e.g., "ONLINE"), these use a full 12px radius (`rounded-xl`).

## Components
- **Buttons**: Primary buttons are high-contrast (Yellow background, Black text or Blue background, White text). They must span the full width of their container on mobile to maximize touch area.
- **Status Indicators**: Use a combination of a colored dot and bold text. For critical alerts ("Ocupado"), the entire card border should pulse or remain solid Red.
- **Cards**: Background color #1A1A1A with a subtle 1px border. Title text should be `headline-md` for immediate identification.
- **Input Fields**: Darker than the surface (#0A0A0A) with a bright 2px focus border in Primary Blue.
- **Chips/Badges**: Small, high-visibility tags for "Zone" or "Floor" identification, using `label-xl` typography.
- **Navigation**: A bottom bar with bold, simple icons and clear active states using the Primary Blue color.