import { useEffect, useRef, useState } from 'react';
import './workspace-fallback.css';

const MODEL_URL = '/nithish-model.glb';
const PROFILE_IMAGE = 'https://raw.githubusercontent.com/Nithishrish23/Nithish-portfolio/98f873233766d9efe6688b559262306092e7545d/static/images/1727781988320.jpg';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function PortfolioScene() {
  const mountRef = useRef(null);
  const fightRef = useRef({ running: false, block: false });
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState('READY');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let cancelled = false;
    let raf = 0;
    let renderer;
    let observer;
    let mixer;
    let model;
    let playerRoot;
    let enemyRoot;
    let playerShadow;
    let enemyShadow;
    let slash;
    let floorGlow;
    let keydownHandler;
    let keyupHandler;
    let restartHandler;
    let baseModelY = 0;

    const start = async () => {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        if (cancelled) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xeaf3ff, 9, 28);
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
        camera.position.set(0, 0.85, 8.6);
        const target = new THREE.Vector3(0, -0.38, -1.0);
        camera.lookAt(target);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1), false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.16;
        renderer.setClearColor(0, 0);
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xf8fbff, 0x30465d, 2.8));
        const key = new THREE.DirectionalLight(0xffffff, 4.5);
        key.position.set(-4, 8, 7);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x2f80ed, 3.6);
        rim.position.set(5, 4, -6);
        scene.add(rim);
        const arenaLight = new THREE.PointLight(0x1769ff, 8, 18, 2);
        arenaLight.position.set(0, 0.5, -0.8);
        scene.add(arenaLight);

        const world = new THREE.Group();
        scene.add(world);
        const material = (color, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });

        const floor = new THREE.Mesh(new THREE.CylinderGeometry(5.25, 5.65, 0.3, 64), material(0x1d3147, 0.82, 0.2));
        floor.position.y = -2.04;
        world.add(floor);
        floorGlow = new THREE.Mesh(new THREE.RingGeometry(2.15, 4.65, 64), new THREE.MeshBasicMaterial({ color: 0x2f80ed, transparent: true, opacity: 0.16, side: THREE.DoubleSide }));
        floorGlow.rotation.x = -Math.PI / 2;
        floorGlow.position.y = -1.88;
        world.add(floorGlow);
        const innerRing = new THREE.Mesh(new THREE.RingGeometry(2.02, 2.08, 64), new THREE.MeshBasicMaterial({ color: 0x5aa2ff, transparent: true, opacity: 0.72, side: THREE.DoubleSide }));
        innerRing.rotation.x = -Math.PI / 2;
        innerRing.position.y = -1.86;
        world.add(innerRing);

        // Keep the arena visually open. Side pylons replace the old front-facing pillars
        // so nothing sits between the camera and the player's avatar.
        [-1, 1].forEach((side) => {
          const pylon = new THREE.Group();
          pylon.position.set(side * 4.65, -0.05, -1.15);
          const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 3.7, 12), material(0x8ea8c0, 0.68, 0.22));
          pylon.add(body);
          const light = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.25, 0.07), new THREE.MeshBasicMaterial({ color: 0x2f80ed }));
          light.position.y = 0.05;
          pylon.add(light);
          world.add(pylon);
        });

        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), new THREE.MeshBasicMaterial({ color: 0xdbe9f6, transparent: true, opacity: 0.58, side: THREE.DoubleSide }));
        backWall.position.set(0, 1.35, -5.5);
        world.add(backWall);
        for (let i = -5; i <= 5; i += 1) {
          const beam = new THREE.Mesh(new THREE.BoxGeometry(0.025, 6, 0.025), new THREE.MeshBasicMaterial({ color: 0x7eb5ec, transparent: true, opacity: 0.2 }));
          beam.position.set(i * 1.55, 1.15, -5.42);
          world.add(beam);
        }

        // Holographic combat rails add depth without blocking the fighter.
        for (let i = 0; i < 3; i += 1) {
          const rail = new THREE.Mesh(new THREE.TorusGeometry(2.55 + i * 0.42, 0.012, 6, 96), new THREE.MeshBasicMaterial({ color: 0x69b3ff, transparent: true, opacity: 0.18 - i * 0.035 }));
          rail.rotation.x = Math.PI / 2;
          rail.position.set(0, -1.55 + i * 0.28, -1.15);
          world.add(rail);
        }

        const makeEnemy = () => {
          const g = new THREE.Group();
          const dark = material(0x101d2b, 0.55, 0.45);
          const blue = material(0x1769ff, 0.38, 0.55);
          const body = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.05, 0.5), dark);
          body.position.y = -0.65;
          g.add(body);
          const chest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.46, 0.55), blue);
          chest.position.set(0, -0.53, 0.03);
          g.add(chest);
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 14), dark);
          head.position.y = 0.1;
          g.add(head);
          const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.07, 0.04), new THREE.MeshBasicMaterial({ color: 0x69b3ff }));
          visor.position.set(0, 0.12, 0.27);
          g.add(visor);
          const arm = (x) => {
            const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.62, 5, 10), dark);
            a.position.set(x, -0.62, 0);
            a.rotation.z = x < 0 ? -0.14 : 0.14;
            return a;
          };
          g.add(arm(-0.55), arm(0.55));
          const leg = (x) => {
            const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.72, 5, 10), dark);
            l.position.set(x, -1.58, 0);
            return l;
          };
          g.add(leg(-0.2), leg(0.2));
          const eyeGlow = new THREE.PointLight(0x1769ff, 2.5, 3);
          eyeGlow.position.set(0, 0.12, 0.45);
          g.add(eyeGlow);
          return g;
        };

        playerRoot = new THREE.Group();
        playerRoot.position.set(-0.85, 0, 0.2);
        world.add(playerRoot);
        enemyRoot = makeEnemy();
        enemyRoot.position.set(0.9, 0, -1.15);
        enemyRoot.rotation.y = 0.12;
        world.add(enemyRoot);

        playerShadow = new THREE.Mesh(new THREE.CircleGeometry(0.72, 32), new THREE.MeshBasicMaterial({ color: 0x071321, transparent: true, opacity: 0.28, depthWrite: false }));
        playerShadow.rotation.x = -Math.PI / 2;
        playerShadow.scale.set(1.4, 0.72, 1);
        playerShadow.position.set(-0.85, -1.86, 0.2);
        world.add(playerShadow);
        enemyShadow = playerShadow.clone();
        enemyShadow.position.set(0.9, -1.86, -1.15);
        enemyShadow.scale.set(1.05, 0.62, 1);
        world.add(enemyShadow);

        slash = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.055, 8, 40, Math.PI * 0.78), new THREE.MeshBasicMaterial({ color: 0x5aa2ff, transparent: true, opacity: 0 }));
        slash.rotation.x = Math.PI / 2;
        slash.position.set(0.1, -0.25, -1.0);
        world.add(slash);

        const loader = new GLTFLoader();
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

          // Fit the real GLB by its measured world-space bounds. Do not rotate bones
          // procedurally; the native rig animation owns the arms, hands and legs.
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const scale = 2.72 / Math.max(size.y, 0.001);
          model.scale.setScalar(scale);
          const scaledBox = new THREE.Box3().setFromObject(model);
          const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
          model.position.x -= scaledCenter.x;
          model.position.z -= scaledCenter.z;
          model.position.y += -scaledBox.min.y - 1.86;
          baseModelY = model.position.y;
          model.rotation.y = 0;
          playerRoot.add(model);

          mixer = new THREE.AnimationMixer(model);
          if (gltf.animations.length) {
            const action = mixer.clipAction(gltf.animations[0]);
            action.setLoop(THREE.LoopRepeat, Infinity).play();
          }
          setLoaded(true);
        }, undefined, (error) => {
          console.error('GLB avatar failed to load:', error);
          setFailed(true);
        });

        const state = { time: 0, playerHp: 100, enemyHp: 100, combo: 0, action: null, actionUntil: 0, block: false, enemyAttackAt: 2.1, enemyHitUntil: 0, enemyHit: false, playerHitUntil: 0, playerHit: false, round: 1, messageUntil: 0, message: 'READY', shake: 0 };
        const showMessage = (text, duration = 0.55) => { state.message = text; state.messageUntil = state.time + duration; setMessage(text); };

        const attack = (type = 'light') => {
          if (state.playerHp <= 0 || state.enemyHp <= 0 || state.action || state.time < state.actionUntil) return;
          state.action = type;
          state.actionUntil = state.time + (type === 'heavy' ? 0.58 : 0.38);
          state.block = false;
          fightRef.current.block = false;
          state.shake = type === 'heavy' ? 0.14 : 0.08;
          playerRoot.position.z = type === 'heavy' ? -0.28 : -0.18;
          slash.position.x = 0.05;
          slash.material.opacity = 0.85;
          slash.scale.setScalar(type === 'heavy' ? 1.28 : 1);
          slash.rotation.z = type === 'heavy' ? -0.6 : 0.2;
          const hit = Math.random() > (type === 'heavy' ? 0.08 : 0.16);
          if (hit) {
            const damage = type === 'heavy' ? 18 : 9;
            state.enemyHp = clamp(state.enemyHp - damage, 0, 100);
            state.combo += 1;
            state.enemyHit = true;
            state.enemyHitUntil = state.time + 0.18;
            state.shake += 0.09;
            setEnemyHealth(state.enemyHp);
            setCombo(state.combo);
            showMessage(type === 'heavy' ? 'POWER HIT' : 'HIT');
          } else {
            state.combo = 0;
            setCombo(0);
            showMessage('MISS');
          }
        };

        const block = (active) => {
          state.block = active;
          fightRef.current.block = active;
          if (active) showMessage('GUARD', 0.2);
        };

        const dash = () => {
          if (state.playerHp <= 0 || state.enemyHp <= 0 || state.action) return;
          state.action = 'dash';
          state.actionUntil = state.time + 0.28;
          playerRoot.position.z = -0.52;
          state.shake = 0.04;
          showMessage('DASH', 0.25);
        };

        const restart = () => {
          state.playerHp = 100;
          state.enemyHp = 100;
          state.combo = 0;
          state.action = null;
          state.actionUntil = 0;
          state.block = false;
          state.enemyAttackAt = state.time + 1.8;
          state.enemyHit = false;
          state.playerHit = false;
          state.round += 1;
          state.shake = 0;
          playerRoot.position.set(-0.85, 0, 0.2);
          enemyRoot.position.set(0.9, 0, -1.15);
          enemyRoot.rotation.z = 0;
          setPlayerHealth(100);
          setEnemyHealth(100);
          setCombo(0);
          setRound(state.round);
          setGameOver(false);
          fightRef.current.running = true;
          showMessage('ROUND ' + state.round, 0.9);
        };

        keydownHandler = (event) => {
          const k = event.key.toLowerCase();
          if ([' ', 'j', 'k', 'l', 'shift', 'arrowdown'].includes(k)) event.preventDefault();
          if (k === 'j' || k === ' ') attack('light');
          else if (k === 'k') attack('heavy');
          else if (k === 'l' || k === 'shift') dash();
          else if (k === 'arrowdown') block(true);
          else if (k === 'r' && (state.playerHp <= 0 || state.enemyHp <= 0)) restart();
        };
        keyupHandler = (event) => { if (event.key.toLowerCase() === 'arrowdown') block(false); };
        restartHandler = restart;
        window.addEventListener('keydown', keydownHandler);
        window.addEventListener('keyup', keyupHandler);
        window.addEventListener('fight-restart', restartHandler);

        const resize = () => {
          const width = Math.max(mount.clientWidth, 1);
          const height = Math.max(mount.clientHeight, 1);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };
        observer = new ResizeObserver(resize);
        observer.observe(mount);
        resize();

        const clock = new THREE.Clock();
        const animate = () => {
          if (cancelled) return;
          raf = requestAnimationFrame(animate);
          const dt = Math.min(clock.getDelta(), 0.033);
          state.time += dt;
          if (mixer) mixer.update(dt);
          if (state.action && state.time >= state.actionUntil) state.action = null;

          const playerTargetZ = state.action === 'dash' ? -0.52 : state.action ? -0.18 : 0.2;
          playerRoot.position.z = THREE.MathUtils.damp(playerRoot.position.z, playerTargetZ, state.action ? 18 : 10, dt);
          if (model) model.position.y = baseModelY + Math.sin(state.time * 2.1) * 0.008;

          if (state.enemyHp > 0 && state.playerHp > 0 && state.time >= state.enemyAttackAt) {
            state.enemyAttackAt = state.time + 2 + Math.random() * 1.3;
            if (!state.block && Math.random() > 0.2) {
              const damage = 7 + Math.floor(Math.random() * 5);
              state.playerHp = clamp(state.playerHp - damage, 0, 100);
              state.playerHit = true;
              state.playerHitUntil = state.time + 0.18;
              state.shake = 0.12;
              setPlayerHealth(state.playerHp);
              showMessage('RIVAL HIT');
            } else if (state.block) {
              showMessage('BLOCKED');
              state.shake = 0.03;
            }
          }

          if (state.enemyHit && state.time >= state.enemyHitUntil) state.enemyHit = false;
          if (state.playerHit && state.time >= state.playerHitUntil) state.playerHit = false;
          enemyRoot.position.x = THREE.MathUtils.damp(enemyRoot.position.x, 0.9 + Math.sin(state.time * 0.8) * 0.24, 3, dt);
          enemyRoot.position.y = state.enemyHit ? 0.08 : 0;
          enemyRoot.rotation.y = 0.12 + Math.sin(state.time * 0.8) * 0.06;
          enemyRoot.rotation.z = THREE.MathUtils.damp(enemyRoot.rotation.z, state.enemyHp <= 0 ? -1.15 : 0, 5, dt);
          slash.material.opacity = THREE.MathUtils.damp(slash.material.opacity, 0, 12, dt);
          floorGlow.material.opacity = 0.13 + Math.sin(state.time * 2) * 0.035;
          state.shake = Math.max(0, state.shake - dt * 0.7);
          camera.position.x = THREE.MathUtils.damp(camera.position.x, state.shake ? (Math.random() - 0.5) * state.shake : 0, 14, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.85, 14, dt);
          camera.lookAt(target);

          if (state.enemyHp <= 0 || state.playerHp <= 0) {
            fightRef.current.running = false;
            setGameOver(true);
            if (state.enemyHp <= 0) setMessage('K.O.');
            else setMessage('DEFEATED');
          }
          renderer.render(scene, camera);
        };

        fightRef.current.running = true;
        animate();
      } catch (error) {
        console.error('3D fighting arena failed:', error);
        setFailed(true);
      }
    };

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
      if (keydownHandler) window.removeEventListener('keydown', keydownHandler);
      if (keyupHandler) window.removeEventListener('keyup', keyupHandler);
      if (restartHandler) window.removeEventListener('fight-restart', restartHandler);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const press = (action) => {
    if (action === 'light') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
    if (action === 'heavy') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    if (action === 'dash') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }));
    if (action === 'block') {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' })), 300);
    }
  };

  return (
    <div className="scene-shell fight-shell">
      <div ref={mountRef} className="three-canvas" />
      <div className="fight-vignette" />
      <div className="fight-topbar">
        <div className="fighter-card player-card">
          <div className="player-identity">
            <img className="player-photo" src={PROFILE_IMAGE} alt="Nithish Kumar" />
            <div className="player-copy">
              <div className="fighter-label">PLAYER 01 · YOU</div>
              <strong>NITHISH KUMAR</strong>
              <small>AI ENGINEER · FULL STACK</small>
            </div>
          </div>
          <div className="health-track"><span style={{ width: `${playerHealth}%` }} /></div>
          <small className="hp-value">{Math.max(0, Math.round(playerHealth))} HP</small>
        </div>
        <div className="fight-round"><span>ROUND</span><strong>{String(round).padStart(2, '0')}</strong><small>AI COMBAT LAB</small></div>
        <div className="fighter-card enemy-card"><div className="fighter-label">OPPONENT</div><strong>ARENA BOT</strong><div className="health-track enemy-track"><span style={{ width: `${enemyHealth}%` }} /></div><small>{Math.max(0, Math.round(enemyHealth))} HP</small></div>
      </div>
      <div className="fight-status"><span>COMBAT SYSTEM</span><strong>{message}</strong>{combo > 1 && <em>{combo} HIT COMBO</em>}</div>
      <div className="fight-controls"><button onClick={() => press('light')}><b>J</b><span>PUNCH</span></button><button onClick={() => press('heavy')}><b>K</b><span>POWER</span></button><button onClick={() => press('dash')}><b>L</b><span>DASH</span></button><button onClick={() => press('block')}><b>↓</b><span>GUARD</span></button></div>
      <div className="fight-help">J / SPACE · PUNCH &nbsp;&nbsp; K · POWER &nbsp;&nbsp; L / SHIFT · DASH &nbsp;&nbsp; ↓ · GUARD</div>
      {gameOver && <div className="fight-gameover"><span>{enemyHealth <= 0 ? 'VICTORY' : 'DEFEATED'}</span><strong>{enemyHealth <= 0 ? 'K.O.' : 'FIGHT OVER'}</strong><small>{enemyHealth <= 0 ? 'ARENA CLEARED' : 'RESET THE ROUND AND FIGHT AGAIN'}</small><button onClick={() => window.dispatchEvent(new CustomEvent('fight-restart'))}>REMATCH <span>↗</span></button></div>}
      {!loaded && !failed && <div className="scene-loading"><span /> FITTING 3D FIGHTER</div>}
      {failed && <div className="scene-error">3D fighter could not load.</div>}
    </div>
  );
}
