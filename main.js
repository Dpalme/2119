import * as three from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from './controller.js';
import { EffectComposer } from './shaders/EffectComposer.js';
import { RenderPass } from './shaders/RenderPass.js';
import { UnrealBloomPass } from '././shaders/ulBloom.js';

let camera = null,
    scene = null,
    renderer = null,
    frustumSize = null,
    aspect, Terrain, start = Date.now(),
    controls, finalComposer;

async function init() {
    scene = new three.Scene();
    scene.background = new three.Color(0xD7BA94);

    frustumSize = 30;
    aspect = window.innerWidth / window.innerHeight;
    camera = new three.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.0001, 1000);
    // camera = new three.PerspectiveCamera(50, aspect, 1, 1000);
    camera.zoom = 1.5;
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);
    scene.add(camera);
    camera.updateProjectionMatrix();

    var geometry = new three.PlaneGeometry(
        100, 100,
        400, 400);
    const material = new three.ShaderMaterial({
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
        side: three.DoubleSide,
        transparent: true
    });

    Terrain = new three.Mesh(geometry, material)
    Terrain.rotateX(- Math.PI / 2);
    Terrain.position.y -= 5;

    scene.add(Terrain)

    renderer = new three.WebGLRenderer(
        {
            antialias: true
        }
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    const renderScene = new RenderPass(scene, camera);

    // UnrealBloomPass(resolution, intensity, radius, threshold)
    const bloomPass = new UnrealBloomPass(
        new three.Vector2(window.innerWidth, window.innerHeight),
        3, 1);


    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(bloomPass);

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
    Terrain.material.uniforms['time'].value = .005 * (Date.now() - start);
    Terrain.material.uniforms['player'].value = {x: controls.target.x * 2, y: controls.target.y * 2};
    renderer.render(scene, camera);
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

