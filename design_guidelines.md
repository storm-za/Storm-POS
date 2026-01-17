# Storm POS Design Guidelines

## Design Approach
**Reference-Based + Modern SaaS Aesthetic**
Drawing inspiration from: Linear (clean typography, spatial design), Stripe (professional trust-building), Vercel (dark mode sophistication), combined with cutting-edge glassmorphism for a distinctive high-tech identity.

**Core Principles**: Premium technology perception, operational confidence, South African market sophistication, innovation-forward design language.

---

## Typography System

**Primary Font**: Inter (Google Fonts)
- Display/Hero: 56px-72px, weight 700, tight tracking (-0.02em)
- H1: 48px, weight 700
- H2: 36px, weight 600
- H3: 24px, weight 600
- Body Large: 18px, weight 400, line-height 1.6
- Body: 16px, weight 400, line-height 1.7
- Small/Caption: 14px, weight 500

**Secondary Font**: 'JetBrains Mono' (for numbers, metrics, data displays)

---

## Layout & Spacing

**Tailwind Spacing Units**: 2, 4, 6, 8, 12, 16, 20, 24, 32
- Component padding: p-6 to p-12
- Section spacing: py-20 to py-32 (desktop), py-12 to py-20 (mobile)
- Card spacing: p-8
- Button padding: px-8 py-4

**Container Strategy**:
- Hero/Full sections: w-full with max-w-7xl centered
- Content sections: max-w-6xl
- Text content: max-w-4xl

**Grid System**: 
- Desktop: 3-4 column grids for features
- Tablet: 2 columns
- Mobile: Single column

---

## Visual Treatment (Glassmorphism)

**Glass Effect Specifications**:
- Background: `backdrop-blur-xl` with `bg-white/10` or `bg-storm-blue/5`
- Borders: 1px solid white/20 or storm-blue/30
- Border radius: rounded-2xl (16px) for cards, rounded-xl (12px) for smaller elements
- Shadow: Soft elevation with `shadow-2xl` and custom glow effects using storm blue

**Application Hierarchy**:
- Hero cards: Strong glass effect with blue glow
- Feature cards: Medium glass with subtle borders
- Navigation: Frosted glass header with blur
- Buttons on images: Heavily blurred backgrounds (backdrop-blur-2xl)

---

## Component Library

### Navigation
**Desktop Header** (sticky):
- Frosted glass navbar: backdrop-blur-lg, bg-white/80 (light) or bg-slate-900/80 (dark)
- Logo left, navigation center, CTA right
- Height: h-20
- Subtle bottom border with storm blue accent

**Mobile Navigation**:
- Hamburger menu with full-screen glass overlay
- Slide-in animation from right

### Hero Section
**Layout**: Full viewport height (90vh), split design
- Left: Bold headline + subheadline + dual CTA buttons
- Right: Large hero image showing POS interface in action (modern retail environment, sleek hardware, dashboard UI)
- Background: Gradient mesh with storm blue radiating from bottom-right
- Floating glass cards with key metrics overlay on image

**Hero Image Description**: Professional photograph showing Storm POS terminal on modern retail counter, bright clean environment, tablet/iPad display showing dashboard, subtle blue accent lighting, high-resolution 4K quality

### Feature Sections (6-8 sections)

**1. Core Features Grid** (3 columns desktop)
- Glass cards with icons, titles, descriptions
- Icons: Custom iconography in storm blue
- Hover: Lift effect with intensified glow

**2. Product Demo Section** (2 column)
- Left: Animated dashboard screenshot/mockup
- Right: Feature bullets with checkmarks
- Glass frame around dashboard with blue glow

**3. Stats/Metrics Bar** (4 columns)
- Large numbers in JetBrains Mono
- Glass containers with blue accent bars
- Icons above numbers

**4. Integration Showcase** (masonry grid)
- Partner logos in glass containers
- Subtle animations on scroll
- Arranged in staggered pattern

