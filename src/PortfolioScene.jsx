import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const MODEL_URL = '/nithish-model.glb';

export default function PortfolioScene() {
  const mountRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080b0f, 0.045);

    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0.05, 1.25, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xb8c7d8, 0x080b0f, 1.55));

    const key = new THREE.DirectionalLight(0xe8f0f6, 3.1);
    key.position.set(3.5, 5.5, 4.5);
    scene.add(key);

    const greenRim = new THREE.PointLight(0x39d353, 45, 11, 2);
    greenRim.position.set(-3.2, 2.6, -2.2);
    scene.add(greenRim);

    const blueRim = new THREE.PointLight(0x58a6ff, 32, 10, 2);
    blueRim.position.set(3.4, 1.7, -2.8);
    scene.add(blueRim);

    const group = new THREE.Group();
    scene.add(group);

    // Developer-style orbital geometry: thin technical rings instead of a sci-fi halo.
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x39d353, transparent: true, opacity: 0.34 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.004, 8, 180), ringMaterial);
    ring.rotation.x = Math.PI / 2.25;
    ring.position.y = 0.05;
    group.add(ring);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.28, 0.0025, 8, 180), new THREE.MeshBasicMaterial({ color: 0x58a6ff, transparent: true, opacity: 0.2 }));
    ring2.rotation.x = Math.PI / 2.08;
    ring2.rotation.z = 0.52;
    ring2.position.y = -0.18;
    group.add(ring2);

    const grid = new THREE.GridHelper(6.5, 26, 0x26313b, 0x182129);
    grid.position.y = -2.02;
    grid.material.transparent = true;
    grid.material.opacity = 0.28;
    group.add(grid);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 420;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 2.5 + Math.random() * 4.5;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.45) * 4.8;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius - 1.2;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0x7ee787, size: 0.014, transparent: true, opacity: 0.48, sizeAttenuation: true }));
    scene.add(particles);

    const modelRoot = new THREE.Group();
    modelRoot.position.y = -2.25;
    modelRoot.scale.setScalar(0.001);
    group.add(modelRoot);

    let model;
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z) || 1;
        const scale = 4.15 / maxSize;
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = false;
            node.receiveShadow = false;
          }
        });
        modelRoot.add(model);
        setLoaded(true);
      },
      undefined,
      () => setFailed(true)
    );

    let targetX = 0;
    let targetY = 0;
    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.18;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.11;
    };
    mount.addEventListener('pointermove', onPointerMove);

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    let elapsed = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      elapsed += delta;
      const intro = Math.min(elapsed / 2.15, 1);
      const eased = 1 - Math.pow(1 - intro, 4);
      modelRoot.position.y = THREE.MathUtils.lerp(-2.25, 0, eased);
      modelRoot.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, eased));
      if (model) model.rotation.y += delta * 0.14;
      ring.rotation.z += delta * 0.09;
      ring2.rotation.z -= delta * 0.05;
      particles.rotation.y += delta * 0.008;
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetX, 0.04);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetY, 0.04);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.55, 0.03);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.25 - targetY * 0.35, 0.03);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      mount.removeEventListener('pointermove', onPointerMove);
      renderer.dispose();
      particleGeometry.dispose();
      ring.geometry.dispose();
      ring.material.dispose();
      ring2.geometry.dispose();
      ring2.material.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="scene-shell" aria-label="Interactive 3D portrait">
      <div ref={mountRef} className="three-canvas" />
      <div className="scene-glow" />
      <div className="scene-label scene-label-top"><span />THREE.JS / GLB / INTERACTIVE</div>
      <div className="scene-label scene-label-bottom">{failed ? 'MODEL MISSING · public/nithish-model.glb' : loaded ? 'MODEL ONLINE · 60 FPS TARGET' : 'LOADING GLB ASSET…'}</div>
    </div>
  );
}
