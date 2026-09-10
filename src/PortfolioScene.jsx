import { useEffect, useRef, useState } from 'react';
import './workspace-fallback.css';

const MODEL_URL = '/nithish-model.glb';
const MISSIONS = [
  { id: 'ai', title: 'AI LAB', hint: 'Discover the intelligence layer', x: -2.7, detail: 'LLM · RAG · AGENTS · MCP' },
  { id: 'projects', title: 'PROJECTS', hint: 'Inspect the build console', x: -0.15, detail: 'PRODUCTS · AUTOMATION · VISION' },
  { id: 'cloud', title: 'CLOUD', hint: 'Reach the delivery node', x: 2.75, detail: 'AWS · AZURE · DOCKER · CI/CD' },
];

export default function PortfolioScene() {
  const mountRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [activeMission, setActiveMission] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [message, setMessage] = useState('Explore the developer world');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let cancelled = false;
    let raf = 0;
    let renderer = null;
    let resizeObserver = null;
    let mixer = null;
    let model = null;
    let idleTimer = 0;
    let cleanup = () => {};
    const keys = new Set();
    const state = { x: 0.8, z: 0.12, moving: false, direction: 1, lastMission: '' };

    const start = async () => {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        if (cancelled) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
        camera.position.set(0, 0.85, 7.9);
        camera.lookAt(0.35, 0.08, 0);
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
        const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
        keyLight.position.set(3.5, 6.5, 5.5);
        scene.add(keyLight);
        const blueFill = new THREE.PointLight(0x2f80ed, 11, 14, 2);
        blueFill.position.set(-3.6, 3, 4);
        scene.add(blueFill);
        const warmFill = new THREE.PointLight(0xffc58a, 4, 11, 2);
        warmFill.position.set(3.4, 2.4, 2.6);
        scene.add(warmFill);

        const stage = new THREE.Group();
        stage.position.y = 0.05;
        scene.add(stage);
        const mat = (color, roughness = 0.8) => new THREE.MeshStandardMaterial({ color, roughness });
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), mat(0xf3f7fb, 1));
        wall.position.set(0, 1.75, -2.75);
        stage.add(wall);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), mat(0xdfe8f0, 0.94));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        stage.add(floor);
        const frame = mat(0xffffff);
        const glass = new THREE.MeshStandardMaterial({ color: 0xcce5fb, roughness: 0.35, transparent: true, opacity: 0.72 });
        const windowPanel = new THREE.Mesh(new THREE.BoxGeometry(2.65, 3, 0.08), glass);
        windowPanel.position.set(-4.2, 1.25, -2.62);
        stage.add(windowPanel);
        const frameV = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.1, 0.14), frame);
        frameV.position.set(-4.2, 1.25, -2.51);
        stage.add(frameV);
        const frameH = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.07, 0.14), frame);
        frameH.position.set(-4.2, 1.25, -2.51);
        stage.add(frameH);
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 0.34), frame);
        shelf.position.set(3.5, 1.55, -2.35);
        stage.add(shelf);
        const shelf2 = shelf.clone();
        shelf2.position.y = 0.35;
        stage.add(shelf2);
        const desk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1), mat(0xb9824d, 0.9));
        desk.position.set(-0.2, 0.35, -1.75);
        stage.add(desk);
        [-1.65, 1.25].forEach((x) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.45, 0.11), mat(0x8d5b35, 0.9));
          leg.position.set(x, -0.37, -1.75);
          stage.add(leg);
        });
        const monitorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.05, 0.09), new THREE.MeshStandardMaterial({ color: 0x162330, roughness: 0.42, metalness: 0.18 }));
        monitorFrame.position.set(-0.18, 1.15, -1.72);
        stage.add(monitorFrame);
        const monitorScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.53, 0.78), new THREE.MeshBasicMaterial({ color: 0x14283a }));
        monitorScreen.position.set(-0.18, 1.15, -1.67);
        stage.add(monitorScreen);
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.1), mat(0x465564, 0.5));
        stand.position.set(-0.18, 0.59, -1.72);
        stage.add(stand);
        const plantPot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.4, 12), mat(0xd48c55, 0.92));
        plantPot.position.set(3.5, -0.05, -2.02);
        stage.add(plantPot);
        const leafMat = mat(0x54886a, 1);
        for (let i = 0; i < 8; i += 1) {
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), leafMat);
          const a = (i / 8) * Math.PI * 2;
          leaf.scale.set(0.5, 1.25, 0.35);
          leaf.position.set(3.5 + Math.cos(a) * 0.28, 0.35 + (i % 3) * 0.12, -2.02 + Math.sin(a) * 0.22);
          stage.add(leaf);
        }
        const poster = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.07), mat(0xd3dde8, 0.9));
        poster.position.set(1.9, 1.9, -2.48);
        stage.add(poster);
        const strip = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.035, 0.055), new THREE.MeshBasicMaterial({ color: 0x4b94e8, transparent: true, opacity: 0.5 }));
        strip.position.set(-0.1, -1.76, -2.57);
        stage.add(strip);

        const modelRoot = new THREE.Group();
        modelRoot.position.set(state.x, -0.18, state.z);
        stage.add(modelRoot);
        const avatarShadow = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), new THREE.MeshBasicMaterial({ color: 0x294866, transparent: true, opacity: 0.18, depthWrite: false }));
        avatarShadow.rotation.x = -Math.PI / 2;
        avatarShadow.scale.set(1.55, 0.7, 1);
        avatarShadow.position.set(state.x, -1.93, state.z + 0.18);
        stage.add(avatarShadow);

        const clock = new THREE.Clock();
        let elapsed = 0;
        const actions = {};
        let currentAction = null;
        const loader = new GLTFLoader();
        const play = (name, loop = true) => {
          if (!mixer || !actions[name]) return;
          const next = actions[name];
          if (currentAction === next) return;
          next.reset();
          next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
          next.clampWhenFinished = !loop;
          next.fadeIn(0.22).play();
          if (currentAction) currentAction.fadeOut(0.22);
          currentAction = next;
        };

        loader.load(MODEL_URL, (gltf) => {
          if (cancelled) return;
          model = gltf.scene;
          model.traverse((node) => { if (node.isMesh) { node.frustumCulled = true; node.castShadow = false; node.receiveShadow = false; } });
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const scale = 3.35 / (size.y || 1);
          model.scale.setScalar(scale);
          model.position.set(-center.x * scale, -center.y * scale - 0.04, -center.z * scale);
          modelRoot.add(model);
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => { actions[clip.name] = mixer.clipAction(clip); });
          const idleName = gltf.animations.find((c) => /idle|stand|breath|casual|relax/i.test(c.name))?.name || gltf.animations[0]?.name;
          if (idleName) play(idleName);
          setLoaded(true);
        }, undefined, (error) => { console.error('GLB avatar failed to load:', error); setFailed(true); });

        const findClip = (regex) => Object.keys(actions).find((name) => regex.test(name));
        const updateMission = () => {
          let nearest = null;
          let distance = Infinity;
          MISSIONS.forEach((mission) => {
            const d = Math.abs(state.x - mission.x);
            if (d < distance) { distance = d; nearest = mission; }
          });
          const candidate = distance < 0.48 ? nearest : null;
          if (candidate?.id !== state.lastMission) {
            state.lastMission = candidate?.id || '';
            setActiveMission(candidate?.id || null);
            if (candidate) setMessage(`${candidate.title} detected · Press E to enter`);
            else setMessage('Move through the workspace to discover each system');
          }
        };

        const interact = () => {
          const mission = MISSIONS.find((item) => item.id === state.lastMission && Math.abs(state.x - item.x) < 0.55);
          if (!mission) return;
          setCompleted((old) => old.includes(mission.id) ? old : [...old, mission.id]);
          setMessage(`${mission.title} unlocked · ${mission.detail}`);
          const special = mission.id === 'projects' ? findClip(/wave|point|talk|typing|think/i) : findClip(/point|wave|think/i);
          if (special) play(special, false);
        };

        const onKeyDown = (event) => {
          if (!gameMode) return;
          const key = event.key.toLowerCase();
          if (['arrowleft','arrowright','a','d','w','s','e',' '].includes(key)) event.preventDefault();
          if (key === 'e' || key === ' ') { interact(); return; }
          keys.add(key);
        };
        const onKeyUp = (event) => keys.delete(event.key.toLowerCase());
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
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
          const left = keys.has('a') || keys.has('arrowleft');
          const right = keys.has('d') || keys.has('arrowright');
          const forward = keys.has('w') || keys.has('arrowup');
          const back = keys.has('s') || keys.has('arrowdown');
          state.moving = gameMode && (left || right || forward || back);
          if (state.moving) {
            const speed = keys.has('shift') ? 3.2 : 1.8;
            if (left) { state.x -= speed * delta; state.direction = -1; }
            if (right) { state.x += speed * delta; state.direction = 1; }
            if (forward) state.z = Math.max(-0.15, state.z - speed * delta * 0.35);
            if (back) state.z = Math.min(0.55, state.z + speed * delta * 0.35);
            state.x = THREE.MathUtils.clamp(state.x, -3.45, 3.45);
            const walk = findClip(/walk|run/i);
            if (walk) play(walk);
          } else {
            const idle = findClip(/idle|stand|breath|casual|relax/i);
            if (idle) play(idle);
          }
          updateMission();
          modelRoot.position.x = THREE.MathUtils.lerp(modelRoot.position.x, state.x, 0.16);
          modelRoot.position.z = THREE.MathUtils.lerp(modelRoot.position.z, state.z, 0.16);
          modelRoot.rotation.y = THREE.MathUtils.lerp(modelRoot.rotation.y, state.moving ? (state.direction < 0 ? Math.PI / 2 : -Math.PI / 2) : 0, 0.12);
          modelRoot.position.y = -0.18 + Math.sin(elapsed * 1.1) * 0.008;
          avatarShadow.position.x = modelRoot.position.x;
          avatarShadow.position.z = modelRoot.position.z + 0.18;
          avatarShadow.scale.x = 1.55 + Math.sin(elapsed * 1.1) * 0.012;
          if (mixer) mixer.update(delta);
          camera.position.x = THREE.MathUtils.lerp(camera.position.x, state.x * 0.05, 0.025);
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.85 - state.z * 0.05, 0.025);
          camera.lookAt(0.35, 0.08, 0);
          renderer.render(scene, camera);
        };
        animate();
        cleanup = () => {
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
          resizeObserver?.disconnect();
          cancelAnimationFrame(raf);
          mixer?.stopAllAction();
          renderer?.dispose();
          if (renderer?.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
      } catch (error) { if (!cancelled) { console.error('3D workspace initialization failed:', error); setFailed(true); } }
    };

    if ('requestIdleCallback' in window) idleTimer = window.requestIdleCallback(start, { timeout: 1800 });
    else idleTimer = window.setTimeout(start, 900);
    return () => { cancelled = true; if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleTimer); else window.clearTimeout(idleTimer); cleanup(); };
  }, [gameMode]);

  const startGame = () => { setGameMode(true); setMessage('MISSION: visit AI LAB, PROJECTS and CLOUD'); };
  const moveTouch = (direction) => {
    const event = new KeyboardEvent('keydown', { key: direction });
    window.dispatchEvent(event);
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: direction })), 180);
  };
  const allDone = completed.length === MISSIONS.length;

  return (
    <div className={`scene-shell ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''} ${gameMode ? 'game-active' : ''}`} aria-label="Interactive 3D developer workspace">
      <div ref={mountRef} className="three-canvas" />
      <div className="workspace-fallback" aria-hidden={loaded}>
        <div className="fallback-window"><i /><i /><i /></div><div className="fallback-shelf"><span /><span /><span /></div>
        <div className="fallback-desk"><div className="fallback-monitor"><b /></div><span /></div><div className="fallback-person" /><div className="fallback-glow" />
      </div>
      {!loaded && !failed && <div className="scene-loading"><span>Building developer world</span></div>}
      {loaded && !gameMode && <div className="game-launch"><span>3D DEVELOPER WORLD</span><strong>Explore the workspace</strong><button onClick={startGame}>ENTER WORLD <b>↗</b></button><small>WASD / ARROWS · E TO INTERACT</small></div>}
      {loaded && gameMode && <>
        <div className="game-hud"><div><span>MISSION 01</span><strong>{allDone ? 'WORLD COMPLETE ✓' : 'Explore the developer world'}</strong></div><div className="mission-dots">{MISSIONS.map((m) => <i key={m.id} className={completed.includes(m.id) ? 'done' : activeMission === m.id ? 'near' : ''} />)}</div><p>{message}</p></div>
        <div className="hotspot-row">{MISSIONS.map((m) => <button key={m.id} className={`${activeMission === m.id ? 'active' : ''} ${completed.includes(m.id) ? 'done' : ''}`} onClick={() => setMessage(`${m.title}: ${m.detail}`)}><span>{completed.includes(m.id) ? '✓' : '0' + (MISSIONS.indexOf(m) + 1)}</span>{m.title}</button>)}</div>
        <div className="game-controls"><button onClick={() => moveTouch('a')}>←</button><button onClick={() => moveTouch('d')}>→</button><button onClick={() => moveTouch('e')}>E</button></div>
        {allDone && <button className="mission-complete" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>MISSION COMPLETE · LET'S BUILD <b>↗</b></button>}
      </>}
      {failed && <div className="scene-error">Workspace preview unavailable</div>}
    </div>
  );
}
