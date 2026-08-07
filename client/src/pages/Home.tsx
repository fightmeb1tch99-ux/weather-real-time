import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlobeViewer from '@/components/GlobeViewer';
import WeatherPanel from '@/components/WeatherPanel';
import CityList from '@/components/CityList';

interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
  temp?: number;
  condition?: string;
}

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
}

// Major world cities with coordinates
const MAJOR_CITIES: City[] = [
  { name: 'New York', lat: 40.7128, lon: -74.006, country: 'USA' },
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore' },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, country: 'Hong Kong' },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173, country: 'Russia' },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil' },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777, country: 'India' },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'Thailand' },
];

export default function Home() {
  const [cities, setCities] = useState<City[]>(MAJOR_CITIES);
  const [selectedWeather, setSelectedWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Fetch weather data for all cities
  useEffect(() => {
    const fetchWeatherForCities = async () => {
      setLoading(true);
      try {
        const updatedCities = await Promise.all(
          MAJOR_CITIES.map(async (city) => {
            try {
              const response = await fetch(`https://wttr.in/${city.name}?format=j1`);
              if (response.ok) {
                const data = await response.json();
                const current = data.current_condition[0];
                return {
                  ...city,
                  temp: current.temp_C,
                  condition: current.weatherDesc[0].value,
                };
              }
              return city;
            } catch (error) {
              console.error(`Failed to fetch weather for ${city.name}:`, error);
              return city;
            }
          })
        );
        setCities(updatedCities);
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherForCities();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeatherForCities, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCityClick = async (city: City) => {
    setSelectedCity(city);
    try {
      const response = await fetch(`https://wttr.in/${city.name}?format=j1`);
      if (response.ok) {
        const data = await response.json();
        const current = data.current_condition[0];
        const area = data.nearest_area[0];

        setSelectedWeather({
          city: area.areaName[0].value,
          country: area.country[0].value,
          temp: current.temp_C,
          condition: current.weatherDesc[0].value,
          humidity: current.humidity,
          windSpeed: current.windspeedKmph,
          feelsLike: current.FeelsLikeC,
        });
      }
    } catch (error) {
      console.error('Failed to fetch detailed weather:', error);
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden">
      {/* Header */}
      <motion.header
        className="absolute top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-cyan-500/10 bg-slate-900/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌍</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Weather Globe</h1>
              <p className="text-cyan-400 text-xs">Real-time global weather explorer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-gray-400 text-sm">Last updated</p>
              <p className="text-cyan-400 text-xs">
                {new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="w-full h-full pt-20">
        <GlobeViewer cities={cities} onCityClick={handleCityClick} loading={loading} />
      </div>

      {/* City List */}
      <CityList cities={cities} onCityClick={handleCityClick} selectedCity={selectedCity} />

      {/* Weather Panel */}
      {selectedWeather && (
        <WeatherPanel data={selectedWeather} onClose={() => setSelectedWeather(null)} />
      )}

      {/* Footer Info */}
      <motion.div
        className="absolute bottom-6 right-6 text-gray-500 text-xs text-right hidden sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>Data from wttr.in</p>
        <p>Drag to rotate • Click cities to explore</p>
      </motion.div>

      {/* Loading Indicator */}
      {loading && (
        <motion.div
          className="absolute bottom-6 left-6 flex items-center gap-2 text-cyan-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Updating weather data...</span>
        </motion.div>
      )}
    </div>
  );
}
