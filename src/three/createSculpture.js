import * as THREE from "three";
import { mergeVertices} from "three/examples/jsm/utils/BufferGeometryUtils.js";

const BLUE = new THREE.Color(0x1d4ed8);
const CYAN = new THREE.Color(0x22d3ee);


export function createSculpture() {
    //detailed sphere 
    let geometry = new THREE.IcosahedronGeometry(1.5, 20);

    //weld duplicate points together so the surface stays smooth when it bends
    geometry.deleteAttribute("normal");
    geometry.deleteAttribute("uv");
    geometry = mergeVertices(geometry);
    geometry.computeVertexNormals();

    //material: the surface look
    const material = new THREE.MeshStandardMaterial({
        color: 0x6d28d9, //deep violet base
        emissive: 0x1d3ed8, //electric blue glow from eithin
        emissiveIntensity: 0.35, 
        metalness: 0.6, //shiny metal surface
        roughness: 0.25, //low= smooth and gassy
    });

//mesh: geometry+material, the final 3D object
    const mesh = new THREE.Mesh(geometry, material);

//remember the original shape so we can always bend from it 
    mesh.userData.originalPositions = geometry.attributes.position.array.slice();

    //smoothed sound levels, so movement stays fluid
    mesh.userData.smooth = {volume:0, bass:0, treble:0};
    return mesh;
}
// called every frame: bends the surface based on the current time

export function updateSculpture(mesh, time, audio) {
    const positions = mesh.geometry.attributes.position;
    const original = mesh.userData.originalPositions;
    const smooth = mesh.userData.smooth; 

    //move each smoothed value 15% of the way toward the new taget
    //the multipliers boost quiet numbers, math.min caps them at 1
    smooth.volume += (Math.min(audio.volume * 4,1)- smooth.volume) * 0.15;
    smooth.bass += (Math.min(audio.bass * 1.2, 1)- smooth.bass) * 0.15;
    smooth.treble += (Math.min(audio.treble * 5, 1)- smooth.treble) * 0.15;

    //louder voice to have bigger waves
    const amplitude = 0.06 + smooth.volume*0.3

    for (let i=0; i<positions.count; i++) {
        //original x, y, z of this point
        const x = original[i*3];
        const y = original[i*3 +1];
        const z = original[i*3 +2];

        //all three waves at different sizes and speeds, added together 
        const wave = 
            Math.sin(x*2 + time)*0.5 +
            Math.sin(y*3 + time*1.3)*0.3 +
            Math.sin(z*2.5 + time*0.8)*0.2;
        
        //small, fast ripples that only show up on high sounds
        const ripple = Math.sin(x*8 + y*8 + time*4)*smooth.treble * 0.04;

        //bass swells the whole body; waves and ripples bend the surface
        const scale = 1+ smooth.bass*0.12 + wave*amplitude + ripple;
        positions.setXYZ(i, x*scale, y*scale, z*scale);
    }
    positions.needsUpdate = true; //tell THREE the points moved 
    mesh.geometry.computeVertexNormals(); //fix the lighting for new shape 

    // the glow gets brighter with volume and shifts to cyan with treble
    mesh.material.emissiveIntensity = 0.35 + smooth.volume*1.2;
    mesh.material.emissive.copy(BLUE).lerp(CYAN, smooth.treble); 
}