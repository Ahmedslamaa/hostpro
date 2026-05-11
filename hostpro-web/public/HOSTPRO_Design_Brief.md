# HOSTPRO — Design Brief for Claude Design / Figma

## Brand Identity
- **Name**: HOSTPRO
- **Tagline**: "Gérez vos locations saisonnières sans effort"
- **Market**: Property owners on the French Riviera (Côte d'Azur)
- **Tone**: Professional, trustworthy, modern — like Airbnb meets a French fintech

## Logo
- "HOST" in #222222 bold + "PRO" in #FF5A5F bold
- No space, no icon — pure wordmark
- Minimum size: 120px wide

## Color System
- Coral Primary: #FF5A5F
- Coral Hover: #E00B41
- Dark Text: #222222
- Secondary Text: #717171
- Background: #FFFFFF
- Surface: #F7F7F7
- Border: #DDDDDD

## Typography
- Font family: Inter or system-ui
- H1: 60px / Black (900) / tracking -0.02em
- H2: 40px / Black (900)
- H3: 18px / Bold (700)
- Body: 15px / Regular (400) / line-height 1.6
- Labels: 11px / Bold (700) / UPPERCASE / letter-spacing 0.1em

## Key Screens to Design

### Screen 1 — Landing Page Hero
Full-width white section:
- Sticky nav: logo left, 4 links center, 2 buttons right
- Hero center: big H1, subtitle, 2 CTA buttons, trust note
- Partner logos row: Airbnb + Booking.com + Abritel

### Screen 2 — Stats Bar
Grey band #F7F7F7:
- 4 columns: 73% / 28% / 100% / 4.9★
- Numbers in coral, labels in grey

### Screen 3 — Pricing Cards (3 plans)
- Starter €49 / Pro €99 (featured with coral border) / Business €179
- Feature lists with ✓ (coral) and ✗ (grey)

### Screen 4 — Dashboard App (authenticated)
- Left sidebar 240px: logo + 9 nav items + user profile
- Main area: KPI cards (4) + properties table + alerts panel
- Active nav item: coral bg/10, coral text

### Screen 5 — Mobile Landing (375px)
- Stacked layout
- Hamburger menu
- Single column cards

## Component Specs

### Primary Button
- bg: #FF5A5F, text: white, radius: 12px
- padding: 16px 32px, font: 600 15px
- hover: bg #E00B41, transform scale(1.02)
- active: scale(0.97)

### Card
- bg: white, border: 1px #DDDDDD, radius: 16px
- padding: 28px
- hover: translateY(-6px), shadow 0 20px 40px rgba(0,0,0,0.09)

### Nav Sidebar Item (Dashboard)
- Active: bg rgba(255,90,95,0.1), color #FF5A5F, font-weight 600
- Inactive: color #717171, hover bg #F7F7F7
- Height: 40px, padding: 0 12px, radius: 12px
- Icon: 18px Lucide

## Reference Pages
- Airbnb.com (white/coral, clean cards)
- Stripe.com (pro fintech, clear hierarchy)
- Linear.app (dashboard sidebar style)
