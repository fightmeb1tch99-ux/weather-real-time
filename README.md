# Weather Globe App 🌍

An interactive 3D weather visualization application that displays real-time weather data for major cities around the world on a beautiful, rotating globe. Explore global weather patterns with an immersive cosmic interface.

**Author:** [mareioak](https://github.com/fightmeb1tch99-ux)

---

## Overview

Weather Globe App combines stunning 3D visualization with real-time meteorological data to create an engaging way to explore weather conditions across the planet. The application features an interactive Three.js-powered globe, live weather updates from the wttr.in API, and a sleek dark-themed interface with cyan accents.

### Key Features

- **Interactive 3D Globe** - Drag to rotate, explore Earth's surface with realistic textures and atmospheric effects
- **Real-Time Weather Data** - Live temperature, conditions, humidity, and wind speed for 12 major world cities
- **City List Panel** - Quick access to all tracked cities with current weather at a glance
- **Detailed Weather Panel** - Comprehensive weather information with animated icons and visual hierarchy
- **Cosmic Background** - 1500+ particle starfield for an immersive space-like environment
- **Smooth Animations** - Framer Motion-powered transitions and interactions throughout the UI
- **Auto-Refresh** - Weather data updates automatically every 30 minutes
- **Responsive Design** - Optimized for desktop and tablet viewing

---

## Technology Stack

### Frontend
- **React 19** - Modern UI framework with hooks
- **Three.js** - 3D graphics rendering engine
- **Tailwind CSS 4** - Utility-first styling with OKLCH color space
- **Framer Motion** - Advanced animation library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

### APIs & Data
- **wttr.in** - Free weather data API (no authentication required)
- **Geolocation** - Browser geolocation for user's location (optional)

### UI Components
- **shadcn/ui** - Pre-built accessible components
- **Lucide React** - Beautiful icon library

---

## Project Structure

```
weather-globe-app/
├── client/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── GlobeViewer.tsx      # Main 3D globe component
│   │   │   ├── WeatherPanel.tsx     # Weather details panel
│   │   │   ├── CityList.tsx         # City list sidebar
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Main page
│   │   │   └── NotFound.tsx         # 404 page
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx     # Dark theme provider
│   │   ├── App.tsx                  # Root component
│   │   ├── main.tsx                 # React entry point
│   │   └── index.css                # Global styles & theme
│   └── index.html
├── server/
│   └── index.ts                     # Express server (placeholder)
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 10+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fightmeb1tch99-ux/weather-globe-app.git
   cd weather-globe-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open in browser**
   - Local: `http://localhost:3000`
   - Network: Check console output for network URL

### Build for Production

```bash
pnpm build
pnpm start
```

---

## Usage Guide

### Exploring the Globe

1. **Rotate** - Click and drag on the globe to rotate it in any direction
2. **Auto-Rotate** - Release the globe to let it auto-rotate slowly
3. **Click Cities** - Click on any glowing cyan marker to view detailed weather information

### City List Panel

- Located on the left side of the screen
- Shows all 12 tracked cities with current temperature
- Weather icons indicate conditions (cloud, rain, sun, etc.)
- Click any city to center it and view full weather details

### Weather Details Panel

- Appears on the right when you click a city
- Displays:
  - Current temperature and condition
  - "Feels like" temperature
  - Humidity percentage
  - Wind speed in km/h
- Close by clicking the X button or clicking another city

### Data Updates

- Weather data refreshes automatically every 30 minutes
- Manual refresh by reloading the page
- All data sourced from wttr.in (no API key required)

---

## Design System

### Color Palette

| Element | Color | OKLCH |
|---------|-------|-------|
| Primary Accent | Electric Cyan | `oklch(0.65 0.25 250)` |
| Background | Deep Navy | `oklch(0.10 0.005 265)` |
| Card Background | Slate | `oklch(0.18 0.015 265)` |
| Text Primary | White | `oklch(0.95 0.01 65)` |
| Text Secondary | Gray | `oklch(0.70 0.01 65)` |
| Border | Cyan/20% | `oklch(0.25 0.02 265)` |

### Typography

- **Headers (H1-H6)** - Space Mono, 700 weight (futuristic, technical feel)
- **Body Text** - Inter, 400-600 weight (clean, readable)
- **Monospace** - Space Mono for data and labels

### Spacing & Radius

- Base spacing unit: 0.25rem (4px)
- Border radius: 0.65rem (10.4px)
- Component padding: 1rem-1.5rem

---

## Features in Detail

### 3D Globe Rendering

The globe is rendered using Three.js with:
- High-resolution canvas texture (4096x2048)
- Realistic ocean gradients and landmass shapes
- Dual atmospheric glow layers for depth
- Phong material with subtle shininess
- Proper lighting with ambient and directional lights

### Weather Data Integration

- Fetches data from wttr.in API endpoint: `https://wttr.in/{city}?format=j1`
- Parses JSON response for current conditions
- Displays temperature in Celsius
- Extracts weather descriptions, humidity, wind speed, and "feels like" temperature
- Handles API errors gracefully with fallback UI

### City Markers

- 12 major world cities pre-configured with coordinates
- Cyan-colored sphere markers positioned on globe surface
- Pulsing glow effect with staggered animation timing
- Clickable for detailed weather information
- Responsive to globe rotation

### Animations

All animations use Framer Motion with custom easing:
- **Panel Entrance** - Spring animation with scale + opacity
- **Glow Pulse** - Sine wave scaling (1.5s cycle)
- **Icon Float** - Y-axis oscillation (3s cycle)
- **Staggered List** - 50ms delay between items
- **Hover Effects** - Subtle scale and color transitions

---

## Performance Optimization

- **Canvas Rendering** - Three.js uses GPU acceleration
- **Lazy Loading** - Components load on demand
- **Efficient Updates** - Weather data cached and refreshed on schedule
- **Optimized Textures** - Canvas texture generation instead of external files
- **Particle System** - Efficient point-based star rendering

---

## Browser Support

- **Chrome/Edge** - Full support (v90+)
- **Firefox** - Full support (v88+)
- **Safari** - Full support (v14+)
- **Mobile** - Responsive design, touch support for globe rotation

---

## API Reference

### wttr.in Weather API

**Endpoint:** `https://wttr.in/{location}?format=j1`

**Response Structure:**
```json
{
  "current_condition": [
    {
      "temp_C": 20,
      "weatherDesc": [{ "value": "Partly cloudy" }],
      "humidity": 65,
      "windspeedKmph": 12,
      "FeelsLikeC": 18
    }
  ],
  "nearest_area": [
    {
      "areaName": [{ "value": "London" }],
      "country": [{ "value": "United Kingdom" }]
    }
  ]
}
```

---

## Customization

### Adding More Cities

Edit `client/src/pages/Home.tsx` and add to the `MAJOR_CITIES` array:

```typescript
const MAJOR_CITIES: City[] = [
  // ... existing cities
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784, country: 'Turkey' },
];
```

### Changing Colors

Modify CSS variables in `client/src/index.css`:

```css
:root {
  --primary: oklch(0.65 0.25 250); /* Change primary accent */
  --background: oklch(0.10 0.005 265); /* Change background */
}
```

### Adjusting Globe Speed

In `client/src/components/GlobeViewer.tsx`, modify the rotation speed:

```typescript
if (!isDragging && globeGroup) {
  globeGroup.rotation.y += 0.0003; // Increase/decrease this value
}
```

---

## Troubleshooting

### Globe not rendering
- Check browser console for WebGL errors
- Ensure hardware acceleration is enabled
- Try a different browser

### Weather data not loading
- Verify internet connection
- Check wttr.in API status at https://wttr.in
- Clear browser cache and reload

### Performance issues
- Reduce star count in GlobeViewer component
- Lower canvas texture resolution
- Disable animations on slower devices

---

## Future Enhancements

- [ ] Search bar to add custom cities
- [ ] 5-day weather forecast with charts
- [ ] Geolocation-based auto-centering
- [ ] Weather alerts and notifications
- [ ] Historical weather data visualization
- [ ] Multiple theme options (light, dark, neon)
- [ ] Export weather data as CSV/JSON
- [ ] Offline mode with cached data

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## License

This project is open source and available under the MIT License.

---

## Acknowledgments

- **wttr.in** - Free weather data API
- **Three.js** - 3D graphics library
- **React** - UI framework
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animation library
- **shadcn/ui** - Component library

---

## Contact & Support

**Author:** mareioak  
**GitHub:** [@fightmeb1tch99-ux](https://github.com/fightmeb1tch99-ux)

For issues, questions, or suggestions, please open an issue on GitHub or contact the author directly.

---

## Changelog

### Version 1.0.0 (Initial Release)
- ✨ Interactive 3D globe with real-time weather data
- ✨ 12 major world cities with live temperatures
- ✨ Detailed weather information panel
- ✨ City list sidebar with quick access
- ✨ Cosmic dark theme with cyan accents
- ✨ Smooth animations and interactions
- ✨ Auto-refresh weather data every 30 minutes
- ✨ Responsive design for desktop and tablet

---

**Made with ❤️ by mareioak**
