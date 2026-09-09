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
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.48, 8.8);
    camera.lookAt(0, 0.15, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xf4f8ff, 0x05080b, 2.3));
    const key = new THREE.DirectionalLight(0xffffff, 4.8);
    key.position.set(3.5, 6, 7);
    scene.add(key);
    const fill = new THREE.PointLight(0x5aa9ff, 18, 13, 2);
    fill.position.set(-3, 2.5, 4);
    scene.add(fill);
    const rim = new THREE.PointLight(0x6aa9f5, 10, 11, 2);
    rim.position.set(2.5, 3.8, -2);
    scene.add(rim);

    const stage = new THREE.Group();
    stage.position.y = 0.04;
    scene.add(stage);

    const modelRoot = new THREE.Group();
    stage.add(modelRoot);

    let model = null;
    let mixer = null;
    let headNodes = [];
    let eyeNodes = [];
    let actionNodes = [];
    let targetX = 0;
    let targetY = 0;
    let dragRotation = 0;
    let targetRotation = 0;
    let rotationVelocity = 0;
    let scrollTarget = 0;
    let elapsed = 0;
    let blink = 0;
    let nextBlink = 2.5;
    let poseClock = 0;
    let poseIndex = 0;
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
        if (isEyeNode(nodeName)) eyeNodes.push({ node, x: node.rotation.x, y: node.rotation.y, z: node.rotation.z, scaleY: node.scale.y });
        if (isActionNode(nodeName)) actionNodes.push({ node, x: node.rotation.x, y: node.rotation.y, z: node.rotation.z });
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const height = size.y || 1;
      const scale = 3.12 / height;
      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -center.y * scale + 0.12, -center.z * scale);
      modelRoot.add(model);

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        const idle = gltf.animations.find((clip) => /idle|stand|breath|casual|relax/i.test(clip.name)) || gltf.animations[0];
        mixer.clipAction(idle).reset().fadeIn(0.45).play();
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
    const onPointerDown = (event) => {
      mount.setPointerCapture?.(event.pointerId);
      mount.dataset.dragging = 'true';
      mount.dataset.lastX = String(event.clientX);
    };
    const onPointerDrag = (event) => {
      if (mount.dataset.dragging !== 'true') return;
      const lastX = Number(mount.dataset.lastX || event.clientX);
      const dx = event.clientX - lastX;
      mount.dataset.lastX = String(event.clientX);
      rotationVelocity = THREE.MathUtils.clamp(dx * 0.012, -0.22, 0.22);
      targetRotation += dx * 0.012;
    };
    const onPointerUp = () => { mount.dataset.dragging = 'false'; };
    const onScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollTarget = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    };

    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointermove', onPointerDrag);
    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('pointercancel', onPointerUp);
    mount.addEventListener('pointerleave', onPointerLeave);
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
      poseClock += delta;

      const intro = Math.min(elapsed / 1.1, 1);
      const eased = 1 - Math.pow(1 - intro, 4);
      const isDragging = mount.dataset.dragging === 'true';
      if (!isDragging) targetRotation += rotationVelocity * delta * 60;
      rotationVelocity = THREE.MathUtils.damp(rotationVelocity, 0, 4.2, delta);
      dragRotation = THREE.MathUtils.damp(dragRotation, targetRotation, 7, delta);

      const scrollSway = Math.sin(scrollTarget * Math.PI * 5) * 0.035;
      modelRoot.position.y = THREE.MathUtils.lerp(-0.55, 0.16, eased) + scrollTarget * 0.04;
      modelRoot.scale.setScalar(THREE.MathUtils.lerp(0.01, 1, eased));
      modelRoot.rotation.y = dragRotation + scrollSway;

      /* Automatically alternate between relaxed/casual and polished/professional micro-poses. */
      if (poseClock > 8) {
        poseClock = 0;
        poseIndex = (poseIndex + 1) % 2;
      }
      const poseBlend = THREE.MathUtils.smoothstep((poseClock % 2) / 2, 0, 1);
      const poseTarget = poseIndex === 0 ? 0 : 1;
      const poseAmount = poseTarget ? poseBlend : 1 - poseBlend;
      const breathing = Math.sin(elapsed * 1.35) * 0.008;

      const lookX = targetX * 0.24;
      const lookY = targetY * 0.1;
      headNodes.forEach(({ node, x, y, z }) => {
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, x + lookY, 6.2, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, y + lookX, 6.2, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, z, 6.2, delta);
      });

      /* Natural blink timing, independent of the number of eye meshes. */
      if (elapsed > nextBlink) {
        blink = 1;
        nextBlink = elapsed + 2.8 + Math.random() * 3.4;
      }
      blink = THREE.MathUtils.damp(blink, 0, 12, delta);
      eyeNodes.forEach(({ node, x, y, z, scaleY }) => {
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, x + lookY * 1.3, 10, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, y + lookX * 1.5, 10, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, z, 10, delta);
        node.scale.y = scaleY * Math.max(0.12, 1 - blink * 0.92);
      });

      /* Very subtle shoulder/arm movement gives the character a living, conversational feel without breaking the rig. */
      actionNodes.forEach(({ node, x, y, z }, index) => {
        const side = index % 2 === 0 ? 1 : -1;
        const relaxed = Math.sin(elapsed * 0.9 + index) * 0.012;
        const professional = Math.sin(elapsed * 1.05 + index) * 0.006;
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, x + THREE.MathUtils.lerp(relaxed, professional, poseAmount) + breathing, 5.5, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, y + side * THREE.MathUtils.lerp(0.008, 0.002, poseAmount), 5.5, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, z + side * THREE.MathUtils.lerp(0.012, 0.004, poseAmount), 5.5, delta);
      });

      if (mixer) {
        mixer.timeScale = 0.9;
        mixer.update(delta);
      } else if (model) {
        model.position.y = 0.12 + breathing;
      }

      stage.rotation.x = THREE.MathUtils.lerp(stage.rotation.x, targetY * 0.008, 0.04);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.06, 0.025);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.48 - targetY * 0.05, 0.025);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointermove', onPointerDrag);
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('pointerup', onPointerUp);
      mount.removeEventListener('pointercancel', onPointerUp);
      mount.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      mixer?.stopAllAction();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className={`scene-shell ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''}`} aria-label="Interactive 3D portrait">
    <div ref={mountRef} className="three-canvas" />
    <div className="scene-glow" />
    <div className="avatar-rotate-hint"><span className="rotate-icon">↔</span> Drag to rotate 360°</div>
    {failed && <div className="scene-error">Avatar could not be loaded</div>}
  </div>;
}
