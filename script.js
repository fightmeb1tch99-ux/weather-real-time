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

// Globe Logic
let scene, camera, renderer, globe, weatherGroup;
let currentGlobeWeatherCode = null;

function createPixelWorldTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Fill ocean (deep blue)
    ctx.fillStyle = '#0d47a1';
    ctx.fillRect(0, 0, 256, 128);
    
    // 8-bit world map data (64x32 grid)
    const map = [
        "                                                                ",
        "                XXXXXXXXXXXXXX                                  ",
        "             XXXXXXXXXXXXXXXXXXXX                               ",
        "            XXXXXXXXXXXXXXXXXXXXXX          XXXXXX              ",
        "           XXXXXXXXXXXXXXXXXXXXXXXX        XXXXXXXX             ",
        "          XXXXXXXXXXXXXXXXXXXXXXXXXX      XXXXXXXXXX            ",
        "          XXXXXXXXXXXXXXXXXXXXXXXXXXX    XXXXXXXXXXXX           ",
        "         XXXXXXXXXXXXXXXXXXXXXXXXXXXXX  XXXXXXXXXXXXXX          ",
        "    XXXX  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX         ",
        "   XXXXXX  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX         ",
        "  XXXXXXXX  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          ",
        " XXXXXXXXXX  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX           ",
        "XXXXXXXXXXXX  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX            ",
        "XXXXXXXXXXXXX  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX             ",
        "XXXXXXXXXXXXXX  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX              ",
        "XXXXXXXXXXXXXXX  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               ",
        " XXXXXXXXXXXXXXX  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                ",
        "  XXXXXXXXXXXXXX   XXXXXXXXXXXXXXXXXXXXXXXXXXXX                 ",
        "   XXXXXXXXXXXX     XXXXXXXXXXXXXXXXXXXXXXXXXX                  ",
        "    XXXXXXXXXX       XXXXXXXXXXXXXXXXXXXXXXXX                   ",
        "     XXXXXXXX         XXXXXXXXXXXXXXXXXXXXXX                    ",
        "      XXXXXX           XXXXXXXXXXXXXXXXXXXX                     ",
        "       XXXX             XXXXXXXXXXXXXXXXXX                      ",
        "        XX               XXXXXXXXXXXXXXXX                       ",
        "                          XXXXXXXXXXXXXX                        ",
        "                           XXXXXXXXXXXX                         ",
        "                            XXXXXXXXXX                          ",
        "                             XXXXXXXX                           ",
        "                              XXXXXX                            ",
        "                               XXXX                             ",
        "                                XX                              ",
        "                                                                "
    ];

    ctx.fillStyle = '#4ade80'; // Land color
    const pixelSize = 4;
    
    // Draw the map from the array
    map.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
            if (row[x] === 'X') {
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}



function initGlobe() {
    if (renderer) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    globeContainer.appendChild(renderer.domElement);

    const texture = createPixelWorldTexture();
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const material = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: false,
        side: THREE.FrontSide
    });
    
    globe = new THREE.Group();
    
    const land = new THREE.Mesh(geometry, material);
    globe.add(land);
    
    // Add a subtle glowing wireframe shell
    const wireGeometry = new THREE.SphereGeometry(5.1, 24, 24);
    const wireMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x4ade80, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 
    });
    const shell = new THREE.Mesh(wireGeometry, wireMaterial);
    globe.add(shell);
    
    // Weather Group for particles
    weatherGroup = new THREE.Group();
    globe.add(weatherGroup);
    
    scene.add(globe);
    
    // Initial globe weather if data already exists
    if (currentGlobeWeatherCode) {
        updateGlobeWeather(currentGlobeWeatherCode);
    }

    // Stars
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 30;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.08, color: 0xffffff });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 12;

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
            globe.rotation.y += deltaMove.x * 0.01;
            globe.rotation.x += deltaMove.y * 0.01;
        }
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
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

    function animate() {
        requestAnimationFrame(animate);
        if (!isDragging) {
            globe.rotation.y += 0.003;
        }
        renderer.render(scene, camera);
    }
    animate();
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
    updateGlobeWeather(code);
    
    // Update sounds
    const c = parseInt(code);
    if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) playWeatherSound('rain');
    else if ([386, 389].includes(c)) playWeatherSound('storm');
    else if (windSpeed > 10) playWeatherSound('wind');
    else stopSound();
}

function updateGlobeWeather(code) {
    currentGlobeWeatherCode = code;
    if (!weatherGroup) return;
    
    // Clear existing weather
    while(weatherGroup.children.length > 0) {
        weatherGroup.remove(weatherGroup.children[0]);
    }
    
    const c = parseInt(code);
    
    // Clouds
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
                r * Math.sin(theta) * Math.sin(phi),
                r * Math.cos(theta)
            );
            cloud.lookAt(0,0,0);
            weatherGroup.add(cloud);
        }
    }
    
    // Rain
    if ([263, 266, 293, 296, 299, 302, 305, 308].includes(c)) {
        const rainCount = 200;
        const rainGeo = new THREE.BufferGeometry();
        const rainPos = new Float32Array(rainCount * 3);
        for(let i=0; i<rainCount; i++) {
            const r = 5.2 + Math.random() * 2;
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            rainPos[i*3] = r * Math.sin(theta) * Math.cos(phi);
            rainPos[i*3+1] = r * Math.sin(theta) * Math.sin(phi);
            rainPos[i*3+2] = r * Math.cos(theta);
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
        const rainMat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.05 });
        const rainPoints = new THREE.Points(rainGeo, rainMat);
        weatherGroup.add(rainPoints);
    }
    
    // Snow
    if ([227, 230, 323, 326, 329, 332, 335, 338].includes(c)) {
        const snowCount = 150;
        const snowGeo = new THREE.BufferGeometry();
        const snowPos = new Float32Array(snowCount * 3);
        for(let i=0; i<snowCount; i++) {
            const r = 5.2 + Math.random() * 2;
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            snowPos[i*3] = r * Math.sin(theta) * Math.cos(phi);
            snowPos[i*3+1] = r * Math.sin(theta) * Math.sin(phi);
            snowPos[i*3+2] = r * Math.cos(theta);
        }
        snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
        const snowMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.07 });
        const snowPoints = new THREE.Points(snowGeo, snowMat);
        weatherGroup.add(snowPoints);
    }
}

function updateFlag(data) {
    flagContainer.innerHTML = '';
    // wttr.in doesn't always provide ISO code easily, but we can try to get it or use a fallback
    // For the easter egg, we'll try to find the country and show its flag
    const country = data.nearest_area[0].country[0].value;
    
    // Simple mapping for common countries
    const countryMap = {
        'Russia': 'ru', 'Russian Federation': 'ru',
        'USA': 'us', 'United States of America': 'us',
        'UK': 'gb', 'United Kingdom': 'gb',
        'Germany': 'de', 'France': 'fr', 'Japan': 'jp',
        'China': 'cn', 'Kazakhstan': 'kz', 'Ukraine': 'ua',
        'Belarus': 'by', 'Uzbekistan': 'uz', 'Armenia': 'am',
        'Georgia': 'ge', 'Azerbaijan': 'az', 'Kyrgyzstan': 'kg',
        'Tajikistan': 'tj', 'Turkmenistan': 'tm', 'Moldova': 'md',
        'Latvia': 'lv', 'Lithuania': 'lt', 'Estonia': 'ee',
        'Poland': 'pl', 'Turkey': 'tr', 'Israel': 'il',
        'Italy': 'it', 'Spain': 'es', 'Canada': 'ca', 'Brazil': 'br'
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
