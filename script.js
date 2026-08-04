const weatherIcon = document.getElementById('weather-icon');
const cityEl = document.getElementById('city');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const bgAnimations = document.getElementById('bg-animations');
const soundToggle = document.getElementById('sound-toggle');
const flagContainer = document.getElementById('flag-container');

// Sound Engine
let audioCtx = null;
let soundEnabled = false;
let currentSound = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playWeatherSound(type) {
    if (!soundEnabled || !audioCtx) return;
    
    stopSound();
    
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    // Simple noise generation for rain/wind
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();

    if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gainNode.gain.value = 0.15;
    } else if (type === 'wind') {
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        gainNode.gain.value = 0.1;
        // Add oscillation to wind
        const lfo = audioCtx.createOscillator();
        lfo.frequency.value = 0.5;
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start();
    } else if (type === 'storm') {
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        gainNode.gain.value = 0.2;
    } else {
        stopSound();
        return;
    }

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    whiteNoise.start();
    currentSound = { source: whiteNoise, gain: gainNode };
}

function stopSound() {
    if (currentSound) {
        currentSound.source.stop();
        currentSound = null;
    }
}

soundToggle.addEventListener('click', () => {
    initAudio();
    soundEnabled = !soundEnabled;
    soundToggle.innerText = soundEnabled ? '🔊' : '🔇';
    if (!soundEnabled) stopSound();
    else {
        // Re-trigger sound based on current weather
        const desc = descEl.innerText.toLowerCase();
        if (desc.includes('rain')) playWeatherSound('rain');
        else if (desc.includes('storm')) playWeatherSound('storm');
        else playWeatherSound('wind');
    }
});

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
    const country = data.nearest_area[0].country[0].value;
    const temp = current.temp_C;
    const desc = current.lang_ru ? current.lang_ru[0].value : current.weatherDesc[0].value;
    const code = current.weatherCode;
    const windSpeed = parseInt(current.windspeedKmph);

    cityEl.innerText = city;
    tempEl.innerText = `${temp}°C`;
    descEl.innerText = desc;

    setAnimation(code);
    updateBackgroundAnimations(code, windSpeed);
    updateFlag(data);
    
    // Update sounds
    const c = parseInt(code);
    if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) playWeatherSound('rain');
    else if ([386, 389].includes(c)) playWeatherSound('storm');
    else if (windSpeed > 10) playWeatherSound('wind');
    else stopSound();
}

function updateFlag(data) {
    flagContainer.innerHTML = '';
    // wttr.in doesn't always provide ISO code easily, but we can try to get it or use a fallback
    // For the easter egg, we'll try to find the country and show its flag
    const country = data.nearest_area[0].country[0].value;
    
    // Simple mapping for common countries if ISO is not direct
    const countryMap = {
        'Russia': 'ru', 'Russian Federation': 'ru',
        'USA': 'us', 'United States of America': 'us',
        'UK': 'gb', 'United Kingdom': 'gb',
        'Germany': 'de', 'France': 'fr', 'Japan': 'jp',
        'China': 'cn', 'Kazakhstan': 'kz', 'Ukraine': 'ua',
        'Belarus': 'by'
    };
    
    let code = countryMap[country] || 'un'; // 'un' for unknown/United Nations
    
    const flagImg = document.createElement('img');
    flagImg.src = `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
    flagImg.className = 'pixel-flag';
    flagImg.alt = country;
    flagImg.title = `Страна: ${country}`;
    flagContainer.appendChild(flagImg);
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
