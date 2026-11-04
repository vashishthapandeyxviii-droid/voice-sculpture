import { useEffect, useRef} from "react";
import * as THREE from "three";
import { createSculpture, updateSculpture} from "../three/createSculpture.js";
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass} from "three/examples/jsm/postprocessing/OutputPass.js" 

function SculptureCanvas({ getAudioData}) {
    const mountRef=useRef(null);
    //holds the latest getAudioData, so the animation loop can always access it 
    const audioRef = useRef(getAudioData);
    useEffect(() => {
        audioRef.current = getAudioData;
    }, [getAudioData]); 
    useEffect(() => {
        const mount = mountRef.current;

        //1. scene
        const scene = new THREE.Scene();
        scene.background= new THREE.Color(0x05030f);

        //2. Camera
        const camera= new THREE.PerspectiveCamera(
            60,
            mount.clientWidth / mount.clientHeight,
            0.1,
            100
        );
        camera.position.z = 5.5;

        //3. RENDERER, it draws the scene on canvas
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        //The Sculpture
        const sculpture = createSculpture();
        scene.add(sculpture);
        //LIGHTING
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));

        const violetLight = new THREE.PointLight(0x8b5cf6, 30, 20);
        violetLight.position.set(-4, 3, 4);
        scene.add(violetLight);

        const blueLight = new THREE.PointLight(0x3b82f6, 30, 20);
        blueLight.position.set(4, -2, 4);
        scene.add(blueLight);

        const cyanLight = new THREE.PointLight(0x22d3ee, 20, 20);
        cyanLight.position.set(0, 4, -4);
        scene.add(cyanLight);

        //4. Animation loop 
        //mouse control 
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;

        //Glow
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloom = new UnrealBloomPass(
            new THREE.Vector2(mount.clientWidth, mount.clientHeight),
            0.35, //strength
            0.5, //radius 
            0.85 //threshold
        );
        composer.addPass(bloom);
        composer.addPass(new OutputPass());

        const timer = new THREE.Timer(); //timer is newest replacement of CLock. 
        let frameId; 
        function animate() {
            frameId= requestAnimationFrame(animate);
            timer.update();
            const audio = audioRef.current();
            updateSculpture(sculpture, timer.getElapsed(), audio); 
            controls.update();
            bloom.strength = 0.35 + sculpture.userData.smooth.volume * 0.6;
            composer.render();
        }
        animate(); 

        // responsive design
        function handleResize() {
            camera.aspect= mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
            composer.setSize(mount.clientWidth, mount.clientHeight); 
        }
        window.addEventListener("resize", handleResize);

        //cleanup, it will run when the component is removed
        return() => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", handleResize);
            mount.removeChild(renderer.domElement);
            sculpture.geometry.dispose();
            sculpture.material.dispose();
            controls.dispose();
            composer.dispose(); 
            renderer.dispose();
        };
    }, []);
        //full screen layer behind the interface
        return(
            <div ref={mountRef} style={{position:"fixed", inset:0, zIndex:0, pointerEvents:"auto", cursor:"grab"}}
            />
        );
}

export default SculptureCanvas;
 