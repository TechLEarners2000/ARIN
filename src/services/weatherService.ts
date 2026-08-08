export interface WeatherResult {
  success: boolean;
  message: string;
}

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export async function fetchWeather(city?: string): Promise<WeatherResult> {
  const targetCity = city?.trim() || 'London';
  try {
    // Step 1: Free Geocoding API via Open-Meteo
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetCity)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      return { success: false, message: `Failed to find location: ${targetCity}` };
    }
    const geoData = await geoRes.json();
    if (!geoData?.results || geoData.results.length === 0) {
      return { success: false, message: `Location "${targetCity}" not found.` };
    }

    const { name, country, latitude, longitude } = geoData.results[0];

    // Step 2: Current Weather Forecast API via Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      return { success: false, message: `Failed to fetch weather data for ${name}.` };
    }
    const weatherData = await weatherRes.json();
    const current = weatherData?.current;
    if (!current) {
      return { success: false, message: `No current weather data available for ${name}.` };
    }

    const temp = Math.round(current.temperature_2m ?? 0);
    const humidity = current.relative_humidity_2m ?? 0;
    const wind = Math.round(current.wind_speed_10m ?? 0);
    const code = current.weather_code ?? 0;
    const condition = WEATHER_CODES[code] || 'Cloudy';

    const locationLabel = country ? `${name}, ${country}` : name;
    return {
      success: true,
      message: `Weather in ${locationLabel}: ${temp}°C, ${condition}, Humidity: ${humidity}%, Wind: ${wind} km/h.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Weather request failed: ${errorMsg}` };
  }
}