**5. Testimonials** (carousel, 2 visible)
- Glass cards with retailer photos
- Company logos
- Quote styling with large quotation marks
- South African business names/locations

**6. Pricing Table** (3 tiers, side-by-side)
- Glass cards, featured plan with stronger blue glow
- Clear feature comparison
- CTA buttons in each tier

**7. Security & Reliability**
- Icon + text combinations
- Certification badges
- Trust indicators (cloud uptime, data encryption, South African compliance)

**8. CTA Section** (full-width)
- Centered headline: "Transform Your Retail Business"
- Dual buttons: primary "Start Free Trial" + secondary "Schedule Demo"
- Background: Gradient with glass overlay
- Supporting text with guarantee/no credit card required

### Buttons

**Primary Button**:
- Background: storm-blue with 20% lighter on hover
- Text: white, weight 600
- Size: px-8 py-4, rounded-xl
- Shadow: Glow effect in storm blue
- On images: Add `backdrop-blur-2xl bg-storm-blue/90`

**Secondary Button**:
- Border: 2px storm blue
- Background: transparent, glass effect on hover
- Text: storm blue

**Ghost Button**:
- Text only, underline animation on hover
- Storm blue color

### Forms
**Contact/Demo Request**:
- Glass container with blue border accent
- Input fields: backdrop-blur-md, border storm-blue/30
- Labels: Small caps, weight 600
- Validation states: Blue for focus, red for errors
- Submit button: Primary style

**Form Button Pattern (Dialog/Modal Forms)**:
- **Cancel Button**: Use `variant="outline"` only, with NO additional className styling. This ensures consistent appearance across all dialogs.
  - Correct: `<Button variant="outline">Cancel</Button>`
  - Wrong: `<Button variant="outline" className="border-gray-600 text-gray-300">Cancel</Button>`
- **Submit/Save Button**: Use storm blue background with appropriate styling
  - Example: `className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white"`
- Button order: Cancel on left, Submit/Save on right
- Wrapper: `<div className="flex justify-end space-x-2">` or `<div className="flex gap-2">`

### Footer
**Multi-column layout** (4 columns desktop):
- Product links, Resources, Company, Contact
- Newsletter signup with glass input + button
- Social icons (LinkedIn, Twitter, Facebook) in storm blue
- Trust badges: Payment security, compliance logos
- Copyright + legal links
- Background: Deep gradient, glass separation line at top

---

## Images Strategy

**Hero Image**: YES - Large, professional POS system in modern retail setting
**Other Images**:
- Dashboard/interface mockups throughout (3-4 placements)
- Retailer testimonial photos (authentic South African businesses)
- Team photo (optional, in About section if included)
- Device mockups showing mobile responsiveness

All images should complement storm blue color scheme (avoid conflicting colors, especially green).

---

## Animations

**Sparingly Applied**:
- Scroll-triggered fade-up for cards (subtle, 0.3s)
- Hover lift on feature cards (4-8px translate)
- Button glow pulse on primary CTA
- Glass shimmer effect on hero cards
- Smooth page transitions (0.2s ease)

**No**: Parallax, continuous animations, excessive scroll effects

---

## Accessibility
- WCAG AA contrast ratios (storm blue text on white, white on storm blue)
- Focus indicators: 3px storm blue outline
- Keyboard navigation throughout
- Alt text for all images
- Semantic HTML structure
- Form labels and ARIA attributes

---

## Responsive Breakpoints
- Mobile: < 768px (single column, stacked navigation)
- Tablet: 768px - 1024px (2 columns, adjusted spacing)
- Desktop: > 1024px (full layout, 3-4 columns)
- Large: > 1440px (max-width constraints, centered)

**Key Adjustments**:
- Hero: Stack on mobile, reduce height to 70vh
- Feature grids: 1 col mobile, 2 col tablet, 3-4 desktop
- Pricing: Stacked mobile, side-by-side desktop
- Typography: Scale down 20-30% on mobile