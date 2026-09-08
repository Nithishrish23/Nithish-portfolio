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
    scene.fog = new THREE.FogExp2(0x050814, 0.055);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0.05, 1.35, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0x8ca7ff, 0x050814, 1.4);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xb7e8ff, 3.2);
    key.position.set(3, 5, 4);
    scene.add(key);

    const rim = new THREE.PointLight(0x2ccfff, 55, 13, 2);
    rim.position.set(-3, 2.8, -2);
    scene.add(rim);

    const violet = new THREE.PointLight(0x7357ff, 40, 12, 2);
    violet.position.set(3, 1.5, -3);
    scene.add(violet);

    const group = new THREE.Group();
    scene.add(group);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.006, 12, 180),
      new THREE.MeshBasicMaterial({ color: 0x55dfff, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = Math.PI / 2.25;
    ring.position.y = 0.08;
    group.add(ring);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.003, 10, 180),
      new THREE.MeshBasicMaterial({ color: 0x755bff, transparent: true, opacity: 0.28 })
    );
    innerRing.rotation.x = Math.PI / 2.1;
    innerRing.rotation.z = 0.45;
    innerRing.position.y = -0.18;
    group.add(innerRing);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 650;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 2.4 + Math.random() * 5.2;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.45) * 5;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius - 1.5;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: 0x9adfff, size: 0.018, transparent: true, opacity: 0.72, sizeAttenuation: true })
    );
    scene.add(particles);

    const modelRoot = new THREE.Group();
    modelRoot.position.y = -1.9;
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
        const targetHeight = 4.2;
        const scale = targetHeight / maxSize;
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
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.22;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.14;
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
      const intro = Math.min(elapsed / 1.9, 1);
      const eased = 1 - Math.pow(1 - intro, 3);
      modelRoot.position.y = THREE.MathUtils.lerp(-1.9, 0, eased);
      const introScale = THREE.MathUtils.lerp(0.001, 1, eased);
      modelRoot.scale.setScalar(introScale);
      if (model) model.rotation.y += delta * 0.18;
      ring.rotation.z += delta * 0.12;
      innerRing.rotation.z -= delta * 0.075;
      particles.rotation.y += delta * 0.012;
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetX, 0.045);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetY, 0.045);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.65, 0.03);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.35 - targetY * 0.4, 0.03);
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
      innerRing.geometry.dispose();
      innerRing.material.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="scene-shell" aria-label="Interactive 3D portrait">
      <div ref={mountRef} className="three-canvas" />
      <div className="scene-glow" />
      <div className="scene-label scene-label-top"><span />THREE.JS / AI ENGINEERING</div>
      <div className="scene-label scene-label-bottom">{failed ? 'Add nithish-model.glb to public/' : loaded ? 'MODEL ONLINE · INTERACTIVE' : 'INITIALIZING 3D MODEL…'}</div>
    </div>
  );
}
