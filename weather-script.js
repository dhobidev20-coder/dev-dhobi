// ===================================
// WEATHERDASH - WEATHER DASHBOARD JS
// ===================================

// OpenWeatherMap API Configuration
const API_KEY = '7f93f30f7c3aa6f2ab15e11f35f1fbb9'; // Free API key for demonstration
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('errorMessage');
const weatherContent = document.getElementById('weatherContent');
const welcomeMessage = document.getElementById('welcomeMessage');

// Weather Icons Mapping
const weatherIcons = {
    'clear sky': '☀️',
    'few clouds': '🌤️',
    'scattered clouds': '☁️',
    'broken clouds': '☁️',
    'light rain': '🌧️',
    'rain': '🌧️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️',
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });
});

/**
 * Search weather by city name
 */
function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    fetchWeatherByCity(city);
}

/**
 * Get weather for current location
 */
function getLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoordinates(latitude, longitude);
        },
        (error) => {
            showLoading(false);
            showError('Unable to get your location. Please check permissions.');
            console.error(error);
        }
    );
}

/**
 * Fetch weather data by city name
 */
async function fetchWeatherByCity(city) {
    showLoading(true);
    try {
        // Get current weather
        const currentResponse = await fetch(
            `${API_BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
        );

        if (!currentResponse.ok) {
            throw new Error('City not found');
        }

        const currentData = await currentResponse.json();
        
        // Get forecast data
        const forecastResponse = await fetch(
            `${API_BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        displayWeather(currentData, forecastData);
        showLoading(false);
        hideError();
    } catch (error) {
        showLoading(false);
        showError(error.message || 'Failed to fetch weather data');
    }
}

/**
 * Fetch weather data by coordinates
 */
async function fetchWeatherByCoordinates(lat, lon) {
    showLoading(true);
    try {
        // Get current weather
        const currentResponse = await fetch(
            `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!currentResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const currentData = await currentResponse.json();
        
        // Get forecast data
        const forecastResponse = await fetch(
            `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        displayWeather(currentData, forecastData);
        showLoading(false);
        hideError();
    } catch (error) {
        showLoading(false);
        showError(error.message || 'Failed to fetch weather data');
    }
}

/**
 * Display weather information
 */
function displayWeather(currentData, forecastData) {
    // Current Weather
    const temp = Math.round(currentData.main.temp);
    const description = currentData.weather[0].main.toLowerCase();
    const icon = getWeatherIcon(description);
    
    document.getElementById('cityName').textContent = 
        `${currentData.name}, ${currentData.sys.country}`;
    document.getElementById('date').textContent = 
        new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    document.getElementById('temperature').textContent = `${temp}°C`;
    document.getElementById('weatherIcon').textContent = icon;
    document.getElementById('description').textContent = description;
    
    // Weather Details
    document.getElementById('humidity').textContent = `${currentData.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${currentData.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${currentData.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(currentData.visibility / 1000).toFixed(1)} km`;
    document.getElementById('feelsLike').textContent = `${Math.round(currentData.main.feels_like)}°C`;
    document.getElementById('clouds').textContent = `${currentData.clouds.all}%`;
    
    // Sunrise & Sunset
    const sunrise = new Date(currentData.sys.sunrise * 1000);
    const sunset = new Date(currentData.sys.sunset * 1000);
    document.getElementById('sunrise').textContent = 
        `Sunrise: ${sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    document.getElementById('sunset').textContent = 
        `Sunset: ${sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    
    // Coordinates
    document.getElementById('coordinates').textContent = 
        `Lat: ${currentData.coord.lat.toFixed(2)}°, Lon: ${currentData.coord.lon.toFixed(2)}°`;
    
    // Country
    document.getElementById('country').textContent = 
        `Country: ${currentData.sys.country}`;
    
    // 5-Day Forecast
    displayForecast(forecastData);
    
    // Show weather content, hide welcome
    weatherContent.classList.remove('hidden');
    welcomeMessage.classList.add('hidden');
}

/**
 * Display 5-day forecast
 */
function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';
    
    // Get forecast for next 5 days (one per day at noon)
    const forecastByDay = {};
    
    forecastData.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString();
        
        // Only keep one forecast per day (around noon)
        if (!forecastByDay[day] || date.getHours() === 12) {
            forecastByDay[day] = forecast;
        }
    });
    
    // Display first 5 days
    Object.values(forecastByDay).slice(0, 5).forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const temp = Math.round(forecast.main.temp);
        const description = forecast.weather[0].main.toLowerCase();
        const icon = getWeatherIcon(description);
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${temp}°C</div>
            <div class="forecast-description">${description}</div>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

/**
 * Get weather emoji icon
 */
function getWeatherIcon(description) {
    for (let [key, value] of Object.entries(weatherIcons)) {
        if (description.includes(key)) {
            return value;
        }
    }
    return '🌍'; // Default icon
}

/**
 * Show loading state
 */
function showLoading(show) {
    if (show) {
        loadingDiv.classList.remove('hidden');
        weatherContent.classList.add('hidden');
    } else {
        loadingDiv.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorDiv.textContent = `❌ ${message}`;
    errorDiv.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    welcomeMessage.classList.add('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    errorDiv.classList.add('hidden');
}
