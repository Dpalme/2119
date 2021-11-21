import * as THREE from 'https://threejs.org/build/three.module.js';
import { EffectComposer } from "https://threejs.org/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://threejs.org/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://visualizer.dpalmer.in/src/shaders/ulBloom.js";
import { OrbitControls } from './controller.js';

let camera = null,
    scene = null,
    renderer = null,
    frustumSize = null,
    aspect, Terrain, start = Date.now(),
    controls, finalComposer;

async function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);

    frustumSize = 30;
    aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.0001, 1000);
    // camera = new THREE.PerspectiveCamera(50, aspect, 1, 1000);
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    var clipping = new THREE.CylinderGeometry( 50, 50, 20, 32 );

    var geometry = new THREE.PlaneGeometry(
        100, 100,
        300, 300);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: {
                type: "f",
                value: 0.0
            },
            seed: {
                type: "f",
                value: (Date.now() >> 10) * Math.random()
            },
            player: {
                type: "vec2",
                value: { x: 0.0, y: 0.0 }
            }
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        side: THREE.DoubleSide,
        clippingPlanes: [ clipping ],
        transparent: true
    });

    Terrain = new THREE.Mesh(geometry, material)
    Terrain.rotateX(- Math.PI / 2);
    Terrain.position.y -= 5;

    scene.add(Terrain)

    renderer = new THREE.WebGLRenderer(
        {
            antialias: true
        }
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    const renderScene = new RenderPass(scene, camera);

    const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        .2,
        .6,
        .0,
        1.
      );

    finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(bloom);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableRotate = true
    controls.listenToKeyEvents( window ); // optional
    document.body.appendChild(
        object('div', {
            class: 'overflow-h center-a',
            child: renderer.domElement
        })
    )
    draw();
}

function draw() {
    requestAnimationFrame(() => { draw() });
    Terrain.material.uniforms['time'].value = .0005 * (Date.now() - start);
    Terrain.material.uniforms['player'].value = {x: controls.target.x * 2, y: controls.target.y * 2};
    finalComposer.render(scene, camera);
}

init()

window.addEventListener('resize', async () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.left = camera.bottom = frustumSize * camera.aspect / - 2,
        camera.right = camera.top = frustumSize * camera.aspect / 2;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
},
    false);

