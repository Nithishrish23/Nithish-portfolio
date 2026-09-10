import { useEffect, useRef, useState } from 'react';
import './command-center.css';

const MODEL_URL = '/nithish-model.glb';
const PROFILE_IMAGE = 'https://raw.githubusercontent.com/Nithishrish23/Nithish-portfolio/98f873233766d9efe6688b559262306092e7545d/static/images/1727781988320.jpg';
const NODES = [
  { id: 'ai', title: 'AI CORE', sub: 'LLM · RAG · AGENTS', x: -2.35, z: -0.15, accent: '01' },
  { id: 'build', title: 'BUILD LAB', sub: 'PRODUCTS · VISION', x: 0, z: -0.72, accent: '02' },
  { id: 'cloud', title: 'CLOUD GRID', sub: 'AWS · AZURE · CI/CD', x: 2.35, z: -0.15, accent: '03' },
];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function PortfolioScene() {
  const mountRef = useRef(null);
  const modeRef = useRef(false);
  const activeRef = useRef('build');
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState(false);
  const [active, setActive] = useState('build');
  const [message, setMessage] = useState('HOLOGRAM LINK ONLINE · READY TO EXPLORE');

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let cancelled = false;
    let raf = 0;
    let renderer;
    let observer;
    let mixer;
    let model;
    let cleanup = () => {};
    const keys = new Set();
    const state = { x: 0, z: 0.32, yaw: 0, target: null, time: 0 };

    const start = async () => {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        if (cancelled) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xeaf4ff);
        scene.fog = new THREE.Fog(0xeaf4ff, 8, 18);
        const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 80);
        camera.position.set(0, 0.35, 7.8);
        const cameraTarget = new THREE.Vector3(0, -0.3, -0.75);
        camera.lookAt(cameraTarget);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        renderer.setClearColor(0xeaf4ff, 1);
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x52728e, 2.8));
        const key = new THREE.DirectionalLight(0xffffff, 4.8); key.position.set(-4, 7, 5); scene.add(key);
        const rim = new THREE.DirectionalLight(0x55aaff, 3.5); rim.position.set(4, 3, -2); scene.add(rim);
        const blue = new THREE.PointLight(0x1769ff, 16, 13, 2); blue.position.set(-2.8, 1.6, 1.4); scene.add(blue);
        const cyan = new THREE.PointLight(0x5bd4ff, 13, 11, 2); cyan.position.set(2.7, 1.3, -0.6); scene.add(cyan);

        const world = new THREE.Group(); scene.add(world);
        const mat = (color, roughness = .72, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
        const floor = new THREE.Mesh(new THREE.CircleGeometry(5.5, 72), mat(0xd8e7f3, .95));
        floor.rotation.x = -Math.PI / 2; floor.position.y = -1.92; world.add(floor);
        const grid = new THREE.GridHelper(10, 36, 0x4d9be7, 0x9dbbd5);
        grid.position.y = -1.9; grid.material.transparent = true; grid.material.opacity = .2; world.add(grid);

        const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 7.5), new THREE.MeshBasicMaterial({ color: 0xf4f9ff }));
        wall.position.set(0, 1.3, -4.3); world.add(wall);
        const wallGlow = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 5.8), new THREE.MeshBasicMaterial({ color: 0xdceeff, transparent: true, opacity: .48 }));
        wallGlow.position.set(0, 1.25, -4.24); world.add(wallGlow);

        // Hologram field: layered rings, vertical beams and a scanning plane around the avatar.
        const holo = new THREE.Group(); holo.position.set(0, -0.35, -1.35); world.add(holo);
        const holoBlue = new THREE.MeshBasicMaterial({ color: 0x2f8df3, transparent: true, opacity: .34, side: THREE.DoubleSide, depthWrite: false });
        const holoCyan = new THREE.MeshBasicMaterial({ color: 0x6bd9ff, transparent: true, opacity: .18, side: THREE.DoubleSide, depthWrite: false });
        [1.0, 1.55, 2.15].forEach((radius, i) => {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, i === 0 ? .025 : .012, 8, 128), i === 1 ? holoCyan.clone() : holoBlue.clone());
          ring.rotation.x = Math.PI / 2; ring.position.y = i * .48; ring.userData.speed = i % 2 ? -.08 : .12; holo.add(ring);
        });
        for (let i = 0; i < 9; i += 1) {
          const beam = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 3.6, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x2f8df3 : 0x8bdcff, transparent: true, opacity: .12, depthWrite: false }));
          const a = i * Math.PI * 2 / 9; beam.position.set(Math.cos(a) * 1.8, .45, Math.sin(a) * .55); holo.add(beam);
        }
        const scan = new THREE.Mesh(new THREE.PlaneGeometry(3.6, .025), new THREE.MeshBasicMaterial({ color: 0x5ed6ff, transparent: true, opacity: .45, depthWrite: false }));
        scan.position.y = 1.15; holo.add(scan);

        const desk = new THREE.Mesh(new THREE.BoxGeometry(4.4, .11, .82), mat(0x8d5a38, .9));
        desk.position.set(0, -.35, -2.15); world.add(desk);
        [-1.9, 1.9].forEach((x) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(.1, 1.4, .1), mat(0x60412f)); leg.position.set(x, -1.05, -2.15); world.add(leg); });
        const monitor = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.35, .08), mat(0x0b1827, .35, .35));
        monitor.position.set(0, .82, -2.15); world.add(monitor);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.02, 1.04), new THREE.MeshBasicMaterial({ color: 0x06233e }));
        screen.position.set(0, .82, -2.1); world.add(screen);
        const screenLines = new THREE.Group(); screenLines.position.set(0, .82, -2.08); world.add(screenLines);
        for (let i = 0; i < 5; i += 1) {
          const line = new THREE.Mesh(new THREE.PlaneGeometry(.9 - i * .08, .035), new THREE.MeshBasicMaterial({ color: i === 0 ? 0x5bd4ff : 0x2f8df3, transparent: true, opacity: .55 }));
          line.position.set(-.35 + i * .08, .22 - i * .15, 0); screenLines.add(line);
        }

        const particles = new THREE.Group(); world.add(particles);
        for (let i = 0; i < 70; i += 1) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(.014 + (i % 4) * .006, 8, 6), new THREE.MeshBasicMaterial({ color: i % 3 ? 0x54aaff : 0x91e5ff, transparent: true, opacity: .35 + (i % 4) * .08 }));
          const a = i * 2.399; const r = 2.0 + (i % 9) * .36;
          p.position.set(Math.cos(a) * r, -1.45 + (i % 13) * .27, -1.2 + Math.sin(a) * 1.2); particles.add(p);
        }

        const nodeVisuals = NODES.map((node, index) => {
          const g = new THREE.Group(); g.position.set(node.x, -.58, node.z);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(.34, .018, 8, 48), new THREE.MeshBasicMaterial({ color: index === 1 ? 0x1769ff : 0x58aaf5, transparent: true, opacity: .72 }));
          ring.rotation.x = Math.PI / 2; g.add(ring);
          const core = new THREE.Mesh(new THREE.SphereGeometry(.075, 18, 12), new THREE.MeshBasicMaterial({ color: 0x9fe3ff })); g.add(core);
          const beam = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .55, 8), new THREE.MeshBasicMaterial({ color: 0x61caff, transparent: true, opacity: .35 })); beam.position.y = .28; g.add(beam);
          world.add(g); return { g, ring, core, beam };
        });

        const avatarRoot = new THREE.Group(); avatarRoot.position.set(state.x, -.12, state.z); world.add(avatarRoot);
        const shadow = new THREE.Mesh(new THREE.CircleGeometry(.82, 40), new THREE.MeshBasicMaterial({ color: 0x17324b, transparent: true, opacity: .18, depthWrite: false }));
        shadow.rotation.x = -Math.PI / 2; shadow.scale.set(1.45, .6, 1); shadow.position.set(0, -1.89, .18); world.add(shadow);

        const loader = new GLTFLoader();
        loader.load(MODEL_URL, (gltf) => {
          if (cancelled) return;
          model = gltf.scene;
          model.traverse((n) => { if (n.isMesh) { n.frustumCulled = false; n.castShadow = false; n.receiveShadow = false; } });
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const scale = 3.25 / Math.max(size.y, .001);
          model.scale.setScalar(scale);
          model.position.set(-center.x * scale, -center.y * scale - .02, -center.z * scale);
          avatarRoot.add(model);
          mixer = new THREE.AnimationMixer(model);
          const idle = gltf.animations.find((clip) => /idle|stand|breath|casual|relax/i.test(clip.name)) || gltf.animations[0];
          if (idle) mixer.clipAction(idle).setLoop(THREE.LoopRepeat, Infinity).play();
          setLoaded(true);
        }, undefined, (error) => { console.error('GLB avatar failed to load:', error); setFailed(true); });

        const routeTo = (node) => { state.target = { x: node.x, z: node.z }; setActive(node.id); setMessage(`${node.title} · ROUTE LOCKED`); };
        const onKeyDown = (e) => {
          if (!modeRef.current) return;
          const k = e.key.toLowerCase();
          if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) { e.preventDefault(); keys.add(k); }
          if (k === 'e' || k === ' ') { const node = NODES.find((n) => n.id === activeRef.current); if (node) routeTo(node); }
        };
        const onKeyUp = (e) => keys.delete(e.key.toLowerCase());
        window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);

        const resize = () => { const w = Math.max(mount.clientWidth, 1); const h = Math.max(mount.clientHeight, 1); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); };
        observer = new ResizeObserver(resize); observer.observe(mount); resize();
        const clock = new THREE.Clock();
        const animate = () => {
          if (cancelled) return;
          raf = requestAnimationFrame(animate);
          const dt = Math.min(clock.getDelta(), .033); state.time += dt;
          if (mixer) mixer.update(dt);
          if (modeRef.current) {
            if (state.target) {
              const dx = state.target.x - state.x; const dz = state.target.z - state.z; const d = Math.hypot(dx, dz);
              if (d < .12) { state.target = null; setMessage('NODE REACHED · PRESS E TO INTERACT'); }
              else { state.x += (dx / d) * dt * 1.8; state.z += (dz / d) * dt * 1.2; state.yaw = Math.atan2(dx, dz); }
            } else {
              const dx = (keys.has('a') || keys.has('arrowleft') ? -1 : 0) + (keys.has('d') || keys.has('arrowright') ? 1 : 0);
              const dz = (keys.has('w') || keys.has('arrowup') ? -1 : 0) + (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
              const len = Math.hypot(dx, dz) || 1;
              if (dx || dz) { state.x = clamp(state.x + (dx / len) * dt * 1.65, -3.2, 3.2); state.z = clamp(state.z + (dz / len) * dt * 1.1, -.3, .75); state.yaw = Math.atan2(dx, dz); }
            }
          }
          avatarRoot.position.x = THREE.MathUtils.damp(avatarRoot.position.x, state.x, 10, dt);
          avatarRoot.position.z = THREE.MathUtils.damp(avatarRoot.position.z, state.z, 10, dt);
          avatarRoot.rotation.y = THREE.MathUtils.damp(avatarRoot.rotation.y, state.yaw, 10, dt);
          shadow.position.x = avatarRoot.position.x; shadow.position.z = avatarRoot.position.z + .12;
          holo.rotation.y = state.time * .08;
          holo.children.forEach((child, i) => { if (child.userData.speed) child.rotation.z += child.userData.speed * dt; if (i === 0) child.rotation.z += .15 * dt; });
          scan.position.y = -.2 + ((Math.sin(state.time * 1.3) + 1) * .5) * 2.2;
          particles.rotation.y = state.time * .02;
          nodeVisuals.forEach((v, i) => { const n = NODES[i]; const near = Math.hypot(state.x - n.x, state.z - n.z) < .7 || activeRef.current === n.id; v.g.position.y = -.58 + Math.sin(state.time * 2 + i) * .04; v.ring.scale.setScalar(near ? 1.25 : 1); v.ring.material.opacity = near ? .98 : .48; v.core.scale.setScalar(near ? 1.5 : 1); v.beam.material.opacity = near ? .75 : .25; });
          camera.position.x = THREE.MathUtils.damp(camera.position.x, state.x * .1, 5, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, .35 + Math.sin(state.time * .35) * .03, 5, dt);
          camera.lookAt(cameraTarget);
          renderer.render(scene, camera);
        };
        animate();
        cleanup = () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); observer?.disconnect(); cancelAnimationFrame(raf); mixer?.stopAllAction(); renderer?.dispose(); if (renderer?.domElement?.parentNode === mount) mount.removeChild(renderer.domElement); };
      } catch (error) { console.error('3D command center failed:', error); setFailed(true); }
    };
    start();
    return () => { cancelled = true; cleanup(); };
  }, []);

  const enter = () => { const next = !modeRef.current; modeRef.current = next; setMode(next); setMessage(next ? 'EXPLORE MODE · WASD / ARROWS TO MOVE' : 'SYSTEM PAUSED · SELECT A NODE'); };
  const selectNode = (node) => { activeRef.current = node.id; setActive(node.id); setMessage(`${node.title} · ${node.sub}`); if (modeRef.current) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' })); };

  return (
    <div className={`scene-shell command-shell ${loaded ? 'is-loaded' : ''}`}>
      <div ref={mountRef} className="three-canvas" />
      <div className="holo-vignette" />
      <div className="holo-lines" />
      <div className="command-top">
        <div className="identity-card"><img src={PROFILE_IMAGE} alt="Nithish Kumar" /><div><span>PLAYER PROFILE</span><strong>NITHISH KUMAR</strong><small>AI ENGINEER · FULL STACK DEVELOPER</small></div></div>
        <div className="system-pill"><i /> HOLOGRAM COMMAND CENTER <b>v3.0</b></div>
        <div className="status-card"><span>SYSTEM</span><strong>ONLINE</strong><small>CHENNAI · INDIA</small></div>
      </div>
      <div className="command-left"><span className="eyebrow">// DIGITAL WORKSPACE</span><h2>BUILD.<br /><em>AUTOMATE.</em><br />INNOVATE.</h2><p>{message}</p><button onClick={enter}>{mode ? 'EXIT EXPLORE' : 'ENTER EXPERIENCE'} <b>↗</b></button></div>
      <div className="node-stack">{NODES.map((node) => <button key={node.id} className={active === node.id ? 'active' : ''} onClick={() => selectNode(node)}><span>{node.accent}</span><div><strong>{node.title}</strong><small>{node.sub}</small></div><b>↗</b></button>)}</div>
      <div className="command-bottom"><div><span>03</span> SYSTEM NODES</div><div className="progress"><i /></div><div>WASD <small>EXPLORE</small> · E <small>INTERACT</small></div></div>
      {!loaded && !failed && <div className="scene-loading"><span /> LOADING NITHISH 3D MODEL</div>}
      {failed && <div className="scene-error">3D model could not load — check the GLB asset path.</div>}
    </div>
  );
}
