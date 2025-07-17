import { WeatherData } from "@/types";
import { Thermometer } from "lucide-react";

interface WeatherProps {
  weather: WeatherData | null;
}

export default function Weather({ weather }: WeatherProps) {
  if (!weather) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
      <Thermometer className="w-5 h-5 text-blue-600" />
      <span className="text-blue-800">
        Temparatuur: {weather.temperature}°C
        {weather.temperature > 30 && (
          <span className="ml-2 text-green-600 font-semibold">
            🍍 Nu 10% korting bij een pizza met ananas!
          </span>
        )}
      </span>
    </div>
  );
}
