import { useEffect, useRef} from "react";
import * as THREE from "three";

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

        //Temporary test object
        const geometry= new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshNormalMaterial();
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        //4. Animation loop 
        let frameId;
        function animate() {
            frameId= requestAnimationFrame(animate);
            cube.rotation.x +=0.01;
            cube.rotation.y +=0.01;
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
            geometry.dispose();
            material.dispose();
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
 