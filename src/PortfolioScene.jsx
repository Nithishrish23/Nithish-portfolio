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
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.35, 7.6);
    camera.lookAt(0, 0.05, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setClearColor(0xffffff, 0);
    mount.appendChild(renderer.domElement);

    // Soft studio lighting so the real GLB remains the visual focus.
    scene.add(new THREE.HemisphereLight(0xf8fbff, 0xc9d5e3, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 4.4);
    key.position.set(3, 6, 6);
    scene.add(key);
    const fill = new THREE.PointLight(0x5b9cff, 9, 12, 2);
    fill.position.set(-3, 2.2, 4);
    scene.add(fill);
    const soft = new THREE.DirectionalLight(0xdbeafe, 1.4);
    soft.position.set(-4, 2, -2);
    scene.add(soft);

    const stage = new THREE.Group();
    stage.position.y = -0.02;
    scene.add(stage);

    const modelRoot = new THREE.Group();
    stage.add(modelRoot);

    let model = null;
    let mixer = null;
    let targetX = 0;
    let targetY = 0;
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
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const height = size.y || 1;
        const scale = 3.6 / height;
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale + 0.02, -center.z * scale);
        modelRoot.add(model);

        // Prefer a real idle/standing animation from the supplied GLB when available.
        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(model);
          const idle = gltf.animations.find((clip) => /idle|stand|breath|casual|relax/i.test(clip.name)) || gltf.animations[0];
          mixer.clipAction(idle).reset().fadeIn(0.5).play();
        }
        setLoaded(true);
      },
      undefined,
      (error) => {
        console.error('GLB avatar failed to load:', error);
        setFailed(true);
      },
    );

    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      targetX = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      targetY = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
    };
    const onPointerLeave = () => { targetX = 0; targetY = 0; };

    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerleave', onPointerLeave);

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

      // Calm, natural standing motion. No floating entrance and no avatar spin.
      const breath = Math.sin(elapsed * 1.15) * 0.012;
      modelRoot.position.y = 0.03 + breath;
      modelRoot.rotation.y = THREE.MathUtils.lerp(modelRoot.rotation.y, targetX * 0.045, 0.045);
      modelRoot.rotation.x = THREE.MathUtils.lerp(modelRoot.rotation.x, targetY * 0.018, 0.045);

      if (mixer) mixer.update(delta * 0.82);

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.035, 0.025);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.35 - targetY * 0.02, 0.025);
      camera.lookAt(0, 0.05, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerleave', onPointerLeave);
      mixer?.stopAllAction();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={`scene-shell ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''}`} aria-label="Interactive 3D portrait">
      <div
        className="avatar-backdrop"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: [
            'radial-gradient(circle at 50% 30%, rgba(255,255,255,.98) 0 8%, rgba(229,239,248,.92) 32%, rgba(194,210,225,.72) 60%, rgba(145,165,183,.48) 100%)',
            'linear-gradient(115deg, rgba(255,255,255,.76), transparent 42%, rgba(54,103,147,.16))',
            'repeating-linear-gradient(90deg, transparent 0 88px, rgba(57,92,120,.075) 89px, transparent 90px)',
            'repeating-linear-gradient(0deg, transparent 0 66px, rgba(57,92,120,.055) 67px, transparent 68px)',
          ].join(','),
        }}
      >
        <div style={{ position: 'absolute', inset: '8% 7% 34%', border: '1px solid rgba(255,255,255,.38)', borderRadius: '18px', boxShadow: 'inset 0 0 80px rgba(45,78,105,.08)' }} />
        <div style={{ position: 'absolute', left: '9%', right: '9%', bottom: '6%', height: '30%', background: 'repeating-linear-gradient(90deg, rgba(38,70,96,.11) 0 1px, transparent 1px 58px)', transform: 'perspective(420px) rotateX(58deg)', transformOrigin: 'bottom', maskImage: 'linear-gradient(to bottom, transparent, #000 30%, transparent)' }} />
        <div style={{ position: 'absolute', left: '50%', bottom: '8%', width: '30%', height: '5%', transform: 'translateX(-50%)', borderRadius: '50%', background: 'rgba(20,43,63,.24)', filter: 'blur(15px)' }} />
      </div>
      <div ref={mountRef} className="three-canvas" />
      {failed && <div className="scene-error">Avatar could not be loaded</div>}
    </div>
  );
}
