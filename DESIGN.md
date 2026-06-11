---
name: Pro-Secure PropTech
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#58423a'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#8b7168'
  outline-variant: '#dfc0b5'
  surface-tint: '#a73a05'
  primary: '#a43802'
  on-primary: '#ffffff'
  primary-container: '#c54f1d'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59a'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5f5b55'
  on-tertiary: '#ffffff'
  tertiary-container: '#78746d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#802900'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e8e2d9'
  tertiary-fixed-dim: '#ccc6bd'
  on-tertiary-fixed: '#1e1b16'
  on-tertiary-fixed-variant: '#4a4640'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  status-success: '#2E7D32'
  status-error: '#D32F2F'
  surface-muted: '#F5F5F5'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 80px
---

## Brand & Style

The design system is engineered for a Beninese PropTech startup that bridges the gap between traditional real estate and digital innovation. The brand personality is **Professional, Secure, and Innovative**. It must convey the reliability of a financial institution while maintaining the agility of a tech startup. 

The chosen aesthetic is **Corporate / Modern** with a focus on high-clarity information architecture. This style utilizes generous whitespace, crisp structural alignment, and a sophisticated use of brand color to guide the user's eye toward key conversion points like "S'inscrire." The goal is to evoke trust and provide a friction-less experience for users navigating complex property transactions.

## Colors

The palette is derived directly from the brand's identity to ensure instant recognition. 

- **Primary (#D95E2B):** A refined, earthy orange used for primary actions (CTAs), brand highlights, and active states. It represents energy and the soil of construction.
- **Secondary (#1C1C1C):** A deep charcoal black used for typography, navigation bars, and structural elements to provide a sense of stability and authority.
- **Tertiary (#FDF6ED):** A warm, soft cream used for large background sections and card surfaces to prevent visual fatigue and differentiate the brand from cold, purely white competitors.
- **Neutral (#FFFFFF):** Used for pure surfaces and high-contrast text against dark backgrounds.

Color application should be disciplined: reserve the primary orange for the "S'inscrire" button and critical interactions to maintain a clear visual hierarchy.

## Typography

The design system moves away from Arial in favor of **Hanken Grotesk**, a contemporary typeface that offers superior legibility and a more "tech-forward" feel.

- **Headlines:** Use Bold and ExtraBold weights to create a strong vertical rhythm. Large headlines should use tighter letter spacing to feel more cohesive.
- **Body Text:** Use Regular weight for high readability. The line height is set to a generous 1.5x ratio to ensure clarity in property descriptions.
- **Labels:** Uppercase styling is recommended for small labels (like property categories) to add a layer of professional polish.

The hierarchy is structured to lead the user from the value proposition (Headline XL) directly to the supporting details (Body LG) and then the CTA.

## Layout & Spacing

The layout utilizes a **12-column Fluid Grid** for desktop and a **4-column grid** for mobile. 

- **Hero Section:** Should be center-aligned or split 50/50. Information density must be reduced; prioritize a single clear headline, one paragraph of text, and the primary "S'inscrire" button.
- **Navigation:** Simplified to a maximum of 5 top-level links. The "S'inscrire" CTA must be pinned to the far right of the navigation bar as a high-contrast button.
- **Consistency:** Use an 8px base unit for all spacing. Components should be separated by `stack-md` (16px), while distinct functional sections (e.g., Hero to Featured Listings) should be separated by `section-gap` (80px) to provide "breathing room."

## Elevation & Depth

To maintain a secure and modern feel, this design system uses **Tonal Layers** supplemented by **Ambient Shadows**.

- **Level 0 (Background):** The Tertiary cream color (#FDF6ED) serves as the foundation.
- **Level 1 (Cards/Containers):** Pure white (#FFFFFF) surfaces used for property cards and input forms. These should feature a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)) to appear slightly raised.
- **Level 2 (Interaction):** Hover states for cards should increase the shadow spread and add a subtle 1px border in the primary orange color to signal interactivity.
- **Overlays:** Modals and dropdowns use a darker backdrop blur (Glassmorphism) to keep the user focused on the secure transaction or form at hand.

## Shapes

The shape language is **Soft (Level 1)**. 

- **Standard Elements:** Buttons, input fields, and tags use a 0.25rem (4px) corner radius. This maintains a professional, "stable" architectural feel without being too aggressive or too playful.
- **Large Elements:** Property cards and image containers use 0.5rem (8px) to soften the large surface areas.
- **Icons:** Should follow a linear, 2px stroke weight style to match the clean typography and professional tone.

## Components

### Buttons
- **Primary:** Background #D95E2B, Text #FFFFFF. Used for "S'inscrire."
- **Secondary:** Outline #1C1C1C, Text #1C1C1C. Used for secondary actions like "Learn More."
- **Ghost:** No background, #1C1C1C text. Used for navigation links.
- *Requirement:* All buttons must have a clear 200ms transition on hover (background darkening or slight lift).

### Input Fields
- Use white backgrounds with a 1px border (#E0E0E0). 
- On focus, the border transitions to Primary Orange.
- Labels must always be visible above the field for accessibility.

### Property Cards
- Image occupies the top 60% of the card.
- Use a clean white surface with "Soft" corners.
- Price should be prominently displayed in Secondary Black with Headline-MD sizing.

### Chips/Tags
- Used for property status (e.g., "A Vendre", "En Location").
- Background: Very light tint of the primary color; Text: Primary Orange.

### Navigation Bar
- Fixed to the top of the screen.
- Height: 72px.
- Use a white background with a subtle bottom shadow or 1px border to separate it from the hero content.