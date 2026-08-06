const weatherIcon = document.getElementById('weather-icon');
const cityEl = document.getElementById('city');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const bgAnimations = document.getElementById('bg-animations');
const soundToggle = document.getElementById('sound-toggle');
const flagContainer = document.getElementById('flag-container');
const clockEl = document.getElementById('clock');
const globeBtn = document.getElementById('globe-btn');
const globeModal = document.getElementById('globe-modal');
const closeModal = document.querySelector('.close-modal');
const globeContainer = document.getElementById('globe-container');
const forecastContainer = document.getElementById('forecast-container');

// Clock Logic
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.innerText = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);
updateClock();

// Major cities with coordinates (lat, lon)
const majorCities = [
    { name: 'Moscow', lat: 55.75, lon: 37.62 },
    { name: 'New York', lat: 40.71, lon: -74.01 },
    { name: 'London', lat: 51.51, lon: -0.13 },
    { name: 'Tokyo', lat: 35.68, lon: 139.69 },
    { name: 'Sydney', lat: -33.87, lon: 151.21 },
    { name: 'Dubai', lat: 25.20, lon: 55.27 },
    { name: 'Singapore', lat: 1.35, lon: 103.82 },
    { name: 'Hong Kong', lat: 22.30, lon: 114.18 },
    { name: 'São Paulo', lat: -23.55, lon: -46.63 },
    { name: 'Mexico City', lat: 19.43, lon: -99.13 },
    { name: 'Cairo', lat: 30.04, lon: 31.24 },
    { name: 'Mumbai', lat: 19.08, lon: 72.88 },
    { name: 'Bangkok', lat: 13.73, lon: 100.49 },
    { name: 'Istanbul', lat: 41.01, lon: 28.98 },
    { name: 'Paris', lat: 48.86, lon: 2.35 }
];

// Globe Logic
let scene, camera, renderer, globe, weatherGroup, cityMarkers;
let currentGlobeWeatherCode = null;
let cityWeatherData = {};

// Pixel Map Data extracted from user image
const MAP_DATA = [
    "                                                                                                                                ",
    "                                                                                                                                ",
    "                                                                                                                                ",
    "                                                                                                       XXXXXXXXXXXXXXXXX        ",
    "                X X                                                                                    XXXXXXXXXXXXXXXXX        ",
    "              X XXX                   XX                                                               XXXXXXXXXXXXXXXXXXXX     ",
    "              XXXXX                   XX                                                               XXXXXXXXXXXXXXXXXXXX     ",
    "              XXXX                                                                         XXXXXXXXXXX XXXXXXXXXXXXXXX          ",
    "               X           XXX         X XX                                                XXXXXXXXXXX XXXXXXXXXXXXXXX          ",
    "               XX          XXXX        XXXXXX                                              XXXXXXXXXXX     XXXXXXXXXXXX         ",
    "                           X         XXXXXXX    X                                          XXXXXXXXXXX     XXXXXXXXXXXX         ",
    "                           X   XX XXXXXXXXXXXX XX X XX                                     XXXXXXXXXXX     XXXXXXXXXXXX         ",
    "                               XXXXXXXXXXXXXXXXXX   XXX                     XXXXXXXXXXXX                   XXXXXXXXXX           ",
    "               XXXXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXX                 XXXXXXXXXXXX  XXXXXXXX          XXXXXXXX           ",
    "               XXXXXXXXXX X  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXX         XXXXX              ",
    "               XXXXXXXXXX XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX           XXXXXXXXXXXXXXXXXXXXXXX         XXXXXX XXXX        ",
    "              XXXXXXX   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX        XXXXXXXXXXXXXXXXXXXXXXX          XXX    XXXX        ",
    "              XXX XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX        XXXXXXXXXXXXXXXXXXXXX            XXX                ",
    "              XX XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               XXXXXXXXXXXXXXXXXX    XXXXXX  XXX                ",
    "              XX XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXXXXXXXXXXXXXXXX   XXXXXXXX XXX                ",
    "              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXXXXXXXXXXXXXXXX  XXXXXXXXX XXX                ",
    "              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                 XXXXXXXXXXXXXXXX  XXXXXXXXX XX                 ",
    "              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXXXXXXX  XXXXXXXXX XX                 ",
    "               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXXXXXXX  XXXXXXXX  XX                 ",
    "               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                    XXXXXXXXXXXXXXX  XXXXXXX   X                  ",
    "                XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                      XXXXXXXXXXXXXX  XXXXXXX                      ",
    "                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                        XXXXXXXXXXXXX  XXXXXXX                      ",
    "                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                        XXXXXXXXXXXXX   XXXXX                       ",
    "                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                          XXXXXXXXXXX    XXXX                        ",
    "                   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                          XXXXXXXXXXX     XX                         ",
    "                   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                            XXXXXXXXXX                                ",
    "                    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                            XXXXXXXXXX                                ",
    "                    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                              XXXXXXXXX                                ",
    "                    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                              XXXXXXXXX                                ",
    "                    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                              XXXXXXXXX                                ",
    "                     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                               XXXXXXXX                                ",
    "                     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                               XXXXXXX                                 ",
    "                     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                XXXXXX                                 ",
    "                      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                XXXXXX                                 ",
    "                      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                 XXXXX                                 ",
    "                      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                 XXXXX                                 ",
    "                      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                   XXXX                                 ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                   XXXX                                 ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                    XXXX                                 ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                    XXXX                                 ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                          ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                          ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                          ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                           ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                           ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                           ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                           ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                            ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                            ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                            ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                             ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                             ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                             ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                             ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                              ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                              ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                              ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                              ",
    "                       XXXXXXXXXXXXXXXXXXXXXXXXXX                                                                               ",
];

