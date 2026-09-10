import { useEffect, useRef, useState } from 'react';
import './workspace-fallback.css';

const MODEL_URL = '/nithish-model.glb';
const LANES = [-1.18, 0, 1.18];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function PortfolioScene() {
  const mountRef = useRef(null), runnerRef = useRef(false);
  const [loaded, setLoaded] = useState(false), [failed, setFailed] = useState(false);
  const [running, setRunning] = useState(false), [score, setScore] = useState(0), [coins, setCoins] = useState(0), [gameOver, setGameOver] = useState(false);
  useEffect(() => { runnerRef.current = running; }, [running]);

  useEffect(() => {
    const mount = mountRef.current; if (!mount) return undefined;
    let cancelled = false, raf = 0, idle = 0, renderer, observer, mixer, model, root, rig, baseScale = 1;
    const keys = new Set(), actions = {};
    const s = { lane: 1, y: 0, vy: 0, slide: false, speed: 8.2, distance: 0, score: 0, coins: 0, alive: true, time: 0, shake: 0 };

    const start = async () => {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        if (cancelled) return;
        const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xeaf3ff, 9, 32);
        const camera = new THREE.PerspectiveCamera(42, 1, .1, 80); camera.position.set(0, 1.05, 7.6);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.35)); renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1), false);
        renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.setClearColor(0, 0); mount.appendChild(renderer.domElement);
        scene.add(new THREE.HemisphereLight(0xf5f9ff, 0x65778b, 2.5));
        const sun = new THREE.DirectionalLight(0xffffff, 3.5); sun.position.set(-5, 9, 6); scene.add(sun);
        const blue = new THREE.PointLight(0x2f80ed, 8, 18, 2); blue.position.set(0, 2, 2); scene.add(blue);
        const world = new THREE.Group(); scene.add(world);
        const mat = (c, r=.8, m=0) => new THREE.MeshStandardMaterial({ color:c, roughness:r, metalness:m });

        const tracks = [];
        for (let i=0;i<10;i++) {
          const g = new THREE.Group(); g.position.z = -i*18;
          const road = new THREE.Mesh(new THREE.BoxGeometry(4.35,.22,18), mat(0x23364a,.88)); road.position.y=-1.92; g.add(road);
          [-2.25,2.25].forEach(x => { const e=new THREE.Mesh(new THREE.BoxGeometry(.22,.18,18),mat(0x1769ff,.5,.2)); e.position.set(x,-1.82,0); g.add(e); });
          [-.59,.59].forEach(x => { const l=new THREE.Mesh(new THREE.BoxGeometry(.035,.025,18),new THREE.MeshBasicMaterial({color:0x9cc8ff,transparent:true,opacity:.32})); l.position.set(x,-1.79,0); g.add(l); });
          for(let z=-8;z<9;z+=2.2) [-2.42,2.42].forEach(x=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.06,.09,.38),new THREE.MeshBasicMaterial({color:0x5aa2ff}));m.position.set(x,-1.7,z);g.add(m);});
          world.add(g); tracks.push(g);
        }

        const scenery=[];
        for(let i=0;i<18;i++){
          const g=new THREE.Group(); g.position.set(i%2?4.4:-4.4,-1.72,-i*10-5); const h=1.5+(i%5)*.55;
          const t=new THREE.Mesh(new THREE.BoxGeometry(.8+(i%3)*.25,h,.8),mat(i%2?0xc9d8e8:0xaec6df,.92)); t.position.y=h/2-.12; g.add(t);
          for(let r=0;r<4;r++){const b=new THREE.Mesh(new THREE.BoxGeometry(.52,.045,.03),new THREE.MeshBasicMaterial({color:r%2?0x4b94e8:0x72b7ff,transparent:true,opacity:.65}));b.position.set(0,.25+r*.3,.42);g.add(b);} world.add(g);scenery.push(g);
        }

        const obstacles=[], coinObjects=[], randLane=()=>Math.floor(Math.random()*3);
        const makeObstacle=()=>{const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.82,1.15,.72),mat(0x13283b,.5,.35));b.position.y=-1.25;g.add(b);const a=new THREE.Mesh(new THREE.BoxGeometry(.58,.055,.04),new THREE.MeshBasicMaterial({color:0x4b94e8}));a.position.set(0,-1.03,.37);g.add(a);const c=new THREE.Mesh(new THREE.BoxGeometry(.55,.07,.8),new THREE.MeshBasicMaterial({color:0x1769ff,transparent:true,opacity:.75}));c.position.y=-.7;g.add(c);return g;};
        const makeCoin=()=>{const g=new THREE.Group();const c=new THREE.Mesh(new THREE.TorusGeometry(.16,.055,10,22),new THREE.MeshStandardMaterial({color:0xffd166,emissive:0xa96a00,emissiveIntensity:.35,metalness:.7,roughness:.25}));c.rotation.y=Math.PI/2;g.add(c);g.add(new THREE.Mesh(new THREE.SphereGeometry(.25,10,8),new THREE.MeshBasicMaterial({color:0xffd166,transparent:true,opacity:.1})));return g;};
        for(let i=0;i<13;i++){const o=makeObstacle();o.position.set(LANES[randLane()],-.02,-18-i*15-Math.random()*8);world.add(o);obstacles.push({object:o});}
        for(let i=0;i<22;i++){const c=makeCoin();c.position.set(LANES[randLane()],.2,-10-i*8-Math.random()*5);world.add(c);coinObjects.push({object:c,collected:false});}

        root=new THREE.Group();root.position.set(0,-.05,.55);world.add(root);
        const shadow=new THREE.Mesh(new THREE.CircleGeometry(.82,28),new THREE.MeshBasicMaterial({color:0x061321,transparent:true,opacity:.24,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.set(1.35,.62,1);shadow.position.set(0,-1.91,.55);world.add(shadow);

        const findBone = patterns => { const found=[]; model?.traverse(n=>{if(n.isBone)found.push(n);}); return found.find(b=>patterns.some(p=>p.test(b.name)))||null; };
        const makeRig = () => {
          const r={pelvis:findBone([/hips/i,/pelvis/i]),spine:findBone([/spine1/i,/spine/i]),head:findBone([/head/i]),
            la:findBone([/left.*upper.?arm/i,/leftarm/i,/mixamorig.*leftarm/i,/l.*upperarm/i]),ra:findBone([/right.*upper.?arm/i,/rightarm/i,/mixamorig.*rightarm/i,/r.*upperarm/i]),
            lfa:findBone([/left.*forearm/i,/left.*lower.?arm/i,/leftforearm/i,/mixamorig.*leftforearm/i]),rfa:findBone([/right.*forearm/i,/right.*lower.?arm/i,/rightforearm/i,/mixamorig.*rightforearm/i]),
            lt:findBone([/left.*thigh/i,/left.*upleg/i,/left.*upper.?leg/i,/mixamorig.*leftupleg/i]),rt:findBone([/right.*thigh/i,/right.*upleg/i,/right.*upper.?leg/i,/mixamorig.*rightupleg/i]),
            ls:findBone([/left.*calf/i,/left.*shin/i,/left.*lower.?leg/i,/mixamorig.*leftleg/i]),rs:findBone([/right.*calf/i,/right.*shin/i,/right.*lower.?leg/i,/mixamorig.*rightleg/i]),
            lf:findBone([/left.*foot/i,/left.*ankle/i,/mixamorig.*leftfoot/i]),rf:findBone([/right.*foot/i,/right.*ankle/i,/mixamorig.*rightfoot/i])};
          Object.values(r).forEach(b=>{if(b)b.userData.runnerRest={x:b.rotation.x,y:b.rotation.y,z:b.rotation.z};}); return r;
        };
        const procedural = (t,dt) => {
          if(!rig)return; const q=Math.sin(t*11.5), o=-q, set=(b,x=0,y=0,z=0,k=18)=>{if(!b?.userData.runnerRest)return;const a=b.userData.runnerRest;b.rotation.x=THREE.MathUtils.damp(b.rotation.x,a.x+x,k,dt);b.rotation.y=THREE.MathUtils.damp(b.rotation.y,a.y+y,k,dt);b.rotation.z=THREE.MathUtils.damp(b.rotation.z,a.z+z,k,dt);};
          set(rig.pelvis,.02*q,0,.025*q,11);set(rig.spine,.035*q,0,.018*q,11);set(rig.head,-.02*q,0,0,10);
          set(rig.la,0,0,-.55*q);set(rig.ra,0,0,-.55*o);set(rig.lfa,-.16+.08*q);set(rig.rfa,-.16+.08*o);
          set(rig.lt,.72*o);set(rig.rt,.72*q);set(rig.ls,.9*Math.max(0,q));set(rig.rs,.9*Math.max(0,o));set(rig.lf,-.38*Math.max(0,q));set(rig.rf,-.38*Math.max(0,o));
          root.position.y=-.05+s.y+Math.abs(Math.sin(t*11.5))*.045;
        };

        const loader=new GLTFLoader(); let realRun=false, current=null;
        const play=name=>{if(!mixer||!actions[name])return;const a=actions[name];if(current===a)return;a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.16).play();if(current)current.fadeOut(.16);current=a;};
        loader.load(MODEL_URL,gltf=>{
          if(cancelled)return; model=gltf.scene; model.traverse(n=>{if(n.isMesh){n.frustumCulled=true;n.castShadow=false;n.receiveShadow=false;}});
          const box=new THREE.Box3().setFromObject(model), size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3()); baseScale=2.55/(size.y||1);model.scale.setScalar(baseScale);model.position.set(-center.x*baseScale,-center.y*baseScale-.04,-center.z*baseScale);model.rotation.y=Math.PI;root.add(model);
          rig=makeRig(); mixer=new THREE.AnimationMixer(model); gltf.animations.forEach(c=>{actions[c.name]=mixer.clipAction(c);});
          const run=gltf.animations.find(c=>/(^|\b)(run|running|jog|jogging|sprint|sprinting)(\b|$)/i.test(c.name)); if(run){realRun=true;play(run.name);} console.info('[3D runner] clips',gltf.animations.map(c=>c.name));
          setLoaded(true);setRunning(true);runnerRef.current=true;
        },undefined,e=>{console.error('GLB avatar failed to load:',e);setFailed(true);});

        const recycle=(entry,list,spacing)=>{const far=Math.min(...list.map(x=>x.object.position.z));entry.object.position.z=far-spacing*(.8+Math.random()*1.25);entry.object.position.x=LANES[randLane()];if('collected'in entry)entry.collected=false;entry.object.visible=true;};
        const jump=()=>{if(s.y<=.01&&s.alive){s.vy=6.2;s.slide=false;}};
        const slide=()=>{if(s.y<.08&&s.alive)s.slide=true;setTimeout(()=>{s.slide=false;},520);};
        const keydown=e=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown','a','d','w','s',' '].includes(k))e.preventDefault();if(!runnerRef.current)return;if(!s.alive&&(k==='r'||k==='enter')){window.dispatchEvent(new CustomEvent('runner-restart'));return;}if(['arrowleft','a','arrowright','d'].includes(k))keys.add(k);if(['arrowup','w',' '].includes(k))jump();if(['arrowdown','s'].includes(k))slide();};
        const keyup=e=>keys.delete(e.key.toLowerCase());
        const restart=()=>{Object.assign(s,{lane:1,y:0,vy:0,slide:false,speed:8.2,distance:0,score:0,coins:0,alive:true,time:0,shake:0});obstacles.forEach((e,i)=>{e.object.position.z=-18-i*15-Math.random()*8;e.object.position.x=LANES[randLane()];});coinObjects.forEach((e,i)=>{e.object.position.z=-10-i*8-Math.random()*5;e.object.position.x=LANES[randLane()];e.collected=false;e.object.visible=true;});setScore(0);setCoins(0);setGameOver(false);setRunning(true);runnerRef.current=true;};
        window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('runner-restart',restart);

        const resize=()=>{const w=Math.max(mount.clientWidth,1),h=Math.max(mount.clientHeight,1);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};observer=new ResizeObserver(resize);observer.observe(mount);resize();
        const clock=new THREE.Clock();let lastScore=-1,lastCoins=-1;
        const animate=()=>{
          if(cancelled)return;raf=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.033),active=runnerRef.current&&s.alive;
          if(keys.has('arrowleft')||keys.has('a')){s.lane=clamp(s.lane-1,0,2);keys.delete('arrowleft');keys.delete('a');}if(keys.has('arrowright')||keys.has('d')){s.lane=clamp(s.lane+1,0,2);keys.delete('arrowright');keys.delete('d');}
          root.position.x=THREE.MathUtils.damp(root.position.x,LANES[s.lane],14,dt);
          if(active){s.speed=Math.min(15.5,s.speed+dt*.12);s.distance+=s.speed*dt;s.score+=s.speed*dt*2.2;s.time+=dt;s.vy-=17*dt;s.y=Math.max(0,s.y+s.vy*dt);if(s.y===0)s.vy=0;const adv=s.speed*dt;
            tracks.forEach(g=>{g.position.z+=adv;if(g.position.z>18)g.position.z-=180;});scenery.forEach(g=>{g.position.z+=adv*.92;if(g.position.z>7)g.position.z-=180;});
            obstacles.forEach(e=>{e.object.position.z+=adv;if(e.object.position.z>6)recycle(e,obstacles,15);const dz=Math.abs(e.object.position.z-.55),dx=Math.abs(e.object.position.x-root.position.x);if(dz<.62&&dx<.4&&s.y<.68&&!s.slide){s.alive=false;s.shake=.24;setGameOver(true);setRunning(false);runnerRef.current=false;}});
            coinObjects.forEach(e=>{e.object.position.z+=adv;e.object.rotation.y+=dt*6;if(e.object.position.z>6)recycle(e,coinObjects,8);const dz=Math.abs(e.object.position.z-.55),dx=Math.abs(e.object.position.x-root.position.x);if(!e.collected&&dz<.62&&dx<.4&&Math.abs(s.y-.18)<.85){e.collected=true;e.object.visible=false;s.coins++;}});
          }
          if(model){const target=baseScale*(s.slide?.74:1);model.scale.y=THREE.MathUtils.damp(model.scale.y,target,10,dt);model.position.y=THREE.MathUtils.damp(model.position.y,-.04+(s.slide?-.28:0),10,dt);}
          if(realRun&&mixer)mixer.update(dt);else if(active)procedural(s.time,dt);else if(rig)procedural(s.time*.2,dt);
          shadow.scale.x=THREE.MathUtils.damp(shadow.scale.x,1.35+s.y*.18,8,dt);shadow.position.x=root.position.x;shadow.material.opacity=.24-Math.min(s.y*.07,.14);
          s.shake=Math.max(0,s.shake-dt);camera.position.x=THREE.MathUtils.damp(camera.position.x,root.position.x*.18+(s.shake?(Math.random()-.5)*s.shake:0),5.5,dt);camera.position.y=THREE.MathUtils.damp(camera.position.y,1.22+s.y*.12,5.5,dt);camera.lookAt(root.position.x*.08,-.48+s.y*.04,-4.1);renderer.render(scene,camera);
          const ds=Math.floor(s.score);if(ds!==lastScore||s.coins!==lastCoins){lastScore=ds;lastCoins=s.coins;setScore(ds);setCoins(s.coins);}
        };animate();
        const cleanupNow=()=>{window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('runner-restart',restart);observer?.disconnect();cancelAnimationFrame(raf);mixer?.stopAllAction();renderer?.dispose();if(renderer?.domElement&&mount.contains(renderer.domElement))mount.removeChild(renderer.domElement);};
        return cleanupNow;
      }catch(e){console.error('3D runner initialization failed:',e);if(!cancelled)setFailed(true);return undefined;}
    };
    let cleanupPromise;
    if('requestIdleCallback'in window)idle=window.requestIdleCallback(async()=>{cleanupPromise=await start();},{timeout:1200});else idle=window.setTimeout(async()=>{cleanupPromise=await start();},500);
    return()=>{cancelled=true;if('cancelIdleCallback'in window)window.cancelIdleCallback(idle);else window.clearTimeout(idle);Promise.resolve(cleanupPromise).then(fn=>fn?.());};
  }, []);

  const mobileAction=action=>{const key=action==='left'?'a':action==='right'?'d':action==='jump'?' ':'s';window.dispatchEvent(new KeyboardEvent('keydown',{key}));if(action==='left'||action==='right')setTimeout(()=>window.dispatchEvent(new KeyboardEvent('keyup',{key})),80);};
  return <div className={`scene-shell runner-shell ${loaded?'is-loaded':''} ${failed?'is-failed':''}`} aria-label="Infinite 3D developer runner">
    <div ref={mountRef} className="three-canvas" />
    <div className="workspace-fallback" aria-hidden={loaded}><div className="fallback-window"><i/><i/><i/></div><div className="fallback-shelf"><span/><span/><span/></div><div className="fallback-desk"><div className="fallback-monitor"><b/></div><span/></div><div className="fallback-person"/><div className="fallback-glow"/></div>
    {!loaded&&!failed&&<div className="scene-loading"><span>Loading Nithish Run</span></div>}
    {loaded&&!gameOver&&<div className="runner-hud"><div><span>NITHISH RUN</span><strong>BUILD · SHIP · REPEAT</strong></div><div className="runner-stats"><b>{score.toLocaleString()}</b><small>SCORE</small><b>{coins}</b><small>COINS</small></div><p>← → change lane · SPACE / ↑ jump · ↓ slide</p></div>}
    {loaded&&gameOver&&<div className="runner-gameover"><span>RUN INTERRUPTED</span><strong>{score.toLocaleString()}</strong><small>SCORE · {coins} COINS</small><button onClick={()=>window.dispatchEvent(new CustomEvent('runner-restart'))}>RUN AGAIN ↗</button></div>}
    {loaded&&<div className="runner-mobile-controls"><button onClick={()=>mobileAction('left')}>←</button><button onClick={()=>mobileAction('jump')}>↑</button><button onClick={()=>mobileAction('slide')}>↓</button><button onClick={()=>mobileAction('right')}>→</button></div>}
  </div>;
}
