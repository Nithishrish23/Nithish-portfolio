import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const MODEL_URL = '/nithish-model.glb';

const isEyeNode = (name) => /eye|eyeball|iris|pupil/i.test(name || '');
const isHeadNode = (name) => /head|neck|face|look/i.test(name || '');

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
    let headNodes = [];
    let eyeNodes = [];
    let gesture = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollTarget = 0;
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
          const nodeName = `${node.name} ${node.userData?.name || ''}`;
          if (isHeadNode(nodeName)) headNodes.push({ node, x: node.rotation.x, y: node.rotation.y, z: node.rotation.z });
          if (isEyeNode(nodeName)) eyeNodes.push({ node, x: node.rotation.x, y: node.rotation.y, z: node.rotation.z });
        });

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

    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      targetX = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      targetY = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const onClick = () => {
      gesture = 1;
    };

    const onScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollTarget = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    };

    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerleave', onPointerLeave);
    mount.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

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
      gesture = THREE.MathUtils.damp(gesture, 0, 3.8, delta);

      const intro = Math.min(elapsed / 1.6, 1);
      const eased = 1 - Math.pow(1 - intro, 4);
      const scrollSway = Math.sin(scrollTarget * Math.PI * 3) * 0.055;
      modelRoot.position.y = THREE.MathUtils.lerp(-2.15, 0, eased) + scrollTarget * 0.08;
      modelRoot.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, eased) * (1 + scrollTarget * 0.025));

      const lookX = targetX * 0.42 + gesture * 0.22;
      const lookY = targetY * 0.18 - gesture * 0.08;
      headNodes.forEach(({ node, x, y, z }) => {
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, x + lookY, 5.5, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, y + lookX + scrollSway, 5.5, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, z - gesture * 0.04, 5.5, delta);
      });
      eyeNodes.forEach(({ node, x, y, z }) => {
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, x + lookY * 1.25, 7, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, y + lookX * 1.35, 7, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, z, 7, delta);
      });

      if (mixer) {
        mixer.timeScale = 0.85 + Math.sin(elapsed * 1.2) * 0.06 + gesture * 0.45;
        mixer.update(delta);
      } else if (model) {
        const breathing = Math.sin(elapsed * 1.45) * 0.035;
        const sway = Math.sin(elapsed * 0.72) * 0.018;
        modelRoot.position.y += breathing;
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, sway + targetX * 0.16 + gesture * 0.18, 0.045);
        model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, targetY * 0.07, 0.045);
      }

      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetX * 0.035 + scrollSway, 0.035);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetY * 0.02, 0.035);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.14, 0.025);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.2 - targetY * 0.12, 0.025);
      particles.rotation.y += delta * (0.003 + scrollTarget * 0.01);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerleave', onPointerLeave);
      mount.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      mixer?.stopAllAction();
      renderer.dispose();
      particleGeometry.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={`scene-shell ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''}`} aria-label="Interactive 3D portrait">
      <div ref={mountRef} className="three-canvas" />
      <div className="scene-glow" />
      <div className="scene-interaction"><span>{failed ? 'Avatar unavailable' : loaded ? 'Move your cursor · click to get my attention' : 'Loading…'}</span><i/></div>
    </div>
  );
}
