import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Wind, Droplets, X } from 'lucide-react';

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
  icon?: string;
}

interface WeatherPanelProps {
  data: WeatherData | null;
  onClose?: () => void;
}

export default function WeatherPanel({ data, onClose }: WeatherPanelProps) {
  if (!data) return null;

  const getWeatherIcon = (condition: string) => {
    if (condition.toLowerCase().includes('rain')) {
      return <CloudRain className="w-16 h-16 text-cyan-400" />;
    } else if (condition.toLowerCase().includes('cloud')) {
      return <Cloud className="w-16 h-16 text-cyan-400" />;
    } else if (condition.toLowerCase().includes('clear') || condition.toLowerCase().includes('sunny')) {
      return <Sun className="w-16 h-16 text-yellow-400" />;
    }
    return <Cloud className="w-16 h-16 text-cyan-400" />;
  };

  return (
    <motion.div
      className="fixed right-6 top-6 w-96 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-6 shadow-2xl"
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 transition-colors p-1"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="mb-8 pb-4 border-b border-cyan-500/20">
        <h2 className="text-3xl font-bold text-white mb-1">{data.city}</h2>
        <p className="text-cyan-400 text-sm font-mono">{data.country}</p>
      </div>

      {/* Weather Icon and Temperature */}
      <div className="flex items-center justify-between mb-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {getWeatherIcon(data.condition)}
        </motion.div>
        <div className="text-right">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-6xl font-bold text-white">{Math.round(data.temp)}</p>
            <p className="text-cyan-400 text-lg font-mono">°C</p>
          </motion.div>
        </div>
      </div>

      {/* Condition */}
      <p className="text-gray-300 text-center mb-8 capitalize text-lg font-semibold">{data.condition}</p>

      {/* Feels Like */}
      {data.feelsLike !== undefined && (
        <motion.div
          className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-400 text-xs font-mono mb-1">FEELS LIKE</p>
          <p className="text-cyan-300 font-bold text-2xl">{Math.round(data.feelsLike)}°C</p>
        </motion.div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {data.humidity !== undefined && (
          <motion.div
            className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-cyan-500/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <p className="text-gray-400 text-xs font-mono">HUMIDITY</p>
            </div>
            <p className="text-cyan-300 font-bold text-xl">{data.humidity}%</p>
          </motion.div>
        )}

        {data.windSpeed !== undefined && (
          <motion.div
            className="p-4 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-lg border border-cyan-500/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-cyan-400" />
              <p className="text-gray-400 text-xs font-mono">WIND</p>
            </div>
            <p className="text-cyan-300 font-bold text-xl">{data.windSpeed} km/h</p>
          </motion.div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 rounded-b-2xl" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full opacity-50" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full opacity-50" />
    </motion.div>
  );
}
