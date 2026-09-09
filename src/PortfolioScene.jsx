import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const MODEL_URL = '/nithish-model.glb';
const isEyeNode = (name) => /eye|eyeball|iris|pupil/i.test(name || '');
const isHeadNode = (name) => /head|neck|face|look/i.test(name || '');
const isActionNode = (name) => /arm|hand|wrist|shoulder|elbow/i.test(name || '');

export default function PortfolioScene() {
  const mountRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 1.12, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe8f2ff, 0x070a0d, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 4.1);
    key.position.set(3.5, 6, 7);
    scene.add(key);
    const fill = new THREE.PointLight(0x5aa9ff, 20, 13, 2);
    fill.position.set(-3, 2.5, 4);
    scene.add(fill);
    const rim = new THREE.PointLight(0x38d17a, 15, 10, 2);
    rim.position.set(2.5, 3.5, -2);
    scene.add(rim);

    const stage = new THREE.Group();
    stage.position.y = 0.08;
    scene.add(stage);

    const grid = new THREE.GridHelper(7, 28, 0x34404a, 0x1b252d);
    grid.position.y = -1.78;
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    stage.add(grid);

    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(190 * 3);
    for (let i = 0; i < 190; i += 1) {
      const radius = 3.1 + Math.random() * 3.8;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.4) * 4.2;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 1;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xb9c7d2, size: 0.014, transparent: true, opacity: 0.28, sizeAttenuation: true }));
    scene.add(particles);

    const modelRoot = new THREE.Group();
    stage.add(modelRoot);

    let model = null;
    let mixer = null;
    let headNodes = [];
    let eyeNodes = [];
    let actionNodes = [];
    let targetX = 0;
    let targetY = 0;
    let gesture = 0;
    let scrollTarget = 0;
    let elapsed = 0;
    const clock = new THREE.Clock();
    const loader = new GLTFLoader();

    loader.load(MODEL_URL, (gltf) => {
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
        if (isActionNode(nodeName)) actionNodes.push({ node, x: node.rotation.x, y: node.rotation.y, z: node.rotation.z });
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const height = size.y || 1;
      const scale = 3.62 / height;
      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -center.y * scale + 0.08, -center.z * scale);
      modelRoot.add(model);

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        const idle = gltf.animations.find((clip) => /idle|stand|breath|casual|relax/i.test(clip.name)) || gltf.animations[0];
        mixer.clipAction(idle).reset().fadeIn(0.4).play();
      }
      setLoaded(true);
    }, undefined, (error) => {
      console.error('GLB avatar failed to load:', error);
      setFailed(true);
    });

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
      gesture = THREE.MathUtils.damp(gesture, 0, 3.1, delta);

      const intro = Math.min(elapsed / 1.2, 1);
      const eased = 1 - Math.pow(1 - intro, 4);
      const scrollSway = Math.sin(scrollTarget * Math.PI * 5) * 0.055;
      modelRoot.position.y = THREE.MathUtils.lerp(-0.55, 0.04, eased) + scrollTarget * 0.07;
      modelRoot.scale.setScalar(THREE.MathUtils.lerp(0.01, 1, eased));

      // Natural eye contact: head follows the pointer while eyes lead slightly.
      const lookX = targetX * 0.34 + gesture * 0.28;
      const lookY = targetY * 0.14 - gesture * 0.08;
      headNodes.forEach(({ node, x, y, z }) => {
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, x + lookY, 5.8, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, y + lookX + scrollSway, 5.8, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, z - gesture * 0.04, 5.8, delta);
      });
      eyeNodes.forEach(({ node, x, y, z }) => {
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, x + lookY * 1.35, 9, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, y + lookX * 1.5, 9, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, z, 9, delta);
      });

      // Small click gesture for arm/hand bones where the supplied GLB exposes them.
      const actionWave = Math.sin((1 - gesture) * Math.PI) * gesture;
      actionNodes.forEach(({ node, x, y, z }, index) => {
        const side = index % 2 === 0 ? 1 : -1;
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, x + actionWave * 0.16, 5, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, y + side * actionWave * 0.13, 5, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, z + side * actionWave * 0.08, 5, delta);
      });

      if (mixer) {
        mixer.timeScale = 0.88 + gesture * 0.32;
        mixer.update(delta);
      } else if (model) {
        model.position.y = 0.08 + Math.sin(elapsed * 1.35) * 0.018;
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, targetX * 0.1 + gesture * 0.15 + scrollSway, 0.05);
        model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, targetY * 0.04, 0.05);
      }

      stage.rotation.y = THREE.MathUtils.lerp(stage.rotation.y, targetX * 0.022 + scrollSway, 0.04);
      stage.rotation.x = THREE.MathUtils.lerp(stage.rotation.x, targetY * 0.012, 0.04);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.08, 0.025);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.12 - targetY * 0.07, 0.025);
      particles.rotation.y += delta * (0.003 + scrollTarget * 0.009);
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

  return <div className={`scene-shell ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''}`} aria-label="Interactive 3D portrait">
    <div ref={mountRef} className="three-canvas" />
    <div className="scene-glow" />
    {failed && <div className="scene-error">Avatar could not be loaded</div>}
  </div>;
}
