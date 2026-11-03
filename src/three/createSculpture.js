import * as THREE from "three";
import { mergeVertices} from "three/examples/jsm/utils/BufferGeometryUtils.js";


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

    return mesh;
}
// called every frame: bends the surface based on the current time

export function updateSculpture(mesh, time) {
    const positions = mesh.geometry.attributes.position;
    const original = mesh.userData.originalPositions;

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

        //Push the point outward or inward by a small amount 
        const scale = 1+ wave *0.12;
        positions.setXYZ(i, x*scale, y*scale, z*scale);
    }
    positions.needsUpdate = true; //tell THREE the points moved 
    mesh.geometry.computeVertexNormals(); //fix the lighting for new shape 
}