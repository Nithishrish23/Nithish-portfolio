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

    // Keep the hero typography clean: no decorative green rules/dashes.
    const style = document.createElement('style');
    style.textContent = `
      .hero .eyebrow > span,
      .hero h1 em:after,
      .scene-label span { display: none !important; }
      .hero .eyebrow { gap: 0 !important; }
    `;
    document.head.appendChild(style);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080b0f, 0.045);

    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0.05, 1.2, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xb8c7d8, 0x080b0f, 1.65));

    const key = new THREE.DirectionalLight(0xe8f0f6, 3.2);
    key.position.set(3.5, 5.5, 4.5);
    scene.add(key);

    const blueRim = new THREE.PointLight(0x58a6ff, 28, 10, 2);
    blueRim.position.set(3.4, 1.7, -2.8);
    scene.add(blueRim);

    const group = new THREE.Group();
    scene.add(group);

    // Clean developer environment: subtle floor grid only, no orbital green lines.
    const grid = new THREE.GridHelper(6.5, 26, 0x26313b, 0x182129);
    grid.position.y = -2.02;
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    group.add(grid);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 3 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.45) * 4.2;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius - 1.2;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: 0x7d8995, size: 0.012, transparent: true, opacity: 0.24, sizeAttenuation: true })
    );
    scene.add(particles);

    const modelRoot = new THREE.Group();
    modelRoot.position.y = -2.15;
    modelRoot.scale.setScalar(0.001);
    group.add(modelRoot);

    let model;
    let mixer;
    const clock = new THREE.Clock();
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

        // Prefer the model's own animation clips when available. This gives a
        // natural standing/idle pose instead of a constant robotic spin.
        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(model);
          const clip = gltf.animations.find((item) => /idle|stand|breath|casual/i.test(item.name)) || gltf.animations[0];
          mixer.clipAction(clip).play();
        }

        setLoaded(true);
      },
      undefined,
      () => setFailed(true)
    );

    let targetX = 0;
    let targetY = 0;
    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.12;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.07;
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

    let raf = 0;
    let elapsed = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      elapsed += delta;

      const intro = Math.min(elapsed / 1.6, 1);
      const eased = 1 - Math.pow(1 - intro, 4);
      modelRoot.position.y = THREE.MathUtils.lerp(-2.15, 0, eased);
      modelRoot.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, eased));

      if (mixer) {
        mixer.update(delta);
      } else if (model) {
        // Gentle casual standing fallback when the GLB has no animation clips.
        const breathing = Math.sin(elapsed * 1.45) * 0.035;
        const sway = Math.sin(elapsed * 0.72) * 0.018;
        modelRoot.position.y += breathing;
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, sway + targetX * 0.35, 0.035);
        model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, targetY * 0.22, 0.035);
      }

      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetX, 0.035);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetY, 0.035);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.4, 0.025);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.2 - targetY * 0.25, 0.025);
      particles.rotation.y += delta * 0.003;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      mount.removeEventListener('pointermove', onPointerMove);
      mixer?.stopAllAction();
      renderer.dispose();
      particleGeometry.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      style.remove();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="scene-shell" aria-label="Interactive 3D portrait">
      <div ref={mountRef} className="three-canvas" />
      <div className="scene-glow" />
      <div className="scene-label scene-label-top">THREE.JS / GLB / INTERACTIVE</div>
      <div className="scene-label scene-label-bottom">
        {failed ? 'MODEL MISSING · public/nithish-model.glb' : loaded ? 'MODEL ONLINE · IDLE ANIMATION' : 'LOADING GLB ASSET…'}
      </div>
    </div>
  );
}
