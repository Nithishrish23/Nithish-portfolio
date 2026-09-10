import { useEffect, useRef, useState } from 'react';
import './workspace-fallback.css';

const MODEL_URL = '/nithish-model.glb';
const PROFILE_IMAGE = 'https://raw.githubusercontent.com/Nithishrish23/Nithish-portfolio/98f873233766d9efe6688b559262306092e7545d/static/images/1727781988320.jpg';
const NODES = [
  { id: 'ai', title: 'AI CORE', sub: 'LLM · RAG · AGENTS', x: -2.55, z: -0.05, accent: '01' },
  { id: 'build', title: 'BUILD LAB', sub: 'PRODUCTS · VISION', x: -0.15, z: -0.85, accent: '02' },
  { id: 'cloud', title: 'CLOUD GRID', sub: 'AWS · AZURE · CI/CD', x: 2.55, z: -0.05, accent: '03' },
];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function PortfolioScene() {
  const mountRef = useRef(null);
  const modeRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState(false);
  const [active, setActive] = useState('build');
  const [message, setMessage] = useState('SYSTEM ONLINE · READY TO EXPLORE');

  useEffect(() => { modeRef.current = mode; }, [mode]);

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
    const state = { x: 0, z: 0.18, yaw: 0, target: null, time: 0 };

    const start = async () => {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        if (cancelled) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xeaf3ff, 8, 18);
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
        camera.position.set(0, 0.55, 7.6);
        const cameraTarget = new THREE.Vector3(0, -0.18, -0.65);
        camera.lookAt(cameraTarget);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.setClearColor(0, 0);
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xf8fbff, 0x496078, 2.4));
        const key = new THREE.DirectionalLight(0xffffff, 4.5); key.position.set(-3, 7, 5); scene.add(key);
        const blue = new THREE.PointLight(0x1769ff, 12, 15, 2); blue.position.set(-3, 2, 2); scene.add(blue);
        const cyan = new THREE.PointLight(0x61c8ff, 8, 12, 2); cyan.position.set(3, 2, 0); scene.add(cyan);

        const world = new THREE.Group(); scene.add(world);
        const mat = (color, roughness = .75, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
        const floor = new THREE.Mesh(new THREE.CircleGeometry(5.3, 64), mat(0xd9e5ef, .92));
        floor.rotation.x = -Math.PI / 2; floor.position.y = -1.92; world.add(floor);
        const grid = new THREE.GridHelper(9.5, 32, 0x6ea9dc, 0xb7cadc);
        grid.position.y = -1.89; grid.material.transparent = true; grid.material.opacity = .18; world.add(grid);
        const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), new THREE.MeshBasicMaterial({ color: 0xf4f8fc, transparent: true, opacity: .75 }));
        back.position.set(0, 1.25, -4.2); world.add(back);

        const halo = new THREE.Mesh(new THREE.TorusGeometry(2.15, .018, 8, 128), new THREE.MeshBasicMaterial({ color: 0x3f91ef, transparent: true, opacity: .45 }));
        halo.position.set(0, .15, -1.75); world.add(halo);
        const halo2 = halo.clone(); halo2.scale.setScalar(1.25); halo2.material = halo.material.clone(); halo2.material.opacity = .16; halo2.rotation.y = Math.PI / 2; world.add(halo2);

        const desk = new THREE.Mesh(new THREE.BoxGeometry(4.2, .12, .92), mat(0x9a633e, .88));
        desk.position.set(0, -.35, -1.9); world.add(desk);
        [-1.85, 1.85].forEach((x) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(.1, 1.45, .1), mat(0x68442f)); leg.position.set(x, -1.05, -1.9); world.add(leg); });
        const monitor = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.25, .08), mat(0x101d2b, .38, .3));
        monitor.position.set(0, .8, -1.9); world.add(monitor);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.92, .96), new THREE.MeshBasicMaterial({ color: 0x071a2d }));
        screen.position.set(0, .8, -1.84); world.add(screen);
        const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.75, .78), new THREE.MeshBasicMaterial({ color: 0x0c4c86, transparent: true, opacity: .42 }));
        screenGlow.position.set(0, .8, -1.82); world.add(screenGlow);

        [-1, 1].forEach((side) => {
          const tower = new THREE.Mesh(new THREE.BoxGeometry(.22, 4.2, .22), mat(0xb5c8d9, .65, .25));
          tower.position.set(side * 4.45, .1, -2.2); world.add(tower);
          const light = new THREE.Mesh(new THREE.BoxGeometry(.035, 3.1, .035), new THREE.MeshBasicMaterial({ color: 0x2f80ed }));
          light.position.set(side * 4.32, .1, -2.05); world.add(light);
        });

        const particles = new THREE.Group(); world.add(particles);
        for (let i = 0; i < 42; i += 1) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(.018 + (i % 3) * .008, 8, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x4e9ef5 : 0x91d4ff, transparent: true, opacity: .45 }));
          const a = i * 2.399; const r = 2.2 + (i % 7) * .42;
          p.position.set(Math.cos(a) * r, -1.1 + (i % 9) * .32, -1.3 + Math.sin(a) * .9); particles.add(p);
        }

        const nodeVisuals = NODES.map((node, index) => {
          const g = new THREE.Group(); g.position.set(node.x, -.55, node.z);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(.38, .018, 8, 48), new THREE.MeshBasicMaterial({ color: index === 1 ? 0x1769ff : 0x65aaf3, transparent: true, opacity: .72 }));
          ring.rotation.x = Math.PI / 2; g.add(ring);
          const core = new THREE.Mesh(new THREE.SphereGeometry(.075, 16, 10), new THREE.MeshBasicMaterial({ color: 0x8ed0ff })); g.add(core);
          world.add(g); return { g, ring, core };
        });

        const avatarRoot = new THREE.Group(); avatarRoot.position.set(state.x, -.18, state.z); world.add(avatarRoot);
        const shadow = new THREE.Mesh(new THREE.CircleGeometry(.88, 32), new THREE.MeshBasicMaterial({ color: 0x17324b, transparent: true, opacity: .18, depthWrite: false }));
        shadow.rotation.x = -Math.PI / 2; shadow.scale.set(1.5, .62, 1); shadow.position.set(0, -1.88, .18); world.add(shadow);

        const loader = new GLTFLoader();
        loader.load(MODEL_URL, (gltf) => {
          if (cancelled) return;
          model = gltf.scene;
          model.traverse((n) => { if (n.isMesh) { n.frustumCulled = true; n.castShadow = false; n.receiveShadow = false; } });
          const box = new THREE.Box3().setFromObject(model); const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3());
          const scale = 3.18 / Math.max(size.y, .001); model.scale.setScalar(scale); model.position.set(-center.x * scale, -center.y * scale - .02, -center.z * scale);
          avatarRoot.add(model);
          mixer = new THREE.AnimationMixer(model);
          const idle = gltf.animations.find((c) => /idle|stand|breath|casual|relax/i.test(c.name)) || gltf.animations[0];
          if (idle) mixer.clipAction(idle).setLoop(THREE.LoopRepeat, Infinity).play();
          setLoaded(true);
        }, undefined, (error) => { console.error('GLB avatar failed to load:', error); setFailed(true); });

        const go = (node) => { state.target = { x: node.x, z: node.z }; setActive(node.id); setMessage(`${node.title} · ROUTE LOCKED`); };
        const onKeyDown = (e) => {
          if (!modeRef.current) return;
          const k = e.key.toLowerCase();
          if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) { e.preventDefault(); keys.add(k); }
          if (k === 'e' || k === ' ') { const n = NODES.find((x) => x.id === active); if (n) go(n); }
        };
        const onKeyUp = (e) => keys.delete(e.key.toLowerCase());
        window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);

        const resize = () => { const w = Math.max(mount.clientWidth, 1); const h = Math.max(mount.clientHeight, 1); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); };
        observer = new ResizeObserver(resize); observer.observe(mount); resize();
        const clock = new THREE.Clock();
        const animate = () => {
          if (cancelled) return; raf = requestAnimationFrame(animate); const dt = Math.min(clock.getDelta(), .033); state.time += dt;
          if (mixer) mixer.update(dt);
          if (modeRef.current) {
            if (!state.target) {
              const dx = (keys.has('a') || keys.has('arrowleft') ? -1 : 0) + (keys.has('d') || keys.has('arrowright') ? 1 : 0);
              const dz = (keys.has('w') || keys.has('arrowup') ? -1 : 0) + (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
              const len = Math.hypot(dx, dz) || 1;
              if (dx || dz) { state.x = clamp(state.x + (dx / len) * dt * 1.65, -3.35, 3.35); state.z = clamp(state.z + (dz / len) * dt * 1.15, -.35, .8); state.yaw = Math.atan2(dx, dz); }
            } else {
              const dx = state.target.x - state.x; const dz = state.target.z - state.z; const d = Math.hypot(dx, dz);
              if (d < .12) { state.target = null; setMessage('NODE REACHED · PRESS E TO INTERACT'); }
              else { state.x += (dx / d) * dt * 1.8; state.z += (dz / d) * dt * 1.25; state.yaw = Math.atan2(dx, dz); }
            }
          }
          avatarRoot.position.x = THREE.MathUtils.damp(avatarRoot.position.x, state.x, 9, dt);
          avatarRoot.position.z = THREE.MathUtils.damp(avatarRoot.position.z, state.z, 9, dt);
          avatarRoot.rotation.y = THREE.MathUtils.damp(avatarRoot.rotation.y, state.yaw, 10, dt);
          shadow.position.x = avatarRoot.position.x; shadow.position.z = avatarRoot.position.z + .12;
          halo.rotation.z = state.time * .08; halo2.rotation.x = state.time * .12; particles.rotation.y = state.time * .018;
          nodeVisuals.forEach((v, i) => { const n = NODES[i]; const near = Math.hypot(state.x - n.x, state.z - n.z) < .7 || active === n.id; v.g.position.y = -.55 + Math.sin(state.time * 2 + i) * .035; v.ring.scale.setScalar(near ? 1.2 : 1); v.ring.material.opacity = near ? .98 : .48; v.core.scale.setScalar(near ? 1.45 : 1); });
          camera.position.x = THREE.MathUtils.damp(camera.position.x, state.x * .08, 5, dt); camera.position.y = THREE.MathUtils.damp(camera.position.y, .55 + Math.sin(state.time * .35) * .03, 5, dt); camera.lookAt(cameraTarget);
          renderer.render(scene, camera);
        };
        animate();
        cleanup = () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); observer?.disconnect(); cancelAnimationFrame(raf); mixer?.stopAllAction(); renderer?.dispose(); if (renderer?.domElement?.parentNode === mount) mount.removeChild(renderer.domElement); };
      } catch (error) { console.error('3D command center failed:', error); setFailed(true); }
    };
    start(); return () => { cancelled = true; cleanup(); };
  }, []);

  const enter = () => { setMode((v) => !v); setMessage(mode ? 'SYSTEM PAUSED · SELECT A NODE' : 'EXPLORE MODE · WASD / ARROWS TO MOVE'); };
  const selectNode = (node) => { setActive(node.id); setMessage(`${node.title} · ${node.sub}`); if (modeRef.current) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' })); };

  return (
    <div className="scene-shell command-shell">
      <div ref={mountRef} className="three-canvas" />
      <div className="command-glow" />
      <div className="command-top">
        <div className="identity-card"><img src={PROFILE_IMAGE} alt="Nithish Kumar" /><div><span>PLAYER PROFILE</span><strong>NITHISH KUMAR</strong><small>AI ENGINEER · FULL STACK DEVELOPER</small></div></div>
        <div className="system-pill"><i /> AI COMMAND CENTER <b>v2.6</b></div>
        <div className="status-card"><span>SYSTEM</span><strong>ONLINE</strong><small>CHENNAI · INDIA</small></div>
      </div>
      <div className="command-left"><span className="eyebrow">// DIGITAL WORKSPACE</span><h2>BUILD.<br /><em>AUTOMATE.</em><br />INNOVATE.</h2><p>{message}</p><button onClick={enter}>{mode ? 'EXIT EXPLORE' : 'ENTER EXPERIENCE'} <b>↗</b></button></div>
      <div className="node-stack">{NODES.map((node) => <button key={node.id} className={active === node.id ? 'active' : ''} onClick={() => selectNode(node)}><span>{node.accent}</span><div><strong>{node.title}</strong><small>{node.sub}</small></div><b>↗</b></button>)}</div>
      <div className="command-bottom"><div><span>03</span> SYSTEM NODES</div><div className="progress"><i /></div><div>WASD <small>EXPLORE</small> · E <small>INTERACT</small></div></div>
      {!loaded && !failed && <div className="scene-loading"><span /> INITIALIZING AI WORLD</div>}
      {failed && <div className="scene-error">3D environment could not load.</div>}
    </div>
  );
}