function latLonToVector3(lat, lon, radius) {
    // Convert lat/lon to Three.js coordinates
    // Phi is polar angle (0 at North Pole, PI at South Pole)
    // Theta is azimuthal angle (0 to 2PI)
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

function createDetailedWorldTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Ocean background (Light blue from user image)
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, 512, 256);
    
    // Land color (Green from user image)
    ctx.fillStyle = '#4ade80';
    
    const pixelSizeW = 512 / 128;
    const pixelSizeH = 256 / 64;
    
    MAP_DATA.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
            if (row[x] === 'X') {
                ctx.fillRect(x * pixelSizeW, y * pixelSizeH, pixelSizeW, pixelSizeH);
            }
        }
    });
    
    // Add grid lines for reference (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 512; i += 32) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
    }
    for (let i = 0; i < 256; i += 32) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
}

function initGlobe() {
    if (renderer) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
    
    // Use antialias: false for pixelated look
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    renderer.setClearColor(0x000000, 0.1);
    globeContainer.appendChild(renderer.domElement);

    const texture = createDetailedWorldTexture();

    const geometry = new THREE.SphereGeometry(5, 64, 32);
    const material = new THREE.MeshPhongMaterial({ 
        map: texture,
        emissive: 0x222222,
        shininess: 0
    });
    
    globe = new THREE.Group();
    
    const land = new THREE.Mesh(geometry, material);
    globe.add(land);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Subtle wireframe shell
    const wireGeometry = new THREE.SphereGeometry(5.05, 24, 24);
    const wireMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.05 
    });
    const shell = new THREE.Mesh(wireGeometry, wireMaterial);
    globe.add(shell);
    
    weatherGroup = new THREE.Group();
    globe.add(weatherGroup);
    
    cityMarkers = new THREE.Group();
    globe.add(cityMarkers);
    
    scene.add(globe);
    addCityMarkers();
    
    if (currentGlobeWeatherCode) {
        updateGlobeWeather(currentGlobeWeatherCode);
    }

    // Stars background
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 400;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 60;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 12;
    let currentZoom = 12;
    const minZoom = 6;
    const maxZoom = 18;

    // Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let velocityY = 0;
    let velocityX = 0;
    const rotationDamping = 0.95;

    globeContainer.addEventListener('mousedown', e => isDragging = true);
    window.addEventListener('mouseup', e => isDragging = false);
    globeContainer.addEventListener('mousemove', e => {
        if (isDragging) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };
            velocityY = deltaMove.x * 0.005;
            velocityX = deltaMove.y * 0.005;
            globe.rotation.y += velocityY;
            globe.rotation.x += velocityX;
        }
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });

    globeContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.5;
        if (e.deltaY > 0) {
            currentZoom = Math.min(currentZoom + zoomSpeed, maxZoom);
        } else {
            currentZoom = Math.max(currentZoom - zoomSpeed, minZoom);
        }
        camera.position.z = currentZoom;
    }, { passive: false });

    let lastDistance = 0;
    globeContainer.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            if (lastDistance > 0) {
                const zoomSpeed = 0.1;
                if (distance > lastDistance) currentZoom = Math.max(currentZoom - zoomSpeed, minZoom);
                else currentZoom = Math.min(currentZoom + zoomSpeed, maxZoom);
                camera.position.z = currentZoom;
            }
            lastDistance = distance;
        } else if (e.touches.length === 1 && isDragging) {
            const touch = e.touches[0];
            const deltaMove = {
                x: touch.clientX - previousMousePosition.x,
                y: touch.clientY - previousMousePosition.y
            };
            globe.rotation.y += deltaMove.x * 0.005;
            globe.rotation.x += deltaMove.y * 0.005;
            previousMousePosition = { x: touch.clientX, y: touch.clientY };
        }
    });
    
    globeContainer.addEventListener('touchstart', e => {
        isDragging = true;
        if (e.touches.length === 1) {
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    });
    globeContainer.addEventListener('touchend', () => {
        isDragging = false;
        lastDistance = 0;
    });

    function animate() {
        requestAnimationFrame(animate);
        if (!isDragging) {
            velocityY *= rotationDamping;
            velocityX *= rotationDamping;
            globe.rotation.y += velocityY + 0.001;
            globe.rotation.x += velocityX;
        }
        
        cityMarkers.children.forEach((marker, index) => {
            const pulse = 1 + Math.sin(Date.now() * 0.005 + index) * 0.2;
            marker.scale.set(pulse, pulse, pulse);
        });
        
        renderer.render(scene, camera);
    }
    animate();
}

