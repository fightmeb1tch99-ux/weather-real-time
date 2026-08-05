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

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    
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
    
    // Ocean background
    ctx.fillStyle = '#1a4d7a';
    ctx.fillRect(0, 0, 512, 256);
    
    // More detailed world map
    const landColor = '#2d8659';
    const coastColor = '#3da070';
    
    ctx.fillStyle = landColor;
    
    // North America
    ctx.fillRect(40, 50, 80, 100);
    ctx.fillRect(50, 140, 40, 30);
    
    // South America
    ctx.fillRect(80, 140, 30, 80);
    
    // Europe
    ctx.fillRect(200, 40, 60, 50);
    
    // Africa
    ctx.fillRect(220, 90, 50, 100);
    
    // Asia
    ctx.fillRect(280, 30, 150, 120);
    
    // Australia
    ctx.fillRect(420, 150, 40, 50);
    
    // Greenland
    ctx.fillRect(160, 10, 30, 40);
    
    // Add coastlines with lighter color
    ctx.strokeStyle = coastColor;
    ctx.lineWidth = 1;
    
    // Add grid lines for reference
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 512; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();
    }
    for (let i = 0; i < 256; i += 64) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function initGlobe() {
    if (renderer) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    renderer.setClearColor(0x000000, 0.1);
    globeContainer.appendChild(renderer.domElement);

    // Create globe with detailed map
    const texture = createDetailedWorldTexture();
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    const geometry = new THREE.SphereGeometry(5, 128, 64);
    const material = new THREE.MeshPhongMaterial({ 
        map: texture,
        emissive: 0x333333,
        shininess: 5
    });
    
    globe = new THREE.Group();
    
    const land = new THREE.Mesh(geometry, material);
    globe.add(land);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Add a subtle glowing wireframe shell
    const wireGeometry = new THREE.SphereGeometry(5.15, 32, 32);
    const wireMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x4ade80, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.1 
    });
    const shell = new THREE.Mesh(wireGeometry, wireMaterial);
    globe.add(shell);
    
    // Weather Group for particles
    weatherGroup = new THREE.Group();
    globe.add(weatherGroup);
    
    // City markers group
    cityMarkers = new THREE.Group();
    globe.add(cityMarkers);
    
    scene.add(globe);
    
    // Add city markers
    addCityMarkers();
    
    // Initial globe weather if data already exists
    if (currentGlobeWeatherCode) {
        updateGlobeWeather(currentGlobeWeatherCode);
    }

    // Stars background
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 50;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 12;
    let currentZoom = 12;
    const minZoom = 5;
    const maxZoom = 20;

    // Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    globeContainer.addEventListener('mousedown', e => isDragging = true);
    window.addEventListener('mouseup', e => isDragging = false);
    globeContainer.addEventListener('mousemove', e => {
        if (isDragging) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };
            velocityY = deltaMove.x * 0.01;
            velocityX = deltaMove.y * 0.01;
            globe.rotation.y += velocityY;
            globe.rotation.x += velocityX;
        }
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });

    // Zoom with mouse wheel
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

    // Pinch zoom for touch devices
    let lastDistance = 0;
    globeContainer.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            
            if (lastDistance > 0) {
                const zoomSpeed = 0.05;
                if (distance > lastDistance) {
                    currentZoom = Math.max(currentZoom - zoomSpeed, minZoom);
                } else {
                    currentZoom = Math.min(currentZoom + zoomSpeed, maxZoom);
                }
                camera.position.z = currentZoom;
            }
            lastDistance = distance;
        }
    });
    
    globeContainer.addEventListener('touchend', () => {
        lastDistance = 0;
    });

    // Touch support
    globeContainer.addEventListener('touchstart', e => isDragging = true);
    window.addEventListener('touchend', e => isDragging = false);
    globeContainer.addEventListener('touchmove', e => {
        if (isDragging) {
            const touch = e.touches[0];
            const deltaMove = {
                x: touch.clientX - previousMousePosition.x,
                y: touch.clientY - previousMousePosition.y
            };
            globe.rotation.y += deltaMove.x * 0.01;
            globe.rotation.x += deltaMove.y * 0.01;
            previousMousePosition = { x: touch.clientX, y: touch.clientY };
        }
    });

    let targetRotationY = 0;
    let targetRotationX = 0;
    const rotationDamping = 0.95;
    let velocityY = 0;
    let velocityX = 0;

    function animate() {
        requestAnimationFrame(animate);
        
        if (!isDragging) {
            // Auto-rotate slowly
            targetRotationY += 0.0003;
            
            // Smooth damping for inertia
            velocityY *= rotationDamping;
            velocityX *= rotationDamping;
            
            globe.rotation.y += velocityY + 0.0003;
        }
        
        // Update city marker glow
        cityMarkers.children.forEach((marker, index) => {
            marker.scale.x = 1 + Math.sin(Date.now() * 0.003 + index) * 0.2;
            marker.scale.y = marker.scale.x;
            marker.scale.z = marker.scale.x;
        });
        
        renderer.render(scene, camera);
    }
    animate();
}

function addCityMarkers() {
    majorCities.forEach(city => {
        const pos = latLonToVector3(city.lat, city.lon, 5.3);
        
        // Create a small sphere as marker
        const markerGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffcc00,
            emissive: 0xff9900
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(pos);
        marker.userData.cityName = city.name;
        marker.userData.lat = city.lat;
        marker.userData.lon = city.lon;
        
        cityMarkers.add(marker);
    });
}

