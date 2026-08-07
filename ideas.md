# Weather Globe App - Design Concept

## Chosen Design Approach: **Cosmic Explorer**

### Design Movement
**Modern Minimalism meets Sci-Fi Elegance** — A sleek, space-inspired interface that treats the globe as the hero element. Inspired by NASA dashboards, planetarium interfaces, and contemporary data visualization.

### Core Principles
1. **Globe as Hero**: The 3D globe dominates the visual hierarchy; everything else supports it
2. **Dark Cosmic Foundation**: Deep space background with subtle gradients and glow effects
3. **Data-Driven Minimalism**: Clean typography, purposeful whitespace, no unnecessary decoration
4. **Interactivity First**: Smooth rotations, hover states, and tactile feedback on every interaction

### Color Philosophy
- **Primary Background**: Deep navy-to-black gradient (oklch(0.15 0.01 265))
- **Accent Color**: Cyan/Electric Blue (oklch(0.65 0.25 250)) — represents energy, weather systems
- **Secondary**: Soft purple/lavender for secondary data (oklch(0.60 0.15 280))
- **Text**: Bright white for contrast, soft gray for secondary info
- **Globe**: Earth-like with blue oceans, green landmass, atmospheric glow

### Layout Paradigm
- **Asymmetric Hero Layout**: Globe centered-right, with sidebar info panel on left
- **Floating Elements**: Weather cards "float" around the globe with subtle shadows
- **Vertical Rhythm**: Information stacks vertically with breathing room between sections

### Signature Elements
1. **Glowing Orb Effect**: Subtle atmospheric glow around the globe using multiple sphere layers
2. **Particle System**: Floating particles representing weather systems (rain, clouds, wind)
3. **Data Pins**: Animated pins on cities with pulsing glow for active weather

### Interaction Philosophy
- **Drag to Rotate**: Smooth, physics-based globe rotation
- **Hover for Details**: Hovering over cities reveals weather details in a tooltip
- **Click to Focus**: Clicking a city centers it and shows detailed weather panel
- **Smooth Transitions**: All state changes use 300-400ms easing

### Animation Guidelines
- **Globe Rotation**: Continuous gentle auto-rotation when idle (0.5°/second)
- **City Pins**: Subtle pulse animation (1.5s cycle) for active weather alerts
- **Entrance**: Cities fade in with scale-up animation on load (staggered 50ms apart)
- **Weather Icons**: Gentle bob/float animation for rain/cloud particles
- **Transitions**: Use cubic-bezier(0.23, 1, 0.32, 1) for snappy UI transitions

### Typography System
- **Display Font**: "Orbitron" or "Space Mono" for headers (futuristic, technical feel)
- **Body Font**: "Inter" for body text (clean, readable)
- **Hierarchy**: 
  - H1: 2.5rem, bold, space-mono
  - H2: 1.875rem, semi-bold, space-mono
  - Body: 1rem, regular, inter
  - Caption: 0.875rem, light, inter

### Brand Essence
**"Explore Earth's weather in real-time through an interactive 3D globe"** — for weather enthusiasts, travelers, and data explorers who want a beautiful, immersive way to understand global weather patterns.

**Personality**: Sophisticated, Exploratory, Trustworthy

### Brand Voice
- Headlines: "Discover weather patterns across the globe" (not "Welcome to Weather")
- CTAs: "Explore the globe" (not "Get started")
- Microcopy: "Drag to rotate, click to explore" (instructive, not condescending)

### Logo Concept
A bold, minimalist globe icon with a single latitude line and a glowing accent point — represents both the Earth and data visualization. No text, just the symbol.

### Signature Brand Color
**Electric Cyan** (oklch(0.65 0.25 250)) — unmistakably modern, energetic, and associated with weather/data visualization

---

## Technical Stack
- **3D Engine**: Three.js for globe rendering
- **Frontend**: React 19 + Tailwind CSS 4
- **Weather Data**: wttr.in API (free, no auth required)
- **Animation**: Framer Motion + CSS transitions
- **UI Components**: shadcn/ui for modals, panels, and controls

## Key Features
1. **Interactive 3D Globe** with mouse/touch controls
2. **Real-time Weather Data** for major world cities
3. **City Markers** with weather icons and temperature
4. **Weather Details Panel** showing full forecast for selected city
5. **Dark/Light Theme Toggle** (dark theme as default)
6. **Responsive Design** for desktop and tablet
