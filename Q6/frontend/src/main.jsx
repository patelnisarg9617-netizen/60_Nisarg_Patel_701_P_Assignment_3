import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const cities = ["Surat", "Mumbai", "Delhi", "Ahmedabad", "Bengaluru"];

function App() {
  const [city, setCity] = useState("Surat");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  // Frontend directly calls free Open-Meteo API
  async function getFromFrontend() {
    setError("");
    setWeather(null);

    const coordinates = {
      Surat: [21.1702, 72.8311],
      Mumbai: [19.0760, 72.8777],
      Delhi: [28.6139, 77.2090],
      Ahmedabad: [23.0225, 72.5714],
      Bengaluru: [12.9716, 77.5946]
    };

    try {
      const [latitude, longitude] = coordinates[city];

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
      );

      const data = await response.json();

      setWeather({
        city,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m
      });
    } catch (err) {
      setError("Unable to get weather from frontend.");
    }
  }

  // Frontend calls our backend, and backend calls Open-Meteo
  async function getFromBackend() {
    setError("");
    setWeather(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/weather?city=${city}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setWeather(data);
    } catch (err) {
      setError("Unable to get weather from backend.");
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h1> Weather Utility</h1>
        <p>Free API: Open-Meteo</p>

        <div className="box">
          <label>Select City:</label>

          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div>
            <button onClick={getFromFrontend}>
              Call API from Frontend
            </button>

            <button onClick={getFromBackend}>
              Call API from Backend
            </button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="box">
            <h2>Weather Details</h2>
            <p><b>City:</b> {weather.city}</p>
            <p><b>Temperature:</b> {weather.temperature} °C</p>
            <p><b>Humidity:</b> {weather.humidity} %</p>
            <p><b>Wind Speed:</b> {weather.windSpeed} km/h</p>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);