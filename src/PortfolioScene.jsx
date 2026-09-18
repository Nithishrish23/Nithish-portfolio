import { useEffect, useRef, useState } from 'react';
import './command-center.css';
import './command-360.css';

const MODEL_URL = '/nithish-model.glb';

export default function PortfolioScene(){
  const mountRef=useRef(null), rotationRef=useRef({current:0,target:0}), dragRef=useRef({active:false,x:0});
  const [loaded,setLoaded]=useState(false),[failed,setFailed]=useState(false);
  useEffect(()=>{
    const mount=mountRef.current;if(!mount)return undefined;let cancelled=false,frame=0,renderer,observer,mixer,avatarRoot;
    const down=e=>{dragRef.current={active:true,x:e.clientX};mount.setPointerCapture?.(e.pointerId);mount.classList.add('is-dragging')};
    const move=e=>{if(!dragRef.current.active)return;const dx=e.clientX-dragRef.current.x;dragRef.current.x=e.clientX;rotationRef.current.target+=dx*.012};
    const up=e=>{dragRef.current.active=false;mount.releasePointerCapture?.(e.pointerId);mount.classList.remove('is-dragging')};
    mount.addEventListener('pointerdown',down);mount.addEventListener('pointermove',move);mount.addEventListener('pointerup',up);mount.addEventListener('pointercancel',up);
    const start=async()=>{try{
      const THREE=await import('three');const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');if(cancelled)return;
      const scene=new THREE.Scene();scene.background=new THREE.Color(0x020913);scene.fog=new THREE.Fog(0x020913,8,18);
      const camera=new THREE.PerspectiveCamera(30,1,.1,60);camera.position.set(0,.05,7.8);camera.lookAt(0,-.5,-.55);
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.setClearColor(0x020913,1);mount.appendChild(renderer.domElement);
      scene.add(new THREE.HemisphereLight(0x9fd9ff,0x06111e,2.1));
      const key=new THREE.DirectionalLight(0xffffff,3.5);key.position.set(-4,6,4);scene.add(key);
      const rim=new THREE.DirectionalLight(0x198cff,5);rim.position.set(4,3,-3);scene.add(rim);
      const cyan=new THREE.PointLight(0x20dfff,20,9,2);cyan.position.set(2,1.3,1);scene.add(cyan);
      const blue=new THREE.PointLight(0x0b73ff,22,11,2);blue.position.set(-2,-.2,1.5);scene.add(blue);
      const world=new THREE.Group();scene.add(world);
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(13,13),new THREE.MeshStandardMaterial({color:0x06121e,roughness:.82,metalness:.25}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.92;world.add(floor);
      const grid=new THREE.GridHelper(12,36,0x168cff,0x12324a);grid.position.y=-1.9;grid.material.transparent=true;grid.material.opacity=.28;world.add(grid);
      const back=new THREE.Mesh(new THREE.PlaneGeometry(14,9),new THREE.MeshBasicMaterial({color:0x041321}));back.position.set(0,1.15,-4.4);world.add(back);
      const halo=new THREE.Mesh(new THREE.CircleGeometry(3.3,64),new THREE.MeshBasicMaterial({color:0x087cff,transparent:true,opacity:.12,depthWrite:false}));halo.scale.set(1.35,.82,1);halo.position.set(0,.45,-4.25);world.add(halo);
      for(let i=0;i<8;i++){const x=-5.6+i*1.6;const beam=new THREE.Mesh(new THREE.PlaneGeometry(.035,7),new THREE.MeshBasicMaterial({color:i%2?0x1acbff:0x167bff,transparent:true,opacity:.13,depthWrite:false}));beam.position.set(x,.9,-4.1);world.add(beam)}
      const platform=new THREE.Mesh(new THREE.CylinderGeometry(2.05,.2,.22,96),new THREE.MeshStandardMaterial({color:0x081b2d,roughness:.3,metalness:.7}));platform.position.set(0,-1.76,-.4);world.add(platform);
      [2.15,1.72,1.18].forEach((r,i)=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.018+(i===0?.018:0),8,128),new THREE.MeshBasicMaterial({color:i===1?0x26e1ff:0x168cff,transparent:true,opacity:i===1?.85:.58,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.position.set(0,-1.61,-.4);ring.userData.speed=i%2?.32:-.22;world.add(ring)});
      const particles=new THREE.Group();world.add(particles);for(let i=0;i<75;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.009+(i%4)*.004,6,5),new THREE.MeshBasicMaterial({color:i%3?0x238fff:0x35e7ff,transparent:true,opacity:.22+(i%4)*.06}));const a=i*2.399,r=1.7+(i%9)*.34;p.position.set(Math.cos(a)*r,-1.35+(i%13)*.25,-.6+Math.sin(a)*1.2);particles.add(p)}
      const desk=new THREE.Mesh(new THREE.BoxGeometry(4.5,.08,.55),new THREE.MeshStandardMaterial({color:0x0c2236,roughness:.5,metalness:.35}));desk.position.set(0,.05,-2.75);world.add(desk);
      const monitor=new THREE.Mesh(new THREE.BoxGeometry(2.15,1.28,.08),new THREE.MeshStandardMaterial({color:0x02070d,roughness:.3,metalness:.65}));monitor.position.set(0,.72,-2.72);world.add(monitor);
      const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.85,.98),new THREE.MeshBasicMaterial({color:0x06365b}));screen.position.set(0,.72,-2.66);world.add(screen);
      avatarRoot=new THREE.Group();avatarRoot.position.set(0,-.47,.05);world.add(avatarRoot);
      new GLTFLoader().load(MODEL_URL,gltf=>{if(cancelled)return;const model=gltf.scene;model.visible=true;model.traverse(n=>{if(!n.isMesh)return;n.visible=true;n.frustumCulled=false;if(n.material){const ms=Array.isArray(n.material)?n.material:[n.material];ms.forEach(m=>{m.needsUpdate=true;if('roughness' in m)m.roughness=Math.min(m.roughness,.72)})}});const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),scale=2.86/Math.max(size.y,.001);model.scale.setScalar(scale);model.position.set(-center.x*scale,-center.y*scale,-center.z*scale);avatarRoot.add(model);mixer=new THREE.AnimationMixer(model);const clip=gltf.animations.find(c=>/idle|stand|breath|casual|relax/i.test(c.name))||gltf.animations[0];if(clip)mixer.clipAction(clip).setLoop(THREE.LoopRepeat,Infinity).play();setLoaded(true)},undefined,err=>{console.error(err);setFailed(true)});
      const resize=()=>{const w=Math.max(mount.clientWidth,1),h=Math.max(mount.clientHeight,1);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};observer=new ResizeObserver(resize);observer.observe(mount);resize();
      const clock=new THREE.Clock();const animate=()=>{if(cancelled)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.033),t=clock.elapsedTime;if(mixer)mixer.update(dt);if(!dragRef.current.active)rotationRef.current.target+=dt*.1;rotationRef.current.current+=(rotationRef.current.target-rotationRef.current.current)*Math.min(dt*7,1);if(avatarRoot)avatarRoot.rotation.y=rotationRef.current.current;particles.rotation.y=t*.025;world.children.forEach(o=>{if(o.userData.speed)o.rotation.z+=o.userData.speed*dt});halo.material.opacity=.08+Math.sin(t*1.2)*.025;renderer.render(scene,camera)};animate();
    }catch(err){console.error(err);setFailed(true)}};start();return()=>{cancelled=true;cancelAnimationFrame(frame);observer?.disconnect();renderer?.dispose();if(renderer?.domElement?.parentNode===mount)mount.removeChild(renderer.domElement);mount.removeEventListener('pointerdown',down);mount.removeEventListener('pointermove',move);mount.removeEventListener('pointerup',up);mount.removeEventListener('pointercancel',up)};
  },[]);
  return <div className="command-shell cinematic-avatar"><div ref={mountRef} className="three-canvas avatar-360-canvas" aria-label="Interactive 360 degree 3D avatar. Drag left or right to rotate."/><div className="avatar-status"><span className={loaded?'ready':''}/>{loaded?'LIVE 3D · NATIVE ANIMATION':failed?'3D FALLBACK':'LOADING AVATAR'}</div><div className="avatar-360-controls"><button type="button" onClick={()=>rotationRef.current.target=0} aria-label="Reset avatar rotation">↺</button><span><strong>360°</strong><small>DRAG TO ROTATE</small></span><span className="rotation-dot"/></div></div>;
}
