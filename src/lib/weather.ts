import { WeatherData } from "@/types";

const COORDS = {
  latitude: 52.3676,
  longitude: 4.9041,
};

export async function getCurrentWeather(): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${COORDS.latitude}&longitude=${COORDS.longitude}&current_weather=true&hourly=temperature_2m&timezone=Europe/Amsterdam`
    );

    const data = await response.json();
    console.log("Current weather data:", data);
    const currentTemperature = data.current_weather.temperature;

    return {
      temperature: currentTemperature,
      location: "Amsterdam",
    };
  } catch (error) {
    console.warn("Failed to fetch weather data:", error);

    // Fallback
    return {
      temperature: 20,
      location: "Amsterdam",
    };
  }
}
