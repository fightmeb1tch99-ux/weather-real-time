const weatherIcon = document.getElementById('weather-icon');
const cityEl = document.getElementById('city');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const bgAnimations = document.getElementById('bg-animations');

async function fetchWeather(query = 'Moscow') {
    showLoading();
    try {
        // query can be city name or "lat,lon"
        const response = await fetch(`https://wttr.in/${query}?format=j1`);
        if (!response.ok) throw new Error('Weather data not found');
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        cityEl.innerText = 'Ошибка';
        descEl.innerText = 'Не удалось загрузить';
        console.error(error);
    }
}

function showLoading() {
    cityEl.innerText = 'Поиск...';
    tempEl.innerText = '--°C';
    descEl.innerText = 'Смотрим в небо';
    weatherIcon.innerHTML = '<div class="cloud" style="animation: pulse 1s infinite"></div>';
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(2);
                const lon = position.coords.longitude.toFixed(2);
                fetchWeather(`${lat},${lon}`);
            },
            (error) => {
                console.warn("Geolocation failed, defaulting to Moscow", error);
                fetchWeather('Moscow');
            }
        );
    } else {
        fetchWeather('Moscow');
    }
}

function updateUI(data) {
    const current = data.current_condition[0];
    const city = data.nearest_area[0].areaName[0].value;
    const temp = current.temp_C;
    const desc = current.lang_ru ? current.lang_ru[0].value : current.weatherDesc[0].value;
    const code = current.weatherCode;
    const windSpeed = parseInt(current.windspeedKmph);

    cityEl.innerText = city;
    tempEl.innerText = `${temp}°C`;
    descEl.innerText = desc;

    setAnimation(code);
    updateBackgroundAnimations(code, windSpeed);
}

function updateBackgroundAnimations(code, windSpeed) {
    bgAnimations.innerHTML = '';
    const c = parseInt(code);

    // Add Clouds
    if (c !== 113) { // If not clear sky
        const cloudCount = c === 116 ? 3 : 8;
        for (let i = 0; i < cloudCount; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'bg-cloud';
            cloud.style.top = `${Math.random() * 60}%`;
            cloud.style.animationDuration = `${15 + Math.random() * 20}s`;
            cloud.style.animationDelay = `${-Math.random() * 20}s`;
            cloud.style.opacity = 0.2 + Math.random() * 0.3;
            bgAnimations.appendChild(cloud);
        }
    }

    // Add Rain
    if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) {
        for (let i = 0; i < 50; i++) {
            const rain = document.createElement('div');
            rain.className = 'bg-rain';
            rain.style.left = `${Math.random() * 100}vw`;
            rain.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            rain.style.animationDelay = `${Math.random()}s`;
            bgAnimations.appendChild(rain);
        }
    }

    // Add Snow
    if ([227, 230, 323, 326, 329, 332, 335, 338].includes(c)) {
        for (let i = 0; i < 40; i++) {
            const snow = document.createElement('div');
            snow.className = 'bg-snow';
            snow.style.left = `${Math.random() * 100}vw`;
            snow.style.animationDuration = `${2 + Math.random() * 3}s`;
            snow.style.animationDelay = `${Math.random() * 2}s`;
            bgAnimations.appendChild(snow);
        }
    }

    // Add Storm Flash
    if ([386, 389].includes(c)) {
        const flash = document.createElement('div');
        flash.className = 'bg-flash';
        bgAnimations.appendChild(flash);
    }

    // Add Wind
    if (windSpeed > 15) {
        const windCount = Math.min(Math.floor(windSpeed / 5), 15);
        for (let i = 0; i < windCount; i++) {
            const wind = document.createElement('div');
            wind.className = 'bg-wind';
            wind.style.top = `${Math.random() * 100}vh`;
            wind.style.animationDuration = `${1 + Math.random() * 2}s`;
            wind.style.animationDelay = `${Math.random() * 2}s`;
            bgAnimations.appendChild(wind);
        }
    }
}

function setAnimation(code) {
    weatherIcon.innerHTML = '';
    document.body.className = ''; // Clear previous classes
    
    const c = parseInt(code);

    if (c === 113) {
        // Sunny
        document.body.classList.add('bg-sunny');
        const sun = document.createElement('div');
        sun.className = 'sun';
        weatherIcon.appendChild(sun);
    } else if (c === 116 || c === 119 || c === 122) {
        // Cloudy
        document.body.classList.add('bg-cloudy');
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        weatherIcon.appendChild(cloud);
    } else if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) {
        // Rain
        document.body.classList.add('bg-rainy');
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        weatherIcon.appendChild(cloud);
        for (let i = 0; i < 5; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${10 + i * 10}px`;
            drop.style.animationDelay = `${Math.random()}s`;
            weatherIcon.appendChild(drop);
        }
    } else if ([227, 230, 323, 326, 329, 332, 335, 338].includes(c)) {
        // Snow
        document.body.classList.add('bg-snowy');
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        weatherIcon.appendChild(cloud);
        for (let i = 0; i < 5; i++) {
            const flake = document.createElement('div');
            flake.className = 'snow-flake';
            flake.style.left = `${10 + i * 10}px`;
            flake.style.animationDelay = `${Math.random() * 2}s`;
            weatherIcon.appendChild(flake);
        }
    } else if ([386, 389].includes(c)) {
        // Storm
        document.body.classList.add('bg-stormy');
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        weatherIcon.appendChild(cloud);
        const bolt = document.createElement('div');
        bolt.className = 'lightning';
        weatherIcon.appendChild(bolt);
    } else {
        // Default to cloud
        document.body.classList.add('bg-cloudy');
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        weatherIcon.appendChild(cloud);
    }
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
    }
});

// Initial fetch with auto-location
getLocation();
