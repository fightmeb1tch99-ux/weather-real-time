import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
  temp?: number;
  condition?: string;
  icon?: string;
}

interface GlobeViewerProps {
  cities: City[];
  onCityClick?: (city: City) => void;
  loading?: boolean;
}

export default function GlobeViewer({ cities, onCityClick, loading }: GlobeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const pointsRef = useRef<Map<any, City>>(new Map());
  const glowsRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 2.5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x0a0e27, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create globe group
    const globeGroup = new THREE.Group();
    globeRef.current = globeGroup;
    scene.add(globeGroup);

    // Create Earth sphere with better texture
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // Draw realistic Earth texture
    // Ocean gradient
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#1a3a52');
    oceanGradient.addColorStop(0.5, '#0d47a1');
    oceanGradient.addColorStop(1, '#051d3e');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some ocean texture (noise)
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    // Draw landmasses with better shapes
    ctx.fillStyle = '#22c55e';
    
    // North America
    ctx.beginPath();
    ctx.ellipse(400, 600, 250, 300, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.ellipse(600, 1000, 120, 200, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Europe/Africa
    ctx.beginPath();
    ctx.ellipse(1800, 700, 350, 600, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.ellipse(2400, 600, 500, 400, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(2800, 1200, 120, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Greenland
    ctx.beginPath();
    ctx.ellipse(1200, 300, 80, 120, 0, 0, Math.PI * 2);
    ctx.fill();

    // Add some land texture
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
    for (let i = 0; i < 300; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 3, 3);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 8,
      emissive: 0x111111,
    });
    const earth = new THREE.Mesh(geometry, material);
    globeGroup.add(earth);

    // Add atmosphere glow layers
    const atmosphereGeometry1 = new THREE.SphereGeometry(1.03, 64, 64);
    const atmosphereMaterial1 = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosphere1 = new THREE.Mesh(atmosphereGeometry1, atmosphereMaterial1);
    globeGroup.add(atmosphere1);

    const atmosphereGeometry2 = new THREE.SphereGeometry(1.06, 64, 64);
    const atmosphereMaterial2 = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const atmosphere2 = new THREE.Mesh(atmosphereGeometry2, atmosphereMaterial2);
    globeGroup.add(atmosphere2);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Add stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      sizeAttenuation: true,
    });

    const starsVertices = [];
    for (let i = 0; i < 1500; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsVertices), 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Add city markers
    pointsRef.current.clear();
    glowsRef.current = [];
    
    cities.forEach((city, index) => {
      // Convert lat/lon to 3D position on sphere
      const lat = (city.lat * Math.PI) / 180;
      const lon = (city.lon * Math.PI) / 180;
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon);

      // Create marker
      const markerGeometry = new THREE.SphereGeometry(0.025, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffc8,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x * 1.08, y * 1.08, z * 1.08);
      globeGroup.add(marker);

      pointsRef.current.set(marker, city);

      // Add glow effect with animation
      const glowGeometry = new THREE.SphereGeometry(0.045, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffc8,
        transparent: true,
        opacity: 0.4,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(marker.position);
      globeGroup.add(glow);
      glowsRef.current.push(glow);

      // Store animation data
      (glow as any).animationData = {
        baseScale: 1,
        time: index * 0.1,
      };
    });

    // Mouse interaction
    const onMouseClick = (event: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const intersects = raycasterRef.current.intersectObjects(globeGroup.children);
      for (let i = 0; i < intersects.length; i++) {
        const city = pointsRef.current.get(intersects[i].object);
        if (city) {
          setSelectedCity(city);
          onCityClick?.(city);
          break;
        }
      }
    };

    containerRef.current.addEventListener('click', onMouseClick);

    // Drag to rotate
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging && globeGroup) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x += deltaY * 0.005;

        // Clamp x rotation
        globeGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globeGroup.rotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    // Animation loop
    let animationId: number;
    let time = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.016; // ~60fps

      if (!isDragging && globeGroup) {
        globeGroup.rotation.y += 0.0003;
      }

      // Animate glows with pulsing effect
      glowsRef.current.forEach((glow) => {
        const data = (glow as any).animationData;
        const pulse = 1 + Math.sin(time * 2 + data.time) * 0.3;
        glow.scale.set(pulse, pulse, pulse);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [cities, onCityClick]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-black"
        style={{ minHeight: '600px' }}
      />

      {/* Loading Indicator */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cyan-400 font-mono">Loading weather data...</p>
          </div>
        </motion.div>
      )}

      {/* Selected City Info */}
      {selectedCity && (
        <motion.div
          className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <h3 className="text-lg font-bold text-white mb-2">{selectedCity.name}</h3>
          <p className="text-cyan-400 text-sm mb-1">{selectedCity.country}</p>
          {selectedCity.temp !== undefined && (
            <>
              <p className="text-2xl font-bold text-cyan-300 mb-1">{selectedCity.temp}°C</p>
              <p className="text-gray-300 text-sm">{selectedCity.condition}</p>
            </>
          )}
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        className="absolute top-6 left-6 text-gray-400 text-sm font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>Drag to rotate • Click cities for details</p>
      </motion.div>
    </div>
  );
}
