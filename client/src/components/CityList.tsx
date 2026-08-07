import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, CloudSnow } from 'lucide-react';

interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
  temp?: number;
  condition?: string;
}

interface CityListProps {
  cities: City[];
  onCityClick?: (city: City) => void;
  selectedCity?: City | null;
}

export default function CityList({ cities, onCityClick, selectedCity }: CityListProps) {
  const getWeatherIcon = (condition?: string) => {
    if (!condition) return <Cloud className="w-4 h-4 text-cyan-400" />;
    if (condition.toLowerCase().includes('rain')) {
      return <CloudRain className="w-4 h-4 text-cyan-400" />;
    } else if (condition.toLowerCase().includes('snow')) {
      return <CloudSnow className="w-4 h-4 text-cyan-400" />;
    } else if (condition.toLowerCase().includes('clear') || condition.toLowerCase().includes('sunny')) {
      return <Sun className="w-4 h-4 text-yellow-400" />;
    }
    return <Cloud className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <motion.div
      className="fixed left-6 top-24 max-h-96 w-72 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/30 p-4">
        <h3 className="text-sm font-bold text-white font-mono">MAJOR CITIES</h3>
        <p className="text-xs text-gray-400 mt-1">{cities.length} locations</p>
      </div>

      {/* Cities List */}
      <div className="overflow-y-auto max-h-80">
        {cities.map((city, index) => (
          <motion.button
            key={`${city.name}-${city.lat}`}
            onClick={() => onCityClick?.(city)}
            className={`w-full px-4 py-3 border-b border-cyan-500/10 transition-all text-left hover:bg-cyan-500/10 ${
              selectedCity?.name === city.name ? 'bg-cyan-500/20 border-l-2 border-l-cyan-400' : ''
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{city.name}</p>
                <p className="text-xs text-gray-400">{city.country}</p>
              </div>
              <div className="flex items-center gap-2">
                {getWeatherIcon(city.condition)}
                {city.temp !== undefined && (
                  <span className="text-sm font-bold text-cyan-300 min-w-[2.5rem] text-right">
                    {Math.round(city.temp)}°
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-slate-800/50 border-t border-cyan-500/20 px-4 py-2 text-xs text-gray-400 text-center">
        Click to explore
      </div>
    </motion.div>
  );
}
