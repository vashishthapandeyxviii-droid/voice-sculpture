import { useEffect, useRef} from "react";
import * as THREE from "three";
import { createSculpture, updateSculpture} from "../three/createSculpture.js";

function SculptureCanvas(){
    const mountRef=useRef(null);
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
        camera.position.z = 5;

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

        const violetLight = new THREE.PointLight(0x8b5cf6, 60, 20);
        violetLight.position.set(-4, 3, 4);
        scene.add(violetLight);

        const blueLight = new THREE.PointLight(0x3b82f6, 60, 20);
        blueLight.position.set(4, -2, 4);
        scene.add(blueLight);

        const cyanLight = new THREE.PointLight(0x22d3ee, 40, 20);
        cyanLight.position.set(0, 4, -4);
        scene.add(cyanLight);

        //4. Animation loop 
        const timer = new THREE.Timer(); //timer is newest replacement of CLock. 
        let frameId; 
        function animate() {
            frameId= requestAnimationFrame(animate);
            timer.update();
            updateSculpture(sculpture, timer.getElapsed());
            sculpture.rotation.y += 0.005; 
            renderer.render(scene, camera);
        }
        animate(); 

        // responsive design
        function handleResize() {
            camera.aspect= mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        }
        window.addEventListener("resize", handleResize);

        //cleanup, it will run when the component is removed
        return() => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", handleResize);
            mount.removeChild(renderer.domElement);
            sculpture.geometry.dispose();
            sculpture.material.dispose();
            renderer.dispose();
        };
    }, []);
        //full screen layer behind the interface
        return(
            <div ref={mountRef} style={{position:"fixed", inset:0, zIndex:0}}
            />
        );
}

export default SculptureCanvas;
 