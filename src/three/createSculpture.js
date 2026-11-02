import * as THREE from "three";

export function createSculpture() {
    //geometry, shape, radius 1.5, detail 20 = lots of tiny triangles
    const geometry = new THREE.IcosahedronGeometry(1.5, 20);

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

    return mesh;
}
