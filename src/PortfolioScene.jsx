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
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.05, 7.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xdce8f2, 0x070a0d, 1.9));
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(3, 5, 6);
    scene.add(key);
    const fill = new THREE.PointLight(0x58a6ff, 18, 12, 2);
    fill.position.set(-3, 2.2, 3);
    scene.add(fill);
    const rim = new THREE.PointLight(0x39d353, 12, 9, 2);
    rim.position.set(2, 3, -2);
    scene.add(rim);

    const stage = new THREE.Group();
    scene.add(stage);

    const grid = new THREE.GridHelper(6.5, 26, 0x26313b, 0x182129);
    grid.position.y = -1.86;
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    stage.add(grid);

    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(160 * 3);
    for (let i = 0; i < 160; i += 1) {
      const radius = 3 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.45) * 4;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 1;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: 0x9aa6b2, size: 0.014, transparent: true, opacity: 0.25, sizeAttenuation: true })
    );
    scene.add(particles);

    const modelRoot = new THREE.Group();
    modelRoot.position.set(0, 0, 0);
    stage.add(modelRoot);

    let model = null;
    let mixer = null;
    let headNodes = [];
    let eyeNodes = [];
    let targetX = 0;
    let targetY = 0;
    let gesture = 0;
    let scrollTarget = 0;
    let elapsed = 0;
    const clock = new THREE.Clock();
    const loader = new GLTFLoader();

    loader.load(
      MODEL_URL,
      (gltf) => {
        model = gltf.scene;
        model.traverse((node) => {
          if (node.isMesh) {
            node.frustumCulled = false;
            node.castShadow = false;
            node.receiveShadow = false;
          }
          const nodeName = `${node.name || ''} ${node.userData?.name || ''}`;
          if (isHeadNode(nodeName)) headNodes.push({ node, x: node.rotation.x, y: node.rotation.y, z: node.rotation.z });
          if (isEyeNode(nodeName)) eyeNodes.push({ node, x: node.rotation.x, y: node.rotation.y, z: node.rotation.z });
        });

        // Frame by the model's real height so the full standing avatar is visible.
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const height = size.y || 1;
        const scale = 3.55 / height;
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale - 0.05, -center.z * scale);
        modelRoot.add(model);

        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(model);
          const idle = gltf.animations.find((clip) => /idle|stand|breath|casual/i.test(clip.name)) || gltf.animations[0];
          const action = mixer.clipAction(idle);
          action.reset().fadeIn(0.35).play();
        }
        setLoaded(true);
      },
      undefined,
      (error) => {
        console.error('GLB avatar failed to load:', error);
        setFailed(true);
      }
    );

    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      targetX = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      targetY = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
    };
    const onPointerLeave = () => { targetX = 0; targetY = 0; };
    const onClick = () => { gesture = 1; };
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
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      elapsed += delta;
      gesture = THREE.MathUtils.damp(gesture, 0, 4.2, delta);

      const intro = Math.min(elapsed / 1.25, 1);
      const eased = 1 - Math.pow(1 - intro, 4);
      const scrollSway = Math.sin(scrollTarget * Math.PI * 4) * 0.045;
      modelRoot.position.y = THREE.MathUtils.lerp(-0.7, 0.05, eased) + scrollTarget * 0.05;
      modelRoot.scale.setScalar(THREE.MathUtils.lerp(0.01, 1, eased));

      const lookX = targetX * 0.38 + gesture * 0.22;
      const lookY = targetY * 0.16 - gesture * 0.07;
      headNodes.forEach(({ node, x, y, z }) => {
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, x + lookY, 5.5, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, y + lookX + scrollSway, 5.5, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, z - gesture * 0.035, 5.5, delta);
      });
      eyeNodes.forEach(({ node, x, y, z }) => {
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, x + lookY * 1.25, 8, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, y + lookX * 1.35, 8, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, z, 8, delta);
      });

      if (mixer) {
        mixer.timeScale = 0.9 + gesture * 0.35;
        mixer.update(delta);
      } else if (model) {
        model.position.y = -0.05 + Math.sin(elapsed * 1.4) * 0.018;
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, targetX * 0.12 + gesture * 0.16, 0.05);
        model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, targetY * 0.045, 0.05);
      }

      stage.rotation.y = THREE.MathUtils.lerp(stage.rotation.y, targetX * 0.025 + scrollSway, 0.035);
      stage.rotation.x = THREE.MathUtils.lerp(stage.rotation.x, targetY * 0.015, 0.035);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.1, 0.025);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.05 - targetY * 0.08, 0.025);
      particles.rotation.y += delta * (0.003 + scrollTarget * 0.008);
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
      {failed && <div className="scene-error">Avatar could not be loaded</div>}
    </div>
  );
}
