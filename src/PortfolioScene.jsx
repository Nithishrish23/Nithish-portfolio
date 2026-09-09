import { useEffect, useRef, useState } from 'react';

const MODEL_URL = '/nithish-model.glb';

export default function PortfolioScene() {
  const mountRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let cancelled = false;
    let raf = 0;
    let renderer = null;
    let resizeObserver = null;
    let mixer = null;
    let model = null;
    let cleanupPointer = null;
    let idleTimer = 0;

    const start = async () => {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        if (cancelled) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
        camera.position.set(0, 0.85, 7.9);
        camera.lookAt(0, 0.1, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
        renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1), false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        renderer.shadowMap.enabled = false;
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xf4f8ff, 0x6f7c8d, 2.2));
        const key = new THREE.DirectionalLight(0xffffff, 3.6);
        key.position.set(3.5, 6.5, 5.5);
        scene.add(key);
        const blueFill = new THREE.PointLight(0x2f80ed, 11, 14, 2);
        blueFill.position.set(-3.6, 3.0, 4.0);
        scene.add(blueFill);
        const warmFill = new THREE.PointLight(0xffc58a, 4, 11, 2);
        warmFill.position.set(3.4, 2.4, 2.6);
        scene.add(warmFill);

        const stage = new THREE.Group();
        stage.position.y = 0.05;
        scene.add(stage);

        const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), new THREE.MeshStandardMaterial({ color: 0xf3f7fb, roughness: 1 }));
        wall.position.set(0, 1.75, -2.75);
        stage.add(wall);

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshStandardMaterial({ color: 0xdfe8f0, roughness: 0.94 }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2.0;
        stage.add(floor);

        const windowFrame = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
        const windowGlass = new THREE.MeshStandardMaterial({ color: 0xcce5fb, roughness: 0.35, metalness: 0.05, transparent: true, opacity: 0.72 });
        const windowPanel = new THREE.Mesh(new THREE.BoxGeometry(2.65, 3.0, 0.08), windowGlass);
        windowPanel.position.set(-4.2, 1.25, -2.62);
        stage.add(windowPanel);
        const frameV = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.1, 0.14), windowFrame);
        frameV.position.set(-4.2, 1.25, -2.51);
        stage.add(frameV);
        const frameH = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.07, 0.14), windowFrame);
        frameH.position.set(-4.2, 1.25, -2.51);
        stage.add(frameH);

        const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 0.34), windowFrame);
        shelf.position.set(3.5, 1.55, -2.35);
        stage.add(shelf);
        const shelf2 = shelf.clone();
        shelf2.position.y = 0.35;
        stage.add(shelf2);

        const desk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.0), new THREE.MeshStandardMaterial({ color: 0xb9824d, roughness: 0.9 }));
        desk.position.set(-0.2, 0.35, -1.75);
        stage.add(desk);
        [-1.65, 1.25].forEach((x) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.45, 0.11), new THREE.MeshStandardMaterial({ color: 0x8d5b35, roughness: 0.9 }));
          leg.position.set(x, -0.37, -1.75);
          stage.add(leg);
        });

        const monitorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.05, 0.09), new THREE.MeshStandardMaterial({ color: 0x162330, roughness: 0.42, metalness: 0.18 }));
        monitorFrame.position.set(-0.18, 1.15, -1.72);
        stage.add(monitorFrame);
        const monitorScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.53, 0.78), new THREE.MeshBasicMaterial({ color: 0x14283a }));
        monitorScreen.position.set(-0.18, 1.15, -1.67);
        stage.add(monitorScreen);
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.1), new THREE.MeshStandardMaterial({ color: 0x465564, roughness: 0.5 }));
        stand.position.set(-0.18, 0.59, -1.72);
        stage.add(stand);

        const plantPot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0xd48c55, roughness: 0.92 }));
        plantPot.position.set(3.5, -0.05, -2.02);
        stage.add(plantPot);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x54886a, roughness: 1 });
        for (let i = 0; i < 8; i += 1) {
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), leafMat);
          const a = (i / 8) * Math.PI * 2;
          leaf.scale.set(0.5, 1.25, 0.35);
          leaf.position.set(3.5 + Math.cos(a) * 0.28, 0.35 + (i % 3) * 0.12, -2.02 + Math.sin(a) * 0.22);
          leaf.rotation.z = a * 0.35;
          stage.add(leaf);
        }

        const poster = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.07), new THREE.MeshStandardMaterial({ color: 0xd3dde8, roughness: 0.9 }));
        poster.position.set(1.9, 1.9, -2.48);
        stage.add(poster);
        const posterFace = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 1.23), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        posterFace.position.set(1.9, 1.9, -2.44);
        stage.add(posterFace);

        const strip = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.035, 0.055), new THREE.MeshBasicMaterial({ color: 0x4b94e8, transparent: true, opacity: 0.5 }));
        strip.position.set(-0.1, -1.76, -2.57);
        stage.add(strip);

        const modelRoot = new THREE.Group();
        modelRoot.position.set(0.8, -0.18, 0.12);
        stage.add(modelRoot);

        const avatarShadow = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), new THREE.MeshBasicMaterial({ color: 0x294866, transparent: true, opacity: 0.18, depthWrite: false }));
        avatarShadow.rotation.x = -Math.PI / 2;
        avatarShadow.scale.set(1.55, 0.7, 1);
        avatarShadow.position.set(0.8, -1.93, 0.3);
        stage.add(avatarShadow);

        let targetX = 0;
        let targetY = 0;
        let elapsed = 0;
        const clock = new THREE.Clock();
        const loader = new GLTFLoader();

        loader.load(
          MODEL_URL,
          (gltf) => {
            if (cancelled) return;
            model = gltf.scene;
            model.traverse((node) => {
              if (node.isMesh) {
                node.frustumCulled = true;
                node.castShadow = false;
                node.receiveShadow = false;
              }
            });
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const scale = 3.35 / (size.y || 1);
            model.scale.setScalar(scale);
            model.position.set(-center.x * scale, -center.y * scale - 0.04, -center.z * scale);
            modelRoot.add(model);

            if (gltf.animations?.length) {
              mixer = new THREE.AnimationMixer(model);
              const idle = gltf.animations.find((clip) => /idle|stand|breath|casual|relax/i.test(clip.name)) || gltf.animations[0];
              mixer.clipAction(idle).reset().fadeIn(0.6).play();
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
          if (!rect.width || !rect.height) return;
          targetX = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
          targetY = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
        };
        const onPointerLeave = () => { targetX = 0; targetY = 0; };
        mount.addEventListener('pointermove', onPointerMove, { passive: true });
        mount.addEventListener('pointerleave', onPointerLeave, { passive: true });
        cleanupPointer = () => {
          mount.removeEventListener('pointermove', onPointerMove);
          mount.removeEventListener('pointerleave', onPointerLeave);
        };

        const resize = () => {
          if (!renderer) return;
          const width = Math.max(mount.clientWidth, 1);
          const height = Math.max(mount.clientHeight, 1);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
        resize();

        const animate = () => {
          if (cancelled) return;
          raf = requestAnimationFrame(animate);
          const delta = Math.min(clock.getDelta(), 0.05);
          elapsed += delta;
          const breath = Math.sin(elapsed * 1.1) * 0.008;
          modelRoot.position.y = -0.18 + breath;
          modelRoot.rotation.y = THREE.MathUtils.lerp(modelRoot.rotation.y, targetX * 0.025, 0.05);
          modelRoot.rotation.x = THREE.MathUtils.lerp(modelRoot.rotation.x, targetY * 0.008, 0.05);
          avatarShadow.scale.x = 1.55 + Math.sin(elapsed * 1.1) * 0.012;
          avatarShadow.scale.y = 0.7 + Math.sin(elapsed * 1.1) * 0.008;
          if (mixer) mixer.update(delta * 0.72);
          camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.025, 0.025);
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.85 - targetY * 0.02, 0.025);
          camera.lookAt(0.35, 0.08, 0);
          renderer.render(scene, camera);
        };
        animate();
      } catch (error) {
        if (!cancelled) {
          console.error('3D workspace initialization failed:', error);
          setFailed(true);
        }
      }
    };

    const schedule = () => {
      if (cancelled) return;
      if ('requestIdleCallback' in window) {
        idleTimer = window.requestIdleCallback(start, { timeout: 1800 });
      } else {
        idleTimer = window.setTimeout(start, 900);
      }
    };
    schedule();

    return () => {
      cancelled = true;
      if ('cancelIdleCallback' in window && typeof idleTimer === 'number') window.cancelIdleCallback(idleTimer);
      else window.clearTimeout(idleTimer);
      cancelAnimationFrame(raf);
      cleanupPointer?.();
      resizeObserver?.disconnect();
      mixer?.stopAllAction();
      renderer?.dispose();
      if (renderer?.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      model = null;
    };
  }, []);

  return (
    <div className={`scene-shell ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''}`} aria-label="Interactive 3D developer workspace">
      <div ref={mountRef} className="three-canvas" />
      <div className="workspace-fallback" aria-hidden={loaded}>
        <div className="fallback-window"><i /><i /><i /></div>
        <div className="fallback-shelf"><span /><span /><span /></div>
        <div className="fallback-desk"><div className="fallback-monitor"><b /></div><span /></div>
        <div className="fallback-person"><img src="https://raw.githubusercontent.com/Nithishrish23/Nithish-portfolio/98f873233766d9efe6688b559262306092e7545d/static/images/1727781988320.jpg" alt="" /></div>
        <div className="fallback-glow" />
      </div>
      {!loaded && !failed && <div className="scene-loading" aria-hidden="true"><span>Preparing workspace</span></div>}
      {failed && <div className="scene-error">Workspace preview unavailable</div>}
    </div>
  );
}
