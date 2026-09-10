import { useEffect, useRef, useState } from 'react';
import './workspace-fallback.css';

const MODEL_URL = '/nithish-model.glb';
const LANES = [-1.18, 0, 1.18];
const TRACK_LENGTH = 18;
const TRACK_SEGMENTS = 10;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function PortfolioScene() {
  const mountRef = useRef(null);
  const runnerRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    runnerRef.current = running;
  }, [running]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let cancelled = false;
    let raf = 0;
    let idleTimer = 0;
    let renderer = null;
    let resizeObserver = null;
    let mixer = null;
    let cleanup = () => {};
    let modelRoot = null;
    let model = null;
    const keys = new Set();

    const state = {
      lane: 1,
      targetLane: 1,
      jumpY: 0,
      jumpVelocity: 0,
      sliding: false,
      speed: 8.2,
      distance: 0,
      score: 0,
      coins: 0,
      alive: true,
      shake: 0,
    };

    const start = async () => {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        if (cancelled) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xeaf3ff, 9, 30);

        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
        camera.position.set(0, 1.25, 6.8);
        camera.lookAt(0, -0.45, -4);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
        renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1), false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xf5f9ff, 0x6c7890, 2.5));
        const sun = new THREE.DirectionalLight(0xffffff, 3.4);
        sun.position.set(-5, 9, 6);
        scene.add(sun);
        const blueLight = new THREE.PointLight(0x2f80ed, 9, 18, 2);
        blueLight.position.set(0, 2, 2);
        scene.add(blueLight);

        const mat = (color, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
        const world = new THREE.Group();
        scene.add(world);

        // Endless three-lane runner track.
        const trackPieces = [];
        for (let i = 0; i < TRACK_SEGMENTS; i += 1) {
          const piece = new THREE.Group();
          piece.position.z = -i * TRACK_LENGTH;

          const road = new THREE.Mesh(new THREE.BoxGeometry(4.35, 0.22, TRACK_LENGTH), mat(0x23364a, 0.88));
          road.position.y = -1.92;
          piece.add(road);

          const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, TRACK_LENGTH), mat(0x1769ff, 0.5, 0.2));
          shoulderL.position.set(-2.25, -1.82, 0);
          piece.add(shoulderL);
          const shoulderR = shoulderL.clone();
          shoulderR.position.x = 2.25;
          piece.add(shoulderR);

          [-0.59, 0.59].forEach((x) => {
            const line = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, TRACK_LENGTH), new THREE.MeshBasicMaterial({ color: 0x9cc8ff, transparent: true, opacity: 0.32 }));
            line.position.set(x, -1.79, 0);
            piece.add(line);
          });

          // Neon edge markers create a strong endless-runner rhythm.
          for (let z = -TRACK_LENGTH / 2 + 1; z < TRACK_LENGTH / 2; z += 2.2) {
            [-2.42, 2.42].forEach((x) => {
              const marker = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.38), new THREE.MeshBasicMaterial({ color: 0x5aa2ff }));
              marker.position.set(x, -1.7, z);
              piece.add(marker);
            });
          }
          world.add(piece);
          trackPieces.push(piece);
        }

        // Background towers and glowing data columns are recycled with the road.
        const scenery = [];
        for (let i = 0; i < 18; i += 1) {
          const group = new THREE.Group();
          group.position.set(i % 2 ? 4.4 : -4.4, -1.72, -i * 10 - 5);
          const h = 1.5 + (i % 5) * 0.55;
          const tower = new THREE.Mesh(new THREE.BoxGeometry(0.8 + (i % 3) * 0.25, h, 0.8), mat(i % 2 ? 0xc9d8e8 : 0xaec6df, 0.92));
          tower.position.y = h / 2 - 0.12;
          group.add(tower);
          for (let row = 0; row < 4; row += 1) {
            const glow = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.045, 0.03), new THREE.MeshBasicMaterial({ color: row % 2 ? 0x4b94e8 : 0x72b7ff, transparent: true, opacity: 0.65 }));
            glow.position.set(0, 0.25 + row * 0.3, 0.42);
            group.add(glow);
          }
          world.add(group);
          scenery.push(group);
        }

        // Reusable obstacles and coins. Their z positions are randomized whenever recycled.
        const obstacles = [];
        const coinsObjects = [];
        const randomLane = () => Math.floor(Math.random() * 3);
        const obstacleMat = mat(0x13283b, 0.5, 0.35);
        const obstacleAccent = new THREE.MeshBasicMaterial({ color: 0x4b94e8 });
        const createObstacle = () => {
          const group = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.15, 0.72), obstacleMat);
          body.position.y = -1.25;
          group.add(body);
          const light = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.055, 0.04), obstacleAccent);
          light.position.set(0, -1.03, 0.37);
          group.add(light);
          const cap = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 0.8), new THREE.MeshBasicMaterial({ color: 0x1769ff, transparent: true, opacity: 0.75 }));
          cap.position.y = -0.7;
          group.add(cap);
          return group;
        };
        const createCoin = () => {
          const group = new THREE.Group();
          const coin = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.055, 10, 22), new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xa96a00, emissiveIntensity: 0.35, metalness: 0.7, roughness: 0.25 }));
          coin.rotation.y = Math.PI / 2;
          group.add(coin);
          const glow = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.1 }));
          group.add(glow);
          return group;
        };

        for (let i = 0; i < 13; i += 1) {
          const obstacle = createObstacle();
          obstacle.position.set(LANES[randomLane()], -0.02, -18 - i * 15 - Math.random() * 8);
          world.add(obstacle);
          obstacles.push({ object: obstacle, lane: 1, active: true });
        }
        for (let i = 0; i < 22; i += 1) {
          const coin = createCoin();
          coin.position.set(LANES[randomLane()], 0.2, -10 - i * 8 - Math.random() * 5);
          world.add(coin);
          coinsObjects.push({ object: coin, lane: 1, collected: false });
        }

        // Character is kept in the foreground, centered and lit so it never disappears into the set.
        modelRoot = new THREE.Group();
        modelRoot.position.set(0, -0.05, 0.55);
        world.add(modelRoot);
        const avatarShadow = new THREE.Mesh(new THREE.CircleGeometry(0.82, 28), new THREE.MeshBasicMaterial({ color: 0x061321, transparent: true, opacity: 0.24, depthWrite: false }));
        avatarShadow.rotation.x = -Math.PI / 2;
        avatarShadow.scale.set(1.35, 0.62, 1);
        avatarShadow.position.set(0, -1.91, 0.55);
        world.add(avatarShadow);

        const loader = new GLTFLoader();
        const actions = {};
        let currentAction = null;
        const play = (name, loop = true) => {
          if (!mixer || !actions[name]) return;
          const next = actions[name];
          if (currentAction === next && loop) return;
          next.reset();
          next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
          next.clampWhenFinished = !loop;
          next.fadeIn(0.18).play();
          if (currentAction && currentAction !== next) currentAction.fadeOut(0.18);
          currentAction = next;
        };

        loader.load(MODEL_URL, (gltf) => {
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
          const scale = 2.95 / (size.y || 1);
          model.scale.setScalar(scale);
          model.position.set(-center.x * scale, -center.y * scale - 0.04, -center.z * scale);
          // GLB rest pose is oriented toward +Z; runner travels toward -Z.
          model.rotation.y = Math.PI;
          modelRoot.add(model);
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => { actions[clip.name] = mixer.clipAction(clip); });
          const runName = gltf.animations.find((clip) => /run|jog|walk/i.test(clip.name))?.name;
          const idleName = gltf.animations.find((clip) => /idle|stand|breath|casual|relax/i.test(clip.name))?.name;
          if (runName) play(runName);
          else if (idleName) play(idleName);
          setLoaded(true);
          setRunning(true);
          runnerRef.current = true;
        }, undefined, (error) => {
          console.error('GLB avatar failed to load:', error);
          setFailed(true);
        });

        const resetObject = (entry, farthest, spacing) => {
          entry.object.position.z = farthest - spacing * (0.65 + Math.random() * 1.2);
          entry.lane = randomLane();
          entry.object.position.x = LANES[entry.lane];
          if ('collected' in entry) entry.collected = false;
          entry.object.visible = true;
        };

        const nearestBehind = (entries) => Math.max(...entries.map((entry) => entry.object.position.z));
        const laneChanged = () => {
          if (keys.has('arrowleft') || keys.has('a')) {
            state.targetLane = clamp(state.targetLane - 1, 0, 2);
            keys.delete('arrowleft'); keys.delete('a');
          }
          if (keys.has('arrowright') || keys.has('d')) {
            state.targetLane = clamp(state.targetLane + 1, 0, 2);
            keys.delete('arrowright'); keys.delete('d');
          }
        };
        const jump = () => {
          if (state.jumpY <= 0.01 && state.alive) {
            state.jumpVelocity = 6.2;
            state.sliding = false;
          }
        };
        const slide = () => {
          if (state.jumpY < 0.08 && state.alive) state.sliding = true;
          window.setTimeout(() => { state.sliding = false; }, 520);
        };

        const onKeyDown = (event) => {
          const key = event.key.toLowerCase();
          if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's', ' '].includes(key)) event.preventDefault();
          if (!runnerRef.current) return;
          if (!state.alive && (key === 'r' || key === 'enter')) {
            window.dispatchEvent(new CustomEvent('runner-restart'));
            return;
          }
          if (key === 'arrowleft' || key === 'a' || key === 'arrowright' || key === 'd') keys.add(key);
          if (key === 'arrowup' || key === 'w' || key === ' ') jump();
          if (key === 'arrowdown' || key === 's') slide();
        };
        const onKeyUp = (event) => keys.delete(event.key.toLowerCase());
        const onRestart = () => {
          state.lane = 1; state.targetLane = 1; state.jumpY = 0; state.jumpVelocity = 0; state.sliding = false; state.distance = 0; state.score = 0; state.coins = 0; state.alive = true; state.shake = 0;
          obstacles.forEach((entry, i) => { entry.object.position.z = -18 - i * 15 - Math.random() * 8; entry.lane = randomLane(); entry.object.position.x = LANES[entry.lane]; entry.active = true; });
          coinsObjects.forEach((entry, i) => { entry.object.position.z = -10 - i * 8 - Math.random() * 5; entry.lane = randomLane(); entry.object.position.x = LANES[entry.lane]; entry.collected = false; entry.object.visible = true; });
          setScore(0); setCoins(0); setGameOver(false); runnerRef.current = true; setRunning(true);
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('runner-restart', onRestart);

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
          const delta = Math.min(new THREE.Clock().getDelta(), 0.033);
          // Use a fixed practical delta when the browser creates a new clock above.
          const dt = Math.min(0.022, delta || 0.016);
          const active = runnerRef.current && state.alive;

          laneChanged();
          state.lane = THREE.MathUtils.damp(state.lane, state.targetLane, 14, dt);
          const targetX = LANES[Math.round(state.targetLane)];
          modelRoot.position.x = THREE.MathUtils.damp(modelRoot.position.x, targetX, 13, dt);

          if (active) {
            state.speed = Math.min(15.5, state.speed + dt * 0.12);
            state.distance += state.speed * dt;
            state.score += state.speed * dt * 2.2;
            state.jumpVelocity -= 17 * dt;
            state.jumpY = Math.max(0, state.jumpY + state.jumpVelocity * dt);
            if (state.jumpY === 0) state.jumpVelocity = 0;

            const worldAdvance = state.speed * dt;
            trackPieces.forEach((piece) => {
              piece.position.z += worldAdvance;
              if (piece.position.z > TRACK_LENGTH) piece.position.z -= TRACK_LENGTH * TRACK_SEGMENTS;
            });
            scenery.forEach((item) => {
              item.position.z += worldAdvance * 0.92;
              if (item.position.z > 7) item.position.z -= 180;
            });
            obstacles.forEach((entry) => {
              entry.object.position.z += worldAdvance;
              if (entry.object.position.z > 6) resetObject(entry, nearestBehind(obstacles), 15);
              const dz = Math.abs(entry.object.position.z - 0.55);
              const dx = Math.abs(entry.object.position.x - modelRoot.position.x);
              if (dz < 0.62 && dx < 0.38 && state.jumpY < 0.68 && !state.sliding) {
                state.alive = false;
                state.shake = 0.24;
                setGameOver(true);
                setRunning(false);
                runnerRef.current = false;
              }
            });
            coinsObjects.forEach((entry) => {
              entry.object.position.z += worldAdvance;
              entry.object.rotation.y += dt * 6;
              entry.object.rotation.z = Math.sin(state.distance * 0.18) * 0.08;
              if (entry.object.position.z > 6) resetObject(entry, nearestBehind(coinsObjects), 8);
              const dz = Math.abs(entry.object.position.z - 0.55);
              const dx = Math.abs(entry.object.position.x - modelRoot.position.x);
              if (!entry.collected && dz < 0.62 && dx < 0.4 && Math.abs(state.jumpY - 0.18) < 0.85) {
                entry.collected = true;
                entry.object.visible = false;
                state.coins += 1;
              }
            });
          }

          modelRoot.position.y = -0.05 + state.jumpY;
          if (model) {
            const targetScaleY = state.sliding ? 0.72 : 1;
            model.scale.y = THREE.MathUtils.damp(model.scale.y, (2.95 / ((new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3()).y / Math.max(model.scale.y, 0.01)) || 1)) * targetScaleY, 8, dt);
            model.position.y = THREE.MathUtils.damp(model.position.y, -0.04 + (state.sliding ? -0.28 : 0), 10, dt);
          }
          avatarShadow.scale.x = THREE.MathUtils.damp(avatarShadow.scale.x, 1.35 + state.jumpY * 0.18, 8, dt);
          avatarShadow.position.x = modelRoot.position.x;
          avatarShadow.position.y = -1.91;
          avatarShadow.material.opacity = 0.24 - Math.min(state.jumpY * 0.07, 0.14);

          if (mixer) {
            const runName = Object.keys(actions).find((name) => /run|jog|walk/i.test(name));
            const idleName = Object.keys(actions).find((name) => /idle|stand|breath|casual|relax/i.test(name));
            if (state.alive && runName) play(runName);
            else if (!state.alive && idleName) play(idleName);
            mixer.update(dt);
          }

          state.shake = Math.max(0, state.shake - dt);
          const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;
          camera.position.x = THREE.MathUtils.damp(camera.position.x, modelRoot.position.x * 0.18 + shakeX, 5.5, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.22 + state.jumpY * 0.12, 5.5, dt);
          camera.lookAt(modelRoot.position.x * 0.08, -0.48 + state.jumpY * 0.04, -4.1);
          renderer.render(scene, camera);

          if (active && Math.floor(state.score) % 12 === 0) {
            setScore(Math.floor(state.score));
            setCoins(state.coins);
          }
        };
        animate();

        cleanup = () => {
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
          window.removeEventListener('runner-restart', onRestart);
          resizeObserver?.disconnect();
          cancelAnimationFrame(raf);
          mixer?.stopAllAction();
          renderer?.dispose();
          if (renderer?.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
      } catch (error) {
        console.error('3D runner initialization failed:', error);
        if (!cancelled) setFailed(true);
      }
    };

    if ('requestIdleCallback' in window) idleTimer = window.requestIdleCallback(start, { timeout: 1200 });
    else idleTimer = window.setTimeout(start, 500);

    return () => {
      cancelled = true;
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleTimer);
      else window.clearTimeout(idleTimer);
      cleanup();
    };
  }, []);

  const mobileAction = (action) => {
    if (action === 'left' || action === 'right') {
      const key = action === 'left' ? 'a' : 'd';
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
      window.setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key })), 80);
    } else if (action === 'jump') {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    } else if (action === 'slide') {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
    }
  };

  const restart = () => window.dispatchEvent(new CustomEvent('runner-restart'));

  return (
    <div className={`scene-shell runner-shell ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''}`} aria-label="Infinite 3D developer runner">
      <div ref={mountRef} className="three-canvas" />
      <div className="workspace-fallback" aria-hidden={loaded}>
        <div className="fallback-window"><i /><i /><i /></div>
        <div className="fallback-shelf"><span /><span /><span /></div>
        <div className="fallback-desk"><div className="fallback-monitor"><b /></div><span /></div>
        <div className="fallback-person" />
        <div className="fallback-glow" />
      </div>
      {!loaded && !failed && <div className="scene-loading"><span>Loading Nithish Run</span></div>}
      {loaded && !gameOver && (
        <div className="runner-hud">
          <div><span>NITHISH RUN</span><strong>BUILD · SHIP · REPEAT</strong></div>
          <div className="runner-stats"><b>{score.toLocaleString()}</b><small>SCORE</small><b>{coins}</b><small>COINS</small></div>
          <p>← → change lane · SPACE / ↑ jump · ↓ slide</p>
        </div>
      )}
      {loaded && gameOver && (
        <div className="runner-gameover">
          <span>RUN INTERRUPTED</span>
          <strong>{score.toLocaleString()}</strong>
          <small>SCORE · {coins} COINS</small>
          <button onClick={restart}>RUN AGAIN ↗</button>
        </div>
      )}
      {loaded && <div className="runner-mobile-controls">
        <button onClick={() => mobileAction('left')}>←</button>
        <button onClick={() => mobileAction('jump')}>↑</button>
        <button onClick={() => mobileAction('slide')}>↓</button>
        <button onClick={() => mobileAction('right')}>→</button>
      </div>}
      {failed && <div className="scene-error">3D runner unavailable</div>}
    </div>
  );
}
