import { useEffect, useRef, useState } from 'react';
import './command-center.css';

const MODEL_URL = '/nithish-model.glb';
const PROFILE_IMAGE = 'https://raw.githubusercontent.com/Nithishrish23/Nithish-portfolio/98f873233766d9efe6688b559262306092e7545d/static/images/1727781988320.jpg';

const NODES = [
  { id: 'ai', title: 'AI CORE', sub: 'LLM · RAG · AGENTS', x: -2.2, z: -0.25 },
  { id: 'build', title: 'BUILD LAB', sub: 'PRODUCTS · VISION', x: 0, z: -0.75 },
  { id: 'cloud', title: 'CLOUD GRID', sub: 'AWS · AZURE · CI/CD', x: 2.2, z: -0.25 },
];

export default function PortfolioScene() {
  const mountRef = useRef(null);
  const activeRef = useRef('build');
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState('build');

  const selectNode = (id) => {
    activeRef.current = id;
    setActive(id);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let cancelled = false;
    let frame = 0;
    let renderer;
    let resizeObserver;
    let mixer;
    let avatarRoot;

    const start = async () => {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        if (cancelled) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xeaf4ff);
        scene.fog = new THREE.Fog(0xeaf4ff, 7, 17);

        // Wider, slightly higher camera framing keeps the entire GLB visible, including the face.
        const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 60);
        camera.position.set(0, 0.05, 7.6);
        camera.lookAt(0, -0.48, -0.7);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.setClearColor(0xeaf4ff, 1);
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x5c7894, 2.8));
        const key = new THREE.DirectionalLight(0xffffff, 4.2);
        key.position.set(-4, 6, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x55baff, 4.8);
        rim.position.set(4, 3, -3);
        scene.add(rim);
        const blue = new THREE.PointLight(0x1769ff, 18, 10, 2);
        blue.position.set(-2.4, 1.4, 1.5);
        scene.add(blue);
        const cyan = new THREE.PointLight(0x58d7ff, 14, 9, 2);
        cyan.position.set(2.6, 1.1, -1);
        scene.add(cyan);

        const world = new THREE.Group();
        scene.add(world);

        const floor = new THREE.Mesh(
          new THREE.CircleGeometry(5.5, 80),
          new THREE.MeshStandardMaterial({ color: 0xd8e8f5, roughness: 0.92 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1.9;
        world.add(floor);

        const grid = new THREE.GridHelper(11, 44, 0x348be0, 0x9ab9d4);
        grid.position.y = -1.88;
        grid.material.transparent = true;
        grid.material.opacity = 0.22;
        world.add(grid);

        const wall = new THREE.Mesh(
          new THREE.PlaneGeometry(15, 8),
          new THREE.MeshBasicMaterial({ color: 0xf5faff })
        );
        wall.position.set(0, 1.15, -4.1);
        world.add(wall);

        const glow = new THREE.Mesh(
          new THREE.CircleGeometry(3.5, 64),
          new THREE.MeshBasicMaterial({ color: 0x8ed7ff, transparent: true, opacity: 0.17, depthWrite: false })
        );
        glow.scale.set(1.55, 0.8, 1);
        glow.position.set(0, 0.3, -3.95);
        world.add(glow);

        const holo = new THREE.Group();
        holo.position.set(0, -0.35, -0.85);
        world.add(holo);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x2388ff, transparent: true, opacity: 0.62, depthWrite: false });
        const cyanMat = new THREE.MeshBasicMaterial({ color: 0x69dcff, transparent: true, opacity: 0.35, depthWrite: false });
        [0.85, 1.25, 1.8, 2.35].forEach((radius, i) => {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, i === 0 ? 0.028 : 0.012, 8, 128), i % 2 ? cyanMat.clone() : ringMat.clone());
          ring.rotation.x = Math.PI / 2;
          ring.userData.speed = (i % 2 ? -1 : 1) * (0.08 + i * 0.025);
          holo.add(ring);
        });

        for (let i = 0; i < 12; i += 1) {
          const a = i * Math.PI * 2 / 12;
          const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.009, 0.009, 3.2, 8),
            new THREE.MeshBasicMaterial({ color: i % 2 ? 0x3b9bff : 0x8ae7ff, transparent: true, opacity: 0.16, depthWrite: false })
          );
          beam.position.set(Math.cos(a) * 1.7, 0.35, Math.sin(a) * 0.65);
          holo.add(beam);
        }

        const scan = new THREE.Mesh(
          new THREE.PlaneGeometry(3.5, 0.018),
          new THREE.MeshBasicMaterial({ color: 0x62dcff, transparent: true, opacity: 0.65, depthWrite: false })
        );
        scan.position.y = 1.25;
        holo.add(scan);

        const shadow = new THREE.Mesh(
          new THREE.CircleGeometry(0.82, 48),
          new THREE.MeshBasicMaterial({ color: 0x1b4b76, transparent: true, opacity: 0.16, depthWrite: false })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.scale.set(1.55, 0.58, 1);
        shadow.position.set(0, -1.88, -0.7);
        world.add(shadow);

        const particles = new THREE.Group();
        world.add(particles);
        for (let i = 0; i < 90; i += 1) {
          const p = new THREE.Mesh(
            new THREE.SphereGeometry(0.012 + (i % 4) * 0.005, 7, 5),
            new THREE.MeshBasicMaterial({ color: i % 3 ? 0x4fa8ff : 0x9cecff, transparent: true, opacity: 0.25 + (i % 4) * 0.08 })
          );
          const a = i * 2.399;
          const radius = 2.0 + (i % 10) * 0.27;
          p.position.set(Math.cos(a) * radius, -1.45 + (i % 14) * 0.25, -0.8 + Math.sin(a) * 1.15);
          particles.add(p);
        }

        const deskMat = new THREE.MeshStandardMaterial({ color: 0x6c8ca7, roughness: 0.65, metalness: 0.15 });
        const desk = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.09, 0.7), deskMat);
        desk.position.set(0, -0.45, -2.65);
        world.add(desk);
        [-1.7, 1.7].forEach((x) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.35, 0.08), deskMat);
          leg.position.set(x, -1.1, -2.65);
          world.add(leg);
        });
        const monitor = new THREE.Mesh(
          new THREE.BoxGeometry(2.05, 1.18, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x09182a, roughness: 0.35, metalness: 0.4 })
        );
        monitor.position.set(0, 0.75, -2.63);
        world.add(monitor);
        const monitorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.76, 0.9), new THREE.MeshBasicMaterial({ color: 0x063c68 }));
        monitorGlow.position.set(0, 0.75, -2.58);
        world.add(monitorGlow);

        // The avatar is centered from its actual bounds and scaled conservatively.
        // Do not rotate individual bones: the GLB's native idle animation already drives the rig.
        avatarRoot = new THREE.Group();
        avatarRoot.position.set(0, -0.50, 0.15);
        world.add(avatarRoot);

        const loader = new GLTFLoader();
        loader.load(
          MODEL_URL,
          (gltf) => {
            if (cancelled) return;
            const model = gltf.scene;
            model.visible = true;
            model.traverse((node) => {
              if (!node.isMesh) return;
              node.visible = true;
              node.frustumCulled = false;
              node.castShadow = false;
              node.receiveShadow = false;
              if (node.material) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach((material) => {
                  material.needsUpdate = true;
                  if ('roughness' in material) material.roughness = Math.min(material.roughness, 0.8);
                });
              }
            });

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const targetHeight = 2.82;
            const scale = targetHeight / Math.max(size.y, 0.001);
            model.scale.setScalar(scale);
            model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
            avatarRoot.add(model);

            mixer = new THREE.AnimationMixer(model);
            const idle = gltf.animations.find((clip) => /idle|stand|breath|casual|relax/i.test(clip.name)) || gltf.animations[0];
            if (idle) mixer.clipAction(idle).setLoop(THREE.LoopRepeat, Infinity).play();
            setLoaded(true);
          },
          undefined,
          (error) => {
            console.error('GLB avatar failed to load', error);
            setFailed(true);
          }
        );

        const nodeVisuals = NODES.map((node) => {
          const group = new THREE.Group();
          group.position.set(node.x, -0.48, node.z);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.014, 8, 48), ringMat.clone());
          ring.rotation.x = Math.PI / 2;
          group.add(ring);
          const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: 0x9be8ff }));
          group.add(core);
          world.add(group);
          return { group, ring, core };
        });

        const resize = () => {
          const width = Math.max(mount.clientWidth, 1);
          const height = Math.max(mount.clientHeight, 1);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
        resize();

        const clock = new THREE.Clock();
        const animate = () => {
          if (cancelled) return;
          frame = requestAnimationFrame(animate);
          const dt = Math.min(clock.getDelta(), 0.033);
          const time = clock.elapsedTime;
          if (mixer) mixer.update(dt);
          holo.rotation.y += dt * 0.08;
          holo.children.forEach((child) => {
            if (child.userData.speed) child.rotation.z += child.userData.speed * dt;
          });
          scan.position.y = -0.35 + ((Math.sin(time * 1.5) + 1) / 2) * 2.8;
          particles.rotation.y = time * 0.025;
          glow.material.opacity = 0.12 + Math.sin(time * 1.2) * 0.035;
          nodeVisuals.forEach((visual, index) => {
            const isActive = NODES[index].id === activeRef.current;
            visual.group.position.y = -0.48 + Math.sin(time * 1.8 + index) * 0.035;
            visual.ring.rotation.z += dt * (isActive ? 0.9 : 0.25);
            visual.ring.material.opacity = isActive ? 0.95 : 0.55;
            visual.core.scale.setScalar(isActive ? 1.35 : 1);
          });
          if (avatarRoot) avatarRoot.rotation.y = Math.sin(time * 0.35) * 0.035;
          renderer.render(scene, camera);
        };
        animate();
      } catch (error) {
        console.error('3D scene failed to initialize', error);
        setFailed(true);
      }
    };

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      renderer?.dispose();
      if (renderer?.domElement?.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="command-shell">
      <div ref={mountRef} className="three-canvas" aria-label="Interactive 3D AI engineering workspace" />
      <div className="holo-vignette" />
      <div className="holo-lines" />
      <div className="command-title"><span>// NITHISH KUMAR</span><strong>AI ENGINEERING<br /><em>COMMAND CENTER</em></strong></div>
      <div className="command-avatar-card">
        <img src={PROFILE_IMAGE} alt="Nithish Kumar" />
        <div><small>AI ENGINEER · FULL STACK</small><b>{loaded ? '3D AVATAR ONLINE' : failed ? '3D FALLBACK ACTIVE' : 'LOADING 3D AVATAR'}</b></div>
      </div>
      <div className="node-stack" aria-label="Portfolio focus areas">
        {NODES.map((node) => (
          <button key={node.id} className={active === node.id ? 'active' : ''} onClick={() => selectNode(node.id)}>
            <span>{node.id === 'ai' ? '01' : node.id === 'build' ? '02' : '03'}</span>
            <div><strong>{node.title}</strong><small>{node.sub}</small></div>
            <b>↗</b>
          </button>
        ))}
      </div>
      <div className="command-caption"><span>BUILD · AUTOMATE · INNOVATE</span><small>REAL GLB · NATIVE IDLE · HOLOGRAPHIC FIELD</small></div>
    </div>
  );
}
