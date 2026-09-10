import { useEffect, useRef, useState } from 'react';
import './workspace-fallback.css';

const MODEL_URL = '/nithish-model.glb';
const MISSIONS = [
  { id: 'ai', title: 'AI LAB', hint: 'Discover the intelligence layer', x: -2.7, z: 0.12, detail: 'LLM · RAG · AGENTS · MCP' },
  { id: 'projects', title: 'COMPUTER', hint: 'Walk to the build console', x: -0.18, z: -0.62, detail: 'PRODUCTS · AUTOMATION · VISION' },
  { id: 'cloud', title: 'CLOUD', hint: 'Reach the delivery node', x: 2.75, z: 0.12, detail: 'AWS · AZURE · DOCKER · CI/CD' },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function PortfolioScene() {
  const mountRef = useRef(null);
  const gameModeRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [activeMission, setActiveMission] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [message, setMessage] = useState('Explore the developer world');

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

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
    const state = {
      x: 0.8,
      z: 0.18,
      vx: 0,
      vz: 0,
      moving: false,
      direction: 1,
      yaw: 0,
      target: null,
      lastMission: '',
    };

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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
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

        const monitorFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 1.05, 0.09),
          new THREE.MeshStandardMaterial({ color: 0x162330, roughness: 0.42, metalness: 0.18 }),
        );
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
        const avatarShadow = new THREE.Mesh(
          new THREE.CircleGeometry(0.95, 32),
          new THREE.MeshBasicMaterial({ color: 0x294866, transparent: true, opacity: 0.18, depthWrite: false }),
        );
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
          if (currentAction === next && loop) return;
          next.reset();
          next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
          next.clampWhenFinished = !loop;
          next.fadeIn(0.2).play();
          if (currentAction && currentAction !== next) currentAction.fadeOut(0.2);
          currentAction = next;
        };

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

            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => { actions[clip.name] = mixer.clipAction(clip); });
            const idleName = gltf.animations.find((clip) => /idle|stand|breath|casual|relax/i.test(clip.name))?.name || gltf.animations[0]?.name;
            if (idleName) play(idleName);
            setLoaded(true);
          },
          undefined,
          (error) => {
            console.error('GLB avatar failed to load:', error);
            setFailed(true);
          },
        );

        const findClip = (regex) => Object.keys(actions).find((name) => regex.test(name));
        const nearestMission = () => {
          let nearest = null;
          let distance = Infinity;
          MISSIONS.forEach((mission) => {
            const dx = state.x - mission.x;
            const dz = state.z - mission.z;
            const d = Math.hypot(dx, dz);
            if (d < distance) {
              distance = d;
              nearest = mission;
            }
          });
          return { mission: distance < 0.58 ? nearest : null, distance };
        };

        const updateMission = () => {
          const { mission } = nearestMission();
          if (mission?.id === state.lastMission) return;
          state.lastMission = mission?.id || '';
          setActiveMission(mission?.id || null);
          if (mission) setMessage(`${mission.title} detected · Press E to enter`);
          else if (!state.target) setMessage('Move through the workspace to discover each system');
        };

        const interact = () => {
          const { mission, distance } = nearestMission();
          if (!mission || distance > 0.62) return;
          state.target = null;
          setCompleted((old) => old.includes(mission.id) ? old : [...old, mission.id]);
          setMessage(`${mission.title} unlocked · ${mission.detail}`);
          const special = mission.id === 'projects'
            ? findClip(/wave|point|talk|typing|think/i)
            : findClip(/point|wave|think/i);
          if (special) play(special, false);
        };

        const travelTo = (mission) => {
          state.target = { x: mission.x, z: mission.z };
          setActiveMission(mission.id);
          setMessage(`Walking to ${mission.title} · E to interact`);
        };

        const onKeyDown = (event) => {
          if (!gameModeRef.current) return;
          const key = event.key.toLowerCase();
          if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's', 'e', ' '].includes(key)) event.preventDefault();
          if (key === 'e' || key === ' ') {
            interact();
            return;
          }
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
          const keyboardX = (right ? 1 : 0) - (left ? 1 : 0);
          const keyboardZ = (back ? 1 : 0) - (forward ? 1 : 0);
          let inputX = keyboardX;
          let inputZ = keyboardZ;

          if (!keyboardX && !keyboardZ && state.target && gameModeRef.current) {
            const dx = state.target.x - state.x;
            const dz = state.target.z - state.z;
            if (Math.hypot(dx, dz) > 0.045) {
              const length = Math.hypot(dx, dz) || 1;
              inputX = dx / length;
              inputZ = dz / length;
            } else {
              state.target = null;
            }
          }

          const inputLength = Math.hypot(inputX, inputZ) || 1;
          if (inputX || inputZ) {
            inputX /= inputLength;
            inputZ /= inputLength;
          }

          state.moving = gameModeRef.current && Boolean(inputX || inputZ);
          const speed = keys.has('shift') ? 3.15 : 1.75;
          const acceleration = state.moving ? 11 : 8;
          const targetVx = inputX * speed;
          const targetVz = inputZ * speed;
          state.vx = THREE.MathUtils.damp(state.vx, targetVx, acceleration, delta);
          state.vz = THREE.MathUtils.damp(state.vz, targetVz, acceleration, delta);

          if (state.moving) {
            state.x = clamp(state.x + state.vx * delta, -3.45, 3.45);
            state.z = clamp(state.z + state.vz * delta, -0.78, 0.62);
            state.direction = state.vx < -0.02 ? -1 : state.vx > 0.02 ? 1 : state.direction;

            // The avatar's rest pose faces the camera (+Z). Use the actual movement vector
            // instead of hard-coded left/right angles so forward movement also turns correctly.
            const movementYaw = Math.atan2(state.vx, state.vz);
            state.yaw = movementYaw;
            const walk = findClip(/walk|run/i);
            if (walk) play(walk);
          } else {
            state.vx = THREE.MathUtils.damp(state.vx, 0, 10, delta);
            state.vz = THREE.MathUtils.damp(state.vz, 0, 10, delta);
            const { mission } = nearestMission();
            if (mission?.id === 'projects' && Math.hypot(state.x - mission.x, state.z - mission.z) < 0.75) {
              // At the computer, turn the character naturally toward the monitor.
              state.yaw = Math.atan2(-1.67 - state.z, -0.18 - state.x);
            }
            const idle = findClip(/idle|stand|breath|casual|relax/i);
            if (idle) play(idle);
          }

          updateMission();
          modelRoot.position.x = THREE.MathUtils.lerp(modelRoot.position.x, state.x, 0.2);
          modelRoot.position.z = THREE.MathUtils.lerp(modelRoot.position.z, state.z, 0.2);
          modelRoot.rotation.y = THREE.MathUtils.lerp(modelRoot.rotation.y, state.yaw, 0.16);
          modelRoot.position.y = -0.18 + Math.sin(elapsed * 1.1) * 0.008;
          avatarShadow.position.x = modelRoot.position.x;
          avatarShadow.position.z = modelRoot.position.z + 0.18;
          avatarShadow.scale.x = 1.55 + Math.sin(elapsed * 1.1) * 0.012;

          if (mixer) mixer.update(delta);

          const cameraTargetX = state.x * 0.13;
          const cameraTargetY = 0.85 - state.z * 0.05;
          camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraTargetX, 1.4, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraTargetY, 1.2, delta);
          camera.lookAt(0.35 + state.x * 0.05, 0.08, -0.05);
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
      } catch (error) {
        if (!cancelled) {
          console.error('3D workspace initialization failed:', error);
          setFailed(true);
        }
      }
    };

    if ('requestIdleCallback' in window) idleTimer = window.requestIdleCallback(start, { timeout: 1800 });
    else idleTimer = window.setTimeout(start, 900);

    return () => {
      cancelled = true;
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleTimer);
      else window.clearTimeout(idleTimer);
      cleanup();
    };
  }, []);

  const startGame = () => {
    gameModeRef.current = true;
    setGameMode(true);
    setMessage('MISSION: visit AI LAB, COMPUTER and CLOUD');
  };

  const moveTouch = (direction) => {
    const event = new KeyboardEvent('keydown', { key: direction });
    window.dispatchEvent(event);
    window.setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: direction })), 180);
  };

  const goToMission = (mission) => {
    if (!gameMode) return;
    const event = new CustomEvent('portfolio-mission', { detail: mission.id });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const onMission = (event) => {
      // The render loop owns the movement state; this event is intentionally kept local to the canvas.
      const id = event.detail;
      setActiveMission(id);
    };
    window.addEventListener('portfolio-mission', onMission);
    return () => window.removeEventListener('portfolio-mission', onMission);
  }, []);

  const allDone = completed.length === MISSIONS.length;

  return (
    <div className={`scene-shell ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''} ${gameMode ? 'game-active' : ''}`} aria-label="Interactive 3D developer workspace">
      <div ref={mountRef} className="three-canvas" />
      <div className="workspace-fallback" aria-hidden={loaded}>
        <div className="fallback-window"><i /><i /><i /></div>
        <div className="fallback-shelf"><span /><span /><span /></div>
        <div className="fallback-desk"><div className="fallback-monitor"><b /></div><span /></div>
        <div className="fallback-person" />
        <div className="fallback-glow" />
      </div>
      {!loaded && !failed && <div className="scene-loading"><span>Building developer world</span></div>}
      {loaded && !gameMode && (
        <div className="game-launch">
          <span>3D DEVELOPER WORLD</span>
          <strong>Explore the workspace</strong>
          <button onClick={startGame}>ENTER WORLD <b>↗</b></button>
          <small>WASD / ARROWS · E TO INTERACT</small>
        </div>
      )}
      {loaded && gameMode && (
        <>
          <div className="game-hud">
            <div><span>MISSION 01</span><strong>{allDone ? 'WORLD COMPLETE ✓' : 'Explore the developer world'}</strong></div>
            <div className="mission-dots">
              {MISSIONS.map((mission) => <i key={mission.id} className={completed.includes(mission.id) ? 'done' : activeMission === mission.id ? 'near' : ''} />)}
            </div>
            <p>{message}</p>
          </div>
          <div className="hotspot-row">
            {MISSIONS.map((mission, index) => (
              <button
                key={mission.id}
                className={`${activeMission === mission.id ? 'active' : ''} ${completed.includes(mission.id) ? 'done' : ''}`}
                onClick={() => goToMission(mission)}
                title={mission.hint}
              >
                <span>{completed.includes(mission.id) ? '✓' : `0${index + 1}`}</span>{mission.title}
              </button>
            ))}
          </div>
          <div className="game-controls">
            <button onClick={() => moveTouch('a')}>←</button>
            <button onClick={() => moveTouch('w')}>↑</button>
            <button onClick={() => moveTouch('s')}>↓</button>
            <button onClick={() => moveTouch('d')}>→</button>
            <button onClick={() => moveTouch('e')}>E</button>
          </div>
          {allDone && <button className="mission-complete" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>MISSION COMPLETE · LET'S BUILD <b>↗</b></button>}
        </>
      )}
      {failed && <div className="scene-error">Workspace preview unavailable</div>}
    </div>
  );
}