function updateCityWeatherMarkers() {
    // Update city markers based on weather data
    cityMarkers.children.forEach(marker => {
        const cityName = marker.userData.cityName;
        if (cityWeatherData[cityName]) {
            const weatherCode = cityWeatherData[cityName].code;
            const c = parseInt(weatherCode);
            
            // Change color based on weather
            if (c === 113) {
                marker.material.color.setHex(0xffff00); // Sunny - yellow
            } else if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) {
                marker.material.color.setHex(0x60a5fa); // Rain - blue
            } else if ([227, 230, 323, 326, 329, 332, 335, 338].includes(c)) {
                marker.material.color.setHex(0xffffff); // Snow - white
            } else if ([386, 389].includes(c)) {
                marker.material.color.setHex(0xa855f7); // Storm - purple
            } else {
                marker.material.color.setHex(0x4ade80); // Cloudy - green
            }
        }
    });
}

globeBtn.onclick = () => {
    globeModal.style.display = "block";
    setTimeout(initGlobe, 100);
};

closeModal.onclick = () => {
    globeModal.style.display = "none";
};

window.onclick = (event) => {
    if (event.target == globeModal) {
        globeModal.style.display = "none";
    }
};

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
    
    while(weatherGroup.children.length > 0) {
        weatherGroup.remove(weatherGroup.children[0]);
    }
    
    const c = parseInt(code);
    
    if (c !== 113) {
        const cloudCount = (c === 116) ? 5 : 15;
        for(let i=0; i<cloudCount; i++) {
            const cloudGeo = new THREE.BoxGeometry(0.8, 0.4, 0.4);
            const cloudMat = new THREE.MeshBasicMaterial({ color: 0xd1d5db, transparent: true, opacity: 0.6 });
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const r = 5.5 + Math.random() * 0.5;
            
            cloud.position.set(
                r * Math.sin(theta) * Math.cos(phi),
                r * Math.cos(theta),
                r * Math.sin(theta) * Math.sin(phi)
            );
            
            weatherGroup.add(cloud);
        }
    }
    
    if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) {
        for (let i = 0; i < 30; i++) {
            const rainGeo = new THREE.BoxGeometry(0.05, 0.2, 0.05);
            const rainMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
            const rain = new THREE.Mesh(rainGeo, rainMat);
            
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const r = 5.5;
            
            rain.position.set(
                r * Math.sin(theta) * Math.cos(phi),
                r * Math.cos(theta),
                r * Math.sin(theta) * Math.sin(phi)
            );
            
            weatherGroup.add(rain);
        }
    }
    
    if ([227, 230, 323, 326, 329, 332, 335, 338].includes(c)) {
        for (let i = 0; i < 25; i++) {
            const snowGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const snowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const snow = new THREE.Mesh(snowGeo, snowMat);
            
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const r = 5.5;
            
            snow.position.set(
                r * Math.sin(theta) * Math.cos(phi),
                r * Math.cos(theta),
                r * Math.sin(theta) * Math.sin(phi)
            );
            
            weatherGroup.add(snow);
        }
    }
}

function updateBackgroundAnimations(code, windSpeed) {
    bgAnimations.innerHTML = '';
    
    if ([263, 266, 293, 296, 299, 302, 305, 308].includes(code)) {
        for (let i = 0; i < 50; i++) {
            const rain = document.createElement('div');
            rain.className = 'bg-rain';
            rain.style.left = `${Math.random() * 100}vw`;
            rain.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            rain.style.animationDelay = `${Math.random()}s`;
            bgAnimations.appendChild(rain);
        }
    }

    if ([227, 230, 323, 326, 329, 332, 335, 338].includes(code)) {
        for (let i = 0; i < 40; i++) {
            const snow = document.createElement('div');
            snow.className = 'bg-snow';
            snow.style.left = `${Math.random() * 100}vw`;
            snow.style.animationDuration = `${2 + Math.random() * 3}s`;
            snow.style.animationDelay = `${Math.random() * 2}s`;
            bgAnimations.appendChild(snow);
        }
    }

    if ([386, 389].includes(code)) {
        const flash = document.createElement('div');
        flash.className = 'bg-flash';
        bgAnimations.appendChild(flash);
    }

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
    document.body.className = '';
    
    const c = parseInt(code);

    if (c === 113) {
        document.body.classList.add('bg-sunny');
        const sun = document.createElement('div');
        sun.className = 'sun';
        weatherIcon.appendChild(sun);
    } else if (c === 116 || c === 119 || c === 122) {
        document.body.classList.add('bg-cloudy');
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        weatherIcon.appendChild(cloud);
    } else if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) {
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
        document.body.classList.add('bg-stormy');
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        weatherIcon.appendChild(cloud);
        const bolt = document.createElement('div');
        bolt.className = 'lightning';
        weatherIcon.appendChild(bolt);
    } else {
        document.body.classList.add('bg-cloudy');
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        weatherIcon.appendChild(cloud);
    }
}

function updateFlag(data) {
    flagContainer.innerHTML = '';
    const countryCode = data.nearest_area[0].country[0].value;
    const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
    
    const flag = document.createElement('img');
    flag.src = flagUrl;
    flag.className = 'pixel-flag';
    flag.onerror = () => flag.style.display = 'none';
    flagContainer.appendChild(flag);
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

getLocation();