function addCityMarkers() {
    majorCities.forEach(city => {
        const pos = latLonToVector3(city.lat, city.lon, 5.1);
        const markerGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(pos);
        marker.userData.cityName = city.name;
        cityMarkers.add(marker);
    });
}

function updateCityWeatherMarkers() {
    cityMarkers.children.forEach(marker => {
        const cityName = marker.userData.cityName;
        if (cityWeatherData[cityName]) {
            const c = parseInt(cityWeatherData[cityName].code);
            if (c === 113) marker.material.color.setHex(0xffff00);
            else if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) marker.material.color.setHex(0x60a5fa);
            else if ([227, 230, 323, 326, 329, 332, 335, 338].includes(c)) marker.material.color.setHex(0xffffff);
            else if ([386, 389].includes(c)) marker.material.color.setHex(0xa855f7);
            else marker.material.color.setHex(0x4ade80);
        }
    });
}

globeBtn.onclick = () => {
    globeModal.style.display = "block";
    setTimeout(initGlobe, 100);
};

closeModal.onclick = () => { globeModal.style.display = "none"; };
window.onclick = (event) => { if (event.target == globeModal) globeModal.style.display = "none"; };

// Sound Engine
let audioCtx = null;
let soundEnabled = false;
let currentSound = null;

function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }

function playWeatherSound(type) {
    if (!soundEnabled || !audioCtx) return;
    stopSound();
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    const filter = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();
    if (type === 'rain') { filter.type = 'lowpass'; filter.frequency.value = 400; gainNode.gain.value = 0.15; }
    else if (type === 'wind') { filter.type = 'lowpass'; filter.frequency.value = 200; gainNode.gain.value = 0.1; }
    else if (type === 'storm') { filter.type = 'lowpass'; filter.frequency.value = 300; gainNode.gain.value = 0.2; }
    whiteNoise.connect(filter); filter.connect(gainNode); gainNode.connect(audioCtx.destination);
    whiteNoise.start();
    currentSound = { source: whiteNoise, gain: gainNode };
}

function stopSound() { if (currentSound) { currentSound.source.stop(); currentSound = null; } }

soundToggle.addEventListener('click', () => {
    initAudio();
    soundEnabled = !soundEnabled;
    soundToggle.innerText = soundEnabled ? '🔊' : '🔇';
    if (!soundEnabled) stopSound();
    else {
        const desc = descEl.innerText.toLowerCase();
        if (desc.includes('rain')) playWeatherSound('rain');
        else if (desc.includes('storm')) playWeatherSound('storm');
        else playWeatherSound('wind');
    }
});

async function fetchWeather(query = 'Moscow') {
    showLoading();
    try {
        const response = await fetch(`https://wttr.in/${query}?format=j1`);
        if (!response.ok) throw new Error('Weather data not found');
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        cityEl.innerText = 'Ошибка';
        descEl.innerText = 'Не удалось загрузить';
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
            (position) => fetchWeather(`${position.coords.latitude.toFixed(2)},${position.coords.longitude.toFixed(2)}`),
            () => fetchWeather('Moscow')
        );
    } else fetchWeather('Moscow');
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
    updateFlag(data);
    updateForecast(data);
    updateGlobeWeather(code);
    
    const c = parseInt(code);
    if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) playWeatherSound('rain');
    else if ([386, 389].includes(c)) playWeatherSound('storm');
    else if (windSpeed > 10) playWeatherSound('wind');
    else stopSound();
}

function updateGlobeWeather(code) {
    currentGlobeWeatherCode = code;
    if (!weatherGroup) return;
    while(weatherGroup.children.length > 0) weatherGroup.remove(weatherGroup.children[0]);
    const c = parseInt(code);
    if (c !== 113) {
        for(let i=0; i<15; i++) {
            const cloudGeo = new THREE.BoxGeometry(0.8, 0.4, 0.4);
            const cloudMat = new THREE.MeshBasicMaterial({ color: 0xd1d5db, transparent: true, opacity: 0.6 });
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            const phi = Math.random() * Math.PI * 2, theta = Math.random() * Math.PI, r = 5.5 + Math.random() * 0.5;
            cloud.position.set(r * Math.sin(theta) * Math.cos(phi), r * Math.cos(theta), r * Math.sin(theta) * Math.sin(phi));
            weatherGroup.add(cloud);
        }
    }
}

function updateBackgroundAnimations(code, windSpeed) {
    bgAnimations.innerHTML = '';
    const c = parseInt(code);
    if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) {
        for (let i = 0; i < 50; i++) {
            const rain = document.createElement('div');
            rain.className = 'bg-rain';
            rain.style.left = `${Math.random() * 100}vw`;
            rain.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            bgAnimations.appendChild(rain);
        }
    }
    if ([227, 230, 323, 326, 329, 332, 335, 338].includes(c)) {
        for (let i = 0; i < 40; i++) {
            const snow = document.createElement('div');
            snow.className = 'bg-snow';
            snow.style.left = `${Math.random() * 100}vw`;
            snow.style.animationDuration = `${2 + Math.random() * 3}s`;
            bgAnimations.appendChild(snow);
        }
    }
}

function setAnimation(code) {
    weatherIcon.innerHTML = '';
    document.body.className = '';
    const c = parseInt(code);
    if (c === 113) {
        document.body.classList.add('bg-sunny');
        const sun = document.createElement('div'); sun.className = 'sun'; weatherIcon.appendChild(sun);
    } else if ([116, 119, 122].includes(c)) {
        document.body.classList.add('bg-cloudy');
        const cloud = document.createElement('div'); cloud.className = 'cloud'; weatherIcon.appendChild(cloud);
    } else if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) {
        document.body.classList.add('bg-rainy');
        const cloud = document.createElement('div'); cloud.className = 'cloud'; weatherIcon.appendChild(cloud);
    } else {
        document.body.classList.add('bg-cloudy');
        const cloud = document.createElement('div'); cloud.className = 'cloud'; weatherIcon.appendChild(cloud);
    }
}

function getWeatherIcon(code) {
    const c = parseInt(code);
    if (c === 113) return '☀️';
    if ([116, 119, 122].includes(c)) return '☁️';
    if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) return '🌧️';
    if ([227, 230, 323, 326, 329, 332, 335, 338].includes(c)) return '❄️';
    if ([386, 389].includes(c)) return '⛈️';
    return '🌤️';
}

function updateForecast(data) {
    forecastContainer.innerHTML = '';
    const forecast = data.weather;
    if (!forecast) return;
    forecast.slice(0, 7).forEach((day) => {
        const date = new Date(day.date);
        const dayName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()];
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="forecast-day-name">${dayName} ${date.getDate()}</div>
            <div class="forecast-day-icon">${getWeatherIcon(day.hourly[0].weatherCode)}</div>
            <div class="forecast-day-temp">${Math.round(day.maxtempC)}°</div>
            <div class="forecast-day-temp-min">${Math.round(day.mintempC)}°</div>
        `;
        forecastContainer.appendChild(forecastDay);
    });
}

function updateFlag(data) {
    flagContainer.innerHTML = '';
    const countryCode = data.nearest_area[0].country[0].value;
    const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
    const flag = document.createElement('img');
    flag.src = flagUrl; flag.className = 'pixel-flag'; flag.onerror = () => flag.style.display = 'none';
    flagContainer.appendChild(flag);
}

searchBtn.onclick = () => { const city = cityInput.value.trim(); if (city) fetchWeather(city); };
cityInput.onkeypress = (e) => { if (e.key === 'Enter') { const city = cityInput.value.trim(); if (city) fetchWeather(city); } };

getLocation();
